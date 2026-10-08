'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Users, CheckSquare, Clock, Calculator, 
  FileText, Plus, Compass, Sparkles, Building2, AlertTriangle, 
  Radio, Shield, DollarSign, Activity, Cable, Bot, 
  CreditCard, Image, Star, ArrowRight, UserPlus, Package, UploadCloud
} from 'lucide-react';
import { useNavigation } from '@/components/navigation/NavigationContext';
import { ModuleCard } from '@/components/navigation/ModuleCard';

export function PersonalizedDashboard() {
  const { role, branch, mode } = useNavigation();

  // 1. TRAVEL AGENT DASHBOARD
  if (role === 'TRAVEL_AGENT') {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                {branch.name} • Active Desk
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Good day, Travel Consultant
            </h1>
            <p className="text-xs text-slate-300">
              Here is your today&apos;s queue, pending traveler quotes, and active bookings.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/crm/leads?action=new-customer"
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Customer</span>
            </Link>
            <Link
              href="/packages?action=new-package"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Create Package</span>
            </Link>
            <Link
              href="/crm/quotes"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Generate Quote</span>
            </Link>
            <Link
              href="/admin/dms?action=upload"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>

        {/* Today's Work: 4 Priority Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase text-slate-400">Today&apos;s Work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">New Enquiries</span>
              <div className="text-2xl font-black text-white">4 Pending</div>
              <span className="text-[11px] text-amber-400 font-semibold">2 response SLAs due in 1hr</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Follow-ups</span>
              <div className="text-2xl font-black text-sky-400">6 Scheduled</div>
              <span className="text-[11px] text-slate-400">Calls & WhatsApp reminders</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Quotes</span>
              <div className="text-2xl font-black text-purple-400">3 Quotes</div>
              <span className="text-[11px] text-slate-400">Pipeline value: ₹4,80,000</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Documents</span>
              <div className="text-2xl font-black text-emerald-400">5 Passports</div>
              <span className="text-[11px] text-emerald-400 font-semibold">Ready for visa dispatch</span>
            </div>
          </div>
        </div>

        {/* My Trips & Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" /> My Trips & Itineraries
              </h3>
              <Link href="/journeys" className="text-xs text-sky-400 hover:underline font-bold">
                View All →
              </Link>
            </div>
            <div className="space-y-2.5">
              {[
                { title: 'Dubai Luxury Skyline & Desert Safari', pax: 'Vikram & Priya (2 Pax)', dates: '12 Nov - 17 Nov', status: 'Confirmed' },
                { title: 'Bali Tropical Wellness & Rice Terraces', pax: 'Arjun Mehta Family (4 Pax)', dates: '24 Dec - 30 Dec', status: 'Quote Sent' },
                { title: 'Kashmir Autumn Valleys & Houseboats', pax: 'Sunita Rao (2 Pax)', dates: '18 Oct - 23 Oct', status: 'Inquiry' },
              ].map((trip, idx) => (
                <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{trip.title}</div>
                    <div className="text-slate-400 text-[11px]">{trip.pax} • {trip.dates}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {trip.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> AI Suggestions & Copilot
              </h3>
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                TravelAI
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-xl space-y-1">
                <div className="font-bold text-indigo-300">Hot Lead Follow-up Nudge</div>
                <p className="text-slate-400 text-[11px]">
                  Vikram Oberoi viewed Dubai Quote 3 times this morning. Suggest adding Burj Khalifa fast-track pass to close deal.
                </p>
              </div>
              <div className="p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-xl space-y-1">
                <div className="font-bold text-indigo-300">Winter Package Opportunity</div>
                <p className="text-slate-400 text-[11px]">
                  Kerala Ayurveda searches are up +34% from Delhi. Synthesize a 5-night Kovalam retreat for family leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. BRANCH MANAGER DASHBOARD
  if (role === 'BRANCH_MANAGER') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Branch Command • {branch.name}
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Branch Manager Overview
            </h1>
            <p className="text-xs text-slate-300">
              Supervising {branch.activeAgentsCount} active consultants, branch targets, and local operations in {branch.city}.
            </p>
          </div>
        </div>

        {/* Branch Overview: Sales, Revenue, Bookings, Conversion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Branch Revenue (MTD)</span>
            <div className="text-2xl font-black text-emerald-400">{branch.currency === 'AED' ? 'AED 240,000' : '₹58,40,000'}</div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +16.2% vs target
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed Bookings</span>
            <div className="text-2xl font-black text-white">48 Bookings</div>
            <span className="text-[11px] text-slate-400">Average ticket: ₹1,21,000</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lead Conversion</span>
            <div className="text-2xl font-black text-sky-400">31.4%</div>
            <span className="text-[11px] text-sky-400 font-semibold">+3.1% this week</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Agents</span>
            <div className="text-2xl font-black text-white">{branch.activeAgentsCount} Desk Staff</div>
            <span className="text-[11px] text-emerald-400 font-semibold">100% attendance</span>
          </div>
        </div>

        {/* Team & Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" /> Team: Agents, Tasks & Approvals
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Refund Authorization Gate</div>
                  <div className="text-slate-400 text-[11px]">Booking #BK-9428 • Dubai Flight Reschedule</div>
                </div>
                <Link href="/admin/approvals" className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold rounded-lg border border-amber-500/30">
                  Review Sign-off
                </Link>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">High Value Quote Approval (&gt;₹5L)</div>
                  <div className="text-slate-400 text-[11px]">Consultant: Priya Sharma • Switzerland Group</div>
                </div>
                <Link href="/admin/approvals" className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/30">
                  Approve (9% Margin)
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" /> Operations: Active Trips & Supplier Alerts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Active Departures Today</div>
                  <div className="text-slate-400 text-[11px]">8 Passenger groups in transit via COK / DXB</div>
                </div>
                <span className="text-emerald-400 font-bold">On Schedule</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Local DMC Rate Update</div>
                  <div className="text-slate-400 text-[11px]">Kochi Backwaters Houseboat seasonal tariff synced</div>
                </div>
                <span className="text-sky-400 font-bold">Fresh TTL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. CUSTOMER DASHBOARD (CUSTOMER / CORPORATE_TRAVELER)
  if (role === 'CUSTOMER' || role === 'CORPORATE_TRAVELER') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              My Travel Space • PROFILE8 Digital Passport
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back, Rahul Sharma
            </h1>
            <p className="text-xs text-slate-300">
              Gold Explorer • 1,400 loyalty points • Your personal journey companion.
            </p>
          </div>
          <Link
            href="/packages"
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Next Destination</span>
          </Link>
        </div>

        {/* 4 Cards: Upcoming Trips, Bookings, Documents, Payments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Trips</span>
            <div className="text-2xl font-black text-sky-400">1 Confirmed</div>
            <span className="text-[11px] text-slate-400">Dubai Highlights (12 Nov)</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bookings</span>
            <div className="text-2xl font-black text-white">4 Completed</div>
            <span className="text-[11px] text-emerald-400 font-semibold">100% verified</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Documents</span>
            <div className="text-2xl font-black text-emerald-400">1 Valid Visa</div>
            <span className="text-[11px] text-slate-400">UAE 30-Day Tourist Visa</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Payments</span>
            <div className="text-2xl font-black text-white">Zero Due</div>
            <span className="text-[11px] text-emerald-400 font-semibold">All invoices settled</span>
          </div>
        </div>

        {/* Memories & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-400" /> Travel Memories & Diaries
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
              You shared 12 verified photos from your Bali honeymoon trip in June!
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" /> Travel Community & Recommendations
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
              Join the &quot;Desert Safari Explorers&quot; Circle with 240+ travelers heading to the Emirates this season.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. VENDOR PORTAL DASHBOARD (VENDOR_ADMIN / VENDOR_OPERATOR / PARTNER / DMC_USER)
  const isVendorUser =
    role.startsWith('VENDOR_') ||
    role === 'PARTNER' ||
    role === 'DMC_USER' ||
    role === 'HOTEL_USER' ||
    role === 'TRANSPORT_OPERATOR' ||
    role === 'EXPERIENCE_PROVIDER';

  if (isVendorUser) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                Vendor Supply Console • Verified Supplier
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Supplier & Inventory Hub
            </h1>
            <p className="text-xs text-slate-300">
              Manage live inventory allotments, wholesale contract rates, booking vouchers, and settlement ledger.
            </p>
          </div>
          <Link
            href="/partner/dashboard"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Calculator className="w-4 h-4" />
            <span>Manage Net Rates</span>
          </Link>
        </div>

        {/* 4 Primary Vendor KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available Credit</span>
            <div className="text-2xl font-black text-emerald-400">₹18,40,000</div>
            <span className="text-[11px] text-slate-400">Limit: ₹25,00,000</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Confirmations</span>
            <div className="text-2xl font-black text-amber-400">3 Bookings</div>
            <span className="text-[11px] text-amber-300 font-semibold">Action required within 2h</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Products</span>
            <div className="text-2xl font-black text-sky-400">14 Catalog Items</div>
            <span className="text-[11px] text-slate-400">Rooms, Safaris & Transfers</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Accrued Commission</span>
            <div className="text-2xl font-black text-purple-400">₹3,42,800</div>
            <span className="text-[11px] text-slate-400">Payout: 1st of month</span>
          </div>
        </div>

        {/* Vendor Operational Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" /> Today&apos;s Deliveries & Check-Ins
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Address Dubai Marina (Booking #TP-8491)</div>
                  <div className="text-slate-400 text-[11px]">2 Pax • Deluxe Marina View • Check-in 14:00</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300">CONFIRMED</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">VIP Desert Safari Transfer (#TP-8495)</div>
                  <div className="text-slate-400 text-[11px]">4 Pax • Private 4x4 Land Cruiser • Pickup 15:30</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300">DISPATCH READY</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-400" /> Settlement & Rate Verification
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>Your wholesale contract rates are protected under <strong className="text-white">OWN_VENDOR</strong> strict data scoping.</p>
              <p className="text-[11px] text-slate-400">Retail customer markups, internal operating margins, and other supplier rates remain isolated and strictly inaccessible.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. ENTERPRISE ADMIN DASHBOARD (DEFAULT FOR SUPER ADMIN / ADMIN)
  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              {branch.name} • {mode === 'advanced' ? 'Advanced Platform Mode' : 'Business Experience Mode'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Enterprise Command Center
          </h1>
          <p className="text-xs text-slate-300">
            Platform-wide governance across operations, sales pipeline, marketing engines, and financial reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold">
            SUPER_ADMIN
          </span>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
            HEALTH: 99.98%
          </span>
        </div>
      </div>

      {/* 4 Primary Command Center KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Organization Branches</span>
          <div className="text-2xl font-black text-white">6 Active</div>
          <span className="text-[11px] text-sky-400 font-semibold">Kochi • Dubai • Delhi • Mumbai</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Revenue (MTD)</span>
          <div className="text-2xl font-black text-emerald-400">₹4,82,40,000</div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24.2% MoM Growth
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Travelers Abroad</span>
          <div className="text-2xl font-black text-sky-400">42 Groups</div>
          <span className="text-[11px] text-slate-400">100% On-Schedule</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">System Health</span>
          <div className="text-2xl font-black text-emerald-400">100% Live</div>
          <span className="text-[11px] text-slate-400">Zero Gateway Disruption</span>
        </div>
      </div>

      {/* Advanced Mode: Platform Studio Showcase Cards */}
      {mode === 'advanced' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" /> Platform Studio & Underlying Engines
              </h2>
              <p className="text-xs text-slate-400">Every advanced module displays its business title, description, and technical engine label.</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
              LAYER 2: ADVANCED PLATFORM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModuleCard
              aliasKey="VIBE8 CMS"
              href="/admin/builder"
              badge="Visual"
            />
            <ModuleCard
              aliasKey="HESTIA8"
              href="/admin/seo"
              badge="AEO"
            />
            <ModuleCard
              aliasKey="DMS8"
              href="/admin/dms"
              badge="Vault"
            />
            <ModuleCard
              aliasKey="CRUDE8"
              href="/admin/crude8/studio"
              badge="Sync8"
            />
          </div>
        </div>
      )}

      {/* Operations & Platform Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" /> Operations: Trips, Bookings & Suppliers
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Pending PNRs</div>
              <div className="text-lg font-black text-white mt-1">18 PNRs</div>
              <div className="text-[10px] text-emerald-400">Within SLA</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Active Suppliers</div>
              <div className="text-lg font-black text-sky-400 mt-1">18 Live</div>
              <div className="text-[10px] text-slate-400">NDC & GDS Connected</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Disruptions</div>
              <div className="text-lg font-black text-emerald-400 mt-1">0 Critical</div>
              <div className="text-[10px] text-emerald-400">Clear Sky</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Platform: AI, Automation, Integrations & Security
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">AI Actions</div>
              <div className="text-lg font-black text-indigo-400 mt-1">412 Dispatched</div>
              <div className="text-[10px] text-indigo-300">100% Governed</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Webhooks</div>
              <div className="text-lg font-black text-white mt-1">1,842 Events</div>
              <div className="text-[10px] text-emerald-400">100% HMAC Valid</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Tenant Isolation</div>
              <div className="text-lg font-black text-emerald-400 mt-1">RLS Active</div>
              <div className="text-[10px] text-slate-400">Zero Leaks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
