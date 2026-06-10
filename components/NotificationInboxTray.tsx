'use client';

import React from 'react';
import { Bell, X, AlertTriangle, CheckCircle, RefreshCw, MessageSquare } from 'lucide-react';

interface Ticket {
  id: string;
  trackingCode: string;
  serviceName: string;
  category: string;    
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'APPROVED' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  // ◄ UPDATED STRUCTURAL PAIR SCHEMAS
  history?: Array<{
    id: string;
    comment: string;
    newState: string;
    changedAt: string;
  }>;
}

interface TrayProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Ticket[];
  onActionClick: (ticket: Ticket) => void;
}

export default function NotificationInboxTray({ isOpen, onClose, queue, onActionClick }: TrayProps) {
  if (!isOpen) return null;

  // Isolate tickets that require immediate attention from the student
  const actionableAlerts = queue.filter(t => t.status === 'ACTION_REQUIRED');
  const standardAlerts = queue.filter(t => t.status !== 'SUBMITTED'); // Exclude fresh items to keep the feed clean

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded shadow-2xl z-50 overflow-hidden font-sans text-xs animate-in fade-in slide-in-from-top-3 duration-200">
      
      {/* TRAY HEADER */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold tracking-wide">
          <Bell size={14} className="text-blue-400" />
          <span>Inbox</span>
          {actionableAlerts.length > 0 && (
            <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {actionableAlerts.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition bg-transparent border-none cursor-pointer">
          <X size={14} />
        </button>
      </div>

      {/* NOTIFICATION FEED ROW ITEMS CONTAINER */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 bg-white">
        {actionableAlerts.length === 0 && standardAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-normal italic">
            No dynamic processing logs broadcasted to this ledger yet.
          </div>
        ) : (
          <>
            {/* ACTION REQUIRED CRITICAL THREADS */}
            {actionableAlerts.map((ticket) => (
              <div key={ticket.id} className="p-4 bg-amber-50/60 hover:bg-amber-50 transition flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded shrink-0 mt-0.5">
                  <AlertTriangle size={14} />
                </div>
                <div className="space-y-1 grow">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 font-mono text-[11px]">{ticket.trackingCode}</span>
                    <span className="text-[9px] text-red-600 font-black tracking-wider uppercase bg-red-50 border border-red-200 px-1 rounded animate-pulse">Attention Required</span>
                  </div>
                  <p className="text-slate-600 font-normal leading-normal">
                    Administrative desk flagged modifications on your <b>{ticket.serviceName}</b> file.
                  </p>
                  <button 
                    onClick={() => { onActionClick(ticket); onClose(); }}
                    className="mt-1.5 inline-flex items-center gap-1 text-[#2B35AF] hover:underline font-bold transition bg-transparent border-none p-0 cursor-pointer text-[11px]"
                  >
                    <MessageSquare size={11} /> Open Resolution Center →
                  </button>
                </div>
              </div>
            ))}

            {/* HISTORICAL PROGRESSION TIMELINES */}
            {standardAlerts.filter(t => t.status !== 'ACTION_REQUIRED').map((ticket) => (
              <div key={ticket.id} className="p-4 bg-white hover:bg-slate-50/50 transition flex items-start gap-3">
                <div className={`p-2 rounded shrink-0 mt-0.5 ${ticket.status === 'RESOLVED' || ticket.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {ticket.status === 'RESOLVED' || ticket.status === 'APPROVED' ? <CheckCircle size={14} /> : <RefreshCw size={13} />}
                </div>
                <div className="space-y-0.5 grow">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 font-mono text-[11px]">{ticket.trackingCode}</span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-500 font-normal leading-normal">
                    Case tracking state transitioned to <b className="text-slate-800 uppercase">{ticket.status}</b> for your {ticket.serviceName} submission.
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

    </div>
  );
}