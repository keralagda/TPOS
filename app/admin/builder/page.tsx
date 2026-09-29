'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Plus, ExternalLink, Loader2, LayoutTemplate, Eye } from 'lucide-react';
import { getBuilderToken, setBuilderToken } from '@/lib/vibe/builder-api';
import { InternalLayout } from '@/components/internal/InternalLayout';

interface Row {
  id: string; name: string; slug: string; type: string; status: string;
  visibility: string; version: number; publishedVersion: number | null;
  _count?: { versions: number }; updatedAt: string;
}

const DEMO_IDENTITIES = [
  { token: 'superadmin@test.travelplanet.local', label: 'Platform Super Admin' },
  { token: 'content@test.travelplanet.local', label: 'Editorial Lead (Content Manager)' },
  { token: 'admin@test.travelplanet.local', label: 'Org Admin' },
];

function useApi() {
  return useCallback(async <T,>(method: string, path: string, body?: unknown) => {
    const res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getBuilderToken()}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && json.success !== false, data: json.data, error: json.error, status: res.status };
  }, []);
}

export default function BuilderHomePage() {
  const api = useApi();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [token, setToken] = useState('superadmin@test.travelplanet.local');

  // Form states for Create Experience Tab
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('DESTINATION');
  const [newTemplateId, setNewTemplateId] = useState('tpl.destination');
  const [newVisibility, setNewVisibility] = useState('PRIVATE');
  const [templates, setTemplates] = useState<{ key: string; name: string; type: string }[]>([]);

  useEffect(() => { setToken(getBuilderToken()); }, []);

  useEffect(() => {
    fetch('/api/v1/templates', { headers: { Authorization: `Bearer ${getBuilderToken()}` } })
      .then(r => r.json())
      .then(j => { if (j.success) setTemplates(j.data.templates); })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await api<Row[]>('GET', '/api/v1/experiences?pageSize=100');
    if (r.ok) setRows((r.data as any)?.items ?? r.data ?? []);
    else setError(r.error?.message ?? 'Failed to load experiences');
    setLoading(false);
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newName.trim().length < 2) return;

    const r = await api('POST', '/api/v1/experiences', {
      name: newName.trim(),
      type: newType,
      templateId: newTemplateId || undefined,
      visibility: newVisibility,
    });

    if (r.ok) {
      const id = (r.data as any).id;
      window.location.href = `/admin/builder/${id}`;
    } else {
      setError(r.error?.message ?? 'Create failed');
    }
  };

  const typeOptions = ['PAGE', 'LANDING_PAGE', 'DESTINATION', 'PLACE', 'JOURNEY', 'DIARY', 'GUIDE', 'DASHBOARD', 'WORKSPACE', 'FORM', 'SEARCH'];

  return (
    <InternalLayout
      headerTitle="VIBE — Visual Experience Builder"
      headerSubtitle="Compose, Preview, Publish & Rollback Experiences (§06, §22)"
      actions={
        <div className="flex items-center gap-3">
          <select
            value={token}
            onChange={e => { setBuilderToken(e.target.value); setToken(e.target.value); load(); }}
            className="bg-slate-800 border border-slate-700 rounded-lg text-xs px-2.5 py-1.5 text-slate-300 font-medium"
            title="Active identity (server RBAC still enforced)"
          >
            {DEMO_IDENTITIES.map(d => <option key={d.token} value={d.token}>{d.label}</option>)}
          </select>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('LIST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'LIST' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Experiences ({rows.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('CREATE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'CREATE' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Experience</span>
        </button>
      </div>

      {error && <div className="bg-rose-950/50 border border-rose-800 text-rose-200 text-xs rounded-xl px-4 py-3">{error}</div>}

      {/* Tab 1: Experiences Table */}
      {activeTab === 'LIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Experiences Directory</h2>
            <span className="text-[11px] text-slate-500 font-mono">{rows.length} published & drafts</span>
          </div>
          {loading ? (
            <div className="p-8 flex items-center gap-2 text-slate-400 text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No experiences yet. Switch to "Create New Experience" tab to begin.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 bg-slate-950/40">
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-2.5 font-bold">Name</th>
                  <th className="px-3 py-2.5 font-bold">Type</th>
                  <th className="px-3 py-2.5 font-bold">Status</th>
                  <th className="px-3 py-2.5 font-bold">Visibility</th>
                  <th className="px-3 py-2.5 font-bold">Version</th>
                  <th className="px-3 py-2.5 font-bold">Updated</th>
                  <th className="px-3 py-2.5 text-right font-bold pr-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3 font-semibold text-slate-200">
                      <Link href={`/admin/builder/${r.id}`} className="hover:text-sky-400 hover:underline flex items-center gap-1.5">
                        <LayoutTemplate className="w-3.5 h-3.5 text-sky-500" />
                        {r.name}
                      </Link>
                      <div className="text-[10px] text-slate-500 font-mono">{r.slug}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-400">{r.type}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        r.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        r.status === 'ARCHIVED' ? 'bg-slate-800 text-slate-400' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-400">{r.visibility}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-400">
                      v{r.version}{r.publishedVersion ? ` (pub v${r.publishedVersion})` : ''}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-400">{new Date(r.updatedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-right pr-5">
                      <Link href={`/admin/builder/${r.id}`} className="px-3 py-1 bg-slate-800 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1">
                        Edit <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Create Experience Form (Page View, Not Modal) */}
      {activeTab === 'CREATE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl shadow-sm">
          <h2 className="text-base font-extrabold text-white mb-1">Create New Visual Experience</h2>
          <p className="text-xs text-slate-400 mb-6">
            Configure metadata, page type, and starter template to launch the VIBE canvas.
          </p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Experience Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-semibold"
                placeholder="e.g. Kerala Monsoon Backwaters Experience"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {typeOptions.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Visibility</label>
                <select
                  value={newVisibility}
                  onChange={e => setNewVisibility(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="PRIVATE">PRIVATE</option>
                  <option value="WORKSPACE">WORKSPACE</option>
                  <option value="PUBLIC">PUBLIC</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Starter Template</label>
              <select
                value={newTemplateId}
                onChange={e => setNewTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Blank Canvas (Custom Layout)</option>
                {templates.map(t => <option key={t.key} value={t.key}>{t.name} ({t.type})</option>)}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName || newName.trim().length < 2}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Create &amp; Launch Canvas</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </InternalLayout>
  );
}
