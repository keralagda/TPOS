'use client';

import React, { useState } from 'react';
import { 
  MapPin, Sparkles, Globe, Sun, Compass, Plus, 
  CheckCircle2, ArrowRight, ShieldCheck, Utensils, 
  HelpCircle, Eye, Layers
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { VIBE8DestinationService } from '@/lib/vibe8/destination-service';
import { HESTIA8SchemaEngine } from '@/lib/hestia8/schema-engine';

export default function DestinationStudioAdminPage() {
  const [destinations, setDestinations] = useState<any[]>(() => VIBE8DestinationService.listDestinations());
  const [selectedDest, setSelectedDest] = useState<any>(destinations[0]);
  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'AI_SYNTHESIZER' | 'MULTILINGUAL' | 'SCHEMA'>('EXPLORER');

  // AI Synthesizer form state
  const [synthName, setSynthName] = useState('');
  const [synthRegion, setSynthRegion] = useState('');
  const [synthCountry, setSynthCountry] = useState('India');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthSuccess, setSynthSuccess] = useState(false);

  const handleSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!synthName || !synthRegion) return;

    setIsSynthesizing(true);
    setTimeout(() => {
      const newBlueprint = VIBE8DestinationService.synthesizeDestinationBlueprint(synthName, synthRegion, synthCountry);
      setDestinations([...VIBE8DestinationService.listDestinations()]);
      setSelectedDest(newBlueprint);
      setIsSynthesizing(false);
      setSynthSuccess(true);
      setTimeout(() => {
        setSynthSuccess(false);
        setActiveTab('EXPLORER');
      }, 1000);
    }, 800);
  };

  return (
    <InternalLayout
      headerTitle="Destination Studio: Experience Hubs"
      headerSubtitle="Rich Destination Blueprints • Local Cuisines • Hidden Gems • Multilingual Synthesis"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('AI_SYNTHESIZER')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Synthesize Destination</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly No Modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('EXPLORER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'EXPLORER'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Destination Hubs ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_SYNTHESIZER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'AI_SYNTHESIZER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Blueprint Synthesizer</span>
          </button>

          <button
            onClick={() => setActiveTab('MULTILINGUAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'MULTILINGUAL'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Multilingual Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'SCHEMA'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>TouristDestination Schema</span>
          </button>
        </div>

        {/* TAB 1: EXPLORER */}
        {activeTab === 'EXPLORER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Destination List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Destination Blueprints
              </span>
              {destinations.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDest(d)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    selectedDest.id === d.id
                      ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{d.name}</span>
                    <span className="text-[10px] font-mono text-sky-400 px-2 py-0.5 bg-sky-950 rounded">
                      {d.region}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{d.tagline}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>{(d.topAttractions || d.keyPlaces || []).length} Attractions</span>
                    <span>•</span>
                    <span>{(d.hiddenGems || []).length} Hidden Gems</span>
                    <span className="ml-auto text-emerald-400 font-bold">Verified Hub</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Destination Details */}
            <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{selectedDest.name}</h3>
                  <span className="px-2 py-0.5 bg-sky-950 text-sky-400 text-[10px] font-bold rounded-lg border border-sky-800/50">
                    {selectedDest.region || selectedDest.stateOrRegion}, {selectedDest.country}
                  </span>
                </div>
                <p className="text-xs text-sky-400 font-mono mt-0.5">{selectedDest.tagline}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedDest.overview?.en || selectedDest.overviewRichText}
                </p>
              </div>

              {/* Best Time to Visit */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Best Time to Visit & Climate
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Peak Season</span>
                    <p className="text-slate-200">{selectedDest.bestTimeToVisit.peakSeason}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Moderate Season</span>
                    <p className="text-slate-200">{selectedDest.bestTimeToVisit.moderateSeason || selectedDest.bestTimeToVisit.shoulderSeason}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Off Season</span>
                    <p className="text-slate-200">{selectedDest.bestTimeToVisit.offSeason}</p>
                  </div>
                </div>
              </div>

              {/* Hidden Gems */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Insider Hidden Gems
                </span>
                <div className="space-y-2">
                  {(selectedDest.hiddenGems || []).map((gem: any, i: number) => (
                    <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="font-extrabold text-white text-xs">{gem.name}</div>
                      <p className="text-xs text-slate-300">{gem.description || gem.provenanceNote}</p>
                      {gem.insiderTip && (
                        <div className="text-[11px] text-sky-400 font-mono pt-1">
                          💡 Insider Tip: {gem.insiderTip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Cuisines */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-rose-400" /> Signature Regional Gastronomy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedDest.localCuisines || []).map((c: any, i: number) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-white text-xs">{c.dish}</div>
                      <p className="text-[11px] text-slate-300">{c.description}</p>
                      <div className="text-[10px] text-emerald-400">Must Try: {c.mustTryAt}</div>
                    </div>
                  ))}
                  {!(selectedDest.localCuisines || []).length && (
                    <p className="text-xs text-slate-500 col-span-2">No cuisine data available for this destination yet.</p>
                  )}
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-400" /> AEO Answer Engine FAQs ({(selectedDest.faqs || []).length})
                </span>
                <div className="space-y-2">
                  {(selectedDest.faqs || []).map((faq: any, i: number) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-sky-300 text-xs">Q: {faq.question}</div>
                      <p className="text-xs text-slate-300">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI SYNTHESIZER */}
        {activeTab === 'AI_SYNTHESIZER' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">AI Destination Blueprint Synthesizer</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter any destination name and region. The engine will instantly synthesize a full destination knowledge hub with season charts, secret heritage spots, local foods, and Answer Engine FAQs.
              </p>
            </div>

            {synthSuccess && (
              <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Destination Blueprint successfully synthesized! Loading in Explorer...</span>
              </div>
            )}

            <form onSubmit={handleSynthesize} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Destination Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coorg, Munnar, Hampi, Spiti Valley, Varanasi"
                  value={synthName}
                  onChange={e => setSynthName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">State / Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnataka, Kerala, Himachal Pradesh"
                    value={synthRegion}
                    onChange={e => setSynthRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    value={synthCountry}
                    onChange={e => setSynthCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isSynthesizing}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSynthesizing ? 'Synthesizing Knowledge Hub...' : 'Synthesize Full Hub'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: MULTILINGUAL SYNC */}
        {activeTab === 'MULTILINGUAL' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">Multilingual Experience Synchronizer</h3>
              <p className="text-xs text-slate-400 mt-1">
                Synchronized overview and localized narratives for <span className="text-sky-400 font-bold">{selectedDest.name}</span> across official Indian regional languages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-sky-400 text-xs">English (en-IN)</span>
                  <span className="text-[10px] font-mono text-emerald-400">100% Synced</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedDest.overview?.en || selectedDest.overviewRichText}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-emerald-400 text-xs">Malayalam (മലയാളം)</span>
                  <span className="text-[10px] font-mono text-emerald-400">100% Synced</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedDest.overview?.ml || selectedDest.overviewRichText}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-amber-400 text-xs">Hindi (हिन्दी)</span>
                  <span className="text-[10px] font-mono text-emerald-400">100% Synced</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedDest.overview?.hi || selectedDest.overviewRichText}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCHEMA */}
        {activeTab === 'SCHEMA' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">TouristDestination Schema.org JSON-LD</h3>
              <p className="text-xs text-slate-400 mt-1">
                Schema graph automatically bound to {selectedDest.name} including attractions and geographic coordinates.
              </p>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
              {JSON.stringify(HESTIA8SchemaEngine.generateTouristDestinationSchema(selectedDest), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
