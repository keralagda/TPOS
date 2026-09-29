'use client';

import React, { useEffect, useState } from 'react';
import {
  MousePointerClick, Workflow as WorkflowIcon, ShieldCheck, Zap, GitBranch,
  Plus, Trash2, ArrowUp, ArrowDown, Play, Save, CheckCircle2, AlertTriangle
} from 'lucide-react';
import {
  StudioActionStep, StudioActionStepType, StudioWorkflowNode, StudioWorkflowNodeType,
  StudioPermissionRule, StudioEventDefinition, StudioAutomationDefinition
} from '@/lib/crude8/studio/studio-types';
import { StudioPanelProps, UI, Chip, Field, EmptyHint } from './studio-ui';
import { UNIVERSAL_ACTION_TYPES, UniversalActionType } from '@/lib/crude8/types';

const ACTION_STEP_TYPES: StudioActionStepType[] = [
  'VALIDATE', 'PERMISSION_CHECK', 'CREATE_RECORD', 'UPDATE_RECORD', 'DELETE_RECORD',
  'GENERATE_EVENT', 'SEND_NOTIFICATION', 'UPDATE_ANALYTICS',
  'AI_STEP', 'API_CALL', 'CONDITION', 'APPROVAL', 'DELAY', 'HUMAN_REVIEW'
];

const WORKFLOW_NODE_TYPES: StudioWorkflowNodeType[] = [
  'TRIGGER', 'CONDITION', 'ACTION', 'APPROVAL', 'NOTIFICATION',
  'AI_STEP', 'API_CALL', 'DATABASE_UPDATE', 'DELAY', 'HUMAN_REVIEW'
];

const SCOPES: StudioPermissionRule['scope'][] = ['GLOBAL', 'ORGANIZATION', 'WORKSPACE', 'OWN_RECORDS'];
const OPERATORS = ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'contains', 'exists'];
const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'];

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

/** Comma-separated list input that preserves the raw text while typing. */
function CommaInput({ value, onChange, placeholder }: { value: string[]; onChange: (next: string[]) => void; placeholder?: string }) {
  const [raw, setRaw] = useState(value.join(', '));
  useEffect(() => { setRaw(value.join(', ')); }, [value]);
  return (
    <input
      className={UI.input}
      placeholder={placeholder}
      value={raw}
      onChange={e => {
        setRaw(e.target.value);
        onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean));
      }}
    />
  );
}

/** JSON textarea that only commits syntactically valid JSON. */
function JsonArea({ label, value, onChange }: { label: string; value: any; onChange: (next: any) => void }) {
  const [raw, setRaw] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [invalid, setInvalid] = useState(false);
  return (
    <label className="block space-y-1">
      <span className={UI.label}>{label}</span>
      <textarea
        className={`${UI.input} font-mono leading-relaxed ${invalid ? 'border-rose-600' : ''}`}
        rows={3}
        value={raw}
        onChange={e => {
          setRaw(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            setInvalid(false);
            onChange(parsed);
          } catch {
            setInvalid(true);
          }
        }}
      />
      {invalid && <span className="text-[10px] text-rose-400">Invalid JSON — changes not applied</span>}
    </label>
  );
}

// ============================================================
// CRUD ACTION DESIGNER (pipeline of typed steps)
// ============================================================

