'use client';

/**
 * Travel Planet (Voyage8) — Universal Quick Action System
 * 
 * Provides the global universal create dropdown:
 * + New Customer
 * + New Trip
 * + New Booking
 * + New Package
 * + Upload Document
 * + Create Campaign
 */

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Users, Compass, Ticket, Package, 
  FileUp, Megaphone, ChevronDown, Sparkles, X, Check
} from 'lucide-react';
import { useNavigation } from '@/lib/navigation/navigation-context';

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'act_new_customer',
    title: '+ New Customer',
    description: 'Onboard a new traveler with contact & passport details',
    route: '/crm/customers?action=create',
    icon: Users,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    category: 'Sales & CRM',
  },
  {
    id: 'act_new_trip',
    title: '+ New Trip',
    description: 'Create multi-destination journey and synthesize day-plans',
    route: '/admin/journey-studio?action=create',
    icon: Compass,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    category: 'Travel Operations',
  },
  {
    id: 'act_new_booking',
    title: '+ New Booking',
    description: 'Book flight, hotel or holiday package for a customer',
    route: '/operations/dashboard?action=create_booking',
    icon: Ticket,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    category: 'Operations',
  },
  {
    id: 'act_new_package',
    title: '+ New Package',
    description: 'Build a featured holiday package with pricing tiers',
    route: '/admin/builder?action=new_package',
    icon: Package,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    category: 'Products',
  },
  {
    id: 'act_upload_doc',
    title: '+ Upload Document',
    description: 'Store passport, visa, flight voucher or customer file',
    route: '/admin/dms?action=upload',
    icon: FileUp,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    category: 'Documents',
  },
  {
    id: 'act_create_campaign',
    title: '+ Create Campaign',
    description: 'Launch promotional holiday deal or seasonal flash sale',
    route: '/admin/campaign-studio?action=create',
    icon: Megaphone,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    category: 'Marketing',
  },
];

export function UniversalQuickAction() {
  const router = useRouter();
  const { isQuickActionOpen, setIsQuickActionOpen } = useNavigation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsQuickActionOpen(false);
      }
    };

    if (isQuickActionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuickActionOpen, setIsQuickActionOpen]);

  const handleActionClick = (route: string) => {
    setIsQuickActionOpen(false);
    router.push(route);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Universal Create Button */}
      <button
        type="button"
        onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
        className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20"
        title="Universal Quick Action"
      >
        <Plus className="w-4 h-4 shrink-0 font-black stroke-[2.5]" />
        <span className="hidden sm:inline">Universal Create</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isQuickActionOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Action Menu Dropdown */}
      {isQuickActionOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Task-Driven</span>
          </div>

          <div className="p-2 space-y-1">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.route)}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 transition flex items-start gap-3 group text-left"
                >
                  <div className={`p-2 rounded-xl border ${action.color} shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                        {action.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {action.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-medium">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
