'use client';

import React, { useState } from 'react';
import { api } from '../../config/api';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Loader2, MessageSquare, Building2 } from 'lucide-react';

export default function AuthenticationPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [department, setDepartment] = useState<string>('GENERAL_SUPPORT'); // Default desk fallback
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorNotice(null);
  
    try {
      if (activeTab === 'login') {
        const response = await api.auth.login({ email, password });
        
        // Securely cache the signed session token and metadata profiles
        localStorage.setItem('uniresolve_token', response.accessToken);
        localStorage.setItem('user_role', response.user.role);
        localStorage.setItem('user_fullName', response.user.fullName);
        // Persist the verified department value so back-office queues filter automatically
        localStorage.setItem('user_department', response.user.department || ''); 
  
        if (response.user.role === 'STAFF' || response.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        // Build payload dynamically based on selected role
        const registrationPayload = {
          fullName,
          email,
          password,
          role,
          ...(role === 'STAFF' && { department }) // Only send department if registering as staff
        };

        await api.auth.register(registrationPayload);
        setActiveTab('login');
        setErrorNotice('Registration complete. Secure credentials stored. Please sign in.');
      }
    } catch (error: any) {
      setErrorNotice(error.message || 'Network handshake timeout. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* HEADER NAVBAR */}
      <header className="bg-[#2B35AF] text-white px-8 md:px-16 py-5 flex justify-between items-center shrink-0">
        <div className="text-lg font-bold tracking-wider cursor-pointer" onClick={() => router.push('/')}>
          UNIRESOLVE
        </div>
        <div className="text-xs font-mono tracking-wider uppercase text-white/80">
          Secure Gateway Terminal
        </div>
      </header>

      {/* MAIN AUTHENTICATION CARD BLOCK */}
      <main className="grow flex items-center justify-center px-4 py-12 bg-slate-50/50">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded p-6 md:p-8 space-y-6 shadow-sm">
          
          {/* Form Selection Tabs */}
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <button 
              type="button"
              onClick={() => { setActiveTab('login'); setErrorNotice(null); }}
              className={`w-1/2 pb-3 text-center border-b-2 transition cursor-pointer ${activeTab === 'login' ? 'border-[#2B35AF] text-[#2B35AF]' : 'border-transparent text-slate-400'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setActiveTab('register'); setErrorNotice(null); }}
              className={`w-1/2 pb-3 text-center border-b-2 transition cursor-pointer ${activeTab === 'register' ? 'border-[#2B35AF] text-[#2B35AF]' : 'border-transparent text-slate-400'}`}
            >
              Create Account
            </button>
          </div>

          {errorNotice && (
            <div className={`p-3 text-xs rounded border text-center font-medium ${errorNotice.includes('complete') || errorNotice.includes('successfully') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {errorNotice}
            </div>
          )}

          {/* Form Processing Core */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            
            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Official Name *</label>
                <div className="relative">
                  <User size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your registration name..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] transition text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Institutional Email Address *</label>
              <div className="relative">
                <Mail size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                <input 
                  required
                  type="email" 
                  placeholder={activeTab === 'login' ? 'student@utab.ac.rw or hod@utab.ac.rw' : 'yourname@utab.ac.rw'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] transition text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Security Access Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] transition text-slate-800"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <>
                {/* Account Role Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Account Role Specification</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as 'STUDENT' | 'STAFF')}
                    className="w-full p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white transition text-xs text-slate-800 font-medium"
                  >
                    <option value="STUDENT">Student Enrollment Identity</option>
                    <option value="STAFF">University Departmental Desk Staff</option>
                  </select>
                </div>

                {/* Conditional Dropdown: Only renders when registering as a staff member */}
                {role === 'STAFF' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Assigned Department Desk *
                    </label>
                    <div className="relative">
                      <Building2 size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400 z-10" />
                      <select 
                        required
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-4 p-2.5 border border-slate-300 rounded focus:outline-none focus:border-[#2B35AF] bg-white transition text-xs text-slate-800 font-bold"
                      >
                        <option value="REGISTRAR">Registrar Office Desk</option>
                        <option value="FINANCE">Finance & Accounts Desk</option>
                        <option value="FACULTY_HOD">Faculty Head of Department (HOD)</option>
                        <option value="CAMPUS_OPERATIONS">Campus Operations Desk</option>
                        <option value="ESTATE_MANAGEMENT">Estate Management Corridor</option>
                        <option value="GENERAL_SUPPORT">General Support Central Helpdesk</option>
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
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  {activeTab === 'login' ? 'Authenticate Session' : 'Register Credentials'} <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#2B35AF] text-white/80 text-xs px-8 md:px-16 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 shrink-0">
        <div>© Copyright 2026 Uniresolve. All Rights Reserved.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition flex items-center gap-1"><MessageSquare size={12} /> Support Centre</a>
          <a href="#" className="hover:text-white transition">Terms of Use</a>
          <a href="#" className="hover:text-white transition flex items-center gap-1"><ShieldCheck size={12} /> System Status</a>
        </div>
      </footer>

    </div>
  );
}