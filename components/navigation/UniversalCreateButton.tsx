'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, UserPlus, Compass, CheckSquare, 
  Package, UploadCloud, Megaphone, ChevronDown 
} from 'lucide-react';
import { UNIVERSAL_QUICK_ACTIONS } from '@/lib/navigation/quick-actions';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Compass,
  CheckSquare,
  Package,
  UploadCloud,
  Megaphone,
};

export function UniversalCreateButton() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="h-8 px-2.5 sm:px-3 bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-600/25 active:scale-95"
        title="Universal Quick Create (+ New)"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="font-extrabold tracking-tight">New</span>
        <ChevronDown className={`w-3 h-3 transition duration-150 text-sky-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
            <span>Quick Create</span>
            <span className="font-mono text-[9px] text-sky-400">Shortcuts</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {UNIVERSAL_QUICK_ACTIONS.map((action) => {
              const Icon = ICON_MAP[action.icon] || Plus;
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.targetUrl)}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-sky-600/20 flex items-center justify-between group transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-sky-400 group-hover:text-white group-hover:bg-sky-600 group-hover:border-sky-500 transition shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{action.label}</span>
                  </div>
                  {action.shortcut && (
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-sky-300 ml-2 shrink-0">
                      {action.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
