'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Shield,
  Building,
  Sliders,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Package,
  PlusCircle,
  Cpu,
  BarChart3,
  Server,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function SaaSControlPlaneDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'packs' | 'simulator' | 'audit'>('tenants');

  // Simulator state
  const [simPackCodes, setSimPackCodes] = useState<string[]>(['CORE_PLATFORM', 'TRAVEL_MANAGEMENT']);
  const [simPlanCode, setSimPlanCode] = useState('PLAN_GROWTH');
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // New tenant modal
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    tenantCode: '',
    displayName: '',
    legalName: '',
    slug: '',
    tenantType: 'TOUR_OPERATOR',
    industry: 'Experiential Tourism',
    country: 'AE',
    region: 'Middle East',
    timezone: 'Asia/Dubai',
    currency: 'USD',
    planCode: 'PLAN_GROWTH',
    ownerEmail: '',
    ownerFullName: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, pRes, pkRes] = await Promise.all([
        fetch('/api/saas/tenants').then((r) => r.json()),
        fetch('/api/saas/plans').then((r) => r.json()),
        fetch('/api/saas/packs').then((r) => r.json()),
      ]);

      if (tRes.success) setTenants(tRes.tenants);
      if (pRes.success) setPlans(pRes.plans);
      if (pkRes.success) setPacks(pkRes.packs);
    } catch (err) {
      console.error('Failed to load SaaS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async () => {
    try {
      setSimLoading(true);
      const res = await fetch('/api/saas/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_PACK',
          planCode: simPlanCode,
          packCodes: simPackCodes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/saas/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenantForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewTenantModal(false);
        fetchData();
      } else {
        alert(`Error provisioning tenant: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTenantStatus = async (tenantId: string, currentStatus: string) => {
    const action = currentStatus === 'ACTIVE' ? 'SUSPEND' : 'REACTIVATE';
    try {
      const res = await fetch(`/api/saas/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: 'Console toggled' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">TRAVEL PLANET .TOURS</span>
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-semibold">
                SaaS Plane OS
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-Tenant Governance, Pack Entitlements & Platform Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewTenantModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-500/25"
          >
            <PlusCircle className="w-4 h-4" />
            Provision Tenant
          </button>
          <Link
            href="/admin/saas/configurator"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium text-sm hover:bg-slate-700 transition"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            Hyper-Configurator
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Tenants</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{tenants.length}</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Isolated
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Capability Packs</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{packs.length}</h3>
              <p className="text-xs text-slate-400 mt-1">19 travel capabilities</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Commercial Plans</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{plans.length}</h3>
              <p className="text-xs text-slate-400 mt-1">Versioned & Immutable</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Governance Plane</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">Enforced</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Data Leakage
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {(['tenants', 'plans', 'packs', 'simulator'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab 1: Tenants */}
        {activeTab === 'tenants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Registered Platform Tenants</h3>
              <span className="text-xs text-slate-400">Total: {tenants.length} tenants</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenants.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-white">{t.displayName}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">{t.legalName}</p>
                    </div>

                    <button
                      onClick={() => toggleTenantStatus(t.id, t.status)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        t.status === 'ACTIVE'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      {t.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Plan:</span>
                      <span className="font-semibold text-cyan-400">{t.planId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Region:</span>
                      <span className="font-semibold text-slate-300">{t.dataRegion}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Assigned Packs:</span>
                      <span className="font-semibold text-slate-300">{t.packIds?.length || 0} packs</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.packIds?.slice(0, 5).map((pCode: string) => (
                      <span
                        key={pCode}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {pCode}
                      </span>
                    ))}
                    {(t.packIds?.length || 0) > 5 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        +{(t.packIds?.length || 0) - 5} more
                      </span>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">Domain: {t.domain}</span>
                    <Link
                      href={`/admin/saas/tenants/${t.id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                    >
                      Control Panel <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Plans */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Commercial Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan-400">{p.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        v{p.version}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-white mt-1">{p.name}</h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                    <div className="mt-4">
                      <span className="text-2xl font-extrabold text-white">${p.basePrice}</span>
                      <span className="text-xs text-slate-400"> / {p.billingCycle.toLowerCase()}</span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <div>• Users: up to {p.userLimit}</div>
                      <div>• Branches: up to {p.branchLimit}</div>
                      <div>• Bookings: up to {p.bookingLimit}</div>
                      <div>• Storage: {(p.storageLimitMb / 1024).toFixed(0)} GB</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-500">
                    SLA: {p.slaTier}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Packs */}
        {activeTab === 'packs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">19 Travel Capability Packs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packs.map((pk) => (
                <div key={pk.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">{pk.category}</span>
                    <span className="text-xs font-mono text-slate-400">
                      {pk.pricingModel === 'INCLUDED' ? 'Included' : `+$${pk.price}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-white mt-1">{pk.displayName}</h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{pk.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-500 block mb-1">Dependencies:</span>
                    {pk.dependencies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {pk.dependencies.map((d: string) => (
                          <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">None (Standalone)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Simulator */}
        {activeTab === 'simulator' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Zero-Side-Effect Entitlement & Pack Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Simulate pack assignments, conflict detection, and limits without committing database mutations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Target Plan</label>
                  <select
                    value={simPlanCode}
                    onChange={(e) => setSimPlanCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                  >
                    {plans.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Select Packs to Compose
                  </label>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                    {packs.map((pk) => {
                      const isChecked = simPackCodes.includes(pk.code);
                      return (
                        <label
                          key={pk.code}
                          className="flex items-center gap-2 p-2 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-200 cursor-pointer hover:bg-slate-800/40"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSimPackCodes([...simPackCodes, pk.code]);
                              } else {
                                setSimPackCodes(simPackCodes.filter((c) => c !== pk.code));
                              }
                            }}
                          />
                          <span className="font-medium">{pk.displayName}</span>
                          <span className="text-slate-500 font-mono text-[10px] ml-auto">({pk.code})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleSimulate}
                  disabled={simLoading}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
                >
                  <Play className="w-4 h-4" />
                  {simLoading ? 'Running Simulation...' : 'Execute Simulation Sandbox'}
                </button>
              </div>

              {/* Simulation Result Output */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                    Projected Capabilities & Conflict Matrix
                  </h4>

                  {simResult ? (
                    <div className="space-y-4">
                      {simResult.validationIssues.length > 0 ? (
                        <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-400" /> Validation Errors:
                          </p>
                          {simResult.validationIssues.map((issue: string, idx: number) => (
                            <p key={idx}>• {issue}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Zero dependency conflicts. Pack configuration is valid!
                        </div>
                      )}

                      <div className="text-xs space-y-2">
                        <div>
                          <span className="text-slate-500">Estimated Additional Pack Cost:</span>
                          <span className="font-bold text-white ml-2 text-sm">
                            ${simResult.diff.financialImpactEstimatedUsd}/mo
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Effective Modules Enabled:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {simResult.projectedState.effectiveModules?.map((m: string) => (
                              <span key={m} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-xs text-slate-600 italic">
                      Click "Execute Simulation Sandbox" to preview live entitlement effects.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] text-slate-600 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-500" /> Safe mode: No database records mutated.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Tenant Modal */}
      {showNewTenantModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Provision New Tenant Instance</h3>
            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tenant Code (e.g. DUBAI_TOURS)</label>
                <input
                  required
                  type="text"
                  value={newTenantForm.tenantCode}
                  onChange={(e) =>
                    setNewTenantForm({
                      ...newTenantForm,
                      tenantCode: e.target.value.toUpperCase(),
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Display Name</label>
                <input
                  required
                  type="text"
                  value={newTenantForm.displayName}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, displayName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Legal Entity Name</label>
                <input
                  required
                  type="text"
                  value={newTenantForm.legalName}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, legalName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Plan</label>
                  <select
                    value={newTenantForm.planCode}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, planCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                  >
                    {plans.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Currency</label>
                  <input
                    type="text"
                    value={newTenantForm.currency}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, currency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Admin Owner Email</label>
                <input
                  required
                  type="email"
                  value={newTenantForm.ownerEmail}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Admin Owner Full Name</label>
                <input
                  required
                  type="text"
                  value={newTenantForm.ownerFullName}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerFullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTenantModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 text-white font-medium hover:bg-cyan-500"
                >
                  Provision Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
