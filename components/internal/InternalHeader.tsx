'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Sparkles, Building2, Sliders, Bell, 
  ChevronDown, Check, User, Shield, ExternalLink, 
  Clock, AlertCircle, CheckCircle2, Plane, Command
} from 'lucide-react';
import { useNavigation } from '@/components/navigation/NavigationContext';
import { UniversalCreateButton } from '@/components/navigation/UniversalCreateButton';
import { getAllBranches } from '@/lib/navigation/branches';
import { UserButton, useUser } from '@clerk/nextjs';

interface InternalHeaderProps {
  headerTitle?: string;
  headerSubtitle?: string;
  actions?: React.ReactNode;
}

export function InternalHeader({
  headerTitle,
  headerSubtitle,
  actions,
}: InternalHeaderProps) {
  const { 
    branch, 
    setBranch, 
    mode, 
    setMode, 
    role,
    setRole,
    setSearchOpen, 
    setAiAssistOpen 
  } = useNavigation();

  const [branchOpen, setBranchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const allBranches = getAllBranches();
  const { user: clerkUser } = useUser();
  const displayName = clerkUser?.fullName || (clerkUser?.primaryEmailAddress?.emailAddress ? clerkUser.primaryEmailAddress.emailAddress.split('@')[0] : 'Amal Babu');
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || 'amal50058@gmail.com';
  const initials = clerkUser?.firstName
    ? `${clerkUser.firstName[0]}${clerkUser.lastName?.[0] || ''}`.toUpperCase()
    : 'AB';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (branchRef.current && !branchRef.current.contains(target)) setBranchOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const notifications = [
    {
      id: 'n-1',
      title: 'Flight EK 501 Rescheduled',
      desc: 'Dubai connection delay adjusted by 40 mins. Traveler alerted.',
      time: '12m ago',
      type: 'warning',
    },
    {
      id: 'n-2',
      title: 'New High-Value Quote Sent',
      desc: 'Priya Sharma dispatched ₹5.8L Switzerland package proposal.',
      time: '34m ago',
      type: 'success',
    },
    {
      id: 'n-3',
      title: 'UAE Visa Grant Verified',
      desc: 'Passport Z9876543 (Rahul Sharma) visa granted.',
      time: '1h ago',
      type: 'info',
    },
  ];

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-30 transition-all duration-200">
      {/* LEFT SECTION: Title, Breadcrumbs & Branch Context */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {headerTitle || 'Travel Planet OS'}
            </h1>
            {headerSubtitle && (
              <span className="hidden md:inline-flex items-center text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800/80 truncate">
                {headerSubtitle}
              </span>
            )}
          </div>
        </div>

        {/* Branch Context Dropdown Pill */}
        <div className="relative hidden lg:block" ref={branchRef}>
          <button
            onClick={() => {
              setBranchOpen(!branchOpen);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition group shadow-sm"
            title="Switch Workspace Branch Context"
          >
            <div className="w-5 h-5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
              <Building2 className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-200 font-bold">{branch.city}</span>
              <span className="text-[10px] font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-950 border border-slate-800">
                {branch.currency}
              </span>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition duration-150 ${branchOpen ? 'rotate-180' : ''}`} />
          </button>

          {branchOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Select Branch Context</span>
                <span className="font-mono text-[9px] text-sky-400">{allBranches.length} Branches</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {allBranches.map((b) => {
                  const isSelected = branch.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBranch(b.id);
                        setBranchOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-sky-600/20 text-white font-bold border border-sky-500/40' 
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{b.city} • {b.currency} • {b.timeZone}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Interactive Command Palette Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md mx-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full h-9 px-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700/80 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-between transition group shadow-inner"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition" />
            <span className="text-[11px] text-slate-400 group-hover:text-slate-300 font-medium truncate">
              Search bookings, packages, customers...
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-950 rounded border border-slate-800 group-hover:border-slate-700">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* RIGHT SECTION: Quick Actions, AI Assist, Mode Toggle & User Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Mobile Search Icon Trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4 text-sky-400" />
        </button>

        {/* Universal Create Button ("+ New") */}
        <UniversalCreateButton />

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setAiAssistOpen(true)}
          className="h-8 px-2.5 sm:px-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/60 hover:border-indigo-600/80 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95"
          title="AI Navigation Assistant (⌘J)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">AI Assist</span>
          <kbd className="hidden lg:inline-block px-1 py-0.2 text-[8px] font-mono text-indigo-400/80 bg-indigo-950 rounded border border-indigo-800/60">
            ⌘J
          </kbd>
        </button>

        {/* Experience Mode Toggle Segmented Control: Simple (Operate) | Advanced (Configure) | Expert (Engineer) */}
        <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setMode('simple')}
            className={`px-2.5 py-1 rounded-lg transition ${
              mode === 'simple'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Simple: Operate the business"
          >
            Simple
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-2.5 py-1 rounded-lg transition ${
              mode === 'advanced'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Advanced: Configure business rules & studios"
          >
            Advanced
          </button>
          <button
            onClick={() => setMode('expert')}
            className={`px-2.5 py-1 rounded-lg transition ${
              mode === 'expert'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Expert: Engineer schemas, APIs & registries"
          >
            Expert
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setBranchOpen(false);
              setProfileOpen(false);
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition relative"
            title="Operational Alerts"
          >
            <Bell className="w-3.5 h-3.5 text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Operational Alerts</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Radar Live
                </span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-slate-800/60 rounded-xl transition text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-center border-t border-slate-800">
                <Link
                  href="/operations/control-tower"
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] font-bold text-sky-400 hover:underline"
                >
                  Open Operations Control Tower →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Clerk User Account Controls */}
        <div className="flex items-center pl-1">
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* User Profile Pill & Quick Persona Switcher */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setBranchOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-[10px] shadow-sm">
              {initials}
            </div>
            <span className="hidden xl:inline font-bold text-slate-200">{displayName}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2.5 border-b border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs">
                  {initials}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{displayName}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">{displayEmail}</div>
                  <div className="text-[10px] font-mono text-sky-400 font-semibold">{role}</div>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Switch Active Persona
                </span>
                {[
                  { r: 'PLATFORM_SUPER_ADMIN', label: 'Super Administrator' },
                  { r: 'BRANCH_MANAGER', label: 'Branch Manager' },
                  { r: 'TRAVEL_AGENT', label: 'Travel Consultant' },
                  { r: 'VENDOR_ADMIN', label: 'Vendor Portal (Supplier)' },
                  { r: 'CUSTOMER', label: 'Customer Portal (Retail)' },
                  { r: 'CORPORATE_TRAVELER', label: 'Corporate Traveler' },
                ].map(({ r, label }) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r as any);
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                      role === r 
                        ? 'bg-sky-600/20 text-white font-bold border border-sky-500/30' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{label}</span>
                    {role === r && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2 text-[11px]">
                <Link
                  href="/admin/system-health"
                  onClick={() => setProfileOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  System Telemetry
                </Link>
                <Link
                  href="/"
                  onClick={() => setProfileOpen(false)}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Public Site →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Custom page actions if provided */}
        {actions && <div className="flex items-center gap-2 pl-1 border-l border-slate-800/80">{actions}</div>}
      </div>
    </header>
  );
}
