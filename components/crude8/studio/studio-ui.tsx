'use client';

import React from 'react';
import { StudioModuleProject, StudioLogEntry } from '@/lib/crude8/studio/studio-types';

export type StudioSection =
  | 'ENTITIES' | 'SCHEMA' | 'UI' | 'ACTIONS' | 'WORKFLOW' | 'PERMISSIONS'
  | 'EVENTS' | 'AUTOMATIONS' | 'SIMULATOR' | 'TEMPLATES' | 'VERSIONS' | 'DEPLOYMENT' | 'ANALYTICS';

export interface StudioActor {
  userId: string;
  role: string;
  tenantId: string;
}

export interface StudioPanelProps {
  project: StudioModuleProject | null;
  setProject: (updater: (p: StudioModuleProject) => StudioModuleProject) => void;
  saveProject: (summary?: string) => Promise<void>;
  reloadProject: () => Promise<void>;
  log: (source: StudioLogEntry['source'], level: StudioLogEntry['level'], message: string) => void;
  actor: StudioActor;
  sandboxId: string | null;
  setSandboxId: (id: string | null) => void;
  goTo: (section: StudioSection) => void;
}

export const UI = {
  panel: 'p-5 bg-slate-900/60 border border-slate-800 rounded-2xl',
  input: 'bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full',
  label: 'text-[10px] font-bold uppercase tracking-wider text-slate-500',
  btnPrimary: 'px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed',
  btnGhost: 'px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition',
  btnDanger: 'px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-bold transition',
  btnSuccess: 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50',
  chip: 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border',
  heading: 'text-sm font-bold text-white'
};

export const CHIP_TONES: Record<string, string> = {
  sky: 'bg-sky-950 text-sky-400 border-sky-800',
  emerald: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  amber: 'bg-amber-950 text-amber-400 border-amber-800',
  violet: 'bg-violet-950 text-violet-400 border-violet-800',
  rose: 'bg-rose-950 text-rose-400 border-rose-800',
  slate: 'bg-slate-800 text-slate-300 border-slate-700'
};

export function Chip({ tone = 'slate', children }: { tone?: keyof typeof CHIP_TONES; children: React.ReactNode }) {
  return <span className={`${UI.chip} ${CHIP_TONES[tone]}`}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className={UI.label}>{label}</span>
      {children}
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status === 'DEPLOYED' ? 'emerald' : status === 'PENDING_APPROVAL' ? 'amber' : status === 'APPROVED' ? 'sky' : 'slate';
  return <Chip tone={tone as keyof typeof CHIP_TONES}>{status}</Chip>;
}

export function EmptyHint({ text }: { text: string }) {
  return <div className="text-xs text-slate-500 italic py-6 text-center border border-dashed border-slate-800 rounded-xl">{text}</div>;
}
