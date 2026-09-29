'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { Briefcase, CreditCard, Percent, Image, ArrowRight, ShieldCheck, Download, Users, CheckCircle2, Handshake, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'CREDIT_LEDGER'>('BRANDING');
  const [markupPercent, setMarkupPercent] = useState<number>(8);
  const [partnerCreditLimit, setPartnerCreditLimit] = useState<number>(2500000);
  const [availableCredit, setAvailableCredit] = useState<number>(1840000);
  const [agencyName, setAgencyName] = useState('Apex Holidays India');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setNotice(`Partner configuration saved. Default wholesale markup set to ${markupPercent}% for ${agencyName}.`);
  };

  return (
    <InternalLayout
      headerTitle={`B2B2C Partner Portal — ${agencyName}`}
      headerSubtitle="Wholesale Net Rates & White-Label Itinerary Generator"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('BRANDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'BRANDING' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Margin & Branding
          </button>
          <button
            onClick={() => setActiveTab('CREDIT_LEDGER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'CREDIT_LEDGER' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Credit Line & Commission
          </button>
          <span className="text-xs font-semibold text-purple-300 bg-purple-950/80 px-3 py-1.5 rounded-full border border-purple-800">
            Tier 1 Diamond Partner
          </span>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Available Credit Line</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹{availableCredit.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-400 mt-1">Limit: ₹{partnerCreditLimit.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Current Markup Margin</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{markupPercent}%</div>
            <div className="text-[11px] text-slate-400 mt-1">Auto-applied on net wholesale rates</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">B2B Bookings (This Month)</div>
            <div className="text-2xl font-black text-white mt-1">38 Itineraries</div>
            <div className="text-[11px] text-emerald-400 mt-1">+18% growth vs last cycle</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Accrued Commission</div>
            <div className="text-2xl font-black text-sky-400 mt-1">₹3,42,800</div>
            <div className="text-[11px] text-slate-400 mt-1">Payout scheduled: 1st of month</div>
          </div>
        </div>

        {/* Tab 1: Branding & Margins */}
        {activeTab === 'BRANDING' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Markup & White-Label Config */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" /> Dynamic Markup & Agency Branding
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Default Wholesale Markup (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(parseInt(e.target.value) || 0)}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="font-mono font-bold text-base text-purple-400 w-12">{markupPercent}%</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Client quotations will automatically include this margin on top of Voyage8 net rates.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Agency Trading Name</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveSettings}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-purple-600/20"
                  >
                    Save White-Label Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Wholesale Search */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-400" /> Instant Wholesale Quote Builder
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">Dubai 5D/4N Atlantis Luxury Package</span>
                    <span className="font-mono font-bold text-white">Net: ₹48,000</span>
                  </div>
                  <div className="flex justify-between items-center text-purple-300">
                    <span>With Your {markupPercent}% Markup</span>
                    <span className="font-mono font-bold text-purple-400">
                      Client: ₹{Math.round(48000 * (1 + markupPercent / 100)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">Bali 7D/6N Pool Villa Package</span>
                    <span className="font-mono font-bold text-white">Net: ₹54,000</span>
                  </div>
                  <div className="flex justify-between items-center text-purple-300">
                    <span>With Your {markupPercent}% Markup</span>
                    <span className="font-mono font-bold text-purple-400">
                      Client: ₹{Math.round(54000 * (1 + markupPercent / 100)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Link
                    href="/crm/quotes"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Build Custom Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Credit Ledger & Commission */}
        {activeTab === 'CREDIT_LEDGER' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> B2B Partner Credit Ledger & Settlement
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Rolling credit drawdown, auto-invoicing, and month-end agency commissions.</p>
            </div>

            <div className="space-y-3">
              {[
                { date: '2026-09-24', ref: 'B2B-INV-8810', type: 'DRAWDOWN', desc: 'Booking TP-892401 Atlantis Palm 4N', amount: -68000, balance: 1840000 },
                { date: '2026-09-20', ref: 'B2B-CRD-7701', type: 'PAYMENT', desc: 'Bank Wire HDFC Partner Settlement', amount: +500000, balance: 1908000 },
                { date: '2026-09-15', ref: 'B2B-INV-8419', type: 'DRAWDOWN', desc: 'Booking TP-771920 Bali Private Villa', amount: -142000, balance: 1408000 },
              ].map((tx, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{tx.desc}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.ref} • {tx.date}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount > 0 ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${Math.abs(tx.amount).toLocaleString('en-IN')}`}
                    </div>
                    <div className="text-[10px] text-slate-400">Balance: ₹{tx.balance.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
