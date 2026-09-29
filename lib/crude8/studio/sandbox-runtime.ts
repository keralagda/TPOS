/**
 * CRUDE8 STUDIO: SANDBOX RUNTIME
 * A fully isolated governed runtime for simulating built modules before
 * deployment. NEVER touches CRUDE8Engine production stores — every sandbox
 * has its own record stores, audit chain, event log and workflow traces.
 *
 * Governance pipeline (mirrors production): validation -> permission ->
 * database change -> version -> audit -> event -> automation.
 */

import crypto from 'crypto';
import {
  StudioModuleProject,
  SandboxState,
  SandboxActionResult,
  SandboxPersona,
  SANDBOX_PERSONA_USERS,
  SandboxAuditEntry
} from './studio-types';
import { UniversalActionType } from '../types';
import { StudioDataMockEngine } from './data-mock-engine';
import { StudioWorkflowEngine, WorkflowExecutorContext } from './workflow-engine';

const LIFECYCLE_ACTIONS: Partial<Record<string, string>> = {
  PUBLISH: 'PUBLISH', UNPUBLISH: 'UNPUBLISH', APPROVE: 'APPROVE', REJECT: 'REJECT',
  ARCHIVE: 'ARCHIVE', RESTORE: 'RESTORE'
};

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Pin sandboxes on globalThis so all API route bundles share one registry
// (Next.js dev isolates module instances per route).
const globalRef = globalThis as typeof globalThis & { __crude8StudioSandboxes?: Map<string, SandboxState> };
const sandboxes: Map<string, SandboxState> = globalRef.__crude8StudioSandboxes ?? (globalRef.__crude8StudioSandboxes = new Map());

export class StudioSandboxRuntime {
  private static readonly MAX_SANDBOXES = 20;

  // ----------------------------------------------------------
  // Lifecycle
  // ----------------------------------------------------------

