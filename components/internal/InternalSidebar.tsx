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
  Handshake, ShieldCheck, Sparkles, MapPin, Search, Megaphone, 
  Code, Database, Key, Calendar, Eye, FileCode, CreditCard, 
  Receipt, Star, Wand2, FileEdit, Bot, Settings, ToggleRight, 
  GitBranch, Terminal, LayoutDashboard, UserPlus, PhoneCall, 
  Clock, Package, Image, UploadCloud, ChevronDown, Check, Building
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/travel/LanguageSwitcher';
import { useNavigation } from '@/components/navigation/NavigationContext';
import { getAllBranches } from '@/lib/navigation/branches';
import { UserRole } from '@/lib/navigation/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home: LayoutDashboard,
  LayoutDashboard,
  TrendingUp,
  Plane: Compass,
  Compass,
  CheckSquare,
  Package,
  Building2,
  Radio,
  Users,
  UserPlus,
  PhoneCall,
  Clock,
  Calculator,
  Globe,
  Layers,
  FileText,
  Image,
  Megaphone,
  Tag: Megaphone,
  BarChart2: TrendingUp,
  Search,
  Key,
  Calendar,
  Eye,
  Activity,
  Folder: FileText,
  FileCode,
  Briefcase,
  DollarSign,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  ArrowLeftRight,
  MessageSquare: Radio,
  Star,
  MapPin,
  Sparkles,
  Mic,
  Wand2,
  FileEdit,
  Bot,
  Settings,
  Building,
  Shield,
  Cable: Code,
  Code,
  Terminal,
  Database,
  GitBranch,
  ToggleRight,
  Sliders,
};

export function InternalSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const {
    mode,
    setMode,
    role,
    setRole,
    branch,
    setBranch,
    resolvedNav,
    setSearchOpen,
    setAiAssistOpen,
  } = useNavigation();

  const allBranches = getAllBranches();
  const availableRoles: { code: UserRole; label: string }[] = [
    { code: 'PLATFORM_SUPER_ADMIN', label: 'Super Admin (Enterprise)' },
    { code: 'BRANCH_MANAGER', label: 'Branch Manager' },
    { code: 'TRAVEL_AGENT', label: 'Travel Consultant' },
    { code: 'CUSTOMER', label: 'Customer (My Space)' },
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Upper Area */}
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
              TP
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-sm tracking-tight">TRAVEL PLANET</span>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  {mode === 'advanced' ? 'Voyage8 Kernel v2.0' : 'Business Experience OS'}
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

        {/* Experience Mode Toggle ([Simple] [Advanced]) */}
        {!collapsed && (
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Experience Mode
              </span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                mode === 'advanced' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {mode === 'expert' ? 'Platform Eng' : (mode === 'advanced' ? 'Configure' : 'Operate')}
              </span>
            </div>
            <div className="grid grid-cols-3 p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setMode('simple')}
                className={`py-1 font-bold rounded-lg transition ${
                  mode === 'simple'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setMode('advanced')}
                className={`py-1 font-bold rounded-lg transition ${
                  mode === 'advanced'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Advanced
              </button>
              <button
                type="button"
                onClick={() => setMode('expert')}
                className={`py-1 font-bold rounded-lg transition ${
                  mode === 'expert'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expert
              </button>
            </div>
          </div>
        )}

        {/* Branch Context Switcher */}
        {!collapsed && (
          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/50 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Branch Context
              </span>
              <button
                type="button"
                onClick={() => {
                  setBranchDropdownOpen(!branchDropdownOpen);
                  setRoleDropdownOpen(false);
                }}
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span className="truncate max-w-[120px]">{branch.city}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {branchDropdownOpen && (
              <div className="absolute left-4 right-4 top-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-0.5">
                {allBranches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBranch(b.id);
                      setBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                      branch.id === b.id ? 'bg-sky-600/30 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{b.name}</span>
                    {branch.id === b.id && <Check className="w-3 h-3 text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Role Switcher (For Multi-Persona Testing & Personalization) */}
        {!collapsed && (
          <div className="px-4 py-2 bg-slate-900/20 border-b border-slate-800/40 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Persona
              </span>
              <button
                type="button"
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setBranchDropdownOpen(false);
                }}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span className="truncate max-w-[120px]">{role.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {roleDropdownOpen && (
              <div className="absolute left-4 right-4 top-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-0.5">
                {availableRoles.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => {
                      setRole(r.code);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                      role === r.code ? 'bg-indigo-600/30 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    {role === r.code && <Check className="w-3 h-3 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Shortcuts: Search & AI Assist */}
        <div className="p-3 border-b border-slate-800/60 flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-800 transition"
            title="Intelligent Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            {!collapsed && <span className="text-[11px]">Search (Ctrl+K)</span>}
          </button>
          <button
            onClick={() => setAiAssistOpen(true)}
            className="px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-indigo-800/50 transition"
            title="AI Navigation Assist"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {!collapsed && <span className="text-[11px]">AI</span>}
          </button>
        </div>

        {/* Dynamic Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
          {resolvedNav.sections.map((section) => (
            <div key={section.id} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    {section.title}
                  </span>
                  {section.isAdvancedOnly && (
                    <span className="text-[8px] font-mono text-sky-400 bg-sky-500/10 px-1 py-0.2 rounded border border-sky-500/20">
                      ADVANCED
                    </span>
                  )}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon] || Layers;
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                    title={collapsed ? item.label : item.description}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'}`} />
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 ml-1 ${
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

      {/* Footer Area */}
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
