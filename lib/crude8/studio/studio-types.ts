/**
 * CRUDE8 STUDIO: VISUAL CRUD APPLICATION BUILDER + REALTIME SIMULATION PLATFORM
 * Type contracts for the Studio layer: projects, schema, UI composition,
 * actions, workflows, permissions, events, automations, sandbox, versions,
 * templates and deployments.
 *
 * DOCTRINE: DEFINE ONCE. SIMULATE SAFELY. GENERATE EVERYWHERE.
 */

import { CRUDE8Module, UniversalActionType } from '../types';

// ============================================================
// FIELD & SCHEMA
// ============================================================

export type StudioFieldType =
  | 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN'
  | 'EMAIL' | 'PHONE' | 'TEXTAREA' | 'RICHTEXT'
  | 'FILE' | 'IMAGE' | 'RELATION' | 'AI' | 'VOICE' | 'SIGNATURE' | 'MAP';

export interface StudioField {
  name: string;
  label: string;
  type: StudioFieldType;
  required: boolean;
  unique?: boolean;
  defaultValue?: any;
  options?: string[];
  relationEntity?: string;
  aiPrompt?: string;
  helpText?: string;
}

export interface StudioRelation {
  relationName: string;
  targetEntity: string;
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
  foreignKey: string;
}

export type StudioMode = 'CRM' | 'TMS' | 'ERP' | 'FINANCE' | 'DMS' | 'CMS' | 'SEO' | 'SOCIAL';

// ============================================================
// UI COMPOSITION (VISUAL CRUD BUILDER OUTPUT)
// ============================================================

export type StudioListViewType =
  | 'TABLE' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'CARDS' | 'GRID' | 'CHARTS' | 'ANALYTICS';

export type StudioSectionLayout =
  | 'SECTION' | 'CARD' | 'TABS' | 'STEPS' | 'DRAWER' | 'MODAL' | 'PANEL';

export interface StudioFormFieldPlacement {
  field: string;
  component: StudioFieldType;
  config?: Record<string, any>;
}

export interface StudioFormSection {
  sectionId: string;
  title: string;
  layout: StudioSectionLayout;
  columns: 1 | 2 | 3;
  fields: StudioFormFieldPlacement[];
}

