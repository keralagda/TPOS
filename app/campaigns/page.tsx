'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Megaphone, Tag, Sparkles, Plus, Copy, 
  Check, ArrowRight, TrendingUp, Calendar, Zap 
} from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const promos = [
    {
      code: 'DIWALI2026',
      title: 'Diwali Festive Family Getaways',
      discount: '₹15,000 Flat OFF',
      channel: 'Email + WhatsApp + Web',
      redemptions: '428 Claims',
      status: 'ACTIVE',
      validTill: '15 Nov 2026',
      roas: '5.2x ROAS',
    },
    {
      code: 'DUBAI5000',
      title: 'Dubai Winter Sun Package Promo',
      discount: '₹5,000 Instant Discount',
      channel: 'Meta Ads + Google Search',
      redemptions: '312 Claims',
      status: 'ACTIVE',
      validTill: '31 Dec 2026',
      roas: '4.8x ROAS',
    },
    {
      code: 'KERALAAYUR',
      title: 'Monsoon Rejuvenation Retreat',
      discount: '12% Early Bird Waiver',
      channel: 'Organic SEO + Email',
      redemptions: '194 Claims',
      status: 'SCHEDULED',
      validTill: '30 Oct 2026',
      roas: '6.1x ROAS',
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <InternalLayout
      headerTitle="Campaigns & Promotions"
      headerSubtitle="Demand Generation • Promotional Coupon Matrix"
      actions={
        <Link
          href="/admin/campaign-studio"
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campaign Studio</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Campaign Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Promotions</span>
            <div className="text-2xl font-black text-white">6 Live Codes</div>
            <span className="text-[11px] text-emerald-400 font-semibold">934 total coupon claims</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Blended Marketing ROAS</span>
            <div className="text-2xl font-black text-emerald-400">4.9x</div>
            <span className="text-[11px] text-sky-400 font-semibold">+0.7x vs last quarter</span>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Attributed Booking GMV</span>
            <div className="text-2xl font-black text-indigo-400">₹84,20,000</div>
            <span className="text-[11px] text-slate-400">18.4% of total sales</span>
          </div>
        </div>

        {/* Active Promotional Codes */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase text-slate-400">Active Coupon Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promos.map((p) => (
              <div
                key={p.code}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-sky-500/50 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {p.code}
                    </span>
                    <button
                      onClick={() => handleCopy(p.code)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Copy code"
                    >
                      {copiedCode === p.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{p.title}</h3>
                    <div className="text-emerald-400 font-black text-sm mt-0.5">{p.discount}</div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <div>Channels: <strong className="text-slate-300">{p.channel}</strong></div>
                    <div>Redemptions: <strong className="text-white">{p.redemptions}</strong></div>
                    <div>Valid till: <span className="text-slate-300">{p.validTill}</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {p.roas}
                  </span>
                  <Link
                    href="/admin/campaign-studio"
                    className="text-xs text-sky-400 hover:text-white font-bold flex items-center gap-1"
                  >
                    <span>Edit Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
