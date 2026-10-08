'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, X, ArrowRight, CornerDownLeft, 
  Compass, CheckCircle2, Building, RefreshCw, Send 
} from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { resolveAINavigation } from '@/lib/navigation/ai-navigation';
import { AINavigationResolution } from '@/lib/navigation/types';

export function AINavigationModal() {
  const { aiAssistOpen, setAiAssistOpen, setBranch } = useNavigation();
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<AINavigationResolution | null>(null);
  const router = useRouter();

  if (!aiAssistOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    const res = resolveAINavigation(prompt);
    setResolution(res);

    if (res.branchSwitch) {
      setBranch(res.branchSwitch);
    }
  };

  const handleExecute = (targetUrl: string) => {
    setAiAssistOpen(false);
    router.push(targetUrl);
  };

  const handleSampleClick = (sample: string) => {
    setPrompt(sample);
    const res = resolveAINavigation(sample);
    setResolution(res);
    if (res.branchSwitch) {
      setBranch(res.branchSwitch);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Navigation Assistant</h3>
              <p className="text-[11px] text-slate-400">Tell me what you want to do in natural business terms</p>
            </div>
          </div>
          <button
            onClick={() => setAiAssistOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'Show today\'s bookings', 'Create Kerala package', 'Switch Kochi branch'..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>

        {/* Quick Sample Prompts */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Suggested Business Goals:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Show today's bookings",
              'Create Kerala package',
              'Improve my website SEO',
              'Switch Kochi branch',
              'Pending visa documents',
            ].map((sample) => (
              <button
                key={sample}
                onClick={() => handleSampleClick(sample)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-sky-600/20 text-slate-300 hover:text-sky-300 border border-slate-700/60 text-[11px] transition"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* AI Resolution Display */}
        {resolution && (
          <div className="p-4 space-y-3 bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-wider">
                  Goal Understood
                </span>
                <p className="text-xs text-slate-200 font-semibold">{resolution.understoodIntent}</p>
                <p className="text-[11px] text-slate-400">{resolution.confirmationText}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Target Module:</span>
                <span className="text-[11px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {resolution.resolvedModule}
                </span>
              </div>
              <button
                onClick={() => handleExecute(resolution.targetUrl)}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20"
              >
                <span>Go to {resolution.resolvedModule}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
