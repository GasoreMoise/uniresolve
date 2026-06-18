'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, CheckCircle, CheckCircle2, Clock, AlertTriangle, RefreshCw, Eye, LogOut, X, Filter, FolderOpen, ArrowLeft, Landmark } from 'lucide-react';
import { api } from '../../../config/api';
import LecturerFeedbackModal from '@/components/admin/LecturerFeedbackModal';

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
    studentProfile?: { id: string; isFinanciallyCleared: boolean };
  };
  attachments?: Array<{ id: string; fileName: string; fileUrl: string }>;
}

type StatusFilter = 'ALL' | 'PENDING' | 'ACTION' | 'CLOSED';
type ViewMode = 'QUEUE' | 'LEDGER';

export default function FinanceDashboard() {
  const router = useRouter();
  
  const [staffInfo, setStaffInfo] = useState<{ name: string; dept: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardMode, setDashboardMode] = useState<ViewMode>('QUEUE');
  
  // Queue States
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inspectingTicket, setInspectingTicket] = useState<Ticket | null>(null);
  const [activeModal, setActiveModal] = useState<'NONE' | 'ACTION_REQUIRED' | 'REJECT'>('NONE');

  // Ledger State
  const [financeLedger, setFinanceLedger] = useState<any[]>([]);
  const [ledgerSearch, setLedgerSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [queueData, ledgerResponse] = await Promise.all([
        api.tickets.getDepartmentQueue(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/finance/ledger`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('uniresolve_token')}` }
        })
      ]);
      
      setQueue(queueData);
      
      if (ledgerResponse.ok) {
        setFinanceLedger(await ledgerResponse.json());
      }
      
      if (inspectingTicket) {
        const freshTicket = queueData.find((t: Ticket) => t.id === inspectingTicket.id);
        if (freshTicket) setInspectingTicket(freshTicket);
      }
    } catch (err: any) {
      console.error('Failed to sync finance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      const dept = localStorage.getItem('user_department');
      const name = localStorage.getItem('user_fullName');

      if (!token || dept !== 'FINANCE') {
        router.push('/');
        return;
      }
      setStaffInfo({ name: name || 'Officer', dept: dept });
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    setSelectedCategory(null);
    setInspectingTicket(null);
  }, [searchQuery, statusFilter]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  const handleManualClearanceToggle = async (profileId: string, currentState: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/finance/clearance/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('uniresolve_token')}`
        },
        body: JSON.stringify({ isCleared: !currentState })
      });

      if (response.ok) {
        fetchData(); // Refresh ledger
      }
    } catch (error) {
      console.error("Failed to toggle status");
    }
  };

  const handleApprovePayment = async () => {
    if (!inspectingTicket) return;
    try {
      await api.tickets.updateStatus(inspectingTicket.id, { status: 'RESOLVED', comment: 'Payment verified and cleared by Finance.' });
      setInspectingTicket(null);
      fetchData();
    } catch (error) {
      alert("Failed to resolve ticket.");
    }
  };

  // Metric Computations
  const totalOpen = queue.filter(t => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length;
  const totalAction = queue.filter(t => t.status === 'ACTION_REQUIRED').length;

  const fullyFilteredQueue = queue.filter(item => {
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'PENDING' && (item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW')) ||
      (statusFilter === 'ACTION' && item.status === 'ACTION_REQUIRED') ||
      (statusFilter === 'CLOSED' && (item.status === 'APPROVED' || item.status === 'RESOLVED' || item.status === 'REJECTED'));
      
    const matchesSearch = item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const groupedQueue = fullyFilteredQueue.reduce((acc, ticket) => {
    const categoryName = ticket.serviceName.replace(/_/g, ' ');
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  const filteredLedger = financeLedger.filter(student => 
    student.registrationNumber.includes(ledgerSearch) || 
    student.user.fullName.toLowerCase().includes(ledgerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-md font-black tracking-widest text-emerald-500 flex items-center gap-2">
            <Landmark size={18} /> FINANCE DESK
          </div>
          {staffInfo && (
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded uppercase">
              {staffInfo.dept.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400">Logged in: <b className="text-white">{staffInfo?.name}</b></span>
          <button onClick={handleLogout} className="flex items-center gap-1 bg-transparent hover:bg-[#FF0000]/90 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition cursor-pointer">
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      <main className="grow max-w-6xl w-full mx-auto px-6 py-10 space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 bg-white p-2 rounded border border-slate-200 shadow-sm w-max">
            <button 
              onClick={() => setDashboardMode('QUEUE')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer ${dashboardMode === 'QUEUE' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50 border-none bg-transparent'}`}
            >
              Payment Claims Queue
            </button>
            <button 
              onClick={() => setDashboardMode('LEDGER')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer ${dashboardMode === 'LEDGER' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50 border-none bg-transparent'}`}
            >
              Master Clearance Ledger
            </button>
          </div>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2 px-4 rounded font-bold cursor-pointer transition">
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Sync Systems
          </button>
        </div>

        {dashboardMode === 'LEDGER' ? (
          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm animate-in fade-in duration-300">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                Institutional Registration & Finance Roster
              </span>
              <div className="relative w-64">
                <Search size={12} className="absolute inset-y-0 left-2.5 my-auto text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Reg No or Name..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded text-xs bg-white border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Registration No.</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Program</th>
                    <th className="px-6 py-3 text-center">Clearance Status</th>
                    <th className="px-6 py-3 text-right">Manual Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLedger.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-600">{student.registrationNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{student.user.fullName}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[200px]">{student.program}</td>
                      <td className="px-6 py-4 text-center">
                        {student.isFinanciallyCleared ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 w-max mx-auto">
                            <CheckCircle2 size={10} /> Cleared
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 w-max mx-auto">
                            <AlertTriangle size={10} /> Outstanding
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleManualClearanceToggle(student.id, student.isFinanciallyCleared)}
                          className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded cursor-pointer border transition-colors ${
                            student.isFinanciallyCleared 
                              ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-red-600 hover:border-red-300' 
                              : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {student.isFinanciallyCleared ? 'Revoke' : 'Clear Now'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No ledger records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* QUEUE VIEW (Simplified for Finance) */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div 
                onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
                className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'PENDING' ? 'border-slate-900 ring-1 ring-slate-900/20' : 'border-slate-200 hover:border-slate-400'}`}
              >
                <div className={`p-3 rounded transition-colors ${statusFilter === 'PENDING' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}><Clock size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{totalOpen}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Slips Pending Review</div>
                </div>
              </div>
              <div 
                onClick={() => setStatusFilter(statusFilter === 'ACTION' ? 'ALL' : 'ACTION')}
                className={`bg-white border p-4 rounded flex items-center gap-4 shadow-sm cursor-pointer transition-all ${statusFilter === 'ACTION' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-slate-200 hover:border-amber-400'}`}
              >
                <div className={`p-3 rounded transition-colors ${statusFilter === 'ACTION' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}><AlertTriangle size={20} /></div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{totalAction}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Requires Student Action</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className={`${inspectingTicket ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
                {!selectedCategory ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(groupedQueue).length === 0 ? (
                      <div className="col-span-full bg-white border border-slate-200 rounded p-12 text-center text-slate-400 text-xs italic shadow-sm">No payment slips currently pending review.</div>
                    ) : (
                      Object.entries(groupedQueue).map(([category, tickets]) => (
                        <div key={category} onClick={() => setSelectedCategory(category)} className="bg-white border border-slate-200 p-5 rounded shadow-sm hover:shadow hover:border-slate-400 cursor-pointer group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded"><Landmark size={18} /></div>
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded font-bold tracking-wider">{tickets.length} TICKETS</span>
                          </div>
                          <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs">{category}</h3>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
                      <button onClick={() => { setSelectedCategory(null); setInspectingTicket(null); }} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer bg-transparent border-none"><ArrowLeft size={14} /></button>
                      <span className="font-bold text-slate-700 text-xs uppercase">{selectedCategory}</span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {groupedQueue[selectedCategory]?.map((ticket) => (
                          <tr key={ticket.id} className={`hover:bg-slate-50 cursor-pointer ${inspectingTicket?.id === ticket.id ? 'bg-slate-50' : ''}`} onClick={() => setInspectingTicket(ticket)}>
                            <td className="px-4 py-3 font-mono font-bold text-slate-600">{ticket.trackingCode}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{ticket.student.fullName}</td>
                            <td className="px-4 py-3"><span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-100 text-slate-600">{ticket.status}</span></td>
                            <td className="px-4 py-3 text-right"><Eye size={14} className="text-slate-400 inline-block" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {inspectingTicket && (
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-5 space-y-4 shadow-sm relative text-xs sticky top-6">
                  <button onClick={() => setInspectingTicket(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"><X size={16} /></button>
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded uppercase">{inspectingTicket.trackingCode}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2 uppercase">{inspectingTicket.serviceName.replace(/_/g, ' ')}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">From: <b>{inspectingTicket.student.fullName}</b></p>
                  </div>
                  <hr className="border-slate-100" />
                  
                  {inspectingTicket.attachments && inspectingTicket.attachments.length > 0 ? (
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Attached Bank Slip</span>
                      <a href={`http://localhost:4000${inspectingTicket.attachments[0].fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 hover:bg-blue-100 transition font-medium decoration-none">
                        <FileText size={14} /> <span>View PDF / Image Slip</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px]">No payment proof attached.</div>
                  )}

                  {inspectingTicket.status !== 'RESOLVED' && inspectingTicket.status !== 'REJECTED' && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Finance Actions</span>
                      <button onClick={handleApprovePayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]">
                        ✔ Payment Verified (Clear Student)
                      </button>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button onClick={() => setActiveModal('ACTION_REQUIRED')} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]">⚠ Invalid Slip</button>
                        <button onClick={() => setActiveModal('REJECT')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]">✖ Reject</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {(activeModal === 'REJECT' || activeModal === 'ACTION_REQUIRED') && inspectingTicket && (
        <LecturerFeedbackModal 
          ticketId={inspectingTicket.id}
          studentName={inspectingTicket.student.fullName}
          mode={activeModal === 'REJECT' ? 'REJECTED' : 'ACTION_REQUIRED'}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); fetchData(); }}
        />
      )}
    </div>
  );
}