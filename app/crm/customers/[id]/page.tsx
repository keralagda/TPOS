'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  User, Mail, Phone, MapPin, Calendar, DollarSign, 
  FileText, ShieldCheck, Heart, Sparkles, MessageSquare, 
  PhoneCall, Clock, CheckCircle2, AlertTriangle, ArrowRight, 
  Plane, Hotel, Compass, Briefcase, Download, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function Customer360Page({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'CRM' | 'TRAVEL' | 'FINANCE' | 'SUPPORT' | 'DOCUMENTS' | 'ACTIVITY'>('CRM');

  // Customer 360 data mock
  const customer = {
    id: params.id || 'usr_cust_rahul',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    city: 'Mumbai, Maharashtra',
    lifecycle: 'REPEAT_TRAVELER',
    tier: 'PLATINUM',
    totalSpent: '₹5,00,290',
    activeBookingsCount: 1,
    panNumber: 'ABCDE1234F',
    passportNumber: 'Z9876543',
    passportExpiry: '14 Aug 2031 (Valid)',
    visaStatus: { UAE: '3-Day eVisa Active', Indonesia: 'VoA Eligible', Schengen: 'Expired' },
    family: [
      { name: 'Priya Sharma', relation: 'Spouse', passport: 'P8921445' },
      { name: 'Aarav Sharma', relation: 'Child (8 yrs)', passport: 'Pending' }
    ],
    preferences: {
      seat: 'Aisle + Window Pair',
      meal: 'Vegetarian Hindu Meal (AVML)',
      stays: '5-Star Luxury Resorts & Beachfront Villas',
      airlines: ['Emirates', 'Singapore Airlines']
    }
  };

  return (
    <InternalLayout
      headerTitle={`Customer 360: ${customer.name}`}
      headerSubtitle={`${customer.tier} TIER VIP • ${customer.id}`}
      actions={
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> {customer.tier} TIER VIP
          </span>
          <Link
            href="/crm/quotes?customer=usr_cust_rahul"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            Create New Quote
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Customer Header Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{customer.name}</h1>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  {customer.lifecycle}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {customer.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {customer.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {customer.city}</span>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold bg-slate-900 text-slate-300 px-2 py-0.5 rounded">PAN: {customer.panNumber}</span>
                <span className="text-[10px] font-semibold bg-slate-900 text-slate-300 px-2 py-0.5 rounded">Passport: {customer.passportNumber}</span>
                <span className="text-[10px] font-semibold bg-slate-900 text-slate-300 px-2 py-0.5 rounded">Meal: {customer.preferences.meal}</span>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col justify-between items-end text-right border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Lifetime Travel Spend</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{customer.totalSpent}</div>
            </div>
            <div className="flex gap-2 mt-2">
              <a href={`tel:${customer.phone}`} className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white transition">
                <PhoneCall className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* AI Executive Summary Card */}
        <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-800/60 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Traveler Intelligence</div>
              <p className="text-xs text-slate-200 mt-0.5">
                High-net-worth family traveler. 88% booking probability for Quote Q-2026-9011. Recommended action: <strong>Call at 3:30 PM to confirm Atlantis Royal suite upgrade before price revision.</strong>
              </p>
            </div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition whitespace-nowrap">
            Draft WhatsApp Follow-up
          </button>
        </div>

        {/* 7-Lens Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'CRM', label: '1. CRM & Sales' },
            { id: 'TRAVEL', label: '2. Bookings & Trips' },
            { id: 'FINANCE', label: '3. Finance & Ledgers' },
            { id: 'DOCUMENTS', label: '4. Passports & Visas' },
            { id: 'SUPPORT', label: '5. Support & CSAT' },
            { id: 'ACTIVITY', label: '6. Timeline & Comms' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Lens 1: CRM & Sales */}
        {activeTab === 'CRM' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Quotes */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" /> Active Quotations
                </h3>
                <span className="text-xs text-emerald-400 font-bold">1 Active</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono font-bold text-sky-400">Q-2026-9011</div>
                    <div className="text-xs font-bold text-white">5D/4N Dubai Futuristic Skyline & Desert Oasis</div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                    SENT (Valid till 10 Oct)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Cost: ₹2,85,000 • Margin: 8.01%</span>
                  <span className="font-black text-white text-sm">₹3,15,290</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <Link
                    href="/checkout?price=315290&dest=Dubai"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg text-center transition"
                  >
                    Convert to Booking
                  </Link>
                  <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold">
                    Edit Quote
                  </button>
                </div>
              </div>
            </div>

            {/* Opportunities & Enquiries */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-400" /> Active Travel Enquiries
                </h3>
                <span className="text-xs text-purple-400 font-bold">1 Open</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-purple-400 font-bold">ENQ-801</span>
                  <span className="text-[10px] font-bold text-slate-400">High Urgency</span>
                </div>
                <div className="text-xs font-bold text-white">Mumbai to Dubai (12 Nov - 17 Nov)</div>
                <div className="text-[11px] text-slate-400">2 Adults, 1 Child • 5-Star Hotel • Private Transport</div>
                <div className="text-[11px] text-slate-300">Activities: Desert Safari, Private Yacht, Burj Khalifa Sky</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Lens 2: Bookings & Trips */}
        {activeTab === 'TRAVEL' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" /> All Travel Bookings & Trips
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="font-mono font-bold text-sky-400 text-sm">TP-892401</div>
                  <div className="font-bold text-white">5D/4N Dubai Futuristic Skyline (Nov 2026)</div>
                  <div className="text-slate-400 text-[11px]">Flight: Emirates EK501 • Stay: Atlantis The Royal</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-white">₹3,15,290</div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    CONFIRMED
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 opacity-80">
                <div>
                  <div className="font-mono font-bold text-slate-400 text-sm">TP-771920</div>
                  <div className="font-bold text-white">7D/6N Bali Island Odyssey (Mar 2026)</div>
                  <div className="text-slate-400 text-[11px]">Flight: Singapore Airlines • Stay: Viceroy Bali</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-white">₹1,85,000</div>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    COMPLETED
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Lens 3: Finance & Ledgers */}
        {activeTab === 'FINANCE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Statutory Tax & LRS Accumulator
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Customer PAN:</span>
                  <span className="font-mono font-bold text-white">{customer.panNumber} (NSDL Verified)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Current FY LRS Remittances:</span>
                  <span className="font-mono font-bold text-white">₹4,20,000 / ₹7,00,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Applicable TCS Rate:</span>
                  <span className="font-bold text-emerald-400">5% (Below ₹7L threshold)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Form 27D Certificate:</span>
                  <span className="font-mono text-sky-400 hover:underline cursor-pointer">27D-2026-0012.pdf</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" /> Sales Invoices
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-mono font-bold text-sky-400">INV-2026-0891</div>
                    <div className="text-[11px] text-slate-400">Booking TP-892401</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">₹3,15,290</div>
                    <span className="text-[10px] text-emerald-400 font-bold">PAID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Lens 4: Documents */}
        {activeTab === 'DOCUMENTS' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" /> Passport & Visa Locker
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                <div className="text-slate-400">Indian Passport</div>
                <div className="font-mono font-bold text-white text-sm">{customer.passportNumber}</div>
                <div className="text-[11px] text-emerald-400">Valid until 14 Aug 2031</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                <div className="text-slate-400">United Arab Emirates eVisa</div>
                <div className="font-mono font-bold text-white text-sm">EVISA-DXB-99120</div>
                <div className="text-[11px] text-emerald-400">Approved & Issued</div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                <div className="text-slate-400">Travel Insurance</div>
                <div className="font-mono font-bold text-white text-sm">TATA-AIG-INTL-441</div>
                <div className="text-[11px] text-emerald-400">$100,000 Emergency Medical</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Lens 5 & 6: Activity Timeline */}
        {(activeTab === 'ACTIVITY' || activeTab === 'SUPPORT') && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Comprehensive Activity & Communication History
            </h3>
            <div className="space-y-3 text-xs border-l-2 border-slate-700 ml-3 pl-4">
              <div className="space-y-1 relative">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 absolute -left-[21px] top-1" />
                <div className="text-slate-400 text-[10px]">Today, 11:17 AM • Portal</div>
                <div className="font-bold text-white">Client viewed Quote Q-2026-9011 online</div>
              </div>
              <div className="space-y-1 relative">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                <div className="text-slate-400 text-[10px]">Yesterday, 04:30 PM • Agent: Priya Sharma</div>
                <div className="font-bold text-white">Custom 5D/4N Dubai Luxury Itinerary Quote generated & dispatched</div>
              </div>
              <div className="space-y-1 relative">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 absolute -left-[21px] top-1" />
                <div className="text-slate-400 text-[10px]">2 days ago, 02:15 PM • System</div>
                <div className="font-bold text-white">Trip planner inquiry captured for Dubai family holiday</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
