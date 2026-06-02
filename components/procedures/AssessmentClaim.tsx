'use client';

import React, { useState } from 'react';
import { FileText, Upload, Send, Loader2, ClipboardCheck, AlertCircle } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function AssessmentClaimProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Custom State Inputs for Assessment Mismatch Claims
  const [moduleName, setModuleName] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [assessmentType, setAssessmentType] = useState('FINAL_EXAMINATION');
  const [publishedGrade, setPublishedGrade] = useState('');
  const [claimedGrade, setClaimedGrade] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce structured parameter logging for clear back-office audits
    const structuredNarrative = `
[CUSTOM PROCEDURE: ASSESSMENT & MARKS CLAIM]
--------------------------------------------------
* Target Claim Stream: ${cleanService}
* Module Title: ${moduleName || 'N/A'}
* Module Reference Code: ${moduleCode.toUpperCase() || 'N/A'}
* Course Lecturer-in-Charge: ${lecturerName || 'N/A'}
* Impacted Component: ${assessmentType.replace(/_/g, ' ')}
* Published Grade State: ${publishedGrade || 'Zero / Missing'}
* Claimed Expected Grade: ${claimedGrade || 'Unknown'}

* Student Discrepancy Context Statement:
${description}
    `.trim();

    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      
      {/* Specialized Grade Metrics Parameter Grid */}
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-2">
          <ClipboardCheck size={13} className="text-[#2B35AF]" />
          <span>Academic Evaluation Discrepancy Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Module / Course Title *</label>
            <input 
              required
              type="text"
              placeholder="e.g., Object Oriented Programming"
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
              placeholder="e.g., CSC311"
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold uppercase text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Lecturer-in-Charge *</label>
            <input 
              required
              type="text"
              placeholder="Instructor's Name"
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Evaluation Mode *</label>
            <select 
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            >
              <option value="CONTINUOUS_ASSESSMENT_CAT">Continuous Assessment Test (CAT)</option>
              <option value="LAB_PRACTICAL_ASSIGNMENT">Laboratory Practical / Assignment</option>
              <option value="FINAL_EXAMINATION">Final Written Examination</option>
              <option value="RESEARCH_PROJECT_WORK">Research / Capstone Project Work</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Published vs Claimed Score *</label>
            <div className="flex gap-2">
              <input 
                required
                type="text" 
                placeholder="Portal: 0 or M"
                value={publishedGrade}
                onChange={(e) => setPublishedGrade(e.target.value)}
                className="w-1/2 p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold text-center text-red-600 bg-red-50/20"
              />
              <input 
                required
                type="text" 
                placeholder="Expected: 78"
                value={claimedGrade}
                onChange={(e) => setClaimedGrade(e.target.value)}
                className="w-1/2 p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold text-center text-emerald-600 bg-emerald-50/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Narrative Statement */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Discrepancy Justification & Context Summary *
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide an explicit timeline description outlining when the assessment was sat, when marks were registered missing, and any verbal responses received from instructors..."
          className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition"
        />
      </div>

      {/* Proof Attachments Drag Zone (Highly critical for uploading signed attendance logs or graded hardcopy sheets) */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Upload Supporting Evidence (Scanned Graded Booklets, Test Booklets, or Signed Attendance Registers) *
        </label>
        <div className="border-2 border-dashed border-slate-200 rounded p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition relative">
          <input 
            type="file" 
            multiple 
            required={files.length === 0} // Proof mandatory to allow formal academic processing checks
            onChange={handleFilePicker} 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
          />
          <Upload size={24} className="mx-auto text-slate-300 mb-1" />
          <span className="text-[11px] text-slate-500 block font-medium">Drag evidence assets here or click to browse local files</span>
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
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Dispatch Grade Claim <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}