  static createSandbox(project: StudioModuleProject, seedCounts?: Record<string, number>): SandboxState {
    // Bound memory: evict the oldest sandbox when over budget
    if (sandboxes.size >= this.MAX_SANDBOXES) {
      const oldest = Array.from(sandboxes.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
      if (oldest) sandboxes.delete(oldest.sandboxId);
    }

    const sandboxId = `sbx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const state: SandboxState = {
      sandboxId,
      projectId: project.projectId,
      createdAt: new Date().toISOString(),
      stores: new Map(),
      versionCounters: new Map(),
      auditChain: [],
      events: [],
      workflowTraces: [],
      latestHash: '0'.repeat(64)
    };
    sandboxes.set(sandboxId, state);

    this.seedMockData(state, project, seedCounts);
    this.appendAudit(state, 'SYSTEM', project.entityName, 'SANDBOX_CREATED', undefined, `Sandbox created for project '${project.name}'`);
    return state;
  }

  static seedMockData(state: SandboxState, project: StudioModuleProject, seedCounts?: Record<string, number>): Record<string, any>[] {
    const count = seedCounts?.[project.entityName] ?? 25;
    const relatedSpec: Record<string, { project: StudioModuleProject; count: number }> | undefined = undefined;
    const records = StudioDataMockEngine.generateMockRecords(project, { count, includeEdgeCases: true, relatedIds: {} });
    void relatedSpec;

    const store = this.getStore(state, project.entityName);
    for (const record of records) {
      store.set(record.id, record);
      state.versionCounters.set(record.id, 1);
    }
    return records;
  }

  static getSandbox(sandboxId: string): SandboxState | undefined {
    return sandboxes.get(sandboxId);
  }

  static destroySandbox(sandboxId: string): boolean {
    return sandboxes.delete(sandboxId);
  }

  static listSandboxes(): { sandboxId: string; projectId: string; createdAt: string; entities: string[] }[] {
    return Array.from(sandboxes.values()).map(s => ({
      sandboxId: s.sandboxId,
      projectId: s.projectId,
      createdAt: s.createdAt,
      entities: Array.from(s.stores.keys())
    }));
  }

  // ----------------------------------------------------------
  // Governed record execution
  // ----------------------------------------------------------

  static execAction(
    state: SandboxState,
    project: StudioModuleProject,
    action: UniversalActionType | string,
    user: { userId: string; role: string; tenantId: string },
    params: { id?: string; payload?: Record<string, any>; filters?: Record<string, any> } = {}
  ): SandboxActionResult {
    const store = this.getStore(state, project.entityName);
    const payload = params.payload || {};
    const events: string[] = [];
    let automationsTriggered: string[] = [];

    const existing = params.id ? store.get(params.id) : undefined;
    if (action !== 'CREATE' && params.id && !existing) {
      return { success: false, action, events, automationsTriggered, error: `Not Found: ${project.entityName} '${params.id}' does not exist in sandbox.` };
    }

    // 1. Permission gate
    const perm = this.evaluatePermission(project, action as UniversalActionType, user, existing);
    if (!perm.allowed) {
      this.appendAudit(state, user.userId, project.entityName, `DENIED_${action}`, params.id, perm.reason || 'Permission denied');
      return { success: false, action, events, automationsTriggered, error: `Permission Denied: ${perm.reason}` };
    }

    switch (action) {
      case 'CREATE': {
        // 2. Validation gate
        const missing = project.fields.filter(f => f.required && (payload[f.name] === undefined || payload[f.name] === null || payload[f.name] === ''));
        if (missing.length > 0) {
          return { success: false, action, events, automationsTriggered, error: `Validation Error: missing required field(s) ${missing.map(f => f.name).join(', ')}` };
        }
        const id = payload.id || `${project.entityName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const record: Record<string, any> = { ...payload, id, version: 1, createdAt: new Date().toISOString() };
        store.set(id, record);
        state.versionCounters.set(id, 1);
        events.push(`${project.entityName.toUpperCase()}_CREATED`);
        automationsTriggered = this.fireEvent(state, project, events[0], record);
        this.appendAudit(state, user.userId, project.entityName, 'CREATE', id, `Created ${project.entityName} v1`);
        return { success: true, action, record, version: 1, auditId: state.auditChain[0]?.auditId, events, automationsTriggered };
      }

      case 'READ': {
        const filters = params.filters || {};
        let results = Array.from(store.values()).filter(r => !r.deletedAt);
        for (const [key, value] of Object.entries(filters)) {
          if (value === undefined || value === null || value === '') continue;
          results = results.filter(r => String(r[key]) === String(value) || (Array.isArray(r[key]) && r[key].includes(value)));
        }
        const textFilter = filters.$text;
        if (textFilter) {
          const lower = String(textFilter).toLowerCase();
          results = results.filter(r => JSON.stringify(r).toLowerCase().includes(lower));
        }
        return { success: true, action, records: results, events, automationsTriggered };
      }

      case 'UPDATE': {
        if (!existing) return { success: false, action, events, automationsTriggered, error: 'Validation Error: UPDATE requires params.id.' };
        const newVersion = (state.versionCounters.get(existing.id) || 1) + 1;
        const updated: Record<string, any> = { ...existing, ...payload, id: existing.id, version: newVersion, updatedAt: new Date().toISOString() };
        store.set(existing.id, updated);
        state.versionCounters.set(existing.id, newVersion);
        events.push(`${project.entityName.toUpperCase()}_UPDATED`);
        automationsTriggered = this.fireEvent(state, project, events[0], updated);
        this.appendAudit(state, user.userId, project.entityName, 'UPDATE', existing.id, `Updated ${project.entityName} to v${newVersion}`);
        return { success: true, action, record: updated, version: newVersion, auditId: state.auditChain[0]?.auditId, events, automationsTriggered };
      }

      case 'DELETE': {
        if (!existing) return { success: false, action, events, automationsTriggered, error: 'Validation Error: DELETE requires params.id.' };
        const softDeleted: Record<string, any> = { ...existing, deletedAt: new Date().toISOString(), deletedBy: user.userId };
        store.set(existing.id, softDeleted);
        events.push(`${project.entityName.toUpperCase()}_DELETED`);
        automationsTriggered = this.fireEvent(state, project, events[0], softDeleted);
        this.appendAudit(state, user.userId, project.entityName, 'DELETE', existing.id, `Soft-deleted ${project.entityName}`);
        return { success: true, action, record: softDeleted, auditId: state.auditChain[0]?.auditId, events, automationsTriggered };
      }

      default: {
        // Lifecycle actions via transitions (PUBLISH, APPROVE, ARCHIVE, ...)
        if (existing && LIFECYCLE_ACTIONS[action]) {
          const transition = project.lifecycleTransitions[action as UniversalActionType];
          if (transition === undefined) {
            return { success: false, action, events, automationsTriggered, error: `Capability Error: '${project.entityName}' does not define a '${action}' lifecycle transition.` };
          }
          const newVersion = (state.versionCounters.get(existing.id) || 1) + 1;
          const updated: Record<string, any> = { ...existing, [project.lifecycleField]: transition, version: newVersion, updatedAt: new Date().toISOString() };
          store.set(existing.id, updated);
          state.versionCounters.set(existing.id, newVersion);
          events.push(`${project.entityName.toUpperCase()}_${action}`);
          automationsTriggered = this.fireEvent(state, project, events[0], updated);
          this.appendAudit(state, user.userId, project.entityName, action, existing.id, `Lifecycle ${action} -> ${transition} (v${newVersion})`);
          return { success: true, action, record: updated, version: newVersion, auditId: state.auditChain[0]?.auditId, events, automationsTriggered };
        }
        return { success: false, action, events, automationsTriggered, error: `Unsupported sandbox action '${action}'.` };
      }
    }
  }

