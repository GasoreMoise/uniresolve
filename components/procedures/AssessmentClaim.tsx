'use client';

import React, { useState } from 'react';
import { FileText, Upload, Loader2, ClipboardCheck, HelpCircle, Landmark, AlertCircle } from 'lucide-react';

// ◄ 1. UPDATED INTERFACE: Added 'profile' and updated 'onSubmit' payload
interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[]; moduleId?: string }) => void;
  profile?: any; 
}

export default function AssessmentClaimProcedureForm({ cleanService, isSubmitting, onSubmit, profile }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Custom State Inputs for Assessment Mismatch Claims
  const [selectedModuleId, setSelectedModuleId] = useState(''); // ◄ Replaces moduleName/Code
  const [assessmentType, setAssessmentType] = useState('FINAL_EXAMINATION');
  const [publishedGrade, setPublishedGrade] = useState('');
  const [claimedGrade, setClaimedGrade] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    if (profile && !selectedModuleId) {
      alert("Please select the target module for this claim from the dropdown.");
      return;
    }

    // Extract the full module details from the profile based on the selected ID
    const selectedRegistration = profile?.registeredModules?.find(
      (reg: any) => reg.module.id === selectedModuleId
    );

    const moduleName = selectedRegistration ? selectedRegistration.module.title : 'N/A';
    const moduleCode = selectedRegistration ? selectedRegistration.module.code : 'N/A';
    const lecturerName = selectedRegistration?.module.lecturer?.fullName || 'Unassigned Faculty Member';

    // Enforce structured parameter logging for clear back-office audits
    const structuredNarrative = `
[CUSTOM PROCEDURE: ASSESSMENT & MARKS CLAIM]
--------------------------------------------------
* Target Claim Stream: ${cleanService}
* Module Title: ${moduleName}
* Module Reference Code: ${moduleCode.toUpperCase()}
* Course Lecturer-in-Charge: ${lecturerName}
* Impacted Component: ${assessmentType.replace(/_/g, ' ')}
* Published Grade State: ${publishedGrade || 'Zero / Missing'}
* Claimed Expected Grade: ${claimedGrade || 'Unknown'}

* Student Discrepancy Context Statement:
${description}
    `.trim();

    // ◄ Submit the structured narrative, files, AND the database moduleId link
    onSubmit({ 
      description: structuredNarrative, 
      files, 
      moduleId: selectedModuleId || undefined 
    });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs text-slate-700 animate-in fade-in duration-200">
      
      {/* 🌟 SIMPLE, HUMAN-CENTERED RESOLUTION PROCEDURAL GUIDELINES */}
      <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-1">
          <HelpCircle size={13} className="text-[#2B35AF]" />
          <span>How Your Grade Claim Will Be Processed</span>
        </div>
        
        <p className="text-slate-500 font-normal leading-normal">
          Once submitted, your claim is sent to your assigned lecturer and department head for formal verification. Your issue moves toward complete resolution using these straightforward steps:
        </p>

        <ul className="space-y-2.5 pl-0 list-none font-medium text-slate-600">
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">1. Bank Deposit & Slip Upload:</b> Students are required to pay a non-refundable claim processing fee of <b>5,000 FRW</b> at the bank using the account details below, and attach the clear deposit slip copy to this form.
            </p>
          </li>
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">2. Ledger Sheet Crosscheck:</b> The Head of Department (HOD) will fetch your physical grade booklets and audit them against the official class book sheet ledger entries.
            </p>
          </li>
          <li className="flex gap-2 items-start">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
            <p className="m-0 leading-normal">
              <b className="text-slate-900">3. Resolution & Updates:</b> If a mismatch is discovered, your marks will be updated in the system with full correction details. If no error is found, your original score stands as valid.
            </p>
          </li>
        </ul>
      </div>

      {/* Specialized Grade Metrics Parameter Grid */}
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-2">
          <ClipboardCheck size={13} className="text-[#2B35AF]" />
          <span>Academic Evaluation Parameters</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          
          {/* ◄ NEW: Dynamic Profile Module Selection Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Module / Course *</label>
            {profile ? (
              <select 
                required
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-bold transition"
              >
                <option value="" disabled>-- Select the module from your registry --</option>
                {profile.registeredModules?.length === 0 ? (
                  <option value="" disabled>No active modules found in your registry.</option>
                ) : (
                  profile.registeredModules?.map((reg: any) => (
                    <option key={reg.module.id} value={reg.module.id}>
                      {reg.module.code} - {reg.module.title} (Prof. {reg.module.lecturer?.fullName.split(' ')[1] || 'Unassigned'})
                    </option>
                  ))
                )}
              </select>
            ) : (
              <div className="w-full p-2.5 bg-slate-100 text-slate-400 font-medium italic rounded border border-slate-200 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Syncing academic registry...
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          Justification & Context Summary *
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

      {/* SECURE TEMPLATE BANK DETAILS MATRIX CARD BLOCK */}
      <div className="p-3.5 bg-slate-900 text-slate-100 rounded border border-slate-800 space-y-1.5 shadow-inner">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-400 text-[10px]">
          <Landmark size={12} />
          <span>Official Bank Account Information</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-slate-300 font-mono text-[11px] pt-0.5">
          <div>Bank Name: <b className="text-white">BK (Bank of Kigali)</b></div>
          <div>Account Name: <b className="text-white">University Claims Ledger</b></div>
          <div className="sm:col-span-2">Account Number (RWF): <b className="text-emerald-400 select-all tracking-wide">00095-07743162-44</b></div>
        </div>
      </div>

      {/* Proof Attachments Drag Zone */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Upload Supporting Document (Official Bank Deposit Slip) *
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
          <span className="text-[11px] text-slate-500 block font-medium">Drag deposit slips here or click to browse local files</span>
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
          disabled={isSubmitting || !profile}
          className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition shadow-none border-none cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Dispatch Grade Claim</>}
        </button>
      </div>
    </form>
  );
}