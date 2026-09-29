'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Plane, Hotel, Car, Compass, ShieldCheck, CheckCircle2, 
  Clock, AlertTriangle, User, Users, Calendar, MapPin, Download, 
  ExternalLink, PhoneCall, MessageSquare, ArrowRight, FileText, Check
} from 'lucide-react';
import Link from 'next/link';

export default function TripCommandCenterPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'COMPONENTS' | 'DISPATCH_LOG'>('COMPONENTS');
  const [notice, setNotice] = useState<string | null>(null);

  const [transferDispatched, setTransferDispatched] = useState(false);

  const trip = {
    id: params.id || 'trip_tp892401',
    bookingNumber: 'TP-892401',
    title: '5D/4N Dubai Futuristic Skyline & Desert Oasis',
    customer: 'Rahul Sharma',
    phone: '+91 98765 43210',
    destination: 'Dubai & Abu Dhabi, UAE',
    dates: '12 Nov 2026 - 17 Nov 2026',
    pax: 3,
    components: {
      flight: { status: 'CONFIRMED', ref: 'EK-PNR-77192', desc: 'Emirates BOM-DXB-BOM Return (3 Pax)' },
      hotel: { status: 'CONFIRMED', ref: 'HTL-ATR-8812', desc: 'Atlantis The Royal Palm View Room (4 Nights)' },
      transfer: { 
        status: transferDispatched ? 'DISPATCHED' : 'PENDING', 
        ref: 'TRF-LIM-90', 
        desc: 'Private Chauffeur Limousine DXB Airport' 
      },
      experience: { status: 'CONFIRMED', ref: 'EXP-YCH-40', desc: 'Private Yacht Charter & VIP Desert Safari' },
      visa: { status: 'APPROVED', ref: 'EVISA-DXB-99120', desc: '3-Day UAE eVisa (3 Pax Verified)' },
      payment: { status: 'PAID', ref: 'TXN-RAZOR-8812', desc: 'Total ₹3,15,290 Reconciled & Invoiced' }
    }
  };

  const handleDispatchTransfer = () => {
    setTransferDispatched(true);
    setNotice('Chauffeur limousine successfully dispatched. Driver contact assigned to client via WhatsApp.');
  };

  return (
    <InternalLayout
      headerTitle={`Trip Command Center: ${trip.bookingNumber}`}
      headerSubtitle={`${trip.destination} • ${trip.customer} (${trip.pax} Pax)`}
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('COMPONENTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'COMPONENTS' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Fulfillment Cards
          </button>
          <button
            onClick={() => setActiveTab('DISPATCH_LOG')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'DISPATCH_LOG' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Dispatch Audit Log
          </button>
          <button
            onClick={() => setNotice('Voucher packet zip compiled & dispatched to agent desk.')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vouchers</span>
          </button>
          <Link
            href="/finance/general-ledger"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
          >
            Ledger Traceability →
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

        {/* Header Overview Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-sky-400">{trip.bookingNumber}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {transferDispatched ? '100% FULFILLED' : '83% FULFILLED'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> {trip.customer}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {trip.dates}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {trip.destination}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {trip.pax} Travelers</span>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end text-right">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="text-[10px] text-slate-400 uppercase">Emergency Concierge Assigned</div>
              <div className="font-bold text-white mt-0.5">Gulf Oasis DMC Desk (+971 50 734 7676)</div>
            </div>
            <div className="flex gap-2 mt-3">
              <Link
                href="/crm/customers/usr_cust_rahul"
                className="text-xs text-sky-400 hover:underline font-bold flex items-center gap-1"
              >
                <span>View Customer 360</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tab 1: Components View */}
        {activeTab === 'COMPONENTS' && (
          <div className="space-y-6">
            {/* Trip Lifecycle Stepper */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trip Execution Lifecycle</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 text-center text-xs">
                {[
                  { stage: 'PLANNED', active: true },
                  { stage: 'BOOKING', active: true },
                  { stage: 'CONFIRMATION', active: true, current: true },
                  { stage: 'PRE_TRAVEL', active: false },
                  { stage: 'ACTIVE', active: false },
                  { stage: 'COMPLETED', active: false },
                  { stage: 'POST_TRIP', active: false }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${
                      s.current ? 'border-sky-500 bg-sky-950/60 text-sky-300 font-bold ring-2 ring-sky-500/30' :
                      s.active ? 'border-emerald-600 bg-emerald-950/40 text-emerald-300 font-semibold' :
                      'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] opacity-70">Step {idx + 1}</div>
                    <div className="text-xs truncate mt-0.5">{s.stage}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Fulfilment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Flight */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-sky-400" />
                    <h4 className="font-bold text-white text-sm">Flight Ticketing</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {trip.components.flight.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{trip.components.flight.desc}</p>
                <div className="text-[11px] text-slate-400 font-mono">Ref: {trip.components.flight.ref}</div>
              </div>

              {/* Hotel */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-white text-sm">Hotel Voucher</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {trip.components.hotel.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{trip.components.hotel.desc}</p>
                <div className="text-[11px] text-slate-400 font-mono">Ref: {trip.components.hotel.ref}</div>
              </div>

              {/* Transfer */}
              <div className="bg-slate-900/80 border border-amber-600/50 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Airport Transfer</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    transferDispatched 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {trip.components.transfer.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{trip.components.transfer.desc}</p>
                {!transferDispatched ? (
                  <button
                    onClick={handleDispatchTransfer}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 rounded-xl transition shadow-sm"
                  >
                    Dispatch Chauffeur Now
                  </button>
                ) : (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                    <Check className="w-4 h-4" /> Driver confirmed and en-route
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-400" />
                    <h4 className="font-bold text-white text-sm">Excursion & Yacht</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {trip.components.experience.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{trip.components.experience.desc}</p>
                <div className="text-[11px] text-slate-400 font-mono">Ref: {trip.components.experience.ref}</div>
              </div>

              {/* Visa */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-sm">Visa Concierge</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {trip.components.visa.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{trip.components.visa.desc}</p>
                <div className="text-[11px] text-slate-400 font-mono">Ref: {trip.components.visa.ref}</div>
              </div>

              {/* Payment */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-sm">Commercial Payment</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {trip.components.payment.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{trip.components.payment.desc}</p>
                <div className="text-[11px] text-slate-400 font-mono">Ref: {trip.components.payment.ref}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dispatch Audit Log */}
        {activeTab === 'DISPATCH_LOG' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" /> Dispatch & Communication Audit Trail
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Chronological record of supplier confirmations and voucher deliveries.</p>
            </div>

            <div className="space-y-3">
              {[
                { time: '2026-09-25 15:40', action: 'Flight PNR EK-PNR-77192 ticket issued via NDC Emirates API', agent: 'Auto-Dispatcher' },
                { time: '2026-09-25 15:45', action: 'Hotel Atlantis The Royal confirmed via Hotelbeds direct API connector', agent: 'Fulfillment Desk' },
                { time: '2026-09-25 16:10', action: 'UAE 3-Day Tourist eVisa verified against ICAO MRZ guidelines', agent: 'Visa AI Engine' },
                { time: '2026-09-25 16:30', action: 'Commercial payment of ₹3,15,290 captured via Razorpay and posted to General Ledger', agent: 'Finance System' }
              ].map((log, i) => (
                <div key={i} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{log.action}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.time}</div>
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                    {log.agent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
