'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlaskConical, Plus, RefreshCw, Play, ShieldCheck, Zap, Trash2, Loader2,
  Database, History, GitCompare, Undo2, Eye, Pencil, CheckCircle2, XCircle, Lock
} from 'lucide-react';
import {
  SandboxPersona, SANDBOX_PERSONA_USERS, WorkflowTraceEntry, StudioModuleProject, StudioLogEntry
} from '@/lib/crude8/studio/studio-types';
import { StudioPanelProps, StudioSection, UI, Chip, Field, EmptyHint, StatusBadge } from './studio-ui';
import { UniversalActionType } from '@/lib/crude8/types';

type SimMode = 'UI_PREVIEW' | 'DATA' | 'WORKFLOW' | 'PERMISSIONS' | 'EVENTS';

interface ModeProps {
  project: StudioModuleProject;
  persona: SandboxPersona;
  state: SandboxStateResponse | null;
  post: (op: string, extra?: Record<string, any>) => Promise<any>;
  refreshState: () => Promise<void>;
  log: (source: StudioLogEntry['source'], level: StudioLogEntry['level'], message: string) => void;
  setLastError: (msg: string | null) => void;
  goTo?: (section: StudioSection) => void;
}

const SIM_MODES: { id: SimMode; label: string }[] = [
  { id: 'UI_PREVIEW', label: 'UI Preview' },
  { id: 'DATA', label: 'Data Simulation' },
  { id: 'WORKFLOW', label: 'Workflow Simulation' },
  { id: 'PERMISSIONS', label: 'Permission Simulation' },
  { id: 'EVENTS', label: 'Event Simulation' }
];

const PERSONAS: SandboxPersona[] = ['ADMIN', 'MANAGER', 'AGENT', 'CUSTOMER', 'SUPPLIER'];
const MATRIX_ACTIONS: UniversalActionType[] = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH', 'APPROVE'];

interface SandboxListItem { sandboxId: string; projectId: string; createdAt: string; entities: string[] }
interface SandboxStateResponse {
  sandboxId: string;
  records: Record<string, any>[];
  events: { eventId: string; eventName: string; entity: string; timestamp: string; payload: Record<string, any>; subscribers: string[]; automationsTriggered: string[] }[];
  audit: { auditId: string; timestamp: string; actor: string; entity: string; action: string; recordId?: string; detail: string; entryHash: string }[];
  auditIntegrity: { intact: boolean; verifiedCount: number };
  workflowTraces: WorkflowTraceEntry[][];
}
interface PermTestResult { persona: SandboxPersona; allowed: boolean; reason?: string; matchedRule?: string }

function statusTone(status: WorkflowTraceEntry['status']): keyof typeof CHIP_TONES_MAP {
  return status === 'EXECUTED' ? 'emerald' : status === 'FAILED' ? 'rose' : status === 'MOCKED' ? 'violet' : status === 'AUTO_APPROVED' ? 'sky' : 'slate';
}
const CHIP_TONES_MAP: Record<string, string> = {
  emerald: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  rose: 'bg-rose-950 text-rose-400 border-rose-800',
  violet: 'bg-violet-950 text-violet-400 border-violet-800',
  sky: 'bg-sky-950 text-sky-400 border-sky-800',
  amber: 'bg-amber-950 text-amber-400 border-amber-800',
  slate: 'bg-slate-800 text-slate-300 border-slate-700'
};

