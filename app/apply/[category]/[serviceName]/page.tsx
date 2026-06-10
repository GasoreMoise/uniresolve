'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  ShieldAlert, 
  Landmark, 
  UserCheck, 
  GraduationCap, 
  ClipboardCheck, 
  Calendar, 
  Award, 
  ShieldCheck, 
  CalendarRange, 
  FileSpreadsheet, 
  Globe 
} from 'lucide-react';
import { api } from '../../../../config/api';

// IMPORT DECOUPLED PROCEDURE FORMS
import RegistrationPaymentProcedureForm from '../../../../components/procedures/RegistrationPayment';
import CardReplacementProcedureForm from '../../../../components/procedures/CardReplacement';
import SpecialAssessmentProcedureForm from '../../../../components/procedures/SpecialAssessment';
import AssessmentClaimProcedureForm from '../../../../components/procedures/AssessmentClaim';
import AbsencePermissionProcedureForm from '../../../../components/procedures/AbsencePermission';
import RecommendationLetterProcedureForm from '../../../../components/procedures/RecommendationLetter';
import GateManagementProcedureForm from '../../../../components/procedures/GateManagement';
import ClassAllocationProcedureForm from '../../../../components/procedures/ClassAllocation';
import TranscriptRequestProcedureForm from '../../../../components/procedures/TranscriptRequest';
import InternationalComplianceProcedureForm from '../../../../components/procedures/InternationalCompliance';
import GenericProcedureForm from '../../../../components/procedures/GenericProcedure';

