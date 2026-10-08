'use client';

import React from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { Compass, Calendar, MapPin, CheckCircle2, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CustomerTripsPage() {
  const trips = [
    {
      id: 'TRP-DXB-902',
      destination: 'Dubai Luxury Skyline & Desert Safari',
      dates: '12 Nov 2026 - 17 Nov 2026',
      status: 'CONFIRMED',
      hotel: 'Atlantis The Royal, Palm Jumeirah',
      flight: 'Emirates EK 501 (BOM -> DXB)',
      pnr: '6X8KLP',
    },
    {
      id: 'TRP-BALI-104',
      destination: 'Bali Tropical Wellness & Secret Waterfalls',
      dates: '14 Jun 2026 - 21 Jun 2026',
      status: 'COMPLETED',
      hotel: 'Four Seasons Resort Bali at Sayan',
      flight: 'Singapore Airlines SQ 421',
      pnr: '9M2QRT',
    },
  ];

  return (
    <InternalLayout
      headerTitle="My Trips & Journeys"
      headerSubtitle="Upcoming and Past Travel Itineraries"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-sky-500/50 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {trip.id}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    trip.status === 'CONFIRMED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {trip.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{trip.destination}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{trip.dates}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
                <div className="text-slate-300 flex items-center justify-between">
                  <span>Hotel:</span>
                  <span className="font-semibold text-white">{trip.hotel}</span>
                </div>
                <div className="text-slate-300 flex items-center justify-between">
                  <span>Flight:</span>
                  <span className="font-semibold text-white">{trip.flight}</span>
                </div>
                <div className="text-slate-300 flex items-center justify-between">
                  <span>PNR:</span>
                  <span className="font-mono text-sky-400 font-bold">{trip.pnr}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href="/admin/dms"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>E-Tickets & Vouchers</span>
                </Link>
                <Link
                  href="/operations/control-tower"
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>Flight Radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}
