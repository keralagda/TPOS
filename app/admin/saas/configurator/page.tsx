'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sliders,
  ArrowLeft,
  Layers,
  Shield,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Settings,
  Palette,
  Globe,
  Database,
  Lock,
} from 'lucide-react';
import { CANONICAL_PLANS } from '@/lib/saas/plan-registry';
import { CANONICAL_PACKS } from '@/lib/saas/pack-registry';

export default function HyperConfigurator() {
  const [activeSection, setActiveSection] = useState<'plan' | 'packs' | 'branding' | 'security' | 'ai'>('plan');
  const [selectedPlan, setSelectedPlan] = useState(CANONICAL_PLANS[1].code);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([
    'CORE_PLATFORM',
    'CRM_SALES',
    'TRAVEL_MANAGEMENT',
    'BOOKING_ENGINE',
  ]);

  // Live simulation outputs
  const [simOutput, setSimOutput] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runConfigurationSimulation = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/saas/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_PACK',
          planCode: selectedPlan,
          packCodes: selectedPacks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimOutput(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/admin/saas" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">SaaS Hyper-Configurator</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Visual Topology Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Declarative Multi-Tenant Architecture & Simulation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runConfigurationSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-xs hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            {isSimulating ? 'Simulating...' : 'Simulate Topology'}
          </button>
        </div>
      </header>

      {/* Main Studio 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Navigation Tree */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Configuration Dimensions
          </p>

          {[
            { id: 'plan', label: 'Plan & Billing Tier', icon: Sliders },
            { id: 'packs', label: 'Capability Packs (19)', icon: Layers },
            { id: 'branding', label: 'Branding & White-Label', icon: Palette },
            { id: 'security', label: 'Security & Isolation', icon: Shield },
            { id: 'ai', label: 'AI Governance & Models', icon: Cpu },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Center Column: Interactive Builder */}
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          {activeSection === 'plan' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Select Base Subscription Plan</h3>
              <p className="text-xs text-slate-400">
                Plans define baseline possibility, user limits, branches, storage, and SLA policies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CANONICAL_PLANS.map((p) => (
                  <div
                    key={p.code}
                    onClick={() => setSelectedPlan(p.code)}
                    className={`p-5 rounded-xl border cursor-pointer transition ${
                      selectedPlan === p.code
                        ? 'bg-cyan-950/30 border-cyan-500/80 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base">{p.name}</h4>
                        <p className="text-xs text-cyan-400 font-mono mt-0.5">{p.code}</p>
                      </div>
                      <span className="text-xl font-black text-white">${p.basePrice}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{p.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                      <span>Users: {p.userLimit}</span>
                      <span>Branches: {p.branchLimit}</span>
                      <span>Bookings: {p.bookingLimit}</span>
                      <span>Storage: {(p.storageLimitMb / 1024).toFixed(0)} GB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'packs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Compose Capability Packs</h3>
                  <p className="text-xs text-slate-400">
                    Add or remove modular capabilities. Dependency validation runs dynamically.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                  {selectedPacks.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CANONICAL_PACKS.map((pk) => {
                  const isChecked = selectedPacks.includes(pk.code);
                  return (
                    <div
                      key={pk.code}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedPacks(selectedPacks.filter((c) => c !== pk.code));
                        } else {
                          setSelectedPacks([...selectedPacks, pk.code]);
                        }
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-slate-900 border-cyan-500/80 shadow-sm'
                          : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-cyan-400">{pk.category}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {pk.pricingModel === 'INCLUDED' ? 'INCLUDED' : `+$${pk.price}`}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{pk.displayName}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pk.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">White-Label Branding Engine</h3>
              <p className="text-xs text-slate-400">
                Custom CSS theme, custom logos, transactional email templates, and CNAME domain binding.
              </p>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Company Primary Hex Color</label>
                  <input
                    type="text"
                    defaultValue="#0284c7"
                    className="w-48 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Custom CNAME Domain</label>
                  <input
                    type="text"
                    defaultValue="tours.clientcompany.com"
                    className="w-96 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Security & Tenant Isolation Strategy</h3>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Partitioning Mode:</span>
                  <span className="font-mono text-emerald-400">SHARED_PARTITIONED (Row-Level Security)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Impersonation Policy:</span>
                  <span className="font-mono text-amber-300">MFA Required • 15min Time-Limit</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">SOC2 Audit Retention:</span>
                  <span className="font-mono text-slate-300">365 Days Immutable</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">AI Governance & Model Constraints</h3>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Permitted Providers:</span>
                  <span className="font-mono text-purple-300">Google Gemini 1.5 Pro, Flash</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Tenant Data Used in LLM Training:</span>
                  <span className="font-mono text-emerald-400 font-bold">NEVER (Strict Zero-Retention)</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Column: Live Simulator Inspector */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/60 p-5 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-sm text-white">Topology Inspector</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Selected Plan:</span>
              <span className="font-bold text-cyan-400">{selectedPlan}</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Active Packs:</span>
              <span className="font-bold text-white">{selectedPacks.length} packs</span>
            </div>

            {simOutput && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-emerald-300 text-xs">
                  <p className="font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validation Passed
                  </p>
                  <p className="text-[11px] mt-1 text-slate-300">
                    Additional Pack Charges: ${simOutput.diff?.financialImpactEstimatedUsd || 0}/mo
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px] mb-1">Effective Workspaces:</span>
                  <div className="flex flex-wrap gap-1">
                    {simOutput.projectedState?.effectiveWorkspaces?.map((w: string) => (
                      <span key={w} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
