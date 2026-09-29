'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sliders, Activity, CheckSquare, Layers, Users, 
  Briefcase, DollarSign, Mic, Building2, Lightbulb, 
  Globe, BookOpen, ChevronLeft, ChevronRight, Shield, 
  Compass, Radio, FileText, ArrowLeft, Languages,
  TrendingUp, Calculator, FileSpreadsheet, ArrowLeftRight,
  Handshake, ShieldCheck, Sparkles, MapPin, Search, Megaphone, Code, Database
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/travel/LanguageSwitcher';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Experience & Growth (VIBE8 + HESTIA8)',
    items: [
      { name: 'VIBE8 CMS Hub', href: '/admin/cms', icon: Globe, badge: 'CMS' },
      { name: 'Journey Studio', href: '/admin/journey-studio', icon: Compass, badge: 'Living' },
      { name: 'Destination Studio', href: '/admin/destination-studio', icon: MapPin },
      { name: 'HESTIA8 AI SEO', href: '/admin/seo', icon: Search, badge: 'AEO' },
      { name: 'Campaign Studio', href: '/admin/campaign-studio', icon: Megaphone, badge: 'Omni' },
    ],
  },
  {
    title: 'Command & Governance',
    items: [
      { name: 'CRUDE8 Engine', href: '/admin/crude8', icon: Database, badge: 'Sync8' },
      { name: 'SaaS Control Plane', href: '/admin/dashboard', icon: Sliders },
      { name: 'Developer Portal', href: '/admin/developer', icon: Code, badge: 'API' },
      { name: 'Approvals Queue', href: '/admin/approvals', icon: CheckSquare, badge: '3' },
      { name: 'System Telemetry', href: '/admin/system-health', icon: Activity },
      { name: 'VIBE Builder', href: '/admin/builder', icon: Layers },
    ],
  },
  {
    title: 'CRM & Sales Engine',
    items: [
      { name: 'CRM Pipeline Overview', href: '/crm/dashboard', icon: TrendingUp },
      { name: 'Leads & Prospects', href: '/crm/leads', icon: Users, badge: 'Active' },
      { name: 'Quote Builder', href: '/crm/quotes', icon: Calculator },
      { name: 'Agent Desk', href: '/agent/dashboard', icon: Briefcase },
    ],
  },
  {
    title: 'Fulfillment & Operations',
    items: [
      { name: 'Travel Control Tower', href: '/operations/control-tower', icon: Radio, badge: 'Radar' },
      { name: 'TMS Travel Dispatch', href: '/operations/dashboard', icon: Compass, badge: 'Live' },
      { name: 'DMS8 Travel Vault', href: '/admin/dms', icon: FileText, badge: 'Vault' },
      { name: 'ERP Booking Tasks', href: '/erp/dashboard', icon: Briefcase },
      { name: 'B2B Partner Portal', href: '/partner/dashboard', icon: Handshake },
    ],
  },
  {
    title: 'FinTech & Accounting',
    items: [
      { name: 'Finance & Tax Center', href: '/finance/dashboard', icon: DollarSign },
      { name: 'General Ledger', href: '/finance/general-ledger', icon: FileSpreadsheet },
      { name: 'Chart of Accounts', href: '/finance/chart-of-accounts', icon: Layers },
      { name: 'Bank Reconciliation', href: '/finance/reconciliation', icon: ArrowLeftRight },
    ],
  },
  {
    title: 'Intelligence & Enterprise',
    items: [
      { name: 'Voice AI Console (VN8)', href: '/voice', icon: Mic, badge: 'NVIDIA' },
      { name: 'Corporate Travel OS', href: '/corporate', icon: Building2 },
      { name: 'Idea Discovery Engine', href: '/ideas', icon: Lightbulb, badge: 'H8' },
      { name: 'Social8 Travel Circles', href: '/circles', icon: Radio },
    ],
  },
];

export function InternalSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
              TP
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm tracking-tight">TRAVEL PLANET</span>
                </div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  Voyage8 Kernel v2.0
                </span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Tenant & Operator Badge */}
        {!collapsed && (
          <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-200">HQ • Global Tenant</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold">
              SUPER_ADMIN
            </span>
          </div>
        )}

        {/* Nav Groups */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'}`} />
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                              isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-sky-400 border border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Language</span>
            <LanguageSwitcher />
          </div>
        )}

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition"
          title={collapsed ? 'Marketplace' : undefined}
        >
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          {!collapsed && <span>B2C Marketplace</span>}
        </Link>

        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition"
          title={collapsed ? 'Help Center' : undefined}
        >
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          {!collapsed && <span>Help & Runbooks</span>}
        </Link>
      </div>
    </aside>
  );
}
