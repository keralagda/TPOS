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
    description: 'Standard retail consumer access: view personal bookings, trips, profile, documents, and interact with AI travel planner.',
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
      'documents.view', 'documents.upload',
      'compliance.view', 'compliance.approve',
      'profile.view', 'profile.update',
    ],
  },

  CORPORATE_TRAVELER: {
    code: 'CORPORATE_TRAVELER',
    name: 'Corporate Business Traveler',
    description: 'Business travel consumer with policy compliance, corporate approval workflows, and centralized invoicing.',
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
      'documents.view', 'documents.upload',
      'profile.view', 'profile.update',
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

  PLATFORM_ADMIN: {
    code: 'PLATFORM_ADMIN',
    name: 'Platform Administrator',
    description: 'Platform infrastructure administration, tenant policy enforcement, and platform service monitoring.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: ['*'],
  },

  SAAS_ADMIN: {
    code: 'SAAS_ADMIN',
    name: 'SaaS Multi-Tenant Administrator',
    description: 'Tenant billing, subscription quotas, feature flag toggles, and tenant isolation policies.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: [
      'dashboard.view', 'users.view', 'roles.view', 'settings.view', 'settings.manage',
      'audit.view', 'analytics.view',
    ],
  },

  SECURITY_ADMIN: {
    code: 'SECURITY_ADMIN',
    name: 'Security & Compliance Officer',
    description: 'Audit log inspection, cryptographic certificate verification, and data protection enforcement.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: ['audit.view', 'settings.view', 'users.view', 'roles.view'],
  },

  INTEGRATION_ADMIN: {
    code: 'INTEGRATION_ADMIN',
    name: 'Integration & Connector Administrator',
    description: 'Management of external API keys, webhook endpoints, and global connector failover circuit breakers.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: [
      'dashboard.view', 'integrations.view', 'integrations.create', 'integrations.update',
      'integrations.activate', 'integrations.disable', 'webhooks.view', 'webhooks.manage', 'sync.view', 'sync.run',
    ],
  },

  AI_ADMIN: {
    code: 'AI_ADMIN',
    name: 'AI Knowledge & Agent Administrator',
    description: 'Orchestration of AI models, temperature bounds, prompt templates, and knowledge retrieval permissions.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: ['dashboard.view', 'ai.view', 'ai.chat', 'ai.insights', 'ai.actions', 'ai.configure'],
  },

  PLATFORM_ANALYST: {
    code: 'PLATFORM_ANALYST',
    name: 'Platform Global Analyst',
    description: 'Global anonymized telemetry, booking throughput, and cross-organization financial analytics.',
    defaultScope: 'GLOBAL',
    isSystem: true,
    permissions: ['dashboard.view', 'analytics.view', 'analytics.export'],
  },

  ORGANIZATION_ADMIN: {
    code: 'ORGANIZATION_ADMIN',
    name: 'Organization Lead Administrator',
    description: 'Full organizational authority over branches, staff, catalog, and finances.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view', 'users.view', 'users.create', 'users.update', 'users.delete',
      'customers.view', 'customers.create', 'customers.update',
      'bookings.view', 'bookings.create', 'bookings.update', 'bookings.cancel',
      'trips.view', 'trips.manage', 'inventory.view', 'payments.view', 'finance.view', 'analytics.view',
    ],
  },

  REGIONAL_MANAGER: {
    code: 'REGIONAL_MANAGER',
    name: 'Regional Operations Director',
    description: 'Multi-branch leadership across geographical zones (e.g., South India, Middle East).',
    defaultScope: 'REGION',
    isSystem: true,
    permissions: [
      'dashboard.view', 'customers.view', 'bookings.view', 'trips.view', 'trips.manage',
      'inventory.view', 'payments.view', 'finance.view', 'analytics.view',
    ],
  },

  SUPPORT_MANAGER: {
    code: 'SUPPORT_MANAGER',
    name: 'Customer Support Lead',
    description: 'Oversight of ticket queues, traveler dispute escalations, and satisfaction SLA telemetry.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view', 'customers.view', 'customers.update', 'bookings.view', 'bookings.update',
      'trips.view', 'trips.update', 'ai.view', 'ai.chat',
    ],
  },

  SALES_AGENT: {
    code: 'SALES_AGENT',
    name: 'Sales Executive',
    description: 'Direct sales desk dealing with inbound customer quotes, lead nurturing, and payment links.',
    defaultScope: 'ASSIGNED',
    isSystem: true,
    permissions: [
      'dashboard.view', 'customers.view', 'customers.create', 'customers.update',
      'leads.view', 'leads.create', 'leads.update', 'bookings.view', 'bookings.create',
      'trips.view', 'itineraries.view', 'itineraries.create', 'offers.view', 'payments.create',
    ],
  },

  OPERATIONS_AGENT: {
    code: 'OPERATIONS_AGENT',
    name: 'Operations Dispatch Executive',
    description: 'Fulfillment execution for ticket issuance, hotel voucher generation, and transfer assignments.',
    defaultScope: 'ASSIGNED',
    isSystem: true,
    permissions: [
      'dashboard.view', 'bookings.view', 'bookings.update', 'trips.view', 'trips.update',
      'itineraries.view', 'inventory.view', 'sync.view',
    ],
  },

  FINANCE_EXECUTIVE: {
    code: 'FINANCE_EXECUTIVE',
    name: 'Accounts Executive',
    description: 'Daily cash collections, bank statement reconciliation, GST invoice tagging, and credit notes.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view', 'payments.view', 'payments.verify', 'finance.view', 'accounting.view',
      'settlements.view', 'analytics.view',
    ],
  },

  CONTENT_EDITOR: {
    code: 'CONTENT_EDITOR',
    name: 'Editorial Copywriter & Creator',
    description: 'Authoring travel stories, SEO destination articles, and curated itineraries.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'content.view', 'content.create', 'content.update', 'offers.view',
      'vibe.view', 'vibe.create', 'vibe.edit', 'places.manage',
    ],
  },

  MARKETING_EXECUTIVE: {
    code: 'MARKETING_EXECUTIVE',
    name: 'Growth & Social Campaigner',
    description: 'Creation and distribution of holiday deals, WhatsApp broadcasts, and coupon campaigns.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view', 'offers.view', 'offers.create', 'marketing.view', 'marketing.create',
      'analytics.view',
    ],
  },

  VENDOR_MANAGER: {
    code: 'VENDOR_MANAGER',
    name: 'Vendor General Manager',
    description: 'Supplier leadership managing catalog products, rate sheets, contracts, and booking confirmations.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view', 'vendors.view', 'vendors.update', 'inventory.view', 'inventory.create',
      'inventory.update', 'inventory.publish', 'bookings.view', 'settlements.view', 'analytics.view',
    ],
  },

  VENDOR_FINANCE: {
    code: 'VENDOR_FINANCE',
    name: 'Vendor Finance Officer',
    description: 'Inspection of supplier payable statements, commission deductions, bank reconciliations, and payout invoices.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view', 'settlements.view', 'payments.view', 'finance.view', 'analytics.view',
    ],
  },

  VENDOR_CONTENT: {
    code: 'VENDOR_CONTENT',
    name: 'Vendor Media & Catalog Specialist',
    description: 'Upload of property photos, room descriptions, amenity badges, and experience departure schedules.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view', 'inventory.view', 'inventory.update', 'content.view', 'content.create',
    ],
  },

  PARTNER_ADMIN: {
    code: 'PARTNER_ADMIN',
    name: 'B2B Partner Agency Principal',
    description: 'Agency principal with authority to configure white-label branding, credit limits, and sub-agent seats.',
    defaultScope: 'ORGANIZATION',
    isSystem: true,
    permissions: [
      'dashboard.view', 'customers.view', 'customers.create', 'bookings.view', 'bookings.create',
      'bookings.update', 'trips.view', 'inventory.view', 'offers.view', 'payments.create', 'analytics.view',
    ],
  },

  PARTNER_AGENT: {
    code: 'PARTNER_AGENT',
    name: 'B2B Partner Sub-Agent',
    description: 'Partner retail desk consultant creating custom client proposals with partner agency markups.',
    defaultScope: 'ASSIGNED',
    isSystem: true,
    permissions: [
      'dashboard.view', 'customers.view', 'customers.create', 'bookings.view', 'bookings.create',
      'trips.view', 'offers.view', 'payments.create',
    ],
  },

  DMC_USER: {
    code: 'DMC_USER',
    name: 'Destination Management Company Specialist',
    description: 'In-destination ground handler coordinating ground transport, local guides, and airport transfers.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view', 'inventory.view', 'inventory.update', 'bookings.view',
    ],
  },

  HOTEL_USER: {
    code: 'HOTEL_USER',
    name: 'Hotel Reservations Agent',
    description: 'Property front desk receiving confirmed room vouchers, guest arrival notes, and meal plan instructions.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view', 'inventory.view', 'inventory.update', 'bookings.view',
    ],
  },

  TRANSPORT_OPERATOR: {
    code: 'TRANSPORT_OPERATOR',
    name: 'Transport & Fleet Controller',
    description: 'Vehicle fleet management, driver manifest assignment, and arrival pickup dispatch.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view', 'inventory.view', 'inventory.update', 'bookings.view',
    ],
  },

  EXPERIENCE_PROVIDER: {
    code: 'EXPERIENCE_PROVIDER',
    name: 'Tours & Experiences Host',
    description: 'Host for guided trekking, diving, safaris, and cooking masterclasses managing participant slots.',
    defaultScope: 'OWN_VENDOR',
    isSystem: true,
    permissions: [
      'dashboard.view', 'inventory.view', 'inventory.update', 'bookings.view',
    ],
  },
};
