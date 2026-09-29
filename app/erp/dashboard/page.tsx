'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Activity, ShieldCheck, Clock, AlertTriangle, CheckCircle2, 
  Plane, Hotel, Car, Compass, Users, ArrowRight, RefreshCw, FileCheck,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface TaskItem {
  id: string;
  booking: string;
  client: string;
  comp: string;
  desc: string;
  team: string;
  priority: string;
  sla: string;
  status: string;
}

export default function ERPDashboard() {
  const [activeTab, setActiveTab] = useState<'TASKS' | 'LIFECYCLE'>('TASKS');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  // KPIs
  const kpis = [
    { label: 'Bookings Today', value: '18', change: '+3 vs avg', isGood: true },
    { label: 'Active Trips', value: '42', change: 'Across 6 countries', isGood: true },
    { label: 'Pending Confirmations', value: '7', change: 'Supplier action req', isAlert: true },
    { label: 'Supplier Responses', value: '94%', change: 'Avg 18m response', isGood: true },
    { label: 'Pending Documents', value: '4', change: 'Visa/Passports', isAlert: true },
    { label: 'Operational Tasks', value: '28', change: '16 In Progress', isGood: true },
    { label: 'SLA Breaches', value: '0', change: '100% on time', isGood: true },
    { label: 'Disruptions', value: '1', change: 'MLE Seaplane weather', isCritical: true },
    { label: 'Refund Cases', value: '2', change: 'Awaiting finance approval', isAlert: true }
  ];

  // Component Fulfillment Tasks
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'TSK-101', booking: 'TP-892401', client: 'Rahul Sharma', comp: 'FLIGHT', desc: 'Issue NDC Emirates PNR (EK501/EK502)', team: 'Airline Desk', priority: 'HIGH', sla: '32m remaining', status: 'IN_PROGRESS' },
    { id: 'TSK-102', booking: 'TP-892401', client: 'Rahul Sharma', comp: 'HOTEL', desc: 'Lock Atlantis Palm Jumeirah Voucher', team: 'Hospitality Desk', priority: 'MEDIUM', sla: '1h 14m remaining', status: 'OPEN' },
    { id: 'TSK-103', booking: 'TP-892401', client: 'Rahul Sharma', comp: 'TRANSFER', desc: 'Private Chauffeur Limousine Dispatch', team: 'Ground Ops', priority: 'MEDIUM', sla: '2h 10m remaining', status: 'OPEN' },
    { id: 'TSK-104', booking: 'TP-892401', client: 'Rahul Sharma', comp: 'VISA', desc: 'ICAO Doc 9303 MRZ OCR & eVisa Check', team: 'Visa Concierge', priority: 'CRITICAL', sla: 'Done', status: 'COMPLETED' },
    { id: 'TSK-105', booking: 'TP-884120', client: 'Dr. Anand Verma', comp: 'HOTEL', desc: 'Soneva Jani Overwater Villa Confirm', team: 'Hospitality Desk', priority: 'HIGH', sla: '45m remaining', status: 'IN_PROGRESS' },
  ]);

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED', sla: 'Done' } : t));
    setNotice(`Task ${taskId} marked as completed and fulfilled.`);
  };

  return (
    <InternalLayout
      headerTitle="ERP Operational Fulfilment Command Center"
      headerSubtitle="Enterprise Resource Planning • Booking Operations • Trips • SLAs"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'TASKS' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Fulfillment Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('LIFECYCLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'LIFECYCLE' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Dispatch Lifecycle Flow
          </button>
          <Link
            href="/admin/approvals"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approval Center (3)</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Notice Banner */}
        {notice && (
          <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-emerald-400 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Layer */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Health KPIs</h2>
            <div className="text-xs text-emerald-400 font-medium">98.4% On-Time Fulfillment</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpis.map((k, i) => (
              <div key={i} className={`p-4 rounded-2xl border transition-all ${
                k.isCritical ? 'bg-rose-950/40 border-rose-800/80 text-rose-200' :
                k.isAlert ? 'bg-amber-950/40 border-amber-800/80 text-amber-200' :
                'bg-slate-900/80 border-slate-800 text-slate-100'
              }`}>
                <div className="text-[11px] text-slate-400 font-medium truncate">{k.label}</div>
                <div className="text-xl font-black mt-1">{k.value}</div>
                <div className="text-[10px] mt-1 font-semibold text-slate-400">{k.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab 1: Task Queue */}
        {activeTab === 'TASKS' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" /> Active Component Fulfillment Queue
                </h3>
                <p className="text-[11px] text-slate-400">Component Tasks Auto-Generated from Commercial Bookings</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['ALL', 'FLIGHT', 'HOTEL', 'TRANSFER', 'VISA'].map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveFilter(c)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      activeFilter === c ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Task ID & Comp</th>
                    <th className="p-3.5">Booking & Client</th>
                    <th className="p-3.5">Action Description</th>
                    <th className="p-3.5">Assigned Team</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">SLA Countdown</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tasks
                    .filter(t => activeFilter === 'ALL' || t.comp === activeFilter)
                    .map(task => (
                      <tr key={task.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-white">{task.id}</div>
                          <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800">
                            {task.comp}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <Link href="/erp/trips/trip_tp892401" className="font-mono font-bold text-sky-400 hover:underline">
                            {task.booking}
                          </Link>
                          <div className="text-slate-300 font-semibold">{task.client}</div>
                        </td>
                        <td className="p-3.5 text-slate-200">{task.desc}</td>
                        <td className="p-3.5 text-slate-400">{task.team}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            task.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{task.sla}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            task.status === 'IN_PROGRESS' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {task.status !== 'COMPLETED' ? (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-sm"
                            >
                              Complete
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-bold text-[11px] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Lifecycle Flow */}
        {activeTab === 'LIFECYCLE' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Operational Fulfilment Flow & Status Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">End-to-end trip status tracking across supplier desks.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
              {[
                { stage: '1. BOOKING', desc: 'Order Placed', count: 18, color: 'border-sky-600/80 bg-sky-950/40 text-sky-300' },
                { stage: '2. SUPPLIER', desc: 'PO Dispatched', count: 14, color: 'border-indigo-600/80 bg-indigo-950/40 text-indigo-300' },
                { stage: '3. CONFIRM', desc: 'Vouchers Locked', count: 11, color: 'border-purple-600/80 bg-purple-950/40 text-purple-300' },
                { stage: '4. DOCUMENT', desc: 'Visas & Tickets', count: 9, color: 'border-emerald-600/80 bg-emerald-950/40 text-emerald-300' },
                { stage: '5. PAYMENT', desc: 'Reconciled', count: 18, color: 'border-emerald-600/80 bg-emerald-950/40 text-emerald-300' },
                { stage: '6. FULFILMENT', desc: 'Voucher Packet', count: 8, color: 'border-amber-600/80 bg-amber-950/40 text-amber-300' },
                { stage: '7. TRIP', desc: 'Currently Traveling', count: 42, color: 'border-sky-600/80 bg-sky-950/40 text-sky-300' },
                { stage: '8. POST-TRIP', desc: 'Feedback & Review', count: 15, color: 'border-slate-700 bg-slate-950 text-slate-300' },
              ].map((s, i) => (
                <div key={i} className={`p-3.5 rounded-2xl border ${s.color} space-y-1.5 shadow-sm`}>
                  <div className="font-bold text-[11px] truncate">{s.stage}</div>
                  <div className="text-xl font-black">{s.count}</div>
                  <div className="text-[10px] opacity-80 truncate">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
