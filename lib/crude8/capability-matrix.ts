/**
 * CRUDE8: COMPLETE CRUD CAPABILITY MATRIX
 * The "WHAT" governance layer on top of the "HOW" engine.
 * For every entity: pages, CRUD actions, bulk actions, workflow actions,
 * permissions, events, automations, AI actions, reports, and sync rules.
 *
 * DOCTRINE: DEFINE ONCE. GENERATE EVERYWHERE.
 */

import {
  CRUDEntityName,
  CRUDE8Module,
  UniversalActionType,
  CRUDActionType,
  UNIVERSAL_ACTION_TYPES,
  EntityCapabilityProfile,
  PageRouteBinding,
  AutomationRuleDefinition,
  SyncRuleDefinition
} from './types';
import { UniversalEntityRegistry } from './entity-registry';

interface CapabilitySpec {
  displayName: string;
  pages: PageRouteBinding[];
  bulkActions: UniversalActionType[];
  workflowActions: UniversalActionType[];
  extendedPermissions: Partial<Record<UniversalActionType, string[]>>;
  actionEvents: Partial<Record<UniversalActionType, string>>;
  automations: AutomationRuleDefinition[];
  aiActions: string[];
  reports: string[];
  lifecycleField: string;
  lifecycleTransitions: Partial<Record<UniversalActionType, string>>;
  assigneeField?: string;
  extraSyncRules?: SyncRuleDefinition[];
}

