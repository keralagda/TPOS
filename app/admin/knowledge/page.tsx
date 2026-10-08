import { Metadata } from 'next';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { TemporalPriceEngine } from '@/lib/knowledge/temporal-price-engine';
import { WhatsAppKnowledgeConnector } from '@/lib/knowledge/whatsapp-connector';
import { Database, MessageSquare, Clock, AlertOctagon, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Knowledge Center & Price Intelligence | Travel Planet OS',
  description: 'Authorized WhatsApp sources, temporal price validity (3.5-5h), conflict detection, and provenance-grounded AI.',
};

export default function KnowledgeCenterPage() {
  const sources = WhatsAppKnowledgeConnector.getSources();
  const prices = TemporalPriceEngine.getAllPrices();

  return (
    <InternalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                KNOWLEDGE8 TEMPORAL CORE
              </span>
              <span className="text-xs text-slate-400 font-mono">Evidence-First Price & Graph</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Database className="w-6 h-6 text-amber-400" />
              Knowledge Center & Price Intelligence
            </h1>
            <p className="text-sm text-slate-400">
              Authorized partner messages, temporal validity (3.5h to 5.0h default rush profiles), explicit expiry prioritization, and full answer provenance.
            </p>
          </div>
        </div>

        {/* Knowledge Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Authorized Sources
            </div>
            <div className="text-xl font-black text-white">{sources.length} Channels</div>
            <p className="text-[11px] text-slate-400 mt-1">Kerala B2B Community, Dubai Arabian Journeys DMC</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Clock className="w-4 h-4 text-sky-400" />
              Temporal Windows
            </div>
            <div className="text-xl font-black text-white">3.5h – 5.0h</div>
            <p className="text-[11px] text-slate-400 mt-1">Dynamic rush window calculation with explicit expiry overrides</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Conflict Guard
            </div>
            <div className="text-xl font-black text-white">Zero Guesswork</div>
            <p className="text-[11px] text-slate-400 mt-1">Conflicting active rates surfaced to agent with provenance trace</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Grounding
            </div>
            <div className="text-xl font-black text-white">Exact Facts Only</div>
            <p className="text-[11px] text-slate-400 mt-1">No price fabrication, distinguishes current vs latest vs expired</p>
          </div>
        </div>

        {/* Authorized WhatsApp Sources Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected WhatsApp & Messaging Sources ({sources.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Access: Internal B2B Scoped Only</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((s) => (
              <div key={s.sourceId} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {s.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{s.sourceType}</span>
                </div>
                <h3 className="font-bold text-white text-base">{s.sourceName}</h3>
                <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span>Messages: {s.messageCount}</span>
                  <span>Extracted Prices: {s.extractedPricesCount}</span>
                  <span>Branch: {s.branchId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InternalLayout>
  );
}
