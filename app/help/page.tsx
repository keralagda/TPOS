'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { 
  HelpCircle, BookOpen, Compass, Sparkles, Shield, 
  Search, ArrowRight, ExternalLink, MessageSquare, Terminal, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Welcome to the New Travel Planet: Overview of Voyage8 architecture and foundational concepts.',
    articles: [
      { title: 'Welcome to Voyage8 Architecture', time: '3 min read', slug: 'welcome' },
      { title: 'Understanding 19 RBAC System Roles', time: '5 min read', slug: 'rbac' },
      { title: 'Multi-Tenant Workspace Boundaries', time: '4 min read', slug: 'tenancy' },
    ]
  },
  {
    id: 'traveler-ai',
    title: 'AI Travel Synthesis & Voice',
    description: 'How NVIDIA NIM powers itinerary synthesis and how VN8/VO8 resolves multilingual voice commands.',
    articles: [
      { title: '16-Stage Canonical Journey Runtime', time: '6 min read', slug: 'journey-runtime' },
      { title: 'Using Voice Commands (English, Malayalam, Hindi)', time: '4 min read', slug: 'voice-guide' },
      { title: 'GEM8 Beyond-The-Icon Provenance Rules', time: '5 min read', slug: 'gem8-rules' },
    ]
  },
  {
    id: 'operations-finance',
    title: 'CRM, TMS & Double-Entry Finance',
    description: 'Complete operational lifecycle: Leads → Quotes → Departures → General Ledger journal balances.',
    articles: [
      { title: 'Quotation Margin & GST Equations', time: '4 min read', slug: 'quotes' },
      { title: 'Automated ERP Task Generation on Booking', time: '3 min read', slug: 'erp-tasks' },
      { title: 'Double-Entry Accounting & Audit Verification', time: '7 min read', slug: 'accounting' },
    ]
  },
  {
    id: 'saas-control',
    title: 'SaaS Admin & Governance',
    description: 'Server-authoritative feature flags, operation modes, and scheduled OTA rollovers.',
    articles: [
      { title: 'Feature Flag Targeting (Tenant & Role)', time: '4 min read', slug: 'feature-flags' },
      { title: 'Operation Modes (Normal, Peak, Maintenance)', time: '5 min read', slug: 'operation-modes' },
      { title: 'DMS Tamper-Proof Document Generation', time: '3 min read', slug: 'dms-vouchers' },
    ]
  }
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-sky-900/50">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 border border-sky-400/30">
              <BookOpen className="w-3.5 h-3.5" /> Documentation & Help Center (§21)
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How can we help you today?</h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-medium">
              Explore user guides, operational runbooks, API specifications, and architectural documentation for Travel Planet (Voyage8).
            </p>

            <div className="mt-6 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 max-w-md">
              <Search className="w-4 h-4 text-sky-300" />
              <input
                type="text"
                placeholder="Search articles, guides, or operational codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white placeholder-slate-400 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HELP_CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">{cat.title}</h2>
              <p className="text-xs text-slate-500 font-medium mb-4">{cat.description}</p>

              <div className="space-y-2.5">
                {cat.articles.map((art) => (
                  <div
                    key={art.slug}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-100 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition">
                        {art.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{art.time}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Migration & Support Banner */}
        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-sky-950">Looking for System Health & Runbooks?</h3>
            <p className="text-xs text-sky-800 mt-0.5">
              Review real-time latency telemetry, incident procedures, and operations runbooks (§48).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              Control Plane <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
