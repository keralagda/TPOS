/**
 * Travel Planet (Voyage8) — 19 Standard System Roles & Permission Mappings
 */

import { DataScope } from './scopes';

export interface SystemRoleDefinition {
  code: string;
  name: string;
  description: string;
  defaultScope: DataScope;
  isSystem: boolean;
  permissions: string[];
}

export const SYSTEM_ROLES: Record<string, SystemRoleDefinition> = {
  PLATFORM_SUPER_ADMIN: {
    code: 'PLATFORM_SUPER_ADMIN',
    name: 'Platform Super Administrator',
    description: 'Platform-wide unrestricted administration across all tenants, organizations and systems.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: ['*'], // Wildcard: grants all permissions
  },

  ADMIN: {
    code: 'ADMIN',
    name: 'Organization Administrator',
    description: 'General organizational administration, team provisioning, user management, and workspace oversight.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'users.view', 'users.create', 'users.update', 'users.delete',
      'roles.view', 'roles.create', 'roles.update',
      'customers.view', 'customers.create', 'customers.update',
      'bookings.view', 'bookings.create', 'bookings.update', 'bookings.cancel',
      'trips.view', 'trips.manage',
      'itineraries.view', 'itineraries.create', 'itineraries.update',
      'vendors.view', 'inventory.view', 'offers.view',
      'payments.view', 'payments.verify', 'finance.view',
      'integrations.view', 'webhooks.view', 'sync.view',
      'ai.view', 'ai.chat', 'ai.actions',
      'content.view', 'marketing.view',
      'vibe.view', 'vibe.create', 'vibe.edit', 'vibe.publish', 'vibe.view_drafts',
      'vibe.manage_components', 'vibe.manage_workspaces',
      'places.manage', 'journeys.manage', 'diaries.manage', 'diaries.publish',
      'analytics.view', 'analytics.export',
      'audit.view', 'settings.view', 'settings.manage',
    ],
  },

  OPERATIONS_MANAGER: {
    code: 'OPERATIONS_MANAGER',
    name: 'Operations Manager',
    description: 'Operational control of traveler bookings, itinerary execution, supplier coordination, and case triage.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.create', 'customers.update',
      'bookings.view', 'bookings.create', 'bookings.update', 'bookings.cancel',
      'trips.view', 'trips.create', 'trips.update', 'trips.manage',
      'itineraries.view', 'itineraries.create', 'itineraries.update',
      'vendors.view', 'inventory.view', 'offers.view',
      'payments.view', 'payments.verify',
      'sync.view', 'sync.run',
      'ai.view', 'ai.chat', 'ai.actions',
      'analytics.view',
    ],
  },

  TRAVEL_AGENT: {
    code: 'TRAVEL_AGENT',
    name: 'Travel Agent / Consultant',
    description: 'Management of assigned customer inquiries, custom quotations, itineraries, and booking reservations.',
    defaultScope: 'ASSIGNED',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.create', 'customers.update',
      'leads.view', 'leads.create', 'leads.update',
      'bookings.view', 'bookings.create', 'bookings.update',
      'trips.view', 'trips.create', 'trips.update',
      'itineraries.view', 'itineraries.create', 'itineraries.update',
      'inventory.view', 'offers.view',
      'payments.view', 'payments.create',
      'ai.view', 'ai.chat',
    ],
  },

  SALES_MANAGER: {
    code: 'SALES_MANAGER',
    name: 'Sales Manager',
    description: 'Oversight of sales pipeline, quotation approvals, lead assignment, and conversion reporting.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.create', 'customers.update', 'customers.export',
      'leads.view', 'leads.create', 'leads.update', 'leads.assign',
      'bookings.view', 'bookings.create', 'bookings.update',
      'offers.view', 'offers.create', 'offers.update', 'offers.publish',
      'analytics.view', 'analytics.export',
      'ai.view', 'ai.chat', 'ai.insights',
    ],
  },

  CRM_MANAGER: {
    code: 'CRM_MANAGER',
    name: 'CRM & Client Experience Manager',
    description: 'Customer profiles, communications history, campaign targeting, and traveler satisfaction intelligence.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.create', 'customers.update', 'customers.delete', 'customers.export',
      'leads.view', 'leads.update', 'leads.assign',
      'marketing.view', 'marketing.create', 'marketing.publish',
      'analytics.view',
      'ai.view', 'ai.chat', 'ai.insights',
    ],
  },

  FINANCE_MANAGER: {
    code: 'FINANCE_MANAGER',
    name: 'Finance Manager & Treasury Head',
    description: 'Treasury operations, payment reconciliations, refunds authorization, vendor settlements, and cash management.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'bookings.view',
      'payments.view', 'payments.create', 'payments.verify', 'payments.refund',
      'finance.view', 'finance.manage',
      'accounting.view', 'accounting.manage',
      'settlements.view', 'settlements.create', 'settlements.approve',
      'analytics.view', 'analytics.export',
      'audit.view',
      'ai.view', 'ai.chat',
    ],
  },

  ACCOUNTANT: {
    code: 'ACCOUNTANT',
    name: 'General Ledger Accountant',
    description: 'Daily ledger entry posting, bank and payment gateway reconciliation, and journal audits.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'payments.view', 'payments.verify',
      'accounting.view', 'accounting.manage',
      'settlements.view', 'settlements.create',
      'analytics.view',
      'audit.view',
    ],
  },

  SUPPLIER_MANAGER: {
    code: 'SUPPLIER_MANAGER',
    name: 'Supplier & Vendor Contracting Manager',
    description: 'Supplier contract negotiations, vendor onboarding, commission structures, and inventory quality control.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'vendors.view', 'vendors.create', 'vendors.update', 'vendors.approve',
      'inventory.view', 'inventory.update', 'inventory.publish',
      'settlements.view',
      'analytics.view',
    ],
  },

  VENDOR_ADMIN: {
    code: 'VENDOR_ADMIN',
    name: 'Vendor Organization Administrator',
    description: 'Administration of external vendor organization, user seats, and commercial settings.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'vendors.view', 'vendors.update',
      'inventory.view', 'inventory.create', 'inventory.update', 'inventory.publish',
      'bookings.view',
      'settlements.view',
      'analytics.view',
    ],
  },

  VENDOR_OPERATOR: {
    code: 'VENDOR_OPERATOR',
    name: 'Vendor Inventory Operator',
    description: 'Operational management of vendor room allocations, tour departures, and local order fulfillments.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'inventory.view', 'inventory.create', 'inventory.update',
      'bookings.view',
    ],
  },

  CUSTOMER_SUPPORT: {
    code: 'CUSTOMER_SUPPORT',
    name: 'Customer Support Representative',
    description: 'Resolution of active traveler inquiries, support tickets, booking lookups, and trip updates.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.update',
      'bookings.view', 'bookings.update',
      'trips.view', 'trips.update',
      'itineraries.view',
      'ai.view', 'ai.chat',
    ],
  },

  CONTENT_MANAGER: {
    code: 'CONTENT_MANAGER',
    name: 'Content & Directory Editor',
    description: 'Curation of destination guides, attraction reviews, media galleries, and travel tips.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'content.view', 'content.create', 'content.update', 'content.publish',
      'offers.view',
      'ai.view', 'ai.chat',
      // VIBE builder
      'vibe.view', 'vibe.create', 'vibe.edit', 'vibe.view_drafts', 'vibe.publish',
      'places.manage', 'journeys.manage', 'diaries.manage',
    ],
  },

  MARKETING_MANAGER: {
    code: 'MARKETING_MANAGER',
    name: 'Marketing & Growth Specialist',
    description: 'Promotional campaigns, discounts, seasonal offers, and marketing performance attribution.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'offers.view', 'offers.create', 'offers.update', 'offers.publish',
      'marketing.view', 'marketing.create', 'marketing.publish',
      'analytics.view', 'analytics.export',
    ],
  },

  INTEGRATION_MANAGER: {
    code: 'INTEGRATION_MANAGER',
    name: 'Integration & GDS Engineer',
    description: 'Administration of external API connectors (Amadeus, Akbar, Booking, NDC), webhooks, and sync engine.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'integrations.view', 'integrations.create', 'integrations.update', 'integrations.activate', 'integrations.disable',
      'webhooks.view', 'webhooks.manage',
      'sync.view', 'sync.run', 'sync.retry',
      'audit.view',
    ],
  },

  AI_OPERATOR: {
    code: 'AI_OPERATOR',
    name: 'AI Operations & Prompt Specialist',
    description: 'Configuration of Voyage8 cognitive architecture, skill definitions, AI action thresholds, and copilot analytics.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'ai.view', 'ai.chat', 'ai.insights', 'ai.actions', 'ai.configure',
      'itineraries.view', 'itineraries.create',
      'analytics.view',
      'audit.view',
    ],
  },

  ANALYST: {
    code: 'ANALYST',
    name: 'Business Intelligence Analyst',
    description: 'Cross-functional read-only analytics, financial performance metrics, and operational KPI reports.',
    defaultScope: 'READ_ONLY',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'customers.view',
      'bookings.view',
      'trips.view',
      'vendors.view',
      'inventory.view',
      'payments.view',
      'finance.view',
      'accounting.view',
      'marketing.view',
      'analytics.view', 'analytics.export',
    ],
  },

  CUSTOMER: {
    code: 'CUSTOMER',
    name: 'B2C Traveler / Consumer',
    description: 'Standard retail consumer access: view personal bookings, trips, profile, and interact with AI travel planner.',
    defaultScope: 'OWN_RECORDS',
    isSystem: true,
    permissions: [
      'bookings.view', 'bookings.create',
      'trips.view',
      'itineraries.view', 'itineraries.create',
      'offers.view',
      'payments.create',
      'ai.chat',
      'content.view',
    ],
  },

  PARTNER: {
    code: 'PARTNER',
    name: 'B2B2C Partner / Travel Agency Desk',
    description: 'Commercial travel partner with custom wholesale markups, sub-agent quoting, and dedicated partner wallet.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.create',
      'bookings.view', 'bookings.create', 'bookings.update',
      'trips.view',
      'itineraries.view', 'itineraries.create',
      'inventory.view',
      'offers.view',
      'payments.create',
      'ai.chat',
    ],
  },
};
