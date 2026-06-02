'use client';

import React, { useState } from 'react';
import { CalendarRange, Send, Loader2 } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function ClassAllocationProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [moduleA, setModuleA] = useState('');
  const [moduleB, setModuleB] = useState('');
  const [conflictingRoom, setConflictingRoom] = useState('');
  const [disputedTime, setDisputedTime] = useState('');

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    const structuredNarrative = `
[CUSTOM PROCEDURE: CLASS ALLOCATION & TIMETABLE OVERLAP]
--------------------------------------------------
* Primary Allocated Module (Your Cohort): ${moduleA || 'N/A'}
* Overlapping Conflicting Module Code: ${moduleB || 'N/A'}
* Disputed Physical Lecture Room: ${conflictingRoom || 'N/A'}
* Conflict Timetable Slot: ${disputedTime || 'N/A'}

* Timetable Conflict Escalation Narrative:
${description}
    `.trim();
    onSubmit({ description: structuredNarrative, files: [] });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-4 text-xs animate-in fade-in duration-200">
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase border-b pb-1.5">
          <CalendarRange size={13} className="text-[#2B35AF]" />
          <span>Timetable Overlap Conflict Vector Matrices</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Your Module Title/Code *</label>
            <input required type="text" placeholder="e.g., SWE412 Software Engineering" value={moduleA} onChange={(e) => setModuleA(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Conflicting Overlapping Module *</label>
            <input required type="text" placeholder="e.g., ACC110 Basic Accounting occupying room" value={moduleB} onChange={(e) => setModuleB(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Disputed Room Number *</label>
            <input required type="text" placeholder="e.g., Block B Room 102" value={conflictingRoom} onChange={(e) => setConflictingRoom(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Conflict Timetable Hour Slot *</label>
            <input required type="text" placeholder="e.g., Monday 08:00 - 10:30 CAT" value={disputedTime} onChange={(e) => setDisputedTime(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-mono" />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Timetable Relocation Claim Narrative Summary *</label>
        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide information outlining class representative context data to support an emergency room allocation amendment order..." className="w-full text-sm p-3 border border-slate-300 rounded bg-white text-slate-800 font-sans" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 border-none transition">
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Dispatch Allocation Alert <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}