'use client';

import React, { useState } from 'react';
import { CreditCard, Upload, FileText, Send, Loader2 } from 'lucide-react';

interface ProcedureProps {
  cleanService: string;
  isSubmitting: boolean;
  onSubmit: (formData: { description: string; files: File[] }) => void;
}

export default function RegistrationPaymentProcedureForm({ cleanService, isSubmitting, onSubmit }: ProcedureProps) {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Custom State Inputs for Registration & Payment Challenges
  const [issueType, setIssueType] = useState('BANK_NETWORK_FAILURE');
  const [bankName, setBankName] = useState('BK_BANK_OF_KIGALI');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [amountAffected, setAmountAffected] = useState('');

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce the business-specific narrative layout before building payload
    const structuredNarrative = `
[CUSTOM PROCEDURE: REGISTRATION & PAYMENT CHALLENGE]
--------------------------------------------------
* Failure Category: ${issueType.replace(/_/g, ' ')}
* Target Bank Entity: ${bankName.replace(/_/g, ' ')}
* Transaction/Slip Reference: ${transactionReference || 'N/A'}
* Date of Payment Attempt: ${paymentDate || 'N/A'}
* Impacted Currency Amount: RWF ${amountAffected || '0'}

* Student Clarification Statement:
${description}
    `.trim();

    onSubmit({ description: structuredNarrative, files });
  };

  return (
    <form onSubmit={handleSubmitWrapper} className="space-y-5 text-xs animate-in fade-in duration-200">
      
      {/* Specialized Payment Fields Segment */}
      <div className="space-y-4 p-4 bg-slate-50/70 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/60 pb-1.5 mb-2">
          <CreditCard size={13} className="text-[#2B35AF]" />
          <span>Required Payment Breakdown Audit Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nature of system issue *</label>
            <select 
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            >
              <option value="BANK_NETWORK_FAILURE">Bank Gateway Network Timeout / Drop</option>
              <option value="REGISTRATION_PORTAL_CRASH">Registration Portal Down / System Loop</option>
              <option value="UNMAPPED_BANK_SLIP">Bank Slip Deposited But Not Credited</option>
              <option value="PENALTY_DISCREPANCY">Wrong Balance Arrears / Penalty Overcharge</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Bank entity utilized *</label>
            <select 
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] text-slate-800 font-medium"
            >
              <option value="BK_BANK_OF_KIGALI">Bank of Kigali (BK)</option>
              <option value="EQUITY_BANK">Equity Bank Rwanda</option>
              <option value="I_M_BANK">I&M Bank Rwanda</option>
              <option value="COGEBANQUE">Cogebanque</option>
              <option value="URWEGO_BANK">Urwego Bank</option>
              <option value="MTN_MOBILE_MONEY">MTN Mobile Money (MoMo)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount Attempted (RWF) *</label>
            <input 
              required
              type="number" 
              placeholder="e.g., 50000"
              value={amountAffected}
              onChange={(e) => setAmountAffected(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment Date *</label>
            <input 
              required
              type="date" 
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-medium text-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Slip / Txn Ref ID *</label>
            <input 
              required
              type="text" 
              placeholder="Reference No."
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value.toUpperCase())}
              className="w-full p-2.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] font-mono font-bold tracking-wider text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Narrative block */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Detailed Chronological Clarification Narrative *
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide explicit details explaining errors thrown by the registration terminal portal, transaction context timestamps, etc..."
          className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition"
        />
      </div>

      {/* Upload Block */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Upload Proof (Failed Payment Screenshot / Bank Slips) *
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
          <span className="text-[11px] text-slate-500 block font-medium">Drag images/slips here or click to browse</span>
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
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <>Dispatch to Finance Office <Send size={12} /></>}
        </button>
      </div>
    </form>
  );
}