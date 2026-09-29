'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Sparkles, Store, Download, Loader2, Boxes, History, Rocket, FlaskConical, Layers } from 'lucide-react';
import { StudioModuleProject, StudioMode, StudioTemplateMeta } from '@/lib/crude8/studio/studio-types';
import { StudioPanelProps, UI, StatusBadge, Chip, Field, EmptyHint } from './studio-ui';

const MODES: StudioMode[] = ['CRM', 'TMS', 'ERP', 'FINANCE', 'DMS', 'CMS', 'SEO', 'SOCIAL'];

interface EntitiesPanelProps extends StudioPanelProps {
  projects: StudioModuleProject[];
  onOpenProject: (id: string) => void;
  onCreate: (body: Record<string, any>, msg: string) => Promise<void>;
  reloadProjects: () => Promise<StudioModuleProject[]>;
}

export function EntitiesPanel({ projects, onOpenProject, onCreate, goTo }: EntitiesPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<StudioMode>('CRM');
  const [blankName, setBlankName] = useState('');
  const [creating, setCreating] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setCreating(true);
    await onCreate({ prompt, mode }, `AI generated module from prompt: "${prompt.slice(0, 60)}"`);
    setCreating(false);
    setPrompt('');
  };

  const createBlank = async () => {
    if (!blankName.trim()) return;
    setCreating(true);
    await onCreate({ name: blankName.trim(), mode }, `Blank module created: ${blankName}`);
    setCreating(false);
    setBlankName('');
  };

  return (
    <div className="space-y-4">
      {/* Project cards */}
      <div className={UI.panel}>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Boxes className="w-4 h-4 text-violet-400" />
            Built Modules ({projects.length})
          </div>
          <span className="text-[11px] text-slate-500">Click a module to open it in the builders</span>
        </div>
        {projects.length === 0 ? (
          <EmptyHint text="No modules yet — generate one with AI below or install a template." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {projects.map(p => (
              <button
                key={p.projectId}
                onClick={() => onOpenProject(p.projectId)}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-violet-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white truncate">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Chip tone="violet">{p.mode}</Chip>
                  <Chip tone="sky">{p.entityName}</Chip>
                  <Chip tone="slate">v{p.version}</Chip>
                  <Chip tone={p.origin === 'AI_GENERATED' ? 'amber' : p.origin === 'TEMPLATE' ? 'emerald' : 'slate'}>{p.origin}</Chip>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-3">
                  <span>{p.fields.length} fields</span>
                  <span>{p.actions.length} actions</span>
                  <span>{p.workflows.length} workflows</span>
                  <span>{p.events.length} events</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI composer */}
      <div className={`${UI.panel} space-y-3`}>
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-amber-400" />
          AI Module Composer
          <span className="text-[11px] font-normal text-slate-500">describe the module — entity, schema, forms, workflows, permissions are generated</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-3">
            <Field label="Natural-language module description">
              <input
                className={UI.input}
                placeholder='e.g. "Create customer visa tracking with expiry reminders" or "Create a hotel supplier CRM with approval workflow"'
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
              />
            </Field>
          </div>
          <Field label="Mode">
            <select className={UI.input} value={mode} onChange={e => setMode(e.target.value as StudioMode)}>
              {MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={generate} disabled={creating || !prompt.trim()} className={`${UI.btnPrimary} flex items-center gap-1.5`}>
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Generate Module
        </button>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2">
          {[
            'Create customer visa tracking with expiry reminders',
            'Create a hotel supplier CRM with approval workflow',
            'Create an invoice system with payment tracking',
            'Create an HR employee module with onboarding approval',
            'Create an enquiry pipeline with AI qualification'
          ].map(example => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-slate-600 text-left"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Blank module */}
      <div className={`${UI.panel} flex items-end gap-3`}>
        <div className="flex-1">
          <Field label="Or start blank">
            <input className={UI.input} placeholder="Module name e.g. Travel Insurance" value={blankName} onChange={e => setBlankName(e.target.value)} />
          </Field>
        </div>
        <button onClick={createBlank} disabled={creating || !blankName.trim()} className={`${UI.btnGhost} flex items-center gap-1.5 h-9`}>
          <Plus className="w-3.5 h-3.5" /> Create Blank
        </button>
        <button onClick={() => goTo('TEMPLATES')} className={`${UI.btnGhost} flex items-center gap-1.5 h-9`}>
          <Store className="w-3.5 h-3.5" /> Browse Templates
        </button>
      </div>
    </div>
  );
}

interface TemplatesPanelProps extends StudioPanelProps {
  onCreate: (body: Record<string, any>, msg: string) => Promise<void>;
}

export function TemplatesPanel({ onCreate, log }: TemplatesPanelProps) {
  const [templates, setTemplates] = useState<StudioTemplateMeta[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/crude8/studio/generate')
      .then(res => res.json())
      .then(json => setTemplates(json.data || []))
      .catch(() => log('SYSTEM', 'ERROR', 'Failed to load template marketplace'));
  }, [log]);

  const install = async (templateId: string, name: string) => {
    setInstalling(templateId);
    await onCreate({ templateId }, `Template installed: ${name}`);
    setInstalling(null);
  };

  return (
    <div className={`${UI.panel} space-y-4`}>
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <Store className="w-4 h-4 text-emerald-400" />
        Template Marketplace ({templates.length})
        <span className="text-[11px] font-normal text-slate-500">ready-made governed modules — install, customize, version, share</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {templates.map(t => (
          <div key={t.templateId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{t.name}</span>
              <Chip tone="violet">{t.category}</Chip>
            </div>
            <p className="text-[11px] text-slate-400 min-h-[32px]">{t.description}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">{t.entityName} · {t.installs} installs</span>
              <button
                onClick={() => install(t.templateId, t.name)}
                disabled={installing === t.templateId}
                className={`${UI.btnGhost} flex items-center gap-1.5`}
              >
                {installing === t.templateId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                Install
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AnalyticsData {
  projects: { total: number; byStatus: Record<string, number>; byMode: Record<string, number>; byOrigin: Record<string, number> };
  versioning: { totalVersions: number; avgVersionsPerProject: number };
  deployment: { total: number; pending: number; deployed: number; rejected: number; auditIntegrity: { intact: boolean } };
  simulation: { activeSandboxes: number; liveRuntimeModules: number };
  marketplace: { templatesAvailable: number; templateInstalls: number };
}

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const load = () => fetch('/api/crude8/studio/analytics').then(r => r.json()).then(j => setData(j.data));
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!data) return <div className={`${UI.panel} text-xs text-slate-500`}>Loading studio analytics…</div>;

  const kpis = [
    { label: 'Built Modules', value: data.projects.total, icon: <Boxes className="w-4 h-4" />, tone: 'text-violet-400' },
    { label: 'Version Snapshots', value: data.versioning.totalVersions, icon: <History className="w-4 h-4" />, tone: 'text-sky-400' },
    { label: 'Deployments', value: data.deployment.total, icon: <Rocket className="w-4 h-4" />, tone: 'text-emerald-400' },
    { label: 'Active Sandboxes', value: data.simulation.activeSandboxes, icon: <FlaskConical className="w-4 h-4" />, tone: 'text-amber-400' },
    { label: 'Live Runtime Modules', value: data.simulation.liveRuntimeModules, icon: <Layers className="w-4 h-4" />, tone: 'text-fuchsia-400' }
  ];

  const bars = (map: Record<string, number>, tone: string) => {
    const max = Math.max(1, ...Object.values(map));
    return Object.entries(map).map(([k, v]) => (
      <div key={k} className="flex items-center gap-2 text-xs">
        <span className="w-28 text-slate-400 truncate">{k}</span>
        <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden">
          <div className={`h-full ${tone}`} style={{ width: `${(v / max) * 100}%` }} />
        </div>
        <span className="text-slate-300 font-bold w-6 text-right">{v}</span>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={`${UI.panel} !p-4`}>
            <div className={`flex items-center gap-1.5 ${k.tone}`}>{k.icon}<span className={UI.label}>{k.label}</span></div>
            <div className="text-2xl font-black text-white mt-1">{k.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${UI.panel} space-y-2`}>
          <div className={UI.heading}>Modules by Mode</div>
          {bars(data.projects.byMode, 'bg-violet-500')}
        </div>
        <div className={`${UI.panel} space-y-2`}>
          <div className={UI.heading}>Modules by Status</div>
          {bars(data.projects.byStatus, 'bg-sky-500')}
        </div>
        <div className={`${UI.panel} space-y-2`}>
          <div className={UI.heading}>Modules by Origin</div>
          {bars(data.projects.byOrigin, 'bg-emerald-500')}
          <div className="text-[11px] text-slate-500 pt-2">
            Deployment audit: {data.deployment.auditIntegrity.intact ? 'chain intact' : 'CHAIN BROKEN'} · avg {data.versioning.avgVersionsPerProject} versions/module · {data.marketplace.templateInstalls} template installs
          </div>
        </div>
      </div>
    </div>
  );
}
