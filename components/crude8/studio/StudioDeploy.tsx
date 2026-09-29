'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Rocket, FileCode2, CheckCircle2, XCircle, Loader2, ShieldCheck, PackagePlus, Send } from 'lucide-react';
import { StudioDeployment, DeployedRuntimeModule } from '@/lib/crude8/studio/studio-types';
import { StudioPanelProps, UI, Chip, Field, EmptyHint, StatusBadge } from './studio-ui';

interface DeploymentActor { userId: string; role: string; tenantId: string }

const REQUESTER: DeploymentActor = { userId: 'usr-studio-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
const APPROVER: DeploymentActor = { userId: 'usr-ops-director', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };

const ARTIFACT_TABS: { key: string; label: string }[] = [
  { key: 'databaseSchema', label: 'DB Schema (Prisma)' },
  { key: 'apiRoute', label: 'API Route' },
  { key: 'listComponent', label: 'List Component' },
  { key: 'formComponent', label: 'Form Component' },
  { key: 'validation', label: 'Validation' },
  { key: 'tests', label: 'Tests' },
  { key: 'documentation', label: 'Docs' }
];

export function DeploymentPanel({ project, sandboxId, log, actor, reloadProject }: StudioPanelProps) {
  const [deployments, setDeployments] = useState<StudioDeployment[]>([]);
  const [modules, setModules] = useState<DeployedRuntimeModule[]>([]);
  const [audit, setAudit] = useState<{ intact: boolean; verifiedCount: number } | null>(null);
  const [artifacts, setArtifacts] = useState<Record<string, string> | null>(null);
  const [artifactTab, setArtifactTab] = useState('databaseSchema');
  const [actingAs, setActingAs] = useState<DeploymentActor>(REQUESTER);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const post = useCallback(async (action: string, extra: Record<string, any> = {}) => {
    const res = await fetch('/api/crude8/studio/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, user: actingAs, ...extra })
    });
    return res.json();
  }, [actingAs]);

  const loadDeployments = useCallback(async () => {
    const res = await fetch('/api/crude8/studio/deploy');
    const json = await res.json();
    if (json.success) {
      setDeployments(json.data.deployments || []);
      setModules(json.data.deployedModules || []);
      setAudit(json.data.auditIntegrity);
    }
  }, []);

  useEffect(() => { loadDeployments().catch(() => {}); }, [loadDeployments]);

  const requestDeploy = async () => {
    setBusy(true);
    try {
      const json = await post('REQUEST', { projectId: project.projectId, notes: notes || undefined });
      if (json.success) {
        log('DEPLOYMENT', 'SUCCESS', `Deployment requested for ${project.name} v${project.version} — awaiting approval by a different admin`);
        setNotes('');
        await loadDeployments();
      } else {
        log('DEPLOYMENT', 'ERROR', json.error);
      }
    } finally { setBusy(false); }
  };

  const decide = async (deploymentId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    setBusy(true);
    try {
      const json = await post(action, { deploymentId, reason });
      if (json.success) {
        log('DEPLOYMENT', 'SUCCESS', `Deployment ${deploymentId} → ${json.data.status}${json.data.status === 'DEPLOYED' ? ' — live runtime module registered' : ''}`);
        await loadDeployments();
        await reloadProject();
      } else {
        log('DEPLOYMENT', 'ERROR', json.error);
      }
    } finally { setBusy(false); }
  };

  const promote = async () => {
    if (!sandboxId) return;
    setBusy(true);
    try {
      const json = await post('PROMOTE', { projectId: project.projectId, sandboxId });
      if (json.success) {
        log('DEPLOYMENT', 'SUCCESS', `${json.data.promoted} sandbox records promoted as seed data for ${json.data.entityName}`);
      } else {
        log('DEPLOYMENT', 'ERROR', json.error);
      }
    } finally { setBusy(false); }
  };

  const loadArtifacts = async () => {
    setBusy(true);
    try {
      const json = await post('ARTIFACTS', { projectId: project.projectId });
      if (json.success) {
        setArtifacts(json.data);
        log('DEPLOYMENT', 'INFO', 'Code artifacts generated (schema, API, components, validation, tests, docs)');
      } else {
        log('DEPLOYMENT', 'ERROR', json.error);
      }
    } finally { setBusy(false); }
  };

  const pending = deployments.filter(d => d.projectId === project.projectId && (d.status === 'PENDING_APPROVAL' || d.status === 'APPROVED'));
  const mine = deployments.filter(d => d.projectId === project.projectId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Rocket className="w-4 h-4 text-rose-400" />
          Deployment — permission + approval + audit + version required
        </div>
        {audit && <Chip tone={audit.intact ? 'emerald' : 'rose'}>deployment audit {audit.intact ? `intact · ${audit.verifiedCount}` : 'BROKEN'}</Chip>}
      </div>

      {/* Lifecycle */}
      <div className={`${UI.panel} space-y-3`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-end">
          <Field label="Acting as (separation of duties)">
            <select className={UI.input} value={actingAs.userId} onChange={e => setActingAs(e.target.value === REQUESTER.userId ? REQUESTER : APPROVER)}>
              <option value={REQUESTER.userId}>{REQUESTER.userId} — Requester</option>
              <option value={APPROVER.userId}>{APPROVER.userId} — Approver</option>
            </select>
          </Field>
          <Field label="Notes (optional)"><input className={UI.input} value={notes} onChange={e => setNotes(e.target.value)} placeholder="change context for the approver" /></Field>
          <button onClick={requestDeploy} disabled={busy || project.status === 'DEPLOYED'} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {project.status === 'DEPLOYED' ? 'Already Deployed' : 'Request Deployment'}
          </button>
        </div>

        {pending.length > 0 && (
          <div className="space-y-2">
            <div className={UI.label}>Awaiting decision</div>
            {pending.map(d => (
              <div key={d.deploymentId} className="p-3 bg-slate-950 border border-amber-900/60 rounded-xl flex flex-col lg:flex-row lg:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">{d.projectName} v{d.version} <StatusBadge status={d.status} /></div>
                  <div className="text-[10px] text-slate-500 truncate">requested by {d.requestedBy} · {d.notes || 'no notes'} · hash {d.entryHash.slice(0, 12)}…</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decide(d.deploymentId, 'APPROVE')}
                    disabled={busy || actingAs.userId === d.requestedBy}
                    title={actingAs.userId === d.requestedBy ? 'Separation of duties: requester cannot approve' : 'Approve as current identity'}
                    className={`${UI.btnSuccess} flex items-center gap-1.5`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Deploy
                  </button>
                  <button onClick={() => decide(d.deploymentId, 'REJECT', 'Rejected from studio UI')} disabled={busy} className={UI.btnDanger}>
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
            {actingAs.userId === REQUESTER.userId && (
              <div className="flex items-center gap-2 text-[11px] text-amber-400/90">
                <ShieldCheck className="w-3.5 h-3.5" /> Switch "Acting as" to the Approver identity to approve — the requester can never approve their own deployment.
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button onClick={promote} disabled={busy || !sandboxId} title={sandboxId ? 'Promote sandbox records as seed data' : 'Create a sandbox in the Simulator first'} className={`${UI.btnGhost} flex items-center gap-1.5`}>
            <PackagePlus className="w-3.5 h-3.5" /> Promote Sandbox Records
          </button>
          <button onClick={loadArtifacts} disabled={busy} className={`${UI.btnGhost} flex items-center gap-1.5`}>
            <FileCode2 className="w-3.5 h-3.5" /> Generate Code Artifacts
          </button>
        </div>
      </div>

      {/* Artifacts */}
      {artifacts && (
        <div className={`${UI.panel} space-y-2`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={UI.heading}>Generated Output</span>
            {ARTIFACT_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setArtifactTab(t.key)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                  artifactTab === t.key ? 'bg-sky-600/20 text-sky-300 border border-sky-800/60' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-auto custom-scrollbar max-h-96 font-mono text-[10px] leading-relaxed text-slate-300">
            {artifacts[artifactTab]}
          </pre>
        </div>
      )}

      {/* Deployment history */}
      <div className={`${UI.panel} space-y-2`}>
        <div className={UI.label}>Deployment History ({mine.length})</div>
        <div className="h-40 overflow-y-auto custom-scrollbar space-y-1.5">
          {mine.map(d => (
            <div key={d.deploymentId} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3 text-xs">
              <StatusBadge status={d.status} />
              <span className="font-bold text-white">v{d.version}</span>
              <span className="text-slate-500">by {d.requestedBy}{d.approver ? ` · approved by ${d.approver}` : ''}</span>
              <span className="text-[10px] text-slate-600">{new Date(d.requestedAt).toLocaleTimeString()}</span>
              <span className="ml-auto font-mono text-[10px] text-slate-700">{d.entryHash.slice(0, 12)}…</span>
            </div>
          ))}
          {mine.length === 0 && <EmptyHint text="No deployments for this module yet." />}
        </div>
      </div>

      {/* Live runtime modules */}
      <div className={`${UI.panel} space-y-2`}>
        <div className={UI.label}>Live Runtime Modules ({modules.length})</div>
        <div className="space-y-1.5">
          {modules.map(m => (
            <div key={m.entityName} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 lg:grid-cols-5 gap-2 items-center text-xs">
              <span className="font-bold text-white">{m.entityName}</span>
              <Chip tone="violet">{m.module}</Chip>
              <span className="text-slate-400">v{m.deployedVersion}</span>
              <span className="text-slate-500">{m.fields.length} fields · {m.permissionRules.length} rules</span>
              <span className="text-slate-500 truncate">sync: {m.syncTargets.join(', ') || '—'}</span>
            </div>
          ))}
          {modules.length === 0 && <EmptyHint text="Nothing deployed yet — approve a pending deployment as the Approver identity." />}
        </div>
        {modules.length > 0 && (
          <div className="text-[11px] text-slate-500">
            Deployed modules serve records at <span className="font-mono text-slate-300">/api/crude8/studio/runtime/[entity]</span> with generated fields, permission gates and create-rule validation.
          </div>
        )}
      </div>
    </div>
  );
}