  // ----------------------------------------------------------
  // Permission simulation
  // ----------------------------------------------------------

  static evaluatePermission(
    project: StudioModuleProject,
    action: UniversalActionType,
    user: { userId: string; role: string; tenantId: string },
    record?: Record<string, any>
  ): { allowed: boolean; reason?: string; matchedRule?: string } {
    const rule = project.permissions.rules.find(r => r.role === user.role && r.action === action);

    if (rule) {
      if (!rule.allowed) {
        return { allowed: false, reason: `Role '${user.role}' is explicitly denied '${action}' by studio rule`, matchedRule: `${rule.role}:${rule.action}` };
      }
      if (rule.scope === 'OWN_RECORDS' && record) {
        const owner = record.ownerId ?? record.createdBy ?? record.assigneeId;
        if (owner && owner !== user.userId) {
          return { allowed: false, reason: `Scope '${rule.scope}': record is owned by '${owner}', not '${user.userId}'`, matchedRule: `${rule.role}:${rule.action}` };
        }
      }
      return { allowed: true, matchedRule: `${rule.role}:${rule.action}` };
    }

    // Default governance when no explicit rule matches
    if (user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN') return { allowed: true, matchedRule: 'DEFAULT_ADMIN' };
    if (user.role === 'GUEST') {
      return action === 'READ'
        ? { allowed: true, matchedRule: 'DEFAULT_GUEST_READONLY' }
        : { allowed: false, reason: `Role 'GUEST' has read-only default access — '${action}' denied` };
    }
    if (user.role === 'SALES_AGENT' || user.role === 'SUPPLIER') {
      return (action === 'CREATE' || action === 'READ' || action === 'UPDATE')
        ? { allowed: true, matchedRule: 'DEFAULT_STAFF_CRU' }
        : { allowed: false, reason: `Role '${user.role}' default policy denies '${action}' (destructive actions reserved for admins)` };
    }
    return { allowed: false, reason: `Role '${user.role}' has no permission mapping for '${action}'` };
  }

  static simulatePermission(
    state: SandboxState,
    project: StudioModuleProject,
    persona: SandboxPersona,
    action: UniversalActionType,
    recordId?: string
  ): { persona: SandboxPersona; user: typeof SANDBOX_PERSONA_USERS[SandboxPersona]; allowed: boolean; reason?: string; matchedRule?: string } {
    const user = SANDBOX_PERSONA_USERS[persona];
    const record = recordId ? this.getStore(state, project.entityName).get(recordId) : undefined;
    const result = this.evaluatePermission(project, action, user, record);
    this.appendAudit(state, user.userId, project.entityName, `PERMISSION_SIM_${action}`, recordId, `${persona}: ${result.allowed ? 'ALLOWED' : 'DENIED'} — ${result.reason || result.matchedRule}`);
    return { persona, user, ...result };
  }

  // ----------------------------------------------------------
  // Events & automations
  // ----------------------------------------------------------

  static fireEvent(state: SandboxState, project: StudioModuleProject, eventName: string, payload: Record<string, any>): string[] {
    const eventDef = project.events.find(e => e.eventName === eventName);
    const subscribers = eventDef?.subscribers || project.syncTargets;
    const automationsTriggered = project.automations
      .filter(a => a.enabled && a.trigger === eventName)
      .map(a => a.automationId);

    state.events.unshift({
      eventId: `sev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      entity: project.entityName,
      timestamp: new Date().toISOString(),
      payload: { id: payload.id, [project.lifecycleField]: payload[project.lifecycleField] },
      subscribers,
      automationsTriggered
    });
    if (state.events.length > 200) state.events.pop();
    return automationsTriggered;
  }

  // ----------------------------------------------------------
  // Workflow simulation
  // ----------------------------------------------------------

  static async runWorkflow(
    state: SandboxState,
    project: StudioModuleProject,
    workflowId: string,
    persona: SandboxPersona,
    input: Record<string, any>
  ): Promise<{ success: boolean; workflowId: string; trace?: import('./studio-types').WorkflowTraceEntry[]; error?: string }> {
    const workflow = project.workflows.find(w => w.workflowId === workflowId);
    if (!workflow) {
      return { success: false, workflowId, error: `Workflow '${workflowId}' not found on project.` };
    }

    const user = SANDBOX_PERSONA_USERS[persona];
    const executor: WorkflowExecutorContext = {
      user,
      execCrud: async (entity, action, payload) => {
        // Cross-entity nodes simulate the other module generically (no schema coupling)
        if (entity !== project.entityName) {
          const store = this.getStore(state, entity);
          if (action === 'CREATE' || action === 'UPDATE' || action === 'DATABASE_UPDATE') {
            const id = payload.id || `${entity.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            const record = { ...payload, id, _simulatedEntity: entity, version: 1 };
            store.set(id, record);
            return record;
          }
          return { _simulatedEntity: entity, action };
        }
        // Trigger-entity nodes default to the input record when no id is supplied
        const effectivePayload = (action === 'UPDATE' || action === 'DELETE') && !payload.id && input.id
          ? { ...payload }
          : payload;
        const result = this.execAction(state, project, action, user, {
          id: payload.id || input.id,
          payload: effectivePayload
        });
        if (!result.success) throw new Error(result.error || 'Sandbox CRUD step failed');
        return result.record || (result.records?.[0] ?? {});
      },
      notify: async (channel, template, to) => `sbx-receipt-${Math.random().toString(36).substring(2, 8)} (${channel}:${template} -> ${to})`,
      ai: async (prompt, ctx) => ({
        model: 'h8-studio-simulator',
        prompt,
        qualificationScore: 60 + Math.floor(Math.random() * 40),
        recommendation: 'AUTO_SIMULATED',
        summary: `Simulated AI inference over ${Object.keys(ctx).length} context keys`
      }),
      apiCall: async (url, method, body) => ({ mocked: true, url, method, receivedKeys: Object.keys(body || {}) }),
      requestApproval: async (label) => ({ approved: true, approver: `${user.role} (sandbox auto-approval)` })
    };

    const trace = await StudioWorkflowEngine.run(workflow, input, executor);
    state.workflowTraces.unshift(trace);
    if (state.workflowTraces.length > 25) state.workflowTraces.pop();
    this.appendAudit(state, user.userId, project.entityName, 'WORKFLOW_RUN', undefined, `Workflow '${workflow.name}' executed ${trace.length} nodes`);
    return { success: true, workflowId, trace };
  }

