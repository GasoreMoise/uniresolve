'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Bell, AlertTriangle, Landmark, UserCheck, ShieldAlert, Globe, GraduationCap } from 'lucide-react';
import { api } from '../config/api';
import NotificationInboxTray from '../components/NotificationInboxTray';
import StudentResolutionModal from '../components/StudentResolutionModal';

interface Ticket {
  id: string;
  trackingCode: string;
  serviceName: string;
  category: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED' | 'RESOLVED';
  createdAt: string;
  history?: Array<{ id: string; comment: string; createdAt: string; }>;
}

export default function StudentServicesCatalogHub() {
  const router = useRouter();
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [studentName, setStudentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  
  // Clean synchronized state parameters for structural layout switching
  const [viewMode, setViewMode] = useState<'CATALOG' | 'HISTORY_QUEUE'>('CATALOG');

  // Modal and Tray toggles
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchStudentQueue = async () => {
    try {
      const data = await api.tickets.getStudentQueue();
      setQueue(data);
    } catch (err) {
      console.error('Handshake failure syncing user logs.');
      // If the mobile device token is stale or expired, clear out memory and break loop
      localStorage.clear();
      router.replace('/auth');
    } finally {
      setIsLoading(false);
      // ◄ CRITICAL UNLOCK: Drops the splash mask here no matter what the network outcome is!
      setIsAuthenticating(false); 
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      const name = localStorage.getItem('user_fullName');
      
      if (!token) {
        localStorage.clear();
        setIsAuthenticating(false); 
        router.replace('/auth');
        return;
      }
      
      setStudentName(name || 'Enrollment Identity');
      fetchStudentQueue();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('uniresolve_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_fullName');
    localStorage.removeItem('user_department');
    localStorage.clear();
    window.location.href = '/auth';
  };

  const triggerResolutionPanel = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsResolutionOpen(true);
  };

  const criticalCount = queue.filter(t => t?.status === 'ACTION_REQUIRED').length;

  // Master Directory Structural Data Matrix Layout Map Array
  const servicesCatalog = [
    {
      section: "Rwandan Students",
      isInternational: false,
      categories: [
        {
          title: "Academic Progression & Verification",
          icon: <GraduationCap size={15} className="text-[#2B35AF]" />,
          slug: "academic-progression",
          items: [
            { name: "Special Quiz", slug: "special-quiz" },
            { name: "Special CAT", slug: "special-cat" },
            { name: "Special Exam", slug: "special-exam" },
            { name: "CAT Claim", slug: "cat-claim" },
            { name: "Exam Claims", slug: "exam-claims" },
            { name: "Transcript Request", slug: "transcript-request" },
          ]
        },
        {
          title: "Administrative & Operational Requests",
          icon: <UserCheck size={15} className="text-[#2B35AF]" />,
          slug: "administrative-requests",
          items: [
            { name: "Student Registration", slug: "student-registration" },
            { name: "Card Replacement", slug: "card-replacement" },
            { name: "Permission Request", slug: "permission-request" },
            { name: "Gate Management", slug: "gate-management" },
            { name: "Class Allocation", slug: "class-allocation" },
            { name: "Letter of Recommendation", slug: "letter-of-recommendation" },
          ]
        },
        {
          title: "Financial Gateways",
          icon: <Landmark size={15} className="text-[#2B35AF]" />,
          slug: "financial-gateways",
          items: [
            { name: "Registration Payment", slug: "registration-payment" },
            { name: "Retake Payment", slug: "retake-payment" },
            { name: "Financial Clearances", slug: "financial-clearances" },
          ]
        },
        {
          title: "Direct Support & External Compliance",
          icon: <ShieldAlert size={15} className="text-[#2B35AF]" />,
          slug: "external-compliance",
          items: [
            { name: "Issue Card Application", slug: "issue-card-application" },
          ]
        }
      ]
    },
    {
      section: "International Students",
      isInternational: true,
      categories: [
        {
          title: "Academic Progression & Verification",
          icon: <Globe size={15} className="text-indigo-600" />,
          slug: "international-academic",
          items: [
            { name: "Special Quiz", slug: "special-quiz" },
            { name: "Special CAT", slug: "special-cat" },
            { name: "Special Exam", slug: "special-exam" },
            { name: "CAT Claim", slug: "cat-claim" },
            { name: "Exam Claims", slug: "exam-claims" },
            { name: "Diploma Equivalence", slug: "diploma-equivalence" },
            { name: "Transcript Request", slug: "transcript-request" },
          ]
        },
        {
          title: "Administrative & Operational Requests",
          icon: <UserCheck size={15} className="text-indigo-600" />,
          slug: "international-administrative",
          items: [
            { name: "Student Registration", slug: "student-registration" },
            { name: "Card Replacement", slug: "card-replacement" },
            { name: "Permission Request", slug: "permission-request" },
            { name: "Gate Management", slug: "gate-management" },
            { name: "Class Allocation", slug: "class-allocation" },
            { name: "Letter of Recommendation", slug: "letter-of-recommendation" },
          ]
        },
        {
          title: "Financial Gateways",
          icon: <Landmark size={15} className="text-indigo-600" />,
          slug: "international-financial",
          items: [
            { name: "Registration Payment", slug: "registration-payment" },
            { name: "Retake Payment", slug: "retake-payment" },
            { name: "Financial Clearances", slug: "financial-clearances" },
          ]
        },
        {
          title: "Direct Support & External Compliance",
          icon: <ShieldAlert size={15} className="text-indigo-600" />,
          slug: "international-compliance",
          items: [
            { name: "Issue Card Application", slug: "issue-card-application" },
          ]
        }
      ]
    }
  ];

  if (isAuthenticating) {
    return (
      <div className="min-h-screen w-full bg-[#2B35AF] flex items-center justify-center font-mono text-xs text-white/50">
        Syncing system services environment matrix...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-800 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* HUD CONTAINER BAR TERMINAL */}
      <header className="bg-[#2B35AF] text-white px-6 md:px-16 py-4.5 flex justify-between items-center shrink-0 relative z-40">
        <div className="text-sm font-black tracking-widest cursor-pointer" onClick={() => setViewMode('CATALOG')}>
          UNIRESOLVE // HUB
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setViewMode(viewMode === 'CATALOG' ? 'HISTORY_QUEUE' : 'CATALOG')} 
            className="text-xs text-white/90 hover:text-white font-bold transition bg-transparent border-none cursor-pointer"
          >
            {viewMode === 'CATALOG' ? `View Claims History (${queue.length})` : 'Back to Services Catalog'}
          </button>
          
          <div className="relative">
            <button onClick={() => setIsInboxOpen(!isInboxOpen)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition cursor-pointer relative border-none">
              <Bell size={14} />
              {criticalCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#2B35AF] animate-pulse" />}
            </button>
            <NotificationInboxTray isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} queue={queue} onActionClick={triggerResolutionPanel} />
          </div>

          <span className="text-xs font-medium text-white/80 hidden sm:inline">Welcome, <b>{studentName}</b></span>
          <button onClick={handleLogout} className="flex items-center gap-1 bg-transparent hover:bg-white/10 border border-white/20 text-white px-2.5 py-1 rounded text-xs transition cursor-pointer">
            <LogOut size={12} /> Exit
          </button>
        </div>
      </header>

      {/* BLUE WELCOME HERO CONTAINER BANNER */}
      <div className="bg-[#2B35AF] text-white text-center pt-12 pb-16 px-4 space-y-6 shrink-0 shadow-inner">
        <h1 className="text-2xl md:text-3xl font-serif font-normal tracking-wide">Welcome</h1>
        
        <div className="relative w-full max-w-xl mx-auto shadow-xl rounded">
          <Search size={14} className="absolute inset-y-0 left-4 my-auto text-slate-400" />
          <input 
            type="text"
            placeholder="Enter keyword to search for services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs rounded border-none focus:outline-none text-slate-800 font-medium placeholder-slate-400 bg-white"
          />
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT SWITCHER */}
      <main className="grow max-w-5xl w-full mx-auto px-6 md:px-12 py-12">
        {viewMode === 'CATALOG' ? (
          /* SECTION 1: FIGMA SERVICES CATALOG EXPLORATION SURFACE */
          <div className="space-y-12">
            {servicesCatalog.map((section, sIdx) => {
              const hasMatchingItems = section.categories.some(cat => 
                cat.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              if (!hasMatchingItems && searchQuery !== '') return null;

              return (
                <div key={sIdx} className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                    {section.section}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {section.categories.map((category, cIdx) => {
                      const filteredItems = category.items.filter(item => 
                        item.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={cIdx} className="space-y-3.5">
                          <h3 className="text-md font-bold text-slate-400 tracking-wide flex items-center gap-1.5 uppercase">
                            {category.icon}
                            <span>{category.title}</span>
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 border-l border-slate-100 pl-4">
                            {filteredItems.map((item, iIdx) => (
                              <div 
                                key={iIdx}
                                onClick={() => router.push(`/apply/${category.slug}/${item.slug}`)}
                                className="text-slate-700 hover:text-[#2B35AF] hover:underline transition text-[13px] font-medium cursor-pointer py-0.5 truncate"
                              >
                                {item.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* SECTION 2: IMMUTABLE LOG LEDGER HISTORY TABLE MATRIX */
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setViewMode('CATALOG')} 
                className="text-xs text-[#2B35AF] font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                ← Back to Services Catalog
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                Active Ledger Queue
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Immutable Case Submission Stream Log Ledger
              </div>
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-12 text-center text-slate-400 text-xs italic">Syncing personal stream indexes...</div>
                ) : queue.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-xs font-normal italic">
                    No claim identifiers logged against your enrollment profile registry row.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-3">Tracking Reference</th>
                        <th className="px-6 py-3">Service Focus</th>
                        <th className="px-6 py-3">Date Lodged</th>
                        <th className="px-6 py-3">Status Tag</th>
                        <th className="px-6 py-3 text-right">Intervention Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                      {queue.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50/30 transition">
                          <td className="px-6 py-4 font-mono font-bold text-[#2B35AF]">{ticket.trackingCode}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{ticket.serviceName}</td>
                          <td className="px-6 py-4 text-slate-400 font-normal">
                            {new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded border tracking-wider ${
                              ticket.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              ticket.status === 'UNDER_REVIEW' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              ticket.status === 'ACTION_REQUIRED' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' :
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {ticket.status === 'ACTION_REQUIRED' ? (
                              <button 
                                onClick={() => triggerResolutionPanel(ticket)}
                                className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase tracking-wide transition cursor-pointer border-none shadow-none"
                              >
                                <AlertTriangle size={11} /> Fix Discrepancy
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-normal italic pr-2">Case file locked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <StudentResolutionModal isOpen={isResolutionOpen} onClose={() => setIsResolutionOpen(false)} ticket={selectedTicket} onResubmitted={fetchStudentQueue} />

      {/* FOOTER */}
      <footer className="bg-[#2B35AF] text-white/70 text-[10px] px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-white/10 shrink-0">
        <div>© Copyright 2026 Uniresolve System Platform. All Rights Reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">Support Centre</a>
          <a href="#" className="hover:text-white transition">Terms of Use</a>
          <a href="#" className="hover:text-white transition">System Status</a>
        </div>
      </footer>

    </div>
  );
}