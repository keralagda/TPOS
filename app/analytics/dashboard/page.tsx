'use client';

import React from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  TrendingUp, BarChart2, DollarSign, ArrowUpRight, 
  MapPin, Users, Download, Calendar, Layers, Activity 
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  return (
    <InternalLayout
      headerTitle="Performance & Analytics"
      headerSubtitle="BI Velocity, Yield Analysis & Branch Cohorts"
      actions={
        <button
          onClick={() => alert('Exporting Performance Report (CSV)...')}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export P&L Report</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Net Travel Revenue</span>
            <div className="text-2xl font-black text-emerald-400">₹4,82,40,000</div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +24.2% MoM
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
            <div className="text-2xl font-black text-white">₹1,18,500</div>
            <span className="text-[11px] text-sky-400 font-semibold">+8.4% per booking</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Operating Margin</span>
            <div className="text-2xl font-black text-indigo-400">14.6%</div>
            <span className="text-[11px] text-slate-400">Zero GDS markup leak</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Repeat Traveler Cohort</span>
            <div className="text-2xl font-black text-purple-400">42.8%</div>
            <span className="text-[11px] text-emerald-400 font-semibold">High Brand Loyalty</span>
          </div>
        </div>

        {/* Route Yields & Branch Velocity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Destination Routes */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" /> Route Yield Leaders
              </h3>
              <span className="text-[11px] font-mono text-slate-400">CY 2026</span>
            </div>
            <div className="space-y-3">
              {[
                { route: 'DEL -> DXB (Dubai Express)', gmv: '₹1.84 Cr', bookings: 540, margin: '15.2%' },
                { route: 'COK -> MLE (Maldives Luxury)', gmv: '₹1.22 Cr', bookings: 210, margin: '18.4%' },
                { route: 'BOM -> DPS (Bali Retreat)', gmv: '₹98.4 L', bookings: 320, margin: '14.1%' },
                { route: 'DEL -> CDG (Paris Romance)', gmv: '₹77.8 L', bookings: 110, margin: '12.8%' },
              ].map((r, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{r.route}</div>
                    <div className="text-slate-400 text-[11px]">{r.bookings} Bookings Issued</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">{r.gmv}</div>
                    <div className="text-[10px] text-sky-400 font-bold">{r.margin} Net Yield</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Velocity */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Regional Branch Velocity
              </h3>
              <span className="text-[11px] text-slate-400">Real-time Pacing</span>
            </div>
            <div className="space-y-3">
              {[
                { branch: 'Kochi Branch (Kerala)', revenue: '₹1.48 Cr', pacing: '108% to Goal', agents: 14 },
                { branch: 'Dubai Branch (UAE)', revenue: 'AED 840K', pacing: '114% to Goal', agents: 8 },
                { branch: 'Delhi NCR (CP)', revenue: '₹1.24 Cr', pacing: '98% to Goal', agents: 12 },
                { branch: 'Mumbai Branch (BKC)', revenue: '₹1.10 Cr', pacing: '102% to Goal', agents: 10 },
              ].map((b, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{b.branch}</div>
                    <div className="text-slate-400 text-[11px]">{b.agents} Active Consultants</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white">{b.revenue}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">{b.pacing}</div>
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
