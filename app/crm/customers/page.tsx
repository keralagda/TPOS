'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Users, Search, UserPlus, Sparkles, MapPin, 
  Phone, Mail, ArrowRight, ShieldCheck, DollarSign, Calendar
} from 'lucide-react';
import Link from 'next/link';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER';
  totalSpent: string;
  tripsCount: number;
  lastTrip: string;
  status: 'ACTIVE' | 'IN_TRANSIT';
}

export default function CustomersDirectoryPage() {
  const [query, setQuery] = useState('');

  const customers: CustomerSummary[] = [
    {
      id: 'usr_cust_rahul',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      city: 'Mumbai, Maharashtra',
      tier: 'PLATINUM',
      totalSpent: '₹5,00,290',
      tripsCount: 4,
      lastTrip: 'Dubai Luxury Holiday',
      status: 'IN_TRANSIT',
    },
    {
      id: 'usr_cust_vikram',
      name: 'Vikram Oberoi',
      email: 'vikram.oberoi@example.com',
      phone: '+91 98200 11223',
      city: 'New Delhi, NCR',
      tier: 'GOLD',
      totalSpent: '₹3,40,000',
      tripsCount: 2,
      lastTrip: 'Bali Beach Villa',
      status: 'ACTIVE',
    },
    {
      id: 'usr_cust_arjun',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 98199 22334',
      city: 'Kochi, Kerala',
      tier: 'GOLD',
      totalSpent: '₹4,12,000',
      tripsCount: 3,
      lastTrip: 'Switzerland Winter Alps',
      status: 'ACTIVE',
    },
    {
      id: 'usr_cust_sunita',
      name: 'Sunita Rao',
      email: 'sunita.rao@example.com',
      phone: '+91 98330 44556',
      city: 'Bengaluru, Karnataka',
      tier: 'SILVER',
      totalSpent: '₹1,80,000',
      tripsCount: 1,
      lastTrip: 'Paris Highlights',
      status: 'ACTIVE',
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <InternalLayout
      headerTitle="Customer Directory & Profiles"
      headerSubtitle="Customer 360 • Traveler Relationship Hub"
      actions={
        <Link
          href="/crm/leads?action=new-customer"
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Customer</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search & Stats Filter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer name, email, city..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Total Travelers: <strong className="text-white">{customers.length}</strong></span>
            <span>•</span>
            <span>Active in Transit: <strong className="text-emerald-400">1</strong></span>
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact & Location</th>
                <th className="p-4">Tier & Lifetime Spend</th>
                <th className="p-4">Trips History</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.tier === 'PLATINUM' && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 space-y-0.5">
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-500" /> {c.email}
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-500" /> {c.city}
                    </div>
                  </td>
                  <td className="p-4 space-y-0.5">
                    <div className="font-black text-emerald-400 text-sm">{c.totalSpent}</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-400">
                      {c.tier} TIER
                    </span>
                  </td>
                  <td className="p-4 space-y-0.5">
                    <div className="text-slate-200 font-semibold">{c.tripsCount} Bookings Completed</div>
                    <span className="text-slate-400 text-[11px]">Last: {c.lastTrip}</span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/crm/customers/${c.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white font-bold transition text-xs"
                    >
                      <span>360 Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InternalLayout>
  );
}
