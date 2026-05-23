'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, CheckCircle, Clock, AlertTriangle, RefreshCw, Eye, Loader2, LogOut } from 'lucide-react';
import { api } from '../../../config/api';

interface Ticket {
  id: string;
  trackingCode: string;
  serviceName: string;
  category: string;
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED' | 'RESOLVED';
  createdAt: string;
  student: {
    fullName: string;
    email: string;
  };
}

export default function DepartmentalDashboardLedger() {
  const router = useRouter();
  const [queue, setQueue] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [staffInfo, setStaffInfo] = useState<{ name: string; dept: string } | null>(null);

  const fetchDepartmentQueue = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const data = await api.tickets.getDepartmentQueue();
      setQueue(data);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to populate departmental stream tables.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('uniresolve_token');
      const role = localStorage.getItem('user_role');
      const name = localStorage.getItem('user_fullName');
      const dept = localStorage.getItem('user_department');

      // Boot students back to the standard home grid if they try to access this route
      if (!token || role === 'STUDENT') {
        router.push('/');
        return;
      }
      setStaffInfo({ name: name || 'Officer', dept: dept || 'GENERAL' });
    }
    fetchDepartmentQueue();
  }, [router]);

  const filteredQueue = queue.filter(item => 
    item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  // Compute live desk overhead metrics
  const totalOpen = queue.filter(t => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length;
  const totalAction = queue.filter(t => t.status === 'ACTION_REQUIRED').length;
  const totalCleared = queue.filter(t => t.status === 'APPROVED' || t.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* HIGH-CONTRAST SECURE HEADER BAR */}
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-md font-black tracking-widest text-blue-500">UNIRESOLVE // STAFF</div>
          {staffInfo && (
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded uppercase">
              DESK: {staffInfo.dept.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400">Logged in: <b className="text-white">{staffInfo?.name}</b></span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 bg-transparent hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs transition cursor-pointer"
          >
            <LogOut size={12} /> Exit
          </button>
        </div>
      </header>

      {/* ADMIN CONTROL INTERFACE */}
      <main className="grow max-w-6xl w-full mx-auto px-6 py-10 space-y-6">
        
        {/* Real-time Counter Grid Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-[#2B35AF] rounded"><Clock size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalOpen}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Pending Review</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded"><AlertTriangle size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalAction}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Action Required</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded"><CheckCircle size={20} /></div>
            <div>
              <div className="text-xl font-bold text-slate-900">{totalCleared}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Closed Case Files</div>
            </div>
          </div>
        </div>

        {/* Global Registry Search Filtering System Controls */}
        <div className="flex justify-between items-center gap-4 bg-white border border-slate-200 p-4 rounded shadow-sm">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
            <input
              type="text"
              placeholder="Search incoming queue by code, name, or service key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded text-xs bg-slate-50 text-slate-800 border border-slate-300 focus:outline-none focus:border-[#2B35AF] focus:bg-white transition"
            />
          </div>
          <button 
            onClick={fetchDepartmentQueue}
            className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2 px-4 rounded font-bold cursor-pointer transition"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Sync Queue
          </button>
        </div>

        {/* Dynamic List Render Matrix */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-400 text-xs">
            <Loader2 size={24} className="animate-spin mx-auto text-slate-900 mb-2" /> Polling database stream nodes...
          </div>
        ) : errorNotice ? (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded text-xs">
            {errorNotice}
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-16 text-center text-slate-400 text-xs font-medium">
            No incoming claims logged within this department workspace boundary.
          </div>
        ) : (
          /* TRANSACTION GRID ENTRY */
          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Tracking Code</th>
                    <th className="px-6 py-3.5">Submitting Student</th>
                    <th className="px-6 py-3.5">Requested Action</th>
                    <th className="px-6 py-3.5">Date Ingested</th>
                    <th className="px-6 py-3.5">State</th>
                    <th className="px-6 py-3.5 text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredQueue.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-[#2B35AF]">{ticket.trackingCode}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-semibold">{ticket.student.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{ticket.student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-semibold flex items-center gap-1.5 pt-5">
                        <FileText size={13} className="text-slate-400" /> {ticket.serviceName}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded border tracking-wider ${
                          ticket.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          ticket.status === 'UNDER_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          ticket.status === 'ACTION_REQUIRED' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert(`Opening audit container panel for case file ${ticket.trackingCode}`)}
                          className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase tracking-wide transition cursor-pointer border-none"
                        >
                          <Eye size={12} /> Audit Case
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-[10px] font-mono py-4 text-center shrink-0">
        SECURE BACK-OFFICE TERMINAL SUBSYSTEM ENGINE CORRIDOR // VER. 2026.05
      </footer>

    </div>
  );
}