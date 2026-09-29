'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { 
  Lightbulb, Sparkles, Plus, CheckCircle2, FlaskConical, 
  ArrowRight, TrendingUp, Layers, Filter, Compass 
} from 'lucide-react';

interface IdeaItem {
  id: string;
  title: string;
  problemStatement: string;
  targetPersona: string;
  sourceTrigger: string;
  hypothesis: string;
  proposedSolution: string;
  strategicFitScore: number;
  feasibilityScore: number;
  valueScore: number;
  stage: 'CANDID8' | 'EVALU8' | 'EXPERIMEN8' | 'ADOP8' | 'ARCHIVE8';
  experiments?: { id: string; hypothesis: string; status: string }[];
}

export default function IdeasPortalPage() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newPersona, setNewPersona] = useState('TRAVELER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ideas');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setIdeas(data.data);
      } else {
        // Fallback demo candidates
        setIdeas([
          {
            id: 'idea-1',
            title: 'Multimodal Augmented Reality Walking Tours in Old Delhi & Fort Kochi',
            problemStatement: 'Travelers get lost and miss architectural heritage context while walking dense heritage lanes.',
            targetPersona: 'TRAVELER',
            sourceTrigger: 'USER_FRICTION',
            hypothesis: 'Providing lightweight GPS-anchored audio/visual overlays increases engagement by 40%.',
            proposedSolution: 'Integrate WebXR light camera overlay with Pexels photo provenance in GEM8.',
            strategicFitScore: 0.9,
            feasibilityScore: 0.85,
            valueScore: 0.95,
            stage: 'EXPERIMEN8',
            experiments: [{ id: 'exp-1', hypothesis: '40% engagement increase on heritage routes', status: 'RUNNING' }],
          },
          {
            id: 'idea-2',
            title: 'Automated GST Invoicing & Split Settlements for Corporate Multi-leg Itineraries',
            problemStatement: 'Finance managers spend 14 hours per month reconciling split invoices for corporate flights.',
            targetPersona: 'OPERATOR',
            sourceTrigger: 'TELEMETRY',
            hypothesis: 'Auto-generating double-entry balancing lines saves 90% accounting time.',
            proposedSolution: 'Extend DMS Token Engine with auto GST state tax splits.',
            strategicFitScore: 0.95,
            feasibilityScore: 0.9,
            valueScore: 0.9,
            stage: 'ADOP8',
          },
          {
            id: 'idea-3',
            title: 'Offline Peer-to-Peer Bluetooth Itinerary Sync for Remote Himalayan Treks',
            problemStatement: 'Trekkers lose cellular signal in Ladakh and cannot view updated group meeting points.',
            targetPersona: 'TRAVELER',
            sourceTrigger: 'EMERGING_BEHAVIORS',
            hypothesis: 'Mesh Bluetooth beacon sync keeps group itinerary updated without internet.',
            proposedSolution: 'ServiceWorker background sync with cryptographic hash signature.',
            strategicFitScore: 0.8,
            feasibilityScore: 0.7,
            valueScore: 0.85,
            stage: 'CANDID8',
          },
        ]);
      }
    } catch {
      // Keep demo list
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const res = await fetch('/api/v1/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          problemStatement: newProblem,
          proposedSolution: newSolution,
          targetPersona: newPersona,
          sourceTrigger: 'USER_REQUEST',
          hypothesis: `Implementing ${newTitle} will improve user retention.`,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIdeas([data.data, ...ideas]);
        setIsCreating(false);
        setNewTitle('');
        setNewProblem('');
        setNewSolution('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIdeas = ideas.filter(
    (i) => selectedStage === 'ALL' || i.stage === selectedStage
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative shadow-xl border border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/30">
              <Lightbulb className="w-3.5 h-3.5" /> Idea Discovery Engine (§09, §45)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Platform Innovation & Discovery</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl font-medium">
              Continuous innovation lifecycle governed by Heuris8 Anti-Proliferation standards:
              CANDID8 → EVALU8 → EXPERIMEN8 → ADOP8.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg transition flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Propose New Idea
          </button>
        </div>

        {/* Creation Form */}
        {isCreating && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md animate-in fade-in">
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Submit Idea Candidate (CANDID8)</h2>
            <p className="text-xs text-slate-500 mb-6">
              Define the problem statement and proposed solution to prevent architectural bloat.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Idea Title</label>
                <input
                  type="text"
                  placeholder="e.g. AI-Powered Dynamic Currency Hedging for Travel Bookings"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Persona</label>
                  <select
                    value={newPersona}
                    onChange={(e) => setNewPersona(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="TRAVELER">Traveler</option>
                    <option value="AGENT">Travel Agent</option>
                    <option value="OPERATOR">Operations / TMS</option>
                    <option value="SUPPLIER">Vendor / Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Problem Statement</label>
                  <input
                    type="text"
                    placeholder="What friction or customer pain does this solve?"
                    value={newProblem}
                    onChange={(e) => setNewProblem(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Solution</label>
                <textarea
                  rows={3}
                  placeholder="Describe technical implementation and expected outcome..."
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Submit Candidate
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'CANDID8', 'EVALU8', 'EXPERIMEN8', 'ADOP8'].map((stg) => (
            <button
              key={stg}
              onClick={() => setSelectedStage(stg)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedStage === stg ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {stg}
            </button>
          ))}
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    {idea.stage}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {idea.targetPersona}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2">
                  {idea.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mb-3">
                  {idea.problemStatement}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 mb-4">
                  <span className="font-bold block text-[11px] text-slate-500 uppercase mb-0.5">Solution:</span>
                  {idea.proposedSolution}
                </div>
              </div>

              <div>
                {/* Scoring Matrix */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">FIT</span>
                    <span className="text-xs font-black text-slate-900">{Math.round(idea.strategicFitScore * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">FEASIBILITY</span>
                    <span className="text-xs font-black text-slate-900">{Math.round(idea.feasibilityScore * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">VALUE</span>
                    <span className="text-xs font-black text-emerald-600">{Math.round(idea.valueScore * 100)}%</span>
                  </div>
                </div>

                {idea.experiments && idea.experiments.length > 0 && (
                  <div className="mt-3 p-2 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-800 font-bold flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-sky-600" />
                    Experiment Active ({idea.experiments.length})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
