'use client';

/**
 * Travel Planet (Voyage8) — Personalized Dashboard Component
 * 
 * Dynamically switches UI and operational metrics based on:
 * ROLE + BRANCH + MODE + PERMISSIONS
 * 
 * Supports:
 * 1. Travel Agent Dashboard (Today's Work, Leads, Quotes, Tasks, AI Suggestions)
 * 2. Branch Manager Dashboard (Branch Overview, Sales, Revenue, Team, Operations)
 * 3. Enterprise Admin Dashboard (Command Center, Multi-Branch, Platform Control)
 * 4. Customer Dashboard (My Travel Space, Upcoming Trips, Documents, Community)
 */

import React from 'react';
import Link from 'next/link';
import { 
  Users, Compass, Ticket, Calculator, FileText, 
  Sparkles, TrendingUp, AlertTriangle, CheckSquare, 
  Building2, Radio, Shield, Clock, Plus, ArrowRight,
  DollarSign, Activity, Star, Calendar, MessageSquare, Bot
} from 'lucide-react';
import { useNavigation } from '@/lib/navigation/navigation-context';
import { ModuleCard } from './ModuleCard';

export function PersonalizedDashboard() {
  const { currentRole, currentBranch, mode, setIsSearchOpen, setIsQuickActionOpen } = useNavigation();

  // 1. Travel Agent Dashboard
  if (currentRole === 'TRAVEL_AGENT') {
    return (
      <div className="space-y-6">
        {/* Branch Greeting Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                {currentBranch.name} • Consultant Desk
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Today's Work & Client Tasks</h2>
            <p className="text-xs text-slate-400 mt-1">
              Prioritize hot enquiries, pending quotation links, and visa document checks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickActionOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Universal Create</span>
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>AI Task Assist</span>
            </button>
          </div>
        </div>

        {/* Today's Work: 4 Action Queues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/crm/leads" className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 p-5 rounded-2xl transition group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">New Enquiries</span>
              <Users className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">6 Inquiries</div>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> 2 received in last 1h
            </span>
          </Link>

          <Link href="/agent/dashboard" className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl transition group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Follow-ups</span>
              <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">4 Calls Due</div>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mt-1">
              VIP Honeymoon client waiting
            </span>
          </Link>

          <Link href="/crm/quotes" className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl transition group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Quotes</span>
              <Calculator className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">3 Drafts</div>
            <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1 mt-1">
              Value: {currentBranch.currencySymbol} 4,80,000
            </span>
          </Link>

          <Link href="/admin/dms" className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 p-5 rounded-2xl transition group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Documents</span>
              <FileText className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">5 Visas</div>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
              Ready for dispatch
            </span>
          </Link>
        </div>

        {/* Quick Actions & AI Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Agent Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/crm/customers?action=create" className="w-full p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center justify-between transition">
                <span>+ Create Customer</span>
                <Users className="w-4 h-4 text-sky-400" />
              </Link>
              <Link href="/admin/builder?action=new_package" className="w-full p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center justify-between transition">
                <span>+ Create Package</span>
                <Compass className="w-4 h-4 text-indigo-400" />
              </Link>
              <Link href="/crm/quotes?action=create" className="w-full p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center justify-between transition">
                <span>+ Generate Quote</span>
                <Calculator className="w-4 h-4 text-emerald-400" />
              </Link>
              <Link href="/admin/dms?action=upload" className="w-full p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center justify-between transition">
                <span>+ Upload Document</span>
                <FileText className="w-4 h-4 text-purple-400" />
              </Link>
            </div>
          </div>

          {/* AI Suggestions & Recent Departures */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Copilot Suggestions for Today</h3>
              </div>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                Powered by Voyage8 AI
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Hot Lead Opportunity:</span> Rahul Verma viewed the <em>"Munnar Luxury Tea Highlands"</em> package twice today. Generate a customized 10% early-bird quotation.
                  <div className="mt-2">
                    <Link href="/crm/quotes?action=create&customer=Rahul" className="text-xs text-sky-400 hover:underline font-bold">
                      Draft Quote with 1-Click →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Visa Auto-Verification:</span> 3 UAE e-Visas returned verified from immigration portal for the Dubai Family Group departure on Saturday.
                  <div className="mt-2">
                    <Link href="/admin/dms" className="text-xs text-emerald-400 hover:underline font-bold">
                      Open Verified Customer Documents →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Branch Manager Dashboard
  if (currentRole === 'BRANCH_MANAGER') {
    return (
      <div className="space-y-6">
        {/* Branch Overview Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {currentBranch.name} • Branch Manager Desk
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Branch Overview & Team Operations</h2>
            <p className="text-xs text-slate-400 mt-1">
              Location: {currentBranch.location} • Target: {currentBranch.monthlyRevenueTarget}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl font-bold">
              {currentBranch.activeAgentsCount} Active Advisors
            </span>
          </div>
        </div>

        {/* Branch Overview KPIs: Sales, Revenue, Bookings, Conversion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Branch Revenue (MTD)</span>
            <div className="text-2xl font-black text-emerald-400">{currentBranch.currencySymbol} 84,20,000</div>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> 84% of monthly target
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Bookings</span>
            <div className="text-2xl font-black text-white">184 Trips</div>
            <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1 mt-1">
              +14% vs last month
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lead Conversion</span>
            <div className="text-2xl font-black text-indigo-400">31.2%</div>
            <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1 mt-1">
              Branch target: 28%
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-400">2 Requests</div>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mt-1">
              1 refund, 1 discount exception
            </span>
          </div>
        </div>

        {/* 2 Columns: Team Oversight + Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team: Agents, Tasks, Approvals */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" /> Team Performance & Tasks
              </h3>
              <Link href="/crm/dashboard" className="text-xs text-sky-400 hover:underline font-bold">
                View CRM Pipeline →
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Ananya Sen (Senior Advisor)</div>
                  <div className="text-slate-400 text-[11px]">8 Active Deals • ₹12,40,000 closed MTD</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Top Performer
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Nikhil Joseph (Advisor)</div>
                  <div className="text-slate-400 text-[11px]">5 Active Deals • 3 Follow-ups pending</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  On Track
                </span>
              </div>
            </div>
          </div>

          {/* Operations: Active Trips, Issues, Supplier Updates */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" /> Operations & Supplier Updates
              </h3>
              <Link href="/operations/control-tower" className="text-xs text-emerald-400 hover:underline font-bold">
                Control Tower →
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Supplier Room Allocation Notice</div>
                  <div className="text-slate-400 text-[11px]">Taj Exotica Goa confirmed 6 extra rooms for the Diwali holiday departure block.</div>
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <Compass className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Active Departures Today</div>
                  <div className="text-slate-400 text-[11px]">4 passenger groups boarded flight EK-531 to Dubai with all digital vouchers issued.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Customer Dashboard (B2C Traveler)
  if (currentRole === 'CUSTOMER') {
    return (
      <div className="space-y-6">
        {/* Customer Travel Space Header */}
        <div className="p-6 bg-gradient-to-r from-sky-950/80 via-indigo-950/60 to-purple-950/60 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block mb-1">
              Travel Planet Concierge
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">My Travel Space</h2>
            <p className="text-xs text-slate-300 mt-1">
              Your confirmed holidays, live itineraries, flight boarding passes and memories.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/trip-planner"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Trip Planner</span>
            </Link>
          </div>
        </div>

        {/* Customer Cards Grid: Upcoming Trips, Bookings, Documents, Payments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/journeys/dubai-luxury-escape" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-sky-500/50 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Trip</span>
              <Compass className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-lg font-black text-white">Dubai Luxury Escape</div>
            <span className="text-xs font-bold text-sky-400 block mt-1">
              Departs in 4 Days • 5D / 4N
            </span>
          </Link>

          <Link href="/checkout" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">My Bookings</span>
              <Ticket className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-lg font-black text-white">1 Confirmed</div>
            <span className="text-xs font-bold text-emerald-400 block mt-1">
              PNR: TP-9082 • All vouchers ready
            </span>
          </Link>

          <Link href="/visa" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-purple-500/50 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Documents & Visas</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-black text-white">3 Verified Files</div>
            <span className="text-xs font-bold text-purple-400 block mt-1">
              UAE Express e-Visa Approved
            </span>
          </Link>

          <Link href="/circles" className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Travel Community</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-white">Social Circles</div>
            <span className="text-xs font-bold text-emerald-400 block mt-1">
              Join Dubai Explorers Circle
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Default: Enterprise Admin Dashboard (Command Center)
  return (
    <div className="space-y-6">
      {/* Multi-Branch Command Center Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              {currentBranch.name} • Enterprise Command Center
            </span>
            {mode === 'advanced' && (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-bold">
                Platform Studio Active
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Organization Command Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Unified governance across all 5 regional branch offices, revenue pipelines, and operational health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickActionOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-600/20"
          >
            <Plus className="w-4 h-4 font-black" />
            <span>Universal Create</span>
          </button>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Search or Speak</span>
            <kbd className="hidden sm:inline text-[9px] font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-700 text-slate-400">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* 4 Core Command KPIs: Gross Revenue, Total Bookings, Active Trips, System Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gross Revenue (GBV)</span>
          <div className="text-2xl font-black text-emerald-400">₹4,82,40,000</div>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +24.2% across branches
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Bookings (MTD)</span>
          <div className="text-2xl font-black text-white">1,420</div>
          <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1 mt-1">
            18 Today • All within SLA
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Branches & Desks</span>
          <div className="text-2xl font-black text-indigo-400">5 Offices</div>
          <span className="text-[11px] font-bold text-slate-400 block mt-1">
            Kochi • Dubai • Trivandrum • Singapore
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">System Health & Telemetry</span>
          <div className="text-2xl font-black text-white">99.98%</div>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
            All NDC & GDS connectors live
          </span>
        </div>
      </div>

      {/* Featured Goal-Based Modules (Showcasing Module Card Standard) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Core Business Experiences
          </span>
          <span className="text-[11px] text-slate-400">
            {mode === 'simple' ? 'Simple Mode (Technical details hidden)' : 'Advanced Mode (Technical engines revealed)'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModuleCard
            aliasKey="VIBE8 CMS"
            customTitle="Website Builder"
            customDescription="Create and manage travel websites."
            customTechLabel="Powered by VIBE8"
            href="/admin/cms"
            badge="CMS"
          />
          <ModuleCard
            aliasKey="HESTIA8"
            customTitle="SEO Growth"
            customDescription="Improve Google visibility and content performance."
            customTechLabel="Powered by HESTIA8"
            href="/admin/seo"
            badge="AEO"
          />
          <ModuleCard
            aliasKey="DMS8"
            customTitle="Documents"
            customDescription="Manage travel files and approvals."
            customTechLabel="Powered by DMS8"
            href="/admin/dms"
            badge="Vault"
          />
          <ModuleCard
            aliasKey="CRUDE8"
            customTitle="Custom Tools"
            customDescription="Create business workflows."
            customTechLabel="Powered by CRUDE8"
            href="/admin/crude8/studio"
            badge="Builder"
          />
        </div>
      </div>
    </div>
  );
}
