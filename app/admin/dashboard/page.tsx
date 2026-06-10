'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, CheckCircle, Clock, AlertTriangle, RefreshCw, Eye, Loader2, LogOut, X } from 'lucide-react';
import { api } from '../../../config/api';

// ◄ SECURED CLEAN DEFAULT IMPORT PATHS FOR PRODUCTION ROBUSTNESS
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

export default function DepartmentalDashboardLedger() {
  const router = useRouter();
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [staffInfo, setStaffInfo] = useState<{ name: string; dept: string } | null>(null);

  // ◄ MODAL & INSPECTION STATE TRACKERS EXPLICITLY EXTENDED FOR EXAM RESOLVE & TRANSCRIPT TIERS
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
      setErrorNotice(err.message || 'Failed to populate departmental stream tables.');
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

      if (!token || role === 'STUDENT') {
        router.push('/');
        return;
      }
      setStaffInfo({ name: name || 'Officer', dept: dept || 'GENERAL' });
    }
    fetchDepartmentQueue();
  }, [router]);

  const filteredQueue = queue.filter(item => 
    item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  const totalOpen = queue.filter(t => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length;
  const totalAction = queue.filter(t => t.status === 'ACTION_REQUIRED').length;
  const totalCleared = queue.filter(t => t.status === 'APPROVED' || t.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* SECURE HEADER BAR */}
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-md font-black tracking-widest text-blue-500">UNIRESOLVE | STAFF</div>
          {staffInfo && (
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded uppercase">
              DESK: {staffInfo.dept.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400">Logged in: <b className="text-white">{staffInfo?.name}</b></span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 bg-transparent hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition cursor-pointer"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT GATEWAY CONTAINER */}
      <main className="grow max-w-6xl w-full mx-auto px-6 py-10 space-y-6">
        
        {/* Real-time Counter Grid Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-[#2B35AF] rounded"><Clock size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalOpen}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Pending Review</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded"><AlertTriangle size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalAction}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Action Required</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded"><CheckCircle size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalCleared}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Closed Case Files</div>
            </div>
          </div>
        </div>

        {/* Global Registry Search Controls */}
        <div className="flex justify-between items-center gap-4 bg-white border border-slate-200 p-4 rounded shadow-sm">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
            <input
              type="text"
              placeholder="Search incoming queue by code, name, or service key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded text-xs bg-slate-50 text-slate-800 border border-slate-300 focus:outline-none focus:border-[#2B35AF] focus:bg-white transition"
            />
          </div>
          <button 
            onClick={fetchDepartmentQueue}
            className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2 px-4 rounded font-bold cursor-pointer transition"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Sync Queue
          </button>
        </div>

        {/* Split Grid: Main Queue Table + Realtime Inspection Context Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PORT: QUEUE GRID TABLE TREE */}
          <div className={`${inspectingTicket ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200 rounded overflow-hidden shadow-sm transition-all duration-300`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3.5">Tracking Code</th>
                    <th className="px-4 py-3.5">Submitting Student</th>
                    <th className="px-4 py-3.5">Requested Action</th>
                    <th className="px-4 py-3.5">State</th>
                    <th className="px-4 py-3.5 text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredQueue.map((ticket) => (
                    <tr key={ticket.id} className={`hover:bg-slate-50/40 transition ${inspectingTicket?.id === ticket.id ? 'bg-blue-50/50 hover:bg-blue-50/60' : ''}`}>
                      <td className="px-4 py-4 font-mono font-bold text-[#2B35AF]">{ticket.trackingCode}</td>
                      <td className="px-4 py-4">
                        <div className="text-slate-900 font-semibold">{ticket.student.fullName}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-semibold truncate max-w-[120px]">
                        {ticket.serviceName.replace(/_/g, ' ')}
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
                          onClick={() => setInspectingTicket(ticket)} 
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

          {/* RIGHT PORT: INTERACTIVE SUB-WORKFLOW AUDIT CARD */}
          {inspectingTicket && (
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-5 space-y-4 shadow-sm animate-in slide-in-from-right-4 duration-200 relative text-xs">
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
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Form Submission Payload</span>
                <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[11px] text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {inspectingTicket.description}
                </div>
              </div>

              {/* ATTACHMENT MANAGER GRID LINKS */}
              {inspectingTicket.attachments && inspectingTicket.attachments.length > 0 && (
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Attached Audit Evidence</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {inspectingTicket.attachments.map((file) => (
                      <a 
                        key={file.id} 
                        // ◄ FIXED: COMPENSATE FOR API ROUTING BY CALLING BASE EXPRESS STORAGE ASSETS STREAM DIRECTLY
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

              {/* 3-WAY STRATEGIC DECISION RESOLUTION PORTAL PANEL */}
              {inspectingTicket.status !== 'RESOLVED' && inspectingTicket.status !== 'REJECTED' ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Execute Registry Decision Workflow</span>
                  <div className="grid grid-cols-1 gap-2">
                    
                    {inspectingTicket.serviceName.toLowerCase().includes('claim') ? (
                      <button 
                        onClick={() => setActiveModal('EXAM_RESOLVE')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ✔ Audit & Resolve Marks Claim
                      </button>
                    ) : inspectingTicket.serviceName.toLowerCase().includes('transcript') ? (
                      <button 
                        onClick={() => setActiveModal('TRANSCRIPT_RESOLVE')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ✔ Review & Approve Transcript Release
                      </button>
                    ) : (
                      <button 
                        onClick={() => setActiveModal('APPROVE')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-center transition cursor-pointer border-none uppercase tracking-wide text-[10px]"
                      >
                        ✔ Approve & Schedule Assessment
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
                        ✖ Refuse Claim
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium flex items-center gap-1.5">
                  ✔ This case record has been committed and finalized as a closed ledger block.
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
        SECURE BACK-OFFICE TERMINAL | VER. 2026.06
      </footer>

    </div>
  );
}