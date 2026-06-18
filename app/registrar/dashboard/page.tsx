'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, CheckCircle, CheckCircle2, Clock, AlertTriangle, RefreshCw, Eye, LogOut, X, Filter, FolderOpen, ArrowLeft, GraduationCap } from 'lucide-react';
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
    studentProfile?: { isFinanciallyCleared: boolean };
  };
  attachments?: Array<{ id: string; fileName: string; fileUrl: string }>;
}

type StatusFilter = 'ALL' | 'PENDING' | 'ACTION' | 'CLOSED';

export default function RegistrarDashboard() {
  const router = useRouter();
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [staffInfo, setStaffInfo] = useState<{ name: string; dept: string } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inspectingTicket, setInspectingTicket] = useState<Ticket | null>(null);
  const [activeModal, setActiveModal] = useState<'NONE' | 'APPROVE' | 'REJECT' | 'ACTION_REQUIRED' | 'EXAM_RESOLVE' | 'TRANSCRIPT_RESOLVE'>('NONE');

  const fetchDepartmentQueue = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const data = await api.tickets.getDepartmentQueue();
      setQueue(data);
      
      if (inspectingTicket) {
        const freshTicket = data.find((t: Ticket) => t.id === inspectingTicket.id);
        if (freshTicket) setInspectingTicket(freshTicket);
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to populate registrar stream tables.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      const role = localStorage.getItem('user_role');
      const name = localStorage.getItem('user_fullName');
      const dept = localStorage.getItem('user_department');

      if (!token || dept !== 'REGISTRAR') {
        router.push('/');
        return;
      }
      setStaffInfo({ name: name || 'Officer', dept: dept });
    }
    fetchDepartmentQueue();
  }, [router]);

  useEffect(() => {
    setSelectedCategory(null);
    setInspectingTicket(null);
  }, [searchQuery, statusFilter]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  const handleCardApproval = async () => {
    if (!inspectingTicket) return;
    if (window.confirm("Approve this replacement? An automated SMS will be sent instructing the student to come pick up the card.")) {
      try {
        await api.tickets.resolveCardReplacement(inspectingTicket.id);
        setInspectingTicket(null);
        fetchDepartmentQueue();
      } catch (error) {
        alert("Failed to process card approval.");
      }
    }
  };

  const totalOpen = queue.filter(t => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length;
  const totalAction = queue.filter(t => t.status === 'ACTION_REQUIRED').length;
  const totalCleared = queue.filter(t => t.status === 'APPROVED' || t.status === 'RESOLVED' || t.status === 'REJECTED').length;

  const statusFilteredQueue = queue.filter(t => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW';
    if (statusFilter === 'ACTION') return t.status === 'ACTION_REQUIRED';
    if (statusFilter === 'CLOSED') return t.status === 'APPROVED' || t.status === 'RESOLVED' || t.status === 'REJECTED';
    return true;
  });

  const fullyFilteredQueue = statusFilteredQueue.filter(item => 
    item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedQueue = fullyFilteredQueue.reduce((acc, ticket) => {
    const categoryName = ticket.serviceName.replace(/_/g, ' ');
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  const toggleStatusFilter = (target: StatusFilter) => {
    setStatusFilter(prev => prev === target ? 'ALL' : target);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* SECURE HEADER BAR */}
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-md font-black tracking-widest text-[#2B35AF] flex items-center gap-2">
            <GraduationCap size={18} /> REGISTRAR DESK
          </div>
          {staffInfo && (
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded uppercase">
              {staffInfo.dept.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400">Logged in: <b className="text-white">{staffInfo?.name}</b></span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 bg-transparent hover:bg-[#FF0000]/90 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition cursor-pointer"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT GATEWAY CONTAINER */}
      <main className="grow max-w-6xl w-full mx-auto px-6 py-10 space-y-6">
        
        {/* Interactive Real-time Counter Grid Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => toggleStatusFilter('PENDING')}
            className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'PENDING' ? 'border-[#2B35AF] ring-1 ring-[#2B35AF]/20' : 'border-slate-200 hover:border-[#2B35AF]/50'}`}
          >
            <div className={`p-3 rounded transition-colors ${statusFilter === 'PENDING' ? 'bg-[#2B35AF] text-white' : 'bg-blue-50 text-[#2B35AF]'}`}><Clock size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalOpen}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Pending Review</div>
            </div>
          </div>
          
          <div 
            onClick={() => toggleStatusFilter('ACTION')}
            className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'ACTION' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-slate-200 hover:border-amber-500/50'}`}
          >
            <div className={`p-3 rounded transition-colors ${statusFilter === 'ACTION' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}><AlertTriangle size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalAction}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Action Required</div>
            </div>
          </div>
          
          <div 
            onClick={() => toggleStatusFilter('CLOSED')}
            className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'CLOSED' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-500/50'}`}
          >
            <div className={`p-3 rounded transition-colors ${statusFilter === 'CLOSED' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}><CheckCircle size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalCleared}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Closed Case Files</div>
            </div>
          </div>
        </div>

        {/* Global Registry Search Controls */}
        <div className="flex justify-between items-center gap-4 bg-white border border-slate-200 p-4 rounded shadow-sm">
          <div className="relative w-full max-w-md flex items-center gap-3">
            <div className="relative w-full">
              <Search size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
              <input
                type="text"
                placeholder="Search registry requests by code or name..."
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
            onClick={fetchDepartmentQueue}
            className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2 px-4 rounded font-bold cursor-pointer transition"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Sync Queue
          </button>
        </div>

        {/* SPLIT GRID: CATEGORY BOXES / TABLE + INSPECTION PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className={`${inspectingTicket ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
            {!selectedCategory ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-slate-200">
                  <FolderOpen size={16} />
                  <h2 className="text-sm font-bold uppercase tracking-wider">Service Categories</h2>
                </div>

                {Object.keys(groupedQueue).length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-400 text-xs italic shadow-sm">
                    {isLoading ? 'Syncing registry requests...' : 'No registry service requests found.'}
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
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Click to review queue →</p>
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
                      <ArrowLeft size={12} /> Back to Categories
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
                          <th className="px-4 py-3.5">Tracking Code</th>
                          <th className="px-4 py-3.5">Submitting Student</th>
                          <th className="px-4 py-3.5">State</th>
                          <th className="px-4 py-3.5 text-right">Inspection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {groupedQueue[selectedCategory]?.map((ticket) => (
                          <tr key={ticket.id} className={`hover:bg-slate-50/40 transition cursor-pointer ${inspectingTicket?.id === ticket.id ? 'bg-blue-50/50 hover:bg-blue-50/60' : ''}`} onClick={() => setInspectingTicket(ticket)}>
                            <td className="px-4 py-4 font-mono font-bold text-[#2B35AF]">{ticket.trackingCode}</td>
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
                                <Eye size={11} /> View Card
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

              <div>
                <span className="text-[9px] font-mono font-bold bg-[#2B35AF] text-white px-2 py-0.5 rounded tracking-widest uppercase">
                  {inspectingTicket.trackingCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2 uppercase tracking-wide">
                  {inspectingTicket.serviceName.replace(/_/g, ' ')}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                  From: <b>{inspectingTicket.student.fullName}</b> ({inspectingTicket.student.email})
                </p>

                {/* FINANCIAL CLEARANCE BADGE (CRITICAL FOR REGISTRAR) */}
                <div className="mt-3">
                  {inspectingTicket.student.studentProfile?.isFinanciallyCleared ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded text-[9px] uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Financially Cleared
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 font-bold px-2.5 py-1 rounded text-[9px] uppercase tracking-wider">
                      <AlertTriangle size={12} /> Outstanding Balance / Unregistered
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Form Submission Payload</span>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[11px] text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {inspectingTicket.description}
                </div>
              </div>

              {inspectingTicket.attachments && inspectingTicket.attachments.length > 0 && (
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Attached Audit Evidence</span>
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

              {inspectingTicket.status !== 'RESOLVED' && inspectingTicket.status !== 'REJECTED' ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Execute Registry Decision Workflow</span>
                  <div className="grid grid-cols-1 gap-2">
                    
                    {inspectingTicket.serviceName.toLowerCase().includes('transcript') ? (
                      <button 
                        onClick={() => setActiveModal('TRANSCRIPT_RESOLVE')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ✔ Review & Approve Transcript Release
                      </button>
                    ) : inspectingTicket.serviceName.toLowerCase().includes('card') ? (
                      // SPECIFIC ACTION FOR CARD REPLACEMENT
                      <button 
                        onClick={handleCardApproval}
                        className="w-full bg-[#2B35AF] hover:bg-blue-800 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ✔ Approve & Notify Pickup via SMS
                      </button>
                    ) : (
                      <button 
                        onClick={() => setActiveModal('APPROVE')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ✔ Standard Approval
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setActiveModal('ACTION_REQUIRED')}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ⚠ Require Action
                      </button>
                      <button 
                        onClick={() => setActiveModal('REJECT')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ✖ Refuse Request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium flex items-center gap-1.5">
                  ✔ This registry request has been processed and finalized.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL MOUNT ROUTER */}
      {activeModal === 'APPROVE' && inspectingTicket && (
        <ResolveAssessmentModal 
          ticketId={inspectingTicket.id}
          studentName={inspectingTicket.student.fullName}
          moduleCode={inspectingTicket.trackingCode}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); fetchDepartmentQueue(); }}
        />
      )}

      {activeModal === 'EXAM_RESOLVE' && inspectingTicket && (
        <ResolveExamClaimModal 
          ticketId={inspectingTicket.id}
          studentName={inspectingTicket.student.fullName}
          trackingCode={inspectingTicket.trackingCode}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); fetchDepartmentQueue(); }}
        />
      )}

      {activeModal === 'TRANSCRIPT_RESOLVE' && inspectingTicket && (
        <ResolveTranscriptModal 
          ticketId={inspectingTicket.id}
          studentName={inspectingTicket.student.fullName}
          trackingCode={inspectingTicket.trackingCode}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); fetchDepartmentQueue(); }}
        />
      )}

      {(activeModal === 'REJECT' || activeModal === 'ACTION_REQUIRED') && inspectingTicket && (
        <LecturerFeedbackModal 
          ticketId={inspectingTicket.id}
          studentName={inspectingTicket.student.fullName}
          mode={activeModal === 'REJECT' ? 'REJECTED' : 'ACTION_REQUIRED'}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); fetchDepartmentQueue(); }}
        />
      )}

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-[10px] font-mono py-4 text-center shrink-0">
        SECURE REGISTRY TERMINAL | VER. 2026.06
      </footer>

    </div>
  );
}