export default function DedicatedApplicationTerminal() {
  const params = useParams();
  const router = useRouter();
  
  const cleanCategory = String(params.category || '').replace(/-/g, ' ').toUpperCase();
  const cleanService = String(params.serviceName || '').replace(/-/g, ' ').toUpperCase();

  // Route identifier evaluation locks
  const isFinancialGateway = params.serviceName === 'registration-payment' || params.serviceName === 'retake-payment' || cleanCategory.includes('FINANCIAL');
  const isCardReplacement = params.serviceName === 'card-replacement';
  const isSpecialAssessment = params.serviceName === 'special-quiz' || params.serviceName === 'special-cat' || params.serviceName === 'special-exam';
  const isAssessmentClaim = params.serviceName === 'cat-claim' || params.serviceName === 'exam-claims';
  const isAbsencePermission = params.serviceName === 'permission-request';
  
  // NEWLY ADDED COUPLING EVALUATIONS
  const isRecommendation = params.serviceName === 'letter-of-recommendation';
  const isGateManagement = params.serviceName === 'gate-management';
  const isClassAllocation = params.serviceName === 'class-allocation';
  const isTranscriptRequest = params.serviceName === 'transcript-request';
  const isInternationalCompliance = cleanCategory.includes('INTERNATIONAL');

  // Unified Handling States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      if (!token) {
        localStorage.clear();
        router.replace('/auth');
        return;
      }
      setIsVerifying(false);
    }
  }, [router]);

  const handleProcedureSubmit = async (formData: { description: string; files: File[] }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const isInternational = cleanCategory.includes('INTERNATIONAL');
      
      let databaseCategoryEnum = 'ADMINISTRATIVE_OPERATIONAL_REQUESTS';
      if (cleanCategory.includes('ACADEMIC') || cleanCategory.includes('PROGRESSION') || isSpecialAssessment || isAssessmentClaim) {
        databaseCategoryEnum = 'ACADEMIC_PROGRESSION_VERIFICATION';
      }
      if (isFinancialGateway) databaseCategoryEnum = 'FINANCIAL_GATEWAYS';
      if (cleanCategory.includes('COMPLIANCE') || cleanCategory.includes('EXTERNAL') || isInternationalCompliance) {
        databaseCategoryEnum = 'DIRECT_SUPPORT_EXTERNAL_COMPLIANCE';
      }

      const payload = new FormData();
      payload.append('category', databaseCategoryEnum);
      payload.append('serviceName', cleanService);
      payload.append('description', formData.description);
      payload.append('isInternational', isInternational.toString());

      formData.files.forEach((file) => {
        payload.append('attachments', file);
      });

      const response = await api.tickets.create(payload);
      setTrackingCode(response.trackingCode);
    } catch (error: any) {
      setErrorMessage(error.message || 'Handshake failure. Could not commit application logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-400">
        Verifying terminal endpoint clearance matrix...
      </div>
    );
  }

  // Compute adaptive feedback descriptions for the success portal layout screen
  const getSuccessNoticeMessage = () => {
    if (isAbsencePermission) return "Your permission parameter data has bypassed filtering layers and committed cleanly to the ledger stream node as a valid, official record.";
    if (isFinancialGateway) return "Your transaction network failure report has been cleanly captured and routed directly onto the Finance & Accounts Desk.";
    if (isRecommendation) return "Your recommendation request profile details have been locked and submitted to your Head of Department for review.";
    if (isClassAllocation) return "Timetable conflict matrices successfully logged. An allocation alert has been signaled to the Registrar Office.";
    return "Your claim has bypassed filters and been cleanly stored within the database ledger cluster.";
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      <header className="bg-[#2B35AF] text-white px-8 md:px-16 py-5 flex justify-between items-center shrink-0">
        <div className="text-lg font-bold tracking-wider cursor-pointer" onClick={() => router.push('/')}>
          UNIRESOLVE
        </div>
        <button onClick={() => router.push('/')} className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-transparent border-none cursor-pointer transition">
          <ArrowLeft size={14} /> Return
        </button>
      </header>

      <main className="grow max-w-2xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded p-6 md:p-8 space-y-6 shadow-sm">
          
          {!trackingCode ? (
            <>
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-[#2B35AF] tracking-widest uppercase block mb-1">
                  Scope: {cleanCategory}
                </span>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {isFinancialGateway && <Landmark className="text-[#2B35AF]" size={22} />}
                  {isCardReplacement && <UserCheck className="text-[#2B35AF]" size={22} />}
                  {isSpecialAssessment && <GraduationCap className="text-[#2B35AF]" size={22} />}
                  {isAssessmentClaim && <ClipboardCheck className="text-[#2B35AF]" size={22} />}
                  {isAbsencePermission && <Calendar className="text-[#2B35AF]" size={22} />}
                  {isRecommendation && <Award className="text-[#2B35AF]" size={22} />}
                  {isGateManagement && <ShieldCheck className="text-[#2B35AF]" size={22} />}
                  {isClassAllocation && <CalendarRange className="text-[#2B35AF]" size={22} />}
                  {isTranscriptRequest && <FileSpreadsheet className="text-[#2B35AF]" size={22} />}
                  {isInternationalCompliance && <Globe className="text-indigo-600" size={22} />}
                  {!isFinancialGateway && !isCardReplacement && !isSpecialAssessment && !isAssessmentClaim && !isAbsencePermission && !isRecommendation && !isGateManagement && !isClassAllocation && !isTranscriptRequest && !isInternationalCompliance && <FileText className="text-[#2B35AF]" size={22} />}
                  {cleanService}
                </h1>
                {isAbsencePermission && (
                  <p className="text-[11px] text-slate-400 font-normal mt-1 leading-relaxed">
                    This file writes directly to the immutable institutional archive and is automatically broadcasted to all relevant department chairs and administrative desks.
                  </p>
                )}
                {isFinancialGateway && (
                  <p className="text-[11px] text-slate-400 font-normal mt-1 leading-relaxed">
                    This claim is routed through secure filters directly onto the Finance & Accounts Desk for instant reconciliation.
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" /> {errorMessage}
                </div>
              )}

              {/* DYNAMIC PIPELINE ROUTER PORTS SWITCH */}
              {isFinancialGateway ? (
                <RegistrationPaymentProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isCardReplacement ? (
                <CardReplacementProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isSpecialAssessment ? (
                <SpecialAssessmentProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isAssessmentClaim ? (
                <AssessmentClaimProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isAbsencePermission ? (
                <AbsencePermissionProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isRecommendation ? (
                <RecommendationLetterProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isGateManagement ? (
                <GateManagementProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isClassAllocation ? (
                <ClassAllocationProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isTranscriptRequest ? (
                <TranscriptRequestProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : isInternationalCompliance ? (
                <InternationalComplianceProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              ) : (
                <GenericProcedureForm 
                  cleanService={cleanService}
                  isSubmitting={isSubmitting}
                  onSubmit={handleProcedureSubmit}
                />
              )}
            </>
          ) : (
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex justify-center items-center mx-auto border border-green-100">
                <CheckCircle size={28} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">Request Successfully Logged</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {getSuccessNoticeMessage()}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 font-mono text-base font-bold tracking-widest py-2.5 px-6 rounded inline-block text-[#2B35AF]">
                {trackingCode}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button onClick={() => router.push('/')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded text-xs uppercase tracking-widest transition">
                  Return to Dashboard Hub
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-[11px] px-8 py-5 text-center shrink-0">
        © Copyright 2026 Uniresolve System Platform. All Rights Reserved.
      </footer>
    </div>
  );
}