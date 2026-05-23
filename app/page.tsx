'use client';

import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, ShieldCheck, User, LogIn, LogOut, Clock } from 'lucide-react';
import { servicesData } from '../config/services';
import ApplicationModal from '../components/ApplicationModal';

interface UserSession {
  fullName: string;
  role: string;
}

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      const fullName = localStorage.getItem('user_fullName');
      const role = localStorage.getItem('user_role');
      
      if (token && fullName && role) {
        setSession({ fullName, role });
      }
    }
  }, []);

  const openApplication = (serviceName: string, categoryTitle: string) => {
    setSelectedService(serviceName);
    setSelectedCategory(categoryTitle);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setSession(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans overflow-x-hidden select-none">
      
      {/* ==========================================
          HEADER NAVBAR SECTION (Dynamic Session Aware)
         ========================================== */}
      <header className="bg-[#2B35AF] text-white px-8 md:px-16 py-5 flex justify-between items-center shrink-0">
        <div className="text-lg font-bold tracking-wider cursor-pointer" onClick={() => window.location.href = '/'}>
          UNIRESOLVE
        </div>
        <nav className="flex items-center gap-8 text-sm font-normal text-white/90">
          <a href="#" className="flex items-center gap-1 hover:text-white transition">
            <MessageSquare size={16} /> Support Centre
          </a>

          {!session ? (
            <>
              <a href="/auth" className="flex items-center gap-1 hover:text-white transition">
                <User size={16} /> Register
              </a>
              <a href="/auth" className="flex items-center gap-1 hover:text-white transition">
                <LogIn size={16} /> Login
              </a>
            </>
          ) : (
            <div className="flex items-center gap-6">
              {/* Dynamic Shortcut Link directing users to their real-time SQL tracking table */}
              <a 
                href="/history" 
                className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition font-medium tracking-wide no-underline"
              >
                <Clock size={14} /> View Case Queue
              </a>

              <span className="text-xs bg-white/10 px-3 py-1 rounded font-mono tracking-wide">
                👋 {session.fullName.split(' ')[0]} ({session.role})
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs py-1.5 px-3 rounded transition uppercase tracking-wider cursor-pointer border-none"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* ==========================================
          HERO BANNER & SEARCH BAR
         ========================================== */}
      <section className="bg-[#2B35AF] text-white pt-12 pb-24 px-8 text-center shrink-0">
        <h1 className="text-4xl font-normal mb-8 tracking-wide">Welcome</h1>
        <div className="max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Enter keyword to search for services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded text-slate-900 bg-white focus:outline-none transition text-sm shadow-none border-none"
          />
        </div>
      </section>

      {/* ==========================================
          MAIN FIXED MATRIX CATEGORIES GRID AREA
         ========================================== */}
      <main className="w-full max-w-6xl mx-auto px-8 md:px-16 py-16 space-y-20">
        
        {/* -- SECTION A: RWANDAN STUDENTS -- */}
        <div className="space-y-12">
          <h2 className="text-2xl font-bold text-slate-900 tracking-wide">Rwandan Students</h2>
          
          <div className="space-y-12">
            {servicesData.map((category) => {
              const items = category.items;
              const col1 = items.slice(0, 3);
              const col2 = items.slice(3, 5);
              const col3 = items.slice(5);

              return (
                <div key={category.title} className="space-y-6">
                  <h3 className="text-sm font-semibold text-[#2B35AF] tracking-wide border-b border-slate-100 pb-2">
                    {category.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-y-0 text-sm">
                    <div className="flex flex-col gap-3 pr-4">
                      {col1.map((item) => (
                        <button
                          key={item.id}
                          className="text-left text-slate-800 hover:text-[#2B35AF] hover:underline transition cursor-pointer touch-manipulation"
                          onClick={() => openApplication(item.name, category.title)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 md:border-l md:border-slate-300 md:pl-6 pr-4">
                      {col2.map((item) => (
                        <button
                          key={item.id}
                          className="text-left text-slate-800 hover:text-[#2B35AF] hover:underline transition cursor-pointer touch-manipulation"
                          onClick={() => openApplication(item.name, category.title)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 md:border-l md:border-slate-300 md:pl-6">
                      {col3.map((item) => (
                        <button
                          key={item.id}
                          className="text-left text-slate-800 hover:text-[#2B35AF] hover:underline transition cursor-pointer touch-manipulation"
                          onClick={() => openApplication(item.name, category.title)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* -- SECTION B: INTERNATIONAL STUDENTS -- */}
        <div className="space-y-12 pt-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-wide">International Students</h2>
          
          <div className="space-y-12">
            {servicesData.map((category) => {
              const items = category.items;
              const col1 = items.slice(0, 3);
              const col2 = items.slice(3, 5);
              const col3 = items.slice(5);

              return (
                <div key={`int-${category.title}`} className="space-y-6">
                  <h3 className="text-sm font-semibold text-[#2B35AF] tracking-wide border-b border-slate-100 pb-2">
                    {category.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-y-0 text-sm">
                    <div className="flex flex-col gap-3 pr-4">
                      {col1.map((item) => (
                        <button
                          key={`int-${item.id}`}
                          className="text-left text-slate-800 hover:text-[#2B35AF] hover:underline transition cursor-pointer touch-manipulation"
                          onClick={() => openApplication(item.name, `International - ${category.title}`)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 md:border-l md:border-slate-300 md:pl-6 pr-4">
                      {col2.map((item) => (
                        <button
                          key={`int-${item.id}`}
                          className="text-left text-slate-800 hover:text-[#2B35AF] hover:underline transition cursor-pointer touch-manipulation"
                          onClick={() => openApplication(item.name, `International - ${category.title}`)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 md:border-l md:border-slate-300 md:pl-6">
                      {col3.map((item) => (
                        <button
                          key={`int-${item.id}`}
                          className="text-left text-slate-800 hover:text-[#2B35AF] hover:underline transition cursor-pointer touch-manipulation"
                          onClick={() => openApplication(item.name, `International - ${category.title}`)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* ==========================================
          FOOTER UTILITIES SECTION
         ========================================== */}
      <footer className="bg-[#2B35AF] text-white/80 text-xs px-8 md:px-16 py-5 mt-24 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 shrink-0">
        <div>© Copyright 2026 Uniresolve. All Rights Reserved.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition flex items-center gap-1"><MessageSquare size={12} /> Support Centre</a>
          <a href="#" className="hover:text-white transition">Terms of Use</a>
          <a href="#" className="hover:text-white transition flex items-center gap-1"><ShieldCheck size={12} /> System Status</a>
        </div>
      </footer>

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceName={selectedService}
        categoryTitle={selectedCategory}
      />

    </div>
  );
}