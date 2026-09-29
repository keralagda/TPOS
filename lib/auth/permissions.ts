/**
 * Travel Planet (Voyage8) — RBAC Granular Permission Registry
 * Format: <DOMAIN>.<RESOURCE>.<ACTION>
 */

export interface PermissionDefinition {
  code: string;
  domain: string;
  resource: string;
  action: string;
  description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Dashboard
  { code: 'dashboard.view', domain: 'dashboard', resource: 'dashboard', action: 'view', description: 'View executive and operational overview dashboards' },

  // Users
  { code: 'users.view', domain: 'users', resource: 'user', action: 'view', description: 'View user profiles and account metadata' },
  { code: 'users.create', domain: 'users', resource: 'user', action: 'create', description: 'Provision new system user accounts' },
  { code: 'users.update', domain: 'users', resource: 'user', action: 'update', description: 'Modify user profiles, status and workspace memberships' },
  { code: 'users.delete', domain: 'users', resource: 'user', action: 'delete', description: 'Deactivate or soft-delete user accounts' },

  // Roles
  { code: 'roles.view', domain: 'roles', resource: 'role', action: 'view', description: 'Inspect role definitions and permission mappings' },
  { code: 'roles.create', domain: 'roles', resource: 'role', action: 'create', description: 'Author new custom role definitions' },
  { code: 'roles.update', domain: 'roles', resource: 'role', action: 'update', description: 'Modify custom role scopes and permission sets' },
  { code: 'roles.delete', domain: 'roles', resource: 'role', action: 'delete', description: 'Delete non-system custom roles' },

  // Customers
  { code: 'customers.view', domain: 'customers', resource: 'customer', action: 'view', description: 'View customer accounts and travel profiles' },
  { code: 'customers.create', domain: 'customers', resource: 'customer', action: 'create', description: 'Register new customers into directory' },
  { code: 'customers.update', domain: 'customers', resource: 'customer', action: 'update', description: 'Update customer details and preferences' },
  { code: 'customers.delete', domain: 'customers', resource: 'customer', action: 'delete', description: 'Remove customer records' },
  { code: 'customers.export', domain: 'customers', resource: 'customer', action: 'export', description: 'Export customer directory records to CSV/JSON' },

  // Leads
  { code: 'leads.view', domain: 'leads', resource: 'lead', action: 'view', description: 'View incoming traveler inquiries and leads' },
  { code: 'leads.create', domain: 'leads', resource: 'lead', action: 'create', description: 'Create and capture new traveler sales leads' },
  { code: 'leads.update', domain: 'leads', resource: 'lead', action: 'update', description: 'Update lead pipeline stage and notes' },
  { code: 'leads.assign', domain: 'leads', resource: 'lead', action: 'assign', description: 'Reassign leads across travel agent desks' },

  // Bookings
  { code: 'bookings.view', domain: 'bookings', resource: 'booking', action: 'view', description: 'View reservation summaries and booking details' },
  { code: 'bookings.create', domain: 'bookings', resource: 'booking', action: 'create', description: 'Initiate and book new travel reservations' },
  { code: 'bookings.update', domain: 'bookings', resource: 'booking', action: 'update', description: 'Modify traveler info and booking dates' },
  { code: 'bookings.cancel', domain: 'bookings', resource: 'booking', action: 'cancel', description: 'Initiate booking cancellation workflow' },
  { code: 'bookings.refund', domain: 'bookings', resource: 'booking', action: 'refund', description: 'Process or authorize booking refunds' },

  // Trips & Itineraries
  { code: 'trips.view', domain: 'trips', resource: 'trip', action: 'view', description: 'View trip itineraries and day-by-day plans' },
  { code: 'trips.create', domain: 'trips', resource: 'trip', action: 'create', description: 'Create new passenger trips and milestones' },
  { code: 'trips.update', domain: 'trips', resource: 'trip', action: 'update', description: 'Modify trip details and activities' },
  { code: 'trips.manage', domain: 'trips', resource: 'trip', action: 'manage', description: 'Full operational control over trip execution' },

  { code: 'itineraries.view', domain: 'itineraries', resource: 'itinerary', action: 'view', description: 'View synthesized multi-day itineraries' },
  { code: 'itineraries.create', domain: 'itineraries', resource: 'itinerary', action: 'create', description: 'Synthesize new AI itineraries' },
  { code: 'itineraries.update', domain: 'itineraries', resource: 'itinerary', action: 'update', description: 'Customize day-wise route pacing' },

