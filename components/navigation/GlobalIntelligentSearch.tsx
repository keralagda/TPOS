'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, X, ArrowRight, ShieldCheck, Tag, 
  ExternalLink, Sparkles, Database, Compass, Layers 
} from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { executeIntelligentSearch } from '@/lib/navigation/intelligent-search';
import { IntelligentSearchResult } from '@/lib/navigation/types';

export function GlobalIntelligentSearch() {
  const { searchOpen, setSearchOpen } = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IntelligentSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setResults(executeIntelligentSearch('booking'));
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (query.trim()) {
      const found = executeIntelligentSearch(query);
      setResults(found);
      setSelectedIndex(0);
    } else {
      setResults(executeIntelligentSearch('booking'));
    }
  }, [query]);

  const handleSelect = (result: IntelligentSearchResult) => {
    setSearchOpen(false);
    router.push(result.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bookings, packages, customers, visas... (e.g., 'Dubai booking', 'Customer Rahul')"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Quick Query Suggestions */}
        <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Try:</span>
          {['Dubai booking', 'Munnar packages', 'Pending visa documents', 'Customer Rahul'].map((sample) => (
            <button
              key={sample}
              onClick={() => setQuery(sample)}
              className="px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/50 text-[11px] whitespace-nowrap transition"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching records, modules, or actions found for &quot;{query}&quot;.
            </div>
          ) : (
            results.map((res, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${res.url}-${idx}`}
                  onClick={() => handleSelect(res)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-sky-600/20 border border-sky-500/50 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-white truncate">{res.title}</span>
                      {res.entity && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-800 text-sky-300 border border-slate-700">
                          {res.entity}
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {res.module}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{res.subtitle}</p>

                    {/* Metadata tags: Action & Permission */}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      {res.action && (
                        <span className="text-slate-400 flex items-center gap-1 font-mono">
                          <Tag className="w-2.5 h-2.5 text-amber-400" />
                          <span>Action: {res.action}</span>
                        </span>
                      )}
                      {res.permission && (
                        <span className="text-slate-500 flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{res.permission}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-slate-400">
                    <ArrowRight className={`w-4 h-4 transition ${isSelected ? 'text-sky-400 translate-x-1' : ''}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-mono text-sky-400 font-bold text-[10px]">
            Global Intelligent Search
          </span>
        </div>
      </div>
    </div>
  );
}
