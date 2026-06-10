'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, Send, Loader2, BookOpen, HelpCircle } from 'lucide-react';
import { api } from '../../config/api';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

interface LecturerProfile {
  id: string;
  fullName: string;
  department: string;
}

export default function SpecialAssessmentProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Core State Parameters
  const [moduleName, setModuleName] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [absenceReason, setAbsenceReason] = useState('MEDICAL_EMERGENCY');

  // Dynamic Lecturer Registry Tracking states
  const [lecturerDirectory, setLecturerDirectory] = useState<LecturerProfile[]>([]);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>('');
  const [isRegistryLoading, setIsRegistryLoading] = useState<boolean>(true);
  const [registryLoadError, setRegistryLoadError] = useState<boolean>(false);

  // Hook into network registry stream on mount pass
  useEffect(() => {
    async function fetchActiveRegistry() {
      try {
        const activeLecturers = await api.users.getLecturers();
        setLecturerDirectory(activeLecturers);
        if (activeLecturers && activeLecturers.length > 0) {
          setSelectedLecturerId(activeLecturers[0].id);
        }
      } catch (error) {
        console.error("Could not sync lecturer registry directory:", error);
        setRegistryLoadError(true);
      } finally {
        setIsRegistryLoading(false);
      }
    }
    fetchActiveRegistry();
  }, []);

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenLecturerObj = lecturerDirectory.find(item => item.id === selectedLecturerId);
    const resolvedLecturerName = chosenLecturerObj ? chosenLecturerObj.fullName : 'Unlinked Lecturer';

    const structuredNarrative = `
[SPECIAL ASSESSMENT REQUEST]
--------------------------------------------------
* Assessment Target Type: ${cleanService}
* Module Title: ${moduleName || 'N/A'}
* Module Reference Code: ${moduleCode.toUpperCase() || 'N/A'}
* Course Lecturer-in-Charge: ${resolvedLecturerName}
* Primary Justification Motive: ${absenceReason.replace(/_/g, ' ')}

* Detailed Timeline & Case Justification:
${description}
    `.trim();

    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs text-slate-700 animate-in fade-in duration-200">
      
      {/* 🌟 SIMPLE, COMPONENT-ALIGNED RESOLUTION GUIDELINES LIST */}
      <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-1">
          <HelpCircle size={13} className="text-[#2B35AF]" />
          <span>How Your Request Will Be Processed</span>
        </div>
        
        <p className="text-slate-500 font-normal leading-normal">
          Once submitted, your application is reviewed directly by your department desk. Your issue will move toward resolution through one of these standard steps:
        </p>

        <ul className="space-y-2.5 pl-0 list-none font-medium text-slate-600">
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">Approval & Scheduling:</b> If approved, your lecturer will choose a specific date, time, and room for your special assessment. You will find these full details posted directly under your history ledger.
            </p>
          </li>
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">Information Adjustments:</b> If the attached documents are blurry or incomplete, your status changes to <span className="text-purple-700 font-bold uppercase text-[10px]">Action Required</span> so you can instantly re-upload clean copies.
            </p>
          </li>
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">Official Decisions:</b> If your request falls outside university policies, the application is declined. A review comment statement will be attached so you rightfully learn the exact reason behind the decision.
            </p>
          </li>
        </ul>
      </div>

      {/* Course Details Segment */}
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
            {isRegistryLoading ? (
              <div className="w-full p-2.5 bg-slate-100 text-slate-400 font-medium italic rounded border border-slate-200 animate-pulse">
                Syncing active lecturer registry data...
              </div>
            ) : registryLoadError ? (
              <div className="w-full p-2.5 bg-red-50 text-red-600 font-medium rounded border border-red-200">
                Failed to sync lecturer lookup database ledger.
              </div>
            ) : (
              <select
                required
                value={selectedLecturerId}
                onChange={(e) => setSelectedLecturerId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-bold transition"
              >
                {lecturerDirectory.length === 0 ? (
                  <option value="">No registered lecturers active in directory</option>
                ) : (
                  lecturerDirectory.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.fullName} — {lec.department.replace(/_/g, ' ')}
                    </option>
                  ))
                )}
              </select>
            )}
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

      {/* Justification Text Area */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Justification Statement *
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

      {/* File Upload Block */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Upload Official Justification Documents *
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

      {/* Submission Footer Actions */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting || isRegistryLoading || registryLoadError}
          className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-none border-none cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Submit Request to Department <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}