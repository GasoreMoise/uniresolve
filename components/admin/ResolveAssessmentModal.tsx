'use client';

import React, { useState } from 'react';
import { api } from '../../config/api'; // ◄ Verify this points correctly to your config/api file
import { Calendar, MapPin, FileText, Check, Loader2 } from 'lucide-react';

interface ResolveModalProps {
  ticketId: string;
  studentName: string;
  moduleCode: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function ResolveAssessmentModal({ ticketId, studentName, moduleCode, onSuccess, onClose }: ResolveModalProps) {
  const [assessmentDate, setAssessmentDate] = useState('');
  const [venue, setVenue] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.tickets.resolveSpecialAssessment(ticketId, {
        date: assessmentDate,
        venue: venue,
        notes: notes
      });
      onSuccess(); 
    } catch (err: any) {
      setError(err.message || 'Failed to register assessment slot parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded max-w-md w-full p-6 space-y-4 shadow-xl text-xs text-slate-800 font-sans">
        
        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#2B35AF] block mb-0.5">
            Issue Resolution Terminal
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Schedule Makeup Assessment for {studentName}
          </h3>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            Ticket Reference: <span className="font-mono font-bold text-slate-600">{moduleCode}</span>
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleResolveSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Allocated Time Slot & Date *
            </label>
            <div className="relative">
              <Calendar size={13} className="absolute left-3 inset-y-0 my-auto text-slate-400" />
              <input 
                required
                type="datetime-local" 
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold text-slate-700 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Assessment Venue Location *
            </label>
            <div className="relative">
              <MapPin size={13} className="absolute left-3 inset-y-0 my-auto text-slate-400" />
              <input 
                required
                type="text" 
                placeholder="e.g., Computer Science Lab 2, Block A"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-medium text-slate-700 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Special Instructions / Scope Details
            </label>
            <div className="relative">
              <FileText size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <textarea 
                rows={3}
                placeholder="e.g., Bring your university ID card. Covers chapters 1 to 4..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-700 bg-white font-sans text-xs"
              />
            </div>
          </div>

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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold uppercase tracking-wider transition flex items-center gap-1 border-none cursor-pointer shadow-none"
            >
              {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <><Check size={13} /> Issue Resolution</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}