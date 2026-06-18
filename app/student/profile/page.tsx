'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, BookOpen, Building2, CheckCircle2, XCircle, Calendar, GraduationCap, MapPin, Award } from 'lucide-react';
import { api } from '../../../config/api'; // Adjust path if needed

interface Grade {
  moduleId: string;
  finalScore: number | null; // ◄ UPDATED: Mapped to the new finalScore database field
  status: string;
}

interface Module {
  id: string; // ◄ Needed to map grades
  code: string;
  title: string;
  credits: number;
  lecturer: {
    fullName: string;
    email: string;
  };
}

interface ModuleRegistration {
  enrollmentType: string;
  academicYear: string;
  module: Module;
}

interface StudentProfileData {
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
    grades: Grade[]; // ◄ Injected grades
  };
  registrationNumber: string;
  nationalId: string;
  dateOfBirth: string;
  campusLocation: string;
  college: string;
  program: string;
  academicYear: string;
  level: number;
  sponsorshipType: string;
  isFinanciallyCleared: boolean;
  accommodationStatus: string;
  registeredModules: ModuleRegistration[];
}

export default function StudentProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.profile.getMe();
        setProfile(data);
      } catch (error) {
        console.error('Failed to sync profile matrix', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#2B35AF] flex items-center justify-center font-mono text-xs text-white/50">
        Syncing academic ledger...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-sans p-6">
        <div className="bg-white p-8 rounded shadow-sm border border-slate-200 text-center max-w-md">
          <XCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Academic Profile Unlinked</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Your login credentials are valid, but your institutional academic matrix has not yet been synchronized with this account.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#2B35AF] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded text-xs transition border-none cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2B35AF] flex items-center gap-2">
            <User size={24} /> Institutional Identity
          </h1>
          <button 
            onClick={() => router.push('/')}
            className="text-sm text-slate-500 hover:text-[#2B35AF] font-bold transition"
          >
            ← Back to Hub
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Identity Card */}
          <div className="col-span-1 bg-white rounded shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#2B35AF] mx-auto mb-4">
              <User size={32} />
            </div>
            <div className="text-center border-b border-slate-100 pb-4">
              <h2 className="font-bold text-lg text-slate-900">{profile.user.fullName}</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">Roll No: {profile.registrationNumber}</p>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Email</span>
                <span className="font-medium">{profile.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                <span className="font-medium">{profile.user.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Finance Status</span>
                {profile.isFinanciallyCleared ? (
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-bold">
                    <CheckCircle2 size={12} /> CLEARED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 font-bold">
                    <XCircle size={12} /> OUTSTANDING
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Academic Progression Matrix */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="bg-white rounded shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building2 size={14} /> Enrollment Logistics
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">College</span>
                  <span className="font-semibold text-slate-800">{profile.college}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Program</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5"><GraduationCap size={14} className="text-[#2B35AF]" /> {profile.program}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Campus</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {profile.campusLocation}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Academic Level</span>
                  <span className="font-semibold text-slate-800">Year {profile.level} ({profile.academicYear})</span>
                </div>
              </div>
            </div>

            {/* Registered Modules & Grades Ledger */}
            <div className="bg-white rounded shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={14} /> Active Module Registrations & Grades
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-100">
                      <th className="py-3 px-4 font-bold">Module</th>
                      <th className="py-3 px-4 font-bold">Professor</th>
                      <th className="py-3 px-4 font-bold text-center">Attempt</th>
                      <th className="py-3 px-4 font-bold text-right">Standing Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profile.registeredModules.map((reg, idx) => {
                      // Map the exact grade to this module row
                      const moduleGrade = profile.user.grades?.find(g => g.moduleId === reg.module.id);
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-[#2B35AF]">{reg.module.code}</div>
                            <div className="font-semibold text-slate-700 mt-0.5">{reg.module.title}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {reg.module.lecturer?.fullName || 'Unassigned'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-[9px] font-black tracking-wider border inline-block ${
                              reg.enrollmentType === 'FIRST_ATTEMPT' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {reg.enrollmentType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {/* ◄ UPDATED: Checking and rendering finalScore instead of score */}
                            {moduleGrade && moduleGrade.finalScore !== null ? (
                              <div className="inline-flex items-center gap-1.5 font-mono font-bold text-lg text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                <Award size={14} /> {moduleGrade.finalScore}%
                              </div>
                            ) : (
                              <span className="text-slate-400 font-medium italic text-[10px] uppercase tracking-wider">Awaiting Marks</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}