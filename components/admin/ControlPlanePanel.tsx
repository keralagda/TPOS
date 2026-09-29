'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, Layers, Calendar, CheckCircle2, 
  AlertCircle, Shield, RefreshCw, ToggleLeft, ToggleRight, Sparkles 
} from 'lucide-react';

interface Flag {
  id: string;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
}

interface Mode {
  id: string;
  modeKey: string;
  name: string;
  version: string;
  description?: string;
  status: string;
  defaultLandingRoute: string;
}

export function ControlPlanePanel() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [activeTab, setActiveTab] = useState<'FLAGS' | 'MODES' | 'ROLLOVERS'>('FLAGS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
    // Default fallback modes
    setModes([
      {
        id: 'm-1',
        modeKey: 'B2C_TRAVELER',
        name: 'B2C Traveler Discovery Mode',
        version: '2.0.0',
        description: 'Public marketplace, circles, and trip planner experience',
        status: 'ACTIVE',
        defaultLandingRoute: '/',
      },
      {
        id: 'm-2',
        modeKey: 'TRAVEL_AGENT',
        name: 'Travel Agent Workspace Mode',
        version: '2.0.0',
        description: 'Lead queue, quote builder, and client itinerary management',
        status: 'ACTIVE',
        defaultLandingRoute: '/agent/dashboard',
      },
      {
        id: 'm-3',
        modeKey: 'OPERATIONS_DISPATCH',
        name: 'Operations & TMS Dispatcher Mode',
        version: '2.0.0',
        description: 'Flight PNR sync, supplier tasks, visa concierge, and incident runbooks',
        status: 'ACTIVE',
        defaultLandingRoute: '/operations/dashboard',
      },
    ]);
  }, []);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/control-plane/flags');
      const json = await res.json();
      if (json.success && json.data) {
        setFlags(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (flag: Flag) => {
    const updatedState = !flag.isEnabled;
    try {
      const res = await fetch('/api/v1/admin/control-plane/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: flag.key,
          isEnabled: updatedState,
          rolloutPercentage: flag.rolloutPercentage,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFlags(flags.map((f) => (f.key === flag.key ? { ...f, isEnabled: updatedState } : f)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Sliders className="w-3.5 h-3.5" />
            SaaS Admin Control Plane (§30–§34)
          </div>
          <h2 className="text-xl font-bold text-white">Platform Governance & Rollover Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Server-authoritative feature flags, versioned workspace modes, and health-gated rollovers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('FLAGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'FLAGS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Feature Flags ({flags.length})
          </button>
          <button
            onClick={() => setActiveTab('MODES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'MODES' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Operation Modes ({modes.length})
          </button>
          <button
            onClick={() => setActiveTab('ROLLOVERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ROLLOVERS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            OTA Rollovers (§32-§33)
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'FLAGS' && (
          <div className="space-y-3">
            {flags.map((flag) => (
              <div
                key={flag.key}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      {flag.key}
                    </span>
                    <span className="text-xs font-bold text-white">{flag.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-slate-400 block">Rollout</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{flag.rolloutPercentage}%</span>
                  </div>
                  <button
                    onClick={() => handleToggle(flag)}
                    className="p-1 text-slate-300 hover:text-white transition"
                    title={flag.isEnabled ? 'Disable flag' : 'Enable flag'}
                  >
                    {flag.isEnabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'MODES' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      v{mode.version} • {mode.status}
                    </span>
                    <Layers className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{mode.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mode.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                  <span>Route: <strong className="text-slate-300">{mode.defaultLandingRoute}</strong></span>
                  <span className="text-indigo-400 font-semibold cursor-pointer hover:underline">
                    Inspect Config
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ROLLOVERS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Automated Health-Gated OTA Rollovers</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Executes due scheduled transitions with telemetry health checks (error rate &lt; 1%, latency &lt; 500ms).
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/v1/governance/rollover', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'EXECUTE_PENDING' }),
                  });
                  alert('Executed due pending rollovers.');
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Execute Due Schedules
              </button>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Active & Pending Schedules
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Peak Season Dynamic Pricing & Capacity Mode</div>
                  <div className="text-[11px] text-slate-400">Target: OPERATION_MODE [PEAK_SEASON] • Policy: HEALTH_GATED</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  SCHEDULED (UTC)
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Social8 Travel Circles Public Rollout (100%)</div>
                  <div className="text-[11px] text-slate-400">Target: FEATURE_FLAG [social8_community_circles] • Policy: IMMEDIATE</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
