'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, FileText, CheckCircle, Clock, AlertTriangle, RefreshCw, Eye, LogOut, X, 
  Filter, FolderOpen, ArrowLeft, Shield, Users, BarChart3, Settings, ShieldAlert, Activity, LayoutDashboard
} from 'lucide-react';
import { api } from '../../../config/api';

import ResolveAssessmentModal from '@/components/admin/ResolveAssessmentModal';
import LecturerFeedbackModal from '@/components/admin/LecturerFeedbackModal';
import ResolveExamClaimModal from '@/components/admin/ResolveExamClaimModal';
import ResolveTranscriptModal from '@/components/admin/ResolveTranscriptModal';

interface Ticket {
  id: string;
  trackingCode: string;
  serviceName: string;
  category: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  student: {
    fullName: string;
    email: string;
  };
  attachments?: Array<{ id: string; fileName: string; fileUrl: string }>;
}

type StatusFilter = 'ALL' | 'PENDING' | 'ACTION' | 'CLOSED';
type AdminTab = 'QUEUE' | 'ANALYTICS' | 'USERS' | 'AUDIT' | 'CONFIG';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('QUEUE');
  
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [staffInfo, setStaffInfo] = useState<{ name: string; dept: string } | null>(null);

  // ◄ NEW: States for IAM and Audit Ledger
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inspectingTicket, setInspectingTicket] = useState<Ticket | null>(null);
  const [activeModal, setActiveModal] = useState<'NONE' | 'APPROVE' | 'REJECT' | 'ACTION_REQUIRED' | 'EXAM_RESOLVE' | 'TRANSCRIPT_RESOLVE'>('NONE');

  const fetchGlobalQueue = async () => {
    setIsLoading(true);
    try {
      const data = await api.tickets.getDepartmentQueue();
      setQueue(data);
      
      if (inspectingTicket) {
        const freshTicket = data.find((t: Ticket) => t.id === inspectingTicket.id);
        if (freshTicket) setInspectingTicket(freshTicket);
      }
    } catch (err: any) {
      console.error('Failed to populate global stream tables.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      const role = localStorage.getItem('user_role');
      const name = localStorage.getItem('user_fullName');

      if (!token || role !== 'ADMIN') {
        router.push('/');
        return;
      }
      setStaffInfo({ name: name || 'System Admin', dept: 'GLOBAL_OVERSEER' });
    }
    fetchGlobalQueue();
  }, [router]);

  // ◄ NEW: Fetch User & Audit Data when Tabs change
  useEffect(() => {
    if (activeTab === 'USERS' && usersList.length === 0) {
      setIsDataLoading(true);
      api.profile.getAllUsers().then(setUsersList).catch(console.error).finally(() => setIsDataLoading(false));
    } else if (activeTab === 'AUDIT' && auditLogs.length === 0) {
      setIsDataLoading(true);
      api.audit.getLogs().then(setAuditLogs).catch(console.error).finally(() => setIsDataLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    setSelectedCategory(null);
    setInspectingTicket(null);
  }, [searchQuery, statusFilter, activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  // --- ANALYTICS COMPUTATIONS ---
  const totalOpen = queue.filter(t => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length;
  const totalAction = queue.filter(t => t.status === 'ACTION_REQUIRED').length;
  const totalCleared = queue.filter(t => t.status === 'APPROVED' || t.status === 'RESOLVED' || t.status === 'REJECTED').length;
  const resolutionRate = queue.length > 0 ? Math.round((totalCleared / queue.length) * 100) : 0;

  // --- QUEUE FILTERING ---
  const fullyFilteredQueue = queue.filter(item => {
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'PENDING' && (item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW')) ||
      (statusFilter === 'ACTION' && item.status === 'ACTION_REQUIRED') ||
      (statusFilter === 'CLOSED' && (item.status === 'APPROVED' || item.status === 'RESOLVED' || item.status === 'REJECTED'));
      
    const matchesSearch = item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const groupedQueue = fullyFilteredQueue.reduce((acc, ticket) => {
    const categoryName = ticket.category.replace(/_/g, ' ');
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* SECURE HEADER BAR */}
      <header className="bg-slate-900 text-white px-8 py-4 flex flex-col sm:flex-row justify-between items-center shrink-0 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="text-md font-black tracking-widest text-[#2B35AF] flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-500" /> SYSTEM OVERSEER
          </div>
          <span className="text-[10px] bg-red-900/50 border border-red-800 text-red-200 font-mono px-2 py-0.5 rounded uppercase tracking-widest">
            GLOBAL ACCESS
          </span>
        </div>
        
        {/* TOP NAVIGATION TABS */}
        <div className="flex bg-slate-800 p-1 rounded border border-slate-700">
          <button onClick={() => setActiveTab('QUEUE')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'QUEUE' ? 'bg-[#2B35AF] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            <LayoutDashboard size={12} /> Global Queue
          </button>
          <button onClick={() => setActiveTab('ANALYTICS')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'ANALYTICS' ? 'bg-[#2B35AF] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            <BarChart3 size={12} /> Analytics
          </button>
          <button onClick={() => setActiveTab('USERS')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'USERS' ? 'bg-[#2B35AF] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            <Users size={12} /> IAM Provisioning
          </button>
          <button onClick={() => setActiveTab('AUDIT')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'AUDIT' ? 'bg-[#2B35AF] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
            <Activity size={12} /> Audit Trail
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 bg-transparent hover:bg-[#FF0000]/90 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition cursor-pointer"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="grow max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        
        {/* =========================================
            TAB 1: GLOBAL TICKET QUEUE
            ========================================= */}
        {activeTab === 'QUEUE' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Real-time Counter Grid Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'PENDING' ? 'border-[#2B35AF] ring-1 ring-[#2B35AF]/20' : 'border-slate-200 hover:border-[#2B35AF]/50'}`}
              >
                <div className={`p-3 rounded transition-colors ${statusFilter === 'PENDING' ? 'bg-[#2B35AF] text-white' : 'bg-blue-50 text-[#2B35AF]'}`}><Clock size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{totalOpen}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">University Pending Action</div>
                </div>
              </div>
              
              <div 
                onClick={() => setStatusFilter(statusFilter === 'ACTION' ? 'ALL' : 'ACTION')}
                className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'ACTION' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-slate-200 hover:border-amber-500/50'}`}
              >
                <div className={`p-3 rounded transition-colors ${statusFilter === 'ACTION' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}><AlertTriangle size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{totalAction}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Student Blocked</div>
                </div>
              </div>
              
              <div 
                onClick={() => setStatusFilter(statusFilter === 'CLOSED' ? 'ALL' : 'CLOSED')}
                className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'CLOSED' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-500/50'}`}
              >
                <div className={`p-3 rounded transition-colors ${statusFilter === 'CLOSED' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}><CheckCircle size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{totalCleared}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Global Resolved Metrics</div>
                </div>
              </div>
            </div>

            {/* Global Search Controls */}
            <div className="flex justify-between items-center gap-4 bg-white border border-slate-200 p-4 rounded shadow-sm">
              <div className="relative w-full max-w-md flex items-center gap-3">
                <div className="relative w-full">
                  <Search size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                  <input
                    type="text"
                    placeholder="Global search by reference code, student, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded text-xs bg-slate-50 text-slate-800 border border-slate-300 focus:outline-none focus:border-[#2B35AF] focus:bg-white transition"
                  />
                </div>
                {statusFilter !== 'ALL' && (
                  <button 
                    onClick={() => setStatusFilter('ALL')}
                    className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded transition cursor-pointer border-none"
                  >
                    <Filter size={12} /> Clear Filter
                  </button>
                )}
              </div>
              <button 
                onClick={fetchGlobalQueue}
                className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2 px-4 rounded font-bold cursor-pointer transition"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Sync System
              </button>
            </div>

            {/* SPLIT GRID: CATEGORIES / INSPECTION PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className={`${inspectingTicket ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
                {!selectedCategory ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-slate-200">
                      <FolderOpen size={16} />
                      <h2 className="text-sm font-bold uppercase tracking-wider">Top-Level Institutional Departments</h2>
                    </div>

                    {Object.keys(groupedQueue).length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-400 text-xs italic shadow-sm">
                        {isLoading ? 'Syncing global stream tables...' : 'System queue is fully cleared.'}
                      </div>
                    ) : (
                      <div className={`grid grid-cols-1 sm:grid-cols-2 ${inspectingTicket ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} gap-4`}>
                        {Object.entries(groupedQueue).map(([category, tickets]) => (
                          <div 
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className="bg-white border border-slate-200 p-5 rounded shadow-sm hover:shadow hover:border-[#2B35AF] hover:-translate-y-0.5 transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#2B35AF] rounded transition-colors">
                                <FileText size={18} />
                              </div>
                              <span className="bg-slate-100 text-slate-500 group-hover:bg-[#2B35AF] group-hover:text-white transition-colors text-[10px] px-2.5 py-1 rounded font-bold tracking-wider">
                                {tickets.length} RECORD{tickets.length !== 1 && 'S'}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs leading-snug group-hover:text-[#2B35AF] transition-colors">{category}</h3>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Drill down →</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-end pb-2 border-b border-slate-200">
                      <div className="space-y-1">
                        <button 
                          onClick={() => { setSelectedCategory(null); setInspectingTicket(null); }}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#2B35AF] uppercase tracking-wider border-none bg-transparent cursor-pointer transition-colors p-0"
                        >
                          <ArrowLeft size={12} /> View All Departments
                        </button>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <FolderOpen size={14} className="text-[#2B35AF]" /> {selectedCategory}
                        </h2>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <th className="px-4 py-3.5">Ref ID</th>
                              <th className="px-4 py-3.5">Specific Service</th>
                              <th className="px-4 py-3.5">Student</th>
                              <th className="px-4 py-3.5">State</th>
                              <th className="px-4 py-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {groupedQueue[selectedCategory]?.map((ticket) => (
                              <tr key={ticket.id} className={`hover:bg-slate-50/40 transition cursor-pointer ${inspectingTicket?.id === ticket.id ? 'bg-blue-50/50 hover:bg-blue-50/60' : ''}`} onClick={() => setInspectingTicket(ticket)}>
                                <td className="px-4 py-4 font-mono font-bold text-[#2B35AF]">{ticket.trackingCode}</td>
                                <td className="px-4 py-4 uppercase text-[10px] font-bold tracking-wide">{ticket.serviceName.replace(/_/g, ' ')}</td>
                                <td className="px-4 py-4">
                                  <div className="text-slate-900 font-semibold">{ticket.student.fullName}</div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`inline-block px-2 py-0.5 text-[8px] font-black rounded border tracking-wider ${
                                    ticket.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    ticket.status === 'UNDER_REVIEW' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    ticket.status === 'ACTION_REQUIRED' ? 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' :
                                    ticket.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {ticket.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setInspectingTicket(ticket); }} 
                                    className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase tracking-wide transition cursor-pointer border-none shadow-none"
                                  >
                                    <Eye size={11} /> Inspect
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {inspectingTicket && (
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-5 space-y-4 shadow-sm animate-in slide-in-from-right-4 duration-200 relative text-xs sticky top-6">
                  <button 
                    onClick={() => setInspectingTicket(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="mb-2">
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded tracking-widest uppercase">
                      {inspectingTicket.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono font-bold bg-[#2B35AF] text-white px-2 py-0.5 rounded tracking-widest uppercase">
                      {inspectingTicket.trackingCode}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2 uppercase tracking-wide">
                      {inspectingTicket.serviceName.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                      From: <b>{inspectingTicket.student.fullName}</b>
                    </p>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">System Payload</span>
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[11px] text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {inspectingTicket.description}
                    </div>
                  </div>

                  {inspectingTicket.attachments && inspectingTicket.attachments.length > 0 && (
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Attached Evidence</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {inspectingTicket.attachments.map((file) => (
                          <a 
                            key={file.id} 
                            href={`http://localhost:4000${file.fileUrl}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-slate-600 hover:text-[#2B35AF] hover:border-[#2B35AF] transition decoration-none font-medium"
                          >
                            <FileText size={12} className="shrink-0" />
                            <span className="truncate">{file.fileName}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OVERSEER MANUAL OVERRIDE ACTIONS */}
                  {inspectingTicket.status !== 'RESOLVED' && inspectingTicket.status !== 'REJECTED' ? (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-red-600">OVERSEER OVERRIDE ACTIONS</span>
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={async () => {
                            if (window.confirm("WARNING: Proceeding as System Admin. Auto-Resolve this ticket?")) {
                              await api.tickets.updateStatus(inspectingTicket.id, { status: 'RESOLVED', comment: 'Ticket forcibly resolved by System Administrator Override.' });
                              setInspectingTicket(null);
                              fetchGlobalQueue();
                            }
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                        >
                          ✔ FORCE RESOLVE
                        </button>
                        <button 
                          onClick={() => setActiveModal('ACTION_REQUIRED')}
                          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                        >
                          FORCE ACTION REQUIRED
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 text-slate-500 rounded font-medium text-[10px] uppercase tracking-wide text-center">
                      This case is permanently closed in the global ledger.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: SYSTEM ANALYTICS (Overview Dashboard)
            ========================================= */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
              <BarChart3 className="text-[#2B35AF]" size={20} />
              <h2 className="text-lg font-bold text-slate-800 tracking-wide">University Operational Metrics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Processed Tickets</p>
                <p className="text-3xl font-black text-slate-800 mt-2">{queue.length}</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">↑ +14% vs last month</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Global Resolution Rate</p>
                <p className="text-3xl font-black text-[#2B35AF] mt-2">{resolutionRate}%</p>
                <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div className="bg-[#2B35AF] h-full rounded-full" style={{ width: `${resolutionRate}%` }}></div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Avg. Resolution Time</p>
                <p className="text-3xl font-black text-slate-800 mt-2">2.4 Days</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">Within 3-day SLA target</p>
              </div>
              <div className="bg-white border border-red-200 bg-red-50/30 p-5 rounded shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Bottleneck Warnings</p>
                <p className="text-3xl font-black text-red-700 mt-2">1</p>
                <p className="text-xs text-red-600 font-medium mt-2">Registrar Queue {'>'} 48hrs</p>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Load Balancing by Category</h3>
              <div className="space-y-4">
                {Object.entries(groupedQueue).map(([category, items]) => (
                  <div key={category}>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-600 uppercase tracking-wide">{category}</span>
                      <span className="text-slate-900 font-bold">{items.length} Tickets</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#2B35AF] h-full rounded-full" style={{ width: `${(items.length / queue.length) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 3: USER PROVISIONING (IAM Shell)
            ========================================= */}
        {activeTab === 'USERS' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="text-[#2B35AF]" size={20} />
                <h2 className="text-lg font-bold text-slate-800 tracking-wide">Identity & Access Management</h2>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3.5">User Details</th>
                      <th className="px-4 py-3.5">System Role</th>
                      <th className="px-4 py-3.5">Assigned Department</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {isDataLoading ? (
                      <tr><td colSpan={4} className="text-center py-8 text-slate-400">Loading user registry...</td></tr>
                    ) : usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-4 py-3">
                          <div className="text-slate-900 font-bold">{user.fullName}</div>
                          <div className="text-[10px] text-slate-500">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={user.role}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              await api.profile.updateRole(user.id, { role: newRole, department: user.department });
                              api.profile.getAllUsers().then(setUsersList);
                            }}
                            className="bg-slate-50 border border-slate-200 p-1.5 rounded text-[10px] font-bold uppercase cursor-pointer focus:outline-[#2B35AF]"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="LECTURER">Lecturer</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {user.role === 'STAFF' ? (
                            <select 
                              value={user.department || ''}
                              onChange={async (e) => {
                                const newDept = e.target.value;
                                await api.profile.updateRole(user.id, { role: user.role, department: newDept });
                                api.profile.getAllUsers().then(setUsersList);
                              }}
                              className="bg-slate-50 border border-slate-200 p-1.5 rounded text-[10px] font-bold uppercase cursor-pointer focus:outline-[#2B35AF]"
                            >
                              <option value="FINANCE">Finance</option>
                              <option value="REGISTRAR">Registrar</option>
                              <option value="FACULTY_HOD">HOD</option>
                              <option value="CAMPUS_OPERATIONS">Operations</option>
                            </select>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded text-[10px] font-bold border border-red-200 transition cursor-pointer">
                            Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: AUDIT TRAIL (Security Logs)
            ========================================= */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Activity className="text-[#2B35AF]" size={20} />
              <h2 className="text-lg font-bold text-slate-800 tracking-wide">Immutable Audit Ledger</h2>
            </div>
            
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3.5 w-32">Timestamp</th>
                      <th className="px-4 py-3.5">Action Executed</th>
                      <th className="px-4 py-3.5">Actor (Triggered By)</th>
                      <th className="px-4 py-3.5">Metadata / Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {isDataLoading ? (
                      <tr><td colSpan={4} className="text-center py-8 text-slate-400">Loading audit ledger...</td></tr>
                    ) : auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-4 py-3 font-mono text-[9px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-900 font-bold">{log.actor?.fullName || 'System Account'}</div>
                          <div className="text-[9px] text-slate-400 uppercase">{log.actor?.role || 'SYSTEM'}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[9px] text-slate-500 whitespace-pre-wrap max-w-xs break-all">
                          {log.metadata || 'No additional metadata'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      {(activeModal === 'REJECT' || activeModal === 'ACTION_REQUIRED') && inspectingTicket && (
        <LecturerFeedbackModal 
          ticketId={inspectingTicket.id}
          studentName={inspectingTicket.student.fullName}
          mode={activeModal === 'REJECT' ? 'REJECTED' : 'ACTION_REQUIRED'}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); fetchGlobalQueue(); }}
        />
      )}

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-[10px] font-mono py-4 text-center shrink-0 mt-auto">
        SUPER ADMIN GLOBAL TERMINAL | SYSTEM VER. 2026.06
      </footer>

    </div>
  );
}