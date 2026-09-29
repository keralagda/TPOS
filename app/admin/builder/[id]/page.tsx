'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, MousePointerClick, Layers, PanelRightOpen, Save, UploadCloud, History,
  Eye, Plus, Trash2, Copy, ArrowUp, ArrowDown, Lock, EyeOff, GripVertical,
  Link2, ShieldAlert, Loader2, X, Sparkles, Check,
} from 'lucide-react';
import { builderApi } from '@/lib/vibe/builder-api';
import type { Composition, CompositionNode, DataBinding, ActionConfig, Condition } from '@/lib/vibe/types';
import { ACTION_TYPES, conditionOperators } from '@/lib/vibe/types';
import { BlockRenderer } from '@/components/vibe/blocks';

interface ComponentDef {
  key: string; name: string; category: string; description: string; container: boolean; gridOnly: boolean;
  bindingRoots: string[]; supportedActions: string[];
  propsSchema: Record<string, { type: string; label: string; required?: boolean; bindable?: boolean; options?: string[]; default?: unknown }>;
}
interface ExperienceRec {
  id: string; name: string; slug: string; type: string; status: string; visibility: string;
  version: number; publishedVersion: number | null; draftComposition: Composition; templateId: string | null;
  versions?: { version: number; status: string; changeNote: string; publishedAt: string | null }[];
}
interface RenderNode { id: string; componentKey: string; props: Record<string, unknown>; actions: unknown[]; style?: unknown; responsive?: unknown; children: RenderNode[]; fallback?: { reason: string } }

/* ---------------- tree helpers (immutable) ---------------- */
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
function findNode(nodes: CompositionNode[], id: string): CompositionNode | null {
  for (const n of nodes) { if (n.id === id) return n; const f = findNode(n.children, id); if (f) return f; }
  return null;
}
function updateNode(nodes: CompositionNode[], id: string, fn: (n: CompositionNode) => CompositionNode): CompositionNode[] {
  return nodes.map(n => n.id === id ? fn(clone(n)) : (n.children.length ? { ...clone(n), children: updateNode(n.children, id, fn) } : n));
}
function removeNode(nodes: CompositionNode[], id: string): { nodes: CompositionNode[]; removed: CompositionNode | null } {
  let removed: CompositionNode | null = null;
  const walk = (list: CompositionNode[]): CompositionNode[] =>
    list.filter(n => {
      if (n.id === id) { removed = n; return false; }
      n.children = walk(n.children);
      return true;
    });
  const next = clone(nodes);
  const cleaned = walk(next);
  return { nodes: cleaned, removed };
}
function insertChild(nodes: CompositionNode[], parentId: string | null, node: CompositionNode, index?: number): CompositionNode[] {
  const next = clone(nodes);
  if (parentId === null) {
    if (index === undefined || index >= next.length) next.push(node); else next.splice(index, 0, node);
    return next;
  }
  const place = (list: CompositionNode[]): boolean => {
    for (const n of list) {
      if (n.id === parentId) {
        if (index === undefined || index >= n.children.length) n.children.push(node); else n.children.splice(index, 0, node);
        return true;
      }
      if (place(n.children)) return true;
    }
    return false;
  };
  place(next);
  return next;
}
function siblingsOf(nodes: CompositionNode[], id: string): { list: CompositionNode[]; index: number; parentId: string | null } | null {
  const walk = (list: CompositionNode[], parentId: string | null): { list: CompositionNode[]; index: number; parentId: string | null } | null => {
    const index = list.findIndex(n => n.id === id);
    if (index >= 0) return { list, index, parentId };
    for (const n of list) { const f = walk(n.children, n.id); if (f) return f; }
    return null;
  };
  return walk(nodes, null);
}
function newId() { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10); }

