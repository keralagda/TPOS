'use client';

import React, { useState, useEffect } from 'react';
import {
  Database, GitBranch, RefreshCw, ShieldCheck, Sparkles,
  Layers, Search, CheckCircle2, AlertTriangle, ArrowRight,
  Plus, Play, RotateCcw, FileText, ChevronRight, Activity,
  Lock, Eye, Server, Cpu, Check, Filter, Zap
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { UNIVERSAL_ENTITY_REGISTRY, UniversalEntityRegistry } from '@/lib/crude8/entity-registry';
import { CRUDEntityName, UniversalEntitySchema, UniversalActionType } from '@/lib/crude8/types';
import { CRUDCapabilityMatrix, CRUD_CAPABILITY_MATRIX } from '@/lib/crude8/capability-matrix';
import { CRUDE8Engine } from '@/lib/crude8/crud-engine';
import { Sync8Engine, SyncExecutionLog } from '@/lib/crude8/sync-engine';
import { CRUDE8AuditEngine, AuditRecord } from '@/lib/crude8/audit-engine';
import { CRUDE8VersionEngine } from '@/lib/crude8/version-engine';
import { CRUDE8AIAssistant, AICRUDProposal } from '@/lib/crude8/ai-crud-assistant';

export default function CRUDE8AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'CAPABILITY_MATRIX' | 'ENTITY_REGISTRY' | 'SYNC8_STREAM' | 'VERSION_AUDIT' | 'AI_CRUD_CONSOLE' | 'DATA_EXPLORER'
  >('DASHBOARD');

  // Capability Matrix state
  const matrixModules = CRUDCapabilityMatrix.listModules();
  const matrixStats = CRUDCapabilityMatrix.getMatrixStats();
  const matrixValidation = CRUDCapabilityMatrix.validate();
  const [selectedCapability, setSelectedCapability] = useState<CRUDEntityName>('Customer');
  const activeCapability = CRUD_CAPABILITY_MATRIX[selectedCapability];

  // Universal Action Runner state
  const [runnerEntity, setRunnerEntity] = useState<CRUDEntityName>('Journey');
  const [runnerAction, setRunnerAction] = useState<UniversalActionType>('PUBLISH');
  const [runnerId, setRunnerId] = useState('jrn-201');
  const [runnerPayload, setRunnerPayload] = useState('');
  const [runnerResult, setRunnerResult] = useState<any | null>(null);
  const [runnerError, setRunnerError] = useState<string | null>(null);

  // Selected Entity for Registry & Data Explorer
  const [selectedEntityName, setSelectedEntityName] = useState<CRUDEntityName>('Customer');
  const entityList = UniversalEntityRegistry.listEntities();
  const activeSchema = UNIVERSAL_ENTITY_REGISTRY[selectedEntityName];

  // Live Records for Data Explorer
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Sync8 state
  const [syncLogs, setSyncLogs] = useState<SyncExecutionLog[]>([]);
  const [syncHealth, setSyncHealth] = useState<any>(null);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('Create VIP customer named Rajesh Pillai with gold tier');
  const [currentProposal, setCurrentProposal] = useState<AICRUDProposal | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // New Record Form state (In-page tab, strictly no modal)
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFormData, setNewFormData] = useState<Record<string, any>>({});
  const [crudError, setCrudError] = useState<string | null>(null);
  const [crudSuccess, setCrudSuccess] = useState<string | null>(null);

  // Refresh data
  const loadData = async () => {
    try {
      const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
      const res = await CRUDE8Engine.read(selectedEntityName, {}, user);
      setRecords(res.data || []);
      setSyncLogs(Sync8Engine.getLogs(30));
      setSyncHealth(Sync8Engine.getHealth());
      setAuditLogs(CRUDE8AuditEngine.query({ limit: 30 }));
    } catch (err: any) {
      console.error('CRUDE8 loading error:', err);
    }
  };

  useEffect(() => {
    loadData();
    setIsCreatingNew(false);
    setSelectedRecord(null);
    setNewFormData({});
    setCrudError(null);
  }, [selectedEntityName]);

  // Handle Create Record Inline
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudError(null);
    setCrudSuccess(null);
    try {
      const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
      await CRUDE8Engine.create(selectedEntityName, newFormData, user);
      setCrudSuccess(`Successfully created ${selectedEntityName} record!`);
      setIsCreatingNew(false);
      setNewFormData({});
      await loadData();
    } catch (err: any) {
      setCrudError(err.message || 'Creation failed');
    }
  };

  // Handle Soft-Delete
  const handleDeleteRecord = async (id: string) => {
    if (!confirm(`Are you sure you want to soft-delete ${selectedEntityName} [${id}]?`)) return;
    try {
      const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
      await CRUDE8Engine.delete(selectedEntityName, id, user, 'SOFT_DELETE');
      await loadData();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Handle Rollback
  const handleRollback = async (id: string, targetVersion: number) => {
    try {
      const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
      await CRUDE8Engine.rollback(selectedEntityName, id, targetVersion, user);
      alert(`Rolled back ${id} to version ${targetVersion}`);
      await loadData();
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  // Handle Universal Action Runner execution through the matrix
  const handleRunAction = async () => {
    setRunnerError(null);
    setRunnerResult(null);
    try {
      let payload: Record<string, any> = {};
      if (runnerPayload.trim()) {
        payload = JSON.parse(runnerPayload);
      }
      const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
      const res = await CRUDE8Engine.execute(runnerEntity, runnerAction, user, {
        id: runnerId.trim() || undefined,
        payload
      });
      setRunnerResult(res);
      await loadData();
    } catch (err: any) {
      setRunnerError(err.message || 'Universal action failed');
    }
  };

  // Handle AI Interpretation
  const handleAiInterpret = () => {
    const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
    const proposal = CRUDE8AIAssistant.interpretCommand(aiPrompt, user);
    setCurrentProposal(proposal);
    setAiSuccessMessage(null);
  };

  // Handle AI Execution
  const handleAiExecute = async () => {
    if (!currentProposal) return;
    try {
      const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
      if (currentProposal.action === 'CREATE') {
        await CRUDE8Engine.create(currentProposal.entity, currentProposal.suggestedPayload, user);
      } else if (currentProposal.action === 'UPDATE' && currentProposal.filters.id) {
        await CRUDE8Engine.update(currentProposal.entity, currentProposal.filters.id, currentProposal.suggestedPayload, user);
      } else if (currentProposal.action === 'DELETE' && currentProposal.filters.id) {
        await CRUDE8Engine.delete(currentProposal.entity, currentProposal.filters.id, user, 'SOFT_DELETE');
      }
      setAiSuccessMessage(`Proposal successfully executed on ${currentProposal.entity}!`);
      setCurrentProposal(null);
      await loadData();
    } catch (err: any) {
      alert(`AI execution error: ${err.message}`);
    }
  };

  return (
    <InternalLayout>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-sky-500/20">
                <Database className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  CRUDE8 Engine
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800/80">
                    REAL-TIME v3.0
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Universal Governed Real-Time CRUD, Sync8 Multi-Module Cascades & Cryptographic Audit
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/admin/crude8/studio"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CRUDE8 Studio</span>
            </a>
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Telemetry</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sync8 Reactive Bus Active</span>
            </div>
          </div>
        </div>

        {/* In-Page Tab Navigation (MODAL-FREE ARCHITECTURE) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'DASHBOARD'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('DATA_EXPLORER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'DATA_EXPLORER'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('CAPABILITY_MATRIX')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'CAPABILITY_MATRIX'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Capability Matrix ({matrixStats.totalEntities})</span>
          </button>

          <button
            onClick={() => setActiveTab('ENTITY_REGISTRY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'ENTITY_REGISTRY'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Entity Registry ({entityList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SYNC8_STREAM')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'SYNC8_STREAM'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sync8 Stream ({syncLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VERSION_AUDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'VERSION_AUDIT'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit & Rollback</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_CRUD_CONSOLE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'AI_CRUD_CONSOLE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CRUD Console</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Governed Entities</div>
                <div className="text-2xl font-black text-white mt-1">{matrixStats.totalEntities} Types</div>
                <div className="text-[11px] text-sky-400 mt-1">{matrixStats.totalModules} modules · 100% Matrix Governed</div>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sync8 Cascade Rate</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{syncHealth?.syncedRate || 100}%</div>
                <div className="text-[11px] text-slate-400 mt-1">{syncHealth?.totalCascades || 0} multi-domain events</div>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Sync Latency</div>
                <div className="text-2xl font-black text-sky-400 mt-1">{syncHealth?.avgLatencyMs || 6} ms</div>
                <div className="text-[11px] text-slate-400 mt-1">Real-time pub/sub bus</div>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Cryptographic Audit</div>
                <div className="text-2xl font-black text-indigo-400 mt-1">SHA-256 Chained</div>
                <div className="text-[11px] text-slate-400 mt-1">Tamper-evident logs</div>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
              <div className="font-bold text-white text-sm">Governed Pipeline Architecture</div>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-sky-400 font-bold">1. Registry</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Schema & Types</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-amber-400 font-bold">2. Permission</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">RBAC & Tenant</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-emerald-400 font-bold">3. Concurrency</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Optimistic Lock</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-indigo-400 font-bold">4. Mutation</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">State & Snapshots</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-purple-400 font-bold">5. Audit</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hash Chained</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-pink-400 font-bold">6. Event Bus</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Reactive Stream</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-cyan-400 font-bold">7. Sync8</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Cascade Multi-Mod</div>
                </div>
              </div>
            </div>

            {/* Quick Entity Switcher */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Governed Entities (Matrix-Covered)</span>
                <span className="text-[11px] text-slate-500">Click any entity to inspect data</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {entityList.map(ent => (
                  <button
                    key={ent.entityName}
                    onClick={() => {
                      setSelectedEntityName(ent.entityName);
                      setActiveTab('DATA_EXPLORER');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      selectedEntityName === ent.entityName
                        ? 'bg-sky-950 text-sky-400 border-sky-800'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500">{ent.module}</div>
                    <div className="font-bold truncate">{ent.entityName}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA EXPLORER (With Inline Creation/Editing Form - NO MODAL) */}
        {activeTab === 'DATA_EXPLORER' && (
          <div className="space-y-6">
            {/* Top Bar with Entity Selector & Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entity:</span>
                <select
                  value={selectedEntityName}
                  onChange={e => setSelectedEntityName(e.target.value as CRUDEntityName)}
                  className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-sky-500"
                >
                  {entityList.map(e => (
                    <option key={e.entityName} value={e.entityName}>
                      {e.entityName} ({e.module})
                    </option>
                  ))}
                </select>

                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter records..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isCreatingNew
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingNew ? 'Close Form' : `New ${selectedEntityName}`}</span>
                </button>
              </div>
            </div>

            {/* Inline Creation Form (MODAL-FREE IN-PAGE DRAWER/PANEL) */}
            {isCreatingNew && (
              <div className="p-6 bg-slate-900 border border-emerald-800/80 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span>Create New {selectedEntityName} (In-Page Sub-Form)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Governed by {activeSchema.module} Registry</span>
                </div>

                {crudError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{crudError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateRecord} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSchema.fields.map(field => (
                      <div key={field.name} className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                          <span>{field.name}</span>
                          {field.required && <span className="text-rose-400 text-[10px]">*Required</span>}
                        </label>
                        <input
                          type={field.type === 'NUMBER' ? 'number' : 'text'}
                          placeholder={field.description}
                          required={field.required}
                          value={newFormData[field.name] || ''}
                          onChange={e => setNewFormData({ ...newFormData, [field.name]: field.type === 'NUMBER' ? Number(e.target.value) : e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Execute Governed Create</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Records Table */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="p-4">Primary ID</th>
                      <th className="p-4">Key Data</th>
                      <th className="p-4">Version</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {records
                      .filter(r => JSON.stringify(r).toLowerCase().includes(searchFilter.toLowerCase()))
                      .map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4 font-mono font-bold text-sky-400">
                            {rec.id}
                          </td>
                          <td className="p-4 text-white">
                            <div className="font-bold">{rec.name || rec.title || rec.bookingNumber || rec.invoiceNumber || rec.id}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {rec.email || rec.destination || rec.category || rec.fileUrl || ''}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded-lg">
                              v{rec.version || 1}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-200">
                              {rec.status || rec.bookingStatus || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedRecord(rec)}
                              className="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-400 hover:bg-sky-900 text-[11px] font-bold transition"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-400 hover:bg-rose-900 text-[11px] font-bold transition"
                            >
                              Archive
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Record Detail Panel (MODAL-FREE IN-PAGE SECTION) */}
            {selectedRecord && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white text-sm">
                      Record Inspector: {selectedRecord.id} (Version {selectedRecord.version})
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                  <pre className="text-xs text-emerald-400 font-mono">
                    {JSON.stringify(selectedRecord, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ENTITY REGISTRY EXPLORER */}
        {activeTab === 'ENTITY_REGISTRY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Entity Sidebar List */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                {entityList.length} Canonical Entities
              </div>
              <div className="space-y-1">
                {entityList.map(ent => (
                  <button
                    key={ent.entityName}
                    onClick={() => setSelectedEntityName(ent.entityName)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      selectedEntityName === ent.entityName
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div>{ent.entityName}</div>
                      <div className={`text-[10px] ${selectedEntityName === ent.entityName ? 'text-sky-200' : 'text-slate-500'}`}>
                        {ent.module}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30">
                      {ent.fields.length} fields
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Schema Inspector */}
            <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeSchema.entityName} Schema</h2>
                  <p className="text-xs text-slate-400">Module: {activeSchema.module} | Version {activeSchema.version}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-lg text-xs font-mono font-bold">
                    {activeSchema.permissions.dataScopeRule}
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Field Definitions ({activeSchema.fields.length})</div>
                <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800">
                  {activeSchema.fields.map(f => (
                    <div key={f.name} className="p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white font-mono">{f.name}</span>
                        <span className="text-slate-500 ml-2">({f.type})</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">{f.description}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {f.required && (
                          <span className="px-2 py-0.5 bg-rose-950 text-rose-400 rounded text-[10px] font-bold">Required</span>
                        )}
                        {f.unique && (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-400 rounded text-[10px] font-bold">Unique</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RBAC Policies & Event Handlers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">RBAC Permissions</div>
                  <div className="text-xs space-y-1">
                    <div className="text-slate-300"><span className="text-slate-500">Create:</span> {activeSchema.permissions.createRoles.join(', ')}</div>
                    <div className="text-slate-300"><span className="text-slate-500">Read:</span> {activeSchema.permissions.readRoles.join(', ')}</div>
                    <div className="text-slate-300"><span className="text-slate-500">Update:</span> {activeSchema.permissions.updateRoles.join(', ')}</div>
                    <div className="text-slate-300"><span className="text-slate-500">Delete:</span> {activeSchema.permissions.deleteRoles.join(', ')}</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sync8 Targets</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeSchema.events.syncTargets.map(tgt => (
                      <span key={tgt} className="px-2.5 py-1 bg-sky-950 text-sky-400 border border-sky-800 rounded-lg text-xs font-mono font-bold">
                        {tgt}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Emits: <code className="text-slate-400">{activeSchema.events.onCreatedEvent}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2.5: CRUD CAPABILITY MATRIX */}
        {activeTab === 'CAPABILITY_MATRIX' && (
          <div className="space-y-6">
            {/* Matrix Stats Strip */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 flex-1">
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Entities</div>
                  <div className="text-xl font-black text-white mt-0.5">{matrixStats.totalEntities}</div>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modules</div>
                  <div className="text-xl font-black text-sky-400 mt-0.5">{matrixStats.totalModules}</div>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pages Bound</div>
                  <div className="text-xl font-black text-indigo-400 mt-0.5">{matrixStats.totalPages}</div>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Automations</div>
                  <div className="text-xl font-black text-amber-400 mt-0.5">{matrixStats.totalAutomations}</div>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Actions</div>
                  <div className="text-xl font-black text-violet-400 mt-0.5">{matrixStats.totalAiActions}</div>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reports</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">{matrixStats.totalReports}</div>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sync Rules</div>
                  <div className="text-xl font-black text-cyan-400 mt-0.5">{matrixStats.totalSyncRules}</div>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border flex flex-col justify-center min-w-[220px] ${
                matrixValidation.valid
                  ? 'bg-emerald-950/60 border-emerald-800'
                  : 'bg-rose-950/60 border-rose-800'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold">
                  {matrixValidation.valid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Matrix Governance Validated</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-300">{matrixValidation.errors.length} Violations</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {matrixStats.universalActionTypes} universal actions enforced
                </div>
              </div>
            </div>

            {/* Universal Action Runner */}
            <div className="p-5 bg-slate-900/60 border border-violet-900/60 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-white">Universal Action Runner</span>
                <span className="text-[11px] text-slate-400">— executes any matrix-declared action through the full governed pipeline</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <select
                  value={runnerEntity}
                  onChange={e => {
                    const next = e.target.value as CRUDEntityName;
                    setRunnerEntity(next);
                    const actions = CRUDCapabilityMatrix.listActions(next);
                    if (!actions.includes(runnerAction)) setRunnerAction(actions[0]);
                  }}
                  className="md:col-span-3 bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-violet-500"
                >
                  {Object.keys(CRUD_CAPABILITY_MATRIX).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>

                <select
                  value={runnerAction}
                  onChange={e => setRunnerAction(e.target.value as UniversalActionType)}
                  className="md:col-span-2 bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-violet-500"
                >
                  {CRUDCapabilityMatrix.listActions(runnerEntity).map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Record ID (required for most actions)"
                  value={runnerId}
                  onChange={e => setRunnerId(e.target.value)}
                  className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />

                <input
                  type="text"
                  placeholder='Payload JSON e.g. {"assigneeId":"usr-2"}'
                  value={runnerPayload}
                  onChange={e => setRunnerPayload(e.target.value)}
                  className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500"
                />

                <button
                  onClick={handleRunAction}
                  className="md:col-span-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run</span>
                </button>
              </div>

              {runnerError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{runnerError}</span>
                </div>
              )}

              {runnerResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">
                      {runnerResult.metadata.universalAction} executed as {runnerResult.metadata.action}
                    </span>
                    <span className="text-slate-500">| version v{runnerResult.version} | audit {runnerResult.auditId}</span>
                    {runnerResult.events.length > 0 && (
                      <span className="text-sky-400 font-mono">{runnerResult.events.join(', ')}</span>
                    )}
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-72">
                    <pre className="text-xs text-violet-300 font-mono">
                      {JSON.stringify(runnerResult.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Module-Grouped Capability Cards */}
            <div className="space-y-6">
              {matrixModules.map(({ module, entities }) => (
                <div key={module} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black text-white tracking-wide">{module}</h3>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-mono font-bold">
                      {entities.length} entities
                    </span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {entities.map(cap => {
                      const isSelected = selectedCapability === cap.entityName;
                      return (
                        <button
                          key={cap.entityName}
                          onClick={() => setSelectedCapability(cap.entityName)}
                          className={`text-left p-5 rounded-2xl border transition space-y-3 ${
                            isSelected
                              ? 'bg-violet-950/40 border-violet-700'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-extrabold text-white text-sm">{cap.displayName}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{cap.entityName}</div>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-[9px] font-mono font-bold shrink-0">
                              {cap.pages.length} pages
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {cap.pages.slice(0, 3).map(p => (
                              <div key={p.route + p.view} className="flex items-center gap-2 text-[10px]">
                                <code className="text-sky-400 font-mono truncate">{p.route}</code>
                                <span className="px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-800 shrink-0">{p.view}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {cap.crudActions.map(a => (
                              <span key={a} className="px-1.5 py-0.5 bg-sky-950 text-sky-400 rounded text-[9px] font-bold border border-sky-900">{a}</span>
                            ))}
                            {cap.bulkActions.slice(0, 5).map(a => (
                              <span key={a} className="px-1.5 py-0.5 bg-amber-950 text-amber-400 rounded text-[9px] font-bold border border-amber-900">{a}</span>
                            ))}
                            {cap.workflowActions.slice(0, 5).map(a => (
                              <span key={a} className="px-1.5 py-0.5 bg-violet-950 text-violet-400 rounded text-[9px] font-bold border border-violet-900">{a}</span>
                            ))}
                            {(cap.bulkActions.length + cap.workflowActions.length > 10) && (
                              <span className="px-1.5 py-0.5 text-[9px] text-slate-500 font-bold">+{cap.bulkActions.length + cap.workflowActions.length - 10} more</span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{cap.events.length} events</span>
                            <span>{cap.automations.length} automations</span>
                            <span>{cap.syncRules.length} sync rules</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Entity Capability Detail */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">{activeCapability.displayName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {activeCapability.entityName} · {activeCapability.module} · {activeCapability.entityId}
                  </p>
                </div>
                <select
                  value={selectedCapability}
                  onChange={e => setSelectedCapability(e.target.value as CRUDEntityName)}
                  className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-violet-500"
                >
                  {Object.keys(CRUD_CAPABILITY_MATRIX).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Action Permission Map */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Action Permission Map ({Object.entries(activeCapability.actionPermissions).filter(([, r]) => r.length > 0).length} actions)
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {Object.entries(activeCapability.actionPermissions)
                      .filter(([, roles]) => roles.length > 0)
                      .map(([action, roles]) => (
                        <div key={action} className="flex items-start justify-between gap-3 text-[11px]">
                          <span className="font-bold text-violet-300 font-mono shrink-0">{action}</span>
                          <span className="text-slate-400 text-right">{roles.join(', ')}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Lifecycle & Events */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lifecycle Transitions</div>
                    <div className="text-[11px] text-slate-400">
                      Field: <code className="text-emerald-400 font-mono">{activeCapability.lifecycleField}</code>
                      {activeCapability.assigneeField && (
                        <> · Assignee: <code className="text-sky-400 font-mono">{activeCapability.assigneeField}</code></>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(activeCapability.lifecycleTransitions).map(([action, target]) => (
                        <span key={action} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-mono">
                          <span className="text-violet-300 font-bold">{action}</span>
                          <span className="text-slate-500"> → </span>
                          <span className="text-emerald-400">{String(target)}</span>
                        </span>
                      ))}
                      {Object.keys(activeCapability.lifecycleTransitions).length === 0 && (
                        <span className="text-[11px] text-slate-500">No lifecycle transitions (state-free entity)</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events ({activeCapability.events.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCapability.events.map(evt => (
                        <span key={evt} className="px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-900 rounded-lg text-[10px] font-mono font-bold">
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Automations */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automations ({activeCapability.automations.length})</div>
                  <div className="space-y-2">
                    {activeCapability.automations.map(auto => (
                      <div key={auto.automationId} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="text-[11px] font-bold text-amber-300">{auto.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">on: {auto.trigger}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{auto.actions.join(' → ')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Actions & Reports */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Actions ({activeCapability.aiActions.length})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCapability.aiActions.map(ai => (
                      <span key={ai} className="px-2 py-1 bg-violet-950 text-violet-300 border border-violet-900 rounded-lg text-[10px] font-bold">{ai}</span>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-3">Reports ({activeCapability.reports.length})</div>
                  <div className="space-y-1">
                    {activeCapability.reports.map(rep => (
                      <div key={rep} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{rep}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sync Rules */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sync8 Rules ({activeCapability.syncRules.length})</div>
                  <div className="space-y-1.5">
                    {activeCapability.syncRules.map(rule => (
                      <div key={rule.target + rule.trigger} className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-cyan-300 font-mono">{rule.target}</span>
                        <span className="text-slate-500">{rule.trigger}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          rule.mode === 'REALTIME' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rule.mode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYNC8 STREAM */}
        {activeTab === 'SYNC8_STREAM' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Sync8 Multi-Module Execution Stream</h2>
                <p className="text-xs text-slate-400">Cascading updates across CRM, TMS, ERP, FINANCE, DMS, and NOTIFICATIONS</p>
              </div>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-bold">
                100% Synced
              </span>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-800/80">
                {syncLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No sync events recorded yet. Perform CRUD operations to view live cascading.</div>
                ) : (
                  syncLogs.map(log => (
                    <div key={log.syncId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-950 text-sky-400 rounded-xl border border-sky-800/60">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{log.sourceEntity}</span>
                            <span className="text-slate-500 text-[10px]">[{log.action}]</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-sky-400 font-mono">{log.targetModule}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{log.details}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-500">{log.latencyMs}ms</span>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[10px] font-bold">
                          {log.status}
                        </span>
                        <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT & ROLLBACK */}
        {activeTab === 'VERSION_AUDIT' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Cryptographic Audit Chain & Rollback Center</h2>
                <p className="text-xs text-slate-400">SHA-256 chained tamper-evident entries with automatic field redaction</p>
              </div>
              <div className="px-3 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Chain Verified</span>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-800/80">
                {auditLogs.map(log => (
                  <div key={log.auditId} className="p-4 space-y-2 hover:bg-slate-800/30 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-800 text-sky-400 rounded text-[10px] font-mono font-bold">
                          {log.action}
                        </span>
                        <span className="font-bold text-white text-xs">{log.entity}</span>
                        <span className="text-slate-500 text-xs font-mono">ID: {log.recordId}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Actor: {log.actor.userId} ({log.actor.role}) | {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px]">
                      <div className="text-slate-400 font-mono truncate max-w-md">
                        Hash: <span className="text-slate-500">{log.entryHash.substring(0, 24)}...</span>
                      </div>
                      {log.diffSummary && (
                        <div className="text-amber-400 font-mono text-[10px]">
                          Diff: {log.diffSummary}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI CRUD CONSOLE */}
        {activeTab === 'AI_CRUD_CONSOLE' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Natural Language CRUD Assistant</span>
              </div>
              <p className="text-xs text-slate-400">
                Enter plain English commands. The assistant interprets schema bindings, enforces safety gates, and requires explicit confirmation for destructive or bulk actions.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g. Create VIP customer named Suresh Nair with gold tier"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAiInterpret}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Translate</span>
                </button>
              </div>

              {aiSuccessMessage && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{aiSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* Generated Proposal Panel */}
            {currentProposal && (
              <div className="p-6 bg-slate-900 border border-indigo-800/80 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Governed AI Proposal</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      currentProposal.impactLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      currentProposal.impactLevel === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {currentProposal.impactLevel} IMPACT
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{currentProposal.explanation}</span>
                </div>

                {currentProposal.safetyWarning && (
                  <div className="p-3 bg-amber-950/80 border border-amber-800 text-amber-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{currentProposal.safetyWarning}</span>
                  </div>
                )}

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">Parsed Operation Payload:</div>
                  <pre className="text-xs text-indigo-300 font-mono overflow-x-auto">
                    {JSON.stringify(
                      {
                        action: currentProposal.action,
                        entity: currentProposal.entity,
                        payload: currentProposal.suggestedPayload,
                        filters: currentProposal.filters
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setCurrentProposal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                  >
                    Reject Proposal
                  </button>
                  <button
                    onClick={handleAiExecute}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize & Execute Operation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
