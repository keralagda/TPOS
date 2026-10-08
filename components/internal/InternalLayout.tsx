'use client';

import React from 'react';
import { InternalSidebar } from '@/components/internal/InternalSidebar';
import { InternalHeader } from '@/components/internal/InternalHeader';
import { 
  NavigationProvider 
} from '@/components/navigation/NavigationContext';
import { GlobalIntelligentSearch } from '@/components/navigation/GlobalIntelligentSearch';
import { AINavigationModal } from '@/components/navigation/AINavigationModal';

interface InternalLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  actions?: React.ReactNode;
}

function InternalLayoutContent({
  children,
  headerTitle,
  headerSubtitle,
  actions,
}: InternalLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <InternalSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Optimized Top Header */}
        <InternalHeader 
          headerTitle={headerTitle}
          headerSubtitle={headerSubtitle}
          actions={actions}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Intelligent Search Modal (⌘K) */}
      <GlobalIntelligentSearch />

      {/* AI Navigation Modal (⌘J) */}
      <AINavigationModal />
    </div>
  );
}

export function InternalLayout(props: InternalLayoutProps) {
  return (
    <NavigationProvider>
      <InternalLayoutContent {...props} />
    </NavigationProvider>
  );
}
