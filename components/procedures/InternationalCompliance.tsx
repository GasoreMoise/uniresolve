'use client';

import React, { useState } from 'react';
import { Globe, Upload, FileText, Send, Loader2 } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function InternationalComplianceProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [originCountry, setOriginCountry] = useState('Democratic Republic of Congo');
  const [passportNumber, setPassportNumber] = useState('');
  const [equivalenceTrackingCode, setEquivalenceTrackingCode] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    const structuredNarrative = `
[CUSTOM PROCEDURE: INTERNATIONAL STATUS & RECOGNITION EQUIVALENCE]
--------------------------------------------------
* Context Target Service: ${cleanService}
* Nation of Profile Origin: ${originCountry}
* Travel Passport Number: ${passportNumber.toUpperCase() || 'N/A'}
* High Council / HEC Equivalence Ref: ${equivalenceTrackingCode.toUpperCase() || 'N/A'}

* Visa / Legal / Admission Equivalence Statement:
${description}
    `.trim();
    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase border-b pb-1.5">
          <Globe size={13} className="text-indigo-600" />
          <span>International Status Registry Metrics</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Country of Origin *</label>
            <input required type="text" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Passport Number *</label>
            <input required type="text" placeholder="Travel Document ID" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-mono uppercase font-bold" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">HEC Equivalence Tracking No.</label>
            <input type="text" placeholder="If matching diploma equivalence link" value={equivalenceTrackingCode} onChange={(e) => setEquivalenceTrackingCode(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-mono" />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Detailed Compliance Case Description *</label>
        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide background regarding visa approval status issues, translated qualification structures, or certificate equivalence delay challenges..." className="w-full text-sm p-3 border border-slate-300 rounded bg-white text-slate-800 font-sans" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Upload Foreign Credentials / Embassy Letters / Passport Copies *</label>
        <div className="border-2 border-dashed border-slate-200 rounded p-4 text-center bg-slate-50 hover:bg-slate-100 relative">
          <input type="file" multiple required={files.length === 0} onChange={handleFilePicker} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
          <span className="text-[11px] text-slate-500 block font-medium">Click or drag local files to submit verification sheets</span>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 border-none transition">
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Log Compliance Case <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}