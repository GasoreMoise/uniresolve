'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle, AlertTriangle, RefreshCw, Paperclip, ExternalLink } from 'lucide-react';
import { api } from '../config/api';

interface Ticket {
  id: string;
  trackingCode: string;
  serviceName: string;
  category: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED' | 'RESOLVED';
  createdAt: string;
  student: {
    fullName: string;
    email: string;
  };
  attachments?: Array<{ id: string; fileName: string; fileUrl: string }>;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onStatusUpdated: () => void;
}

export default function CaseAuditDrawer({ isOpen, onClose, ticket, onStatusUpdated }: DrawerProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleStatusTransition = async (targetStatus: Ticket['status']) => {
    if (targetStatus === 'ACTION_REQUIRED' && (!comment || comment.trim() === '')) {
      setErrorNotice('A detailed explanatory comment is mandatory when flagging action required from a student.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);

    try {
      await api.tickets.updateStatus(ticket.id, {
        status: targetStatus,
        comment: comment.trim() || undefined,
      });
      
      setComment('');
      onStatusUpdated(); 
      onClose(); 
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to authorize state mutation on the ledger.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none flex items-center justify-center p-4 md:p-6">
      
      {/* BACKGROUND BACKDROP DISMISSAL ESCAPE SHIELD */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* CENTRALIZED COMPLIANCE AUDIT CONTAINER CARD */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded border border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
        
        {/* CONTROL BAR PANEL HEADER */}
        <div className="bg-slate-900 text-white px-6 py-4.5 flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Audit Desk Workspace Terminal</div>
            <div className="text-sm font-black font-mono tracking-wide text-blue-400 mt-0.5">{ticket.trackingCode}</div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition bg-transparent border-none cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* HIGH-DENSITY BALANCED VIEW MULTI-COLUMN CONTAINER BODY */}
        <div className="grow overflow-y-auto p-6 space-y-5 text-xs text-slate-700 font-medium bg-slate-50/30">
          
          {errorNotice && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded font-semibold animate-in shake duration-200">
              {errorNotice}
            </div>
          )}

          {/* Top Info Strip: Balanced side-by-side profile layout split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-3.5 rounded shadow-sm">
              <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Submitting Applicant Student</div>
              <div className="text-slate-900 font-bold text-sm truncate">{ticket.student.fullName}</div>
              <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">{ticket.student.email}</div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">Requested Action Context</div>
                <div className="text-slate-900 font-bold text-xs truncate flex items-center gap-1.5">
                  <FileText size={13} className="text-[#2B35AF]" /> {ticket.serviceName}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-normal mt-1 truncate">
                Scope: {ticket.category.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Case Narrative Statement (Full Width Span Display Container) */}
          <div className="space-y-1.5 bg-white border border-slate-200 p-4 rounded shadow-sm">
            <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Student Statement Justification Summary</div>
            <div className="text-slate-800 leading-relaxed font-normal whitespace-pre-wrap text-xs bg-slate-50/50 p-3 rounded border border-slate-100 max-h-40 overflow-y-auto">
              "{ticket.description}"
            </div>
          </div>

          {/* Bottom Grid Split: Evidence Panel (Left) & Realtime Logging Input (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            
            {/* Left Box: Physical Verification Attachments Ledger */}
            <div className="space-y-2 bg-white border border-slate-200 p-4 rounded shadow-sm self-stretch flex flex-col justify-between min-h-[150px]">
              <div className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Verification Proof Attachments</div>
              <div className="grow overflow-y-auto max-h-40 space-y-2 pr-1 mt-1">
                {ticket.attachments && ticket.attachments.length > 0 ? (
                  ticket.attachments.map((file) => {
                    const fullAssetUrl = `http://localhost:4000${file.fileUrl}`;
                    const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(file.fileName);

                    return (
                      <div key={file.id} className="space-y-1.5 bg-slate-50 p-2 rounded border border-slate-200">
                        {/* ◄ CONDITIONAL EMBED: Displays a live image thumbnail preview container right inside the desk modal layout */}
                        {isImage && (
                          <div className="relative w-full h-24 bg-slate-200 rounded overflow-hidden mb-1.5 border border-slate-300">
                            {/* eslint-disable-next-html-element-img */}
                            <img 
                              src={fullAssetUrl} 
                              alt={file.fileName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <a 
                          href={fullAssetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 text-[#2B35AF] hover:underline transition font-bold no-underline text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Paperclip size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{file.fileName}</span>
                          </div>
                          <ExternalLink size={11} className="text-slate-400 shrink-0" />
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 font-normal italic text-[11px] pt-1">No file uploads bound to this case tracking code.</div>
                )}
              </div>
            </div>

            {/* Right Box: Dynamic Text Area Input */}
            <div className="space-y-1.5 bg-white border border-slate-200 p-4 rounded shadow-sm self-stretch flex flex-col justify-between min-h-[150px]">
              <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                Audit Log Feedback Comment *
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Specify requirements for ACTION_REQUIRED states, or enter complete authorization sign-off briefs..."
                className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-slate-50/30 text-xs text-slate-800 font-normal leading-relaxed resize-none grow mt-1.5 min-h-[110px]"
              />
            </div>

          </div>

        </div>

        {/* MODAL TRANSACTION ACTION ACTIONS PANEL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4.5 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          
          <div className="text-[10px] text-slate-400 font-mono tracking-wide order-2 sm:order-1">
            STATUS: <b className="text-slate-600 uppercase">{ticket.status}</b>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleStatusTransition('ACTION_REQUIRED')}
              className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded text-[11px] uppercase tracking-wide cursor-pointer transition border-none shadow-none"
            >
              <AlertTriangle size={13} /> Request Action
            </button>

            <button
              type="button"
              disabled={isSubmitting || ticket.status === 'UNDER_REVIEW'}
              onClick={() => handleStatusTransition('UNDER_REVIEW')}
              className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2 px-4 rounded text-[11px] uppercase tracking-wide cursor-pointer transition border-none shadow-none"
            >
              <RefreshCw size={12} className={isSubmitting ? 'animate-spin' : ''} /> Review Case
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleStatusTransition('RESOLVED')}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-5 rounded text-[11px] uppercase tracking-wide cursor-pointer transition border-none shadow-none"
            >
              <CheckCircle size={13} /> Resolve Case
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}