export interface StudioUiSpec {
  listView: {
    type: StudioListViewType;
    columns: string[];
    filters: string[];
    bulkActions: UniversalActionType[];
    rowActions: UniversalActionType[];
  };
  formView: { sections: StudioFormSection[] };
  detailView: { layout: 'SECTION' | 'TABS' | 'STEPS'; widgets: string[] };
  dashboard: {
    stats: { label: string; field: string; agg: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' }[];
    charts: { title: string; type: 'BAR' | 'LINE' | 'PIE' | 'AREA'; groupBy: string }[];
  };
}

// ============================================================
// PERMISSIONS
// ============================================================

export interface StudioPermissionRule {
  role: string;
  action: UniversalActionType;
  allowed: boolean;
  scope: 'GLOBAL' | 'ORGANIZATION' | 'WORKSPACE' | 'OWN_RECORDS';
  condition?: string;
}

export interface StudioProjectPermissions {
  roles: string[];
  rules: StudioPermissionRule[];
}

// ============================================================
// ACTIONS & WORKFLOWS
// ============================================================

export type StudioActionStepType =
  | 'VALIDATE' | 'PERMISSION_CHECK' | 'CREATE_RECORD' | 'UPDATE_RECORD' | 'DELETE_RECORD'
  | 'GENERATE_EVENT' | 'SEND_NOTIFICATION' | 'UPDATE_ANALYTICS'
  | 'AI_STEP' | 'API_CALL' | 'CONDITION' | 'APPROVAL' | 'DELAY' | 'HUMAN_REVIEW';

export interface StudioActionStep {
  stepId: string;
  type: StudioActionStepType;
  label: string;
  config: Record<string, any>;
}

export interface StudioActionDefinition {
  actionId: string;
  name: string;
  entity: string;
  trigger: 'BUTTON_CLICK' | 'EVENT' | 'SCHEDULE' | 'MANUAL';
  description: string;
  steps: StudioActionStep[];
}

export type StudioWorkflowNodeType =
  | 'TRIGGER' | 'CONDITION' | 'ACTION' | 'APPROVAL' | 'NOTIFICATION'
  | 'AI_STEP' | 'API_CALL' | 'DATABASE_UPDATE' | 'DELAY' | 'HUMAN_REVIEW';

export interface StudioWorkflowNode {
  nodeId: string;
  type: StudioWorkflowNodeType;
  name: string;
  config: Record<string, any>;
  next?: string;
  nextTrue?: string;
  nextFalse?: string;
}

export interface StudioWorkflowDefinition {
  workflowId: string;
  name: string;
  entity: string;
  triggerEvent: string;
  startNodeId: string;
  nodes: StudioWorkflowNode[];
}

// ============================================================
// EVENTS & AUTOMATIONS
// ============================================================

export interface StudioEventDefinition {
  eventName: string;
  description: string;
  trigger: string;
  payloadFields: string[];
  subscribers: string[];
  actions: string[];
}

export interface StudioAutomationDefinition {
  automationId: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
}

// ============================================================
// PROJECT (THE COMPLETE BUILT MODULE)
// ============================================================

export type StudioProjectStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DEPLOYED';

export interface StudioModuleProject {
  projectId: string;
  name: string;
  description: string;
  mode: StudioMode;
  module: CRUDE8Module;
  entityName: string;
  lifecycleField: string;
  lifecycleTransitions: Partial<Record<UniversalActionType, string>>;
  fields: StudioField[];
  relations: StudioRelation[];
  ui: StudioUiSpec;
  actions: StudioActionDefinition[];
  workflows: StudioWorkflowDefinition[];
  permissions: StudioProjectPermissions;
  events: StudioEventDefinition[];
  automations: StudioAutomationDefinition[];
  aiActions: string[];
  reports: string[];
  syncTargets: string[];
  status: StudioProjectStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  origin: 'MANUAL' | 'AI_GENERATED' | 'TEMPLATE';
  originPrompt?: string;
  templateId?: string;
}

// ============================================================
// VERSIONS
// ============================================================

export interface StudioProjectVersion {
  versionId: string;
  projectId: string;
  version: number;
  timestamp: string;
  actor: string;
  summary: string;
  diffSummary: string[];
  snapshot: StudioModuleProject;
}

// ============================================================
// SANDBOX
// ============================================================

export type SandboxPersona = 'ADMIN' | 'MANAGER' | 'AGENT' | 'CUSTOMER' | 'SUPPLIER';

export const SANDBOX_PERSONA_USERS: Record<SandboxPersona, { userId: string; role: string; tenantId: string }> = {
  ADMIN: { userId: 'sbx-admin', role: 'SUPER_ADMIN', tenantId: 'sandbox-tenant' },
  MANAGER: { userId: 'sbx-manager', role: 'ORG_ADMIN', tenantId: 'sandbox-tenant' },
  AGENT: { userId: 'sbx-agent', role: 'SALES_AGENT', tenantId: 'sandbox-tenant' },
  CUSTOMER: { userId: 'sbx-customer', role: 'GUEST', tenantId: 'sandbox-tenant' },
  SUPPLIER: { userId: 'sbx-supplier', role: 'SUPPLIER', tenantId: 'sandbox-tenant' }
};

export interface SandboxAuditEntry {
  auditId: string;
  timestamp: string;
  actor: string;
  entity: string;
  action: string;
  recordId?: string;
  detail: string;
  previousHash: string;
  entryHash: string;
}

export interface SandboxEventEntry {
  eventId: string;
  eventName: string;
  entity: string;
  timestamp: string;
  payload: Record<string, any>;
  subscribers: string[];
  automationsTriggered: string[];
}

export interface WorkflowTraceEntry {
  nodeId: string;
  type: StudioWorkflowNodeType;
  name: string;
  status: 'EXECUTED' | 'SKIPPED' | 'AUTO_APPROVED' | 'MOCKED' | 'FAILED';
  detail: string;
  timestamp: string;
}

export interface SandboxState {
  sandboxId: string;
  projectId: string;
  createdAt: string;
  stores: Map<string, Map<string, Record<string, any>>>;
  versionCounters: Map<string, number>;
  auditChain: SandboxAuditEntry[];
  events: SandboxEventEntry[];
  workflowTraces: WorkflowTraceEntry[][];
  latestHash: string;
}

export interface SandboxActionResult {
  success: boolean;
  action: string;
  record?: Record<string, any>;
  records?: Record<string, any>[];
  version?: number;
  auditId?: string;
  events: string[];
  automationsTriggered: string[];
  error?: string;
}

// ============================================================
// TEMPLATES & DEPLOYMENT
// ============================================================

export interface StudioTemplateMeta {
  templateId: string;
  name: string;
  description: string;
  category: StudioMode;
  keywords: string[];
  installs: number;
  entityName: string;
}

export interface StudioDeployment {
  deploymentId: string;
  projectId: string;
  projectName: string;
  entityName: string;
  version: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DEPLOYED';
  requestedBy: string;
  requestedAt: string;
  approver?: string;
  approvedAt?: string;
  notes?: string;
  previousHash: string;
  entryHash: string;
}

export interface DeployedRuntimeModule {
  entityName: string;
  projectId: string;
  projectName: string;
  module: CRUDE8Module;
  deployedAt: string;
  deployedVersion: number;
  fields: { name: string; type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'JSON'; required: boolean; unique: boolean }[];
  permissionRules: StudioPermissionRule[];
  syncTargets: string[];
}

export interface StudioLogEntry {
  timestamp: string;
  source: 'BUILDER' | 'SIMULATOR' | 'DEPLOYMENT' | 'GENERATOR' | 'SYSTEM';
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}
