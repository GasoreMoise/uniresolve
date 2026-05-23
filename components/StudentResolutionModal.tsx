'use client';

import React, { useState } from 'react';
import { X, Send, Upload, Loader2, MessageSquare, AlertTriangle, CornerDownRight } from 'lucide-react';
import { api } from '../config/api';

interface Ticket {
    id: string;
    trackingCode: string;
    serviceName: string;
    category: string;     
    description: string;
    status: string;
    history?: Array<{
      id: string;
      comment: string;
      createdAt: string;
    }>;
  }
  
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
    onResubmitted: () => void;
  }

export default function StudentResolutionModal({ isOpen, onClose, ticket, onResubmitted }: ModalProps) {
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  // ◄ CAPTURE THE LATEST OFFICER COMMENT FROM THE TOP OF THE LOG MATRIX
  const latestOfficerFeedback = ticket.history && ticket.history.length > 0 
    ? ticket.history[0].comment 
    : 'No additional instructions specified by the department desk reviewer.';

  const handleFormPatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorNotice(null);

    try {
      // Executing your multi-part boundary stream payload upload parameters
      const formData = new FormData();
      formData.append('status', 'UNDER_REVIEW'); 
      formData.append('comment', comment.trim() || 'Student updated case file artifacts.');
      
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      await api.tickets.updateStatus(ticket.id, {
        status: 'UNDER_REVIEW',
        comment: comment.trim() || undefined
      });

      setComment('');
      setFiles([]);
      onResubmitted(); 
      onClose();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to dispatch resolution logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <form onSubmit={handleFormPatchSubmit} className="relative w-full max-w-md bg-white rounded border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10 text-xs text-slate-700 font-medium">
        
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Resolution Discrepancy Hub</div>
            <div className="text-sm font-black font-mono tracking-wide text-blue-400 mt-0.5">{ticket.trackingCode}</div>
          </div>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-white transition bg-transparent border-none cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {errorNotice && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded font-semibold">{errorNotice}</div>
          )}

          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded flex items-start gap-2 text-amber-900 font-normal leading-relaxed shadow-sm">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-xs text-amber-950 mb-0.5">Faculty Audit Statement Notice:</span>
              Action is required on your <b>{ticket.serviceName}</b> claim file. Review instructions below, correct errors, and append your updated artifacts.
            </div>
          </div>

          {/* ◄ THE ADDITION: Elegant high-contrast container showing the exact officer comment statement string */}
          <div className="space-y-1.5 bg-slate-900 text-slate-100 p-3.5 rounded border border-slate-800 shadow-inner font-mono text-[11px] leading-relaxed relative overflow-hidden">
            <div className="text-[9px] uppercase tracking-wider font-bold text-blue-400 border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1">
              <CornerDownRight size={10} /> Desk Officer Feedback Comments
            </div>
            <p className="font-normal whitespace-pre-wrap text-slate-200 italic">
              "{latestOfficerFeedback}"
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Clarification Notes Summary</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide context about your replacement documents or type response parameters..."
              className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-xs font-normal text-slate-800 leading-relaxed resize-none bg-slate-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Corrected Proof Uploads</label>
            <div className="border-2 border-dashed border-slate-200 rounded p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition relative">
              <input 
                type="file" 
                multiple 
                onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
              />
              <Upload size={20} className="mx-auto text-slate-300 mb-1" />
              <span className="text-[11px] text-slate-500 block font-semibold">Drop or select your pristine screenshots</span>
            </div>
            {files.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 p-2 rounded text-[10px] text-slate-600 truncate">
                Attached: <b>{files.map(f => f.name).join(', ')}</b>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition font-bold cursor-pointer">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white rounded font-bold transition flex items-center gap-1.5 uppercase tracking-wide cursor-pointer border-none shadow-none">
            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <><Send size={11} /> Commit Resubmission</>}
          </button>
        </div>

      </form>
    </div>
  );
}