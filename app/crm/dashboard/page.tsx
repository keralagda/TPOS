'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Users, UserPlus, PhoneCall, MessageSquare, TrendingUp, 
  DollarSign, Target, Sparkles, CheckCircle2, Clock, AlertTriangle, 
  ArrowRight, Search, Filter, ShieldCheck, Flame, ArrowUpRight,
  Calculator
} from 'lucide-react';
import Link from 'next/link';

export default function CRMDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  // KPI layer
  const kpis = [
    { label: 'New Leads', value: '142', change: '+18%', isPositive: true },
    { label: 'Qualified Leads', value: '88', change: '+12%', isPositive: true },
    { label: 'Open Enquiries', value: '34', change: '-4%', isPositive: false },
    { label: 'Active Opportunities', value: '29', change: '+8%', isPositive: true },
    { label: 'Quotes Sent', value: '45', change: '+22%', isPositive: true },
    { label: 'Quotes Accepted', value: '28', change: '+15%', isPositive: true },
    { label: 'Bookings Won', value: '26', change: '+18%', isPositive: true },
    { label: 'Conversion Rate', value: '31.8%', change: '+3.2%', isPositive: true },
    { label: 'Pipeline Value', value: '₹1,48,20,000', change: '+24%', isPositive: true },
    { label: 'Expected Revenue', value: '₹42,80,000', change: '+16%', isPositive: true },
    { label: 'Follow-ups Due Today', value: '12', change: '4 Urgent', isPositive: false, isAlert: true },
    { label: 'Overdue Follow-ups', value: '3', change: 'Requires Action', isPositive: false, isCritical: true }
  ];

  // Funnel stages
  const funnel = [
    { stage: 'VISITOR', count: '14,200', pct: '100%' },
    { stage: 'LEAD', count: '1,420', pct: '10.0%' },
    { stage: 'ENQUIRY', count: '480', pct: '33.8%' },
    { stage: 'QUALIFIED', count: '310', pct: '64.5%' },
    { stage: 'REQUIREMENT', count: '240', pct: '77.4%' },
    { stage: 'QUOTE', count: '180', pct: '75.0%' },
    { stage: 'NEGOTIATION', count: '94', pct: '52.2%' },
    { stage: 'PAYMENT', count: '62', pct: '65.9%' },
    { stage: 'BOOKING', count: '58', pct: '93.5%' }
  ];

  // Hot Leads
  const hotLeads = [
    { id: 'LD-902', name: 'Dr. Anand Verma', dest: 'Dubai & Maldives (Combo)', budget: '₹6.5L', pax: 4, score: 96, source: 'WEBSITE', status: 'QUOTE_SENT' },
    { id: 'LD-904', name: 'Meera Singhania', dest: 'Paris & Swiss Alps', budget: '₹8.2L', pax: 2, score: 94, source: 'INSTAGRAM', status: 'NEGOTIATION' },
    { id: 'LD-908', name: 'Vikram & Co (Corporate)', dest: 'Singapore Tech Retreat', budget: '₹18.0L', pax: 14, score: 91, source: 'REFERRAL', status: 'QUALIFIED' },
    { id: 'LD-911', name: 'Rajesh Nair Family', dest: 'Bali Seminyak Private Villa', budget: '₹4.2L', pax: 5, score: 89, source: 'WHATSAPP', status: 'REQUIREMENT_CAPTURED' }
  ];

  // Follow-ups due today
  const followUps = [
    { time: '11:00 AM', customer: 'Dr. Anand Verma', type: 'CALL', action: 'Discuss Dubai villa private chef add-on', agent: 'Priya Sharma', urgent: true },
    { time: '02:30 PM', customer: 'Meera Singhania', type: 'WHATSAPP', action: 'Send updated Eurail first class quote', agent: 'David Roy', urgent: false },
    { time: '04:00 PM', customer: 'Vikram & Co', type: 'MEETING', action: 'Corporate conference room booking lock', agent: 'Sarah Khan', urgent: true },
    { time: '05:30 PM', customer: 'Rahul Sharma', type: 'CALL', action: 'Quote Q-2026-9011 expiration reminder', agent: 'Priya Sharma', urgent: false }
  ];

  return (
    <InternalLayout
      headerTitle="CRM Command & Sales Engine"
      headerSubtitle="Pipeline • Conversion Funnel • Quotations • Customer 360"
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/crm/leads"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Manage Leads</span>
          </Link>
          <Link
            href="/crm/quotes"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Calculator className="w-3.5 h-3.5 text-sky-400" />
            <span>Quote Builder</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executive Sales KPI Layer</h2>
            <div className="text-xs text-sky-400 font-medium">Real-time sync from Sales Engine</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map((k, i) => (
              <div key={i} className={`p-4 rounded-2xl border transition-all ${
                k.isCritical ? 'bg-rose-950/40 border-rose-800/80 text-rose-200' :
                k.isAlert ? 'bg-amber-950/40 border-amber-800/80 text-amber-200' :
                'bg-slate-900/80 border-slate-800 text-slate-100'
              }`}>
                <div className="text-[11px] text-slate-400 font-medium truncate">{k.label}</div>
                <div className="text-xl font-black mt-1">{k.value}</div>
                <div className="text-[10px] mt-1 font-semibold flex items-center gap-1 text-slate-400">
                  <span className={k.isPositive ? 'text-emerald-400' : 'text-slate-400'}>{k.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel & AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sales Conversion Funnel */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" /> Sales Conversion Funnel
                </h3>
                <p className="text-[11px] text-slate-400">Visitor to Confirmed Booking Conversion Analysis</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                Overall: 4.1%
              </span>
            </div>

            <div className="space-y-2 pt-2">
              {funnel.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-[11px] font-bold text-slate-300 uppercase">{step.stage}</span>
                  <div className="flex-1 bg-slate-950 rounded-full h-4 overflow-hidden p-0.5 border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-sky-600 to-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(12, 100 - idx * 10)}%` }}
                    />
                  </div>
                  <span className="w-16 font-mono text-slate-200 text-right">{step.count}</span>
                  <span className="w-14 text-[10px] font-semibold text-slate-400 text-right">{step.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Sales Assistant */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-indigo-900/40 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Sales Recommendations
              </h3>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700">
                Cognitive CRM
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-900/50 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> High-Probability Win: Dr. Anand Verma
                </div>
                <p className="text-slate-300 text-[11px]">
                  Client reviewed Atlantis Dubai quote 4 times in 24h. Recommend offering complimentary private yacht sunset upgrade to close today.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-900/50 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Stale Lead Alert: Bali Honeymoon (LD-881)
                </div>
                <p className="text-slate-300 text-[11px]">
                  No interaction for 48 hours. Auto-drafted a WhatsApp reminder with villa price drop alert ready for review.
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-900/50 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Cross-Sell Opportunity: Rahul Sharma
                </div>
                <p className="text-slate-300 text-[11px]">
                  Passport expires in 8 months. Automatic advisory sent for 6-month validity compliance before November Dubai travel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hot Leads & Today's Follow-up Work Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hot Leads Table */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Hot Leads Requiring Immediate Attention
              </h3>
              <Link href="/crm/leads" className="text-xs text-sky-400 hover:underline">
                View All Leads →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Lead & Prospect</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Est. Value</th>
                    <th className="p-3">AI Score</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {hotLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <Link href="/crm/customers/usr_cust_rahul" className="font-bold text-white hover:text-sky-400 transition">
                          {lead.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.id} • {lead.source}</div>
                      </td>
                      <td className="p-3 text-slate-300">{lead.dest}</td>
                      <td className="p-3 font-semibold text-emerald-400">{lead.budget}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded text-[11px]">
                          {lead.score}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/crm/quotes?lead=${lead.id}`}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Quote</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Follow-up Work Queue */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" /> Today's Follow-up Work Queue
              </h3>
              <span className="text-xs text-amber-400 font-bold">4 Due Today</span>
            </div>

            <div className="space-y-3">
              {followUps.map((fu, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sky-400">{fu.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      fu.urgent ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {fu.type}
                    </span>
                  </div>
                  <div className="font-bold text-white">{fu.customer}</div>
                  <div className="text-[11px] text-slate-300">{fu.action}</div>
                  <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
                    <span>Agent: {fu.agent}</span>
                    <button className="text-sky-400 hover:underline font-bold">Mark Done ✓</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
