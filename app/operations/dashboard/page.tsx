'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { ShieldCheck, Activity, Plane, Building, FileCheck, AlertTriangle, Clock, RefreshCw, CheckCircle2, Compass } from 'lucide-react';
import Link from 'next/link';

interface QueueItem {
  id: string;
  type: 'FLIGHT' | 'HOTEL' | 'VISA' | 'DMC';
  reference: string;
  customer: string;
  destination: string;
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'ACTION_REQUIRED';
  priority: 'HIGH' | 'MEDIUM' | 'URGENT';
  timeAgo: string;
}

export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'FLIGHT' | 'HOTEL' | 'VISA'>('ALL');

  const [queue, setQueue] = useState<QueueItem[]>([
    { id: 'Q-101', type: 'VISA', reference: 'VS-UAE-904', customer: 'Pooja Iyer', destination: 'Dubai, UAE', status: 'PENDING', priority: 'URGENT', timeAgo: '6m ago' },
    { id: 'Q-102', type: 'FLIGHT', reference: 'PNR-EK517', customer: 'Rahul Sharma', destination: 'Dubai, UAE', status: 'PROCESSING', priority: 'HIGH', timeAgo: '14m ago' },
    { id: 'Q-103', type: 'HOTEL', reference: 'HTL-RES-441', customer: 'Ananya Deshmukh', destination: 'Bali, Indonesia', status: 'PENDING', priority: 'MEDIUM', timeAgo: '28m ago' },
    { id: 'Q-104', type: 'DMC', reference: 'TRF-MLE-19', customer: 'Vikram Malhotra', destination: 'Maldives', status: 'ACTION_REQUIRED', priority: 'URGENT', timeAgo: '42m ago' },
    { id: 'Q-105', type: 'VISA', reference: 'VS-IDN-332', customer: 'Sameer Sen', destination: 'Bali, Indonesia', status: 'RESOLVED', priority: 'MEDIUM', timeAgo: '1h ago' }
  ]);

  const handleResolve = (id: string) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'RESOLVED' } : item));
  };

  const filtered = queue.filter(q => activeTab === 'ALL' || q.type === activeTab);

  return (
    <InternalLayout
      headerTitle="Operations Dispatch & Fulfillment Cockpit"
      headerSubtitle="Flight & Ground Fulfillment Desk • Data Scope: WORKSPACE"
      actions={
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-semibold border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Dispatch Stream
          </span>
          <Link
            href="/erp/dashboard"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-xl transition"
          >
            ERP Trips & Tasks →
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Ticketing Queue</div>
            <div className="text-2xl font-black text-white mt-1">14 PNRs</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 98.4% on-time issuance
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Pending Hotel Vouchers</div>
            <div className="text-2xl font-black text-white mt-1">7 Vouchers</div>
            <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Direct DMC confirm pending
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Visa Verification Backlog</div>
            <div className="text-2xl font-black text-white mt-1">5 Passports</div>
            <div className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> OCR validity verified
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">DMC Ground Escapes</div>
            <div className="text-2xl font-black text-white mt-1">1 Emergency</div>
            <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Seaplane weather delay MLE
            </div>
          </div>
        </div>

        {/* Fulfillment Queue with Tabbed Views */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" /> Active Service Fulfillment Backlog
              </h2>
              <p className="text-xs text-slate-400">Real-time requests requiring manual or automated agent action.</p>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'FLIGHT', 'HOTEL', 'VISA'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === tab ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {tab === 'ALL' ? 'All Queues' : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Ref & Type</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Destination</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Age</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-white">{item.reference}</div>
                      <span className="text-[10px] text-slate-400">{item.type}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-200">{item.customer}</td>
                    <td className="p-3.5 text-slate-300">{item.destination}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.priority === 'URGENT' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        item.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        item.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{item.timeAgo}</td>
                    <td className="p-3.5 text-right">
                      {item.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-sm"
                        >
                          Complete Action
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
