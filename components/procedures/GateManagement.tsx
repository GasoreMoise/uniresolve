'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, FileText, Send, Loader2 } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function GateManagementProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [accessScope, setAccessScope] = useState('VEHICLE_PARKING_TAG');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [clearanceID, setClearanceID] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    const structuredNarrative = `
[CUSTOM PROCEDURE: SECURITY GATE & INFRASTRUCTURE]
--------------------------------------------------
* Access Discrepancy Vector: ${accessScope.replace(/_/g, ' ')}
* Target Vehicle Identification Plate: ${vehiclePlate.toUpperCase() || 'N/A'}
* Student/Staff Clearance Tag Identifier: ${clearanceID.toUpperCase() || 'N/A'}

* Incident / Issue Description:
${description}
    `.trim();
    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-4 text-xs animate-in fade-in duration-200">
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase border-b pb-1.5">
          <ShieldCheck size={13} className="text-[#2B35AF]" />
          <span>Security Clearance Audit Variables</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Access Issue Profile *</label>
            <select value={accessScope} onChange={(e) => setAccessScope(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800">
              <option value="VEHICLE_PARKING_TAG">Vehicle Access/Parking Tag Mismatch</option>
              <option value="BIOMETRIC_TURNSTILE">Turnstile/Biometric Gate Error</option>
              <option value="LAB_FACILITY_LOCKOUT">After-Hours Laboratory Access Card</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Vehicle Plate No. (If Applicable)</label>
            <input type="text" placeholder="e.g., RAC 123 A" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-mono" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-500">Existing Access Tag No.</label>
            <input type="text" placeholder="e.g., ID-TAG-409" value={clearanceID} onChange={(e) => setClearanceID(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 font-mono" />
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Detailed Chronological Incident Account *</label>
        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide explicit details highlighting dates, times, or barcode numbers denied clearance at the physical gate infrastructure boundaries..." className="w-full text-sm p-3 border border-slate-300 rounded bg-white text-slate-800 font-sans" />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase text-slate-400">Supporting Attachment Proof (e.g., Security Slip / Registration Receipt)</label>
        <div className="border-2 border-dashed border-slate-200 rounded p-4 text-center bg-slate-50 hover:bg-slate-100 relative">
          <input type="file" multiple onChange={handleFilePicker} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
          <span className="text-[11px] text-slate-500 block font-medium">Click or drag local files to submit proof</span>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 border-none transition">
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Log Security Ticket <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}