const BASE_CRUD: CRUDActionType[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

function defineCapability(entityName: CRUDEntityName, spec: CapabilitySpec): EntityCapabilityProfile {
  const schema = UniversalEntityRegistry.getSchema(entityName);
  if (!schema) {
    throw new Error(`CRUDE8 Capability Matrix: entity '${entityName}' has no UniversalEntitySchema. Register it first.`);
  }

  // Runtime loop below validates every declared action has roles before the profile is used.
  const actionPermissions = {
    CREATE: schema.permissions.createRoles,
    READ: schema.permissions.readRoles,
    UPDATE: schema.permissions.updateRoles,
    DELETE: schema.permissions.deleteRoles,
    ...spec.extendedPermissions
  } as Record<UniversalActionType, string[]>;

  const declared = [...BASE_CRUD, ...spec.bulkActions, ...spec.workflowActions];
  for (const action of declared) {
    if (!UNIVERSAL_ACTION_TYPES.includes(action)) {
      throw new Error(`CRUDE8 Capability Matrix: '${action}' on '${entityName}' is not a universal action type.`);
    }
    if (!actionPermissions[action] || actionPermissions[action].length === 0) {
      throw new Error(`CRUDE8 Capability Matrix: action '${action}' on '${entityName}' has no permission roles.`);
    }
  }
  if ((spec.workflowActions.includes('ASSIGN') || spec.workflowActions.includes('TRANSFER')) && !spec.assigneeField) {
    throw new Error(`CRUDE8 Capability Matrix: '${entityName}' declares ASSIGN/TRANSFER without an assigneeField.`);
  }

  const events = Array.from(new Set([
    schema.events.onCreatedEvent,
    schema.events.onUpdatedEvent,
    schema.events.onDeletedEvent,
    ...Object.values(spec.actionEvents)
  ]));

  const syncRules: SyncRuleDefinition[] = [
    ...schema.events.syncTargets.map<SyncRuleDefinition>(target => ({
      target,
      trigger: 'ON_ENTITY_EVENT',
      mode: 'REALTIME'
    })),
    ...(spec.extraSyncRules || [])
  ];

  return {
    entityId: schema.entityId,
    entityName,
    module: schema.module as CRUDE8Module,
    displayName: spec.displayName,
    pages: spec.pages,
    crudActions: BASE_CRUD,
    bulkActions: spec.bulkActions,
    workflowActions: spec.workflowActions,
    actionPermissions,
    events,
    actionEvents: spec.actionEvents,
    automations: spec.automations,
    aiActions: spec.aiActions,
    reports: spec.reports,
    syncRules,
    lifecycleField: spec.lifecycleField,
    lifecycleTransitions: spec.lifecycleTransitions,
    assigneeField: spec.assigneeField
  };
}

// ==========================================
// CRUD CAPABILITY MATRIX — ALL MODULES
// ==========================================

export const CRUD_CAPABILITY_MATRIX: Record<CRUDEntityName, EntityCapabilityProfile> = {

  // ---------- 1. USER MANAGEMENT ----------
  User: defineCapability('User', {
    displayName: 'User & Access Management',
    pages: [
      { route: '/admin/users', view: 'LIST' },
      { route: '/admin/users/:id', view: 'DETAIL' },
      { route: '/admin/users/create', view: 'CREATE' }
    ],
    bulkActions: ['EXPORT', 'ASSIGN', 'DELETE', 'SYNC'],
    workflowActions: ['ASSIGN', 'TRANSFER', 'RESTORE', 'ARCHIVE', 'VERSION', 'AUTOMATE'],
    extendedPermissions: {
      ASSIGN: ['SUPER_ADMIN', 'ORG_ADMIN'],
      TRANSFER: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      ASSIGN: 'USER_ROLE_CHANGED',
      TRANSFER: 'USER_WORKSPACE_TRANSFERRED',
      RESTORE: 'USER_REACTIVATED',
      ARCHIVE: 'USER_DISABLED',
      DELETE: 'USER_DEACTIVATED'
    },
    automations: [
      { automationId: 'usr-auto-offboard', name: 'Auto-Offboard Disabled Users', trigger: 'USER_DISABLED', actions: ['TERMINATE_SESSIONS', 'REVOKE_TOKENS', 'NOTIFY_ORG_ADMIN'] },
      { automationId: 'usr-auto-mfa-remind', name: 'MFA Enrollment Reminder', trigger: 'USER_CREATED +24h without MFA', actions: ['SEND_EMAIL', 'CREATE_TASK'] }
    ],
    aiActions: ['Suggest Role From Activity', 'Anomaly Detect Login Patterns'],
    reports: ['Active Users By Role', 'Login Frequency Heatmap', 'MFA Adoption Rate'],
    lifecycleField: 'status',
    lifecycleTransitions: { RESTORE: 'ACTIVE', ARCHIVE: 'DELETED' },
    assigneeField: 'role'
  }),

  Tenant: defineCapability('Tenant', {
    displayName: 'Organization / Tenant Management',
    pages: [
      { route: '/admin/tenants', view: 'LIST' },
      { route: '/admin/tenants/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['ARCHIVE', 'RESTORE', 'PUBLISH', 'UNPUBLISH', 'VERSION', 'ROLLBACK', 'ANALYZE'],
    extendedPermissions: {
      ARCHIVE: ['SUPER_ADMIN'],
      RESTORE: ['SUPER_ADMIN'],
      PUBLISH: ['SUPER_ADMIN'],
      UNPUBLISH: ['SUPER_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      ARCHIVE: 'TENANT_SUSPENDED',
      RESTORE: 'TENANT_ACTIVATED',
      PUBLISH: 'TENANT_ACTIVATED',
      UNPUBLISH: 'TENANT_SUSPENDED'
    },
    automations: [
      { automationId: 'tn-auto-plan-enforce', name: 'Plan Limit Enforcement', trigger: 'USAGE_EXCEEDS_PLAN_LIMIT', actions: ['NOTIFY_ORG_ADMIN', 'THROTTLE_WORKLOAD'] },
      { automationId: 'tn-auto-billing-retry', name: 'Billing Dunning Retry', trigger: 'INVOICE_PAYMENT_FAILED', actions: ['RETRY_PAYMENT', 'SEND_EMAIL'] }
    ],
    aiActions: ['Usage Anomaly Detection', 'Plan Upgrade Propensity'],
    reports: ['Tenant Usage Summary', 'Plan Distribution', 'Active Vs Suspended Tenants'],
    lifecycleField: 'status',
    lifecycleTransitions: { PUBLISH: 'ACTIVE', UNPUBLISH: 'SUSPENDED', ARCHIVE: 'SUSPENDED', RESTORE: 'ACTIVE' }
  }),

  // ---------- 3. CRM MODULE ----------
  Lead: defineCapability('Lead', {
    displayName: 'Lead Pipeline',
    pages: [
      { route: '/crm/leads', view: 'LIST' },
      { route: '/crm/leads/:id', view: 'DETAIL' }
    ],
    bulkActions: ['ASSIGN', 'EXPORT', 'IMPORT', 'ARCHIVE', 'DELETE', 'SYNC', 'SHARE'],
    workflowActions: ['ASSIGN', 'APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'GENERATE', 'ANALYZE', 'AUTOMATE'],
    extendedPermissions: {
      ASSIGN: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      ASSIGN: 'LEAD_ASSIGNED',
      APPROVE: 'LEAD_QUALIFIED',
      REJECT: 'LEAD_LOST',
      RESTORE: 'LEAD_REOPENED'
    },
    automations: [
      { automationId: 'lead-auto-route', name: 'Round-Robin Lead Routing', trigger: 'LEAD_CREATED', actions: ['ASSIGN_OWNER', 'NOTIFY_AGENT', 'CREATE_FOLLOWUP_TASK'] },
      { automationId: 'lead-auto-nurture', name: 'Stale Lead Nurture', trigger: 'NO_ACTIVITY_7_DAYS', actions: ['SEND_WHATSAPP', 'SCHEDULE_CALL'] },
      { automationId: 'lead-auto-convert', name: 'Hot Lead Conversion Nudge', trigger: 'LEAD_SCORE_ABOVE_80', actions: ['NOTIFY_AGENT', 'SUGGEST_PACKAGE'] }
    ],
    aiActions: ['AI Lead Scoring', 'Intent Classification', 'Next-Best-Action Suggest', 'Auto-Draft Outreach'],
    reports: ['Lead Funnel Conversion', 'Source Attribution', 'Agent Leaderboard', 'Response SLA Breach'],
    lifecycleField: 'leadStatus',
    lifecycleTransitions: { APPROVE: 'QUALIFIED', REJECT: 'LOST', ARCHIVE: 'LOST', RESTORE: 'NEW' },
    assigneeField: 'ownerId'
  }),

  Customer: defineCapability('Customer', {
    displayName: 'Customer 360',
    pages: [
      { route: '/crm/customers', view: 'LIST' },
      { route: '/crm/customers/:id', view: 'DETAIL' },
      { route: '/crm/customers/create', view: 'CREATE' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'ARCHIVE', 'RESTORE', 'SHARE', 'SYNC'],
    workflowActions: ['ASSIGN', 'ARCHIVE', 'RESTORE', 'VERSION', 'ROLLBACK', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'AUTOMATE', 'SHARE'],
    extendedPermissions: {
      ASSIGN: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      ASSIGN: 'CUSTOMER_ASSIGNED',
      ARCHIVE: 'CUSTOMER_ARCHIVED',
      RESTORE: 'CUSTOMER_RESTORED'
    },
    automations: [
      { automationId: 'cust-auto-vault', name: 'Vault Provisioning', trigger: 'CUSTOMER_CREATED', actions: ['CREATE_DMS_FOLDER', 'INIT_LOYALTY_LEDGER'] },
      { automationId: 'cust-auto-birthday', name: 'Birthday & Anniversary Delight', trigger: 'SPECIAL_DATE_TODAY', actions: ['SEND_EMAIL', 'ADD_LOYALTY_POINTS'] },
      { automationId: 'cust-auto-winback', name: 'Dormant Customer Win-Back', trigger: 'NO_BOOKING_180_DAYS', actions: ['SEND_OFFER', 'CREATE_CAMPAIGN_TASK'] }
    ],
    aiActions: ['Preference Inference', 'LTV Prediction', 'Churn Risk Scoring', 'Auto-Segment'],
    reports: ['Customer 360 Snapshot', 'LTV By Tier', 'Segment Distribution', 'Repeat Booking Rate'],
    lifecycleField: 'status',
    lifecycleTransitions: { ARCHIVE: 'ARCHIVED', RESTORE: 'ACTIVE' },
    assigneeField: 'ownerId'
  }),

  Enquiry: defineCapability('Enquiry', {
    displayName: 'Enquiry Desk',
    pages: [
      { route: '/crm/enquiries', view: 'LIST' },
      { route: '/crm/enquiries/:id', view: 'DETAIL' }
    ],
    bulkActions: ['ASSIGN', 'EXPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['ASSIGN', 'APPROVE', 'REJECT', 'GENERATE', 'ARCHIVE', 'RESTORE', 'AUTOMATE'],
    extendedPermissions: {
      ASSIGN: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      ASSIGN: 'ENQUIRY_ASSIGNED',
      APPROVE: 'ENQUIRY_CONVERTED',
      REJECT: 'ENQUIRY_REJECTED',
      RESTORE: 'ENQUIRY_REOPENED'
    },
    automations: [
      { automationId: 'enq-auto-first-response', name: 'First Response SLA', trigger: 'ENQUIRY_RECEIVED', actions: ['ASSIGN_AGENT', 'START_SLA_TIMER', 'SEND_ACK_EMAIL'] },
      { automationId: 'enq-auto-quote-draft', name: 'AI Quote Drafter', trigger: 'ENQUIRY_ASSIGNED', actions: ['DRAFT_PACKAGE', 'DRAFT_QUOTE', 'NOTIFY_AGENT'] }
    ],
    aiActions: ['Auto-Draft Itinerary', 'Price Estimation', 'Sentiment Triage'],
    reports: ['Enquiry SLA Performance', 'Destination Demand Heatmap', 'Conversion By Channel'],
    lifecycleField: 'enquiryStatus',
    lifecycleTransitions: { APPROVE: 'CONVERTED', REJECT: 'REJECTED', ARCHIVE: 'CLOSED', RESTORE: 'OPEN' },
    assigneeField: 'assignedAgentId'
  }),

  // ---------- 4. VOYAGE8 JOURNEY ENGINE ----------
  Journey: defineCapability('Journey', {
    displayName: 'Living Journey Studio',
    pages: [
      { route: '/admin/journey-studio', view: 'LIST' },
      { route: '/admin/journey-studio/:id', view: 'EDIT' },
      { route: '/journeys/:slug', view: 'DETAIL' }
    ],
    bulkActions: ['PUBLISH', 'UNPUBLISH', 'EXPORT', 'CLONE', 'ARCHIVE', 'SYNC', 'SHARE'],
    workflowActions: ['CLONE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'VERSION', 'ROLLBACK', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'SHARE', 'AUTOMATE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'EXPERIENCE_ARCHITECT'],
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'SALES_AGENT'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'EXPERIENCE_ARCHITECT'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      CLONE: 'JOURNEY_CLONED',
      PUBLISH: 'JOURNEY_PUBLISHED',
      UNPUBLISH: 'JOURNEY_UNPUBLISHED',
      ARCHIVE: 'JOURNEY_DEPRECATED',
      RESTORE: 'JOURNEY_RESTORED'
    },
    automations: [
      { automationId: 'jrn-auto-seo-refresh', name: 'SEO Content Refresh', trigger: 'JOURNEY_PUBLISHED', actions: ['TRIGGER_HESTIA8_AUDIT', 'REGENERATE_META', 'PING_SITEMAP'] },
      { automationId: 'jrn-auto-price-radar', name: 'Competitor Price Radar', trigger: 'DAILY_SCHEDULE', actions: ['FETCH_RATES', 'SUGGEST_PRICE_BAND'] },
      { automationId: 'jrn-auto-doc-pack', name: 'Booking Document Pack', trigger: 'JOURNEY_BOOKED', actions: ['GENERATE_VOUCHER', 'GENERATE_INVOICE', 'UPLOAD_DMS'] }
    ],
    aiActions: ['AI Route Optimizer', 'Day-Plan Generator', 'Multi-Lingual Rewrite', 'Thumbnail Selector'],
    reports: ['Journey Performance Funnel', 'Itinerary Completion Score', 'Revenue Per Journey', 'Publish Lag'],
    lifecycleField: 'status',
    lifecycleTransitions: { PUBLISH: 'PUBLISHED', UNPUBLISH: 'DRAFT', ARCHIVE: 'ARCHIVED', RESTORE: 'DRAFT' }
  }),

  Itinerary: defineCapability('Itinerary', {
    displayName: 'Itinerary Composer',
    pages: [
      { route: '/admin/journey-studio/:id/itinerary', view: 'EDIT' },
      { route: '/itineraries/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'CLONE', 'ARCHIVE', 'SHARE'],
    workflowActions: ['CLONE', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'VERSION', 'ROLLBACK', 'SHARE', 'ARCHIVE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'SALES_AGENT'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'SALES_AGENT', 'EXPERIENCE_ARCHITECT'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'AUDITOR'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      CLONE: 'ITINERARY_DUPLICATED',
      GENERATE: 'ITINERARY_OPTIMIZED',
      SHARE: 'ITINERARY_SHARED'
    },
    automations: [
      { automationId: 'itn-auto-optimize', name: 'AI Route Optimizer', trigger: 'DAY_PLAN_CHANGED', actions: ['REORDER_STOPS', 'RECALCULATE_TRANSIT', 'REVALIDATE_MEALS'] },
      { automationId: 'itn-auto-pdf', name: 'PDF Regeneration', trigger: 'ITINERARY_UPDATED', actions: ['RENDER_PDF', 'UPLOAD_DMS', 'REFRESH_SHARE_LINK'] }
    ],
    aiActions: ['Route Optimization', 'Pacing Balance Check', 'Auto-Translate Day Plans'],
    reports: ['Itinerary Version Timeline', 'Transit Time Budget', 'Meal Coverage Matrix'],
    lifecycleField: 'itineraryStatus',
    lifecycleTransitions: { GENERATE: 'OPTIMIZED', SHARE: 'SHARED', ARCHIVE: 'FINAL' },
    assigneeField: 'ownerId'
  }),

  // ---------- 5. MARKETPLACE ----------
  TourPackage: defineCapability('TourPackage', {
    displayName: 'Marketplace Tour Package',
    pages: [
      { route: '/admin/packages', view: 'LIST' },
      { route: '/admin/packages/:id', view: 'EDIT' },
      { route: '/packages/:slug', view: 'DETAIL' }
    ],
    bulkActions: ['PUBLISH', 'UNPUBLISH', 'EXPORT', 'IMPORT', 'CLONE', 'ARCHIVE', 'SYNC'],
    workflowActions: ['CLONE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'VERSION', 'ROLLBACK', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'AUTOMATE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      CLONE: 'PACKAGE_CLONED',
      PUBLISH: 'PACKAGE_PUBLISHED',
      UNPUBLISH: 'PACKAGE_UNPUBLISHED',
      ARCHIVE: 'PACKAGE_ARCHIVED'
    },
    automations: [
      { automationId: 'pkg-auto-availability', name: 'Availability Sync', trigger: 'PACKAGE_PUBLISHED', actions: ['PUSH_OTA_FEEDS', 'SYNC_INVENTORY', 'UPDATE_CALENDAR'] },
      { automationId: 'pkg-auto-landing', name: 'Landing Page Generator', trigger: 'PACKAGE_PUBLISHED', actions: ['CREATE_VIBE8_PAGE', 'GENERATE_SEO_META', 'BIND_COMPONENTS'] }
    ],
    aiActions: ['Dynamic Pricing Suggestion', 'Package Description Writer', 'Gallery Auto-Curate'],
    reports: ['Package Conversion Rate', 'Price Band Competitiveness', 'Publish Coverage'],
    lifecycleField: 'packageStatus',
    lifecycleTransitions: { PUBLISH: 'PUBLISHED', UNPUBLISH: 'UNPUBLISHED', ARCHIVE: 'ARCHIVED', RESTORE: 'DRAFT' }
  }),

  Booking: defineCapability('Booking', {
    displayName: 'Booking Operations',
    pages: [
      { route: '/operations/bookings', view: 'LIST' },
      { route: '/operations/bookings/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'ASSIGN', 'ARCHIVE', 'SYNC', 'SHARE'],
    workflowActions: ['APPROVE', 'REJECT', 'ASSIGN', 'TRANSFER', 'GENERATE', 'ARCHIVE', 'VERSION', 'ANALYZE', 'AUTOMATE', 'SHARE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE'],
      ASSIGN: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE'],
      TRANSFER: ['SUPER_ADMIN', 'ORG_ADMIN'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE', 'FINANCE_MANAGER', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      APPROVE: 'BOOKING_CONFIRMED',
      REJECT: 'BOOKING_CANCELLED',
      ASSIGN: 'BOOKING_ASSIGNED',
      TRANSFER: 'BOOKING_TRANSFERRED',
      ARCHIVE: 'BOOKING_CANCELLED'
    },
    automations: [
      { automationId: 'bk-auto-confirm-pack', name: 'Confirmation Pack Dispatch', trigger: 'BOOKING_CONFIRMED', actions: ['GENERATE_VOUCHER', 'GENERATE_INVOICE', 'SEND_WHATSAPP', 'CREATE_TMS_DISPATCH'] },
      { automationId: 'bk-auto-pretravel', name: 'Pre-Travel Readiness Radar', trigger: 'T_MINUS_7_DAYS', actions: ['CHECK_DOCUMENTS', 'CHECK_PAYMENTS', 'NOTIFY_OPS'] },
      { automationId: 'bk-auto-cancel-chain', name: 'Cancellation Cascade', trigger: 'BOOKING_CANCELLED', actions: ['RELEASE_INVENTORY', 'REFUND_QUEUE', 'NOTIFY_SUPPLIERS'] }
    ],
    aiActions: ['Amendment Risk Prediction', 'Upsell Suggestion', 'No-Show Risk Score'],
    reports: ['Booking Status Board', 'Payment Clearance Aging', 'Ops Readiness Score', 'Cancellation Reasons'],
    lifecycleField: 'bookingStatus',
    lifecycleTransitions: { APPROVE: 'CONFIRMED', REJECT: 'CANCELLED', ARCHIVE: 'CANCELLED' },
    assigneeField: 'opsOwnerId'
  }),

  // ---------- 6. SUPPLIER MANAGEMENT ----------
  Supplier: defineCapability('Supplier', {
    displayName: 'Supplier Network',
    pages: [
      { route: '/admin/suppliers', view: 'LIST' },
      { route: '/admin/suppliers/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['APPROVE', 'REJECT', 'ASSIGN', 'ARCHIVE', 'RESTORE', 'ANALYZE', 'VERSION', 'AUTOMATE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      ASSIGN: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      APPROVE: 'SUPPLIER_VERIFIED',
      REJECT: 'SUPPLIER_REJECTED',
      ASSIGN: 'SUPPLIER_ASSIGNED',
      ARCHIVE: 'SUPPLIER_DEACTIVATED',
      RESTORE: 'SUPPLIER_REACTIVATED'
    },
    automations: [
      { automationId: 'sup-auto-score', name: 'Reliability Scoring', trigger: 'WEEKLY_SCHEDULE', actions: ['COMPUTE_OTD_RATE', 'COMPUTE_COMPLAINT_RATE', 'UPDATE_RATING'] },
      { automationId: 'sup-auto-expiry', name: 'Contract Expiry Radar', trigger: 'CONTRACT_60_DAYS_TO_EXPIRY', actions: ['CREATE_RENEWAL_TASK', 'NOTIFY_PROCUREMENT'] }
    ],
    aiActions: ['Supplier Risk Score', 'Rate Benchmarking', 'Duplicate Detection'],
    reports: ['Supplier Scorecard', 'On-Time Delivery Rate', 'Category Spend Analysis'],
    lifecycleField: 'status',
    lifecycleTransitions: { APPROVE: 'ACTIVE', REJECT: 'REJECTED', ARCHIVE: 'INACTIVE', RESTORE: 'ACTIVE' },
    assigneeField: 'accountManagerId'
  }),

  Contract: defineCapability('Contract', {
    displayName: 'Supplier Contracts',
    pages: [
      { route: '/admin/suppliers/contracts', view: 'LIST' },
      { route: '/admin/suppliers/contracts/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'VERSION', 'GENERATE', 'AUTOMATE', 'SHARE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER']
    },
    actionEvents: {
      APPROVE: 'CONTRACT_APPROVED',
      REJECT: 'CONTRACT_REJECTED',
      ARCHIVE: 'CONTRACT_EXPIRED',
      RESTORE: 'CONTRACT_RENEWED'
    },
    automations: [
      { automationId: 'ct-auto-expiry-radar', name: 'Expiry & Renewal Radar', trigger: 'VALID_TO_MINUS_30_DAYS', actions: ['CREATE_RENEWAL_TASK', 'NOTIFY_PROCUREMENT', 'DRAFT_RENEWAL_CONTRACT'] },
      { automationId: 'ct-auto-rate-upload', name: 'Rate Card Ingest', trigger: 'CONTRACT_APPROVED', actions: ['PARSE_RATE_CARD', 'PUSH_TO_SEARCH_PRICING'] }
    ],
    aiActions: ['Contract Clause Review', 'Rate Anomaly Detection'],
    reports: ['Contract Expiry Calendar', 'Rate Coverage By Service', 'Approval Cycle Time'],
    lifecycleField: 'contractStatus',
    lifecycleTransitions: { APPROVE: 'ACTIVE', REJECT: 'REJECTED', ARCHIVE: 'EXPIRED', RESTORE: 'ACTIVE' }
  }),

  // ---------- 7. DMS8 ----------
  Document: defineCapability('Document', {
    displayName: 'DMS8 Travel Vault',
    pages: [
      { route: '/admin/dms', view: 'LIST' },
      { route: '/admin/dms/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'DELETE', 'SYNC', 'SHARE'],
    workflowActions: ['APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'GENERATE', 'ANALYZE', 'AUTOMATE', 'SHARE', 'VERSION'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER', 'OPS_EXECUTIVE'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR']
    },
    actionEvents: {
      APPROVE: 'DOCUMENT_APPROVED',
      REJECT: 'DOCUMENT_REJECTED',
      ARCHIVE: 'DOCUMENT_ARCHIVED',
      RESTORE: 'DOCUMENT_RESTORED'
    },
    automations: [
      { automationId: 'doc-auto-ocr', name: 'OCR & Classification', trigger: 'DOCUMENT_UPLOADED', actions: ['RUN_OCR', 'EXTRACT_DATA', 'CLASSIFY_TYPE', 'REQUEST_REVIEW'] },
      { automationId: 'doc-auto-expiry', name: 'Expiry Radar', trigger: 'DOCUMENT_EXPIRY_90_DAYS', actions: ['NOTIFY_CUSTOMER', 'CREATE_TASK', 'FLAG_BOOKING_RISK'] }
    ],
    aiActions: ['OCR Data Extraction', 'Auto-Classification', 'Compliance Summary', 'Fraud Signal Detection'],
    reports: ['Vault Storage Breakdown', 'Document Expiry Radar', 'Verification Backlog'],
    lifecycleField: 'verificationStatus',
    lifecycleTransitions: { APPROVE: 'VERIFIED', REJECT: 'REJECTED', ARCHIVE: 'ARCHIVED' }
  }),

  DocumentTemplate: defineCapability('DocumentTemplate', {
    displayName: 'Document Template Studio',
    pages: [
      { route: '/admin/dms/templates', view: 'LIST' },
      { route: '/admin/dms/templates/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'CLONE', 'ARCHIVE'],
    workflowActions: ['CLONE', 'PUBLISH', 'UNPUBLISH', 'VERSION', 'ROLLBACK', 'GENERATE', 'ARCHIVE', 'RESTORE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR']
    },
    actionEvents: {
      CLONE: 'TEMPLATE_CLONED',
      PUBLISH: 'TEMPLATE_PUBLISHED',
      UNPUBLISH: 'TEMPLATE_UNPUBLISHED',
      GENERATE: 'TEMPLATE_DOCUMENT_GENERATED'
    },
    automations: [
      { automationId: 'tpl-auto-version', name: 'Publish Version Pinning', trigger: 'TEMPLATE_PUBLISHED', actions: ['SNAPSHOT_VERSION', 'FREEZE_VARIABLES', 'NOTIFY_CONSUMERS'] }
    ],
    aiActions: ['Variable Suggestion', 'Body Draft From Sample'],
    reports: ['Template Usage Frequency', 'Generation Failure Rate'],
    lifecycleField: 'templateStatus',
    lifecycleTransitions: { PUBLISH: 'PUBLISHED', UNPUBLISH: 'DRAFT', ARCHIVE: 'ARCHIVED', RESTORE: 'DRAFT' }
  }),

  // ---------- 8. VIBE8 CMS ----------
  Page: defineCapability('Page', {
    displayName: 'VIBE8 CMS Pages',
    pages: [
      { route: '/admin/cms', view: 'LIST' },
      { route: '/admin/cms/:id', view: 'EDIT' },
      { route: '/:slug', view: 'DETAIL' }
    ],
    bulkActions: ['PUBLISH', 'UNPUBLISH', 'EXPORT', 'CLONE', 'ARCHIVE', 'SYNC'],
    workflowActions: ['CLONE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'VERSION', 'ROLLBACK', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'AUTOMATE', 'SHARE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR', 'CONTENT_CREATOR'],
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR', 'CONTENT_CREATOR'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR']
    },
    actionEvents: {
      CLONE: 'PAGE_CLONED',
      PUBLISH: 'PAGE_PUBLISHED',
      UNPUBLISH: 'PAGE_UNPUBLISHED',
      ARCHIVE: 'PAGE_ARCHIVED'
    },
    automations: [
      { automationId: 'page-auto-seo', name: 'SEO Optimize On Publish', trigger: 'PAGE_PUBLISHED', actions: ['GENERATE_SCHEMA', 'OPTIMIZE_META', 'PING_INDEXNOW'] },
      { automationId: 'page-auto-abtest', name: 'A/B Hero Rotation', trigger: 'PAGE_PUBLISHED + TRAFFIC', actions: ['SPLIT_TRAFFIC', 'TRACK_CONVERSION', 'PROMOTE_WINNER'] }
    ],
    aiActions: ['AI Content Generation', 'SEO Optimization Pass', 'Auto-Translate', 'Layout Suggestion'],
    reports: ['Page Traffic & Conversion', 'Publish Pipeline Status', 'Translation Coverage'],
    lifecycleField: 'pageStatus',
    lifecycleTransitions: { PUBLISH: 'PUBLISHED', UNPUBLISH: 'UNPUBLISHED', ARCHIVE: 'ARCHIVED', RESTORE: 'DRAFT' }
  }),

  Component: defineCapability('Component', {
    displayName: 'VIBE8 Components',
    pages: [
      { route: '/admin/cms', view: 'EMBEDDED' },
      { route: '/admin/builder', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'CLONE', 'ARCHIVE'],
    workflowActions: ['CLONE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'VERSION', 'RESTORE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR']
    },
    actionEvents: {
      CLONE: 'COMPONENT_CLONED',
      PUBLISH: 'COMPONENT_PUBLISHED',
      UNPUBLISH: 'COMPONENT_UNPUBLISHED',
      ARCHIVE: 'COMPONENT_ARCHIVED'
    },
    automations: [
      { automationId: 'cmp-auto-binding-check', name: 'Data Binding Validator', trigger: 'COMPONENT_UPDATED', actions: ['VALIDATE_BINDINGS', 'BLOCK_BROKEN_PUBLISH'] }
    ],
    aiActions: ['Prop Suggestion', 'Variant Generator'],
    reports: ['Component Reuse Heatmap', 'Broken Binding Incidents'],
    lifecycleField: 'componentStatus',
    lifecycleTransitions: { PUBLISH: 'ACTIVE', UNPUBLISH: 'INACTIVE', ARCHIVE: 'ARCHIVED', RESTORE: 'ACTIVE' }
  }),

  // ---------- 9. HESTIA8 SEO ----------
  SeoProject: defineCapability('SeoProject', {
    displayName: 'HESTIA8 SEO Projects',
    pages: [
      { route: '/admin/seo', view: 'LIST' },
      { route: '/admin/seo/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['ARCHIVE', 'RESTORE', 'GENERATE', 'ANALYZE', 'AUTOMATE', 'VERSION'],
    extendedPermissions: {
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR']
    },
    actionEvents: {
      ARCHIVE: 'SEO_PROJECT_ARCHIVED',
      RESTORE: 'SEO_PROJECT_RESTORED',
      GENERATE: 'SEO_STRATEGY_GENERATED'
    },
    automations: [
      { automationId: 'seo-auto-audit', name: 'Weekly Technical Audit', trigger: 'WEEKLY_SCHEDULE', actions: ['CRAWL_SITE', 'COMPUTE_SCORES', 'CREATE_FIX_TASKS'] },
      { automationId: 'seo-auto-rank-track', name: 'Rank Tracking', trigger: 'DAILY_SCHEDULE', actions: ['FETCH_SERPS', 'UPDATE_KEYWORDS', 'ALERT_MOVEMENTS'] }
    ],
    aiActions: ['Keyword Research', 'Strategy Generation', 'Content Gap Analysis'],
    reports: ['Audit Score Trend', 'Keyword Visibility Share', 'Technical Issue Backlog'],
    lifecycleField: 'projectStatus',
    lifecycleTransitions: { ARCHIVE: 'ARCHIVED', RESTORE: 'ACTIVE' }
  }),

  Keyword: defineCapability('Keyword', {
    displayName: 'Keyword Universe',
    pages: [
      { route: '/admin/seo', view: 'EMBEDDED' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'DELETE'],
    workflowActions: ['ASSIGN', 'GENERATE', 'ANALYZE', 'AUTOMATE'],
    extendedPermissions: {
      ASSIGN: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'CONTENT_CREATOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      ASSIGN: 'KEYWORD_ASSIGNED_TO_CONTENT',
      GENERATE: 'KEYWORD_ARTICLE_GENERATED'
    },
    automations: [
      { automationId: 'kw-auto-track', name: 'Daily Rank Pull', trigger: 'DAILY_SCHEDULE', actions: ['FETCH_SERP', 'UPDATE_CURRENT_RANK', 'FLAG_MOVERS'] },
      { automationId: 'kw-auto-brief', name: 'AI Content Brief', trigger: 'KEYWORD_ADDED', actions: ['ANALYZE_SERP', 'DRAFT_BRIEF', 'LINK_TO_PROJECT'] }
    ],
    aiActions: ['Competition Analysis', 'Content Brief Generation', 'Clustering'],
    reports: ['Rank Movement Chart', 'Volume Vs Difficulty Quadrant', 'Assigned Content Coverage'],
    lifecycleField: 'currentRank',
    lifecycleTransitions: {},
    assigneeField: 'assignedContentId'
  }),

  SeoContent: defineCapability('SeoContent', {
    displayName: 'SEO Content Assets',
    pages: [
      { route: '/admin/seo', view: 'EMBEDDED' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE'],
    workflowActions: ['APPROVE', 'REJECT', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'VERSION', 'RESTORE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR']
    },
    actionEvents: {
      APPROVE: 'SEO_CONTENT_APPROVED',
      REJECT: 'SEO_CONTENT_REJECTED',
      PUBLISH: 'SEO_CONTENT_PUBLISHED',
      UNPUBLISH: 'SEO_CONTENT_UNPUBLISHED'
    },
    automations: [
      { automationId: 'sc-auto-optimize', name: 'AI Optimization Pass', trigger: 'SEO_CONTENT_CREATED', actions: ['SCORE_READABILITY', 'SUGGEST_INTERNAL_LINKS', 'GENERATE_SCHEMA'] }
    ],
    aiActions: ['AI Rewrite', 'Schema Generation', 'Internal Link Suggestions', 'Translate'],
    reports: ['Content Score Distribution', 'Publish Velocity', 'Keyword Alignment'],
    lifecycleField: 'contentStatus',
    lifecycleTransitions: {
      APPROVE: 'APPROVED', REJECT: 'DRAFT', PUBLISH: 'PUBLISHED', UNPUBLISH: 'APPROVED', ARCHIVE: 'ARCHIVED', RESTORE: 'DRAFT'
    }
  }),

  // ---------- 10. SOCIAL8 ----------
  TravelCircle: defineCapability('TravelCircle', {
    displayName: 'Social8 Travel Circles',
    pages: [
      { route: '/circles', view: 'LIST' },
      { route: '/circles/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE'],
    workflowActions: ['APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'ANALYZE', 'AUTOMATE', 'SHARE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE']
    },
    actionEvents: {
      APPROVE: 'CIRCLE_MEMBER_APPROVED',
      REJECT: 'CIRCLE_MEMBER_REJECTED',
      ARCHIVE: 'CIRCLE_ARCHIVED',
      RESTORE: 'CIRCLE_RESTORED'
    },
    automations: [
      { automationId: 'cir-auto-welcome', name: 'Member Welcome Flow', trigger: 'CIRCLE_MEMBER_APPROVED', actions: ['SEND_WELCOME_MESSAGE', 'SUGGEST_DISCUSSIONS'] },
      { automationId: 'cir-auto-digest', name: 'Weekly Circle Digest', trigger: 'WEEKLY_SCHEDULE', actions: ['COMPOSE_DIGEST', 'SEND_EMAIL'] }
    ],
    aiActions: ['Topic Suggestions', 'Moderation Pre-Screen'],
    reports: ['Circle Growth Chart', 'Engagement By Topic', 'Moderation Load'],
    lifecycleField: 'circleStatus',
    lifecycleTransitions: { ARCHIVE: 'ARCHIVED', RESTORE: 'ACTIVE' }
  }),

  Discussion: defineCapability('Discussion', {
    displayName: 'Circle Discussions',
    pages: [
      { route: '/circles/:id', view: 'EMBEDDED' }
    ],
    bulkActions: ['DELETE', 'ARCHIVE'],
    workflowActions: ['APPROVE', 'REJECT', 'ARCHIVE', 'AUTOMATE', 'SHARE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE']
    },
    actionEvents: {
      APPROVE: 'DISCUSSION_RESTORED_VISIBLE',
      REJECT: 'DISCUSSION_HIDDEN',
      ARCHIVE: 'DISCUSSION_REMOVED'
    },
    automations: [
      { automationId: 'disc-auto-moderate', name: 'AI Moderation Screen', trigger: 'DISCUSSION_CREATED', actions: ['CLASSIFY_CONTENT', 'FLAG_IF_RISKY', 'QUEUE_REVIEW'] }
    ],
    aiActions: ['Toxicity Detection', 'Auto-Reply Suggestions', 'Trend Summary'],
    reports: ['Moderation Queue Aging', 'Reported Content Rate'],
    lifecycleField: 'moderationStatus',
    lifecycleTransitions: { APPROVE: 'VISIBLE', REJECT: 'HIDDEN', ARCHIVE: 'REMOVED' }
  }),

  // ---------- 11. GEM8 DISCOVERY ----------
  Place: defineCapability('Place', {
    displayName: 'GEM8 Discovery Places',
    pages: [
      { route: '/admin/places', view: 'LIST' },
      { route: '/admin/places/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'ANALYZE', 'AUTOMATE', 'SHARE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT']
    },
    actionEvents: {
      APPROVE: 'PLACE_VERIFIED',
      REJECT: 'PLACE_REJECTED',
      ARCHIVE: 'PLACE_ARCHIVED',
      RESTORE: 'PLACE_RESTORED'
    },
    automations: [
      { automationId: 'plc-auto-enrich', name: 'Media & Geo Enrichment', trigger: 'PLACE_CREATED', actions: ['FETCH_PHOTOS', 'VALIDATE_COORDINATES', 'ATTACH_EXPERIENCES'] },
      { automationId: 'plc-auto-recommend', name: 'Recommendation Feed', trigger: 'PLACE_VERIFIED', actions: ['INDEX_TO_SEARCH', 'FEED_AI_MATCHER'] }
    ],
    aiActions: ['Image Curation', 'Duplicate Detection', 'Popularity Forecast'],
    reports: ['Places By Category Map', 'Verification Funnel', 'Recommendation CTR'],
    lifecycleField: 'verificationStatus',
    lifecycleTransitions: { APPROVE: 'VERIFIED', REJECT: 'REJECTED', ARCHIVE: 'ARCHIVED', RESTORE: 'PENDING' }
  }),

  // ---------- 12. FINANCE / ACCOUNTING ----------
  Invoice: defineCapability('Invoice', {
    displayName: 'Invoice & Receivables',
    pages: [
      { route: '/finance/invoices', view: 'LIST' },
      { route: '/finance/invoices/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'SYNC', 'SHARE'],
    workflowActions: ['APPROVE', 'REJECT', 'GENERATE', 'ARCHIVE', 'SHARE', 'ANALYZE', 'VERSION', 'AUTOMATE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'FINANCE_MANAGER'],
      REJECT: ['SUPER_ADMIN', 'FINANCE_MANAGER'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
      ARCHIVE: ['SUPER_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER'],
      VERSION: ['SUPER_ADMIN', 'AUDITOR'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      APPROVE: 'INVOICE_ISSUED',
      REJECT: 'INVOICE_VOIDED',
      ARCHIVE: 'INVOICE_VOIDED'
    },
    automations: [
      { automationId: 'inv-auto-send', name: 'Invoice Dispatch', trigger: 'INVOICE_GENERATED', actions: ['RENDER_PDF', 'SEND_EMAIL', 'RECORD_LEDGER'] },
      { automationId: 'inv-auto-dunning', name: 'Dunning Ladder', trigger: 'INVOICE_OVERDUE_7_DAYS', actions: ['SEND_REMINDER', 'ESCALATE_TO_FINANCE'] },
      { automationId: 'inv-auto-reconcile', name: 'Payment Reconciliation', trigger: 'PAYMENT_RECEIVED', actions: ['MATCH_LEDGER', 'UPDATE_STATUS', 'NOTIFY_TMS'] }
    ],
    aiActions: ['GST Validation', 'Cash-Flow Forecast'],
    reports: ['AR Aging Report', 'GST Liability Summary', 'Revenue By Module'],
    lifecycleField: 'status',
    lifecycleTransitions: { APPROVE: 'ISSUED', REJECT: 'VOID', ARCHIVE: 'VOID' }
  }),

  Expense: defineCapability('Expense', {
    displayName: 'Expense Management',
    pages: [
      { route: '/finance/expenses', view: 'LIST' },
      { route: '/finance/expenses/:id', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['APPROVE', 'REJECT', 'ARCHIVE', 'GENERATE', 'ANALYZE', 'AUTOMATE', 'VERSION'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER'],
      ARCHIVE: ['SUPER_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'ACCOUNTANT'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'AUDITOR']
    },
    actionEvents: {
      APPROVE: 'EXPENSE_APPROVED',
      REJECT: 'EXPENSE_REJECTED',
      ARCHIVE: 'EXPENSE_VOIDED'
    },
    automations: [
      { automationId: 'exp-auto-capture', name: 'Receipt Auto-Capture', trigger: 'EXPENSE_RECORDED', actions: ['LINK_DMS_RECEIPT', 'OCR_TOTAL', 'VALIDATE_GST'] },
      { automationId: 'exp-auto-reimburse', name: 'Reimbursement Queue', trigger: 'EXPENSE_APPROVED', actions: ['CREATE_PAYOUT', 'NOTIFY_EMPLOYEE'] }
    ],
    aiActions: ['Category Auto-Assign', 'Duplicate Claim Detection', 'Policy Violation Check'],
    reports: ['Expense By Category', 'Approval Cycle Time', 'Policy Violation Log'],
    lifecycleField: 'expenseStatus',
    lifecycleTransitions: { APPROVE: 'APPROVED', REJECT: 'REJECTED', ARCHIVE: 'REIMBURSED' }
  }),

  // ---------- 13. AI PLATFORM ----------
  AIAgent: defineCapability('AIAgent', {
    displayName: 'AI Agent Platform',
    pages: [
      { route: '/admin/ai/agents', view: 'LIST' },
      { route: '/admin/ai/agents/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE'],
    workflowActions: ['PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'GENERATE', 'ANALYZE', 'AUTOMATE', 'VERSION', 'ROLLBACK', 'SHARE'],
    extendedPermissions: {
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      PUBLISH: 'AI_AGENT_DEPLOYED',
      UNPUBLISH: 'AI_AGENT_UNDEPLOYED',
      ARCHIVE: 'AI_AGENT_DISABLED',
      RESTORE: 'AI_AGENT_RESTORED'
    },
    automations: [
      { automationId: 'ai-auto-eval', name: 'Deployment Eval Gate', trigger: 'AI_AGENT_DEPLOY_REQUESTED', actions: ['RUN_EVAL_SUITE', 'BLOCK_IF_REGRESSED', 'NOTIFY_OWNER'] },
      { automationId: 'ai-auto-monitor', name: 'Drift Monitor', trigger: 'HOURLY_SCHEDULE', actions: ['SCORE_RESPONSES', 'ALERT_ON_DRIFT'] }
    ],
    aiActions: ['Prompt Optimization', 'Eval Suite Generation', 'Knowledge Gap Detection'],
    reports: ['Agent Success Rate', 'Latency Percentiles', 'Token Spend By Agent'],
    lifecycleField: 'agentStatus',
    lifecycleTransitions: { PUBLISH: 'DEPLOYED', UNPUBLISH: 'DISABLED', ARCHIVE: 'DISABLED', RESTORE: 'DRAFT' }
  }),

  // ---------- 14. VO8 / VN8 VOICE SYSTEM ----------
  VoiceCommand: defineCapability('VoiceCommand', {
    displayName: 'VN8 Voice Commands',
    pages: [
      { route: '/voice', view: 'LIST' },
      { route: '/voice/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE'],
    workflowActions: ['PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'GENERATE', 'ANALYZE', 'VERSION', 'ROLLBACK'],
    extendedPermissions: {
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      PUBLISH: 'VOICE_COMMAND_PUBLISHED',
      UNPUBLISH: 'VOICE_COMMAND_DISABLED',
      ARCHIVE: 'VOICE_COMMAND_DISABLED',
      RESTORE: 'VOICE_COMMAND_RESTORED'
    },
    automations: [
      { automationId: 'vc-auto-test', name: 'Phrase Regression Test', trigger: 'VOICE_COMMAND_UPDATED', actions: ['RUN_UTTERANCE_SUITE', 'SCORE_CONFIDENCE', 'BLOCK_LOW_CONFIDENCE_PUBLISH'] }
    ],
    aiActions: ['Phrase Variant Generation', 'Multi-Lingual Expansion', 'Confidence Tuning'],
    reports: ['Command Success Rate', 'Language Coverage Matrix', 'Fallback Rate'],
    lifecycleField: 'commandStatus',
    lifecycleTransitions: { PUBLISH: 'PUBLISHED', UNPUBLISH: 'DISABLED', ARCHIVE: 'DISABLED', RESTORE: 'DRAFT' }
  }),

  // ---------- 15. SAAS CONTROL PLANE ----------
  FeatureFlag: defineCapability('FeatureFlag', {
    displayName: 'Feature Flags',
    pages: [
      { route: '/admin/feature-flags', view: 'LIST' },
      { route: '/admin/feature-flags/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'VERSION', 'ROLLBACK', 'ANALYZE', 'AUTOMATE'],
    extendedPermissions: {
      PUBLISH: ['SUPER_ADMIN'],
      UNPUBLISH: ['SUPER_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      AUTOMATE: ['SUPER_ADMIN']
    },
    actionEvents: {
      PUBLISH: 'FEATURE_FLAG_ENABLED',
      UNPUBLISH: 'FEATURE_FLAG_DISABLED',
      ARCHIVE: 'FEATURE_FLAG_REMOVED'
    },
    automations: [
      { automationId: 'ff-auto-gradual', name: 'Gradual Rollout', trigger: 'FEATURE_FLAG_ENABLED', actions: ['RAMP_10_50_100', 'WATCH_ERROR_RATE', 'AUTO_ROLLBACK_ON_SPIKE'] },
      { automationId: 'ff-auto-cleanup', name: 'Stale Flag Cleanup', trigger: 'FLAG_90_DAYS_STABLE', actions: ['SUGGEST_REMOVAL', 'CREATE_TICKET'] }
    ],
    aiActions: ['Rollout Risk Assessment', 'Usage Impact Forecast'],
    reports: ['Flag Exposure & Conversion', 'Error Rate During Rollout', 'Stale Flag Register'],
    lifecycleField: 'enabled',
    lifecycleTransitions: { PUBLISH: 'TRUE', UNPUBLISH: 'FALSE', ARCHIVE: 'FALSE' }
  }),

  OperationMode: defineCapability('OperationMode', {
    displayName: 'Operation Modes',
    pages: [
      { route: '/admin/operation-modes', view: 'LIST' },
      { route: '/admin/operation-modes/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['CLONE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'VERSION', 'ROLLBACK', 'ANALYZE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN'],
      PUBLISH: ['SUPER_ADMIN'],
      UNPUBLISH: ['SUPER_ADMIN'],
      ARCHIVE: ['SUPER_ADMIN'],
      RESTORE: ['SUPER_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      CLONE: 'OPERATION_MODE_CLONED',
      PUBLISH: 'OPERATION_MODE_ACTIVATED',
      UNPUBLISH: 'OPERATION_MODE_DEACTIVATED',
      ARCHIVE: 'OPERATION_MODE_DISABLED'
    },
    automations: [
      { automationId: 'mode-auto-rollover', name: 'Timed Rollover', trigger: 'SCHEDULED_ROLLOVER_AT', actions: ['ACTIVATE_MODE', 'APPLY_OVERRIDES', 'AUDIT_TRANSITION'] }
    ],
    aiActions: ['Mode Conflict Detection'],
    reports: ['Mode Transition History', 'Override Effectiveness'],
    lifecycleField: 'modeStatus',
    lifecycleTransitions: { PUBLISH: 'ACTIVE', UNPUBLISH: 'DISABLED', ARCHIVE: 'DISABLED', RESTORE: 'DRAFT' }
  }),

  // ---------- CROSS-MODULE CATALOG ENTITIES ----------
  Destination: defineCapability('Destination', {
    displayName: 'Destination Catalog',
    pages: [
      { route: '/admin/destination-studio', view: 'LIST' },
      { route: '/destinations/:slug', view: 'DETAIL' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['ARCHIVE', 'RESTORE', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'VERSION', 'ROLLBACK', 'AUTOMATE'],
    extendedPermissions: {
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN']
    },
    actionEvents: {
      ARCHIVE: 'DESTINATION_ARCHIVED',
      RESTORE: 'DESTINATION_RESTORED'
    },
    automations: [
      { automationId: 'dst-auto-intel', name: 'Destination Intelligence Refresh', trigger: 'DAILY_SCHEDULE', actions: ['FETCH_EVENTS', 'UPDATE_BEST_TIME', 'REFRESH_WEATHER'] }
    ],
    aiActions: ['Content Generation', 'Translation', 'Attraction Gap Analysis'],
    reports: ['Destination Traffic Ranking', 'SEO Score Board', 'Content Freshness'],
    lifecycleField: 'seoScore',
    lifecycleTransitions: {}
  }),

  Experience: defineCapability('Experience', {
    displayName: 'Experience Catalog',
    pages: [
      { route: '/admin/experiences', view: 'LIST' },
      { route: '/admin/experiences/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'ARCHIVE', 'CLONE'],
    workflowActions: ['CLONE', 'ARCHIVE', 'RESTORE', 'GENERATE', 'TRANSLATE', 'ANALYZE'],
    extendedPermissions: {
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EXPERIENCE_ARCHITECT'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EXPERIENCE_ARCHITECT'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD']
    },
    actionEvents: {
      CLONE: 'EXPERIENCE_CLONED',
      ARCHIVE: 'EXPERIENCE_RETIRED',
      RESTORE: 'EXPERIENCE_REACTIVATED'
    },
    automations: [
      { automationId: 'exp-auto-price', name: 'Seasonal Price Adjuster', trigger: 'SEASON_CHANGE', actions: ['APPLY_RATE_BAND', 'SYNC_PACKAGES'] }
    ],
    aiActions: ['Description Writer', 'Photo Ranker'],
    reports: ['Experience Booking Mix', 'Category Popularity'],
    lifecycleField: 'status',
    lifecycleTransitions: { ARCHIVE: 'RETIRED', RESTORE: 'ACTIVE' }
  }),

  Content: defineCapability('Content', {
    displayName: 'Editorial Content',
    pages: [
      { route: '/admin/cms', view: 'LIST' },
      { route: '/admin/cms/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'IMPORT', 'ARCHIVE', 'CLONE', 'SYNC'],
    workflowActions: ['APPROVE', 'REJECT', 'PUBLISH', 'UNPUBLISH', 'CLONE', 'ARCHIVE', 'RESTORE', 'VERSION', 'ROLLBACK', 'GENERATE', 'TRANSLATE', 'ANALYZE'],
    extendedPermissions: {
      APPROVE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      REJECT: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      CLONE: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      IMPORT: ['SUPER_ADMIN', 'ORG_ADMIN'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      ROLLBACK: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      TRANSLATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD']
    },
    actionEvents: {
      APPROVE: 'CONTENT_APPROVED',
      REJECT: 'CONTENT_REJECTED',
      PUBLISH: 'CONTENT_PUBLISHED',
      UNPUBLISH: 'CONTENT_UNPUBLISHED',
      CLONE: 'CONTENT_CLONED',
      ARCHIVE: 'CONTENT_ARCHIVED',
      RESTORE: 'CONTENT_RESTORED'
    },
    automations: [
      { automationId: 'cnt-auto-seo-score', name: 'HESTIA8 Score On Save', trigger: 'CONTENT_UPDATED', actions: ['RESCORE_SEO', 'SUGGEST_FIXES'] },
      { automationId: 'cnt-auto-publish-gate', name: 'Publish Gate', trigger: 'CONTENT_PUBLISH_REQUESTED', actions: ['CHECK_APPROVAL', 'CHECK_SEO_THRESHOLD', 'BLOCK_IF_UNREADY'] }
    ],
    aiActions: ['AI Draft', 'Tone Rewrite', 'Translation', 'AEO Snippet Generator'],
    reports: ['Content Pipeline Funnel', 'SEO Score Distribution', 'Author Throughput'],
    lifecycleField: 'status',
    lifecycleTransitions: {
      APPROVE: 'APPROVED', REJECT: 'DRAFT', PUBLISH: 'PUBLISHED', UNPUBLISH: 'DRAFT', ARCHIVE: 'ARCHIVED', RESTORE: 'DRAFT'
    }
  }),

  Campaign: defineCapability('Campaign', {
    displayName: 'Growth Campaigns',
    pages: [
      { route: '/admin/campaign-studio', view: 'LIST' },
      { route: '/admin/campaign-studio/:id', view: 'EDIT' }
    ],
    bulkActions: ['EXPORT', 'ARCHIVE', 'SYNC'],
    workflowActions: ['PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'GENERATE', 'ANALYZE', 'AUTOMATE', 'VERSION', 'SHARE'],
    extendedPermissions: {
      PUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      UNPUBLISH: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      ARCHIVE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      RESTORE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      EXPORT: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'AUDITOR'],
      SYNC: ['SUPER_ADMIN', 'ORG_ADMIN'],
      GENERATE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      ANALYZE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      AUTOMATE: ['SUPER_ADMIN', 'ORG_ADMIN'],
      VERSION: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
      SHARE: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD']
    },
    actionEvents: {
      PUBLISH: 'CAMPAIGN_LAUNCHED',
      UNPUBLISH: 'CAMPAIGN_PAUSED',
      ARCHIVE: 'CAMPAIGN_STOPPED',
      RESTORE: 'CAMPAIGN_REACTIVATED'
    },
    automations: [
      { automationId: 'cmp-auto-budget', name: 'Budget Guardrail', trigger: 'SPEND_90_PERCENT_BUDGET', actions: ['ALERT_GROWTH_LEAD', 'PAUSE_LOW_ROAS_ADSETS'] },
      { automationId: 'cmp-auto-report', name: 'Weekly ROAS Digest', trigger: 'WEEKLY_SCHEDULE', actions: ['COMPUTE_ROAS', 'EMAIL_DIGEST'] }
    ],
    aiActions: ['Audience Suggestion', 'Creative Copywriter', 'Budget Reallocation'],
    reports: ['Campaign ROAS Board', 'Channel Attribution', 'Budget Burn Rate'],
    lifecycleField: 'status',
    lifecycleTransitions: { PUBLISH: 'ACTIVE', UNPUBLISH: 'PAUSED', ARCHIVE: 'STOPPED', RESTORE: 'ACTIVE' }
  })
};

// ==========================================
// MATRIX ACCESS API
// ==========================================

export class CRUDCapabilityMatrix {
  /**
   * Get the capability profile for an entity
   */
  static getCapability(entity: CRUDEntityName): EntityCapabilityProfile {
    const cap = CRUD_CAPABILITY_MATRIX[entity];
    if (!cap) {
      throw new Error(`CRUDE8 Capability Matrix: No capability profile registered for entity '${entity}'.`);
    }
    return cap;
  }

  /**
   * Check whether an entity supports a universal action
   */
  static supports(entity: CRUDEntityName, action: UniversalActionType): boolean {
    const cap = this.getCapability(entity);
    return (
      cap.crudActions.includes(action as any) ||
      cap.bulkActions.includes(action) ||
      cap.workflowActions.includes(action)
    );
  }

  /**
   * List all supported actions for an entity
   */
  static listActions(entity: CRUDEntityName): UniversalActionType[] {
    const cap = this.getCapability(entity);
    return Array.from(new Set([...cap.crudActions, ...cap.bulkActions, ...cap.workflowActions]));
  }

  /**
   * Group entities by module
   */
  static listModules(): { module: CRUDE8Module; entities: EntityCapabilityProfile[] }[] {
    const grouped = new Map<CRUDE8Module, EntityCapabilityProfile[]>();
    for (const cap of Object.values(CRUD_CAPABILITY_MATRIX)) {
      if (!grouped.has(cap.module)) grouped.set(cap.module, []);
      grouped.get(cap.module)!.push(cap);
    }
    return Array.from(grouped.entries()).map(([module, entities]) => ({ module, entities }));
  }

  /**
   * Platform-wide matrix statistics for the Control Center
   */
  static getMatrixStats() {
    const caps = Object.values(CRUD_CAPABILITY_MATRIX);
    const modules = new Set<CRUDE8Module>();
    const actionCoverage = new Map<UniversalActionType, number>();
    let pageCount = 0;
    let automationCount = 0;
    let aiActionCount = 0;
    let reportCount = 0;
    let syncRuleCount = 0;

    for (const cap of caps) {
      modules.add(cap.module);
      pageCount += cap.pages.length;
      automationCount += cap.automations.length;
      aiActionCount += cap.aiActions.length;
      reportCount += cap.reports.length;
      syncRuleCount += cap.syncRules.length;
      for (const action of this.listActions(cap.entityName)) {
        actionCoverage.set(action, (actionCoverage.get(action) || 0) + 1);
      }
    }

    return {
      totalEntities: caps.length,
      totalModules: modules.size,
      totalPages: pageCount,
      totalAutomations: automationCount,
      totalAiActions: aiActionCount,
      totalReports: reportCount,
      totalSyncRules: syncRuleCount,
      universalActionTypes: UNIVERSAL_ACTION_TYPES.length,
      actionCoverage: Array.from(actionCoverage.entries())
        .map(([action, entityCount]) => ({ action, entityCount }))
        .sort((a, b) => b.entityCount - a.entityCount)
    };
  }

  /**
   * Governance validation — guarantees matrix internal consistency.
   * Fails hard if any entity lacks pages, permissions, or declares unsupported transitions.
   */
  static validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const cap of Object.values(CRUD_CAPABILITY_MATRIX)) {
      const name = cap.entityName;

      if (cap.pages.length === 0) errors.push(`${name}: no pages bound`);
      if (cap.automations.length === 0) errors.push(`${name}: no automations defined`);
      if (cap.reports.length === 0) errors.push(`${name}: no reports defined`);
      if (cap.syncRules.length === 0) errors.push(`${name}: no sync rules defined`);

      for (const action of [...cap.bulkActions, ...cap.workflowActions]) {
        if (!UNIVERSAL_ACTION_TYPES.includes(action)) {
          errors.push(`${name}: unknown action '${action}'`);
        }
        const roles = cap.actionPermissions[action];
        if (!roles || roles.length === 0) {
          errors.push(`${name}: action '${action}' has no permission roles`);
        }
      }

      for (const [action] of Object.entries(cap.lifecycleTransitions)) {
        if (!cap.workflowActions.includes(action as UniversalActionType)) {
          errors.push(`${name}: lifecycle transition '${action}' is not declared in workflowActions`);
        }
      }

      if ((cap.workflowActions.includes('ASSIGN') || cap.workflowActions.includes('TRANSFER')) && !cap.assigneeField) {
        errors.push(`${name}: ASSIGN/TRANSFER declared without assigneeField`);
      }

      const schema = UniversalEntityRegistry.getSchema(name);
      if (schema && !schema.fields.some(f => f.name === cap.lifecycleField)) {
        errors.push(`${name}: lifecycleField '${cap.lifecycleField}' is not a schema field`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
