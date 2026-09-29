/**
 * CRUDE8: UNIVERSAL ENTITY REGISTRY
 * Defines full declarative schemas, permission policies, relations, events,
 * and versioning rules for all 13 canonical Travel Planet OS entities.
 */

import { UniversalEntitySchema, CRUDEntityName } from './types';

export const UNIVERSAL_ENTITY_REGISTRY: Record<CRUDEntityName, UniversalEntitySchema> = {
  Customer: {
    entityId: 'ent-crm-customer',
    entityName: 'Customer',
    module: 'CRM',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Primary customer key' },
      { name: 'name', type: 'STRING', required: true, description: 'Full customer name' },
      { name: 'email', type: 'STRING', required: true, unique: true, validationRegex: '^[^@]+@[^@]+\\.[^@]+$', description: 'Customer email address' },
      { name: 'phone', type: 'STRING', required: false, description: 'International contact number' },
      { name: 'passportNumber', type: 'STRING', required: false, description: 'Encrypted passport reference' },
      { name: 'loyaltyTier', type: 'STRING', required: true, defaultValue: 'BRONZE', description: 'VIP / Loyalty status tier' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Multi-tenant organization boundary' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'Lifecycle status' }
    ],
    relations: [
      { relationName: 'bookings', targetEntity: 'Booking', type: 'ONE_TO_MANY', foreignKey: 'customerId' },
      { relationName: 'documents', targetEntity: 'Document', type: 'ONE_TO_MANY', foreignKey: 'customerId' },
      { relationName: 'invoices', targetEntity: 'Invoice', type: 'ONE_TO_MANY', foreignKey: 'customerId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'CUSTOMER_CREATED',
      onUpdatedEvent: 'CUSTOMER_UPDATED',
      onDeletedEvent: 'CUSTOMER_DELETED',
      syncTargets: ['CRM', 'TMS', 'ACCOUNTING', 'DMS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 25, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: ['passportNumber'] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Journey: {
    entityId: 'ent-voyage-journey',
    entityName: 'Journey',
    module: 'VOYAGE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Journey unique ID' },
      { name: 'title', type: 'STRING', required: true, description: 'Journey public display name' },
      { name: 'slug', type: 'STRING', required: true, unique: true, description: 'SEO canonical slug' },
      { name: 'destination', type: 'STRING', required: true, description: 'Primary region or country' },
      { name: 'durationDays', type: 'NUMBER', required: true, description: 'Total journey duration in days' },
      { name: 'basePrice', type: 'NUMBER', required: true, description: 'Starting price in currency' },
      { name: 'currency', type: 'STRING', required: true, defaultValue: 'INR', description: 'Pricing currency code' },
      { name: 'isLivingJourney', type: 'BOOLEAN', required: true, defaultValue: true, description: 'Whether journey adapts to real-time events' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'PUBLISHED', description: 'Journey catalog status' }
    ],
    relations: [
      { relationName: 'bookings', targetEntity: 'Booking', type: 'ONE_TO_MANY', foreignKey: 'journeyId' },
      { relationName: 'experiences', targetEntity: 'Experience', type: 'MANY_TO_MANY', foreignKey: 'journeyId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'EXPERIENCE_ARCHITECT'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'SALES_AGENT', 'OPS_EXECUTIVE', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'EXPERIENCE_ARCHITECT'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'JOURNEY_PUBLISHED',
      onUpdatedEvent: 'JOURNEY_MODIFIED',
      onDeletedEvent: 'JOURNEY_DEPRECATED',
      syncTargets: ['VIBE8', 'HESTIA8', 'TMS', 'ERP']
    },
    versionPolicy: { enabled: true, maxSnapshots: 50, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  Booking: {
    entityId: 'ent-tms-booking',
    entityName: 'Booking',
    module: 'TMS',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Universal Booking reference' },
      { name: 'bookingNumber', type: 'STRING', required: true, unique: true, description: 'Human friendly booking reference (e.g. TP-2026-904)' },
      { name: 'customerId', type: 'STRING', required: true, description: 'Foreign key to Customer' },
      { name: 'journeyId', type: 'STRING', required: true, description: 'Foreign key to Journey' },
      { name: 'paxCount', type: 'NUMBER', required: true, defaultValue: 1, description: 'Passenger count' },
      { name: 'departureDate', type: 'DATE', required: true, description: 'Travel start date' },
      { name: 'totalAmount', type: 'NUMBER', required: true, description: 'Gross booking value' },
      { name: 'paymentStatus', type: 'STRING', required: true, defaultValue: 'PENDING', description: 'Financial reconciliation status' },
      { name: 'bookingStatus', type: 'STRING', required: true, defaultValue: 'CONFIRMED', description: 'Operational fulfillment status' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'customer', targetEntity: 'Customer', type: 'MANY_TO_ONE', foreignKey: 'customerId' },
      { relationName: 'journey', targetEntity: 'Journey', type: 'MANY_TO_ONE', foreignKey: 'journeyId' },
      { relationName: 'invoices', targetEntity: 'Invoice', type: 'ONE_TO_MANY', foreignKey: 'bookingId' },
      { relationName: 'documents', targetEntity: 'Document', type: 'ONE_TO_MANY', foreignKey: 'bookingId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'BOOKING_CONFIRMED',
      onUpdatedEvent: 'BOOKING_AMENDED',
      onDeletedEvent: 'BOOKING_CANCELLED',
      syncTargets: ['CRM', 'TMS', 'ERP', 'ACCOUNTING', 'DMS', 'NOTIFICATIONS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 100, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: true, requireApproval: true }
  },

  Document: {
    entityId: 'ent-dms-document',
    entityName: 'Document',
    module: 'DMS8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Document digital ID' },
      { name: 'title', type: 'STRING', required: true, description: 'Document file label' },
      { name: 'type', type: 'STRING', required: true, description: 'Category: PASSPORT, VISA, CONTRACT, VOUCHER, INVOICE' },
      { name: 'fileUrl', type: 'STRING', required: true, description: 'Encrypted cloud storage URL' },
      { name: 'customerId', type: 'STRING', required: false, description: 'Associated customer ID' },
      { name: 'bookingId', type: 'STRING', required: false, description: 'Associated booking ID' },
      { name: 'expiryDate', type: 'DATE', required: false, description: 'Document expiry for radar alerts' },
      { name: 'verificationStatus', type: 'STRING', required: true, defaultValue: 'VERIFIED', description: 'OCR / Agent verification status' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'customer', targetEntity: 'Customer', type: 'MANY_TO_ONE', foreignKey: 'customerId' },
      { relationName: 'booking', targetEntity: 'Booking', type: 'MANY_TO_ONE', foreignKey: 'bookingId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE', 'DMS_MANAGER'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'OPS_EXECUTIVE', 'SALES_AGENT', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'DOCUMENT_UPLOADED',
      onUpdatedEvent: 'DOCUMENT_VERIFIED',
      onDeletedEvent: 'DOCUMENT_ARCHIVED',
      syncTargets: ['TMS', 'CRM', 'COMPLIANCE']
    },
    versionPolicy: { enabled: true, maxSnapshots: 10, allowRollback: true },
    auditPolicy: { logReads: true, logMutations: true, redactFields: ['fileUrl'] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Invoice: {
    entityId: 'ent-fin-invoice',
    entityName: 'Invoice',
    module: 'FINANCE',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Invoice ID' },
      { name: 'invoiceNumber', type: 'STRING', required: true, unique: true, description: 'Tax compliant invoice number' },
      { name: 'customerId', type: 'STRING', required: true, description: 'Customer reference' },
      { name: 'bookingId', type: 'STRING', required: true, description: 'Booking reference' },
      { name: 'amount', type: 'NUMBER', required: true, description: 'Taxable amount' },
      { name: 'taxAmount', type: 'NUMBER', required: true, description: 'GST / VAT component' },
      { name: 'totalAmount', type: 'NUMBER', required: true, description: 'Grand total' },
      { name: 'currency', type: 'STRING', required: true, defaultValue: 'INR', description: 'Currency' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'PAID', description: 'Payment status' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'customer', targetEntity: 'Customer', type: 'MANY_TO_ONE', foreignKey: 'customerId' },
      { relationName: 'booking', targetEntity: 'Booking', type: 'MANY_TO_ONE', foreignKey: 'bookingId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'FINANCE_MANAGER'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'INVOICE_GENERATED',
      onUpdatedEvent: 'INVOICE_SETTLED',
      onDeletedEvent: 'INVOICE_VOIDED',
      syncTargets: ['ACCOUNTING', 'TMS', 'DMS', 'TAX_ENGINE']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: false },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: false, requireApproval: true }
  },

  Supplier: {
    entityId: 'ent-erp-supplier',
    entityName: 'Supplier',
    module: 'ERP',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Supplier unique key' },
      { name: 'name', type: 'STRING', required: true, description: 'Supplier company name' },
      { name: 'category', type: 'STRING', required: true, description: 'AIRLINE, HOTEL_CHAIN, DMC, TRANSPORT, GUIDE' },
      { name: 'contactEmail', type: 'STRING', required: true, description: 'B2B contact email' },
      { name: 'rating', type: 'NUMBER', required: true, defaultValue: 4.8, description: 'Supplier reliability score' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'Contract status' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER', 'OPS_EXECUTIVE'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'SUPPLIER_ONBOARDED',
      onUpdatedEvent: 'SUPPLIER_UPDATED',
      onDeletedEvent: 'SUPPLIER_DEACTIVATED',
      syncTargets: ['TMS', 'ERP', 'ACCOUNTING']
    },
    versionPolicy: { enabled: true, maxSnapshots: 15, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  Destination: {
    entityId: 'ent-vibe-destination',
    entityName: 'Destination',
    module: 'VIBE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Destination ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Destination name' },
      { name: 'slug', type: 'STRING', required: true, unique: true, description: 'Slug' },
      { name: 'country', type: 'STRING', required: true, description: 'Country' },
      { name: 'region', type: 'STRING', required: true, description: 'State or region' },
      { name: 'tagline', type: 'STRING', required: false, description: 'Marketing tagline' },
      { name: 'seoScore', type: 'NUMBER', required: true, defaultValue: 95, description: 'SEO optimization index' }
    ],
    relations: [
      { relationName: 'journeys', targetEntity: 'Journey', type: 'ONE_TO_MANY', foreignKey: 'destinationId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'DESTINATION_CREATED',
      onUpdatedEvent: 'DESTINATION_UPDATED',
      onDeletedEvent: 'DESTINATION_ARCHIVED',
      syncTargets: ['HESTIA8', 'VIBE8', 'VOYAGE8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Experience: {
    entityId: 'ent-vibe-experience',
    entityName: 'Experience',
    module: 'VIBE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Experience key' },
      { name: 'title', type: 'STRING', required: true, description: 'Experience title' },
      { name: 'category', type: 'STRING', required: true, description: 'WELLNESS, ADVENTURE, HERITAGE, CULINARY, SAFARI' },
      { name: 'durationHours', type: 'NUMBER', required: true, defaultValue: 4, description: 'Duration in hours' },
      { name: 'price', type: 'NUMBER', required: true, description: 'Price per participant' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'Availability status' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'EXPERIENCE_ARCHITECT'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'EXPERIENCE_ARCHITECT', 'SALES_AGENT', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'EXPERIENCE_ARCHITECT'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'EXPERIENCE_CREATED',
      onUpdatedEvent: 'EXPERIENCE_UPDATED',
      onDeletedEvent: 'EXPERIENCE_RETIRED',
      syncTargets: ['VOYAGE8', 'VIBE8', 'TMS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Content: {
    entityId: 'ent-vibe-content',
    entityName: 'Content',
    module: 'VIBE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Content ID' },
      { name: 'title', type: 'STRING', required: true, description: 'Editorial title' },
      { name: 'slug', type: 'STRING', required: true, unique: true, description: 'URL slug' },
      { name: 'contentType', type: 'STRING', required: true, description: 'One of 18 Travel Content Types' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'Lifecycle status' },
      { name: 'author', type: 'STRING', required: true, description: 'Author name' },
      { name: 'seoScore', type: 'NUMBER', required: true, defaultValue: 85, description: 'HESTIA8 SEO Score' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'CONTENT_CREATED',
      onUpdatedEvent: 'CONTENT_UPDATED',
      onDeletedEvent: 'CONTENT_ARCHIVED',
      syncTargets: ['HESTIA8', 'VIBE8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 30, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  Campaign: {
    entityId: 'ent-hestia-campaign',
    entityName: 'Campaign',
    module: 'HESTIA8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Campaign ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Marketing campaign name' },
      { name: 'targetDestination', type: 'STRING', required: true, description: 'Target destination code' },
      { name: 'budget', type: 'NUMBER', required: true, description: 'Allocated budget' },
      { name: 'conversions', type: 'NUMBER', required: true, defaultValue: 0, description: 'Attributed bookings' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'Campaign status' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'SALES_AGENT'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'CAMPAIGN_LAUNCHED',
      onUpdatedEvent: 'CAMPAIGN_MODIFIED',
      onDeletedEvent: 'CAMPAIGN_STOPPED',
      syncTargets: ['HESTIA8', 'CRM']
    },
    versionPolicy: { enabled: true, maxSnapshots: 15, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  User: {
    entityId: 'ent-core-user',
    entityName: 'User',
    module: 'H8_CORE',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Internal user ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Full name' },
      { name: 'email', type: 'STRING', required: true, unique: true, description: 'User login email' },
      { name: 'role', type: 'STRING', required: true, defaultValue: 'SALES_AGENT', description: 'RBAC Role' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'Account status' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'USER_CREATED',
      onUpdatedEvent: 'USER_UPDATED',
      onDeletedEvent: 'USER_DEACTIVATED',
      syncTargets: ['H8_CORE', 'AUTH_ENGINE']
    },
    versionPolicy: { enabled: true, maxSnapshots: 10, allowRollback: true },
    auditPolicy: { logReads: true, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: false, requireApproval: true }
  },

  Tenant: {
    entityId: 'ent-core-tenant',
    entityName: 'Tenant',
    module: 'H8_CORE',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Tenant ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Organization or agency name' },
      { name: 'domain', type: 'STRING', required: true, unique: true, description: 'Custom domain or slug' },
      { name: 'plan', type: 'STRING', required: true, defaultValue: 'ENTERPRISE', description: 'SaaS plan' },
      { name: 'status', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'Tenant subscription status' }
    ],
    relations: [
      { relationName: 'users', targetEntity: 'User', type: 'ONE_TO_MANY', foreignKey: 'tenantId' },
      { relationName: 'customers', targetEntity: 'Customer', type: 'ONE_TO_MANY', foreignKey: 'tenantId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      updateRoles: ['SUPER_ADMIN'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'TENANT_PROVISIONED',
      onUpdatedEvent: 'TENANT_UPDATED',
      onDeletedEvent: 'TENANT_SUSPENDED',
      syncTargets: ['H8_CORE', 'SAAS_CONTROL_PLANE', 'ACCOUNTING']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: true, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: false, requireApproval: true }
  },

  FeatureFlag: {
    entityId: 'ent-core-featureflag',
    entityName: 'FeatureFlag',
    module: 'H8_CORE',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Feature Flag key' },
      { name: 'name', type: 'STRING', required: true, description: 'Human readable flag name' },
      { name: 'description', type: 'STRING', required: true, description: 'Flag operational description' },
      { name: 'enabled', type: 'BOOLEAN', required: true, defaultValue: false, description: 'State of flag' },
      { name: 'rolloutPercentage', type: 'NUMBER', required: true, defaultValue: 100, description: 'Percentage rollout' },
      { name: 'tenantScoped', type: 'BOOLEAN', required: true, defaultValue: false, description: 'Whether flag can be set per-tenant' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      updateRoles: ['SUPER_ADMIN'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'FEATURE_FLAG_CREATED',
      onUpdatedEvent: 'FEATURE_FLAG_TOGGLED',
      onDeletedEvent: 'FEATURE_FLAG_REMOVED',
      syncTargets: ['H8_CORE', 'SAAS_CONTROL_PLANE']
    },
    versionPolicy: { enabled: true, maxSnapshots: 50, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: true, requireApproval: true }
  },

  Lead: {
    entityId: 'ent-crm-lead',
    entityName: 'Lead',
    module: 'CRM',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Lead unique ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Prospect full name' },
      { name: 'email', type: 'STRING', required: true, description: 'Prospect email' },
      { name: 'phone', type: 'STRING', required: false, description: 'Contact number' },
      { name: 'source', type: 'STRING', required: true, defaultValue: 'ORGANIC', description: 'Acquisition channel: ORGANIC, META_ADS, GOOGLE_ADS, REFERRAL, WHATSAPP' },
      { name: 'destinationInterest', type: 'STRING', required: false, description: 'Primary destination of interest' },
      { name: 'estimatedValue', type: 'NUMBER', required: false, defaultValue: 0, description: 'Projected deal value in INR' },
      { name: 'ownerId', type: 'STRING', required: false, description: 'Assigned sales agent user ID' },
      { name: 'leadStatus', type: 'STRING', required: true, defaultValue: 'NEW', description: 'NEW, CONTACTED, QUALIFIED, CONVERTED, LOST' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'customer', targetEntity: 'Customer', type: 'MANY_TO_ONE', foreignKey: 'customerId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'LEAD_CREATED',
      onUpdatedEvent: 'LEAD_UPDATED',
      onDeletedEvent: 'LEAD_ARCHIVED',
      syncTargets: ['CRM', 'VIBE8', 'NOTIFICATIONS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Enquiry: {
    entityId: 'ent-crm-enquiry',
    entityName: 'Enquiry',
    module: 'CRM',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Enquiry unique ID' },
      { name: 'customerId', type: 'STRING', required: true, description: 'Enquiring customer or lead reference' },
      { name: 'subject', type: 'STRING', required: true, description: 'Enquiry subject line' },
      { name: 'destination', type: 'STRING', required: true, description: 'Requested destination' },
      { name: 'travelDate', type: 'DATE', required: false, description: 'Preferred travel date' },
      { name: 'paxCount', type: 'NUMBER', required: true, defaultValue: 1, description: 'Number of travelers' },
      { name: 'assignedAgentId', type: 'STRING', required: false, description: 'Agent handling the enquiry' },
      { name: 'enquiryStatus', type: 'STRING', required: true, defaultValue: 'OPEN', description: 'OPEN, QUOTED, CONVERTED, CLOSED, REJECTED' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'customer', targetEntity: 'Customer', type: 'MANY_TO_ONE', foreignKey: 'customerId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'ENQUIRY_RECEIVED',
      onUpdatedEvent: 'ENQUIRY_UPDATED',
      onDeletedEvent: 'ENQUIRY_CLOSED',
      syncTargets: ['CRM', 'VOYAGE8', 'TMS', 'NOTIFICATIONS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Itinerary: {
    entityId: 'ent-voyage-itinerary',
    entityName: 'Itinerary',
    module: 'VOYAGE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Itinerary unique ID' },
      { name: 'journeyId', type: 'STRING', required: true, description: 'Parent journey reference' },
      { name: 'title', type: 'STRING', required: true, description: 'Itinerary title' },
      { name: 'dayCount', type: 'NUMBER', required: true, defaultValue: 1, description: 'Total planned days' },
      { name: 'dayPlans', type: 'JSON', required: false, description: 'Ordered day-by-day activity plan' },
      { name: 'transportPlan', type: 'JSON', required: false, description: 'Intercity transport arrangements' },
      { name: 'mealPlan', type: 'JSON', required: false, description: 'Meal inclusions per day' },
      { name: 'pdfUrl', type: 'STRING', required: false, description: 'Generated PDF document URL' },
      { name: 'itineraryStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, OPTIMIZED, SHARED, FINAL' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'journey', targetEntity: 'Journey', type: 'MANY_TO_ONE', foreignKey: 'journeyId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'EXPERIENCE_ARCHITECT', 'SALES_AGENT'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'EXPERIENCE_ARCHITECT', 'SALES_AGENT'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'ITINERARY_CREATED',
      onUpdatedEvent: 'ITINERARY_UPDATED',
      onDeletedEvent: 'ITINERARY_DELETED',
      syncTargets: ['VOYAGE8', 'TMS', 'DMS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 40, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  TourPackage: {
    entityId: 'ent-voyage-tourpackage',
    entityName: 'TourPackage',
    module: 'VOYAGE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Package unique ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Marketplace package name' },
      { name: 'slug', type: 'STRING', required: true, unique: true, description: 'SEO canonical slug' },
      { name: 'journeyId', type: 'STRING', required: false, description: 'Source journey template' },
      { name: 'basePrice', type: 'NUMBER', required: true, description: 'Published starting price' },
      { name: 'currency', type: 'STRING', required: true, defaultValue: 'INR', description: 'Pricing currency' },
      { name: 'availableFrom', type: 'DATE', required: false, description: 'Booking window start' },
      { name: 'availableTo', type: 'DATE', required: false, description: 'Booking window end' },
      { name: 'packageStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, PUBLISHED, UNPUBLISHED, ARCHIVED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'journey', targetEntity: 'Journey', type: 'MANY_TO_ONE', foreignKey: 'journeyId' },
      { relationName: 'bookings', targetEntity: 'Booking', type: 'ONE_TO_MANY', foreignKey: 'packageId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'SALES_AGENT', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'PACKAGE_CREATED',
      onUpdatedEvent: 'PACKAGE_UPDATED',
      onDeletedEvent: 'PACKAGE_ARCHIVED',
      syncTargets: ['VIBE8', 'HESTIA8', 'TMS', 'ERP']
    },
    versionPolicy: { enabled: true, maxSnapshots: 30, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  Contract: {
    entityId: 'ent-erp-contract',
    entityName: 'Contract',
    module: 'ERP',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Contract unique ID' },
      { name: 'supplierId', type: 'STRING', required: true, description: 'Supplier reference' },
      { name: 'contractNumber', type: 'STRING', required: true, unique: true, description: 'Human readable contract number' },
      { name: 'serviceType', type: 'STRING', required: true, description: 'ACCOMMODATION, TRANSPORT, ACTIVITY, F&B' },
      { name: 'validFrom', type: 'DATE', required: true, description: 'Contract validity start' },
      { name: 'validTo', type: 'DATE', required: true, description: 'Contract validity end' },
      { name: 'rateCard', type: 'JSON', required: false, description: 'Negotiated rates and markup rules' },
      { name: 'contractStatus', type: 'STRING', required: true, defaultValue: 'PENDING_APPROVAL', description: 'PENDING_APPROVAL, ACTIVE, EXPIRED, RENEWAL_DUE' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'supplier', targetEntity: 'Supplier', type: 'MANY_TO_ONE', foreignKey: 'supplierId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROCUREMENT_MANAGER'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'CONTRACT_CREATED',
      onUpdatedEvent: 'CONTRACT_UPDATED',
      onDeletedEvent: 'CONTRACT_TERMINATED',
      syncTargets: ['ERP', 'ACCOUNTING', 'TMS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: true, requireApproval: true }
  },

  DocumentTemplate: {
    entityId: 'ent-dms-template',
    entityName: 'DocumentTemplate',
    module: 'DMS8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Template unique ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Template display name' },
      { name: 'templateType', type: 'STRING', required: true, description: 'VOUCHER, INVOICE, ITINERARY, QUOTE, CONTRACT' },
      { name: 'variables', type: 'JSON', required: false, description: 'Merge variable declarations' },
      { name: 'bodyBlocks', type: 'JSON', required: false, description: 'Composable template body definition' },
      { name: 'templateVersion', type: 'STRING', required: true, defaultValue: '1.0.0', description: 'Semantic template version' },
      { name: 'templateStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, PUBLISHED, ARCHIVED' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER', 'OPS_EXECUTIVE', 'SALES_AGENT'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'DMS_MANAGER'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'TEMPLATE_CREATED',
      onUpdatedEvent: 'TEMPLATE_UPDATED',
      onDeletedEvent: 'TEMPLATE_ARCHIVED',
      syncTargets: ['DMS', 'TMS', 'CRM']
    },
    versionPolicy: { enabled: true, maxSnapshots: 30, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  Page: {
    entityId: 'ent-vibe-page',
    entityName: 'Page',
    module: 'VIBE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'CMS page ID' },
      { name: 'title', type: 'STRING', required: true, description: 'Page display title' },
      { name: 'slug', type: 'STRING', required: true, unique: true, description: 'Canonical URL slug' },
      { name: 'components', type: 'JSON', required: false, description: 'Ordered component instance tree' },
      { name: 'themeKey', type: 'STRING', required: false, description: 'Bound travel theme key' },
      { name: 'seoMeta', type: 'JSON', required: false, description: 'HESTIA8 SEO metadata block' },
      { name: 'pageStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, SCHEDULED, PUBLISHED, UNPUBLISHED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'PAGE_CREATED',
      onUpdatedEvent: 'PAGE_UPDATED',
      onDeletedEvent: 'PAGE_DELETED',
      syncTargets: ['VIBE8', 'HESTIA8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 50, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  Component: {
    entityId: 'ent-vibe-component',
    entityName: 'Component',
    module: 'VIBE8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Component instance ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Component display name' },
      { name: 'componentType', type: 'STRING', required: true, description: 'Registry component key e.g. Hero, DestinationCard' },
      { name: 'props', type: 'JSON', required: false, description: 'Bound prop values and data bindings' },
      { name: 'dataBinding', type: 'JSON', required: false, description: 'Data source binding configuration' },
      { name: 'permissions', type: 'JSON', required: false, description: 'Component-level visibility permissions' },
      { name: 'componentStatus', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'ACTIVE, ARCHIVED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR', 'CONTENT_CREATOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'EDITOR'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'COMPONENT_CREATED',
      onUpdatedEvent: 'COMPONENT_UPDATED',
      onDeletedEvent: 'COMPONENT_ARCHIVED',
      syncTargets: ['VIBE8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 30, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  SeoProject: {
    entityId: 'ent-hestia-project',
    entityName: 'SeoProject',
    module: 'HESTIA8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'SEO project ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Project name' },
      { name: 'domain', type: 'STRING', required: true, description: 'Audited website domain' },
      { name: 'targetMarkets', type: 'JSON', required: false, description: 'Target geo/language markets' },
      { name: 'auditScore', type: 'NUMBER', required: true, defaultValue: 0, description: 'Latest technical audit score' },
      { name: 'projectStatus', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'ACTIVE, PAUSED, ARCHIVED' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'keywords', targetEntity: 'Keyword', type: 'ONE_TO_MANY', foreignKey: 'projectId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'CONTENT_CREATOR', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'SEO_PROJECT_CREATED',
      onUpdatedEvent: 'SEO_PROJECT_UPDATED',
      onDeletedEvent: 'SEO_PROJECT_ARCHIVED',
      syncTargets: ['HESTIA8', 'VIBE8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Keyword: {
    entityId: 'ent-hestia-keyword',
    entityName: 'Keyword',
    module: 'HESTIA8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Keyword ID' },
      { name: 'projectId', type: 'STRING', required: true, description: 'Parent SEO project' },
      { name: 'phrase', type: 'STRING', required: true, description: 'Target keyword phrase' },
      { name: 'searchVolume', type: 'NUMBER', required: false, defaultValue: 0, description: 'Monthly search volume' },
      { name: 'difficulty', type: 'NUMBER', required: false, defaultValue: 0, description: 'Competition difficulty 0-100' },
      { name: 'currentRank', type: 'NUMBER', required: false, description: 'Current SERP position' },
      { name: 'assignedContentId', type: 'STRING', required: false, description: 'Content asset targeting this keyword' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'project', targetEntity: 'SeoProject', type: 'MANY_TO_ONE', foreignKey: 'projectId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'CONTENT_CREATOR'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'CONTENT_CREATOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'GROWTH_LEAD', 'CONTENT_CREATOR'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'KEYWORD_ADDED',
      onUpdatedEvent: 'KEYWORD_UPDATED',
      onDeletedEvent: 'KEYWORD_REMOVED',
      syncTargets: ['HESTIA8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 20, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  SeoContent: {
    entityId: 'ent-hestia-seocontent',
    entityName: 'SeoContent',
    module: 'HESTIA8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'SEO content asset ID' },
      { name: 'title', type: 'STRING', required: true, description: 'Content title' },
      { name: 'keywordId', type: 'STRING', required: false, description: 'Primary target keyword' },
      { name: 'bodyMarkdown', type: 'STRING', required: false, description: 'Article body in markdown' },
      { name: 'schemaMarkup', type: 'JSON', required: false, description: 'Generated JSON-LD schema block' },
      { name: 'readabilityScore', type: 'NUMBER', required: false, defaultValue: 0, description: 'Content readability index' },
      { name: 'contentStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, IN_REVIEW, APPROVED, PUBLISHED, ARCHIVED' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'keyword', targetEntity: 'Keyword', type: 'MANY_TO_ONE', foreignKey: 'keywordId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR', 'GROWTH_LEAD'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'EDITOR'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'SEO_CONTENT_CREATED',
      onUpdatedEvent: 'SEO_CONTENT_UPDATED',
      onDeletedEvent: 'SEO_CONTENT_ARCHIVED',
      syncTargets: ['HESTIA8', 'VIBE8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 30, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  TravelCircle: {
    entityId: 'ent-social-circle',
    entityName: 'TravelCircle',
    module: 'SOCIAL8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Circle unique ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Circle name' },
      { name: 'topic', type: 'STRING', required: true, description: 'Circle interest topic' },
      { name: 'creatorId', type: 'STRING', required: true, description: 'Founding member user ID' },
      { name: 'memberCount', type: 'NUMBER', required: true, defaultValue: 1, description: 'Current member count' },
      { name: 'visibility', type: 'STRING', required: true, defaultValue: 'PUBLIC', description: 'PUBLIC, PRIVATE, INVITE_ONLY' },
      { name: 'circleStatus', type: 'STRING', required: true, defaultValue: 'ACTIVE', description: 'ACTIVE, ARCHIVED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'discussions', targetEntity: 'Discussion', type: 'ONE_TO_MANY', foreignKey: 'circleId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'CIRCLE_CREATED',
      onUpdatedEvent: 'CIRCLE_UPDATED',
      onDeletedEvent: 'CIRCLE_ARCHIVED',
      syncTargets: ['SOCIAL8', 'VIBE8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 15, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: true, requireApproval: true }
  },

  Discussion: {
    entityId: 'ent-social-discussion',
    entityName: 'Discussion',
    module: 'SOCIAL8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Discussion thread ID' },
      { name: 'circleId', type: 'STRING', required: true, description: 'Parent circle reference' },
      { name: 'authorId', type: 'STRING', required: true, description: 'Thread author user ID' },
      { name: 'title', type: 'STRING', required: true, description: 'Thread title' },
      { name: 'body', type: 'STRING', required: true, description: 'Thread body content' },
      { name: 'replyCount', type: 'NUMBER', required: true, defaultValue: 0, description: 'Reply tally' },
      { name: 'isPinned', type: 'BOOLEAN', required: true, defaultValue: false, description: 'Moderation pin state' },
      { name: 'moderationStatus', type: 'STRING', required: true, defaultValue: 'VISIBLE', description: 'VISIBLE, FLAGGED, HIDDEN, REMOVED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'circle', targetEntity: 'TravelCircle', type: 'MANY_TO_ONE', foreignKey: 'circleId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'SALES_AGENT', 'OPS_EXECUTIVE', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      deleteRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'DISCUSSION_CREATED',
      onUpdatedEvent: 'DISCUSSION_UPDATED',
      onDeletedEvent: 'DISCUSSION_REMOVED',
      syncTargets: ['SOCIAL8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 10, allowRollback: false },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: false, requireApproval: true }
  },

  Place: {
    entityId: 'ent-gem-place',
    entityName: 'Place',
    module: 'GEM8',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Place unique ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Place display name' },
      { name: 'category', type: 'STRING', required: true, description: 'POI category: VIEWPOINT, CAFE, HERITAGE, HIDDEN_GEM' },
      { name: 'coordinates', type: 'JSON', required: true, description: 'Geo coordinates { lat, lng }' },
      { name: 'destinationId', type: 'STRING', required: false, description: 'Parent destination reference' },
      { name: 'images', type: 'ARRAY', required: false, description: 'Place photo gallery URLs' },
      { name: 'verificationStatus', type: 'STRING', required: true, defaultValue: 'PENDING', description: 'PENDING, VERIFIED, REJECTED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'destination', targetEntity: 'Destination', type: 'MANY_TO_ONE', foreignKey: 'destinationId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR', 'GUEST'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'CONTENT_CREATOR'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'PLACE_CREATED',
      onUpdatedEvent: 'PLACE_UPDATED',
      onDeletedEvent: 'PLACE_ARCHIVED',
      syncTargets: ['GEM8', 'VIBE8', 'VOYAGE8']
    },
    versionPolicy: { enabled: true, maxSnapshots: 15, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: false }
  },

  Expense: {
    entityId: 'ent-fin-expense',
    entityName: 'Expense',
    module: 'FINANCE',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Expense ID' },
      { name: 'description', type: 'STRING', required: true, description: 'Expense description' },
      { name: 'category', type: 'STRING', required: true, description: 'TRAVEL, ACCOMMODATION, MARKETING, OPERATIONS, SALARY' },
      { name: 'amount', type: 'NUMBER', required: true, description: 'Expense amount' },
      { name: 'currency', type: 'STRING', required: true, defaultValue: 'INR', description: 'Currency code' },
      { name: 'expenseDate', type: 'DATE', required: true, description: 'Date expense incurred' },
      { name: 'receiptDocumentId', type: 'STRING', required: false, description: 'Attached DMS8 receipt reference' },
      { name: 'expenseStatus', type: 'STRING', required: true, defaultValue: 'PENDING_APPROVAL', description: 'PENDING_APPROVAL, APPROVED, REJECTED, REIMBURSED' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [
      { relationName: 'document', targetEntity: 'Document', type: 'MANY_TO_ONE', foreignKey: 'receiptDocumentId' }
    ],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'AUDITOR'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'FINANCE_MANAGER'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'EXPENSE_RECORDED',
      onUpdatedEvent: 'EXPENSE_UPDATED',
      onDeletedEvent: 'EXPENSE_VOIDED',
      syncTargets: ['ACCOUNTING', 'ERP', 'DMS']
    },
    versionPolicy: { enabled: true, maxSnapshots: 15, allowRollback: false },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: false, requireApproval: true }
  },

  AIAgent: {
    entityId: 'ent-ai-agent',
    entityName: 'AIAgent',
    module: 'AI_PLATFORM',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Agent unique ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Agent display name' },
      { name: 'agentType', type: 'STRING', required: true, description: 'COPILOT, CONTENT, ANALYST, SUPPORT, VOICE' },
      { name: 'systemPrompt', type: 'STRING', required: true, description: 'Configured system prompt' },
      { name: 'tools', type: 'ARRAY', required: false, description: 'Assigned tool identifiers' },
      { name: 'knowledgeSources', type: 'ARRAY', required: false, description: 'Bound knowledge base IDs' },
      { name: 'agentStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, TESTING, DEPLOYED, DISABLED' },
      { name: 'tenantId', type: 'STRING', required: true, description: 'Tenant identifier' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'AI_AGENT_CREATED',
      onUpdatedEvent: 'AI_AGENT_UPDATED',
      onDeletedEvent: 'AI_AGENT_DISABLED',
      syncTargets: ['AI_PLATFORM', 'H8_CORE']
    },
    versionPolicy: { enabled: true, maxSnapshots: 25, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: ['systemPrompt'] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  VoiceCommand: {
    entityId: 'ent-voice-command',
    entityName: 'VoiceCommand',
    module: 'VOICE',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Voice command ID' },
      { name: 'phrase', type: 'STRING', required: true, description: 'Canonical trigger phrase' },
      { name: 'locale', type: 'STRING', required: true, defaultValue: 'en-IN', description: 'Language locale' },
      { name: 'intentMapping', type: 'STRING', required: true, description: 'Resolved intent or CRUDE8 action binding' },
      { name: 'requiredConfirmation', type: 'BOOLEAN', required: true, defaultValue: true, description: 'Whether execution needs spoken confirmation' },
      { name: 'commandVersion', type: 'STRING', required: true, defaultValue: '1.0.0', description: 'Command definition version' },
      { name: 'commandStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, TESTING, PUBLISHED, DISABLED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Tenant identifier' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN', 'PRODUCT_MANAGER', 'SALES_AGENT'],
      updateRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: true,
      dataScopeRule: 'ORGANIZATION'
    },
    events: {
      onCreatedEvent: 'VOICE_COMMAND_CREATED',
      onUpdatedEvent: 'VOICE_COMMAND_UPDATED',
      onDeletedEvent: 'VOICE_COMMAND_DISABLED',
      syncTargets: ['VOICE', 'AI_PLATFORM']
    },
    versionPolicy: { enabled: true, maxSnapshots: 25, allowRollback: true },
    auditPolicy: { logReads: false, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: true, allowAiUpdate: true, requireApproval: true }
  },

  OperationMode: {
    entityId: 'ent-saas-operationmode',
    entityName: 'OperationMode',
    module: 'SAAS_ADMIN',
    version: 1,
    fields: [
      { name: 'id', type: 'STRING', required: true, unique: true, description: 'Operation mode ID' },
      { name: 'name', type: 'STRING', required: true, description: 'Mode name e.g. PEAK_SEASON, MAINTENANCE' },
      { name: 'description', type: 'STRING', required: true, description: 'Mode behavior description' },
      { name: 'featureOverrides', type: 'JSON', required: false, description: 'Feature flag overrides while mode active' },
      { name: 'scheduledRolloverAt', type: 'DATE', required: false, description: 'Timed rollover schedule' },
      { name: 'modeVersion', type: 'STRING', required: true, defaultValue: '1.0.0', description: 'Mode definition version' },
      { name: 'modeStatus', type: 'STRING', required: true, defaultValue: 'DRAFT', description: 'DRAFT, ACTIVE, DISABLED' },
      { name: 'tenantId', type: 'STRING', required: false, description: 'Optional tenant targeting' }
    ],
    relations: [],
    permissions: {
      createRoles: ['SUPER_ADMIN'],
      readRoles: ['SUPER_ADMIN', 'ORG_ADMIN'],
      updateRoles: ['SUPER_ADMIN'],
      deleteRoles: ['SUPER_ADMIN'],
      tenantScoped: false,
      dataScopeRule: 'GLOBAL'
    },
    events: {
      onCreatedEvent: 'OPERATION_MODE_CREATED',
      onUpdatedEvent: 'OPERATION_MODE_UPDATED',
      onDeletedEvent: 'OPERATION_MODE_DISABLED',
      syncTargets: ['SAAS_CONTROL_PLANE', 'H8_CORE']
    },
    versionPolicy: { enabled: true, maxSnapshots: 25, allowRollback: true },
    auditPolicy: { logReads: true, logMutations: true, redactFields: [] },
    aiCapabilities: { allowAiCreation: false, allowAiUpdate: false, requireApproval: true }
  }
};

export class UniversalEntityRegistry {
  /**
   * Get schema for entity
   */
  static getSchema(entity: CRUDEntityName): UniversalEntitySchema | undefined {
    return UNIVERSAL_ENTITY_REGISTRY[entity];
  }

  /**
   * List all registered entities
   */
  static listEntities(): UniversalEntitySchema[] {
    return Object.values(UNIVERSAL_ENTITY_REGISTRY);
  }

  /**
   * Check if entity exists
   */
  static hasEntity(entity: string): entity is CRUDEntityName {
    return entity in UNIVERSAL_ENTITY_REGISTRY;
  }
}
