'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, FileText, RefreshCw, AlertCircle, Loader2,  HelpCircle } from 'lucide-react';
import { api } from '../../config/api';

interface Ticket {
  id: string;
  trackingCode: string;
  serviceName: string;
  category: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED' | 'RESOLVED';
  createdAt: string;
}

export default function StudentHistoryQueue() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.tickets.getStudentQueue();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync your case file tracking logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Evict unauthenticated traffic instantly
    const token = typeof window !== 'undefined' ? localStorage.getItem('uniresolve_token') : null;
    if (!token) {
      router.push('/auth');
      return;
    }
    fetchQueue();
  }, [router]);

  // Real-time keyword filter search bar mechanics
  const filteredTickets = tickets.filter(ticket => 
    ticket.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic status badge mapping wrapper matrix
  const getStatusBadge = (status: Ticket['status']) => {
    const profiles = {
      SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
      UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
      ACTION_REQUIRED: 'bg-red-50 text-red-700 border-red-200 animate-pulse',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      RESOLVED: 'bg-slate-100 text-slate-700 border-slate-300',
    };
    return profiles[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* NAVIGATION BAR HEADER */}
      <header className="bg-[#2B35AF] text-white px-8 py-5 flex justify-between items-center shrink-0">
        <div className="text-lg font-bold tracking-wider cursor-pointer" onClick={() => router.push('/')}>
          UNIRESOLVE
        </div>
        <button 
          onClick={() => router.push('/')}
          className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-transparent border-none cursor-pointer transition uppercase font-bold tracking-wider"
        >
          <ArrowLeft size={14} /> Back to Hub
        </button>
      </header>

      {/* CORE QUEUE AREA */}
      <main className="grow max-w-5xl w-full mx-auto px-6 py-12 space-y-6">
        
        {/* Workspace Title & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Resolution History</h1>
            <p className="text-slate-500 text-xs mt-0.5">Track, search, and monitor your submitted academic and operations claims files.</p>
          </div>
          <button 
            onClick={fetchQueue}
            disabled={isLoading}
            className="flex items-center gap-1.5 self-start sm:self-auto text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded cursor-pointer transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Sync Ledger
          </button>
        </div>

        {/* Live Filter Input Bar */}
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute inset-y-0 left-3.5 my-auto text-slate-400" />
          <input
            type="text"
            placeholder="Search by tracking code or service key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded text-xs bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-[#2B35AF] transition font-medium"
          />
        </div>

        {/* Dynamic Condition Screen Grid Render Pass */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-500 text-xs">
            <Loader2 size={24} className="animate-spin mx-auto text-[#2B35AF] mb-2" /> Syncing secure registry tables...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-16 text-center text-slate-400 text-xs space-y-2">
            <HelpCircle size={32} className="mx-auto text-slate-300" />
            <p className="font-medium text-slate-600">No active ticket records located.</p>
            <p className="text-[11px] text-slate-400">Any claims files you register across dynamic portals will render inside this matrix.</p>
          </div>
        ) : (
          /* RESPONSIVE HISTORICAL LEDGER TABLE */
          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Tracking ID</th>
                    <th className="px-6 py-3.5">Service Action</th>
                    <th className="px-6 py-3.5">Context Scope</th>
                    <th className="px-6 py-3.5">Date Registered</th>
                    <th className="px-6 py-3.5 text-right">Processing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-[#2B35AF] tracking-wide">
                        {ticket.trackingCode}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-semibold flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" /> {ticket.serviceName}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px]">
                        {ticket.category.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded border uppercase tracking-wider ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* SYSTEM UTILITIES FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] px-8 py-5 text-center shrink-0">
        © Copyright 2026 Uniresolve Registry Terminal. All Rights Reserved.
      </footer>

    </div>
  );
}