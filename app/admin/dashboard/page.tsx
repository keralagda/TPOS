'use client';

import React from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedDashboard';
import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminCommandCenterPage() {
  return (
    <InternalLayout
      headerTitle="Travel Planet OS"
      headerSubtitle="Business Operations & Executive Center"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/saas"
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>SaaS Plane</span>
          </Link>
          <Link
            href="/admin/system-health"
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </Link>
        </div>
      }
    >
      <PersonalizedDashboard />
    </InternalLayout>
  );
}
