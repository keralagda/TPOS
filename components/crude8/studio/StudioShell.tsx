'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Boxes, Database, LayoutDashboard, MousePointerClick, GitBranch, ShieldCheck,
  Zap, Workflow, FlaskConical, Store, History, Rocket, BarChart3, Save, Loader2,
  Plus, Sparkles, Trash2
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { StudioModuleProject, StudioLogEntry } from '@/lib/crude8/studio/studio-types';
import { StudioSection, StudioPanelProps, UI, StatusBadge, Chip, Field } from './studio-ui';
import { EntitiesPanel, TemplatesPanel, AnalyticsPanel } from './StudioEntities';
import { SchemaBuilderPanel, UIBuilderPanel } from './StudioSchemaUI';
import { ActionBuilderPanel, WorkflowBuilderPanel, PermissionBuilderPanel, EventBuilderPanel, AutomationBuilderPanel } from './StudioLogic';
import { SimulatorPanel, VersionsPanel } from './StudioSimulator';
import { DeploymentPanel } from './StudioDeploy';

const SECTIONS: { id: StudioSection; label: string; icon: React.ReactNode }[] = [
  { id: 'ENTITIES', label: 'Entities', icon: <Boxes className="w-4 h-4" /> },
  { id: 'SCHEMA', label: 'Schema Builder', icon: <Database className="w-4 h-4" /> },
  { id: 'UI', label: 'UI Builder', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'ACTIONS', label: 'CRUD Builder', icon: <MousePointerClick className="w-4 h-4" /> },
  { id: 'WORKFLOW', label: 'Workflow Builder', icon: <Workflow className="w-4 h-4" /> },
  { id: 'PERMISSIONS', label: 'Permission Builder', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'EVENTS', label: 'Event Builder', icon: <Zap className="w-4 h-4" /> },
  { id: 'AUTOMATIONS', label: 'Automation Builder', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'SIMULATOR', label: 'Simulator', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'TEMPLATES', label: 'Templates', icon: <Store className="w-4 h-4" /> },
  { id: 'VERSIONS', label: 'Versions', icon: <History className="w-4 h-4" /> },
  { id: 'DEPLOYMENT', label: 'Deployment', icon: <Rocket className="w-4 h-4" /> },
  { id: 'ANALYTICS', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
];

export function CRUDE8StudioShell() {
  const [section, setSection] = useState<StudioSection>('ENTITIES');
  const [projects, setProjects] = useState<StudioModuleProject[]>([]);
  const [project, setProjectState] = useState<StudioModuleProject | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studioLog, setStudioLog] = useState<StudioLogEntry[]>([]);
  const [sandboxId, setSandboxId] = useState<string | null>(null);

  const actor = { userId: 'usr-studio-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };

  const log = useCallback((source: StudioLogEntry['source'], level: StudioLogEntry['level'], message: string) => {
    setStudioLog(prev => [{ timestamp: new Date().toISOString(), source, level, message }, ...prev].slice(0, 60));
  }, []);

  const loadProjects = useCallback(async () => {
    const res = await fetch('/api/crude8/studio/projects');
    const json = await res.json();
    setProjects(json.data || []);
    return json.data || [];
  }, []);

  const loadProject = useCallback(async (projectId: string) => {
    const res = await fetch(`/api/crude8/studio/projects/${projectId}`);
    const json = await res.json();
    if (json.success) {
      setProjectState(json.data);
      setDirty(false);
    }
  }, []);

  useEffect(() => {
    loadProjects().then(list => {
      if (list.length > 0) loadProject(list[0].projectId);
    }).catch(() => log('SYSTEM', 'ERROR', 'Failed to load studio projects'));
  }, [loadProjects, loadProject, log]);

  const setProject = useCallback((updater: (p: StudioModuleProject) => StudioModuleProject) => {
    setProjectState(prev => (prev ? updater(prev) : prev));
    setDirty(true);
  }, []);

  const saveProject = useCallback(async (summary?: string) => {
    if (!project) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crude8/studio/projects/${project.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, summary })
      });
      const json = await res.json();
      if (json.success) {
        setProjectState(json.data.project);
        setDirty(false);
        log('BUILDER', 'SUCCESS', `Saved v${json.data.version} — ${json.data.diffSummary.join('; ')}`);
      } else {
        log('BUILDER', 'ERROR', json.error);
      }
    } finally {
      setSaving(false);
    }
  }, [project, log]);

  const createProject = useCallback(async (body: Record<string, any>, successMsg: string) => {
    const res = await fetch('/api/crude8/studio/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, user: actor })
    });
    const json = await res.json();
    if (json.success) {
      await loadProjects();
      setProjectState(json.data);
      setDirty(false);
      setSection('SCHEMA');
      log('GENERATOR', 'SUCCESS', successMsg);
    } else {
      log('GENERATOR', 'ERROR', json.error);
    }
  }, [actor, loadProjects, log]);

  const panelProps: StudioPanelProps = {
    project, setProject, saveProject, log, actor, sandboxId, setSandboxId,
    reloadProject: async () => { if (project) await loadProject(project.projectId); },
    goTo: (s: StudioSection) => setSection(s)
  };

  const renderSection = () => {
    switch (section) {
      case 'ENTITIES': return <EntitiesPanel {...panelProps} projects={projects} onOpenProject={loadProject} onCreate={createProject} reloadProjects={loadProjects} />;
      case 'SCHEMA': return <SchemaBuilderPanel {...panelProps} />;
      case 'UI': return <UIBuilderPanel {...panelProps} />;
      case 'ACTIONS': return <ActionBuilderPanel {...panelProps} />;
      case 'WORKFLOW': return <WorkflowBuilderPanel {...panelProps} />;
      case 'PERMISSIONS': return <PermissionBuilderPanel {...panelProps} />;
      case 'EVENTS': return <EventBuilderPanel {...panelProps} />;
      case 'AUTOMATIONS': return <AutomationBuilderPanel {...panelProps} />;
      case 'SIMULATOR': return <SimulatorPanel {...panelProps} />;
      case 'TEMPLATES': return <TemplatesPanel {...panelProps} onCreate={createProject} />;
      case 'VERSIONS': return <VersionsPanel {...panelProps} />;
      case 'DEPLOYMENT': return <DeploymentPanel {...panelProps} />;
      case 'ANALYTICS': return <AnalyticsPanel />;
      default: return null;
    }
  };

  return (
    <InternalLayout>
      <div className="space-y-4 pb-6 max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white rounded-2xl shadow-lg shadow-violet-500/20">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                CRUDE8 Studio
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-950 text-violet-400 border border-violet-800/80">VISUAL BUILDER</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Define once. Simulate safely. Generate everywhere.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {project ? (
              <>
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="font-bold text-white">{project.name}</span>
                  <span className="text-slate-500"> · {project.entityName} · v{project.version}</span>
                </div>
                <StatusBadge status={project.status} />
                <button
                  onClick={() => saveProject()}
                  disabled={!dirty || saving}
                  className={`${UI.btnPrimary} flex items-center gap-1.5`}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {dirty ? 'Save Version' : 'Saved'}
                </button>
              </>
            ) : (
              <div className="text-xs text-slate-500">No module selected — create or pick one in Entities</div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left studio nav */}
          <nav className="w-48 shrink-0 space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  section === s.id
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          {/* Active panel */}
          <div className="flex-1 min-w-0">
            {renderSection()}
          </div>
        </div>

        {/* Bottom log / event strip */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Studio Event Log</span>
            <button onClick={() => setStudioLog([])} className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> clear
            </button>
          </div>
          <div className="h-24 overflow-y-auto custom-scrollbar space-y-1 font-mono text-[10px]">
            {studioLog.length === 0 && <div className="text-slate-600">Builder, simulator and deployment activity streams here…</div>}
            {studioLog.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <Chip tone={entry.source === 'SIMULATOR' ? 'amber' : entry.source === 'DEPLOYMENT' ? 'rose' : entry.source === 'GENERATOR' ? 'violet' : 'sky'}>{entry.source}</Chip>
                <span className={entry.level === 'ERROR' ? 'text-rose-400' : entry.level === 'SUCCESS' ? 'text-emerald-400' : entry.level === 'WARN' ? 'text-amber-400' : 'text-slate-300'}>
                  {entry.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
