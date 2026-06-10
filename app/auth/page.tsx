'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../config/api';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  MessageSquare, 
  Building2, 
  Phone, 
  HelpCircle, 
  Cpu, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

export default function AuthenticationPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'STAFF' | 'LECTURER'>('STUDENT');
  const [department, setDepartment] = useState<string>('GENERAL_SUPPORT'); 
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Clear saved login sessions when the page first loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      if (token) {
        const cachedRole = localStorage.getItem('user_role');
        if (cachedRole === 'STAFF' || cachedRole === 'ADMIN' || cachedRole === 'LECTURER') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/');
        }
      }
    }
  }, [router]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorNotice(null);
  
    try {
      if (activeTab === 'login') {
        const response = await api.auth.login({ email, password });
        
        localStorage.setItem('uniresolve_token', response.accessToken);
        localStorage.setItem('user_role', response.user.role);
        localStorage.setItem('user_fullName', response.user.fullName);
        localStorage.setItem('user_department', response.user.department || ''); 
  
        if (response.user.role === 'STAFF' || response.user.role === 'ADMIN' || response.user.role === 'LECTURER') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      } else {
        const registrationPayload = {
          fullName,
          email,
          password,
          role,
          phoneNumber, 
          ...((role === 'STAFF' || role === 'LECTURER') && { department }) 
        };

        await api.auth.register(registrationPayload);
        setActiveTab('login');
        setPhoneNumber('');
        setFullName('');
        setPassword('');
        setRole('STUDENT');
        setDepartment('GENERAL_SUPPORT');
        setErrorNotice('Account created successfully! You can now sign in below.');
      }
    } catch (error: any) {
      setErrorNotice(error.message || 'Connection failed. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* HEADER BAR */}
      <header className="bg-[#2B35AF] text-white px-6 md:px-16 py-5 flex justify-between items-center shrink-0 border-b border-white/10 z-10">
        <div className="text-lg font-bold tracking-wider cursor-pointer" onClick={() => router.push('/')}>
          UNIRESOLVE
        </div>
        <div className="text-xs tracking-wider uppercase text-white/80 hidden sm:block">
          Student Issue Management System
        </div>
      </header>

      {/* MAIN SCREEN: INFORMATION + FORM SPLIT */}
      <main className="grow grid grid-cols-1 lg:grid-cols-12 bg-slate-50/50">
        
        {/* LEFT PANEL: HOW IT WORKS INTRO FOR STUDENTS */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#2B35AF] to-indigo-900 text-white p-12 flex-col justify-center space-y-8 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
          
          <div className="space-y-3 relative z-10">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-white/10 text-white px-2.5 py-1 rounded">
              Overview
            </span>
            <h1 className="text-2xl font-serif tracking-wide font-normal leading-tight">
              Connect directly with university staff to solve campus issues.
            </h1>
            <p className="text-xs text-white/70 leading-relaxed font-normal">
              Uniresolve helps you avoid long queues, missing paperwork, and endless trips to campus offices by letting you report and track your challenges entirely online.
            </p>
          </div>

          <hr className="border-white/10" />

          {/* STEP BY STEP SYSTEM GUIDE */}
          <div className="space-y-5 relative z-10 text-xs">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-white/10 rounded shrink-0">
                <HelpCircle size={15} className="text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold tracking-wide">1. Select Your Issue & File Online</h4>
                <p className="text-[11px] text-white/60 leading-normal">
                  Find your specific challenge in our service list—including tuition payment errors, missing marks, student card replacements, or requests for absence. Fill out the quick form and attach your proof documents.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 bg-white/10 rounded shrink-0">
                <Cpu size={15} className="text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold tracking-wide">2. Automatic Delivery to Relevant Staff</h4>
                <p className="text-[11px] text-white/60 leading-normal">
                  The system automatically reviews your request and sends it straight to the specific office that handles it, such as your Head of Department (HOD), the Finance Office, or the Registrar's desk.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 bg-white/10 rounded shrink-0">
                <Clock size={15} className="text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold tracking-wide">3. Live Status Tracking</h4>
                <p className="text-[11px] text-white/60 leading-normal">
                  You will get a unique tracking code for every issue you submit. Use this code on your dashboard to watch updates on your request from "Under Review" to "Resolved."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SIGN IN / REGISTER TABS */}
        <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded p-6 md:p-8 space-y-6 shadow-sm">
            
            <div className="flex border-b border-slate-200 text-sm font-semibold">
              <button 
                type="button"
                onClick={() => { setActiveTab('login'); setErrorNotice(null); }}
                className="w-1/2 pb-3 text-center border-b-2 transition cursor-pointer"
                style={{ borderBottomColor: activeTab === 'login' ? '#2B35AF' : 'transparent', color: activeTab === 'login' ? '#2B35AF' : '#94A3B8' }}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('register'); setErrorNotice(null); }}
                className="w-1/2 pb-3 text-center border-b-2 transition cursor-pointer"
                style={{ borderBottomColor: activeTab === 'register' ? '#2B35AF' : 'transparent', color: activeTab === 'register' ? '#2B35AF' : '#94A3B8' }}
              >
                Create Account
              </button>
            </div>

            {errorNotice && (
              <div className={`p-3 text-xs rounded border text-center font-medium ${errorNotice.includes('complete') || errorNotice.includes('successfully') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {errorNotice}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              
              {activeTab === 'register' && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Official Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="Enter your full official name..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] transition text-slate-800 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">University Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                  <input 
                    required
                    type="email" 
                    placeholder={activeTab === 'login' ? 'student@utab.ac.rw or lecturer@utab.ac.rw' : 'yourname@utab.ac.rw'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] transition text-slate-800 bg-white"
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Mobile Phone Number *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400 z-10" />
                    <span className="absolute inset-y-0 left-9 flex items-center text-slate-400 font-mono font-bold text-[11px]">
                      +250
                    </span>
                    <input 
                      required={activeTab === 'register'}
                      type="tel" 
                      maxLength={9}
                      placeholder="78XXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                      className="w-full pl-18 pr-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] transition text-slate-800 font-mono font-bold tracking-wider bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] transition text-slate-800 bg-white"
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <>
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">I am registering as a:</label>
                    <select 
                      value={role} 
                      onChange={(e) => {
                        const nextRole = e.target.value as 'STUDENT' | 'STAFF' | 'LECTURER';
                        setRole(nextRole);
                        setDepartment(nextRole === 'LECTURER' ? 'COMPUTER_SCIENCE' : 'GENERAL_SUPPORT');
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white transition text-xs text-slate-800 font-medium"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="LECTURER">Lecturer / Academic Instructor</option>
                      <option value="STAFF">University Office Staff Member</option>
                    </select>
                  </div>

                  {(role === 'STAFF' || role === 'LECTURER') && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {role === 'LECTURER' ? 'Assigned Faculty / Department *' : 'Assigned Office / Department Desk *'}
                      </label>
                      <div className="relative">
                        <Building2 size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400 z-10" />
                        <select 
                          required
                          value={department} 
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-9 pr-4 p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white transition text-xs text-slate-800 font-bold"
                        >
                          {role === 'LECTURER' ? (
                            <>
                              <option value="COMPUTER_SCIENCE">Department of Computer Science</option>
                              <option value="SOFTWARE_ENGINEERING">Department of Software Engineering</option>
                              <option value="CIVIL_ENGINEERING">Department of Civil Engineering</option>
                              <option value="BUSINESS_ADMINISTRATION">Faculty of Business & Economics</option>
                            </>
                          ) : (
                            <>
                              <option value="REGISTRAR">Registrar Office Desk</option>
                              <option value="FINANCE">Finance & Accounts Desk</option>
                              <option value="FACULTY_HOD">Faculty Head of Department (HOD)</option>
                              <option value="CAMPUS_OPERATIONS">Campus Operations Desk</option>
                              <option value="ESTATE_MANAGEMENT">Estate Management Office</option>
                              <option value="GENERAL_SUPPORT">General Support Helpdesk</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#2B35AF] hover:bg-blue-800 disabled:bg-blue-300 text-white font-bold py-3 rounded transition flex justify-center items-center gap-2 uppercase tracking-wide cursor-pointer mt-6 shadow-none border-none"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</> <ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#2B35AF] text-white/80 text-xs px-8 md:px-16 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 shrink-0 z-10">
        <div>© Copyright 2026 Uniresolve System Platform. All Rights Reserved.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition flex items-center gap-1"><MessageSquare size={12} /> Support Centre</a>
          <a href="#" className="hover:text-white transition">Terms of Use</a>
          <a href="#" className="hover:text-white transition flex items-center gap-1"><ShieldCheck size={12} /> System Status</a>
        </div>
      </footer>
    </div>
  );
}