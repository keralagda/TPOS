'use client';

import React from 'react';
import { InternalSidebar } from '@/components/internal/InternalSidebar';

interface InternalLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  actions?: React.ReactNode;
}

export function InternalLayout({ 
  children, 
  headerTitle, 
  headerSubtitle, 
  actions 
}: InternalLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <InternalSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 sm:px-8 flex items-center justify-between shrink-0 z-20">
          <div>
            {headerTitle ? (
              <div className="flex items-center gap-3">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">{headerTitle}</h1>
                {headerSubtitle && (
                  <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                    • {headerSubtitle}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-400">
                Travel Planet Enterprise Workspace
              </div>
            )}
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
