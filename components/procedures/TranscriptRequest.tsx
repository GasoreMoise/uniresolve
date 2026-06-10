'use client';

import React, { useState } from 'react';
import { Upload, FileText, Send, Loader2, HelpCircle, Landmark, GraduationCap } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function TranscriptProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  const [studentRegNo, setStudentRegNo] = useState('');
  const [academicProgram, setAcademicProgram] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    const structuredNarrative = `
[CUSTOM PROCEDURE: OFFICIAL TRANSCRIPT REQUEST]
--------------------------------------------------
* Service Core Type: ${cleanService}
* Student Registration Number: ${studentRegNo.trim()}
* Academic Program Enrollment: ${academicProgram.trim()}
* Target Academic Year Scope: ${academicYear}

* Additional Context/Special Instructions:
${description || 'None specified.'}
    `.trim();

    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs text-slate-700 animate-in fade-in duration-200">
      
      {/* HUMAN-CENTERED VERIFICATION STEPS LIST */}
      <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-1">
          <HelpCircle size={13} className="text-[#2B35AF]" />
          <span>Transcript Generation Steps & Verification Flow</span>
        </div>
        <p className="text-slate-500 font-normal leading-normal">
          Official academic transcript processing involves active validation runs across central registry databases. Here is how your claim will progress towards resolution:
        </p>
        <ul className="space-y-2.5 pl-0 list-none font-medium text-slate-600">
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">1. Administrative Fee Verification:</b> Students must pay a processing fee of <b>5,000 FRW</b> via Bank of Kigali (BK) using the official parameters below and upload the proof file slip directly.
            </p>
          </li>
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">2. HOD Evaluation Pass:</b> Your Head of Department reviews your registry data profile, audits completion thresholds, and issues an approval switch lock or refusal response statement.
            </p>
          </li>
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">3. Automated PDF Publication:</b> Upon authorization, an official PDF provisional statement copy is compiled by the system matching standard template structures and published instantly onto your history dashboard for dynamic download.
            </p>
          </li>
        </ul>
      </div>

      {/* Profile Parameters Input Group */}
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-2">
          <GraduationCap size={13} className="text-[#2B35AF]" />
          <span>Academic Registration Identification Metadata</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Registration Number *</label>
            <input 
              required
              type="text"
              placeholder="e.g., 222013253"
              value={studentRegNo}
              onChange={(e) => setStudentRegNo(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Degree / Program Title *</label>
            <input 
              required
              type="text"
              placeholder="e.g., BSC.(HONS) COMPUTER SCIENCE"
              value={academicProgram}
              onChange={(e) => setAcademicProgram(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-bold uppercase text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Academic Year *</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-bold text-slate-800"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* Special Context instructions input */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Special Notes or Delivery Instructions (Optional)</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Specify if you require special formatting signatures, sorting preferences, or particular module inclusions..."
          className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition resize-none"
        />
      </div>

      {/* Bank Details Context Layout Port Card */}
      <div className="p-3.5 bg-slate-900 text-slate-100 rounded border border-slate-800 space-y-1.5 shadow-inner">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-400 text-[10px]">
          <Landmark size={12} />
          <span>Official University Registration Registry Bank Details</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-slate-300 font-mono text-[11px] pt-0.5">
          <div>Bank Target entity: <b className="text-white">BK (Bank of Kigali)</b></div>
          <div>Account Name String: <b className="text-white">UR Registrar Clearance Accounts Ledger</b></div>
          <div className="sm:col-span-2">Account Code Number: <b className="text-emerald-400 select-all tracking-wide">00095-09923841-87</b></div>
        </div>
      </div>

      {/* Upload segment proof slip placeholder */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Upload Processing Deposit Bank Slip Evidence *</label>
        <div className="border-2 border-dashed border-slate-200 rounded p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition relative">
          <input 
            type="file" 
            required={files.length === 0}
            onChange={handleFilePicker}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
          />
          <Upload size={24} className="mx-auto text-slate-300 mb-1" />
          <span className="text-[11px] text-slate-500 block font-medium">Drop scannable BK transaction copy files here or browse</span>
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

      {/* Submission Actions Row */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition border-none cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Transmit Transcript Request</>}
        </button>
      </div>

    </form>
  );
}