export function ActionBuilderPanel({ project, setProject, saveProject, log, goTo }: StudioPanelProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const active = project.actions.find(a => a.actionId === activeId) || project.actions[0] || null;

  const updateAction = (actionId: string, patch: Partial<typeof active>) => {
    setProject(p => ({ ...p, actions: p.actions.map(a => (a.actionId === actionId ? { ...a, ...patch } : a)) }));
  };

  const addAction = () => {
    const actionId = uid('act');
    setProject(p => ({
      ...p,
      actions: [...p.actions, {
        actionId,
        name: `New Action ${p.actions.length + 1}`,
        entity: p.entityName,
        trigger: 'BUTTON_CLICK',
        description: '',
        steps: [{ stepId: uid('step'), type: 'VALIDATE', label: 'Validate input', config: { fields: [] } }]
      }]
    }));
    setActiveId(actionId);
    log('BUILDER', 'INFO', 'Action pipeline created');
  };

  const removeAction = (actionId: string) => {
    setProject(p => ({ ...p, actions: p.actions.filter(a => a.actionId !== actionId) }));
    if (activeId === actionId) setActiveId(null);
  };

  const updateStep = (stepId: string, patch: Partial<StudioActionStep>) => {
    if (!active) return;
    updateAction(active.actionId, {
      steps: active.steps.map(s => (s.stepId === stepId ? { ...s, ...patch } : s))
    } as any);
  };

  const addStep = () => {
    if (!active) return;
    updateAction(active.actionId, {
      steps: [...active.steps, { stepId: uid('step'), type: 'UPDATE_RECORD', label: 'New step', config: {} }]
    } as any);
  };

  const removeStep = (stepId: string) => {
    if (!active) return;
    updateAction(active.actionId, { steps: active.steps.filter(s => s.stepId !== stepId) } as any);
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    if (!active) return;
    const steps = [...active.steps];
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    [steps[idx], steps[target]] = [steps[target], steps[idx]];
    updateAction(active.actionId, { steps } as any);
  };

  const mutationTypes: StudioActionStepType[] = ['CREATE_RECORD', 'UPDATE_RECORD', 'DELETE_RECORD'];
  const pipelineWarning = active
    ? active.steps.findIndex(s => mutationTypes.includes(s.type)) > -1 &&
      active.steps.findIndex(s => s.type === 'PERMISSION_CHECK') > (active.steps.findIndex(s => mutationTypes.includes(s.type)))
    : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <MousePointerClick className="w-4 h-4 text-violet-400" />
          CRUD Action Designer — composite pipelines
        </div>
        <button onClick={addAction} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> New Action</button>
      </div>

      <div className="grid xl:grid-cols-[260px_1fr] gap-4">
        {/* Action list */}
        <div className={`${UI.panel} space-y-1.5 h-fit`}>
          {project.actions.length === 0 && <EmptyHint text="No actions yet." />}
          {project.actions.map(a => (
            <div
              key={a.actionId}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition ${
                active?.actionId === a.actionId
                  ? 'bg-violet-600/20 border-violet-800/60 text-violet-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              onClick={() => setActiveId(a.actionId)}
            >
              <span className="font-bold truncate">{a.name}</span>
              <span className="flex items-center gap-1">
                <Chip tone="slate">{a.steps.length} steps</Chip>
                <button onClick={e => { e.stopPropagation(); removeAction(a.actionId); }} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-3 h-3" /></button>
              </span>
            </div>
          ))}
        </div>

        {/* Pipeline editor */}
        {!active ? <div className={UI.panel}><EmptyHint text="Select or create an action." /></div> : (
          <div className="space-y-3">
            <div className={`${UI.panel} grid grid-cols-2 lg:grid-cols-4 gap-3 items-end`}>
              <Field label="Action Name"><input className={UI.input} value={active.name} onChange={e => updateAction(active.actionId, { name: e.target.value })} /></Field>
              <Field label="Entity"><input className={UI.input} value={active.entity} onChange={e => updateAction(active.actionId, { entity: e.target.value })} /></Field>
              <Field label="Trigger">
                <select className={UI.input} value={active.trigger} onChange={e => updateAction(active.actionId, { trigger: e.target.value as typeof active.trigger })}>
                  {['BUTTON_CLICK', 'EVENT', 'SCHEDULE', 'MANUAL'].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Description"><input className={UI.input} value={active.description} onChange={e => updateAction(active.actionId, { description: e.target.value })} /></Field>
            </div>

            {pipelineWarning && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-800 text-[11px] text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" /> Pipeline order warning: a mutation runs before PERMISSION_CHECK.
              </div>
            )}

            <div className="space-y-2">
              {active.steps.map((step, idx) => (
                <div key={step.stepId} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-violet-950 border border-violet-800 text-violet-300 text-[10px] font-mono font-bold flex items-center justify-center">{idx + 1}</span>
                    <select className={`${UI.input} max-w-[190px]`} value={step.type} onChange={e => updateStep(step.stepId, { type: e.target.value as StudioActionStepType })}>
                      {ACTION_STEP_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input className={UI.input} placeholder="step label" value={step.label} onChange={e => updateStep(step.stepId, { label: e.target.value })} />
                    <button onClick={() => moveStep(idx, -1)} className="p-1 text-slate-500 hover:text-white"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveStep(idx, 1)} className="p-1 text-slate-500 hover:text-white"><ArrowDown className="w-3 h-3" /></button>
                    <button onClick={() => removeStep(step.stepId)} className="p-1 text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <StepConfig step={step} updateStep={updateStep} entities={[project.entityName]} />
                </div>
              ))}
              <button onClick={addStep} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> Add Step</button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => saveProject(`Action pipeline '${active.name}' updated (${active.steps.length} steps)`)} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
                <Save className="w-3.5 h-3.5" /> Save Action Version
              </button>
              <button onClick={() => goTo('SIMULATOR')} className={`${UI.btnGhost} flex items-center gap-1.5`}>
                <Play className="w-3.5 h-3.5" /> Test in Simulator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepConfig({ step, updateStep, entities }: {
  step: StudioActionStep;
  updateStep: (stepId: string, patch: Partial<StudioActionStep>) => void;
  entities: string[];
}) {
  const set = (key: string, value: any) => updateStep(step.stepId, { config: { ...step.config, [key]: value } });
  switch (step.type) {
    case 'VALIDATE':
      return <CommaInput value={step.config.fields || []} onChange={v => set('fields', v)} placeholder="required fields, comma separated" />;
    case 'PERMISSION_CHECK':
      return <input className={UI.input} placeholder="required role" value={step.config.role || ''} onChange={e => set('role', e.target.value)} />;
    case 'CREATE_RECORD':
      return <div className="grid lg:grid-cols-2 gap-2"><Field label="Entity"><select className={UI.input} value={step.config.entity || entities[0]} onChange={e => set('entity', e.target.value)}>{entities.map(x => <option key={x}>{x}</option>)}</select></Field><JsonArea label="Payload (supports {{field}})" value={step.config.payload} onChange={v => set('payload', v)} /></div>;
    case 'UPDATE_RECORD':
      return <JsonArea label="Patch (supports {{field}})" value={step.config.patch} onChange={v => set('patch', v)} />;
    case 'DELETE_RECORD':
      return <Field label="Mode"><select className={UI.input} value={step.config.mode || 'SOFT_DELETE'} onChange={e => set('mode', e.target.value)}>{['SOFT_DELETE', 'PERMANENT_DELETE'].map(m => <option key={m}>{m}</option>)}</select></Field>;
    case 'GENERATE_EVENT':
      return <input className={UI.input} placeholder="event name e.g. BOOKING_CONFIRMED" value={step.config.eventName || ''} onChange={e => set('eventName', e.target.value)} />;
    case 'SEND_NOTIFICATION':
      return (
        <div className="grid grid-cols-3 gap-2">
          <select className={UI.input} value={step.config.channel || 'EMAIL'} onChange={e => set('channel', e.target.value)}>{NOTIFICATION_CHANNELS.map(c => <option key={c}>{c}</option>)}</select>
          <input className={UI.input} placeholder="to ({{email}})" value={step.config.to || ''} onChange={e => set('to', e.target.value)} />
          <input className={UI.input} placeholder="template" value={step.config.template || ''} onChange={e => set('template', e.target.value)} />
        </div>
      );
    case 'UPDATE_ANALYTICS':
      return <input className={UI.input} placeholder="metric to increment" value={step.config.metric || ''} onChange={e => set('metric', e.target.value)} />;
    case 'AI_STEP':
      return <input className={UI.input} placeholder="AI prompt" value={step.config.prompt || ''} onChange={e => set('prompt', e.target.value)} />;
    case 'API_CALL':
      return (
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <select className={UI.input} value={step.config.method || 'POST'} onChange={e => set('method', e.target.value)}>{['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}</select>
          <input className={UI.input} placeholder="https://…" value={step.config.url || ''} onChange={e => set('url', e.target.value)} />
        </div>
      );
    case 'CONDITION':
      return (
        <div className="grid grid-cols-3 gap-2">
          <input className={UI.input} placeholder="field path" value={step.config.field || ''} onChange={e => set('field', e.target.value)} />
          <select className={UI.input} value={step.config.operator || 'equals'} onChange={e => set('operator', e.target.value)}>{OPERATORS.map(o => <option key={o}>{o}</option>)}</select>
          <input className={UI.input} placeholder="value" value={step.config.value ?? ''} onChange={e => set('value', e.target.value)} />
        </div>
      );
    case 'APPROVAL':
      return <input className={UI.input} placeholder="approver role" value={step.config.approverRole || ''} onChange={e => set('approverRole', e.target.value)} />;
    case 'DELAY':
      return <input type="number" className={UI.input} placeholder="minutes" value={step.config.durationMinutes ?? ''} onChange={e => set('durationMinutes', Number(e.target.value))} />;
    case 'HUMAN_REVIEW':
      return <input className={UI.input} placeholder="reviewer note" value={step.config.reviewerNote || ''} onChange={e => set('reviewerNote', e.target.value)} />;
    default:
      return null;
  }
}

// ============================================================
// VISUAL WORKFLOW BUILDER (graph of 10 node types)
// ============================================================

export function WorkflowBuilderPanel({ project, setProject, saveProject, log, goTo }: StudioPanelProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const active = project.workflows.find(w => w.workflowId === activeId) || project.workflows[0] || null;

  const updateWorkflow = (workflowId: string, patch: Partial<typeof active>) => {
    setProject(p => ({ ...p, workflows: p.workflows.map(w => (w.workflowId === workflowId ? { ...w, ...patch } : w)) }));
  };

  const addWorkflow = () => {
    const workflowId = uid('wf');
    const startNodeId = uid('n');
    setProject(p => ({
      ...p,
      workflows: [...p.workflows, {
        workflowId,
        name: `New Workflow ${p.workflows.length + 1}`,
        entity: p.entityName,
        triggerEvent: p.events[0]?.eventName || `${p.entityName.toUpperCase()}_CREATED`,
        startNodeId,
        nodes: [{ nodeId: startNodeId, type: 'TRIGGER', name: 'Trigger', config: {}, next: undefined }]
      }]
    }));
    setActiveId(workflowId);
    log('BUILDER', 'INFO', 'Workflow created');
  };

  const removeWorkflow = (workflowId: string) => {
    setProject(p => ({ ...p, workflows: p.workflows.filter(w => w.workflowId !== workflowId) }));
    if (activeId === workflowId) setActiveId(null);
  };

  const updateNode = (nodeId: string, patch: Partial<StudioWorkflowNode>) => {
    if (!active) return;
    updateWorkflow(active.workflowId, { nodes: active.nodes.map(n => (n.nodeId === nodeId ? { ...n, ...patch } : n)) } as any);
  };

  const addNode = () => {
    if (!active) return;
    const nodeId = uid('n');
    updateWorkflow(active.workflowId, {
      nodes: [...active.nodes, { nodeId, type: 'ACTION', name: 'New Node', config: {}, next: undefined }]
    } as any);
  };

  const removeNode = (nodeId: string) => {
    if (!active) return;
    if (active.startNodeId === nodeId) { log('BUILDER', 'WARN', 'Cannot remove the start node'); return; }
    updateWorkflow(active.workflowId, {
      nodes: active.nodes.filter(n => n.nodeId !== nodeId).map(n => ({
        ...n,
        next: n.next === nodeId ? undefined : n.next,
        nextTrue: n.nextTrue === nodeId ? undefined : n.nextTrue,
        nextFalse: n.nextFalse === nodeId ? undefined : n.nextFalse
      }))
    } as any);
  };

  // Wire integrity: every pointer must reference an existing node
  const dangling: string[] = [];
  if (active) {
    const ids = new Set(active.nodes.map(n => n.nodeId));
    for (const n of active.nodes) {
      for (const ptr of [n.next, n.nextTrue, n.nextFalse]) {
        if (ptr && !ids.has(ptr)) dangling.push(`${n.nodeId} → ${ptr}`);
      }
    }
  }

  const eventNames = Array.from(new Set([...project.events.map(e => e.eventName), active?.triggerEvent || ''])).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <WorkflowIcon className="w-4 h-4 text-sky-400" />
          Visual Workflow Builder
        </div>
        <button onClick={addWorkflow} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> New Workflow</button>
      </div>

      <div className="grid xl:grid-cols-[260px_1fr] gap-4">
        <div className={`${UI.panel} space-y-1.5 h-fit`}>
          {project.workflows.length === 0 && <EmptyHint text="No workflows yet." />}
          {project.workflows.map(w => (
            <div
              key={w.workflowId}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition ${
                active?.workflowId === w.workflowId
                  ? 'bg-sky-600/20 border-sky-800/60 text-sky-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              onClick={() => setActiveId(w.workflowId)}
            >
              <span className="font-bold truncate">{w.name}</span>
              <span className="flex items-center gap-1">
                <Chip tone="slate">{w.nodes.length} nodes</Chip>
                <button onClick={e => { e.stopPropagation(); removeWorkflow(w.workflowId); }} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-3 h-3" /></button>
              </span>
            </div>
          ))}
        </div>

        {!active ? <div className={UI.panel}><EmptyHint text="Select or create a workflow." /></div> : (
          <div className="space-y-3">
            <div className={`${UI.panel} grid grid-cols-2 lg:grid-cols-4 gap-3 items-end`}>
              <Field label="Workflow Name"><input className={UI.input} value={active.name} onChange={e => updateWorkflow(active.workflowId, { name: e.target.value })} /></Field>
              <Field label="Entity"><input className={UI.input} value={active.entity} onChange={e => updateWorkflow(active.workflowId, { entity: e.target.value })} /></Field>
              <Field label="Trigger Event">
                <select className={UI.input} value={active.triggerEvent} onChange={e => updateWorkflow(active.workflowId, { triggerEvent: e.target.value })}>
                  {eventNames.map(ev => <option key={ev}>{ev}</option>)}
                </select>
              </Field>
              <Field label="Start Node">
                <select className={UI.input} value={active.startNodeId} onChange={e => updateWorkflow(active.workflowId, { startNodeId: e.target.value })}>
                  {active.nodes.map(n => <option key={n.nodeId} value={n.nodeId}>{n.name} ({n.type})</option>)}
                </select>
              </Field>
            </div>

            {dangling.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-800 text-[11px] text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" /> Dangling node references: {dangling.join('; ')}
              </div>
            )}

            <div className="space-y-2">
              {active.nodes.map(node => (
                <div key={node.nodeId} className={`p-3 bg-slate-950 border rounded-xl space-y-2 ${active.startNodeId === node.nodeId ? 'border-sky-800/80' : 'border-slate-800'}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Chip tone={node.type === 'TRIGGER' ? 'sky' : node.type === 'CONDITION' ? 'amber' : node.type === 'APPROVAL' || node.type === 'HUMAN_REVIEW' ? 'violet' : node.type === 'AI_STEP' ? 'emerald' : 'slate'}>
                      {node.type}
                    </Chip>
                    <input className={`${UI.input} max-w-[200px]`} value={node.name} onChange={e => updateNode(node.nodeId, { name: e.target.value })} />
                    {active.startNodeId === node.nodeId && <Chip tone="sky">START</Chip>}
                    <div className="flex-1" />
                    {node.type === 'CONDITION' ? (
                      <>
                        <Field label="if true →">
                          <select className={`${UI.input} max-w-[160px]`} value={node.nextTrue || ''} onChange={e => updateNode(node.nodeId, { nextTrue: e.target.value || undefined })}>
                            <option value="">— end —</option>
                            {active.nodes.filter(n => n.nodeId !== node.nodeId).map(n => <option key={n.nodeId} value={n.nodeId}>{n.name}</option>)}
                          </select>
                        </Field>
                        <Field label="if false →">
                          <select className={`${UI.input} max-w-[160px]`} value={node.nextFalse || ''} onChange={e => updateNode(node.nodeId, { nextFalse: e.target.value || undefined })}>
                            <option value="">— end —</option>
                            {active.nodes.filter(n => n.nodeId !== node.nodeId).map(n => <option key={n.nodeId} value={n.nodeId}>{n.name}</option>)}
                          </select>
                        </Field>
                      </>
                    ) : node.type !== 'TRIGGER' && (
                      <Field label="next →">
                        <select className={`${UI.input} max-w-[160px]`} value={node.next || ''} onChange={e => updateNode(node.nodeId, { next: e.target.value || undefined })}>
                          <option value="">— end —</option>
                          {active.nodes.filter(n => n.nodeId !== node.nodeId).map(n => <option key={n.nodeId} value={n.nodeId}>{n.name}</option>)}
                        </select>
                      </Field>
                    )}
                    {active.startNodeId !== node.nodeId && (
                      <button onClick={() => removeNode(node.nodeId)} className="p-1 text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                  <WorkflowNodeConfig node={node} updateNode={updateNode} entities={[project.entityName]} />
                </div>
              ))}
              <button onClick={addNode} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> Add Node</button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => saveProject(`Workflow '${active.name}' updated (${active.nodes.length} nodes)`)} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
                <Save className="w-3.5 h-3.5" /> Save Workflow Version
              </button>
              <button onClick={() => goTo('SIMULATOR')} className={`${UI.btnGhost} flex items-center gap-1.5`}>
                <Play className="w-3.5 h-3.5" /> Run in Simulator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowNodeConfig({ node, updateNode, entities }: {
  node: StudioWorkflowNode;
  updateNode: (nodeId: string, patch: Partial<StudioWorkflowNode>) => void;
  entities: string[];
}) {
  const set = (key: string, value: any) => updateNode(node.nodeId, { config: { ...node.config, [key]: value } });
  switch (node.type) {
    case 'TRIGGER':
      return <div className="text-[11px] text-slate-500">Fires when the workflow trigger event occurs. Input record fields are available as {'{{field}}'}.</div>;
    case 'CONDITION':
      return (
        <div className="grid grid-cols-3 gap-2">
          <input className={UI.input} placeholder="field path (e.g. {{ai.score}})" value={node.config.field || ''} onChange={e => set('field', e.target.value)} />
          <select className={UI.input} value={node.config.operator || 'equals'} onChange={e => set('operator', e.target.value)}>{OPERATORS.map(o => <option key={o}>{o}</option>)}</select>
          <input className={UI.input} placeholder="value" value={node.config.value ?? ''} onChange={e => set('value', e.target.value)} />
        </div>
      );
    case 'ACTION':
      return (
        <div className="grid lg:grid-cols-3 gap-2">
          <Field label="Entity">
            <select className={UI.input} value={node.config.entity || entities[0]} onChange={e => set('entity', e.target.value)}>
              {entities.map(x => <option key={x}>{x}</option>)}
              {node.config.entity && !entities.includes(node.config.entity) && <option>{node.config.entity}</option>}
            </select>
          </Field>
          <Field label="Action">
            <select className={UI.input} value={node.config.action || 'CREATE'} onChange={e => set('action', e.target.value)}>
              {['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'APPROVE', 'ARCHIVE'].map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <JsonArea label="Payload" value={node.config.payload} onChange={v => set('payload', v)} />
        </div>
      );
    case 'DATABASE_UPDATE':
      return <JsonArea label="Patch" value={node.config.patch} onChange={v => set('patch', v)} />;
    case 'NOTIFICATION':
      return (
        <div className="grid grid-cols-3 gap-2">
          <select className={UI.input} value={node.config.channel || 'EMAIL'} onChange={e => set('channel', e.target.value)}>{NOTIFICATION_CHANNELS.map(c => <option key={c}>{c}</option>)}</select>
          <input className={UI.input} placeholder="to ({{email}})" value={node.config.to || ''} onChange={e => set('to', e.target.value)} />
          <input className={UI.input} placeholder="template" value={node.config.template || ''} onChange={e => set('template', e.target.value)} />
        </div>
      );
    case 'AI_STEP':
      return <input className={UI.input} placeholder="AI prompt (context fields available)" value={node.config.prompt || ''} onChange={e => set('prompt', e.target.value)} />;
    case 'API_CALL':
      return (
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <select className={UI.input} value={node.config.method || 'POST'} onChange={e => set('method', e.target.value)}>{['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}</select>
          <input className={UI.input} placeholder="https://…" value={node.config.url || ''} onChange={e => set('url', e.target.value)} />
        </div>
      );
    case 'DELAY':
      return <input type="number" className={UI.input} placeholder="duration (ms, resolved instantly in simulation)" value={node.config.durationMs ?? ''} onChange={e => set('durationMs', Number(e.target.value))} />;
    case 'APPROVAL':
    case 'HUMAN_REVIEW':
      return <div className="text-[11px] text-slate-500">In the sandbox this resolves as auto-approval by {`{role}`}; in production it routes to a real reviewer queue.</div>;
    default:
      return null;
  }
}

// ============================================================
// VISUAL PERMISSION BUILDER (roles + rules + matrix)
// ============================================================

const MATRIX_ACTIONS: UniversalActionType[] = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH', 'APPROVE'];

function defaultPolicyAllows(role: string, action: UniversalActionType): boolean {
  if (role === 'SUPER_ADMIN' || role === 'ORG_ADMIN') return true;
  if (role === 'GUEST') return action === 'READ';
  if (role === 'SALES_AGENT' || role === 'SUPPLIER') return ['CREATE', 'READ', 'UPDATE'].includes(action);
  return false;
}

export function PermissionBuilderPanel({ project, setProject, saveProject, log }: StudioPanelProps) {
  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const [newRole, setNewRole] = useState('');

  const roles = project.permissions.roles;

  const addRole = () => {
    const role = newRole.trim().toUpperCase().replace(/\s+/g, '_');
    if (!role || roles.includes(role)) return;
    setProject(p => ({ ...p, permissions: { ...p.permissions, roles: [...p.permissions.roles, role] } }));
    setNewRole('');
    log('BUILDER', 'INFO', `Role '${role}' added`);
  };

  const removeRole = (role: string) => {
    setProject(p => ({
      ...p,
      permissions: {
        ...p.permissions,
        roles: p.permissions.roles.filter(r => r !== role),
        rules: p.permissions.rules.filter(r => r.role !== role)
      }
    }));
  };

  const addRule = () => {
    const rule: StudioPermissionRule = {
      role: roles[roles.length - 1] || 'SALES_AGENT',
      action: 'READ',
      allowed: true,
      scope: 'GLOBAL'
    };
    setProject(p => ({ ...p, permissions: { ...p.permissions, rules: [...p.permissions.rules, rule] } }));
  };

  const updateRule = (idx: number, patch: Partial<StudioPermissionRule>) => {
    setProject(p => ({
      ...p,
      permissions: { ...p.permissions, rules: p.permissions.rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)) }
    }));
  };

  const removeRule = (idx: number) => {
    setProject(p => ({ ...p, permissions: { ...p.permissions, rules: p.permissions.rules.filter((_, i) => i !== idx) } }));
  };

  const ruleFor = (role: string, action: UniversalActionType) =>
    project.permissions.rules.find(r => r.role === role && r.action === action);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Permission Builder — role → action → condition → scope
        </div>
        <button onClick={() => saveProject('Permission matrix updated')} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
          <Save className="w-3.5 h-3.5" /> Save Permission Version
        </button>
      </div>

      {/* Roles */}
      <div className={`${UI.panel} space-y-2`}>
        <div className={UI.label}>Roles</div>
        <div className="flex flex-wrap gap-2 items-center">
          {roles.map(role => (
            <span key={role} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
              {role}
              <button onClick={() => removeRole(role)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              className={`${UI.input} max-w-[200px]`}
              placeholder="NEW_ROLE"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addRole()}
            />
            <button onClick={addRole} className={`${UI.btnGhost} flex items-center gap-1`}><Plus className="w-3 h-3" /> Add</button>
          </div>
        </div>
      </div>

      {/* Rules table */}
      <div className={`${UI.panel} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className={UI.label}>Rules ({project.permissions.rules.length})</div>
          <button onClick={addRule} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> Add Rule</button>
        </div>
        {project.permissions.rules.length === 0 && <EmptyHint text="No explicit rules — default governance applies (admins full access, agents CRU, customers read-only)." />}
        {project.permissions.rules.map((rule, idx) => (
          <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 lg:grid-cols-12 gap-2 items-center">
            <select className={`${UI.input} lg:col-span-2`} value={rule.role} onChange={e => updateRule(idx, { role: e.target.value })}>
              {roles.map(r => <option key={r}>{r}</option>)}
              {!roles.includes(rule.role) && <option>{rule.role}</option>}
            </select>
            <select className={`${UI.input} lg:col-span-2`} value={rule.action} onChange={e => updateRule(idx, { action: e.target.value as UniversalActionType })}>
              {UNIVERSAL_ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
            </select>
            <div className="lg:col-span-1 flex items-center gap-1.5">
              <label className="flex items-center gap-1 text-[10px] text-slate-400">
                <input type="checkbox" checked={rule.allowed} onChange={e => updateRule(idx, { allowed: e.target.checked })} />
                {rule.allowed ? 'allow' : 'deny'}
              </label>
            </div>
            <select className={`${UI.input} lg:col-span-2`} value={rule.scope} onChange={e => updateRule(idx, { scope: e.target.value as StudioPermissionRule['scope'] })}>
              {SCOPES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input className={`${UI.input} lg:col-span-4`} placeholder="condition (e.g. amount < 10000)" value={rule.condition || ''} onChange={e => updateRule(idx, { condition: e.target.value || undefined })} />
            <div className="lg:col-span-1 flex justify-end">
              <button onClick={() => removeRule(idx)} className="p-1.5 text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Matrix preview */}
      <div className={`${UI.panel} space-y-2`}>
        <div className={UI.label}>Effective Matrix Preview (explicit rules override defaults)</div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-1.5 pr-3 font-bold uppercase tracking-wider text-[10px]">Role</th>
                {MATRIX_ACTIONS.map(a => <th key={a} className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider">{a}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role} className="border-t border-slate-800/70">
                  <td className="py-1.5 pr-3 font-mono text-slate-300">{role}</td>
                  {MATRIX_ACTIONS.map(action => {
                    const rule = ruleFor(role, action);
                    const allowed = rule ? rule.allowed : defaultPolicyAllows(role, action);
                    return (
                      <td key={action} className="px-2 py-1.5 text-center">
                        <span className={allowed ? 'text-emerald-400' : 'text-rose-400'}>{allowed ? '✓' : '✗'}</span>
                        {rule && <span className="ml-1 text-[9px] text-slate-600">{rule.scope.slice(0, 4).toLowerCase()}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EVENT BUILDER
// ============================================================

export function EventBuilderPanel({ project, setProject, saveProject }: StudioPanelProps) {
  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const addEvent = () => {
    const event: StudioEventDefinition = {
      eventName: `${project.entityName.toUpperCase()}_CUSTOM_EVENT`,
      description: '',
      trigger: 'MANUAL',
      payloadFields: ['id'],
      subscribers: project.syncTargets,
      actions: []
    };
    setProject(p => ({ ...p, events: [...p.events, event] }));
  };

  const updateEvent = (idx: number, patch: Partial<StudioEventDefinition>) => {
    setProject(p => ({ ...p, events: p.events.map((e, i) => (i === idx ? { ...e, ...patch } : e)) }));
  };

  const removeEvent = (idx: number) => {
    setProject(p => ({ ...p, events: p.events.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Zap className="w-4 h-4 text-amber-400" />
          Event Designer — payloads, subscribers, reactions
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => saveProject('Event definitions updated')} className={`${UI.btnPrimary} flex items-center gap-1.5`}><Save className="w-3.5 h-3.5" /> Save Event Version</button>
          <button onClick={addEvent} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> Add Event</button>
        </div>
      </div>

      <div className="space-y-2">
        {project.events.map((event, idx) => (
          <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-2 items-center">
              <input className={`${UI.input} lg:col-span-3 font-mono`} value={event.eventName} onChange={e => updateEvent(idx, { eventName: e.target.value.toUpperCase() })} />
              <input className={`${UI.input} lg:col-span-3`} placeholder="description" value={event.description} onChange={e => updateEvent(idx, { description: e.target.value })} />
              <input className={`${UI.input} lg:col-span-2`} placeholder="trigger (e.g. ON_CREATE)" value={event.trigger} onChange={e => updateEvent(idx, { trigger: e.target.value })} />
              <div className="lg:col-span-3">
                <CommaInput value={event.payloadFields} onChange={v => updateEvent(idx, { payloadFields: v })} placeholder="payload fields" />
              </div>
              <div className="lg:col-span-1 flex justify-end">
                <button onClick={() => removeEvent(idx)} className="p-1.5 text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <CommaInput value={event.subscribers} onChange={v => updateEvent(idx, { subscribers: v })} placeholder="subscribers (modules/services)" />
              <CommaInput value={event.actions} onChange={v => updateEvent(idx, { actions: v })} placeholder="actions to run (action/automation ids)" />
            </div>
          </div>
        ))}
        {project.events.length === 0 && <EmptyHint text="No events defined." />}
      </div>
    </div>
  );
}

// ============================================================
// AUTOMATION BUILDER
// ============================================================

export function AutomationBuilderPanel({ project, setProject, saveProject }: StudioPanelProps) {
  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const addAutomation = () => {
    const automation: StudioAutomationDefinition = {
      automationId: uid('auto'),
      name: `New Automation ${project.automations.length + 1}`,
      trigger: project.events[0]?.eventName || `${project.entityName.toUpperCase()}_CREATED`,
      actions: [],
      enabled: true
    };
    setProject(p => ({ ...p, automations: [...p.automations, automation] }));
  };

  const updateAutomation = (automationId: string, patch: Partial<StudioAutomationDefinition>) => {
    setProject(p => ({ ...p, automations: p.automations.map(a => (a.automationId === automationId ? { ...a, ...patch } : a)) }));
  };

  const removeAutomation = (automationId: string) => {
    setProject(p => ({ ...p, automations: p.automations.filter(a => a.automationId !== automationId) }));
  };

  const eventNames = project.events.map(e => e.eventName);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          Automation Builder — event-triggered reactions
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => saveProject('Automations updated')} className={`${UI.btnPrimary} flex items-center gap-1.5`}><Save className="w-3.5 h-3.5" /> Save Automation Version</button>
          <button onClick={addAutomation} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> Add Automation</button>
        </div>
      </div>

      <div className="space-y-2">
        {project.automations.map(automation => (
          <div key={automation.automationId} className={`p-3 bg-slate-950 border rounded-xl grid grid-cols-2 lg:grid-cols-12 gap-2 items-center ${automation.enabled ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}>
            <div className="lg:col-span-3">
              <div className="font-bold text-xs text-white truncate">{automation.name}</div>
              <div className="font-mono text-[10px] text-slate-600">{automation.automationId}</div>
            </div>
            <input className={`${UI.input} lg:col-span-2`} value={automation.name} onChange={e => updateAutomation(automation.automationId, { name: e.target.value })} />
            <select className={`${UI.input} lg:col-span-3`} value={automation.trigger} onChange={e => updateAutomation(automation.automationId, { trigger: e.target.value })}>
              {eventNames.map(ev => <option key={ev}>{ev}</option>)}
              {!eventNames.includes(automation.trigger) && <option>{automation.trigger}</option>}
            </select>
            <div className="lg:col-span-3">
              <CommaInput value={automation.actions} onChange={v => updateAutomation(automation.automationId, { actions: v })} placeholder="action ids / step descriptions" />
            </div>
            <div className="lg:col-span-1 flex items-center justify-end gap-2">
              <label className="flex items-center gap-1 text-[10px] text-slate-400">
                <input type="checkbox" checked={automation.enabled} onChange={e => updateAutomation(automation.automationId, { enabled: e.target.checked })} />
                on
              </label>
              <button onClick={() => removeAutomation(automation.automationId)} className="p-1.5 text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {project.automations.length === 0 && <EmptyHint text="No automations defined." />}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        Enabled automations fire inside the sandbox simulator whenever their trigger event is emitted by a CRUD action or workflow.
      </div>
    </div>
  );
}
