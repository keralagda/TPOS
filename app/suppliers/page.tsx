'use client';

import React from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Building2, Handshake, CheckCircle2, RefreshCw, 
  Plane, Hotel, Shield, ArrowRight, Activity, Plus 
} from 'lucide-react';
import Link from 'next/link';

export default function SuppliersHubPage() {
  const suppliers = [
    {
      id: 'SUP-01',
      name: 'Emirates Airlines NDC Direct',
      type: 'AIRLINE_NDC',
      region: 'Middle East & Global',
      syncStatus: 'REALTIME_LIVE',
      activeOffers: '1,420 Fares',
      margin: 'Zero GDS markup (Net Fare)',
      lastSync: '2 mins ago',
    },
    {
      id: 'SUP-02',
      name: 'Atlantis Resorts & Residences',
      type: 'HOTEL_CHAIN',
      region: 'Dubai, UAE',
      syncStatus: 'REALTIME_LIVE',
      activeOffers: '24 Suite Categories',
      margin: '18% Contracted B2B Yield',
      lastSync: '5 mins ago',
    },
    {
      id: 'SUP-03',
      name: 'Kerala Spice Country DMC',
      type: 'LOCAL_OPERATOR',
      region: 'Kerala, India',
      syncStatus: 'REALTIME_LIVE',
      activeOffers: '48 Houseboat & Tour Slots',
      margin: '22% Operator Commission',
      lastSync: '10 mins ago',
    },
    {
      id: 'SUP-04',
      name: 'Swiss Travel System GDS',
      type: 'RAIL_TRANSIT',
      region: 'Switzerland',
      syncStatus: 'REALTIME_LIVE',
      activeOffers: 'All Swiss Passes',
      margin: '7% Pass Commission',
      lastSync: '15 mins ago',
    },
  ];

  return (
    <InternalLayout
      headerTitle="Suppliers & Inventory Hub"
      headerSubtitle="Direct Airline NDC Feeds • B2B Partner Contracts"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/partner/dashboard"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            <Handshake className="w-3.5 h-3.5 text-sky-400" />
            <span>B2B Partner Portal</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Connected Suppliers</span>
            <div className="text-2xl font-black text-white">18 Connected</div>
            <span className="text-[11px] text-emerald-400 font-semibold">12 Real-time NDC/API</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Inventory Offers</span>
            <div className="text-2xl font-black text-sky-400">4,892 Active</div>
            <span className="text-[11px] text-slate-400">TTL &lt; 10m Freshness</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Direct NDC Bookings</span>
            <div className="text-2xl font-black text-emerald-400">318 Flights</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Zero Markup Leakage</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sync Success Rate</span>
            <div className="text-2xl font-black text-white">99.4%</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Delta Sync Healthy</span>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-sm text-white">Active Supplier Fleet</span>
            <span className="text-xs text-slate-400">100% Verified Partners</span>
          </div>
          <div className="divide-y divide-slate-800">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{s.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                      {s.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>Region: {s.region}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{s.activeOffers}</span>
                    <span>•</span>
                    <span className="text-slate-300">{s.margin}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">Synced {s.lastSync}</span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
