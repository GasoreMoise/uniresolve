'use client';

import React, { useState } from 'react';
import { api } from '../../config/api'; // ◄ Verify this points correctly to your config/api file
import { MessageSquare, AlertTriangle, Send, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  ticketId: string;
  studentName: string;
  mode: 'REJECTED' | 'ACTION_REQUIRED';
  onSuccess: () => void;
  onClose: () => void;
}

export default function LecturerFeedbackModal({ ticketId, studentName, mode, onSuccess, onClose }: FeedbackModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRejectMode = mode === 'REJECTED';

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide instructions or reasoning statement for the student.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.tickets.submitReviewDecision(ticketId, {
        status: mode,
        comment: comment.trim()
      });
      onSuccess(); 
    } catch (err: any) {
      setError(err.message || 'Failed to submit review decision parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded max-w-md w-full p-6 space-y-4 shadow-xl text-xs text-slate-800 font-sans">
        
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded shrink-0 ${isRejectMode ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
              Review Action Terminal
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {isRejectMode ? 'Refuse Request Status' : 'Require Additional Action'}
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Student: <span className="font-bold text-slate-700">{studentName}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isRejectMode ? 'Official Reason for Refusal *' : 'Instructions for the Student *'}
            </label>
            <div className="relative">
              <MessageSquare size={13} className="absolute left-3 top-3 text-slate-400" />
              <textarea 
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isRejectMode 
                    ? "Explain why this request is refused..."
                    : "Specify exactly what missing proof or details the student needs to re-upload..."
                }
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-700 bg-white font-sans text-xs leading-normal"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold uppercase tracking-wider transition border-none cursor-pointer"
            >
              Back
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-5 py-2 text-white rounded font-bold uppercase tracking-wider transition flex items-center gap-1 border-none cursor-pointer ${
                isRejectMode ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <><Send size={11} /> Submit Review</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}