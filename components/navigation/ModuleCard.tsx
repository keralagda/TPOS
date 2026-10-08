'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Globe, Search, FileText, Database, Compass, Radio, 
  MapPin, Sparkles, Building2, Layers, ToggleRight, Activity, ArrowRight
} from 'lucide-react';
import { getModuleCardInfo } from '@/lib/navigation/aliases';

interface ModuleCardProps {
  aliasKey: string;
  href?: string;
  customTitle?: string;
  customDescription?: string;
  customTechLabel?: string;
  badge?: string;
  showTechLabel?: boolean; // In simple mode, might be hidden or subtle; in advanced mode, proudly displayed
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Voyage8: Compass,
  'VIBE8 CMS': Globe,
  HESTIA8: Search,
  CRUDE8: Database,
  DMS8: FileText,
  Social8: Radio,
  GEM8: MapPin,
  'AI Agents': Sparkles,
  Branch8: Building2,
  Registry: Layers,
  'Feature Flags': ToggleRight,
  'Operation Modes': Activity,
};

export function ModuleCard({
  aliasKey,
  href,
  customTitle,
  customDescription,
  customTechLabel,
  badge,
  showTechLabel = true,
}: ModuleCardProps) {
  const info = getModuleCardInfo(aliasKey);
  const title = customTitle || info.businessTitle;
  const description = customDescription || info.description;
  const techLabel = customTechLabel || info.poweredBy;
  const targetUrl = href || '#';

  const IconComponent = ICON_MAP[aliasKey] || Layers;

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:text-white group-hover:scale-105 transition">
            <IconComponent className="w-5 h-5" />
          </div>
          {badge && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {badge}
            </span>
          )}
        </div>

        <div>
          {/* USER TITLE */}
          <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition tracking-tight">
            {title}
          </h3>
          {/* SHORT DESCRIPTION */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        {/* TECH LABEL */}
        {showTechLabel ? (
          <span className="text-[10px] font-mono font-bold text-sky-400/90 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
            {techLabel}
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 font-medium">Ready</span>
        )}

        <Link
          href={targetUrl}
          className="text-xs font-semibold text-slate-300 group-hover:text-white flex items-center gap-1 transition"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
        </Link>
      </div>
    </div>
  );
}