export function SimulatorPanel({ project, log, sandboxId, setSandboxId, goTo }: StudioPanelProps) {
  const [mode, setMode] = useState<SimMode>('UI_PREVIEW');
  const [persona, setPersona] = useState<SandboxPersona>('ADMIN');
  const [state, setState] = useState<SandboxStateResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [sandboxProjectId, setSandboxProjectId] = useState<string | null>(null);

  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const sandboxUsable = !!sandboxId && sandboxProjectId === project.projectId;

  const post = useCallback(async (op: string, extra: Record<string, any> = {}) => {
    const res = await fetch('/api/crude8/studio/sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op, projectId: project!.projectId, sandboxId, ...extra })
    });
    return res.json();
  }, [project, sandboxId]);

  const refreshState = useCallback(async () => {
    if (!sandboxUsable) return;
    const json = await post('GET_STATE');
    if (json.success) setState(json.data);
  }, [post, sandboxUsable]);

  // Rebind sandbox when project changes: reuse this project's sandbox or start clean
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/crude8/studio/sandbox');
      const json = await res.json();
      if (cancelled) return;
      const list: SandboxListItem[] = json.data || [];
      const own = list.find(s => s.projectId === project!.projectId);
      if (own) {
        setSandboxId(own.sandboxId);
        setSandboxProjectId(own.projectId);
      } else {
        setSandboxId(null);
        setSandboxProjectId(null);
        setState(null);
      }
    })().catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.projectId]);

  useEffect(() => { refreshState().catch(() => {}); }, [sandboxUsable, refreshState]);

  const createSandbox = async () => {
    setBusy(true);
    setLastError(null);
    try {
      const json = await post('CREATE_SANDBOX', {});
      if (json.success) {
        setSandboxId(json.data.sandboxId);
        setSandboxProjectId(project.projectId);
        log('SIMULATOR', 'SUCCESS', `Sandbox ready — ${json.data.seededCount} mock records, personas: ${json.data.personas.join('/')}, audit chain ${json.data.auditIntact ? 'intact' : 'BROKEN'}`);
        await refreshState();
      } else {
        setLastError(json.error);
        log('SIMULATOR', 'ERROR', json.error);
      }
    } finally {
      setBusy(false);
    }
  };

  const destroySandbox = async () => {
    setBusy(true);
    try {
      await post('DESTROY');
      setSandboxId(null);
      setSandboxProjectId(null);
      setState(null);
      log('SIMULATOR', 'INFO', 'Sandbox destroyed — production untouched');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode toolbar + sandbox status */}
      <div className={`${UI.panel} flex flex-col lg:flex-row lg:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 flex-wrap">
          <FlaskConical className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">Preview Simulator</span>
          {SIM_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                mode === m.id ? 'bg-amber-600/20 text-amber-300 border border-amber-800/60' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-500" /> isolated from production
          </span>
          {sandboxUsable && state && (
            <Chip tone={state.auditIntegrity.intact ? 'emerald' : 'rose'}>
              audit {state.auditIntegrity.intact ? 'intact' : 'BROKEN'} · {state.auditIntegrity.verifiedCount}
            </Chip>
          )}
          {sandboxUsable && (
            <button onClick={destroySandbox} disabled={busy} className={UI.btnDanger}>Destroy Sandbox</button>
          )}
        </div>
      </div>

      {lastError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-800 text-[11px] text-rose-300">
          <XCircle className="w-3.5 h-3.5" /> {lastError}
        </div>
      )}

      {!sandboxUsable ? (
        <div className={`${UI.panel} text-center space-y-3 py-10`}>
          <Database className="w-10 h-10 mx-auto text-slate-600" />
          <div className="text-sm font-bold text-white">No sandbox for this module</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create an isolated preview environment: its own record store, mock data, sandbox users (Admin / Manager / Agent / Customer / Supplier),
            hash-chained audit chain and event log. Production CRUDE8 stores are never touched.
          </p>
          <button onClick={createSandbox} disabled={busy} className={`${UI.btnPrimary} inline-flex items-center gap-1.5`}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Create Sandbox + Seed Mock Data
          </button>
        </div>
      ) : (
        <>
          {/* Persona bar */}
          <div className={`${UI.panel} flex items-center gap-2 flex-wrap`}>
            <span className={UI.label}>Acting as</span>
            {PERSONAS.map(p => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition ${
                  persona === p ? 'bg-violet-600/20 text-violet-300 border border-violet-800/60' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={`${SANDBOX_PERSONA_USERS[p].userId} · ${SANDBOX_PERSONA_USERS[p].role}`}
              >
                {p}
              </button>
            ))}
            <Chip tone="slate">{SANDBOX_PERSONA_USERS[persona].role}</Chip>
            <div className="flex-1" />
            <button onClick={refreshState} className={`${UI.btnGhost} flex items-center gap-1.5`}><RefreshCw className="w-3 h-3" /> Refresh</button>
          </div>

          {mode === 'UI_PREVIEW' && <UiPreviewMode project={project} persona={persona} state={state} post={post} refreshState={refreshState} log={log} setLastError={setLastError} goTo={goTo} />}
          {mode === 'DATA' && <DataMode project={project} persona={persona} state={state} post={post} refreshState={refreshState} log={log} setLastError={setLastError} />}
          {mode === 'WORKFLOW' && <WorkflowMode project={project} persona={persona} state={state} post={post} refreshState={refreshState} log={log} setLastError={setLastError} />}
          {mode === 'PERMISSIONS' && <PermissionsMode project={project} persona={persona} state={state} post={post} refreshState={refreshState} log={log} setLastError={setLastError} />}
          {mode === 'EVENTS' && <EventsMode project={project} persona={persona} state={state} post={post} refreshState={refreshState} log={log} setLastError={setLastError} />}
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Mode 1: UI Preview — real records through the composed UI
// ------------------------------------------------------------

function UiPreviewMode({ project, persona, state, post, refreshState, log, setLastError, goTo }: ModeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);

  const records: Record<string, any>[] = state?.records || [];
  const selected = records.find(r => r.id === selectedId) || null;
  const listType = project.ui.listView.type;
  const columns: string[] = project.ui.listView.columns.length > 0 ? project.ui.listView.columns : ['id', project.lifecycleField];
  const lifecycleValues = Array.from(new Set(records.map(r => String(r[project.lifecycleField] ?? '—'))));

  const startCreate = () => {
    const d: Record<string, any> = {};
    for (const f of project.fields) {
      switch (f.type) {
        case 'NUMBER': d[f.name] = 0; break;
        case 'BOOLEAN': d[f.name] = false; break;
        case 'DATE': d[f.name] = new Date().toISOString().slice(0, 10); break;
        case 'MULTISELECT': d[f.name] = []; break;
        case 'SELECT': d[f.name] = f.options?.[0] ?? ''; break;
        case 'AI': d[f.name] = ''; break;
        default: d[f.name] = '';
      }
    }
    setDraft(d);
    setEditing(true);
    setSelectedId(null);
  };

  const runAction = async (action: string, payload: Record<string, any>, id?: string) => {
    setBusy(true);
    try {
      const json = await post('RECORD_ACTION', { action, persona, payload, id });
      if (json.success) {
        const r = json.data;
        log('SIMULATOR', 'SUCCESS', `${persona} ${action} OK — events: ${r.events?.join(', ') || '—'}${r.automationsTriggered?.length ? ` · automations: ${r.automationsTriggered.join(', ')}` : ''}`);
        setEditing(false);
        await refreshState();
        return true;
      }
      setLastError(json.data?.error || json.error);
      log('SIMULATOR', 'ERROR', `${persona} ${action} denied/failed — ${json.data?.error || json.error}`);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const rowAction = async (action: string, record: Record<string, any>) => {
    const payload = project.lifecycleTransitions[action as keyof typeof project.lifecycleTransitions] !== undefined
      ? { [project.lifecycleField]: project.lifecycleTransitions[action as keyof typeof project.lifecycleTransitions] }
      : {};
    await runAction(action, payload, record.id);
  };

  const renderCell = (record: Record<string, any>, col: string) => {
    const v = record[col];
    if (v == null) return '—';
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'boolean') return v ? 'yes' : 'no';
    return String(v).length > 40 ? `${String(v).slice(0, 40)}…` : String(v);
  };

  return (
    <div className="space-y-4">
      {/* Create button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Rendered live from the composed UI spec — <span className="font-mono text-slate-300">{listType}</span> · {records.length} sandbox records
        </div>
        <button onClick={startCreate} className={`${UI.btnPrimary} flex items-center gap-1.5`} disabled={busy}>
          <Plus className="w-3.5 h-3.5" /> New {project.entityName} (as {persona})
        </button>
      </div>

      {/* Create / edit form */}
      {editing && (
        <div className={`${UI.panel} space-y-3 border-violet-800/60`}>
          <div className="flex items-center justify-between">
            <span className={UI.heading}>{selectedId ? `Edit ${project.entityName}` : `Create ${project.entityName}`} — persona {persona}</span>
            <button onClick={() => setEditing(false)} className="text-xs text-slate-500 hover:text-white">cancel</button>
          </div>
          {project.ui.formView.sections.map(section => (
            <div key={section.sectionId} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-white">{section.title}</div>
              <div className={`grid gap-2 ${section.columns === 1 ? 'grid-cols-1' : section.columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                {section.fields.map(pf => {
                  const field = project.fields.find(f => f.name === pf.field);
                  if (!field) return null;
                  return (
                    <Field key={pf.field} label={`${field.label}${field.required ? ' *' : ''}`}>
                      <MockFieldControl field={field} value={draft[field.name]} onChange={v => setDraft((d: any) => ({ ...d, [field.name]: v }))} />
                    </Field>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={() => runAction(selectedId ? 'UPDATE' : 'CREATE', draft, selectedId || undefined)}
            disabled={busy}
            className={UI.btnPrimary}
          >
            {busy ? 'Running governed pipeline…' : selectedId ? 'Save Update' : 'Create Record'}
          </button>
        </div>
      )}

      {/* List renderings */}
      {listType === 'KANBAN' && (
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
          {lifecycleValues.map(lv => (
            <div key={lv} className="w-64 shrink-0 space-y-2">
              <div className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {project.lifecycleField}: {lv} <span className="text-slate-600">({records.filter(r => String(r[project.lifecycleField] ?? '—') === lv).length})</span>
              </div>
              {records.filter(r => String(r[project.lifecycleField] ?? '—') === lv).map(rec => (
                <button key={rec.id} onClick={() => setSelectedId(rec.id)} className="w-full text-left p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 transition">
                  <div className="text-xs font-bold text-white truncate">{String(rec[columns[1]] ?? rec.id)}</div>
                  <div className="text-[10px] text-slate-500 truncate">{renderCell(rec, columns[0])}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {(listType === 'CARDS' || listType === 'GRID') && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {records.map(rec => (
            <button key={rec.id} onClick={() => setSelectedId(rec.id)} className="text-left p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-600 transition space-y-1">
              <div className="text-xs font-bold text-white truncate">{String(rec[columns[1] ?? columns[0]] ?? rec.id)}</div>
              {columns.slice(0, 4).map(c => (
                <div key={c} className="text-[10px] text-slate-400"><span className="text-slate-600">{c}:</span> {renderCell(rec, c)}</div>
              ))}
              <Chip tone="slate">{String(rec[project.lifecycleField] ?? '—')}</Chip>
            </button>
          ))}
        </div>
      )}

      {listType === 'TIMELINE' && (
        <div className="relative pl-6 space-y-3">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-800" />
          {[...records].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).map(rec => (
            <button key={rec.id} onClick={() => setSelectedId(rec.id)} className="relative text-left w-full p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 transition">
              <span className="absolute -left-[18px] top-4 w-2 h-2 rounded-full bg-sky-500" />
              <div className="text-xs font-bold text-white">{String(rec[columns[1]] ?? rec.id)}</div>
              <div className="text-[10px] text-slate-500">{String(rec.createdAt ?? '').slice(0, 19).replace('T', ' ')} · {String(rec[project.lifecycleField] ?? '—')}</div>
            </button>
          ))}
        </div>
      )}

      {(listType === 'TABLE' || listType === 'CALENDAR' || listType === 'CHARTS' || listType === 'ANALYTICS') && (
        <div className={`${UI.panel} overflow-x-auto custom-scrollbar p-0`}>
          {listType !== 'TABLE' && <div className="px-4 pt-3 text-[10px] text-amber-400/80">{listType} preview renders as table in this build.</div>}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                {columns.map(c => <th key={c} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">{c}</th>)}
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-right">actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.id} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                  {columns.map(c => <td key={c} className="px-4 py-2 text-slate-300">{renderCell(rec, c)}</td>)}
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelectedId(rec.id); setEditing(true); setDraft({ ...rec }); }} className="p-1.5 text-slate-400 hover:text-white" title="Edit"><Pencil className="w-3 h-3" /></button>
                      {Object.keys(project.lifecycleTransitions).map(a => (
                        <button key={a} onClick={() => rowAction(a, rec)} className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[9px] font-mono text-slate-300 hover:bg-slate-700" title={`${a} as ${persona}`}>{a.slice(0, 3)}</button>
                      ))}
                      <button onClick={() => runAction('DELETE', {}, rec.id)} className="p-1.5 text-rose-400 hover:text-rose-300" title="Delete"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selected && !editing && (
        <div className={`${UI.panel} space-y-2 border-sky-800/60`}>
          <div className="flex items-center justify-between">
            <span className={UI.heading}>Detail — {selected.id}</span>
            <button onClick={() => setSelectedId(null)} className="text-xs text-slate-500 hover:text-white">close</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {(project.ui.detailView.widgets.length > 0 ? project.ui.detailView.widgets : project.fields.map(f => f.name)).map(w => (
              <div key={w} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{w}</div>
                <div className="text-xs text-slate-200 mt-1 break-all">{renderCell(selected, w)}</div>
              </div>
            ))}
          </div>
          <details className="text-[10px] text-slate-500">
            <summary className="cursor-pointer hover:text-slate-300">raw sandbox record</summary>
            <pre className="mt-2 p-3 bg-slate-950 rounded-xl overflow-x-auto custom-scrollbar font-mono text-[10px] text-slate-400">{JSON.stringify(selected, null, 2)}</pre>
          </details>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <Eye className="w-3.5 h-3.5" />
        Every button runs the full governed pipeline in the sandbox: validation → permission → version → audit → event → automation. Denied actions show why.
        <button onClick={() => goTo?.('EVENTS')} className="text-sky-400 hover:text-sky-300">view event log →</button>
      </div>
    </div>
  );
}

function MockFieldControl({ field, value, onChange }: { field: any; value: any; onChange: (v: any) => void }) {
  switch (field.type) {
    case 'NUMBER': return <input type="number" className={UI.input} value={value ?? 0} onChange={e => onChange(Number(e.target.value))} />;
    case 'BOOLEAN': return <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />;
    case 'DATE': return <input type="date" className={UI.input} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'SELECT': return <select className={UI.input} value={value ?? ''} onChange={e => onChange(e.target.value)}>{(field.options || []).map((o: string) => <option key={o}>{o}</option>)}</select>;
    case 'MULTISELECT': return <input className={UI.input} placeholder="comma,separated" value={Array.isArray(value) ? value.join(',') : ''} onChange={e => onChange(e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />;
    case 'TEXTAREA': case 'RICHTEXT': return <textarea rows={3} className={UI.input} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'AI': return <input className={`${UI.input} border-violet-800/60`} placeholder="✦ AI generates at runtime — or type to override" value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'VOICE': return <input className={`${UI.input} border-cyan-800/60`} placeholder="🎙 voice input simulated" value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'SIGNATURE': return <input className={`${UI.input} border-emerald-800/60`} placeholder="✍ signature capture simulated" value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'MAP': return <input className={`${UI.input} border-amber-800/60`} placeholder="📍 location picker simulated" value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'FILE': case 'IMAGE': return <input className={UI.input} placeholder="upload simulated — file name" value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'RELATION': return <input className={UI.input} placeholder={`related ${field.relationEntity || 'record'} id`} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    default: return <input className={UI.input} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
  }
}

// ------------------------------------------------------------
// Mode 2: Data Simulation — mock regen, raw action runner, audit
// ------------------------------------------------------------

function DataMode({ project, persona, state, post, refreshState, log, setLastError }: ModeProps) {
  const [count, setCount] = useState(25);
  const [action, setAction] = useState<string>('CREATE');
  const [targetId, setTargetId] = useState('');
  const [payloadRaw, setPayloadRaw] = useState('{}');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const lifecycleActions = Object.keys(project.lifecycleTransitions || {});

  const regen = async () => {
    setBusy(true);
    try {
      const json = await post('MOCK', { count });
      if (json.success) {
        log('SIMULATOR', 'SUCCESS', `Mock data regenerated: ${json.data.regenerated} records (edge cases included)`);
        await refreshState();
      } else setLastError(json.error);
    } finally { setBusy(false); }
  };

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      let payload: any = {};
      try { payload = JSON.parse(payloadRaw || '{}'); } catch { setLastError('Payload is not valid JSON'); setBusy(false); return; }
      const json = await post('RECORD_ACTION', { action, persona, payload, id: targetId || undefined });
      setResult(json.data ?? json);
      if (json.success) {
        log('SIMULATOR', 'SUCCESS', `${persona} ${action} executed — events: ${(json.data.events || []).join(', ') || '—'}`);
        await refreshState();
      } else {
        log('SIMULATOR', 'ERROR', `${persona} ${action} → ${json.data?.error || json.error}`);
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className={`${UI.panel} flex flex-col lg:flex-row lg:items-end gap-3`}>
        <Field label="Mock batch size"><input type="number" className={UI.input} value={count} onChange={e => setCount(Number(e.target.value))} /></Field>
        <button onClick={regen} disabled={busy} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Regenerate Mock Data
        </button>
        <div className="text-[11px] text-slate-500 flex-1">Realistic deterministic values, valid relationships, and edge-case records (empties, extremes) every 7th row.</div>
      </div>

      <div className={`${UI.panel} space-y-2`}>
        <div className={UI.label}>Governed Action Runner (as {persona})</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Field label="Action">
            <select className={UI.input} value={action} onChange={e => setAction(e.target.value)}>
              {['CREATE', 'READ', 'UPDATE', 'DELETE', ...lifecycleActions].map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Record id (UPDATE/DELETE/lifecycle)"><input className={UI.input} value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="optional" /></Field>
          <div className="lg:col-span-2"><Field label="Payload JSON"><textarea rows={2} className={`${UI.input} font-mono`} value={payloadRaw} onChange={e => setPayloadRaw(e.target.value)} /></Field></div>
        </div>
        <button onClick={run} disabled={busy} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Execute in Sandbox
        </button>
        {result && (
          <pre className={`p-3 rounded-xl overflow-x-auto custom-scrollbar font-mono text-[10px] ${result.success ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-200' : 'bg-rose-950/40 border border-rose-800 text-rose-200'}`}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      {/* Audit trail */}
      <div className={`${UI.panel} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><History className="w-4 h-4 text-sky-400" /> Sandbox Audit Trail (hash-chained)</div>
          {state && <Chip tone={state.auditIntegrity.intact ? 'emerald' : 'rose'}>{state.auditIntegrity.intact ? `chain intact · ${state.auditIntegrity.verifiedCount} entries` : 'CHAIN BROKEN'}</Chip>}
        </div>
        <div className="h-56 overflow-y-auto custom-scrollbar space-y-1 font-mono text-[10px]">
          {(state?.audit || []).map(entry => (
            <div key={entry.auditId} className="flex items-center gap-2 text-slate-400">
              <span className="text-slate-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              <span className="text-sky-400">{entry.actor}</span>
              <Chip tone={entry.action.startsWith('DENIED') ? 'rose' : entry.action === 'CREATE' ? 'emerald' : 'slate'}>{entry.action}</Chip>
              <span className="truncate">{entry.detail}</span>
              <span className="ml-auto text-slate-700">{entry.entryHash.slice(0, 10)}…</span>
            </div>
          ))}
          {(state?.audit || []).length === 0 && <div className="text-slate-600">No audit entries yet.</div>}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Mode 3: Workflow Simulation — run workflows, inspect traces
// ------------------------------------------------------------

function WorkflowMode({ project, persona, state, post, refreshState, log, setLastError }: ModeProps) {
  const workflows = project.workflows || [];
  const [workflowId, setWorkflowId] = useState(workflows[0]?.workflowId || '');
  const [inputRaw, setInputRaw] = useState('{}');
  const [busy, setBusy] = useState(false);
  const [trace, setTrace] = useState<WorkflowTraceEntry[] | null>(null);

  useEffect(() => {
    if (!workflowId && workflows[0]) setWorkflowId(workflows[0].workflowId);
  }, [workflows, workflowId]);

  const run = async () => {
    setBusy(true);
    setTrace(null);
    try {
      let input: any = {};
      try { input = JSON.parse(inputRaw || '{}'); } catch { setLastError('Input is not valid JSON'); setBusy(false); return; }
      const json = await post('RUN_WORKFLOW', { workflowId, persona, input });
      if (json.success) {
        setTrace(json.data.trace || []);
        log('SIMULATOR', 'SUCCESS', `Workflow ran ${json.data.trace?.length ?? 0} nodes as ${persona}`);
        await refreshState();
      } else {
        setLastError(json.data?.error || json.error);
        log('SIMULATOR', 'ERROR', json.data?.error || json.error);
      }
    } finally { setBusy(false); }
  };

  const statusColor = (s: WorkflowTraceEntry['status']) =>
    s === 'EXECUTED' ? 'text-emerald-400' : s === 'FAILED' ? 'text-rose-400' : s === 'MOCKED' ? 'text-violet-400' : s === 'AUTO_APPROVED' ? 'text-sky-400' : 'text-slate-400';

  return (
    <div className="space-y-4">
      <div className={`${UI.panel} space-y-2`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-end">
          <Field label="Workflow">
            <select className={UI.input} value={workflowId} onChange={e => setWorkflowId(e.target.value)}>
              {workflows.map(w => <option key={w.workflowId} value={w.workflowId}>{w.name}</option>)}
            </select>
          </Field>
          <Field label="Input JSON (trigger record)"><textarea rows={2} className={`${UI.input} font-mono`} value={inputRaw} onChange={e => setInputRaw(e.target.value)} /></Field>
          <button onClick={run} disabled={busy || !workflowId} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Run as {persona}
          </button>
        </div>
        <div className="text-[11px] text-slate-500">
          Sandbox executors: CRUD steps hit the isolated store, approvals auto-resolve, AI/API calls are mocked — identical graph logic to production.
        </div>
      </div>

      {trace && (
        <div className={`${UI.panel} space-y-1.5`}>
          <div className={UI.label}>Execution Trace ({trace.length} nodes)</div>
          {trace.map((t, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px]">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-mono flex items-center justify-center">{i + 1}</span>
              <Chip tone={statusTone(t.status)}>{t.type}</Chip>
              <span className="font-bold text-white">{t.name}</span>
              <span className={statusColor(t.status)}>{t.status}</span>
              <span className="text-slate-500 truncate flex-1">{t.detail}</span>
            </div>
          ))}
        </div>
      )}

      {(state?.workflowTraces || []).length > 0 && !trace && (
        <div className={`${UI.panel} space-y-1.5`}>
          <div className={UI.label}>Recent runs</div>
          {(state?.workflowTraces || []).map((tr: WorkflowTraceEntry[], i: number) => (
            <button key={i} onClick={() => setTrace(tr)} className="w-full text-left flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] hover:border-slate-600">
              <Chip tone="slate">run {i + 1}</Chip>
              <span className="text-slate-400">{tr.length} nodes · last: {tr[tr.length - 1]?.name} ({tr[tr.length - 1]?.status})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Mode 4: Permission Simulation — persona × action tests + matrix
// ------------------------------------------------------------

function PermissionsMode({ project, state, post, log }: ModeProps) {
  const [persona, setPersona] = useState<SandboxPersona>('AGENT');
  const [action, setAction] = useState<UniversalActionType>('DELETE');
  const [recordId, setRecordId] = useState('');
  const [result, setResult] = useState<PermTestResult | null>(null);
  const [busy, setBusy] = useState(false);

  const runTest = async () => {
    setBusy(true);
    try {
      const json = await post('PERMISSION_TEST', { persona, action, recordId: recordId || undefined });
      if (json.success) {
        setResult(json.data);
        log('SIMULATOR', 'INFO', `${json.data.persona} ${action} → ${json.data.allowed ? 'ALLOWED' : 'DENIED'} (${json.data.matchedRule || json.data.reason})`);
      }
    } finally { setBusy(false); }
  };

  const [matrix, setMatrix] = useState<Record<string, PermTestResult> | null>(null);
  const [matrixBusy, setMatrixBusy] = useState(false);

  const runMatrix = async () => {
    setMatrixBusy(true);
    try {
      const entries = await Promise.all(PERSONAS.flatMap(p =>
        MATRIX_ACTIONS.map(async a => {
          const json = await post('PERMISSION_TEST', { persona: p, action: a });
          return [`${p}:${a}`, json.data] as const;
        })
      ));
      setMatrix(Object.fromEntries(entries));
      log('SIMULATOR', 'INFO', `Permission matrix computed: ${PERSONAS.length} personas × ${MATRIX_ACTIONS.length} actions`);
    } finally { setMatrixBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className={`${UI.panel} space-y-2`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 items-end">
          <Field label="Persona">
            <select className={UI.input} value={persona} onChange={e => setPersona(e.target.value as SandboxPersona)}>
              {PERSONAS.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Action">
            <select className={UI.input} value={action} onChange={e => setAction(e.target.value as UniversalActionType)}>
              {MATRIX_ACTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Record id (tests OWN_RECORDS scope)"><input className={UI.input} value={recordId} onChange={e => setRecordId(e.target.value)} placeholder="optional" /></Field>
          <button onClick={runTest} disabled={busy} className={UI.btnPrimary}>{busy ? 'Testing…' : 'Run Test'}</button>
        </div>
        {result && (
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${result.allowed ? 'bg-emerald-950/40 border-emerald-800' : 'bg-rose-950/40 border-rose-800'}`}>
            <div className="flex items-center gap-2 font-bold">
              {result.allowed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              {result.persona} · {action} → {result.allowed ? 'ALLOWED' : 'DENIED'}
            </div>
            <div className="text-slate-400">{result.reason || `matched rule: ${result.matchedRule}`}</div>
          </div>
        )}
      </div>

      <div className={`${UI.panel} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className={UI.label}>Full Persona × Action Matrix</div>
          <button onClick={runMatrix} disabled={matrixBusy} className={`${UI.btnGhost} flex items-center gap-1.5`}>
            {matrixBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />} Compute Matrix
          </button>
        </div>
        {matrix && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-1.5 pr-3 text-[10px] font-bold uppercase tracking-wider">Persona</th>
                {MATRIX_ACTIONS.map(a => <th key={a} className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider">{a}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERSONAS.map(p => (
                <tr key={p} className="border-t border-slate-800/70">
                  <td className="py-1.5 pr-3 font-mono text-slate-300">{p}</td>
                  {MATRIX_ACTIONS.map(a => {
                    const r = matrix[`${p}:${a}`];
                    return (
                      <td key={a} className="px-2 py-1.5 text-center" title={r?.reason || r?.matchedRule || ''}>
                        {r?.allowed ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400">✗</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="text-[11px] text-slate-500">
          Rules come from the Permission Builder; explicit deny beats default policy. OWN_RECORDS scope is validated against the sandbox record owner.
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Mode 5: Event Simulation — fire events, watch subscribers/automations
// ------------------------------------------------------------

function EventsMode({ project, state, post, refreshState, log, setLastError }: ModeProps) {
  const [eventName, setEventName] = useState(project.events?.[0]?.eventName || '');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const fire = async () => {
    setBusy(true);
    try {
      const json = await post('FIRE_EVENT', { eventName });
      if (json.success) {
        setNote(json.data.note);
        log('SIMULATOR', 'SUCCESS', `Event '${eventName}' simulated — ${json.data.note}`);
        await refreshState();
      } else setLastError(json.error);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className={`${UI.panel} flex flex-col lg:flex-row lg:items-end gap-3`}>
        <Field label="Event">
          <select className={UI.input} value={eventName} onChange={e => setEventName(e.target.value)}>
            {(project.events || []).map((e: any) => <option key={e.eventName}>{e.eventName}</option>)}
          </select>
        </Field>
        <button onClick={fire} disabled={busy || !eventName} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} Fire Event
        </button>
        <div className="text-[11px] text-slate-500 flex-1">{note || 'Firing an event exercises the project event registry, subscribers and enabled automations in the sandbox.'}</div>
      </div>

      <div className={`${UI.panel} space-y-1.5`}>
        <div className={UI.label}>Sandbox Event Log</div>
        <div className="h-56 overflow-y-auto custom-scrollbar space-y-1.5">
          {(state?.events || []).map((ev: any) => (
            <div key={ev.eventId} className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] space-y-1">
              <div className="flex items-center gap-2">
                <Chip tone="amber">{ev.eventName}</Chip>
                <span className="text-slate-600">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                {ev.automationsTriggered?.length > 0 && <Chip tone="emerald">automations: {ev.automationsTriggered.join(', ')}</Chip>}
              </div>
              <div className="text-slate-500">subscribers: {ev.subscribers?.join(', ') || '—'} · payload: {JSON.stringify(ev.payload)}</div>
            </div>
          ))}
          {(state?.events || []).length === 0 && <div className="text-slate-600 text-xs">No events yet — run CRUD actions, workflows or fire one above.</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VERSIONS — history, compare, rollback
// ============================================================

interface VersionMeta { versionId: string; version: number; timestamp: string; actor: string; summary: string; diffSummary: string[] }

export function VersionsPanel({ project, reloadProject, log }: StudioPanelProps) {
  const [versions, setVersions] = useState<VersionMeta[]>([]);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const [diff, setDiff] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  const loadVersions = useCallback(async () => {
    if (!project) return;
    const res = await fetch(`/api/crude8/studio/projects/${project.projectId}`);
    const json = await res.json();
    if (json.success) {
      setVersions(json.versions || []);
      const vs = (json.versions || []).map((v: VersionMeta) => v.version);
      setFrom(prev => prev ?? vs[1] ?? vs[0] ?? null);
      setTo(prev => prev ?? vs[0] ?? null);
    }
  }, [project]);

  useEffect(() => { loadVersions().catch(() => {}); }, [loadVersions]);

  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const compare = async () => {
    if (from == null || to == null) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/crude8/studio/projects/${project.projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPARE', fromVersion: from, toVersion: to, user: undefined })
      });
      const json = await res.json();
      if (json.success) setDiff(json.data.diff);
      else log('BUILDER', 'ERROR', json.error);
    } finally { setBusy(false); }
  };

  const rollback = async (targetVersion: number) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/crude8/studio/projects/${project.projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ROLLBACK', targetVersion })
      });
      const json = await res.json();
      if (json.success) {
        log('BUILDER', 'SUCCESS', `Rolled back to v${targetVersion} — new head v${json.data.version}: ${json.data.diffSummary.join('; ')}`);
        await reloadProject();
        await loadVersions();
        setDiff(null);
      } else {
        log('BUILDER', 'ERROR', json.error);
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <History className="w-4 h-4 text-violet-400" />
          Version Control — every builder change is a version
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className={`${UI.panel} space-y-2`}>
        <div className={UI.label}>History ({versions.length})</div>
        <div className="h-64 overflow-y-auto custom-scrollbar space-y-1.5">
          {versions.map(v => (
            <div key={v.versionId} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3 text-xs">
              <span className="px-2 py-0.5 rounded-lg bg-violet-950 border border-violet-800 text-violet-300 font-mono font-bold">v{v.version}</span>
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 truncate">{v.summary || '—'}</div>
                <div className="text-[10px] text-slate-500 truncate">{v.diffSummary.join(' · ') || 'no field-level changes'}</div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">{v.actor}</span>
              <span className="text-[10px] text-slate-600 shrink-0">{new Date(v.timestamp).toLocaleTimeString()}</span>
              <button
                onClick={() => rollback(v.version)}
                disabled={busy || v.version === project.version}
                title={v.version === project.version ? 'Already current' : `Rollback to v${v.version}`}
                className={`${UI.btnGhost} flex items-center gap-1 shrink-0`}
              >
                <Undo2 className="w-3 h-3" /> restore
              </button>
            </div>
          ))}
          {versions.length === 0 && <EmptyHint text="No saved versions yet — press Save Version in the header." />}
        </div>
      </div>

      <div className={`${UI.panel} space-y-2`}>
        <div className="flex items-center gap-2 text-sm font-bold text-white"><GitCompare className="w-4 h-4 text-sky-400" /> Compare Versions</div>
        <div className="flex items-end gap-2">
          <Field label="From"><select className={UI.input} value={from ?? ''} onChange={e => setFrom(Number(e.target.value))}>{versions.map(v => <option key={v.version} value={v.version}>v{v.version}</option>)}</select></Field>
          <Field label="To"><select className={UI.input} value={to ?? ''} onChange={e => setTo(Number(e.target.value))}>{versions.map(v => <option key={v.version} value={v.version}>v{v.version}</option>)}</select></Field>
          <button onClick={compare} disabled={busy} className={UI.btnPrimary}>Compare</button>
        </div>
        {diff && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] space-y-0.5">
            {diff.map((line, i) => (
              <div key={i} className={line.startsWith('+') ? 'text-emerald-400' : line.startsWith('-') ? 'text-rose-400' : 'text-slate-400'}>{line}</div>
            ))}
            {diff.length === 0 && <div className="text-slate-500">Versions are identical.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
