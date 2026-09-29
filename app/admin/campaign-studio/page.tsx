'use client';

import React, { useState } from 'react';
import { 
  Megaphone, Sparkles, TrendingUp, Users, Send, 
  Instagram, Mail, MessageSquare, CheckCircle2, 
  ArrowRight, Globe, BarChart2, Plus, Copy, Check
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { VIBE8CampaignService, GeneratedCampaign, CampaignBlueprintInput } from '@/lib/vibe8/campaign-service';

export default function CampaignStudioAdminPage() {
  const [campaigns, setCampaigns] = useState<GeneratedCampaign[]>(() => VIBE8CampaignService.listCampaigns());
  const [selectedCampaign, setSelectedCampaign] = useState<GeneratedCampaign>(campaigns[0]);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GENERATOR' | 'ASSETS_INSPECTOR'>('DASHBOARD');

  // Generator form state
  const [campaignName, setCampaignName] = useState('');
  const [campaignTheme, setCampaignTheme] = useState<CampaignBlueprintInput['theme']>('ONAM_FESTIVAL');
  const [campaignDest, setCampaignDest] = useState('');
  const [targetAudience, setTargetAudience] = useState<CampaignBlueprintInput['targetAudience']>('LUXURY_COUPLES');
  const [budgetTier, setBudgetTier] = useState<CampaignBlueprintInput['budgetTier']>('AFFORDABLE_LUXURY');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !campaignDest) return;

    const newCamp = VIBE8CampaignService.generateCampaign({
      name: campaignName,
      theme: campaignTheme,
      destination: campaignDest,
      targetAudience,
      budgetTier,
      offerDiscountPercent: discountPercent,
      startDate: '2026-10-01',
      endDate: '2026-11-15'
    });

    setCampaigns([...VIBE8CampaignService.listCampaigns()]);
    setSelectedCampaign(newCamp);
    setActiveTab('ASSETS_INSPECTOR');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <InternalLayout
      headerTitle="Campaign Studio: Omni-Channel Growth"
      headerSubtitle="AI Multi-Channel Asset Synthesis • Landing Pages • SEO • WhatsApp • Instagram • Newsletters"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('GENERATOR')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Campaign</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly No Modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'DASHBOARD'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Campaigns Overview ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GENERATOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'GENERATOR'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Omni Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('ASSETS_INSPECTOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ASSETS_INSPECTOR'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Channel Assets ({selectedCampaign.name})</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map(camp => (
                <div
                  key={camp.id}
                  onClick={() => {
                    setSelectedCampaign(camp);
                    setActiveTab('ASSETS_INSPECTOR');
                  }}
                  className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-sky-500/50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold rounded">
                        {camp.status}
                      </span>
                      <h4 className="font-extrabold text-white text-base mt-2">{camp.name}</h4>
                      <p className="text-xs text-sky-400 font-mono mt-0.5">{camp.destination}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                    <div className="bg-slate-950 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Clicks</span>
                      <span className="text-xs font-black text-white">{camp.conversionMetrics.clicks}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Inquiries</span>
                      <span className="text-xs font-black text-sky-400">{camp.conversionMetrics.inquiries}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">ROI</span>
                      <span className="text-xs font-black text-emerald-400">{camp.conversionMetrics.roiEstimate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>UTM: {camp.utmParams.utm_campaign}</span>
                    <span className="text-sky-400 font-bold flex items-center gap-1">
                      View Assets <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GENERATOR */}
        {activeTab === 'GENERATOR' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">AI Omni-Channel Campaign Synthesizer</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generate high-converting multi-channel campaigns: high-intent landing page copy, SEO keywords, Meta/Google ad copy, Instagram reels captions, and multilingual WhatsApp broadcast templates.
              </p>
            </div>

            <form onSubmit={handleGenerateCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Royal Palaces & Starlit Fort Escapes"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Campaign Theme</label>
                  <select
                    value={campaignTheme}
                    onChange={e => setCampaignTheme(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="ONAM_FESTIVAL">Onam Festive Season</option>
                    <option value="DIWALI_ESCAPE">Diwali Royal Escape</option>
                    <option value="MONSOON_BLISS">Monsoon Ayurveda & Bliss</option>
                    <option value="CHRISTMAS_NEW_YEAR">Christmas & New Year Celebration</option>
                    <option value="SUMMER_COOL_RETREAT">Summer Hill Station Retreat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Destination Hub *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kerala Backwaters, Udaipur, Ladakh"
                    value={campaignDest}
                    onChange={e => setCampaignDest(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Demographic</label>
                  <select
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="LUXURY_COUPLES">Luxury Couples & Honeymooners</option>
                    <option value="FAMILY_HOLIDAY">Family Vacations</option>
                    <option value="NRI_HOMECOMING">NRI Homecoming Travelers</option>
                    <option value="ADVENTURE_GROUPS">Adventure & Trekkers</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Budget Tier</label>
                  <select
                    value={budgetTier}
                    onChange={e => setBudgetTier(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="AFFORDABLE_LUXURY">Affordable Luxury</option>
                    <option value="ULTRA_LUXURY">Ultra Luxury</option>
                    <option value="PREMIUM_STANDARD">Premium Standard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Privilege Discount (%)</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize All Channel Assets</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: CHANNEL ASSETS INSPECTOR */}
        {activeTab === 'ASSETS_INSPECTOR' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedCampaign.name}</h3>
                  <p className="text-xs text-sky-400 font-mono">Destination: {selectedCampaign.destination} • Theme: {selectedCampaign.theme}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-xl text-xs font-bold">
                  Estimated ROI: {selectedCampaign.conversionMetrics.roiEstimate}
                </span>
              </div>

              {/* Grid of Multi-channel assets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Landing Page Asset */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-sky-400" /> Landing Page Copy
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedCampaign.landingPage.heroHeadline, 'lp')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'lp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'lp' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-sky-300">{selectedCampaign.landingPage.heroHeadline}</div>
                    <p className="text-slate-300">{selectedCampaign.landingPage.subheadline}</p>
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Perks:</span>
                      <ul className="space-y-1 text-slate-300">
                        {selectedCampaign.landingPage.exclusivePerks.map((p, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. Social & Ad Copy */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" /> Social & Ad Copy
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedCampaign.socialAssets.instagramCaption, 'social')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'social' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'social' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Ad Copy:</span>
                      <div className="font-bold text-white">{selectedCampaign.socialAssets.adCopy.headline}</div>
                      <p className="text-slate-300 mt-1">{selectedCampaign.socialAssets.adCopy.primaryText}</p>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{selectedCampaign.socialAssets.instagramCaption}</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCampaign.socialAssets.instagramHashtags.map((tag, i) => (
                        <span key={i} className="text-[10px] text-sky-400 font-mono">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Multilingual WhatsApp Broadcast */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Broadcast (Multilingual)
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-sky-400 font-bold block mb-1">English:</span>
                      <p className="text-slate-200">{selectedCampaign.messaging.whatsappTemplate.en}</p>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-bold block mb-1">Malayalam:</span>
                      <p className="text-slate-200">{selectedCampaign.messaging.whatsappTemplate.ml}</p>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-bold block mb-1">Hindi:</span>
                      <p className="text-slate-200">{selectedCampaign.messaging.whatsappTemplate.hi}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Email Newsletter */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Newsletter
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Subject:</span>
                      <div className="font-bold text-white">{selectedCampaign.messaging.emailNewsletter.subject}</div>
                    </div>
                    <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                      {selectedCampaign.messaging.emailNewsletter.bodyMarkdown}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
