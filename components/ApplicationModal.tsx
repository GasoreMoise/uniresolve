'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Info, Clock, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { proceduresRegistry, defaultProcedure } from '../config/procedures';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  categoryTitle: string;
}

export default function ApplicationModal({ isOpen, onClose, serviceName, categoryTitle }: ApplicationModalProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      setIsLoggedIn(!!token);
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const activeProcedure = proceduresRegistry[serviceName] || defaultProcedure;

  // Formats text entities safely for dynamic routing (e.g., "Retake Payment" -> "retake-payment")
  const convertToSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleProceedToForm = () => {
    const categorySlug = convertToSlug(categoryTitle);
    const serviceSlug = convertToSlug(serviceName);
    window.location.href = `/apply/${categorySlug}/${serviceSlug}`;
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex justify-center items-center p-4 z-[99999] pointer-events-auto select-none">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl h-auto flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-[#2B35AF] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">
              {categoryTitle} • Policy Profile
            </span>
            <h3 className="text-xl font-bold tracking-tight">Resolution Blueprint: {serviceName}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* POLICY INFRASTRUCTURE BODY */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 bg-white">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-[#2B35AF] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900 tracking-wide uppercase">Resolution Steps</h4>
              <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
                {activeProcedure.steps.map((step, idx) => <li key={idx}>{step}</li>)}
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-[#2B35AF] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">Expected SLA Window</h4>
                <p className="text-slate-600 font-medium mt-1">{activeProcedure.sla}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#2B35AF] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">Required Claim Audit Proof</h4>
                <ul className="list-disc pl-4 space-y-1 leading-relaxed text-slate-600 mt-1">
                  {activeProcedure.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 text-amber-900 p-4 rounded border border-amber-200/50 text-[11px] leading-relaxed">
            <span className="font-bold">Institutional Rule Notice:</span> {activeProcedure.notice}
          </div>
        </div>

        {/* COMPLIANCE FOOTER ACTION BAR */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
          {!isLoggedIn ? (
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Lock size={14} className="text-amber-600" /> Authentication is required to fill submission forms.
              </span>
              <button 
                onClick={() => window.location.href = '/auth'}
                className="w-full sm:w-auto bg-[#2B35AF] hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-6 rounded transition flex justify-center items-center gap-2 uppercase tracking-wide cursor-pointer border-none"
              >
                Sign In to Continue <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleProceedToForm}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-6 rounded transition flex justify-center items-center gap-2 uppercase tracking-wide cursor-pointer border-none"
            >
              Open Dedicated Request Form <ArrowRight size={14} />
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}