'use client';

import React, { useState } from 'react';
import { CreditCard, Upload, FileText, Send, Loader2, User, ShieldAlert } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function CardReplacementProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Custom State Inputs for Student Card Replacement Procedure
  const [replacementReason, setReplacementReason] = useState('LOST_CARD');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('2025_2026');
  const [bankSlipRef, setBankSlipRef] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    // Structural breakdown string mapping out the custom business procedure narrative
    const structuredNarrative = `
[CUSTOM PROCEDURE: STUDENT CARD REPLACEMENT]
--------------------------------------------------
* Replacement Condition: ${replacementReason.replace(/_/g, ' ')}
* Student Registration Number: ${registrationNumber || 'N/A'}
* Active Academic Cohort Year: ${academicYear.replace(/_/g, '/')}
* Replacement Fee Slip Bank Reference: ${bankSlipRef || 'N/A'}

* Student Additional Comments:
${description}
    `.trim();

    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      
      {/* Specialized Identity Parameters Segment */}
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-2">
          <User size={13} className="text-[#2B35AF]" />
          <span>Card Identity & Clearance Audit Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason for Replacement *</label>
            <select 
              value={replacementReason}
              onChange={(e) => setReplacementReason(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            >
              <option value="LOST_CARD">Physical Card Lost / Misplaced</option>
              <option value="DAMAGED_CARD">Chip Damaged / Card Broken</option>
              <option value="PRINT_ERROR">Incorrect Information on Physical Print</option>
              <option value="EXPIRED_CARD">Card Term Lifecycle Expired</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Registration Number *</label>
            <input 
              required
              type="text" 
              placeholder="e.g., 22/UTAB/045"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold uppercase text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Academic Year *</label>
            <select 
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            >
              <option value="2025_2026">2025/2026 Academic Year</option>
              <option value="2024_2025">2024/2025 Academic Year</option>
              <option value="2023_2024">2023/2024 Academic Year</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Bank Slip Ref No (Replacement Fee) *</label>
            <input 
              required
              type="text" 
              placeholder="e.g., RWF Deposit Slip Reference"
              value={bankSlipRef}
              onChange={(e) => setBankSlipRef(e.target.value.toUpperCase())}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold tracking-wider text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Narrative block */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Declaration / Incident Statement *
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a brief explanation verifying the replacement conditions (e.g., chronological details on card loss, details on information errors, etc.)..."
          className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition"
        />
      </div>

      {/* Upload attachments (Crucial for providing Passport Photos or scanned lost card police reports) */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Upload Documents (Mandatory Passport Photo & Bank Slip Copy) *
        </label>
        <div className="border-2 border-dashed border-slate-200 rounded p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition relative">
          <input 
            type="file" 
            multiple 
            required={files.length === 0} 
            onChange={handleFilePicker} 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
          />
          <Upload size={24} className="mx-auto text-slate-300 mb-1" />
          <span className="text-[11px] text-slate-500 block font-medium">Drag assets here or click to browse files</span>
        </div>

        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 truncate">
                <FileText size={12} className="text-[#2B35AF] shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-none border-none cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Dispatch to Registrar Office <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}