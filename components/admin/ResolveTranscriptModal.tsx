'use client';

import React, { useState } from 'react';
import { api } from '../../config/api';
import { X, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface TranscriptModalProps {
  ticketId: string;
  studentName: string;
  trackingCode: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function ResolveTranscriptModal({ ticketId, studentName, trackingCode, onSuccess, onClose }: TranscriptModalProps) {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === 'REJECTED' && !reason.trim()) {
      setError('Please provide an official explanation for declining this transcript request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.tickets.resolveTranscriptRequest(ticketId, {
        decision,
        reason: decision === 'REJECTED' ? reason.trim() : undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to communicate transcript decision parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded max-w-md w-full p-6 space-y-4 shadow-xl text-xs text-slate-800 font-sans">
        
        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#2B35AF] block mb-0.5">
            Registry Desk Operations
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Evaluate Transcript Application for {studentName}
          </h3>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            Case Reference: <span className="font-mono font-bold text-slate-600">{trackingCode}</span>
          </p>
        </div>

        {/* GUIDELINES LIST */}
        <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 leading-relaxed">
          <span className="block font-bold text-slate-900 uppercase text-[10px] tracking-wide">Transcript Processing Protocol</span>
          <p className="m-0 font-normal">
            Verify that the student’s bank deposit slip matches the required 5,000 FRW clearance value. Upon approval, the system generates a downloadable PDF file statement for the student.
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">{error}</div>
        )}

        <form onSubmit={handleTranscriptSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Review Decision *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`p-2.5 rounded font-bold uppercase text-[10px] border tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  decision === 'APPROVED' 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 size={12} /> Grant Approval
              </button>
              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-2.5 rounded font-bold uppercase text-[10px] border tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  decision === 'REJECTED' 
                    ? 'bg-red-50 border-red-300 text-red-800' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <AlertCircle size={12} /> Decline Request
              </button>
            </div>
          </div>

          {decision === 'REJECTED' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Official Reason for Rejection *</label>
              <textarea 
                required
                rows={3}
                placeholder="State clearly why this transcript application was refused (e.g., Unpaid fees, invalid banking transaction reference numbers...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-700 bg-white font-sans text-xs resize-none leading-relaxed"
              />
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold uppercase tracking-wider transition border-none cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#2B35AF] hover:bg-blue-800 text-white rounded font-bold uppercase tracking-wider transition flex items-center gap-1 border-none cursor-pointer shadow-none"
            >
              {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Commit Decision'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}