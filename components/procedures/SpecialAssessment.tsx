'use client';

import React, { useState } from 'react';
import { GraduationCap, Upload, FileText, Send, Loader2, BookOpen } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function SpecialAssessmentProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Custom State Inputs for Special Assessment Requests
  const [moduleName, setModuleName] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [absenceReason, setAbsenceReason] = useState('MEDICAL_EMERGENCY');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    // Structuring the academic breakdown narrative payload for HOD review
    const structuredNarrative = `
[CUSTOM PROCEDURE: SPECIAL ASSESSMENT REQUEST]
--------------------------------------------------
* Assessment Target Type: ${cleanService}
* Module Title: ${moduleName || 'N/A'}
* Module Reference Code: ${moduleCode.toUpperCase() || 'N/A'}
* Course Lecturer-in-Charge: ${lecturerName || 'N/A'}
* Primary Justification Motive: ${absenceReason.replace(/_/g, ' ')}

* Detailed Timeline & Case Justification:
${description}
    `.trim();

    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      
      {/* Specialized Academic Metrics Segment */}
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-2">
          <BookOpen size={13} className="text-[#2B35AF]" />
          <span>Course Module & Academic Audit Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Module / Course Name *</label>
            <input 
              required
              type="text"
              placeholder="e.g., Advanced Software Engineering"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Module Code *</label>
            <input 
              required
              type="text" 
              placeholder="e.g., SWE412"
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold uppercase text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Lecturer-in-Charge Name *</label>
            <input 
              required
              type="text"
              placeholder="Enter lecturer's full name..."
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason for Missing Assessment *</label>
            <select 
              value={absenceReason}
              onChange={(e) => setAbsenceReason(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            >
              <option value="MEDICAL_EMERGENCY">Medical Emergency / Hospitalization</option>
              <option value="BEREAVEMENT">Family Bereavement / Social Hardship</option>
              <option value="OFFICIAL_REPRESENTATION">Institutional University Representation</option>
              <option value="FINANCIAL_LOCKOUT">Financial Clearance Delay / System Loop</option>
            </select>
          </div>
        </div>
      </div>

      {/* Narrative Detailed Justification Case Statement */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Chronological Justification Statement *
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a clear and formal explanation detailing why you missed the assessment and your request for a makeup window..."
          className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition"
        />
      </div>

      {/* Proof Attachments Upload Block (Crucial for Medical Certificates / Official Letters) */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Upload Official Justification Documents (Medical Certificates, Receipts, etc.) *
        </label>
        <div className="border-2 border-dashed border-slate-200 rounded p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition relative">
          <input 
            type="file" 
            multiple 
            required={files.length === 0} // Mandatory verification assets to protect system fairness
            onChange={handleFilePicker} 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
          />
          <Upload size={24} className="mx-auto text-slate-300 mb-1" />
          <span className="text-[11px] text-slate-500 block font-medium">Drag certificates here or click to browse files</span>
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
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Submit Request to Department <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}