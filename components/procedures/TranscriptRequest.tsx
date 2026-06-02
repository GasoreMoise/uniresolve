'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Upload, FileText, Send, Loader2 } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function TranscriptRequestProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState('OFFICIAL_TRANSCRIPT');
  const [graduationCohort, setGraduationCohort] = useState('2026');
  const [clearanceSlipRef, setClearanceSlipRef] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    const structuredNarrative = `
[CUSTOM PROCEDURE: TRANSCRIPT & ACADEMIC DOCUMENT ISSUANCE]
--------------------------------------------------
* Requested Document Target: ${documentType.replace(/_/g, ' ')}
* Intended Graduation Cohort: Class of ${graduationCohort}
* Finance Office Clearance Reference: ${clearanceSlipRef || 'N/A'}

* Special Student Delivery Instructions / Comments:
${description}
    `.trim();
    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase border-b pb-1.5">
          <FileSpreadsheet size={13} className="text-[#2B35AF]" />
          <span>Registrar Document Processing Controls</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Document Requested *</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-bold">
              <option value="OFFICIAL_TRANSCRIPT">Official Academic Transcript Ledger</option>
              <option value="TO_WHOM_IT_MAY_CONCERN">To Whom It May Concern Clearance Certificate</option>
              <option value="DUPLICATE_DIPLOMA">Duplicate Certified Degree Print</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Graduation Cohort Year *</label>
            <input required type="number" min={2010} max={2030} value={graduationCohort} onChange={(e) => setGraduationCohort(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-mono font-bold" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Clearance Fee Slip Ref *</label>
            <input required type="text" placeholder="Finance reference identifier" value={clearanceSlipRef} onChange={(e) => setClearanceSlipRef(e.target.value.toUpperCase())} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-mono" />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Additional Processing Delivery Scope Comments</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide any tracking metrics or specific courier or destination parameters if required..." className="w-full text-sm p-3 border border-slate-300 rounded bg-white text-slate-800 font-sans" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Attach Paid Clearance Slips (Mandatory Audit Protocol) *</label>
        <div className="border-2 border-dashed border-slate-200 rounded p-4 text-center bg-slate-50 hover:bg-slate-100 relative">
          <input type="file" multiple required={files.length === 0} onChange={handleFilePicker} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
          <span className="text-[11px] text-slate-500 block font-medium">Click or drag local files to submit bank clearance sheets</span>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 border-none transition">
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Request Document Clearance <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}