/**
 * CRUDE8 STUDIO: AI CRUD GENERATOR + TEMPLATE MARKETPLACE
 * Turns a natural-language prompt ("Create customer visa tracking",
 * "Create a hotel supplier CRM") into a complete governed StudioModuleProject:
 * schema, views, actions, workflows, permissions, events, automations,
 * AI actions, reports and sync targets. Also ships the ready-made module
 * template registry for install / customize / clone.
 */

import {
  StudioModuleProject,
  StudioField,
  StudioMode,
  StudioUiSpec,
  StudioFormSection,
  StudioPermissionRule,
  StudioActionDefinition,
  StudioWorkflowDefinition,
  StudioEventDefinition,
  StudioAutomationDefinition,
  StudioTemplateMeta
} from './studio-types';
import { CRUDE8Module, UniversalActionType } from '../types';

// ============================================================
// INTERNAL BUILD HELPERS
// ============================================================

let generatorCounter = 0;

function uid(prefix: string): string {
  generatorCounter += 1;
  return `${prefix}-${Date.now()}-${generatorCounter}-${Math.random().toString(36).substring(2, 6)}`;
}

function f(
  name: string,
  label: string,
  type: StudioField['type'],
  required: boolean = false,
  extra: Partial<StudioField> = {}
): StudioField {
  return { name, label, type, required, ...extra };
}

function buildUi(fields: StudioField[], lifecycleField: string, entityName: string): StudioUiSpec {
  const plainFields = fields.filter(fl => fl.type !== 'RELATION');
  const listColumns = plainFields.slice(0, 6).map(fl => fl.name);
  const selectFilters = fields.filter(fl => fl.type === 'SELECT').map(fl => fl.name);
  const relationFields = fields.filter(fl => fl.type === 'RELATION');
  const hasAmount = fields.find(fl => /amount|price|budget|total|salary|cost/i.test(fl.name));
  const dateField = fields.find(fl => fl.type === 'DATE');

  const formSections: StudioFormSection[] = [
    {
      sectionId: uid('sec'),
      title: 'Core Details',
      layout: 'CARD' as const,
      columns: 2 as const,
      fields: plainFields.slice(0, Math.ceil(plainFields.length / 2)).map(fl => ({ field: fl.name, component: fl.type }))
    },
    {
      sectionId: uid('sec'),
      title: 'Additional Information',
      layout: 'CARD' as const,
      columns: 2 as const,
      fields: plainFields.slice(Math.ceil(plainFields.length / 2)).map(fl => ({ field: fl.name, component: fl.type }))
    }
  ];
  if (relationFields.length > 0) {
    formSections.push({
      sectionId: uid('sec'),
      title: 'Relationships',
      layout: 'PANEL' as const,
      columns: 1 as const,
      fields: relationFields.map(fl => ({ field: fl.name, component: 'RELATION' as const }))
    });
  }

  return {
    listView: {
      type: 'TABLE',
      columns: listColumns.length ? listColumns : ['name'],
      filters: selectFilters.slice(0, 3),
      bulkActions: ['EXPORT', 'ARCHIVE'],
      rowActions: ['UPDATE', 'DELETE']
    },
    formView: { sections: formSections },
    detailView: { layout: 'TABS', widgets: ['FIELDS_GRID', 'ACTIVITY_TIMELINE', 'VERSION_HISTORY', 'RELATED_RECORDS'] },
    dashboard: {
      stats: [
        { label: `Total ${entityName}s`, field: 'id', agg: 'COUNT' },
        ...(hasAmount ? [{ label: `Total ${hasAmount.label}`, field: hasAmount.name, agg: 'SUM' as const }] : []),
        ...(dateField ? [{ label: `${dateField.label} (latest)`, field: dateField.name, agg: 'MAX' as const }] : [])
      ],
      charts: [
        { title: `${entityName}s by ${lifecycleField}`, type: 'BAR', groupBy: lifecycleField },
        ...(dateField ? [{ title: `${entityName}s over time`, type: 'LINE' as const, groupBy: dateField.name }] : [])
      ]
    }
  };
}

function buildDefaultPermissions(mode: StudioMode): { roles: string[]; rules: StudioPermissionRule[] } {
  const staffRole = mode === 'FINANCE' || mode === 'ERP' ? 'OPS_EXECUTIVE' : 'SALES_AGENT';
  const roles = ['SUPER_ADMIN', 'ORG_ADMIN', staffRole, 'AUDITOR', 'GUEST'];
  const rules: StudioPermissionRule[] = [
    { role: staffRole, action: 'CREATE', allowed: true, scope: 'ORGANIZATION' },
    { role: staffRole, action: 'READ', allowed: true, scope: 'ORGANIZATION' },
    { role: staffRole, action: 'UPDATE', allowed: true, scope: 'ORGANIZATION' },
    { role: staffRole, action: 'DELETE', allowed: false, scope: 'ORGANIZATION', condition: 'Destructive actions reserved for admins' },
    { role: staffRole, action: 'APPROVE', allowed: false, scope: 'ORGANIZATION' },
    { role: 'AUDITOR', action: 'READ', allowed: true, scope: 'ORGANIZATION' },
    { role: 'AUDITOR', action: 'EXPORT', allowed: true, scope: 'ORGANIZATION' },
    { role: 'GUEST', action: 'READ', allowed: true, scope: 'ORGANIZATION' }
  ];
  return { roles, rules };
}