  // Vendors & Inventory
  { code: 'vendors.view', domain: 'vendors', resource: 'vendor', action: 'view', description: 'View supplier profiles and contract terms' },
  { code: 'vendors.create', domain: 'vendors', resource: 'vendor', action: 'create', description: 'Onboard new supplier or DMC partners' },
  { code: 'vendors.update', domain: 'vendors', resource: 'vendor', action: 'update', description: 'Update vendor master details and banking' },
  { code: 'vendors.approve', domain: 'vendors', resource: 'vendor', action: 'approve', description: 'Approve vendor contracts and KYC compliance' },

  { code: 'inventory.view', domain: 'inventory', resource: 'inventory', action: 'view', description: 'Inspect room, flight, and tour stock' },
  { code: 'inventory.create', domain: 'inventory', resource: 'inventory', action: 'create', description: 'Upload and allocate new inventory batches' },
  { code: 'inventory.update', domain: 'inventory', resource: 'inventory', action: 'update', description: 'Mutate pricing and availability counts' },
  { code: 'inventory.publish', domain: 'inventory', resource: 'inventory', action: 'publish', description: 'Publish supplier inventory to marketplace' },

  // Offers
  { code: 'offers.view', domain: 'offers', resource: 'offer', action: 'view', description: 'View packaged deals and curated promotions' },
  { code: 'offers.create', domain: 'offers', resource: 'offer', action: 'create', description: 'Draft new seasonal and exclusive offers' },
  { code: 'offers.update', domain: 'offers', resource: 'offer', action: 'update', description: 'Edit offer terms, pricing and inclusions' },
  { code: 'offers.publish', domain: 'offers', resource: 'offer', action: 'publish', description: 'Publish offers to consumer portal' },

  // Payments & Finance
  { code: 'payments.view', domain: 'payments', resource: 'payment', action: 'view', description: 'Inspect gateway transactions and checkout receipts' },
  { code: 'payments.create', domain: 'payments', resource: 'payment', action: 'create', description: 'Initiate payment intents and collection links' },
  { code: 'payments.verify', domain: 'payments', resource: 'payment', action: 'verify', description: 'Reconcile gateway webhooks and proof of payment' },
  { code: 'payments.refund', domain: 'payments', resource: 'payment', action: 'refund', description: 'Trigger gateway refund disbursements' },

  { code: 'finance.view', domain: 'finance', resource: 'finance', action: 'view', description: 'View profit margins and revenue streams' },
  { code: 'finance.manage', domain: 'finance', resource: 'finance', action: 'manage', description: 'Treasury controls, bank accounts and credit limits' },

  { code: 'accounting.view', domain: 'accounting', resource: 'accounting', action: 'view', description: 'Inspect general ledger and journal vouchers' },
  { code: 'accounting.manage', domain: 'accounting', resource: 'accounting', action: 'manage', description: 'Post manual journals, period close and ledger adjustments' },

  { code: 'settlements.view', domain: 'settlements', resource: 'settlement', action: 'view', description: 'View vendor settlement batches' },
  { code: 'settlements.create', domain: 'settlements', resource: 'settlement', action: 'create', description: 'Generate vendor payable settlement runs' },
  { code: 'settlements.approve', domain: 'settlements', resource: 'settlement', action: 'approve', description: 'Authorize payout transfers to supplier accounts' },

  // Integrations & Webhooks & Sync
  { code: 'integrations.view', domain: 'integrations', resource: 'integration', action: 'view', description: 'View connected GDS and supplier API adapters' },
  { code: 'integrations.create', domain: 'integrations', resource: 'integration', action: 'create', description: 'Register new API connector instances' },
  { code: 'integrations.update', domain: 'integrations', resource: 'integration', action: 'update', description: 'Update connector vault credentials and settings' },
  { code: 'integrations.activate', domain: 'integrations', resource: 'integration', action: 'activate', description: 'Enable production connector routing' },
  { code: 'integrations.disable', domain: 'integrations', resource: 'integration', action: 'disable', description: 'Trip circuit breaker or disable connector' },

  { code: 'webhooks.view', domain: 'webhooks', resource: 'webhook', action: 'view', description: 'Inspect inbound and outbound webhook event logs' },
  { code: 'webhooks.manage', domain: 'webhooks', resource: 'webhook', action: 'manage', description: 'Rotate HMAC signing keys and configure webhook endpoints' },

  { code: 'sync.view', domain: 'sync', resource: 'sync', action: 'view', description: 'View inventory sync job schedules and queue telemetry' },
  { code: 'sync.run', domain: 'sync', resource: 'sync', action: 'run', description: 'Trigger manual inventory reconciliation sync' },
  { code: 'sync.retry', domain: 'sync', resource: 'sync', action: 'retry', description: 'Retry failed connector sync batches' },

