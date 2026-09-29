'use client';

import React, { useState } from 'react';
import { 
  Compass, CloudRain, Sun, Users, Sparkles, Plus, 
  CheckCircle2, ArrowRight, Shield, AlertTriangle, 
  Send, Layers, Eye, RefreshCw, Calendar, MapPin
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { VIBE8JourneyService, AdaptationEvent, AdaptationResult } from '@/lib/vibe8/journey-service';
import { HESTIA8SchemaEngine } from '@/lib/hestia8/schema-engine';

export default function JourneyStudioAdminPage() {
  const [journeys, setJourneys] = useState<any[]>(() => VIBE8JourneyService.listJourneys());
  const [selectedJourney, setSelectedJourney] = useState<any>(journeys[0]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRIGGER_SIMULATOR' | 'CREATE_JOURNEY' | 'SCHEMA_INSPECTOR'>('OVERVIEW');

  // Trigger Simulator State
  const [simEventType, setSimEventType] = useState<'HEAVY_RAIN' | 'TEMPLE_FESTIVAL_CROWD' | 'FLIGHT_DELAY'>('HEAVY_RAIN');
  const [simDay, setSimDay] = useState<number>(2);
  const [simResult, setSimResult] = useState<AdaptationResult | null>(null);

  // New Journey Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDaysCount, setNewDaysCount] = useState(4);
  const [newBasePrice, setNewBasePrice] = useState(32000);
  const [newTheme, setNewTheme] = useState('LUXURY_TRAVEL');
  const [createSuccess, setCreateSuccess] = useState(false);

  const handleSimulateTrigger = () => {
    const res = VIBE8JourneyService.triggerLivingAdaptation(selectedJourney.id, {
      eventType: simEventType,
      severity: 'HIGH',
      affectedDay: simDay,
      triggerDescription: `Real-time sensor simulated ${simEventType} on Day ${simDay}`
    });
    setSimResult(res);
    // Refresh journey list
    setJourneys([...VIBE8JourneyService.listJourneys()]);
    const updated = VIBE8JourneyService.getJourneyBySlug(selectedJourney.slug);
    if (updated) setSelectedJourney(updated);
  };

  const handleCreateJourney = (e: React.FormEvent) => {
    e.preventDefault();
    const created = VIBE8JourneyService.createJourney({
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      destination: newDestination,
      durationDays: newDaysCount,
      theme: newTheme,
      basePrice: newBasePrice,
      currency: 'INR',
      days: Array.from({ length: newDaysCount }, (_, i) => ({
        dayNumber: i + 1,
        title: `Day ${i + 1}: Immersive Discovery in ${newDestination}`,
        description: `Bespoke itinerary exploring cultural treasures, scenic landscapes, and culinary traditions with personal concierge guidance.`,
        location: newDestination,
        highlights: [`Curated local storyteller walk`, `Authentic regional dining experience`, `Heritage courtyard stay`]
      }))
    });

    setJourneys([...VIBE8JourneyService.listJourneys()]);
    setSelectedJourney(created);
    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setActiveTab('OVERVIEW');
    }, 1200);
  };

  return (
    <InternalLayout
      headerTitle="Journey Studio: Living Itineraries"
      headerSubtitle="Real-Time Adaptive Routing • Weather & Crowd Sensors • Automated Concierge Alerts"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('TRIGGER_SIMULATOR')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Living Trigger</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly No Modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Active Journeys ({journeys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRIGGER_SIMULATOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'TRIGGER_SIMULATOR'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Living Trigger Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATE_JOURNEY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'CREATE_JOURNEY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Living Journey</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEMA_INSPECTOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'SCHEMA_INSPECTOR'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>JSON-LD Schema</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Journeys List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Registered Living Journeys
              </span>
              {journeys.map(j => (
                <div
                  key={j.id}
                  onClick={() => setSelectedJourney(j)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    selectedJourney.id === j.id
                      ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-400 px-2 py-0.5 bg-sky-950 rounded-lg">
                      {j.durationDays} Days • {j.destination}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      ₹{j.pricing.basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm leading-snug">{j.title}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400" /> {j.realtimeVariables.weatherConditions.currentTempC}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-400" /> Crowd: {j.realtimeVariables.crowdIndex}
                    </span>
                    <span className="text-emerald-400 font-bold ml-auto">★ {j.socialProof.rating}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Journey Live Itinerary Inspector */}
            <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedJourney.title}</h3>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-800/50">
                      LIVING
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedJourney.summary}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">Pricing Tier</div>
                  <div className="text-base font-black text-emerald-400">
                    ₹{selectedJourney.pricing.basePrice.toLocaleString('en-IN')} / person
                  </div>
                </div>
              </div>

              {/* Day-by-Day Living Sequence */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Adaptive Itinerary Days ({selectedJourney.itinerary.length} Days)
                </span>

                <div className="space-y-3">
                  {selectedJourney.itinerary.map(day => (
                    <div 
                      key={day.dayNumber}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sky-950 text-sky-400 text-xs font-black flex items-center justify-center border border-sky-800/50">
                            {day.dayNumber}
                          </span>
                          <span className="font-extrabold text-white text-xs">{day.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{day.location}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{day.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {day.highlights.map((h, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded text-[10px] border border-slate-800">
                            ✓ {h}
                          </span>
                        ))}
                      </div>

                      {day.dynamicTriggers && day.dynamicTriggers.length > 0 && (
                        <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>Sensor Hook: If {day.dynamicTriggers[0].condition} → {day.dynamicTriggers[0].fallbackPlan}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRIGGER SIMULATOR */}
        {activeTab === 'TRIGGER_SIMULATOR' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6 max-w-4xl">
            <div>
              <h3 className="text-lg font-black text-white">Living Adaptation Sensor Simulator</h3>
              <p className="text-xs text-slate-400 mt-1">
                Trigger real-world disruptions (Monsoon surge, temple festival crowd, flight delay) on <span className="text-sky-400 font-bold">{selectedJourney.title}</span> to test automatic itinerary adaptation and multilingual concierge alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Simulated Event Type</label>
                <select
                  value={simEventType}
                  onChange={e => setSimEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="HEAVY_RAIN">Monsoon Heavy Rain & Flash Cloudburst</option>
                  <option value="TEMPLE_FESTIVAL_CROWD">Temple Festival Crowd Surge</option>
                  <option value="FLIGHT_DELAY">Inbound Flight Delayed by 4 Hours</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Affected Day</label>
                <select
                  value={simDay}
                  onChange={e => setSimDay(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {selectedJourney.itinerary.map(d => (
                    <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber}: {d.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSimulateTrigger}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate & Execute Adaptation</span>
              </button>
            </div>

            {/* Results Display */}
            {simResult && (
              <div className="bg-slate-950 rounded-xl border border-indigo-500/40 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Living Adaptation Executed Successfully</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 bg-indigo-950 rounded">
                    {simResult.event.eventType}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Previous Scheduled Highlight</span>
                    <div className="text-slate-300 line-through">{simResult.previousActivity}</div>
                  </div>
                  <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60 space-y-1">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">New Living Substitute</span>
                    <div className="text-emerald-200 font-bold">{simResult.newActivity}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Multilingual Concierge Push Broadcasts:
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-sky-400 block mb-0.5">English (en-IN):</span>
                      <p className="text-slate-200">{simResult.travellerMessage.en}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">Malayalam (മലയാളം):</span>
                      <p className="text-slate-200">{simResult.travellerMessage.ml}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-amber-400 block mb-0.5">Hindi (हिन्दी):</span>
                      <p className="text-slate-200">{simResult.travellerMessage.hi}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE LIVING JOURNEY */}
        {activeTab === 'CREATE_JOURNEY' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-3xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white">Create Living Journey</h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure adaptive itinerary, baseline pricing, dynamic triggers, and multi-lingual concierge templates.
              </p>
            </div>

            {createSuccess && (
              <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Living Journey created! Redirecting to Overview...</span>
              </div>
            )}

            <form onSubmit={handleCreateJourney} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Journey Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Palaces & Desert Twilight living Experience"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Destination Hub</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur & Udaipur"
                    value={newDestination}
                    onChange={e => setNewDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newDaysCount}
                    onChange={e => setNewDaysCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Base Price (INR)</label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={newBasePrice}
                    onChange={e => setNewBasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('OVERVIEW')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Living Journey</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: SCHEMA INSPECTOR */}
        {activeTab === 'SCHEMA_INSPECTOR' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Generated Schema.org JSON-LD (Trip)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Google Rich Results and Perplexity-compliant structured metadata automatically compiled for {selectedJourney.title}.
              </p>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
              {JSON.stringify(HESTIA8SchemaEngine.generateTripSchema(selectedJourney), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
