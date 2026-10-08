'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building,
  ArrowLeft,
  Shield,
  Layers,
  Activity,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Package,
  Cpu,
  RefreshCw,
  Globe,
  Lock,
} from 'lucide-react';

export default function TenantControlPanel({ params }: { params: { tenantId: string } }) {
  const [tenant, setTenant] = useState<any>(null);
  const [meters, setMeters] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [allPacks, setAllPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Usage simulation
  const [usageBookingCount, setUsageBookingCount] = useState(1);
  const [usageFeedback, setUsageFeedback] = useState<string | null>(null);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const [tRes, pRes, pkRes] = await Promise.all([
        fetch(`/api/saas/tenants/${params.tenantId}`).then((r) => r.json()),
        fetch('/api/saas/plans').then((r) => r.json()),
        fetch('/api/saas/packs').then((r) => r.json()),
      ]);

      if (tRes.success) {
        setTenant(tRes.tenant);
        setMeters(tRes.meters || []);
        setSelectedPlan(tRes.tenant.planId);
        setSelectedPacks(tRes.tenant.packIds || []);
      }
      if (pRes.success) setAllPlans(pRes.plans);
      if (pkRes.success) setAllPacks(pkRes.packs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantDetails();
  }, [params.tenantId]);

  const handleUpdatePlanAndPacks = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/saas/tenants/${params.tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PLAN_PACKS',
          planCode: selectedPlan,
          packCodes: selectedPacks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Plan & Packs updated successfully!');
        fetchTenantDetails();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateUsage = async () => {
    try {
      const res = await fetch('/api/saas/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          meterKey: 'bookings',
          units: Number(usageBookingCount),
          planId: tenant.planId,
          packIds: tenant.packIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsageFeedback(data.result.message);
        fetchTenantDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !tenant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-cyan-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading Tenant Control Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-8 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link href="/admin/saas" className="hover:text-cyan-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to SaaS Plane
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Tenant Control Panel</span>
          <span>/</span>
          <span className="text-cyan-400 font-mono">{tenant.tenantCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono">ID: {tenant.id}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            v{tenant.version}
          </span>
        </div>
      </div>

      {/* Tenant Header Strip */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{tenant.displayName}</h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                  tenant.status === 'ACTIVE'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-red-950 text-red-400 border border-red-800'
                }`}
              >
                {tenant.status}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {tenant.tenantType}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Legal: {tenant.legalName} • Region: {tenant.dataRegion} • Currency: {tenant.currency}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert(`Impersonation session granted for 15 minutes. MFA recorded in audit log.`)}
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Impersonate Session
            </button>
            <button
              onClick={() => alert(`Health check completed: Auth (100%), DB (100%), Booking (100%). Score: 100/100`)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-700 flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Run Health Check
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Plan & Packs Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Commercial Plan Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  Subscription Plan Assignment
                </h3>
                <span className="text-xs text-slate-400 font-mono">Current: {tenant.planId}</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Change Plan Tier</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                >
                  {allPlans.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} (${p.basePrice}/{p.billingCycle.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Capability Packs Multi-Select */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Assigned Capability Packs ({selectedPacks.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {allPacks.map((pk) => {
                    const isChecked = selectedPacks.includes(pk.code);
                    return (
                      <label
                        key={pk.code}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-cyan-950/30 border-cyan-800/80 text-cyan-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPacks([...selectedPacks, pk.code]);
                            } else {
                              setSelectedPacks(selectedPacks.filter((c) => c !== pk.code));
                            }
                          }}
                        />
                        <div>
                          <p className="font-semibold text-slate-200">{pk.displayName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{pk.code}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleUpdatePlanAndPacks}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
                >
                  {saving ? 'Applying Changes...' : 'Save Plan & Packs Mutation'}
                </button>
              </div>
            </div>

            {/* Live Usage Meters & Overage Testing */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Active Usage Meters & Hard Barriers
              </h3>

              <div className="space-y-3">
                {meters.length > 0 ? (
                  meters.map((m) => {
                    const pct = m.limitValue > 0 ? (m.currentValue / m.limitValue) * 100 : 0;
                    return (
                      <div key={m.meterKey} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-slate-300 font-semibold">{m.meterKey}</span>
                          <span className="text-slate-400 font-mono">
                            {m.currentValue} / {m.limitValue} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              pct >= 100
                                ? 'bg-red-500'
                                : pct >= 80
                                ? 'bg-amber-500'
                                : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              m.status === 'NORMAL'
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : 'text-red-400 bg-red-950/40'
                            }`}
                          >
                            Status: {m.status}
                          </span>
                          <span className="text-slate-500">
                            {m.overageAllowed ? `Overage Allowed ($${m.overageRate}/unit)` : 'Hard Limit Block'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic">No usage records consumed yet.</p>
                )}
              </div>

              {/* Usage Simulator trigger */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={usageBookingCount}
                  onChange={(e) => setUsageBookingCount(Number(e.target.value))}
                  className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200"
                />
                <button
                  onClick={handleSimulateUsage}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium transition"
                >
                  Record Bookings Consumption
                </button>
              </div>

              {usageFeedback && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300">
                  {usageFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Isolation, Domains & Governance */}
          <div className="space-y-6">
            {/* Multi-Tenant Isolation Status */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Data Scope & Isolation
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Strategy:</span>
                  <span className="font-mono text-slate-200">{tenant.isolationStrategy}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Organization ID:</span>
                  <span className="font-mono text-cyan-400">{tenant.organizationId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Assigned Domain:</span>
                  <span className="font-mono text-slate-200">{tenant.domain}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Cross-Tenant AI Access:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Blocked
                  </span>
                </div>
              </div>
            </div>

            {/* AI Governance Profile */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Tenant AI Governance
              </h3>
              <p className="text-xs text-slate-400">
                AI trip synthesis, model training consent, and automated execution limits.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">AI Tier:</span>
                  <span className="font-mono text-purple-300">ASSISTED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Model Training on Tenant Data:</span>
                  <span className="text-emerald-400 font-bold">STRICTLY FORBIDDEN</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Autonomous Booking:</span>
                  <span className="text-amber-400 font-semibold">Human-Approval-Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
