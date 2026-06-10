'use client';


import { Calendar, MapPin, ClipboardList, AlertCircle, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

interface HistoryLog {
  id: string;
  comment: string | null;
  newState: string;
  changedAt: string;
}

interface TicketProps {
  ticket: {
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED' | 'RESOLVED' | 'REJECTED';
    assessmentDate?: string | null;
    assessmentVenue?: string | null;
    lecturerNotes?: string | null;
    history?: HistoryLog[];
  };
}

export default function TicketFeedbackDisplay({ ticket }: TicketProps) {
  // Grab the absolute latest comment from the history ledger trace if it exists
  const latestHistoryWithComment = ticket.history?.find(h => h.comment && h.comment.trim() !== '');
  const structuralFeedback = latestHistoryWithComment?.comment || "No commentary attached by reviewer.";

  // 🟢 CASE 1: SPECIAL ASSESSMENT OFFICIALLY RESOLVED & SCHEDULED
  if (ticket.status === 'RESOLVED') {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded p-4 space-y-3.5 animate-in fade-in duration-200 text-xs text-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase tracking-wide border-b border-emerald-200/60 pb-1.5">
          <CheckCircle2 size={14} />
          <span>Official Assessment Schedule Confirmed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 bg-white p-2.5 rounded border border-emerald-100">
            <Calendar size={14} className="text-emerald-600 shrink-0" />
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date & Time Slot</span>
              <span className="font-mono font-bold text-slate-700">
                {ticket.assessmentDate 
                  ? new Date(ticket.assessmentDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Pending Registry Verification'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white p-2.5 rounded border border-emerald-100">
            <MapPin size={14} className="text-emerald-600 shrink-0" />
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Allocated Venue</span>
              <span className="font-bold text-slate-700">{ticket.assessmentVenue || 'TBD'}</span>
            </div>
          </div>
        </div>

        {ticket.lecturerNotes && (
          <div className="space-y-1 bg-white p-3 rounded border border-emerald-100">
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <ClipboardList size={11} /> Lecturer Instructions
            </span>
            <p className="font-medium text-slate-600 leading-normal whitespace-pre-wrap font-sans">
              {ticket.lecturerNotes}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 🟡 CASE 2: MORE ACTION REQUIRED FROM THE STUDENT
  if (ticket.status === 'ACTION_REQUIRED') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded p-4 space-y-2.5 animate-in fade-in duration-200 text-xs text-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-purple-800 uppercase tracking-wide border-b border-purple-200/60 pb-1.5">
          <AlertTriangle size={14} className="text-purple-600 animate-pulse" />
          <span>Further Student Action Mandatory</span>
        </div>
        <div className="space-y-1 bg-white p-3 rounded border border-purple-100">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reviewer Request Statement</span>
          <p className="font-semibold text-purple-900 leading-normal whitespace-pre-wrap">
            "{structuralFeedback}"
          </p>
        </div>
        <p className="text-[10px] text-slate-400 italic font-normal">
          * Please re-submit your supporting documents or check in with your department desk immediately.
        </p>
      </div>
    );
  }

  // 🔴 CASE 3: REQUEST HAS BEEN OFFICIALLY REFUSED
  if (ticket.status === 'REJECTED') {
    return (
      <div className="bg-red-50/70 border border-red-200 rounded p-4 space-y-2 animate-in fade-in duration-200 text-xs text-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-red-800 uppercase tracking-wide border-b border-red-200/50 pb-1.5">
          <AlertCircle size={14} />
          <span>Application Refused / Denied</span>
        </div>
        <div className="bg-white p-3 rounded border border-red-100">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reason for Decision</span>
          <p className="font-medium text-slate-600 leading-normal italic">
            "{structuralFeedback}"
          </p>
        </div>
      </div>
    );
  }

  // 🔵 CASE 4: DEFAULT STATUSES (SUBMITTED, UNDER_REVIEW)
  return (
    <div className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-500 font-normal italic flex items-center gap-2 text-[11px]">
      <FileText size={13} className="text-[#2B35AF]" />
      <span>Your request is successfully logged. Currently awaiting administrative evaluation by your instructor.</span>
    </div>
  );
}