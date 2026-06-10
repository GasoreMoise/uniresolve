// Inside your /components/admin/DepartmentQueueRow.tsx component:
'use client';

import React, { useState } from 'react';
import ResolveAssessmentModal from './ResolveAssessmentModal';
import LecturerFeedbackModal from './LecturerFeedbackModal';

export default function DepartmentQueueRow({ ticket, refreshQueue }: { ticket: any, refreshQueue: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<'NONE' | 'APPROVE' | 'REJECT' | 'ACTION_REQUIRED'>('NONE');

  return (
    <div className="border border-slate-200 rounded p-4 bg-white space-y-3">
      {/* Row Summary Data Info Banner Header */}
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <span className="font-mono font-bold text-xs text-slate-500">{ticket.trackingCode}</span>
          <h4 className="font-bold text-slate-800 text-xs uppercase">{ticket.serviceName.replace(/_/g, ' ')}</h4>
        </div>
        <span className="text-[10px] bg-blue-50 text-[#2B35AF] px-2 py-0.5 rounded font-bold font-mono">
          {ticket.status}
        </span>
      </div>

      {/* Expanded Action Menu Options Tray */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 space-y-3 text-xs animate-in fade-in duration-150">
          <p className="text-slate-600 bg-slate-50 p-3 rounded italic">"{ticket.description}"</p>
          
          {/* 3-WAY DECISION INTERACTION TRIGGERS */}
          {ticket.status !== 'RESOLVED' && ticket.status !== 'REJECTED' && (
            <div className="flex flex-wrap gap-2 pt-1">
              <button 
                onClick={() => setActiveModal('APPROVE')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition cursor-pointer border-none uppercase text-[10px]"
              >
                Approve & Schedule
              </button>
              <button 
                onClick={() => setActiveModal('ACTION_REQUIRED')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded transition cursor-pointer border-none uppercase text-[10px]"
              >
                Require Additional Action
              </button>
              <button 
                onClick={() => setActiveModal('REJECT')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded transition cursor-pointer border-none uppercase text-[10px]"
              >
                Refuse Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      // ◄ DYNAMIC MODAL INJECTIONS DETACHED FROM GRID VIA RENDERING CONDITION PORTALS
      {/* ========================================== */}
      {activeModal === 'APPROVE' && (
        <ResolveAssessmentModal 
          ticketId={ticket.id}
          studentName={ticket.student.fullName}
          moduleCode={ticket.trackingCode}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); refreshQueue(); }}
        />
      )}

      {(activeModal === 'REJECT' || activeModal === 'ACTION_REQUIRED') && (
        <LecturerFeedbackModal 
          ticketId={ticket.id}
          studentName={ticket.student.fullName}
          mode={activeModal === 'REJECT' ? 'REJECTED' : 'ACTION_REQUIRED'}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { setActiveModal('NONE'); refreshQueue(); }}
        />
      )}
    </div>
  );
}