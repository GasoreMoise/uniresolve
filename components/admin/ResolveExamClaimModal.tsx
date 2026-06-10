'use client';

import React, { useState } from 'react';
import { api } from '../../config/api';
import { FileSpreadsheet, Check, X, Loader2, Edit3, Clipboard } from 'lucide-react';

interface ExamModalProps {
  ticketId: string;
  studentName: string;
  trackingCode: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function ResolveExamClaimModal({ ticketId, studentName, trackingCode, onSuccess, onClose }: ExamModalProps) {
  const [isMarkAltered, setIsMarkAltered] = useState<boolean>(false);
  const [revisedMarkInfo, setRevisedMarkInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMarkAltered && !revisedMarkInfo.trim()) {
      setError('Please fill in the specific update breakdown details.');
      return;
    }
    if (!notes.trim()) {
      setError('Please provide explanation notes from your book sheet cross-check.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.tickets.resolveExamClaim(ticketId, {
        isMarkAltered,
        revisedMarkInfo: isMarkAltered ? revisedMarkInfo.trim() : undefined,
        notes: notes.trim()
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to archive exam record parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded max-w-md w-full p-6 space-y-4 shadow-xl text-xs text-slate-800 font-sans">
        
        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#2B35AF] block mb-0.5">
            Exam Claim Resolution Desk
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Audit Ledger Sheets for {studentName}
          </h3>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            Reference Track: <span className="font-mono font-bold text-slate-600">{trackingCode}</span>
          </p>
        </div>

        {/* 🌟 STEP-BY-STEP PROCEDURE GUIDE */}
        <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded text-slate-600">
          <span className="block font-bold text-slate-900 uppercase text-[10px] tracking-wide">Required Audit Steps</span>
          <ul className="space-y-1.5 pl-0 list-none">
            <li className="flex gap-2 items-start">
              <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
              <p className="m-0 leading-normal">Cross-check the student's claimed marks against the hardcopy class book sheet.</p>
            </li>
            <li className="flex gap-2 items-start">
              <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
              <p className="m-0 leading-normal">Select whether the records match (Valid) or require rectification (Updated).</p>
            </li>
            <li className="flex gap-2 items-start">
              <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 shrink-0" />
              <p className="m-0 leading-normal">Provide clear verification notes to inform the student of your findings.</p>
            </li>
          </ul>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">{error}</div>
        )}

        <form onSubmit={handleAuditSubmit} className="space-y-4">
          
          {/* Toggle Choice Block */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Book Sheet Audit Outcome *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsMarkAltered(false)}
                className={`p-2.5 rounded font-bold uppercase text-[10px] border tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isMarkAltered 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Check size={12} /> Marks Are Valid
              </button>
              <button
                type="button"
                onClick={() => setIsMarkAltered(true)}
                className={`p-2.5 rounded font-bold uppercase text-[10px] border tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isMarkAltered 
                    ? 'bg-amber-50 border-amber-300 text-amber-800' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Edit3 size={12} /> Marks Need Update
              </button>
            </div>
          </div>

          {/* Conditional Update Details Input */}
          {isMarkAltered && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Revised Marks Breakdown Details *</label>
              <div className="relative">
                <FileSpreadsheet size={13} className="absolute left-3 inset-y-0 my-auto text-slate-400" />
                <input 
                  required
                  type="text" 
                  placeholder="e.g., Exam component changed from 24/50 to 34/50."
                  value={revisedMarkInfo}
                  onChange={(e) => setRevisedMarkInfo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-700 font-medium bg-white"
                />
              </div>
            </div>
          )}

          {/* Audit Verification Note Area */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Official Verification Notes *</label>
            <div className="relative">
              <Clipboard size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <textarea 
                required
                rows={3}
                placeholder="Provide a brief explanation of your findings from the book sheet audit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-700 bg-white font-sans text-xs"
              />
            </div>
          </div>

          {/* Actions */}
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
              {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : 'Commit Resolution'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}