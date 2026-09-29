'use client';

import React, { useState } from 'react';
import { 
  Search, ShieldCheck, Activity, Network, Link2, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  HelpCircle, Compass, RefreshCw, BarChart2, Eye
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { HESTIA8SEOEngine } from '@/lib/hestia8/seo-engine';
import { HESTIA8EntityGraphEngine } from '@/lib/hestia8/entity-graph';
import { SEOHealthAudit, InternalLinkingRecommendation, AIOmniSnippet } from '@/lib/hestia8/types';

export default function Hestia8SEOAdminPage() {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'ENTITY_GRAPH' | 'INTERNAL_LINKS' | 'AEO_SYNTHESIZER'>('AUDIT');

  // Audit form state
  const [auditUrl, setAuditUrl] = useState('/journeys/kerala-monsoon-soul-journey');
  const [auditTitle, setAuditTitle] = useState('Kerala Monsoon & Soul Awakening | Living Journey Itinerary');
  const [auditMeta, setAuditMeta] = useState('Experience 6 days of rejuvenating living journeys in Kerala backwaters and Munnar tea hills. Real-time adaptive routing and private local concierges.');
  const [auditKeyword, setAuditKeyword] = useState('Kerala Monsoon');
  const [auditContent, setAuditContent] = useState(`## Experience the Rejuvenating Spirit of Kerala Monsoon

The monsoon season in Kerala brings a tranquil emerald rebirth across timeless backwaters and mist-crowned tea slopes.

### Why Choose a Living Journey?
Unlike static travel packages, our Living Journeys feature real-time sensors that dynamically adjust your schedule during heavy cloudbursts, seamlessly transitioning outdoor boat cruises to exclusive indoor Kathakali recitals and Ayurvedic cooking workshops.

### Frequently Asked Questions
#### What is the best time to visit Kerala in monsoon?
Between June and August for authentic Ayurvedic rejuvenation treatments and lush green landscapes.

#### What happens if it rains heavily during our tour?
Your dedicated concierge automatically reroutes the day to indoor heritage experiences without any delay.`);

  const [auditResult, setAuditResult] = useState<SEOHealthAudit>(() => 
    HESTIA8SEOEngine.auditContent({
      urlOrSlug: auditUrl,
      title: auditTitle,
      metaDescription: auditMeta,
      contentMarkdown: auditContent,
      focusKeyword: auditKeyword,
      contentType: 'JOURNEY',
      hasSchema: true
    })
  );

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = HESTIA8SEOEngine.auditContent({
      urlOrSlug: auditUrl,
      title: auditTitle,
      metaDescription: auditMeta,
      contentMarkdown: auditContent,
      focusKeyword: auditKeyword,
      contentType: 'JOURNEY',
      hasSchema: true
    });
    setAuditResult(res);
  };

  // Entity Graph state
  const graphNodes = HESTIA8EntityGraphEngine.getAllNodes();
  const graphMetrics = HESTIA8EntityGraphEngine.getGraphHealthMetrics();
  const internalLinks = HESTIA8EntityGraphEngine.generateInternalLinkingRecommendations();

  // AEO Synthesizer state
  const [aeoTopic, setAeoTopic] = useState('Ayurvedic Panchakarma');
  const [aeoDest, setAeoDest] = useState('Kerala');
  const [aeoQuestion, setAeoQuestion] = useState('What is the best month for authentic Ayurvedic Panchakarma in Kerala?');
  const [aeoSnippet, setAeoSnippet] = useState<AIOmniSnippet | null>(null);

  const handleGenerateAEOSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    const snippet = HESTIA8SEOEngine.synthesizeAEOSnippet(aeoTopic, aeoDest, aeoQuestion);
    setAeoSnippet(snippet);
  };

  return (
    <InternalLayout
      headerTitle="HESTIA8 Omni AI SEO & Growth Engine"
      headerSubtitle="GEO • AEO • LLMO • Entity Graph • Semantic Search Experience Optimization"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Audit</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly No Modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'AUDIT'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health Audit ({auditResult.overallScore}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('ENTITY_GRAPH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ENTITY_GRAPH'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Entity Knowledge Graph ({graphNodes.length} Nodes)</span>
          </button>

          <button
            onClick={() => setActiveTab('INTERNAL_LINKS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'INTERNAL_LINKS'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Internal Linking AI ({internalLinks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AEO_SYNTHESIZER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'AEO_SYNTHESIZER'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AEO / GEO Direct Answers</span>
          </button>
        </div>

        {/* TAB 1: AUDIT */}
        {activeTab === 'AUDIT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Target URL / Page Parameters
              </span>

              <form onSubmit={handleRunAudit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Target Slug</label>
                  <input
                    type="text"
                    value={auditUrl}
                    onChange={e => setAuditUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Page Meta Title</label>
                  <input
                    type="text"
                    value={auditTitle}
                    onChange={e => setAuditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Focus Keyword</label>
                  <input
                    type="text"
                    value={auditKeyword}
                    onChange={e => setAuditKeyword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Meta Description</label>
                  <textarea
                    rows={3}
                    value={auditMeta}
                    onChange={e => setAuditMeta(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recalculate SEO & AEO Score</span>
                </button>
              </form>
            </div>

            {/* Audit Results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Health</span>
                  <div className={`text-2xl font-black ${auditResult.overallScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {auditResult.overallScore}%
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AEO Readiness</span>
                  <div className={`text-2xl font-black ${auditResult.aeoReadinessScore >= 80 ? 'text-indigo-400' : 'text-amber-400'}`}>
                    {auditResult.aeoReadinessScore}%
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title & Meta</span>
                  <div className="text-2xl font-black text-sky-400">
                    {Math.round((auditResult.titleScore + auditResult.metaDescriptionScore) / 2)}%
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schema Validity</span>
                  <div className="text-2xl font-black text-teal-400">
                    {auditResult.schemaValidationScore}%
                  </div>
                </div>
              </div>

              {/* Detailed Checks */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  HESTIA8 Automated SEO Audit Breakdown
                </span>

                <div className="space-y-2">
                  {auditResult.checks.map((chk, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                        chk.passed 
                          ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' 
                          : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      }`}
                    >
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">{chk.name}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{chk.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              {auditResult.aiRecommendations.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-950/40 to-sky-950/40 border border-indigo-800/50 rounded-2xl p-5 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> HESTIA8 AI Optimization Next-Actions
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {auditResult.aiRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ENTITY GRAPH */}
        {activeTab === 'ENTITY_GRAPH' && (
          <div className="space-y-6">
            {/* Graph Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Graph Health</span>
                <div className="text-2xl font-black text-emerald-400">{graphMetrics.healthScore}%</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Entities</span>
                <div className="text-2xl font-black text-white">{graphMetrics.totalNodes}</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interlinks</span>
                <div className="text-2xl font-black text-sky-400">{graphMetrics.totalLinks}</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Degree</span>
                <div className="text-2xl font-black text-indigo-400">{graphMetrics.averageDegree}</div>
              </div>
            </div>

            {/* Nodes Registry */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Travel Knowledge Graph Entities
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {graphNodes.map(node => (
                  <div key={node.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">{node.name}</span>
                      <span className="px-2 py-0.5 bg-slate-900 text-sky-400 text-[10px] font-mono rounded">
                        {node.entityType}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Topical Cluster: <span className="text-slate-200">{node.topicalCluster}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3">
                      <span>Inbound: {node.inboundLinksCount}</span>
                      <span>Outbound: {node.outboundLinksCount}</span>
                      <span className="text-emerald-400">Schema: {node.schemaType}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-900 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Connected Nodes:</span>
                      <div className="flex flex-wrap gap-1">
                        {node.connectedEntities.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-300 text-[10px] rounded border border-slate-800 font-mono">
                            {c.relationType} → {c.targetId} ({c.weight * 100}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERNAL LINKING */}
        {activeTab === 'INTERNAL_LINKS' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Hierarchical Internal Linking AI</h3>
              <p className="text-xs text-slate-400 mt-1">
                Automated link equity distribution following travel topology: Destination → Experiences → Hotels → Packages → Guides → Stories → Journeys.
              </p>
            </div>

            <div className="space-y-3">
              {internalLinks.map((rec, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rec.sourceEntityTitle}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-bold text-sky-400">{rec.targetEntityTitle}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800/40 text-[10px] font-bold rounded">
                      {rec.growthPotential} PRIORITY
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-slate-400">Suggested Anchor Text: </span>
                    <span className="text-emerald-400 font-mono underline">&quot;{rec.suggestedAnchorText}&quot;</span>
                  </div>

                  <p className="text-xs text-slate-400 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    &quot;{rec.suggestedParagraphContext}&quot;
                  </p>

                  <div className="text-[10px] font-mono text-indigo-400 pt-1">
                    Hierarchy Flow: {rec.hierarchicalRelation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AEO SYNTHESIZER */}
        {activeTab === 'AEO_SYNTHESIZER' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">AEO / GEO Direct Answer Synthesizer</h3>
              <p className="text-xs text-slate-400 mt-1">
                Synthesize high-density citable answers for AI Search Engines (Perplexity, ChatGPT Search, and Google AI Overviews).
              </p>
            </div>

            <form onSubmit={handleGenerateAEOSnippet} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Topic</label>
                  <input
                    type="text"
                    value={aeoTopic}
                    onChange={e => setAeoTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Destination</label>
                  <input
                    type="text"
                    value={aeoDest}
                    onChange={e => setAeoDest(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Traveler Direct Question</label>
                <input
                  type="text"
                  value={aeoQuestion}
                  onChange={e => setAeoQuestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Citable Answer</span>
                </button>
              </div>
            </form>

            {/* Generated AEO Snippet */}
            {aeoSnippet && (
              <div className="bg-slate-950 rounded-xl border border-amber-500/40 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-xs">Direct Answer Summary (Perplexity Optimized)</span>
                  <span className="text-[10px] font-mono text-emerald-400">48 Words • High Density</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {aeoSnippet.directAnswerSummary}
                </p>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Citable Highlights:</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {aeoSnippet.keyHighlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-sky-400">
                  Citable Source: <a href={aeoSnippet.citableSources[0]?.url} className="underline">{aeoSnippet.citableSources[0]?.title}</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
