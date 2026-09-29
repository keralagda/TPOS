'use client';

import React, { useState } from 'react';
import { 
  Code, Key, Webhook, BookOpen, Activity, Terminal, 
  Plus, Copy, Check, ShieldCheck, AlertCircle, RefreshCw, 
  Trash2, ExternalLink, Play, Layers
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { DeveloperService, DeveloperApiKey, WebhookSubscription } from '@/lib/developer/developer-service';

export default function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState<'KEYS' | 'WEBHOOKS' | 'DOCS' | 'SANDBOX' | 'ANALYTICS'>('KEYS');

  // API Keys state
  const [keys, setKeys] = useState<DeveloperApiKey[]>(() => DeveloperService.listApiKeys());
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'PRODUCTION' | 'SANDBOX'>('PRODUCTION');
  const [createdPlainKey, setCreatedPlainKey] = useState<string | null>(null);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>(() => DeveloperService.listWebhooks());
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState('booking.created, payment.completed');

  // Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/api/v1/search?q=Kerala');
  const [sandboxMethod, setSandboxMethod] = useState<'GET' | 'POST'>('GET');
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const res = DeveloperService.createApiKey(newKeyName, newKeyEnv, ['bookings.read', 'search.read']);
    setKeys(DeveloperService.listApiKeys());
    setCreatedPlainKey(res.plainSecretKey);
    setNewKeyName('');
  };

  const handleRevokeKey = (id: string) => {
    DeveloperService.revokeApiKey(id);
    setKeys(DeveloperService.listApiKeys());
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;

    const eventsList = newWebhookEvents.split(',').map(s => s.trim()).filter(Boolean);
    DeveloperService.registerWebhook(newWebhookUrl, eventsList);
    setWebhooks(DeveloperService.listWebhooks());
    setNewWebhookUrl('');
  };

  const handleExecuteSandbox = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setSandboxResponse(JSON.stringify({
        status: 200,
        message: 'Success',
        data: {
          destination: 'Kerala',
          packagesCount: 4,
          livingJourneys: [
            { id: 'kerala-monsoon-soul', title: 'Kerala Monsoon & Soul Awakening', basePrice: 45000 }
          ],
          rateLimitRemaining: 1198,
          timestamp: new Date().toISOString()
        }
      }, null, 2));
      setIsExecuting(false);
    }, 400);
  };

  return (
    <InternalLayout
      headerTitle="Enterprise Developer Portal"
      headerSubtitle="API Keys • Webhook Subscriptions • Interactive Swagger Docs • Sandbox Simulator"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SANDBOX')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open Sandbox</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly No Modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('KEYS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'KEYS'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys ({keys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('WEBHOOKS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'WEBHOOKS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            <span>Webhooks ({webhooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DOCS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'DOCS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>API Documentation ({DeveloperService.API_CATALOG.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SANDBOX')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'SANDBOX'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'ANALYTICS'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>API Telemetry</span>
          </button>
        </div>

        {/* TAB 1: API KEYS */}
        {activeTab === 'KEYS' && (
          <div className="space-y-6">
            {/* Plain key alert on newly generated key */}
            {createdPlainKey && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                  <span>New API Secret Key Generated! Copy it now (will not be shown again):</span>
                  <button
                    onClick={() => copyText(createdPlainKey, 'created')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg flex items-center gap-1"
                  >
                    {copiedKey === 'created' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'created' ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-white bg-slate-950 p-2.5 rounded-xl select-all break-all border border-emerald-800">
                  {createdPlainKey}
                </div>
              </div>
            )}

            {/* In-page creation form (Strictly No Modals) */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Issue New Developer API Key
              </span>
              <form onSubmit={handleCreateKey} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Key Name e.g. Akbar Integration or Mobile Gateway"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <select
                  value={newKeyEnv}
                  onChange={e => setNewKeyEnv(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="PRODUCTION">Production (tp_live_)</option>
                  <option value="SANDBOX">Sandbox (tp_test_)</option>
                </select>
                <button
                  type="submit"
                  className="py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
                </button>
              </form>
            </div>

            {/* Keys Table */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-4">Key Name & Mask</th>
                    <th className="p-4">Environment</th>
                    <th className="p-4">Rate Limit</th>
                    <th className="p-4">Monthly Quota</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {keys.map(k => (
                    <tr key={k.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-white text-xs">{k.name}</div>
                        <div className="text-[11px] text-sky-400 font-mono mt-0.5">{k.maskedKey}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          k.environment === 'PRODUCTION' ? 'bg-emerald-950 text-emerald-400' : 'bg-purple-950 text-purple-400'
                        }`}>
                          {k.environment}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {k.rateLimitPerMinute} req/min
                      </td>
                      <td className="p-4">
                        <div className="text-slate-300 font-mono text-[11px]">
                          {k.currentMonthUsage.toLocaleString()} / {k.monthlyQuota.toLocaleString()}
                        </div>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-sky-500 h-full"
                            style={{ width: `${(k.currentMonthUsage / k.monthlyQuota) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          k.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {k.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: WEBHOOKS */}
        {activeTab === 'WEBHOOKS' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Register New Webhook Endpoint
              </span>
              <form onSubmit={handleCreateWebhook} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks"
                  value={newWebhookUrl}
                  onChange={e => setNewWebhookUrl(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Events comma separated"
                  value={newWebhookEvents}
                  onChange={e => setNewWebhookEvents(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subscribe Webhook</span>
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {webhooks.map(w => (
                <div key={w.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-xs font-mono">{w.url}</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded">
                      {w.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {w.events.map((ev, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-sky-400 font-mono text-[10px] rounded">
                        {ev}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    Secret: {w.secret.slice(0, 10)}****************
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: API DOCS */}
        {activeTab === 'DOCS' && (
          <div className="space-y-4">
            {DeveloperService.API_CATALOG.map((endpoint, i) => (
              <div key={i} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-black ${
                      endpoint.method === 'GET' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-white text-xs font-bold">{endpoint.path}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{endpoint.category}</span>
                </div>

                <p className="text-xs text-slate-300">{endpoint.description}</p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parameters:</span>
                  <div className="space-y-1">
                    {endpoint.parameters.map((param, pi) => (
                      <div key={pi} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="text-emerald-400 font-bold">{param.name}</span>
                        <span>({param.type})</span>
                        {param.required && <span className="text-rose-400 text-[10px] font-bold">REQUIRED</span>}
                        <span className="text-slate-500">— {param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sample Response:</span>
                  <pre className="bg-slate-950 p-3 rounded-xl text-xs font-mono text-sky-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify(endpoint.sampleResponse, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SANDBOX */}
        {activeTab === 'SANDBOX' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4 max-w-4xl">
            <div>
              <h3 className="text-lg font-black text-white">Live API Sandbox Console</h3>
              <p className="text-xs text-slate-400 mt-1">
                Execute live mock requests against Travel Planet OS Voyage8 endpoints with authenticated sandbox headers.
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={sandboxMethod}
                onChange={e => setSandboxMethod(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-sky-400 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <input
                type="text"
                value={sandboxEndpoint}
                onChange={e => setSandboxEndpoint(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleExecuteSandbox}
                disabled={isExecuting}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>

            {sandboxResponse && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HTTP 200 OK Response:</span>
                <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-purple-800/40">
                  {sandboxResponse}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Calls (MTD)</span>
              <div className="text-2xl font-black text-white">51,330</div>
              <span className="text-xs text-emerald-400 font-bold">+28% vs last month</span>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Latency</span>
              <div className="text-2xl font-black text-sky-400">114 ms</div>
              <span className="text-xs text-slate-400 font-mono">Edge Cached</span>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
              <div className="text-2xl font-black text-emerald-400">99.98%</div>
              <span className="text-xs text-slate-400 font-mono">0.02% error rate</span>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Keys</span>
              <div className="text-2xl font-black text-purple-400">{keys.filter(k => k.status === 'ACTIVE').length}</div>
              <span className="text-xs text-slate-400 font-mono">Across 2 Environments</span>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
