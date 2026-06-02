'use client';

import React, { useState } from 'react';
import { Calendar, Upload, FileText, Send, Loader2, Clock, AlertCircle } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function AbsencePermissionProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Custom State Inputs for Absence & Permission Reporting
  const [absenceReason, setAbsenceReason] = useState('OFFICIAL_REPRESENTATION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [impactedLecturers, setImpactedLecturers] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    // Structural narrative layout for official administrative record logging
    const structuredNarrative = `
[CUSTOM PROCEDURE: PERMISSION & ABSENCE REPORTING]
--------------------------------------------------
* Primary Request Category: ${absenceReason.replace(/_/g, ' ')}
* Absence Commences: ${startDate || 'N/A'}
* Absence Concludes: ${endDate || 'N/A'}
* Impacted Class Lecturers / Courses: ${impactedLecturers || 'N/A'}

* Detailed Reason & Official Justification Statement:
${description}
    `.trim();

    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      
      {/* Specialized Absence Parameters Segment */}
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-2">
          <Calendar size={13} className="text-[#2B35AF]" />
          <span>Official Absence Registry Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason for Leave Request *</label>
            <select 
              value={absenceReason}
              onChange={(e) => setAbsenceReason(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            >
              <option value="OFFICIAL_REPRESENTATION">Official University / Institutional Duties</option>
              <option value="MEDICAL_LEAVE">Medical Leave / Illness / Appointment</option>
              <option value="FAMILY_EMERGENCY">Family Emergency / Urgent Hardship</option>
              <option value="RELIGIOUS_OBLIGATION">Official Religious Holiday / Obligation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Affected Courses & Lecturers *</label>
            <input 
              required
              type="text" 
              placeholder="e.g., Dr. Mukama (SWE412), Prof. Kalisa (CSC311)"
              value={impactedLecturers}
              onChange={(e) => setImpactedLecturers(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date of Absence *</label>
            <input 
              required
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date of Absence *</label>
            <input 
              required
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Narrative Detailed Justification Statement */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Official Narrative Justification Details *
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a formal description clarifying why you must be absent during this period..."
          className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition"
        />
      </div>

      {/* Proof Documents Upload Block (Medical sheets, invitation cards, official institutional mission letters) */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Upload Supporting Evidence (Official Request Letters, Medical Forms, Event Invites) *
        </label>
        <div className="border-2 border-dashed border-slate-200 rounded p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition relative">
          <input 
            type="file" 
            multiple 
            required={files.length === 0} // Mandatory parameters to secure system legitimacy 
            onChange={handleFilePicker} 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
          />
          <Upload size={24} className="mx-auto text-slate-300 mb-1" />
          <span className="text-[11px] text-slate-500 block font-medium">Drag supporting records here or click to browse files</span>
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
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Log Official Absence record <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}