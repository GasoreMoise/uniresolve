'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Send, Upload, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../../../config/api';

export default function DedicatedApplicationTerminal() {
  const params = useParams();
  const router = useRouter();
  
  // Clean URL text variables into readable titles (e.g., "retake-payment" -> "RETAKE PAYMENT")
  const cleanCategory = String(params.category || '').replace(/-/g, ' ').toUpperCase();
  const cleanService = String(params.serviceName || '').replace(/-/g, ' ').toUpperCase();

  // Form Processing States
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verification Access Shield
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      if (!token) {
        // Drop unauthenticated traffic straight back to the auth splash gate
        router.push('/auth');
      }
    }
  }, [router]);

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Recover contextual parameters from path configuration definitions
      const isInternational = cleanCategory.includes('INTERNATIONAL');
      
      // 2. Standardize loose URL parameters back into your strict Prisma enum profiles
      let databaseCategoryEnum = 'ADMINISTRATIVE_OPERATIONAL_REQUESTS';
      if (cleanCategory.includes('ACADEMIC')) databaseCategoryEnum = 'ACADEMIC_PROGRESSION_VERIFICATION';
      if (cleanCategory.includes('FINANCIAL')) databaseCategoryEnum = 'FINANCIAL_GATEWAYS';
      if (cleanCategory.includes('EXTERNAL')) databaseCategoryEnum = 'DIRECT_SUPPORT_EXTERNAL_COMPLIANCE';

      // 3. Dispatch payload components directly to your active NestJS engine
      const response = await api.tickets.create({
        category: databaseCategoryEnum,
        serviceName: cleanService,
        description: description,
        isInternational: isInternational.toString()
      });

      // 4. Capture your verified entry short code response
      setTrackingCode(response.trackingCode);
    } catch (error: any) {
      setErrorMessage(error.message || ' Handshake failure. Could not commit application logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* HEADER CONTROLLER */}
      <header className="bg-[#2B35AF] text-white px-8 md:px-16 py-5 flex justify-between items-center shrink-0">
        <div className="text-lg font-bold tracking-wider cursor-pointer" onClick={() => router.push('/')}>
          UNIRESOLVE
        </div>
        <button 
          onClick={() => router.push('/')} 
          className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-transparent border-none cursor-pointer transition"
        >
          <ArrowLeft size={14} /> Return to Hub
        </button>
      </header>

      {/* CORE WORKSPACE SURFACE */}
      <main className="grow max-w-2xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded p-6 md:p-8 space-y-6">
          
          {!trackingCode ? (
            <>
              {/* Context Header */}
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#2B35AF] tracking-widest uppercase block mb-1">
                  Scope: {cleanCategory}
                </span>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="text-[#2B35AF]" size={22} /> Form Terminal: {cleanService}
                </h1>
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" /> {errorMessage}
                </div>
              )}

              {/* Transaction Input Processing Form */}
              <form onSubmit={handleFormSubmission} className="space-y-5 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Official Claim Justification Narrative *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a clear, detailed, and chronological account supporting this administrative request..."
                    className="w-full text-sm p-3 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white text-slate-800 transition font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Supporting Proof Document Attachments
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded p-5 text-center bg-slate-50 hover:bg-slate-100/50 transition relative">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFilePicker} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                    />
                    <Upload size={24} className="mx-auto text-slate-300 mb-1" />
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Drag files here or click to browse local storage
                    </span>
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
                    className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer border-none transition shadow-none"
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>Submit Case File <Send size={12} /></>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* SECURE TRANSACTION REGISTRY SUCCESS SCREEN */
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex justify-center items-center mx-auto border border-green-100">
                <CheckCircle size={28} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">Case Successfully Registered</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your claim has bypassed filters and been cleanly stored within the MySQL server database cluster. Use the tracking identifier below on the home panel to verify processing logs.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 font-mono text-base font-bold tracking-widest py-2.5 px-6 rounded inline-block text-[#2B35AF]">
                {trackingCode}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => router.push('/')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded text-xs uppercase tracking-widest cursor-pointer border-none transition"
                >
                  Return to Dashboard Hub
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] px-8 py-5 text-center shrink-0">
        © Copyright 2026 Uniresolve System Platform. All Rights Reserved.
      </footer>

    </div>
  );
}