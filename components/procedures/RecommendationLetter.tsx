'use client';

import React, { useState } from 'react';
import { FileText, Send, Loader2, Award } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function RecommendationLetterProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [recipientOrganization, setRecipientOrganization] = useState('');
  const [purpose, setPurpose] = useState('SCHOLARSHIP');
  const [keyAchievements, setKeyAchievements] = useState('');

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    const structuredNarrative = `
[CUSTOM PROCEDURE: RECOMMENDATION LETTER REQUEST]
--------------------------------------------------
* Target Receiving Organization: ${recipientOrganization || 'N/A'}
* Purpose of Request: ${purpose}
* Student Highlighted Core Achievements: ${keyAchievements || 'N/A'}

* Additional Academic Context Narrative:
${description}
    `.trim();
    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-4 text-xs animate-in fade-in duration-200">
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase border-b pb-1.5">
          <Award size={13} className="text-[#2B35AF]" />
          <span>Letter Context Requirements</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Target Organization / University *</label>
            <input required type="text" placeholder="e.g., Higher Education Council Rwanda" value={recipientOrganization} onChange={(e) => setRecipientOrganization(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Letter Purpose *</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800">
              <option value="SCHOLARSHIP">International/Local Scholarship Application</option>
              <option value="EMPLOYMENT">Professional Employment / Job Reference</option>
              <option value="FURTHER_STUDIES">Master's / Post-Graduate Admission</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase text-slate-500">Key Projects, Achievements, or Modules to Highlight *</label>
          <textarea required rows={3} placeholder="List out specific final year research topic, high grades, or student leadership positions to mention..." value={keyAchievements} onChange={(e) => setKeyAchievements(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Additional Student Comments</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide any extra contextual requests..." className="w-full text-sm p-3 border border-slate-300 rounded bg-white text-slate-800 font-sans" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 border-none transition">
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Dispatch Letter Request <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}