  // AI
  { code: 'ai.view', domain: 'ai', resource: 'ai', action: 'view', description: 'View Voyage8 cognitive agent conversations' },
  { code: 'ai.chat', domain: 'ai', resource: 'ai', action: 'chat', description: 'Interact with conversational travel co-pilot' },
  { code: 'ai.insights', domain: 'ai', resource: 'ai', action: 'insights', description: 'Access predictive demand and pricing analytics' },
  { code: 'ai.actions', domain: 'ai', resource: 'ai', action: 'actions', description: 'Execute low-risk reversible AI autonomous actions' },
  { code: 'ai.configure', domain: 'ai', resource: 'ai', action: 'configure', description: 'Configure AI system prompts, skill registries and safety limits' },

  // Content
  { code: 'content.view', domain: 'content', resource: 'content', action: 'view', description: 'Browse destination directory content' },
  { code: 'content.create', domain: 'content', resource: 'content', action: 'create', description: 'Author new destination guides and articles' },
  { code: 'content.update', domain: 'content', resource: 'content', action: 'update', description: 'Edit media assets and travel guides' },
  { code: 'content.publish', domain: 'content', resource: 'content', action: 'publish', description: 'Publish content to public directory portal' },

  // Marketing
  { code: 'marketing.view', domain: 'marketing', resource: 'marketing', action: 'view', description: 'View promotional campaigns and coupon codes' },
  { code: 'marketing.create', domain: 'marketing', resource: 'marketing', action: 'create', description: 'Draft campaigns and referral programs' },
  { code: 'marketing.publish', domain: 'marketing', resource: 'marketing', action: 'publish', description: 'Broadcast marketing campaigns across channels' },

  // Analytics
  { code: 'analytics.view', domain: 'analytics', resource: 'analytics', action: 'view', description: 'View GTM conversion metrics and revenue dashboards' },
  { code: 'analytics.export', domain: 'analytics', resource: 'analytics', action: 'export', description: 'Export business intelligence reporting data' },

  // Audit
  { code: 'audit.view', domain: 'audit', resource: 'audit', action: 'view', description: 'Inspect immutable system security and compliance audit logs' },

  // Settings
  { code: 'settings.view', domain: 'settings', resource: 'settings', action: 'view', description: 'View platform branding and organizational configuration' },
  { code: 'settings.manage', domain: 'settings', resource: 'settings', action: 'manage', description: 'Mutate organization settings, domains and white-label themes' },

  // VIBE — Visual Intelligence & Builder Engine
  { code: 'vibe.view', domain: 'content', resource: 'experience', action: 'view', description: 'View experiences, templates and registry definitions in VIBE' },
  { code: 'vibe.create', domain: 'content', resource: 'experience', action: 'create', description: 'Create experiences and compose sections in the VIBE builder' },
  { code: 'vibe.edit', domain: 'content', resource: 'experience', action: 'edit', description: 'Edit draft compositions, bindings and actions in VIBE' },
  { code: 'vibe.publish', domain: 'content', resource: 'experience', action: 'publish', description: 'Publish or rollback immutable experience versions (consequential)' },
  { code: 'vibe.view_drafts', domain: 'content', resource: 'experience', action: 'view_drafts', description: 'Preview unpublished draft experiences via secured preview tokens' },
  { code: 'vibe.manage_components', domain: 'content', resource: 'registry', action: 'manage', description: 'Create and version Component, Section, Template and Widget registry objects' },
  { code: 'vibe.manage_design_system', domain: 'content', resource: 'design_system', action: 'manage', description: 'Govern design tokens, themes and style variants centrally' },
  { code: 'vibe.manage_workspaces', domain: 'content', resource: 'workspace_composition', action: 'manage', description: 'Compose role-based workspaces and dashboards (RBWA)' },
  { code: 'places.manage', domain: 'content', resource: 'place', action: 'manage', description: 'Manage first-class Place entities and their relationships' },
  { code: 'diaries.manage', domain: 'content', resource: 'diary', action: 'manage', description: 'Moderate PlaceDiary submissions through the publish workflow' },
  { code: 'diaries.publish', domain: 'content', resource: 'diary', action: 'publish', description: 'Publish traveler diaries publicly (consequential)' },
  { code: 'journeys.manage', domain: 'content', resource: 'journey', action: 'manage', description: 'Manage curated and traveler-planned journeys' },
];

export type PermissionCode = typeof PERMISSION_DEFINITIONS[number]['code'];

/** Full permission definition list (array form for counting/enumeration) */
export const ALL_PERMISSIONS: typeof PERMISSION_DEFINITIONS = PERMISSION_DEFINITIONS;

export const ALL_PERMISSION_CODES: Set<string> = new Set(PERMISSION_DEFINITIONS.map(p => p.code));