  // ----------------------------------------------------------
  // Audit (hash-chained, sandbox-local)
  // ----------------------------------------------------------

  private static appendAudit(
    state: SandboxState,
    actor: string,
    entity: string,
    action: string,
    recordId: string | undefined,
    detail: string
  ): SandboxAuditEntry {
    const auditId = `saud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const serialized = JSON.stringify({ auditId, timestamp, actor, entity, action, recordId, detail, previousHash: state.latestHash });
    const entryHash = sha256(serialized);

    const entry: SandboxAuditEntry = { auditId, timestamp, actor, entity, action, recordId, detail, previousHash: state.latestHash, entryHash };
    state.latestHash = entryHash;
    state.auditChain.unshift(entry);
    if (state.auditChain.length > 500) state.auditChain.pop();
    return entry;
  }

  static getAuditChain(state: SandboxState): SandboxAuditEntry[] {
    return state.auditChain;
  }

  static verifyAuditChain(state: SandboxState): { intact: boolean; verifiedCount: number } {
    if (state.auditChain.length <= 1) return { intact: true, verifiedCount: state.auditChain.length };
    const chronological = [...state.auditChain].reverse();
    for (let i = 1; i < chronological.length; i++) {
      if (chronological[i].previousHash !== chronological[i - 1].entryHash) {
        return { intact: false, verifiedCount: i };
      }
    }
    return { intact: true, verifiedCount: state.auditChain.length };
  }

  static getEventLog(state: SandboxState) {
    return state.events;
  }

  static getStore(state: SandboxState, entity: string): Map<string, Record<string, any>> {
    let store = state.stores.get(entity);
    if (!store) {
      store = new Map();
      state.stores.set(entity, store);
    }
    return store;
  }

  static clear(): void {
    sandboxes.clear();
  }
}
