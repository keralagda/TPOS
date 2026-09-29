/**
 * CRUDE8: UNIVERSAL REAL-TIME CRUD OPERATING LAYER
 * Core Contracts, Entity Registry Definitions, Events, and Pipeline Interfaces.
 */

export type CRUDEntityName =
  | 'Customer'
  | 'Journey'
  | 'Booking'
  | 'Document'
  | 'Invoice'
  | 'Supplier'
  | 'Destination'
  | 'Experience'
  | 'Content'
  | 'Campaign'
  | 'User'
  | 'Tenant'
  | 'FeatureFlag'
  | 'Lead'
  | 'Enquiry'
  | 'Itinerary'
  | 'TourPackage'
  | 'Contract'
  | 'DocumentTemplate'
  | 'Page'
  | 'Component'
  | 'SeoProject'
  | 'Keyword'
  | 'SeoContent'
  | 'TravelCircle'
  | 'Discussion'
  | 'Place'
  | 'Expense'
  | 'AIAgent'
  | 'VoiceCommand'
  | 'OperationMode';

export type CRUDActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export const UNIVERSAL_ACTION_TYPES = [
  'CREATE', 'READ', 'UPDATE', 'DELETE',
  'CLONE', 'ARCHIVE', 'RESTORE', 'PUBLISH', 'UNPUBLISH',
  'APPROVE', 'REJECT', 'ASSIGN', 'TRANSFER',
  'EXPORT', 'IMPORT', 'SHARE', 'SYNC',
  'VERSION', 'ROLLBACK', 'GENERATE', 'TRANSLATE', 'ANALYZE', 'AUTOMATE'
] as const;

export type UniversalActionType = (typeof UNIVERSAL_ACTION_TYPES)[number];

export type CRUDDeleteMode = 'SOFT_DELETE' | 'ARCHIVE' | 'PERMANENT_DELETE';

export type CRUDSyncStatus = 'SYNCED' | 'PENDING' | 'DISPATCHED' | 'FAILED';

export interface FieldDefinition {
  name: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'OBJECT' | 'ARRAY' | 'JSON';
  required: boolean;
  unique?: boolean;
  indexed?: boolean;
  defaultValue?: any;
  validationRegex?: string;
  description: string;
}

export interface EntityRelationDefinition {
  relationName: string;
  targetEntity: CRUDEntityName;
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
  foreignKey: string;
}

export interface EntityPermissionPolicy {
  createRoles: string[];
  readRoles: string[];
  updateRoles: string[];
  deleteRoles: string[];
  tenantScoped: boolean;
  dataScopeRule: 'GLOBAL' | 'ORGANIZATION' | 'WORKSPACE' | 'OWN_RECORDS';
}

export interface EntityEventDefinition {
  onCreatedEvent: string;
  onUpdatedEvent: string;
  onDeletedEvent: string;
  syncTargets: string[]; // Modules to notify e.g. ['CRM', 'TMS', 'ERP', 'ACCOUNTING', 'DMS']
}

export interface UniversalEntitySchema {
  entityId: string;
  entityName: CRUDEntityName;
  module: CRUDE8Module;
  version: number;
  fields: FieldDefinition[];
  relations: EntityRelationDefinition[];
  permissions: EntityPermissionPolicy;
  events: EntityEventDefinition;
  versionPolicy: {
    enabled: boolean;
    maxSnapshots: number;
    allowRollback: boolean;
  };
  auditPolicy: {
    logReads: boolean;
    logMutations: boolean;
    redactFields: string[];
  };
  aiCapabilities: {
    allowAiCreation: boolean;
    allowAiUpdate: boolean;
    requireApproval: boolean;
  };
}

export type CRUDE8Module =
  | 'H8_CORE' | 'VOYAGE8' | 'VIBE8' | 'HESTIA8' | 'DMS8'
  | 'CRM' | 'TMS' | 'ERP' | 'FINANCE'
  | 'SOCIAL8' | 'GEM8' | 'AI_PLATFORM' | 'VOICE' | 'SAAS_ADMIN';

export interface PageRouteBinding {
  route: string;
  view: 'LIST' | 'DETAIL' | 'CREATE' | 'EDIT' | 'DASHBOARD' | 'EMBEDDED';
}

export interface AutomationRuleDefinition {
  automationId: string;
  name: string;
  trigger: string;
  actions: string[];
}

export interface SyncRuleDefinition {
  target: string;
  trigger: string;
  mode: 'REALTIME' | 'BATCH' | 'ON_DEMAND';
}

export interface EntityCapabilityProfile {
  entityId: string;
  entityName: CRUDEntityName;
  module: CRUDE8Module;
  displayName: string;
  pages: PageRouteBinding[];
  crudActions: CRUDActionType[];
  bulkActions: UniversalActionType[];
  workflowActions: UniversalActionType[];
  actionPermissions: Record<UniversalActionType, string[]>;
  events: string[];
  actionEvents: Partial<Record<UniversalActionType, string>>;
  automations: AutomationRuleDefinition[];
  aiActions: string[];
  reports: string[];
  syncRules: SyncRuleDefinition[];
  lifecycleField: string;
  lifecycleTransitions: Partial<Record<UniversalActionType, string>>;
  assigneeField?: string;
}

export interface CRUDStandardResponse<T = any> {
  success: boolean;
  data: T;
  metadata: {
    entity: CRUDEntityName;
    action: CRUDActionType;
    universalAction?: UniversalActionType;
    count?: number;
    page?: number;
    pageSize?: number;
    timestamp: string;
  };
  version: number;
  events: string[];
  auditId: string;
  syncStatus: CRUDSyncStatus;
}

export interface CRUDBroadcastEvent {
  eventId: string;
  entity: CRUDEntityName;
  action: CRUDActionType;
  actor: {
    userId: string;
    role: string;
    tenantId: string;
  };
  tenantId: string;
  timestamp: string;
  payload: Record<string, any>;
  version: number;
}
