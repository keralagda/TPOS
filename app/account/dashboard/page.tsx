'use client';

import React from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedDashboard';

export default function CustomerAccountDashboardPage() {
  return (
    <InternalLayout
      headerTitle="My Travel Space"
      headerSubtitle="Personal Traveler Portal"
    >
      <PersonalizedDashboard />
    </InternalLayout>
  );
}