function buildEvents(entityName: string, syncTargets: string[], extraEvents: StudioEventDefinition[]): StudioEventDefinition[] {
  const upper = entityName.toUpperCase();
  return [
    { eventName: `${upper}_CREATED`, description: `Fired when a ${entityName} is created`, trigger: 'CREATE', payloadFields: ['id', ...syncTargets.length ? ['tenantId'] : []], subscribers: syncTargets, actions: ['DISPATCH_SYNC'] },
    { eventName: `${upper}_UPDATED`, description: `Fired when a ${entityName} is updated`, trigger: 'UPDATE', payloadFields: ['id'], subscribers: syncTargets, actions: ['DISPATCH_SYNC'] },
    { eventName: `${upper}_DELETED`, description: `Fired when a ${entityName} is deleted`, trigger: 'DELETE', payloadFields: ['id'], subscribers: syncTargets, actions: ['DISPATCH_SYNC'] },
    ...extraEvents
  ];
}

// ============================================================
// DOMAIN BLUEPRINTS
// ============================================================

interface DomainBlueprint {
  entityName: string;
  mode: StudioMode;
  module: CRUDE8Module;
  description: string;
  fields: StudioField[];
  lifecycleField: string;
  lifecycleTransitions: Partial<Record<UniversalActionType, string>>;
  syncTargets: string[];
  relations?: { relationName: string; targetEntity: string; type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY'; foreignKey: string }[];
}

const BLUEPRINT_MATCHERS: { pattern: RegExp; blueprint: DomainBlueprint }[] = [
  {
    pattern: /visa|passport/,
    blueprint: {
      entityName: 'Visa', mode: 'CRM', module: 'CRM',
      description: 'Customer visa & passport tracking with expiry radar',
      fields: [
        f('visaNumber', 'Visa Number', 'TEXT', true, { unique: true }),
        f('customerName', 'Customer Name', 'TEXT', true),
        f('country', 'Destination Country', 'TEXT', true),
        f('visaType', 'Visa Type', 'SELECT', true, { options: ['TOURIST', 'BUSINESS', 'STUDENT', 'TRANSIT', 'WORK'] }),
        f('issuedDate', 'Issued On', 'DATE', true),
        f('expiryDate', 'Expiry Date', 'DATE', true),
        f('passportNumber', 'Passport Number', 'TEXT', true),
        f('documentUrl', 'Scanned Document', 'FILE'),
        f('visaStatus', 'Status', 'SELECT', true, { options: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED'], defaultValue: 'DRAFT' })
      ],
      lifecycleField: 'visaStatus',
      lifecycleTransitions: { PUBLISH: 'SUBMITTED', APPROVE: 'APPROVED', REJECT: 'REJECTED', ARCHIVE: 'EXPIRED' },
      syncTargets: ['DMS', 'CRM', 'NOTIFICATIONS']
    }
  },
  {
    pattern: /tour package|tourpackage|tour operator/,
    blueprint: {
      entityName: 'TourPackage', mode: 'CMS', module: 'VIBE8',
      description: 'Tour packages with publishing workflow, pricing and marketplace sync',
      fields: [
        f('packageName', 'Package Name', 'TEXT', true, { unique: true }),
        f('destination', 'Destination', 'TEXT', true),
        f('durationDays', 'Duration (Days)', 'NUMBER', true),
        f('basePrice', 'Base Price', 'NUMBER', true),
        f('inclusions', 'Inclusions', 'MULTISELECT', false, { options: ['FLIGHTS', 'HOTEL', 'TRANSFERS', 'MEALS', 'SIGHTSEEING', 'VISA'] }),
        f('publishStatus', 'Publish Status', 'SELECT', true, { options: ['DRAFT', 'REVIEW', 'PUBLISHED', 'RETIRED'], defaultValue: 'DRAFT' }),
        f('marketplaceUrl', 'Marketplace Listing', 'TEXT')
      ],
      lifecycleField: 'publishStatus',
      lifecycleTransitions: { PUBLISH: 'PUBLISHED', UNPUBLISH: 'DRAFT', ARCHIVE: 'RETIRED' },
      syncTargets: ['VIBE8', 'HESTIA8', 'MARKETPLACE']
    }
  },
  {
    pattern: /hotel/,
    blueprint: {
      entityName: 'HotelSupplier', mode: 'ERP', module: 'ERP',
      description: 'Hotel supplier management with contracts and ratings',
      fields: [
        f('name', 'Hotel Name', 'TEXT', true, { unique: true }),
        f('city', 'City', 'TEXT', true),
        f('country', 'Country', 'TEXT', true),
        f('starCategory', 'Star Category', 'SELECT', true, { options: ['3_STAR', '4_STAR', '5_STAR'] }),
        f('contactEmail', 'Contact Email', 'EMAIL', true),
        f('contactPhone', 'Contact Phone', 'PHONE'),
        f('roomCount', 'Total Rooms', 'NUMBER', true),
        f('nightlyRate', 'Base Nightly Rate', 'NUMBER', true),
        f('rating', 'Supplier Rating', 'NUMBER'),
        f('hotelStatus', 'Status', 'SELECT', true, { options: ['ONBOARDED', 'ACTIVE', 'SUSPENDED'], defaultValue: 'ONBOARDED' })
      ],
      lifecycleField: 'hotelStatus',
      lifecycleTransitions: { APPROVE: 'ACTIVE', REJECT: 'SUSPENDED', ARCHIVE: 'SUSPENDED' },
      syncTargets: ['TMS', 'ACCOUNTING', 'CRM']
    }
  },
  {
    pattern: /supplier|vendor/,
    blueprint: {
      entityName: 'Supplier', mode: 'ERP', module: 'ERP',
      description: 'Supplier onboarding and relationship management',
      fields: [
        f('name', 'Supplier Name', 'TEXT', true, { unique: true }),
        f('category', 'Category', 'SELECT', true, { options: ['AIRLINE', 'HOTEL_CHAIN', 'DMC', 'TRANSPORT', 'GUIDE'] }),
        f('contactEmail', 'B2B Contact Email', 'EMAIL', true),
        f('contactPhone', 'Contact Phone', 'PHONE'),
        f('rating', 'Reliability Score', 'NUMBER'),
        f('contractValue', 'Annual Contract Value', 'NUMBER'),
        f('supplierStatus', 'Status', 'SELECT', true, { options: ['PROSPECT', 'ONBOARDED', 'ACTIVE', 'BLACKLISTED'], defaultValue: 'PROSPECT' })
      ],
      lifecycleField: 'supplierStatus',
      lifecycleTransitions: { APPROVE: 'ACTIVE', REJECT: 'BLACKLISTED', ARCHIVE: 'BLACKLISTED' },
      syncTargets: ['TMS', 'ACCOUNTING']
    }
  },
  {
    pattern: /employee|hr|payroll|staff/,
    blueprint: {
      entityName: 'Employee', mode: 'ERP', module: 'H8_CORE',
      description: 'HR employee records with onboarding workflow',
      fields: [
        f('name', 'Full Name', 'TEXT', true),
        f('workEmail', 'Work Email', 'EMAIL', true, { unique: true }),
        f('department', 'Department', 'SELECT', true, { options: ['SALES', 'OPERATIONS', 'FINANCE', 'TECHNOLOGY', 'MARKETING'] }),
        f('designation', 'Designation', 'TEXT', true),
        f('joinDate', 'Joining Date', 'DATE', true),
        f('salary', 'Annual Salary', 'NUMBER', true),
        f('employmentStatus', 'Status', 'SELECT', true, { options: ['OFFER_SENT', 'ACTIVE', 'ON_NOTICE', 'EXITED'], defaultValue: 'OFFER_SENT' })
      ],
      lifecycleField: 'employmentStatus',
      lifecycleTransitions: { APPROVE: 'ACTIVE', REJECT: 'EXITED', ARCHIVE: 'EXITED' },
      syncTargets: ['ACCOUNTING', 'H8_CORE']
    }
  },
  {
    pattern: /inventory|stock|warehouse/,
    blueprint: {
      entityName: 'InventoryItem', mode: 'ERP', module: 'ERP',
      description: 'Inventory and stock management with reorder radar',
      fields: [
        f('sku', 'SKU', 'TEXT', true, { unique: true }),
        f('name', 'Item Name', 'TEXT', true),
        f('warehouse', 'Warehouse', 'SELECT', true, { options: ['MUMBAI_HUB', 'DELHI_HUB', 'BENGALURU_HUB'] }),
        f('quantity', 'Quantity In Stock', 'NUMBER', true),
        f('reorderLevel', 'Reorder Level', 'NUMBER', true),
        f('unitCost', 'Unit Cost', 'NUMBER', true),
        f('stockStatus', 'Status', 'SELECT', true, { options: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], defaultValue: 'IN_STOCK' })
      ],
      lifecycleField: 'stockStatus',
      lifecycleTransitions: { ARCHIVE: 'OUT_OF_STOCK' },
      syncTargets: ['ACCOUNTING', 'TMS']
    }
  },
  {
    pattern: /invoice|payment|billing/,
    blueprint: {
      entityName: 'Invoice', mode: 'FINANCE', module: 'FINANCE',
      description: 'Billing and receivables with GST computation',
      fields: [
        f('invoiceNumber', 'Invoice Number', 'TEXT', true, { unique: true }),
        f('customerName', 'Customer', 'TEXT', true),
        f('amount', 'Taxable Amount', 'NUMBER', true),
        f('taxAmount', 'GST / VAT', 'NUMBER', true),
        f('totalAmount', 'Grand Total', 'NUMBER', true),
        f('dueDate', 'Due Date', 'DATE', true),
        f('paymentStatus', 'Status', 'SELECT', true, { options: ['DRAFT', 'SENT', 'PART_PAID', 'PAID', 'VOID'], defaultValue: 'DRAFT' })
      ],
      lifecycleField: 'paymentStatus',
      lifecycleTransitions: { PUBLISH: 'SENT', APPROVE: 'PAID', REJECT: 'VOID', ARCHIVE: 'VOID' },
      syncTargets: ['ACCOUNTING', 'CRM', 'TAX_ENGINE']
    }
  },
  {
    pattern: /booking|reservation/,
    blueprint: {
      entityName: 'Booking', mode: 'TMS', module: 'TMS',
      description: 'Booking operations with fulfilment workflow',
      fields: [
        f('bookingNumber', 'Booking Number', 'TEXT', true, { unique: true }),
        f('customerName', 'Customer', 'TEXT', true),
        f('packageName', 'Package', 'TEXT', true),
        f('departureDate', 'Departure', 'DATE', true),
        f('paxCount', 'Travellers', 'NUMBER', true),
        f('totalAmount', 'Total Amount', 'NUMBER', true),
        f('bookingStatus', 'Status', 'SELECT', true, { options: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], defaultValue: 'PENDING' })
      ],
      lifecycleField: 'bookingStatus',
      lifecycleTransitions: { APPROVE: 'CONFIRMED', REJECT: 'CANCELLED', ARCHIVE: 'CANCELLED' },
      syncTargets: ['CRM', 'ERP', 'FINANCE', 'DMS', 'NOTIFICATIONS']
    }
  },
  {
    pattern: /campaign|marketing|growth/,
    blueprint: {
      entityName: 'Campaign', mode: 'SEO', module: 'HESTIA8',
      description: 'Growth campaign management with conversion analytics',
      fields: [
        f('name', 'Campaign Name', 'TEXT', true),
        f('channel', 'Channel', 'SELECT', true, { options: ['GOOGLE_ADS', 'META', 'EMAIL', 'WHATSAPP', 'SEO'] }),
        f('targetDestination', 'Target Destination', 'TEXT', true),
        f('budget', 'Budget', 'NUMBER', true),
        f('conversions', 'Conversions', 'NUMBER'),
        f('campaignStatus', 'Status', 'SELECT', true, { options: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'], defaultValue: 'DRAFT' })
      ],
      lifecycleField: 'campaignStatus',
      lifecycleTransitions: { PUBLISH: 'ACTIVE', UNPUBLISH: 'PAUSED', ARCHIVE: 'COMPLETED' },
      syncTargets: ['CRM', 'HESTIA8']
    }
  },
  {
    pattern: /customer portal|customer profile|portal profile/,
    blueprint: {
      entityName: 'CustomerProfile', mode: 'CRM', module: 'CRM',
      description: 'Customer-facing profiles with preferences and document vault',
      fields: [
        f('fullName', 'Full Name', 'TEXT', true),
        f('email', 'Email', 'EMAIL', true, { unique: true }),
        f('phone', 'Phone', 'PHONE'),
        f('homeCity', 'Home City', 'TEXT'),
        f('preferences', 'Travel Preferences', 'MULTISELECT', false, { options: ['ADVENTURE', 'LUXURY', 'FAMILY', 'BUDGET', 'CULTURE', 'WELLNESS'] }),
        f('profileStatus', 'Profile Status', 'SELECT', true, { options: ['ACTIVE', 'INACTIVE', 'BLACKLISTED'], defaultValue: 'ACTIVE' })
      ],
      lifecycleField: 'profileStatus',
      lifecycleTransitions: { PUBLISH: 'ACTIVE', UNPUBLISH: 'INACTIVE', ARCHIVE: 'BLACKLISTED' },
      syncTargets: ['CRM', 'NOTIFICATIONS', 'VIBE8']
    }
  },
  {
    pattern: /enquiry|inquiry|lead/,
    blueprint: {
      entityName: 'Enquiry', mode: 'CRM', module: 'CRM',
      description: 'Inbound enquiry pipeline with AI qualification',
      fields: [
        f('customerName', 'Customer Name', 'TEXT', true),
        f('contactEmail', 'Email', 'EMAIL', true),
        f('contactPhone', 'Phone', 'PHONE', true),
        f('destination', 'Destination of Interest', 'TEXT', true),
        f('travelDate', 'Preferred Travel Date', 'DATE'),
        f('budget', 'Budget', 'NUMBER'),
        f('source', 'Source', 'SELECT', true, { options: ['WEBSITE', 'WHATSAPP', 'REFERRAL', 'WALK_IN', 'CAMPAIGN'] }),
        f('enquiryStatus', 'Status', 'SELECT', true, { options: ['NEW', 'QUALIFIED', 'ASSIGNED', 'QUOTED', 'WON', 'LOST'], defaultValue: 'NEW' }),
        f('assignedAgent', 'Assigned Agent', 'TEXT')
      ],
      lifecycleField: 'enquiryStatus',
      lifecycleTransitions: { PUBLISH: 'QUALIFIED', APPROVE: 'WON', REJECT: 'LOST', ARCHIVE: 'LOST' },
      syncTargets: ['CRM', 'TMS', 'NOTIFICATIONS'],
      relations: [{ relationName: 'customer', targetEntity: 'Customer', type: 'MANY_TO_ONE', foreignKey: 'customerId' }]
    }
  }
];

function detectBlueprint(prompt: string): DomainBlueprint {
  const lower = prompt.toLowerCase();
  for (const matcher of BLUEPRINT_MATCHERS) {
    if (matcher.pattern.test(lower)) return { ...matcher.blueprint, fields: matcher.blueprint.fields.map(fl => ({ ...fl })) };
  }
  return {
    entityName: 'CustomEntity', mode: 'CRM', module: 'CRM',
    description: prompt.slice(0, 120),
    fields: [
      f('name', 'Name', 'TEXT', true),
      f('description', 'Description', 'TEXTAREA'),
      f('ownerName', 'Owner', 'TEXT'),
      f('customStatus', 'Status', 'SELECT', true, { options: ['DRAFT', 'ACTIVE', 'ARCHIVED'], defaultValue: 'DRAFT' })
    ],
    lifecycleField: 'customStatus',
    lifecycleTransitions: { PUBLISH: 'ACTIVE', UNPUBLISH: 'DRAFT', ARCHIVE: 'ARCHIVED' },
    syncTargets: ['CRM', 'DMS', 'NOTIFICATIONS']
  };
}

// ============================================================
// FEATURE DETECTION
// ============================================================

interface DetectedFeatures {
  expiry: boolean;
  approval: boolean;
  notification: boolean;
  documents: boolean;
  ai: boolean;
  dashboard: boolean;
  assignment: boolean;
}

function detectFeatures(prompt: string): DetectedFeatures {
  const lower = prompt.toLowerCase();
  return {
    expiry: /expir|track|radar|renewal|deadline|validity/.test(lower),
    approval: /approv|review|sign.?off|workflow/.test(lower),
    notification: /notif|whatsapp|email|sms|alert|reminder|notify/.test(lower),
    documents: /document|doc|file|upload|attachment|contract/.test(lower),
    ai: /\bai\b|intelligen|qualif|predict|recommend|score/.test(lower),
    dashboard: /dashboard|analytic|report|insight/.test(lower) || true, // dashboards are always generated
    assignment: /assign|agent|owner|route/.test(lower)
  };
}

// ============================================================
// TEMPLATE MARKETPLACE PRESETS
// Pinned on globalThis: dev-mode compiles each route as its own
// bundle, so the mutable installs counter must be process-wide.
// ============================================================

type StudioTemplatePreset = StudioTemplateMeta & { prompt: string };

const globalRef = globalThis as typeof globalThis & { __crude8StudioTemplates?: StudioTemplatePreset[] };
const TEMPLATE_PRESETS: StudioTemplatePreset[] = globalRef.__crude8StudioTemplates ?? (globalRef.__crude8StudioTemplates = [
  { templateId: 'tpl-travel-crm', name: 'Travel CRM', description: 'Complete lead-to-booking CRM: pipeline, quotes, follow-ups and customer 360.', category: 'CRM', keywords: ['crm', 'lead', 'enquiry', 'pipeline'], installs: 0, entityName: 'Enquiry', prompt: 'Create a travel CRM enquiry pipeline with AI qualification, agent assignment, WhatsApp notifications and follow-ups' },
  { templateId: 'tpl-hotel-management', name: 'Hotel Management', description: 'Hotel supplier onboarding, room inventory, ratings and contract tracking.', category: 'ERP', keywords: ['hotel', 'accommodation', 'rooms'], installs: 0, entityName: 'HotelSupplier', prompt: 'Create a hotel management module with supplier approval workflow, room counts and dashboard analytics' },
  { templateId: 'tpl-tour-operator', name: 'Tour Operator', description: 'Tour packages with publishing workflow, pricing and marketplace sync.', category: 'CMS', keywords: ['tour', 'package', 'operator'], installs: 0, entityName: 'TourPackage', prompt: 'Create a tour package management module with publish workflow, pricing and marketplace notifications' },
  { templateId: 'tpl-supplier-portal', name: 'Supplier Portal', description: 'Supplier onboarding, category management, contracts and scorecards.', category: 'ERP', keywords: ['supplier', 'vendor', 'procurement'], installs: 0, entityName: 'Supplier', prompt: 'Create a supplier management module with approval workflow, documents and contract value tracking' },
  { templateId: 'tpl-invoice-system', name: 'Invoice System', description: 'GST-compliant invoicing with payment tracking and tax engine sync.', category: 'FINANCE', keywords: ['invoice', 'billing', 'payment', 'gst'], installs: 0, entityName: 'Invoice', prompt: 'Create an invoice system with payment tracking, tax amounts and accounting sync' },
  { templateId: 'tpl-hr-module', name: 'HR Module', description: 'Employee lifecycle: offers, onboarding approval, departments and payroll fields.', category: 'ERP', keywords: ['hr', 'employee', 'payroll', 'staff'], installs: 0, entityName: 'Employee', prompt: 'Create an HR employee module with onboarding approval workflow and document uploads' },
  { templateId: 'tpl-inventory', name: 'Inventory', description: 'Stock management with reorder radar, warehouses and valuation.', category: 'ERP', keywords: ['inventory', 'stock', 'warehouse'], installs: 0, entityName: 'InventoryItem', prompt: 'Create an inventory management module with low stock alerts and reorder reminders' },
  { templateId: 'tpl-booking-engine', name: 'Booking Engine', description: 'End-to-end booking operations with confirmation workflow and document vault.', category: 'TMS', keywords: ['booking', 'reservation', 'fulfilment'], installs: 0, entityName: 'Booking', prompt: 'Create a booking engine with confirmation approval workflow, documents and customer notifications' },
  { templateId: 'tpl-document-approval', name: 'Document Approval', description: 'Document review queues with approval workflow and expiry radar.', category: 'DMS', keywords: ['document', 'approval', 'review'], installs: 0, entityName: 'Visa', prompt: 'Create a customer visa document tracking module with approval workflow, expiry reminders and notifications' },
  { templateId: 'tpl-customer-portal', name: 'Customer Portal', description: 'Customer-facing module: profiles, preferences, documents and support.', category: 'CRM', keywords: ['customer', 'portal', 'profile'], installs: 0, entityName: 'CustomerProfile', prompt: 'Create a customer portal profile module with document uploads, preference tracking and email notifications' }
]);

// ============================================================
// MAIN GENERATOR
// ============================================================

export class StudioModuleGenerator {
  /**
   * Generates a complete StudioModuleProject from a natural-language prompt.
   */
  static generateFromPrompt(prompt: string, actor: string): StudioModuleProject {
    return this.generateFromBlueprint(prompt, detectBlueprint(prompt), actor);
  }

  /**
   * Generates from an explicitly chosen blueprint (used by template installs so
   * a stray keyword in the prompt can never steer the template off-entity).
   */
  static generateFromBlueprint(prompt: string, blueprint: DomainBlueprint, actor: string): StudioModuleProject {
    const lower = prompt.toLowerCase();
    const features = detectFeatures(prompt);
    const now = new Date().toISOString();
    const upper = blueprint.entityName.toUpperCase();
    const fields: StudioField[] = [...blueprint.fields];

    // Feature-driven schema enrichment
    if (features.documents && !fields.some(fl => fl.type === 'FILE')) {
      fields.push(f('documentUrl', 'Attached Document', 'FILE'));
    }
    if (features.assignment && !fields.some(fl => fl.name === 'assignedAgent')) {
      fields.push(f('assignedAgent', 'Assigned Agent', 'TEXT'));
    }

    const permissions = buildDefaultPermissions(blueprint.mode);
    const events: StudioEventDefinition[] = buildEvents(blueprint.entityName, blueprint.syncTargets, []);
    const automations: StudioAutomationDefinition[] = [];
    const workflows: StudioWorkflowDefinition[] = [];
    const aiActions: string[] = [];
    const syncTargets = [...blueprint.syncTargets];

    // Surface declared relations as RELATION fields so forms get relation selectors
    for (const relation of blueprint.relations || []) {
      if (!fields.some(fl => fl.name === relation.foreignKey)) {
        fields.push(f(relation.foreignKey, relation.relationName, 'RELATION', false, { relationEntity: relation.targetEntity }));
      }
    }

    if (features.expiry) {
      events.push({
        eventName: `${upper}_EXPIRING_SOON`,
        description: `Radar event when a ${blueprint.entityName} is within 30 days of expiry`,
        trigger: 'DAILY_SCHEDULE',
        payloadFields: ['id', 'expiryDate'],
        subscribers: ['NOTIFICATIONS', 'CRM'],
        actions: ['SEND_REMINDER', 'CREATE_FOLLOW_UP_TASK']
      });
      automations.push({
        automationId: uid('auto'),
        name: 'Expiry Reminder Radar',
        trigger: `${upper}_EXPIRING_SOON`,
        actions: ['CHECK_EXPIRY_WINDOW_30D', 'SEND_EMAIL', 'SEND_WHATSAPP', 'CREATE_FOLLOW_UP_TASK'],
        enabled: true
      });
      workflows.push({
        workflowId: uid('wf'),
        name: `${blueprint.entityName} Expiry Reminder`,
        entity: blueprint.entityName,
        triggerEvent: `${upper}_EXPIRING_SOON`,
        startNodeId: 'node-trigger',
        nodes: [
          { nodeId: 'node-trigger', type: 'TRIGGER', name: 'Expiry Radar Fired', config: {}, next: 'node-check' },
          { nodeId: 'node-check', type: 'CONDITION', name: 'Within 30 days?', config: { field: 'expiryDate', operator: 'exists', value: true }, nextTrue: 'node-notify', nextFalse: undefined },
          { nodeId: 'node-notify', type: 'NOTIFICATION', name: 'Send Renewal Reminder', config: { channel: 'WHATSAPP', template: `${upper}_RENEWAL_REMINDER`, to: '{{customerName}}' }, next: 'node-task' },
          { nodeId: 'node-task', type: 'ACTION', name: 'Create Follow-Up Task', config: { entity: blueprint.entityName, action: 'UPDATE', payload: { followUpRequired: true } } }
        ]
      });
      aiActions.push('Expiry Risk Prediction');
    }

    if (features.approval) {
      events.push({
        eventName: `${upper}_APPROVED`,
        description: `Fired when a ${blueprint.entityName} is approved`,
        trigger: 'APPROVE',
        payloadFields: ['id'],
        subscribers: blueprint.syncTargets,
        actions: ['DISPATCH_SYNC']
      });
      automations.push({
        automationId: uid('auto'),
        name: 'Approval Dispatch',
        trigger: `${upper}_APPROVED`,
        actions: ['NOTIFY_REQUESTER', 'DISPATCH_SYNC'],
        enabled: true
      });
      const approvedValue = blueprint.lifecycleTransitions.APPROVE || 'APPROVED';
      const rejectedValue = blueprint.lifecycleTransitions.REJECT || 'REJECTED';
      workflows.push({
        workflowId: uid('wf'),
        name: `${blueprint.entityName} Approval Flow`,
        entity: blueprint.entityName,
        triggerEvent: `${upper}_CREATED`,
        startNodeId: 'node-trigger',
        nodes: [
          { nodeId: 'node-trigger', type: 'TRIGGER', name: 'Record Submitted', config: {}, next: 'node-approve' },
          { nodeId: 'node-approve', type: 'APPROVAL', name: 'Manager Review', config: { approverRole: 'ORG_ADMIN' }, next: 'node-apply', nextFalse: 'node-reject' },
          { nodeId: 'node-apply', type: 'ACTION', name: 'Apply Approval', config: { entity: blueprint.entityName, action: 'UPDATE', payload: { [blueprint.lifecycleField]: approvedValue } }, next: 'node-notify' },
          { nodeId: 'node-notify', type: 'NOTIFICATION', name: 'Notify Requester', config: { channel: 'EMAIL', template: `${upper}_APPROVED`, to: '{{createdBy}}' }, next: 'node-sync' },
          { nodeId: 'node-sync', type: 'API_CALL', name: 'Dispatch Sync', config: { url: '/api/sync8/dispatch', method: 'POST' } },
          { nodeId: 'node-reject', type: 'ACTION', name: 'Apply Rejection', config: { entity: blueprint.entityName, action: 'UPDATE', payload: { [blueprint.lifecycleField]: rejectedValue } } }
        ]
      });
    }

    if (lower.includes('enquir') || lower.includes('inquir') || lower.includes('lead')) {
      // Spec example: NEW ENQUIRY -> AI Qualification -> Assign Agent -> Generate Package -> WhatsApp -> Follow Up
      workflows.push({
        workflowId: uid('wf'),
        name: 'New Enquiry Orchestration',
        entity: blueprint.entityName,
        triggerEvent: `${upper}_CREATED`,
        startNodeId: 'node-trigger',
        nodes: [
          { nodeId: 'node-trigger', type: 'TRIGGER', name: 'Enquiry Created', config: {}, next: 'node-ai' },
          { nodeId: 'node-ai', type: 'AI_STEP', name: 'AI Qualification', config: { prompt: 'Score this enquiry for fit, budget and urgency' }, next: 'node-assign' },
          { nodeId: 'node-assign', type: 'ACTION', name: 'Assign Agent', config: { entity: blueprint.entityName, action: 'UPDATE', payload: { assignedAgent: 'round-robin:SALES' } }, next: 'node-approve' },
          { nodeId: 'node-approve', type: 'APPROVAL', name: 'Manager Review', config: { label: 'Approve qualification' }, next: 'node-package' },
          { nodeId: 'node-package', type: 'ACTION', name: 'Generate Package Draft', config: { entity: 'TourPackage', action: 'CREATE', payload: { name: '{{destination}} draft package' } }, next: 'node-whatsapp' },
          { nodeId: 'node-whatsapp', type: 'NOTIFICATION', name: 'Send WhatsApp', config: { channel: 'WHATSAPP', template: 'ENQUIRY_ACK', to: '{{contactPhone}}' }, next: 'node-followup' },
          { nodeId: 'node-followup', type: 'ACTION', name: 'Create Follow-Up', config: { entity: blueprint.entityName, action: 'UPDATE', payload: { followUpRequired: true } } }
        ]
      });
      aiActions.push('AI Qualification Scoring', 'Auto-Segment Enquiry');
    }

    if (features.notification) {
      automations.push({
        automationId: uid('auto'),
        name: 'Creation Notifications',
        trigger: `${upper}_CREATED`,
        actions: ['SEND_WELCOME_EMAIL', 'DISPATCH_SYNC'],
        enabled: true
      });
    }

    if (features.documents) {
      if (!syncTargets.includes('DMS')) syncTargets.push('DMS');
      automations.push({
        automationId: uid('auto'),
        name: 'Document Vault Provisioning',
        trigger: `${upper}_CREATED`,
        actions: ['CREATE_DMS_FOLDER', 'LINK_DOCUMENTS'],
        enabled: true
      });
    }

    if (features.ai) {
      aiActions.push('Smart Summarization', 'Anomaly Detection');
    }
    if (features.assignment) {
      aiActions.push('Best-Agent Routing');
    }

    const actions: StudioActionDefinition[] = [
      {
        actionId: uid('act'),
        name: `Create ${blueprint.entityName}`,
        entity: blueprint.entityName,
        trigger: 'BUTTON_CLICK',
        description: 'Governed create: validate -> permission -> record -> event -> notification -> analytics',
        steps: [
          { stepId: uid('stp'), type: 'VALIDATE', label: 'Validate required fields', config: {} },
          { stepId: uid('stp'), type: 'PERMISSION_CHECK', label: 'Check CREATE permission', config: { action: 'CREATE' } },
          { stepId: uid('stp'), type: 'CREATE_RECORD', label: `Create ${blueprint.entityName}`, config: { entity: blueprint.entityName } },
          { stepId: uid('stp'), type: 'GENERATE_EVENT', label: `Emit ${upper}_CREATED`, config: { event: `${upper}_CREATED` } },
          ...(features.notification ? [{ stepId: uid('stp'), type: 'SEND_NOTIFICATION' as const, label: 'Notify stakeholders', config: { channel: 'EMAIL', template: `${upper}_WELCOME` } }] : []),
          { stepId: uid('stp'), type: 'UPDATE_ANALYTICS', label: 'Update dashboards', config: {} }
        ]
      },
      {
        actionId: uid('act'),
        name: `Export ${blueprint.entityName}s`,
        entity: blueprint.entityName,
        trigger: 'BUTTON_CLICK',
        description: 'Permissioned bulk export with audit',
        steps: [
          { stepId: uid('stp'), type: 'PERMISSION_CHECK', label: 'Check EXPORT permission', config: { action: 'EXPORT' } },
          { stepId: uid('stp'), type: 'UPDATE_ANALYTICS', label: 'Track export usage', config: {} }
        ]
      }
    ];
    if (features.approval) {
      actions.push({
        actionId: uid('act'),
        name: `Approve / Reject ${blueprint.entityName}`,
        entity: blueprint.entityName,
        trigger: 'BUTTON_CLICK',
        description: 'Dual-outcome governance action with event + sync',
        steps: [
          { stepId: uid('stp'), type: 'PERMISSION_CHECK', label: 'Check APPROVE permission', config: { action: 'APPROVE' } },
          { stepId: uid('stp'), type: 'APPROVAL', label: 'Manager decision', config: {} },
          { stepId: uid('stp'), type: 'UPDATE_RECORD', label: 'Apply lifecycle transition', config: { entity: blueprint.entityName } },
          { stepId: uid('stp'), type: 'GENERATE_EVENT', label: `Emit ${upper}_APPROVED`, config: { event: `${upper}_APPROVED` } },
          { stepId: uid('stp'), type: 'SEND_NOTIFICATION', label: 'Notify requester', config: { channel: 'EMAIL', template: `${upper}_DECISION` } }
        ]
      });
    }

    const reports = [
      `${blueprint.entityName} Pipeline Funnel`,
      `${blueprint.entityName}s by ${blueprint.lifecycleField}`,
      ...(fields.some(fl => /amount|price|budget|total/i.test(fl.name)) ? [`${blueprint.entityName} Revenue Report`] : []),
      'Operational SLA Compliance'
    ];

    const project: StudioModuleProject = {
      projectId: uid('proj'),
      name: `${blueprint.entityName} Module`,
      description: blueprint.description,
      mode: blueprint.mode,
      module: blueprint.module,
      entityName: blueprint.entityName,
      lifecycleField: blueprint.lifecycleField,
      lifecycleTransitions: blueprint.lifecycleTransitions,
      fields,
      relations: blueprint.relations || [],
      ui: buildUi(fields, blueprint.lifecycleField, blueprint.entityName),
      actions,
      workflows,
      permissions,
      events,
      automations,
      aiActions,
      reports,
      syncTargets,
      status: 'DRAFT',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: actor,
      origin: 'AI_GENERATED',
      originPrompt: prompt
    };

    return project;
  }

  // ----------------------------------------------------------
  // TEMPLATE MARKETPLACE
  // ----------------------------------------------------------

  static listTemplates(): StudioTemplateMeta[] {
    return TEMPLATE_PRESETS.map(({ prompt, ...meta }) => ({ ...meta }));
  }

  static installTemplate(templateId: string, actor: string): StudioModuleProject {
    const preset = TEMPLATE_PRESETS.find(t => t.templateId === templateId);
    if (!preset) throw new Error(`CRUDE8 Studio: template '${templateId}' not found.`);

    const matcher = BLUEPRINT_MATCHERS.find(m => m.blueprint.entityName === preset.entityName);
    const blueprint = matcher
      ? { ...matcher.blueprint, fields: matcher.blueprint.fields.map(fl => ({ ...fl })) }
      : detectBlueprint(preset.prompt);
    const project = this.generateFromBlueprint(preset.prompt, blueprint, actor);
    project.name = `${preset.name} (from Template)`;
    project.templateId = preset.templateId;
    project.origin = 'TEMPLATE';
    preset.installs += 1;
    return project;
  }
}