/* ---------------- main editor ---------------- */
export default function BuilderEditor({ params }: { params: { id: string } }) {
  const [exp, setExp] = useState<ExperienceRec | null>(null);
  const [comp, setComp] = useState<CompositionNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<ComponentDef[]>([]);
  const [sectionCatalog, setSectionCatalog] = useState<{ key: string; name: string; family: string }[]>([]);
  const [version, setVersion] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'warn' | 'err'; msg: string } | null>(null);
  const [tab, setTab] = useState<'content' | 'bindings' | 'logic' | 'design'>('content');
  const [bottomTab, setBottomTab] = useState<'layers' | 'history' | null>('layers');
  const [preview, setPreview] = useState<RenderNode[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    builderApi.get<ComponentDef[]>('/api/v1/components').then(r => r.ok && r.data && setCatalog((r.data as any).components ?? []));
    builderApi.get<any>('/api/v1/templates').then(r => r.ok && r.data && setSectionCatalog((r.data as any).sections ?? []));
    builderApi.get<ExperienceRec>(`/api/v1/experiences/${params.id}`).then(r => {
      if (!r.ok || !r.data) { setBanner({ kind: 'err', msg: r.error?.message ?? 'Failed to load experience' }); return; }
      setExp(r.data);
      setVersion(r.data.version);
      const initial = (r.data.draftComposition?.nodes ?? []) as CompositionNode[];
      setComp(initial);
    });
  }, [params.id]);

  const selected = useMemo(() => selectedId ? findNode(comp, selectedId) : null, [comp, selectedId]);
  const nodeLabel = (n: CompositionNode) => n.name || n.componentKey || n.sectionKey || 'block';

  const mutate = useCallback((fn: (nodes: CompositionNode[]) => CompositionNode[]) => {
    setComp(prev => { const next = fn(prev); return next; });
    setDirty(true);
  }, []);

  const addComponent = (def: ComponentDef, parentId: string | null) => {
    const node: CompositionNode = {
      id: newId(), componentKey: def.key, locked: false, hidden: false,
      props: Object.fromEntries(Object.entries(def.propsSchema).filter(([, d]) => d.default !== undefined).map(([k, d]) => [k, d.default])),
      bindings: [], actions: [], responsive: [], style: { variants: [] }, children: def.container ? [] : [],
    };
    mutate(nodes => insertChild(nodes, parentId, node));
    setSelectedId(node.id);
  };
  const addSection = (key: string) => {
    const node: CompositionNode = { id: newId(), sectionKey: key, locked: false, hidden: false, props: {}, bindings: [], actions: [], responsive: [], style: { variants: [] }, children: [] };
    mutate(nodes => insertChild(nodes, null, node));
    setSelectedId(node.id);
  };

  const move = (id: string, dir: -1 | 1) => mutate(nodes => {
    const sib = siblingsOf(nodes, id); if (!sib) return nodes;
    const target = sib.index + dir; if (target < 0 || target >= sib.list.length) return nodes;
    const next = clone(nodes);
    const nextSib = siblingsOf(next, id)!;
    const [it] = nextSib.list.splice(nextSib.index, 1);
    nextSib.list.splice(target, 0, it);
    return next;
  });
  const duplicate = (id: string) => mutate(nodes => {
    const node = findNode(nodes, id); if (!node) return nodes;
    const copy = clone(node); const reId = (n: CompositionNode) => { n.id = newId(); n.children.forEach(reId); }; reId(copy);
    const sib = siblingsOf(nodes, id)!;
    return insertChild(nodes, sib.parentId, copy, sib.index + 1);
  });
  const del = (id: string) => { mutate(nodes => removeNode(nodes, id).nodes); if (selectedId === id) setSelectedId(null); };

  const reparent = (draggedId: string, targetParentId: string | null) => {
    if (draggedId === targetParentId) return;
    mutate(nodes => {
      const node = findNode(nodes, draggedId); if (!node) return nodes;
      if (findNode(node.children, targetParentId ?? '')) return nodes; // no cycles
      const removed = removeNode(nodes, draggedId).nodes;
      return insertChild(removed, targetParentId, node);
    });
  };

  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    const r = await builderApi.patch<{ id: string; version: number }>(`/api/v1/experiences/${params.id}`, { expectedVersion: version, composition: { schemaVersion: 1, nodes: comp } as Composition });
    setSaving(false);
    if (r.ok && r.data) { setVersion(r.data.version); setDirty(false); setBanner({ kind: 'ok', msg: `Saved v${r.data.version}` }); return true; }
    if (r.status === 409) setBanner({ kind: 'warn', msg: 'Version conflict — someone else edited. Reload to merge.' });
    else setBanner({ kind: 'err', msg: r.error?.message ?? 'Save failed' });
    return false;
  }, [comp, params.id, version]);

  // debounced autosave
  useEffect(() => {
    if (!dirty || !exp) return;
    const t = setTimeout(() => { save(); }, 1500);
    return () => clearTimeout(t);
  }, [dirty, comp]); // eslint-disable-line

  const publish = async () => {
    if (!confirm('Publish this draft as a new immutable version? This is a consequential action.')) return;
    if (dirty && !(await save())) return;
    const r = await builderApi.post<{ publishedVersion: number }>(`/api/v1/experiences/${params.id}/publish`, { changeNote: '' });
    if (r.ok && r.data) { setExp(e => e && { ...e, status: 'PUBLISHED', publishedVersion: (r.data as any).publishedVersion }); setBanner({ kind: 'ok', msg: `Published v${(r.data as any).publishedVersion}` }); }
    else setBanner({ kind: 'err', msg: r.error?.message ?? 'Publish failed' });
  };
  const doPreview = async () => {
    setPreviewLoading(true);
    if (dirty) await save();
    const r = await builderApi.get<{ nodes: RenderNode[] }>(`/api/v1/experiences/${params.id}/preview?draft=true`);
    setPreviewLoading(false);
    if (r.ok && r.data) { setPreview((r.data as any).nodes); setBottomTab(null); }
    else setBanner({ kind: 'err', msg: r.error?.message ?? 'Preview failed' });
  };
  const rollback = async (targetVersion: number) => {
    const reason = prompt(`Roll back to v${targetVersion}? This re-publishes it as a NEW version. Enter a reason:`);
    if (!reason) return;
    const r = await builderApi.post<{ publishedVersion: number }>(`/api/v1/experiences/${params.id}/rollback`, { targetVersion, reason });
    if (r.ok) { setBanner({ kind: 'ok', msg: `Rolled back (now v${(r.data as any).publishedVersion}). Reloading draft…` }); setTimeout(() => location.reload(), 900); }
    else setBanner({ kind: 'err', msg: r.error?.message ?? 'Rollback failed' });
  };

  const updateProp = (k: string, v: unknown) => selected && mutate(nodes => updateNode(nodes, selected.id, n => ({ ...n, props: { ...n.props, [k]: v } })));
  const patchSelected = (fn: (n: CompositionNode) => CompositionNode) => selected && mutate(nodes => updateNode(nodes, selected.id, fn));

  if (!exp) return <Shell>{banner?.msg ?? 'Loading editor…'}</Shell>;

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* top bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/builder" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center shrink-0"><ArrowLeft className="w-4 h-4" /></Link>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold truncate">{exp.name}</h1>
            <p className="text-[10px] text-slate-500 font-mono truncate">/{exp.slug} · {exp.type} · draft v{version}{exp.publishedVersion ? ` · live v${exp.publishedVersion}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty ? <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> unsaved</span>
            : saving ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> saved</span>}
          <button onClick={() => save()} disabled={saving} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save</button>
          <button onClick={doPreview} disabled={previewLoading} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Preview</button>
          <button onClick={publish} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold flex items-center gap-1.5"><UploadCloud className="w-3.5 h-3.5" /> Publish</button>
        </div>
      </header>

      {banner && (
        <div className={`px-4 py-1.5 text-[11px] font-semibold flex items-center justify-between ${banner.kind === 'ok' ? 'bg-emerald-900/60 text-emerald-200' : banner.kind === 'warn' ? 'bg-amber-900/60 text-amber-100' : 'bg-rose-900/60 text-rose-100'}`}>
          <span>{banner.msg}</span><button onClick={() => setBanner(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* LEFT: library */}
        <aside className="w-60 bg-slate-950/60 border-r border-slate-800 flex flex-col min-h-0 shrink-0">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-800">Library</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {(['GENERIC', 'TRAVEL', 'DASHBOARD'] as const).map(cat => (
              <div key={cat}>
                <div className="text-[9px] font-black text-slate-600 uppercase px-1 mb-1">{cat}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {catalog.filter(c => c.category === cat).map(c => (
                    <button key={c.key} draggable onDragStart={() => (dragId.current = `new:${c.key}`)}
                      onClick={() => { const parent = selected && catalog.find(c => c.key === selected.componentKey)?.container ? selected.id : null; addComponent(c, parent); }}
                      title={c.description} className="text-left bg-slate-800/70 hover:bg-slate-700 border border-slate-700 rounded-lg px-2 py-1.5 text-[10px] font-semibold leading-tight flex items-center gap-1">
                      <Plus className="w-2.5 h-2.5 text-sky-400 shrink-0" /><span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <div className="text-[9px] font-black text-slate-600 uppercase px-1 mb-1">Sections</div>
              <div className="space-y-1">
                {sectionCatalog.map(s => (
                  <button key={s.key} onClick={() => addSection(s.key)} className="w-full text-left bg-slate-800/40 hover:bg-slate-700 border border-slate-800 rounded px-2 py-1 text-[10px] flex items-center gap-1"><Sparkles className="w-3 h-3 text-indigo-400 shrink-0" /><span className="truncate">{s.name}</span></button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: canvas / preview */}
        <main className="flex-1 overflow-y-auto bg-slate-800/30 min-w-0" onClick={() => setSelectedId(null)}>
          {preview ? (
            <div className="bg-white min-h-full" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 z-10 bg-slate-900/90 text-white px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-slate-700">
                <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-sky-400" /> Runtime Preview (VibeRenderer)</span>
                <button onClick={() => setPreview(null)} className="text-slate-300 hover:text-white flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> Back to editor</button>
              </div>
              <div>{preview.map((n: any) => <BlockRenderer key={n.id} node={n} />)}</div>
            </div>
          ) : (
            <div className="p-4 space-y-1.5 max-w-3xl mx-auto" onClick={e => e.stopPropagation()}>
              {comp.length === 0 && <EmptyCanvas onDrop={() => { const k = dragId.current; if (k?.startsWith('new:')) addComponent(catalog.find(c => c.key === k.slice(4))!, null); else if (k) reparent(k, null); dragId.current = null; }} />}
              {comp.map(n => <CanvasNode key={n.id} node={n} depth={0} selectedId={selectedId} onSelect={setSelectedId}
                onMove={move} onDel={del} onDup={duplicate} catalog={catalog}
                dragRef={dragId} onDropNode={(targetId, isContainer) => { const d = dragId.current; if (!d) return; if (d.startsWith('new:')) addComponent(catalog.find(c => c.key === d.slice(4))!, isContainer ? targetId : null); else reparent(d, isContainer ? targetId : siblingsOf(comp, targetId)?.parentId ?? null); dragId.current = null; }} />)}
            </div>
          )}
        </main>

        {/* RIGHT: inspector */}
        <aside className="w-80 bg-slate-950/60 border-l border-slate-800 flex flex-col min-h-0 shrink-0">
          <div className="flex border-b border-slate-800 text-[11px] font-bold">
            {(['content', 'bindings', 'logic', 'design'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 capitalize ${tab === t ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {!selected ? <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><PanelRightOpen className="w-3.5 h-3.5" /> Select a block on the canvas to edit it.</p>
              : <Inspector tab={tab} node={selected} def={catalog.find(c => c.key === selected.componentKey)} onPatch={patchSelected} />}
          </div>
        </aside>
      </div>

      {/* BOTTOM: layers / history */}
      <div className="bg-slate-950 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-1 px-3 pt-2">
          <button onClick={() => setBottomTab(bottomTab === 'layers' ? null : 'layers')} className={`px-3 py-1 text-[11px] font-bold rounded-t ${bottomTab === 'layers' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Layers className="w-3.5 h-3.5 inline mr-1" />Layers</button>
          <button onClick={async () => { setBottomTab('history'); const r = await builderApi.get<ExperienceRec>(`/api/v1/experiences/${params.id}`); if (r.ok && r.data) setExp(e => e && { ...e, versions: (r.data as any).versions }); }} className={`px-3 py-1 text-[11px] font-bold rounded-t ${bottomTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><History className="w-3.5 h-3.5 inline mr-1" />History</button>
        </div>
        {bottomTab === 'layers' && (
          <div className="max-h-40 overflow-y-auto px-3 py-2 text-[11px]" onClick={e => e.stopPropagation()}>
            <LayerTree nodes={comp} depth={0} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        )}
        {bottomTab === 'history' && (
          <div className="max-h-40 overflow-y-auto px-3 py-2 space-y-1">
            {(exp.versions ?? []).length === 0 && <p className="text-[11px] text-slate-500">No published versions yet.</p>}
            {(exp.versions ?? []).map(v => (
              <div key={v.version} className="flex items-center justify-between bg-slate-800/50 rounded px-2.5 py-1.5 text-[11px]">
                <span><span className="font-bold text-slate-200">v{v.version}</span> · {v.status} · <span className="text-slate-400">{v.changeNote || '—'}</span> <span className="text-slate-600">{v.publishedAt ? new Date(v.publishedAt).toLocaleString() : ''}</span></span>
                <button onClick={() => rollback(v.version)} className="text-amber-400 hover:text-amber-300 font-bold">Roll back</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center text-sm">{children}</div>;
}

/* ---------------- canvas node ---------------- */
function CanvasNode(props: {
  node: CompositionNode; depth: number; selectedId: string | null;
  onSelect: (id: string) => void; onMove: (id: string, dir: -1 | 1) => void; onDel: (id: string) => void; onDup: (id: string) => void;
  catalog: ComponentDef[]; dragRef: React.MutableRefObject<string | null>; onDropNode: (id: string, isContainer: boolean) => void;
}) {
  const { node, depth, selectedId, onSelect, onMove, onDel, onDup, catalog, dragRef, onDropNode } = props;
  const isContainer = catalog.find(c => c.key === node.componentKey)?.container ?? (node.children.length > 0 || !node.componentKey);
  const isSel = selectedId === node.id;
  const label = node.name || node.componentKey || node.sectionKey || 'block';
  return (
    <div
      draggable={!node.locked}
      onDragStart={e => { e.stopPropagation(); dragRef.current = node.id; }}
      onDragOver={e => { if (isContainer) { e.preventDefault(); e.stopPropagation(); } }}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); if (isContainer) onDropNode(node.id, true); }}
      onClick={e => { e.stopPropagation(); onSelect(node.id); }}
      style={{ marginLeft: depth * 12 }}
      className={`group rounded-lg border transition ${isSel ? 'border-sky-400 ring-1 ring-sky-400/50 bg-slate-800' : 'border-slate-700/70 bg-slate-800/50 hover:border-slate-600'} ${node.hidden ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <GripVertical className="w-3 h-3 text-slate-600 shrink-0 cursor-grab" />
        {node.locked && <Lock className="w-3 h-3 text-slate-500 shrink-0" />}
        {node.hidden && <EyeOff className="w-3 h-3 text-slate-500 shrink-0" />}
        <span className="text-[11px] font-bold text-slate-200 truncate flex-1">{label}</span>
        {node.bindings.length > 0 && <span className="text-[9px] text-sky-400 font-mono flex items-center gap-0.5"><Link2 className="w-2.5 h-2.5" />{node.bindings.length}</span>}
        {node.visibility?.all?.length ? <span className="text-[9px] text-indigo-400 flex items-center gap-0.5"><ShieldAlert className="w-2.5 h-2.5" />{node.visibility.all.length}</span> : null}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
          <IconBtn onClick={e => { e.stopPropagation(); onMove(node.id, -1); }} title="Move up"><ArrowUp className="w-3 h-3" /></IconBtn>
          <IconBtn onClick={e => { e.stopPropagation(); onMove(node.id, 1); }} title="Move down"><ArrowDown className="w-3 h-3" /></IconBtn>
          <IconBtn onClick={e => { e.stopPropagation(); onDup(node.id); }} title="Duplicate"><Copy className="w-3 h-3" /></IconBtn>
          <IconBtn onClick={e => { e.stopPropagation(); onDel(node.id); }} title="Delete"><Trash2 className="w-3 h-3 text-rose-400" /></IconBtn>
        </div>
      </div>
      {isContainer && (
        <div className="px-2 pb-2 space-y-1">
          {node.children.length === 0
            ? <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); e.stopPropagation(); onDropNode(node.id, true); }} className="border border-dashed border-slate-700 rounded py-2 text-center text-[10px] text-slate-600">Drop block here</div>
            : node.children.map(c => <CanvasNode key={c.id} {...props} node={c} depth={0} />)}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; title: string }) {
  return <button onClick={onClick} title={title} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200">{children}</button>;
}

function EmptyCanvas({ onDrop }: { onDrop: () => void }) {
  return <div onDragOver={e => e.preventDefault()} onDrop={() => onDrop()} className="border-2 border-dashed border-slate-700 rounded-2xl py-24 text-center text-slate-500">
    <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
    <p className="text-sm font-bold">Empty canvas</p>
    <p className="text-xs mt-1">Drag a component from the library, or click one to add it.</p>
  </div>;
}

function LayerTree({ nodes, depth, selectedId, onSelect }: { nodes: CompositionNode[]; depth: number; selectedId: string | null; onSelect: (id: string) => void }) {
  return <>{nodes.map(n => (
    <div key={n.id}>
      <button onClick={() => onSelect(n.id)} style={{ paddingLeft: 4 + depth * 12 }} className={`w-full text-left py-0.5 truncate rounded ${selectedId === n.id ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
        {n.componentKey || n.sectionKey || 'block'}
      </button>
      {n.children.length > 0 && <LayerTree nodes={n.children} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />}
    </div>
  ))}</>;
}

/* ---------------- inspector ---------------- */
function Inspector({ tab, node, def, onPatch }: {
  tab: 'content' | 'bindings' | 'logic' | 'design';
  node: CompositionNode;
  def?: ComponentDef;
  onPatch: (fn: (n: CompositionNode) => CompositionNode) => void;
}) {
  return (
    <div className="space-y-4 text-[11px]">
      <div className="space-y-1">
        <Field label="Block name"><input value={node.name ?? ''} onChange={e => onPatch(n => ({ ...n, name: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px]" placeholder={node.componentKey ?? node.sectionKey ?? ''} /></Field>
      </div>

      {tab === 'content' && (
        <div className="space-y-2.5">
          {def ? Object.entries(def.propsSchema).map(([key, schema]) => (
            <Field key={key} label={`${schema.label}${schema.required ? ' *' : ''}`}>
              {schema.type === 'textarea' || schema.type === 'richtext'
                ? <textarea value={String(node.props[key] ?? '')} onChange={e => onPatch(n => ({ ...n, props: { ...n.props, [key]: e.target.value } }))} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" />
                : schema.type === 'select'
                  ? <select value={String(node.props[key] ?? '')} onChange={e => onPatch(n => ({ ...n, props: { ...n.props, [key]: e.target.value } }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1">{(schema.options ?? []).map(o => <option key={o}>{o}</option>)}</select>
                  : schema.type === 'number'
                    ? <input type="number" value={Number(node.props[key] ?? 0)} onChange={e => onPatch(n => ({ ...n, props: { ...n.props, [key]: Number(e.target.value) } }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" />
                    : schema.type === 'boolean'
                      ? <input type="checkbox" checked={Boolean(node.props[key])} onChange={e => onPatch(n => ({ ...n, props: { ...n.props, [key]: e.target.checked } }))} />
                      : schema.type === 'list'
                        ? <textarea value={(node.props[key] as unknown[] ?? []).join('\n')} onChange={e => onPatch(n => ({ ...n, props: { ...n.props, [key]: e.target.value.split('\n').filter(Boolean) } }))} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" />
                        : <input value={String(node.props[key] ?? '')} onChange={e => onPatch(n => ({ ...n, props: { ...n.props, [key]: e.target.value } }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" />}
            </Field>
          )) : <p className="text-slate-500">This is a section template. Edit its source key to change structure. Bindings still apply.</p>}
          {!def && <Field label="Section key"><input value={node.sectionKey ?? ''} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded px-2 py-1 text-slate-400" /></Field>}
        </div>
      )}

      {tab === 'bindings' && <BindingsEditor node={node} bindingRoots={def?.bindingRoots ?? ['entity']} onPatch={onPatch} />}

      {tab === 'logic' && (
        <div className="space-y-3">
          <VisibilityEditor node={node} onPatch={onPatch} />
          <ActionsEditor node={node} allowed={def?.supportedActions ?? []} onPatch={onPatch} />
        </div>
      )}

      {tab === 'design' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Spacing"><select value={node.style.spacing ?? ''} onChange={e => onPatch(n => ({ ...n, style: { ...n.style, spacing: (e.target.value || undefined) as any } }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1"><option value="">—</option>{['none', 'sm', 'md', 'lg', 'xl'].map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Align"><select value={node.style.align ?? ''} onChange={e => onPatch(n => ({ ...n, style: { ...n.style, align: (e.target.value || undefined) as any } }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1"><option value="">—</option>{['left', 'center', 'right'].map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Width"><select value={node.style.width ?? ''} onChange={e => onPatch(n => ({ ...n, style: { ...n.style, width: (e.target.value || undefined) as any } }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1"><option value="">—</option>{['full', 'contained', 'narrow'].map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Token set"><input value={node.style.tokenSet ?? ''} onChange={e => onPatch(n => ({ ...n, style: { ...n.style, tokenSet: e.target.value || undefined } }))} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1" /></Field>
          </div>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={node.hidden} onChange={e => onPatch(n => ({ ...n, hidden: e.target.checked }))} /> Hidden</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={node.locked} onChange={e => onPatch(n => ({ ...n, locked: e.target.checked }))} /> Locked</label>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-[10px] text-slate-500 font-bold uppercase">{label}</span>{children}</label>;
}

function BindingsEditor({ node, bindingRoots, onPatch }: { node: CompositionNode; bindingRoots: string[]; onPatch: (fn: (n: CompositionNode) => CompositionNode) => void }) {
  const set = (bindings: DataBinding[]) => onPatch(n => ({ ...n, bindings }));
  return (
    <div className="space-y-2">
      <p className="text-[10px] text-slate-500">Whitelisted roots: <span className="font-mono text-slate-400">{bindingRoots.join(', ')}</span> and dotted paths. No expressions or code.</p>
      {node.bindings.map((b, i) => (
        <div key={b.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <select value={b.kind} onChange={e => set(node.bindings.map((x, j) => j === i ? { ...x, kind: e.target.value as any } : x))} className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] flex-1">{['FIELD', 'COLLECTION', 'METRIC', 'CONTEXT'].map(k => <option key={k}>{k}</option>)}</select>
            <button onClick={() => set(node.bindings.filter((_, j) => j !== i))} className="p-1 text-rose-400 hover:text-rose-300"><Trash2 className="w-3 h-3" /></button>
          </div>
          <input value={b.path} onChange={e => set(node.bindings.map((x, j) => j === i ? { ...x, path: e.target.value } : x))} placeholder="e.g. destination.name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-[10px]" />
          <div className="flex gap-1.5">
            <input value={b.targetProp} onChange={e => set(node.bindings.map((x, j) => j === i ? { ...x, targetProp: e.target.value } : x))} placeholder="targetProp" className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-[10px]" />
            <input value={b.fallback != null ? String(b.fallback) : ''} onChange={e => set(node.bindings.map((x, j) => j === i ? { ...x, fallback: e.target.value } : x))} placeholder="fallback" className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px]" />
          </div>
        </div>
      ))}
      <button onClick={() => set([...node.bindings, { id: newId(), kind: 'FIELD', path: '', targetProp: '' }])} className="w-full border border-dashed border-slate-700 rounded-lg py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add binding</button>
    </div>
  );
}

function VisibilityEditor({ node, onPatch }: { node: CompositionNode; onPatch: (fn: (n: CompositionNode) => CompositionNode) => void }) {
  const all = node.visibility?.all ?? [];
  const setAll = (conds: Condition[]) => onPatch(n => ({ ...n, visibility: { all: conds, any: n.visibility?.any ?? [] } }));
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-black uppercase text-slate-500">Show when (all must pass)</div>
      {all.map((c, i) => (
        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 space-y-1.5">
          <div className="flex gap-1.5">
            <input value={c.field} onChange={e => setAll(all.map((x, j) => j === i ? { ...x, field: e.target.value } : x))} placeholder="entity.status" className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-[10px]" />
            <button onClick={() => setAll(all.filter((_, j) => j !== i))} className="p-1 text-rose-400"><Trash2 className="w-3 h-3" /></button>
          </div>
          <div className="flex gap-1.5">
            <select value={c.operator} onChange={e => setAll(all.map((x, j) => j === i ? { ...x, operator: e.target.value as any } : x))} className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px]">{conditionOperators.map(o => <option key={o}>{o}</option>)}</select>
            <input value={c.value != null ? String(c.value) : ''} onChange={e => setAll(all.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="value" className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px]" />
          </div>
        </div>
      ))}
      <button onClick={() => setAll([...all, { field: '', operator: 'EQUALS', value: '' }])} className="w-full border border-dashed border-slate-700 rounded-lg py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add condition</button>
    </div>
  );
}

function ActionsEditor({ node, allowed, onPatch }: { node: CompositionNode; allowed: string[]; onPatch: (fn: (n: CompositionNode) => CompositionNode) => void }) {
  const set = (actions: ActionConfig[]) => onPatch(n => ({ ...n, actions }));
  return (
    <div className="space-y-2 pt-1">
      <div className="text-[10px] font-black uppercase text-slate-500">Actions {allowed.length > 0 && <span className="text-slate-600 normal-case">(supported: {allowed.join(', ')})</span>}</div>
      {node.actions.map((a, i) => (
        <div key={a.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 space-y-1.5">
          <div className="flex gap-1.5">
            <select value={a.type} onChange={e => set(node.actions.map((x, j) => j === i ? { ...x, type: e.target.value as any } : x))} className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] flex-1">{ACTION_TYPES.map(t => <option key={t}>{t}</option>)}</select>
            <button onClick={() => set(node.actions.filter((_, j) => j !== i))} className="p-1 text-rose-400"><Trash2 className="w-3 h-3" /></button>
          </div>
          <input value={a.target} onChange={e => set(node.actions.map((x, j) => j === i ? { ...x, target: e.target.value } : x))} placeholder="target (route / id)" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-[10px]" />
          <input value={a.requiredPermission ?? ''} onChange={e => set(node.actions.map((x, j) => j === i ? { ...x, requiredPermission: e.target.value || undefined } : x))} placeholder="requiredPermission (server-enforced)" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-[10px]" />
          <label className="flex items-center gap-1.5 text-[10px] text-slate-400"><input type="checkbox" checked={a.consequential} onChange={e => set(node.actions.map((x, j) => j === i ? { ...x, consequential: e.target.checked } : x))} /> Confirmation gate (consequential)</label>
        </div>
      ))}
      <button onClick={() => set([...node.actions, { id: newId(), type: 'NAVIGATE', target: '', payload: {}, consequential: false }])} className="w-full border border-dashed border-slate-700 rounded-lg py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1"><Plus className="w-3 h-3" /> Add action</button>
    </div>
  );
}
