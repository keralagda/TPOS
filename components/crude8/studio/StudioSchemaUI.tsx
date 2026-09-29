'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Database, LayoutDashboard, GripVertical } from 'lucide-react';
import { StudioField, StudioFieldType, StudioSectionLayout, StudioListViewType, StudioMode } from '@/lib/crude8/studio/studio-types';
import { StudioPanelProps, UI, Chip, Field, EmptyHint } from './studio-ui';
import { UNIVERSAL_ACTION_TYPES, UniversalActionType } from '@/lib/crude8/types';

const FIELD_TYPES: StudioFieldType[] = ['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTISELECT', 'BOOLEAN', 'EMAIL', 'PHONE', 'TEXTAREA', 'RICHTEXT', 'FILE', 'IMAGE', 'RELATION', 'AI', 'VOICE', 'SIGNATURE', 'MAP'];
const MODES: StudioMode[] = ['CRM', 'TMS', 'ERP', 'FINANCE', 'DMS', 'CMS', 'SEO', 'SOCIAL'];
const TRANSITION_ACTIONS = ['PUBLISH', 'UNPUBLISH', 'APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE'];

export function SchemaBuilderPanel({ project, setProject, saveProject, log }: StudioPanelProps) {
  if (!project) return <EmptyHint text="Open a module in Entities first." />;

  const updateField = (idx: number, patch: Partial<StudioField>) => {
    setProject(p => ({ ...p, fields: p.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)) }));
  };

  const addField = () => {
    setProject(p => ({
      ...p,
      fields: [...p.fields, { name: `field${p.fields.length + 1}`, label: `Field ${p.fields.length + 1}`, type: 'TEXT', required: false }]
    }));
    log('BUILDER', 'INFO', `Field added to ${project.entityName}`);
  };

  const removeField = (idx: number) => {
    setProject(p => {
      const removed = p.fields[idx].name;
      return {
        ...p,
        fields: p.fields.filter((_, i) => i !== idx),
        ui: {
          ...p.ui,
          listView: { ...p.ui.listView, columns: p.ui.listView.columns.filter(c => c !== removed) },
          formView: { sections: p.ui.formView.sections.map(s => ({ ...s, fields: s.fields.filter(pf => pf.field !== removed) })) }
        }
      };
    });
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    setProject(p => {
      const next = [...p.fields];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return p;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...p, fields: next };
    });
  };

  return (
    <div className="space-y-4">
      {/* Entity meta */}
      <div className={`${UI.panel} grid grid-cols-2 lg:grid-cols-6 gap-3 items-end`}>
        <Field label="Module Name"><input className={UI.input} value={project.name} onChange={e => setProject(p => ({ ...p, name: e.target.value }))} /></Field>
        <Field label="Entity Name"><input className={UI.input} value={project.entityName} onChange={e => setProject(p => ({ ...p, entityName: e.target.value }))} /></Field>
        <Field label="Mode">
          <select className={UI.input} value={project.mode} onChange={e => setProject(p => ({ ...p, mode: e.target.value as StudioMode }))}>
            {MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Lifecycle Field">
          <select className={UI.input} value={project.lifecycleField} onChange={e => setProject(p => ({ ...p, lifecycleField: e.target.value }))}>
            {project.fields.map(f => <option key={f.name}>{f.name}</option>)}
          </select>
        </Field>
        <div className="lg:col-span-2"><Field label="Description"><input className={UI.input} value={project.description} onChange={e => setProject(p => ({ ...p, description: e.target.value }))} /></Field></div>
      </div>

      {/* Fields */}
      <div className={`${UI.panel} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Database className="w-4 h-4 text-sky-400" />
            Fields ({project.fields.length})
          </div>
          <button onClick={addField} className={`${UI.btnGhost} flex items-center gap-1.5`}><Plus className="w-3.5 h-3.5" /> Add Field</button>
        </div>

        <div className="space-y-2">
          {project.fields.map((field, idx) => (
            <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 lg:grid-cols-12 gap-2 items-center">
              <div className="flex items-center gap-1 lg:col-span-1">
                <GripVertical className="w-3 h-3 text-slate-600" />
                <button onClick={() => moveField(idx, -1)} className="p-1 text-slate-500 hover:text-white"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => moveField(idx, 1)} className="p-1 text-slate-500 hover:text-white"><ArrowDown className="w-3 h-3" /></button>
              </div>
              <input className={`${UI.input} lg:col-span-2`} placeholder="name" value={field.name} onChange={e => updateField(idx, { name: e.target.value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '') })} />
              <input className={`${UI.input} lg:col-span-2`} placeholder="label" value={field.label} onChange={e => updateField(idx, { label: e.target.value })} />
              <select className={`${UI.input} lg:col-span-2`} value={field.type} onChange={e => updateField(idx, { type: e.target.value as StudioFieldType })}>
                {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              {(field.type === 'SELECT' || field.type === 'MULTISELECT') && (
                <input className={`${UI.input} lg:col-span-2`} placeholder="options, comma, sep" value={(field.options || []).join(',')} onChange={e => updateField(idx, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              )}
              {field.type === 'RELATION' && (
                <input className={`${UI.input} lg:col-span-2`} placeholder="relation entity" value={field.relationEntity || ''} onChange={e => updateField(idx, { relationEntity: e.target.value })} />
              )}
              {field.type === 'AI' && (
                <input className={`${UI.input} lg:col-span-2`} placeholder="AI prompt" value={field.aiPrompt || ''} onChange={e => updateField(idx, { aiPrompt: e.target.value })} />
              )}
              {['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'EMAIL', 'PHONE', 'TEXTAREA', 'RICHTEXT', 'FILE', 'IMAGE', 'VOICE', 'SIGNATURE', 'MAP'].includes(field.type) && <div className="hidden lg:block lg:col-span-2" />}
              <div className="flex items-center gap-3 lg:col-span-2">
                <label className="flex items-center gap-1 text-[10px] text-slate-400"><input type="checkbox" checked={field.required} onChange={e => updateField(idx, { required: e.target.checked })} /> required</label>
                <label className="flex items-center gap-1 text-[10px] text-slate-400"><input type="checkbox" checked={!!field.unique} onChange={e => updateField(idx, { unique: e.target.checked })} /> unique</label>
              </div>
              <div className="lg:col-span-1 flex justify-end">
                <button onClick={() => removeField(idx)} className="p-1.5 text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Lifecycle transitions */}
        <div className="pt-2 space-y-2">
          <div className={UI.label}>Lifecycle Transitions ({project.lifecycleField})</div>
          <div className="flex flex-wrap gap-2">
            {TRANSITION_ACTIONS.map(action => {
              const current = project.lifecycleTransitions[action as keyof typeof project.lifecycleTransitions];
              return (
                <div key={action} className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <Chip tone="violet">{action}</Chip>
                  <span className="text-slate-600">→</span>
                  <input
                    className="w-24 bg-transparent border-b border-slate-700 text-[11px] text-white focus:outline-none focus:border-sky-500"
                    placeholder="state"
                    value={current || ''}
                    onChange={e => setProject(p => ({ ...p, lifecycleTransitions: { ...p.lifecycleTransitions, [action]: e.target.value || undefined } }))}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => saveProject('Schema updated')} className={UI.btnPrimary}>Save Schema Version</button>
      </div>
    </div>
  );
}

// ============================================================
// UI BUILDER — component library / canvas / config
// ============================================================

const FORM_LIBRARY: { label: string; type: StudioFieldType }[] = [
  { label: 'Text Field', type: 'TEXT' }, { label: 'Number Field', type: 'NUMBER' },
  { label: 'Date Picker', type: 'DATE' }, { label: 'Select', type: 'SELECT' },
  { label: 'Multi Select', type: 'MULTISELECT' }, { label: 'File Upload', type: 'FILE' },
  { label: 'Image Upload', type: 'IMAGE' }, { label: 'Rich Text', type: 'RICHTEXT' },
  { label: 'Map Picker', type: 'MAP' }, { label: 'Relation Selector', type: 'RELATION' },
  { label: 'AI Field', type: 'AI' }, { label: 'Voice Field', type: 'VOICE' },
  { label: 'Signature Field', type: 'SIGNATURE' }
];

const TABLE_LIBRARY: { label: string; type: StudioListViewType }[] = [
  { label: 'Data Table', type: 'TABLE' }, { label: 'Kanban', type: 'KANBAN' },
  { label: 'Calendar', type: 'CALENDAR' }, { label: 'Timeline', type: 'TIMELINE' },
  { label: 'Cards', type: 'CARDS' }, { label: 'Grid', type: 'GRID' },
  { label: 'Charts', type: 'CHARTS' }, { label: 'Analytics', type: 'ANALYTICS' }
];

const ACTION_LIBRARY: { label: string; target: 'row' | 'bulk'; action: UniversalActionType }[] = [
  { label: 'Create Button', target: 'row', action: 'CREATE' },
  { label: 'Approve Button', target: 'row', action: 'APPROVE' },
  { label: 'Reject Button', target: 'row', action: 'REJECT' },
  { label: 'Assign Button', target: 'row', action: 'ASSIGN' },
  { label: 'Generate Button', target: 'row', action: 'GENERATE' },
  { label: 'Export Button', target: 'bulk', action: 'EXPORT' },
  { label: 'Workflow Trigger', target: 'bulk', action: 'SYNC' }
];

const LAYOUT_LIBRARY: StudioSectionLayout[] = ['TABS', 'SECTIONS' as StudioSectionLayout, 'CARD', 'DRAWER', 'MODAL', 'STEPS', 'PANEL'];
const SECTION_LAYOUTS: StudioSectionLayout[] = ['SECTION', 'CARD', 'TABS', 'STEPS', 'DRAWER', 'MODAL', 'PANEL'];

type CanvasTab = 'LIST' | 'FORM' | 'DETAIL' | 'DASHBOARD';

export function UIBuilderPanel({ project, setProject, saveProject, log }: StudioPanelProps) {
  const [canvasTab, setCanvasTab] = useState<CanvasTab>('LIST');
  const [selectedSection, setSelectedSection] = useState(0);

  if (!project) return <EmptyHint text="Open a module in Entities first." />;
  const ui = project.ui;
  const section = ui.formView.sections[selectedSection] || ui.formView.sections[0];

  const setListView = (patch: Partial<typeof ui.listView>) => setProject(p => ({ ...p, ui: { ...p.ui, listView: { ...p.ui.listView, ...patch } } }));

  const addFormSection = (layout: StudioSectionLayout = 'CARD') => {
    setProject(p => ({
      ...p,
      ui: { ...p.ui, formView: { sections: [...p.ui.formView.sections, { sectionId: `sec-${Date.now()}`, title: `Section ${p.ui.formView.sections.length + 1}`, layout, columns: 2, fields: [] }] } }
    }));
    setSelectedSection(ui.formView.sections.length);
  };

  const updateSection = (idx: number, patch: Partial<typeof section>) => {
    setProject(p => ({ ...p, ui: { ...p.ui, formView: { sections: p.ui.formView.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)) } } }));
  };

  const addFieldToSection = (fieldName: string) => {
    if (!fieldName || !section) return;
    const field = project.fields.find(f => f.name === fieldName);
    if (!field || section.fields.some(pf => pf.field === fieldName)) return;
    updateSection(selectedSection, { fields: [...section.fields, { field: fieldName, component: field.type }] });
    log('BUILDER', 'INFO', `${field.name} placed in section "${section.title}"`);
  };

  const toggleListColumn = (col: string) => {
    const has = ui.listView.columns.includes(col);
    setListView({ columns: has ? ui.listView.columns.filter(c => c !== col) : [...ui.listView.columns, col] });
  };

  const toggleAction = (target: 'row' | 'bulk', action: UniversalActionType) => {
    if (target === 'row') {
      const has = ui.listView.rowActions.includes(action);
      setListView({ rowActions: has ? ui.listView.rowActions.filter(a => a !== action) : [...ui.listView.rowActions, action] });
    } else {
      const has = ui.listView.bulkActions.includes(action);
      setListView({ bulkActions: has ? ui.listView.bulkActions.filter(a => a !== action) : [...ui.listView.bulkActions, action] });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_300px] gap-4">
      {/* LEFT: component library */}
      <div className="space-y-3">
        <div className={`${UI.panel} !p-3 space-y-1.5`}>
          <div className={UI.label}>Form Components</div>
          {FORM_LIBRARY.map(c => (
            <button
              key={c.label}
              onClick={() => {
                if (!project.fields.some(f => f.type === c.type && !ui.formView.sections.some(s => s.fields.some(pf => pf.field === f.name)))) {
                  setProject(p => ({ ...p, fields: [...p.fields, { name: `${c.type.toLowerCase()}${p.fields.length + 1}`, label: c.label, type: c.type, required: false }] }));
                }
                setCanvasTab('FORM');
                log('BUILDER', 'INFO', `${c.label} component added to schema`);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-sky-700 hover:text-white transition"
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={`${UI.panel} !p-3 space-y-1.5`}>
          <div className={UI.label}>Table Components</div>
          {TABLE_LIBRARY.map(c => (
            <button
              key={c.label}
              onClick={() => { setListView({ type: c.type }); setCanvasTab('LIST'); log('BUILDER', 'INFO', `List view switched to ${c.label}`); }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition ${ui.listView.type === c.type ? 'bg-sky-950 border-sky-800 text-sky-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-sky-700'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={`${UI.panel} !p-3 space-y-1.5`}>
          <div className={UI.label}>Action Components</div>
          {ACTION_LIBRARY.map(c => (
            <button
              key={c.label}
              onClick={() => { toggleAction(c.target, c.action); log('BUILDER', 'INFO', `${c.label} wired (${c.action})`); }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-violet-700 hover:text-white transition"
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={`${UI.panel} !p-3 space-y-1.5`}>
          <div className={UI.label}>Layout</div>
          {LAYOUT_LIBRARY.map(l => (
            <button
              key={l}
              onClick={() => { setCanvasTab('FORM'); addFormSection(l as StudioSectionLayout); }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-amber-700 hover:text-white transition"
            >
              {l === 'SECTION' ? 'Section' : l.charAt(0) + l.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER: canvas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {(['LIST', 'FORM', 'DETAIL', 'DASHBOARD'] as CanvasTab[]).map(t => (
            <button
              key={t}
              onClick={() => setCanvasTab(t)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition ${canvasTab === t ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-500 font-mono">{project.entityName} · {ui.listView.type}</span>
        </div>

        <div className={`${UI.panel} min-h-[420px]`}>
          {canvasTab === 'LIST' && (
            <ListCanvas columns={ui.listView.columns} fields={project.fields} type={ui.listView.type} lifecycleField={project.lifecycleField} rowActions={ui.listView.rowActions} />
          )}
          {canvasTab === 'FORM' && (
            <FormCanvas
              sections={ui.formView.sections}
              fields={project.fields}
              selected={selectedSection}
              onSelect={setSelectedSection}
              onRemoveField={(fieldName) => section && updateSection(selectedSection, { fields: section.fields.filter(pf => pf.field !== fieldName) })}
            />
          )}
          {canvasTab === 'DETAIL' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {ui.detailView.widgets.map(w => <Chip key={w} tone="sky">{w}</Chip>)}
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 gap-3">
                {project.fields.slice(0, 8).map(f => (
                  <div key={f.name} className="space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase">{f.label}</div>
                    <div className="text-xs text-slate-300 h-3 w-3/4 bg-slate-800/60 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500">Detail layout: {ui.detailView.layout} · widgets: {ui.detailView.widgets.join(', ')}</div>
            </div>
          )}
          {canvasTab === 'DASHBOARD' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {ui.dashboard.stats.map((s, i) => (
                  <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className={UI.label}>{s.label}</div>
                    <div className="text-xl font-black text-white mt-1">{s.agg === 'COUNT' ? '0' : '—'}</div>
                    <div className="text-[10px] text-slate-500">{s.agg}({s.field})</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {ui.dashboard.charts.map((c, i) => (
                  <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="text-xs font-bold text-white">{c.title}</div>
                    <div className="flex items-end gap-1 h-24 mt-3">
                      {[40, 65, 30, 80, 55, 70, 45, 90].map((h, bi) => (
                        <div key={bi} className="flex-1 bg-gradient-to-t from-sky-700 to-sky-500 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">{c.type} · groupBy {c.groupBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: configuration */}
      <div className="space-y-3">
        <div className={`${UI.panel} space-y-3`}>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <LayoutDashboard className="w-4 h-4 text-amber-400" /> Configuration
          </div>

          {canvasTab === 'LIST' && (
            <>
              <Field label="Columns">
                <div className="flex flex-wrap gap-1.5">
                  {project.fields.map(f => (
                    <button key={f.name} onClick={() => toggleListColumn(f.name)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${ui.listView.columns.includes(f.name) ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Row Actions">
                <div className="flex flex-wrap gap-1.5">
                  {(['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'ASSIGN', 'GENERATE'] as UniversalActionType[]).map(a => (
                    <button key={a} onClick={() => toggleAction('row', a)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${ui.listView.rowActions.includes(a) ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Bulk Actions">
                <div className="flex flex-wrap gap-1.5">
                  {(['EXPORT', 'ARCHIVE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'SYNC', 'CLONE'] as UniversalActionType[]).map(a => (
                    <button key={a} onClick={() => toggleAction('bulk', a)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${ui.listView.bulkActions.includes(a) ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {canvasTab === 'FORM' && section && (
            <>
              <Field label="Section">
                <select className={UI.input} value={selectedSection} onChange={e => setSelectedSection(Number(e.target.value))}>
                  {ui.formView.sections.map((s, i) => <option key={s.sectionId} value={i}>{s.title}</option>)}
                </select>
              </Field>
              <Field label="Section Title">
                <input className={UI.input} value={section.title} onChange={e => updateSection(selectedSection, { title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Layout">
                  <select className={UI.input} value={section.layout} onChange={e => updateSection(selectedSection, { layout: e.target.value as StudioSectionLayout })}>
                    {SECTION_LAYOUTS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Columns">
                  <select className={UI.input} value={section.columns} onChange={e => updateSection(selectedSection, { columns: Number(e.target.value) as 1 | 2 | 3 })}>
                    <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                  </select>
                </Field>
              </div>
              <Field label="Add Field to Section">
                <select className={UI.input} value="" onChange={e => addFieldToSection(e.target.value)}>
                  <option value="">— select field —</option>
                  {project.fields.map(f => <option key={f.name} value={f.name}>{f.name} ({f.type})</option>)}
                </select>
              </Field>
              <button onClick={() => addFormSection()} className={`${UI.btnGhost} w-full flex items-center justify-center gap-1.5`}>
                <Plus className="w-3.5 h-3.5" /> Add Section
              </button>
            </>
          )}

          {canvasTab === 'DETAIL' && (
            <>
              <Field label="Detail Layout">
                <select className={UI.input} value={ui.detailView.layout} onChange={e => setProject(p => ({ ...p, ui: { ...p.ui, detailView: { ...p.ui.detailView, layout: e.target.value as 'SECTION' | 'TABS' | 'STEPS' } } }))}>
                  {['SECTION', 'TABS', 'STEPS'].map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Widgets">
                <div className="flex flex-wrap gap-1.5">
                  {['FIELDS_GRID', 'ACTIVITY_TIMELINE', 'VERSION_HISTORY', 'RELATED_RECORDS', 'AI_INSIGHTS', 'AUDIT_TRAIL'].map(w => {
                    const has = ui.detailView.widgets.includes(w);
                    return (
                      <button key={w} onClick={() => setProject(p => ({ ...p, ui: { ...p.ui, detailView: { ...p.ui.detailView, widgets: has ? p.ui.detailView.widgets.filter(x => x !== w) : [...p.ui.detailView.widgets, w] } } }))}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${has ? 'bg-sky-950 text-sky-300 border-sky-800' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        {w}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </>
          )}

          {canvasTab === 'DASHBOARD' && (
            <>
              <Field label="Add Stat">
                <div className="grid grid-cols-3 gap-1.5">
                  <input className={UI.input} placeholder="label" value="" readOnly />
                </div>
              </Field>
              <div className="space-y-1.5">
                {ui.dashboard.stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
                    <span className="flex-1 truncate">{s.label}</span>
                    <Chip tone="sky">{s.agg}</Chip>
                    <span className="text-slate-500">{s.field}</span>
                    <button onClick={() => setProject(p => ({ ...p, ui: { ...p.ui, dashboard: { ...p.ui.dashboard, stats: p.ui.dashboard.stats.filter((_, x) => x !== i) } } }))} className="text-rose-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <StatAdder fields={project.fields} onAdd={(label, field, agg) => setProject(p => ({ ...p, ui: { ...p.ui, dashboard: { ...p.ui.dashboard, stats: [...p.ui.dashboard.stats, { label, field, agg }] } } }))} />
              <ChartAdder fields={project.fields} onAdd={(title, type, groupBy) => setProject(p => ({ ...p, ui: { ...p.ui, dashboard: { ...p.ui.dashboard, charts: [...p.ui.dashboard.charts, { title, type, groupBy }] } } }))} />
            </>
          )}

          <button onClick={() => saveProject('UI composition updated')} className={`${UI.btnPrimary} w-full`}>Save UI Version</button>
        </div>
      </div>
    </div>
  );
}

function StatAdder({ fields, onAdd }: { fields: StudioField[]; onAdd: (label: string, field: string, agg: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX') => void }) {
  const [label, setLabel] = useState('');
  const [field, setField] = useState(fields[0]?.name || '');
  const [agg, setAgg] = useState<'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX'>('COUNT');
  return (
    <div className="grid grid-cols-4 gap-1.5 items-end">
      <input className={`${UI.input} col-span-2`} placeholder="stat label" value={label} onChange={e => setLabel(e.target.value)} />
      <select className={UI.input} value={field} onChange={e => setField(e.target.value)}>{fields.map(f => <option key={f.name}>{f.name}</option>)}</select>
      <div className="flex gap-1">
        <select className={UI.input} value={agg} onChange={e => setAgg(e.target.value as any)}>{['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].map(a => <option key={a}>{a}</option>)}</select>
        <button onClick={() => { if (label && field) { onAdd(label, field, agg); setLabel(''); } }} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"><Plus className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

function ChartAdder({ fields, onAdd }: { fields: StudioField[]; onAdd: (title: string, type: 'BAR' | 'LINE' | 'PIE' | 'AREA', groupBy: string) => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'BAR' | 'LINE' | 'PIE' | 'AREA'>('BAR');
  const [groupBy, setGroupBy] = useState(fields[0]?.name || '');
  return (
    <div className="grid grid-cols-4 gap-1.5 items-end">
      <input className={`${UI.input} col-span-2`} placeholder="chart title" value={title} onChange={e => setTitle(e.target.value)} />
      <select className={UI.input} value={type} onChange={e => setType(e.target.value as any)}>{['BAR', 'LINE', 'PIE', 'AREA'].map(t => <option key={t}>{t}</option>)}</select>
      <div className="flex gap-1">
        <select className={UI.input} value={groupBy} onChange={e => setGroupBy(e.target.value)}>{fields.map(f => <option key={f.name}>{f.name}</option>)}</select>
        <button onClick={() => { if (title && groupBy) { onAdd(title, type, groupBy); setTitle(''); } }} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"><Plus className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

function ListCanvas({ columns, fields, type, lifecycleField, rowActions }: { columns: string[]; fields: StudioField[]; type: StudioListViewType; lifecycleField: string; rowActions: UniversalActionType[] }) {
  const skeletonRows = [0, 1, 2, 3];
  if (type === 'CARDS' || type === 'GRID') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {skeletonRows.map(i => (
          <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="h-3 w-2/3 bg-slate-800 rounded animate-pulse" />
            <div className="h-2.5 w-1/2 bg-slate-800/70 rounded animate-pulse" />
            <div className="flex gap-1">{rowActions.slice(0, 2).map(a => <Chip key={a} tone="emerald">{a}</Chip>)}</div>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'KANBAN' || type === 'CALENDAR' || type === 'TIMELINE' || type === 'CHARTS' || type === 'ANALYTICS') {
    const stateField = fields.find(f => f.name === lifecycleField);
    const groups = stateField?.options || ['NEW', 'ACTIVE', 'DONE'];
    return (
      <div className="grid grid-cols-3 gap-3">
        {groups.map(g => (
          <div key={g} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 min-h-[160px]">
            <div className="text-[10px] font-bold uppercase text-slate-400">{g}</div>
            <div className="h-12 bg-slate-800/60 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-800/40 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-800">
          {columns.map(c => <th key={c} className="px-3 py-2 text-left text-[10px] font-bold uppercase text-slate-500">{c}</th>)}
          <th className="px-3 py-2 text-right text-[10px] font-bold uppercase text-slate-500">actions</th>
        </tr>
      </thead>
      <tbody>
        {skeletonRows.map(i => (
          <tr key={i} className="border-b border-slate-800/60">
            {columns.map(c => <td key={c} className="px-3 py-2.5"><div className="h-2.5 w-3/4 bg-slate-800/70 rounded animate-pulse" /></td>)}
            <td className="px-3 py-2.5 text-right">{rowActions.slice(0, 3).map(a => <Chip key={a} tone="slate">{a}</Chip>)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FormCanvas({
  sections, fields, selected, onSelect, onRemoveField
}: {
  sections: { sectionId: string; title: string; layout: StudioSectionLayout; columns: 1 | 2 | 3; fields: { field: string; component: StudioFieldType }[] }[];
  fields: StudioField[];
  selected: number;
  onSelect: (i: number) => void;
  onRemoveField: (fieldName: string) => void;
}) {
  if (sections.length === 0) return <EmptyHint text="No form sections yet — add one from the Layout library on the left." />;
  return (
    <div className="space-y-3">
      {sections.map((s, i) => (
        <div
          key={s.sectionId}
          onClick={() => onSelect(i)}
          className={`p-4 bg-slate-950 border rounded-xl cursor-pointer transition ${i === selected ? 'border-sky-700 ring-1 ring-sky-800' : 'border-slate-800 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-white">{s.title}</span>
            <Chip tone="amber">{s.layout} · {s.columns}col</Chip>
          </div>
          {s.fields.length === 0 ? (
            <div className="text-[10px] text-slate-600 italic">empty section — add fields from the right panel</div>
          ) : (
            <div className={`grid gap-2.5 ${s.columns === 1 ? 'grid-cols-1' : s.columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {s.fields.map(pf => {
                const field = fields.find(f => f.name === pf.field);
                return (
                  <div key={pf.field} className="space-y-1 group relative">
                    <div className="text-[10px] text-slate-500">{field?.label || pf.field}{field?.required ? ' *' : ''} <span className="text-slate-700">({pf.component})</span></div>
                    {['TEXTAREA', 'RICHTEXT'].includes(pf.component) ? (
                      <div className="h-12 bg-slate-900 border border-slate-800 rounded-lg" />
                    ) : pf.component === 'BOOLEAN' ? (
                      <div className="h-6 flex items-center"><div className="w-8 h-4 bg-slate-800 rounded-full" /></div>
                    ) : pf.component === 'SELECT' || pf.component === 'MULTISELECT' ? (
                      <div className="h-7 bg-slate-900 border border-slate-800 rounded-lg flex items-center px-2 text-[10px] text-slate-600">{(field?.options || []).join(' / ') || 'options'}</div>
                    ) : (
                      <div className="h-7 bg-slate-900 border border-slate-800 rounded-lg" />
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); onRemoveField(pf.field); }}
                      className="absolute -top-1 -right-1 hidden group-hover:block p-1 bg-rose-950 border border-rose-800 rounded text-rose-400"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-end">
        <div className="px-4 py-2 rounded-xl bg-sky-600 text-white text-[11px] font-bold opacity-80">Create {fields.length > 0 ? 'Record' : ''}</div>
      </div>
    </div>
  );
}
