/**
 * CRUDE8: MASTER CRUD ENGINE
 * Unified, governed, real-time CRUD pipeline orchestrating:
 * Schema Validation -> Permission Resolution -> Optimistic Concurrency ->
 * Audit Logging -> Event Bus -> Multi-Module Sync8 Cascades.
 */

import {
  CRUDEntityName,
  CRUDActionType,
  CRUDDeleteMode,
  CRUDStandardResponse,
  CRUDBroadcastEvent,
  UniversalActionType
} from './types';
import { UniversalEntityRegistry } from './entity-registry';
import { CRUDE8PermissionResolver, UserContext } from './permission-resolver';
import { CRUDE8VersionEngine } from './version-engine';
import { CRUDE8AuditEngine } from './audit-engine';
import { CRUDE8EventBus } from './event-bus';
import { Sync8Engine } from './sync-engine';
import { CRUDCapabilityMatrix } from './capability-matrix';

export class CRUDE8Engine {
  // In-memory data store per entity: entityName -> (recordId -> record)
  private static store: Map<CRUDEntityName, Map<string, Record<string, any>>> = new Map();
  private static isInitialized = false;

  /**
   * Initializes store with seed data across all 13 canonical entities
   */
  static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Pre-populate data structures
    const entities = UniversalEntityRegistry.listEntities();
    for (const ent of entities) {
      if (!this.store.has(ent.entityName)) {
        this.store.set(ent.entityName, new Map());
      }
    }

    // Seed Sample Customer
    this.seed('Customer', {
      id: 'cust-101',
      name: 'Aditi Sharma',
      email: 'aditi.sharma@travelplanet.in',
      phone: '+91 98450 12345',
      passportNumber: 'Z8942104',
      loyaltyTier: 'GOLD',
      tenantId: 'tenant-voyage-india',
      status: 'ACTIVE',
      version: 1
    });

    // Seed Sample Journey
    this.seed('Journey', {
      id: 'jrn-201',
      title: '7-Day Divine Kerala Backwaters & Ayurveda',
      slug: 'kerala-backwaters-and-ayurvedic-rejuvenation-7d',
      destination: 'Kerala, India',
      durationDays: 7,
      basePrice: 68500,
      currency: 'INR',
      isLivingJourney: true,
      status: 'PUBLISHED',
      version: 1
    });

    // Seed Sample Booking
    this.seed('Booking', {
      id: 'bk-301',
      bookingNumber: 'TP-2026-904',
      customerId: 'cust-101',
      journeyId: 'jrn-201',
      paxCount: 2,
      departureDate: '2026-10-15',
      totalAmount: 137000,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      tenantId: 'tenant-voyage-india',
      version: 1
    });

    // Seed Sample Document
    this.seed('Document', {
      id: 'doc-401',
      title: 'Aditi Sharma Passport Front & Back',
      type: 'PASSPORT',
      fileUrl: 'https://blob.travelplanet.in/vault/cust-101/passport.pdf',
      customerId: 'cust-101',
      bookingId: 'bk-301',
      expiryDate: '2030-05-18',
      verificationStatus: 'VERIFIED',
      tenantId: 'tenant-voyage-india',
      version: 1
    });

    // Seed Sample Invoice
    this.seed('Invoice', {
      id: 'inv-501',
      invoiceNumber: 'INV-2026-0042',
      customerId: 'cust-101',
      bookingId: 'bk-301',
      amount: 116101.69,
      taxAmount: 20898.31,
      totalAmount: 137000,
      currency: 'INR',
      status: 'PAID',
      tenantId: 'tenant-voyage-india',
      version: 1
    });

    // Seed Sample Supplier
    this.seed('Supplier', {
      id: 'sup-601',
      name: 'Spice Coast Houseboats Pvt Ltd',
      category: 'HOTEL_CHAIN',
      contactEmail: 'operations@spicecoast.in',
      rating: 4.9,
      status: 'ACTIVE',
      tenantId: 'tenant-voyage-india',
      version: 1
    });

    // Seed Sample Destination
    this.seed('Destination', {
      id: 'dest-701',
      name: 'Kerala',
      slug: 'kerala',
      country: 'India',
      region: 'South India',
      tagline: 'Gods Own Country',
      seoScore: 98,
      version: 1
    });

    // Seed Sample Experience
    this.seed('Experience', {
      id: 'exp-801',
      title: 'Private Sunset Kathakali Performance & Backwater Tea',
      category: 'HERITAGE',
      durationHours: 3,
      price: 4500,
      status: 'ACTIVE',
      version: 1
    });

    // Seed Sample Content
    this.seed('Content', {
      id: 'cnt-901',
      title: 'Hidden Waterways of Alleppey: A Curators Guide',
      slug: 'hidden-waterways-alleppey-guide',
      contentType: 'TRAVEL_GUIDE',
      status: 'PUBLISHED',
      author: 'Voyage8 Editorial',
      seoScore: 96,
      version: 1
    });

    // Seed Sample Campaign
    this.seed('Campaign', {
      id: 'cmp-1001',
      name: 'Kerala Autumn Rejuvenation 2026',
      targetDestination: 'kerala',
      budget: 250000,
      conversions: 18,
      status: 'ACTIVE',
      tenantId: 'tenant-voyage-india',
      version: 1
    });

    // Seed Sample User
    this.seed('User', {
      id: 'usr-1101',
      name: 'Vikram Mehta',
      email: 'vikram.mehta@travelplanet.in',
      role: 'SUPER_ADMIN',
      tenantId: 'tenant-voyage-india',
      status: 'ACTIVE',
      version: 1
    });

    // Seed Sample Tenant
    this.seed('Tenant', {
      id: 'tenant-voyage-india',
      name: 'Travel Planet India Operations',
      domain: 'voyage-india.travelplanet.in',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      version: 1
    });

    // Seed Sample FeatureFlag
    this.seed('FeatureFlag', {
      id: 'flag-crude8-active',
      name: 'Universal CRUDE8 Engine',
      description: 'Activates real-time governed CRUD engine across all modules',
      enabled: true,
      rolloutPercentage: 100,
      tenantScoped: false,
      version: 1
    });
  }

  private static seed(entity: CRUDEntityName, record: Record<string, any>): void {
    if (!this.store.has(entity)) {
      this.store.set(entity, new Map());
    }
    this.store.get(entity)!.set(record.id, record);
    CRUDE8VersionEngine.recordSnapshot(entity, record.id, 1, record, 'SYSTEM_SEED', 'Initial system seed');
  }

  private static getEntityStore(entity: CRUDEntityName): Map<string, Record<string, any>> {
    if (!this.store.has(entity)) {
      this.store.set(entity, new Map());
    }
    return this.store.get(entity)!;
  }

  /**
   * CREATE: Governed Entity Creation Pipeline
   */
  static async create<T = any>(
    entity: CRUDEntityName,
    payload: Record<string, any>,
    user: UserContext
  ): Promise<CRUDStandardResponse<T>> {
    this.init();
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (!schema) {
      throw new Error(`CRUDE8: Entity '${entity}' not recognized in Universal Registry.`);
    }

    // 1. Permission Gate
    const perm = CRUDE8PermissionResolver.evaluate(entity, 'CREATE', user, payload);
    if (!perm.allowed) {
      throw new Error(`CRUDE8 Permission Denied: ${perm.reason}`);
    }

    // 2. Resolve working payload with tenantId inheritance
    const effectiveTenantId = schema.permissions.tenantScoped ? (payload.tenantId || user.tenantId) : undefined;
    const workingPayload: Record<string, any> = {
      ...payload
    };
    if (schema.permissions.tenantScoped && effectiveTenantId) {
      workingPayload.tenantId = effectiveTenantId;
    }

    // 3. Schema Validation (required fields)
    for (const field of schema.fields) {
      if (field.required && (workingPayload[field.name] === undefined || workingPayload[field.name] === null || workingPayload[field.name] === '')) {
        throw new Error(`CRUDE8 Validation Error: Missing required field '${field.name}' on entity '${entity}'`);
      }
    }

    // 4. Generate ID and Version
    const recordId = workingPayload.id || `${entity.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const finalRecord: Record<string, any> = {
      ...workingPayload,
      id: recordId,
      version: 1,
      tenantId: effectiveTenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 4. Save to Store
    this.getEntityStore(entity).set(recordId, finalRecord);

    // 5. Version Snapshot
    CRUDE8VersionEngine.recordSnapshot(entity, recordId, 1, finalRecord, user.userId, 'Created record');

    // 6. Immutable Audit Entry
    const audit = CRUDE8AuditEngine.log(entity, recordId, 'CREATE', user, finalRecord, 'New entity created');

    // 7. Event Bus Emission
    const event: CRUDBroadcastEvent = {
      eventId: schema.events.onCreatedEvent,
      entity,
      action: 'CREATE',
      actor: user,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
      payload: finalRecord,
      version: 1
    };
    CRUDE8EventBus.emit(event);

    return {
      success: true,
      data: finalRecord as T,
      metadata: {
        entity,
        action: 'CREATE',
        count: 1,
        timestamp: new Date().toISOString()
      },
      version: 1,
      events: [schema.events.onCreatedEvent],
      auditId: audit.auditId,
      syncStatus: 'SYNCED'
    };
  }

  /**
   * READ: Query Records with Tenant Isolation and Filtering
   */
  static async read<T = any>(
    entity: CRUDEntityName,
    filters: Record<string, any> = {},
    user: UserContext
  ): Promise<CRUDStandardResponse<T[]>> {
    this.init();
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (!schema) {
      throw new Error(`CRUDE8: Entity '${entity}' not recognized in Universal Registry.`);
    }

    // 1. Permission Gate
    const perm = CRUDE8PermissionResolver.evaluate(entity, 'READ', user);
    if (!perm.allowed) {
      throw new Error(`CRUDE8 Permission Denied: ${perm.reason}`);
    }

    const store = this.getEntityStore(entity);
    let records = Array.from(store.values());

    // 2. Tenant Isolation Filter
    if (schema.permissions.tenantScoped && user.role !== 'SUPER_ADMIN') {
      records = records.filter(r => r.tenantId === user.tenantId);
    }

    // 3. User Filter Criteria
    if (Object.keys(filters).length > 0) {
      records = records.filter(rec => {
        return Object.entries(filters).every(([k, v]) => {
          if (v === undefined || v === null || v === '') return true;
          return String(rec[k]).toLowerCase() === String(v).toLowerCase();
        });
      });
    }

    // 4. Audit Log (if configured)
    const audit = CRUDE8AuditEngine.log(entity, 'bulk-read', 'READ', user, { filterCount: Object.keys(filters).length });

    return {
      success: true,
      data: records as T[],
      metadata: {
        entity,
        action: 'READ',
        count: records.length,
        timestamp: new Date().toISOString()
      },
      version: 1,
      events: [],
      auditId: audit.auditId,
      syncStatus: 'SYNCED'
    };
  }

  /**
   * UPDATE: Governed Mutation with Optimistic Concurrency and Diff Tracking
   */
  static async update<T = any>(
    entity: CRUDEntityName,
    id: string,
    updates: Record<string, any>,
    user: UserContext,
    expectedVersion?: number
  ): Promise<CRUDStandardResponse<T>> {
    this.init();
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (!schema) {
      throw new Error(`CRUDE8: Entity '${entity}' not recognized in Universal Registry.`);
    }

    const store = this.getEntityStore(entity);
    const existing = store.get(id);
    if (!existing) {
      throw new Error(`CRUDE8 Not Found: Entity '${entity}' with ID '${id}' does not exist.`);
    }

    // 1. Permission Gate
    const perm = CRUDE8PermissionResolver.evaluate(entity, 'UPDATE', user, existing);
    if (!perm.allowed) {
      throw new Error(`CRUDE8 Permission Denied: ${perm.reason}`);
    }

    // 2. Optimistic Concurrency Check
    const versionCheck = CRUDE8VersionEngine.validateVersion(existing.version, expectedVersion);
    if (!versionCheck.valid) {
      throw new Error(versionCheck.error);
    }

    // 3. Diff Computation
    const newVersion = existing.version + 1;
    const updatedRecord: Record<string, any> = {
      ...existing,
      ...updates,
      id,
      version: newVersion,
      updatedAt: new Date().toISOString()
    };
    const diffs = CRUDE8VersionEngine.computeDiff(existing, updatedRecord);
    const diffSummary = diffs.map(d => `${d.field}: ${JSON.stringify(d.oldValue)} -> ${JSON.stringify(d.newValue)}`).join(', ');

    // 4. Save to Store
    store.set(id, updatedRecord);

    // 5. Version Snapshot
    CRUDE8VersionEngine.recordSnapshot(entity, id, newVersion, updatedRecord, user.userId, diffSummary);

    // 6. Immutable Audit Entry
    const audit = CRUDE8AuditEngine.log(entity, id, 'UPDATE', user, updatedRecord, diffSummary);

    // 7. Event Bus Emission
    const event: CRUDBroadcastEvent = {
      eventId: schema.events.onUpdatedEvent,
      entity,
      action: 'UPDATE',
      actor: user,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
      payload: updatedRecord,
      version: newVersion
    };
    CRUDE8EventBus.emit(event);

    return {
      success: true,
      data: updatedRecord as T,
      metadata: {
        entity,
        action: 'UPDATE',
        count: 1,
        timestamp: new Date().toISOString()
      },
      version: newVersion,
      events: [schema.events.onUpdatedEvent],
      auditId: audit.auditId,
      syncStatus: 'SYNCED'
    };
  }

  /**
   * DELETE: Governed Soft-Delete / Archive Pipeline
   */
  static async delete<T = any>(
    entity: CRUDEntityName,
    id: string,
    user: UserContext,
    mode: CRUDDeleteMode = 'SOFT_DELETE'
  ): Promise<CRUDStandardResponse<T>> {
    this.init();
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (!schema) {
      throw new Error(`CRUDE8: Entity '${entity}' not recognized in Universal Registry.`);
    }

    const store = this.getEntityStore(entity);
    const existing = store.get(id);
    if (!existing) {
      throw new Error(`CRUDE8 Not Found: Entity '${entity}' with ID '${id}' does not exist.`);
    }

    // 1. Permission Gate
    const perm = CRUDE8PermissionResolver.evaluate(entity, 'DELETE', user, existing);
    if (!perm.allowed) {
      throw new Error(`CRUDE8 Permission Denied: ${perm.reason}`);
    }

    let finalRecord = existing;
    let finalVersion = existing.version;

    if (mode === 'PERMANENT_DELETE') {
      store.delete(id);
    } else {
      // Soft-delete / Archive
      finalVersion = existing.version + 1;
      finalRecord = {
        ...existing,
        status: mode === 'ARCHIVE' ? 'ARCHIVED' : 'DELETED',
        version: finalVersion,
        deletedAt: new Date().toISOString(),
        deletedBy: user.userId
      };
      store.set(id, finalRecord);
      CRUDE8VersionEngine.recordSnapshot(entity, id, finalVersion, finalRecord, user.userId, `Entity ${mode}`);
    }

    // Audit Entry
    const audit = CRUDE8AuditEngine.log(entity, id, 'DELETE', user, finalRecord, `Deleted with mode: ${mode}`);

    // Event Bus Emission
    const event: CRUDBroadcastEvent = {
      eventId: schema.events.onDeletedEvent,
      entity,
      action: 'DELETE',
      actor: user,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
      payload: finalRecord,
      version: finalVersion
    };
    CRUDE8EventBus.emit(event);

    return {
      success: true,
      data: finalRecord as T,
      metadata: {
        entity,
        action: 'DELETE',
        count: 1,
        timestamp: new Date().toISOString()
      },
      version: finalVersion,
      events: [schema.events.onDeletedEvent],
      auditId: audit.auditId,
      syncStatus: 'SYNCED'
    };
  }

  /**
   * ROLLBACK: Revert entity to a historical version snapshot
   */
  static async rollback<T = any>(
    entity: CRUDEntityName,
    id: string,
    targetVersion: number,
    user: UserContext
  ): Promise<CRUDStandardResponse<T>> {
    this.init();
    const rollbackResult = CRUDE8VersionEngine.rollback(entity, id, targetVersion, user.userId);
    if (!rollbackResult.success || !rollbackResult.rolledBackState) {
      throw new Error(rollbackResult.error || 'Failed to execute rollback');
    }

    const store = this.getEntityStore(entity);
    store.set(id, rollbackResult.rolledBackState);

    const audit = CRUDE8AuditEngine.log(
      entity,
      id,
      'UPDATE',
      user,
      rollbackResult.rolledBackState,
      `Rolled back to v${targetVersion}`
    );

    const schema = UniversalEntityRegistry.getSchema(entity)!;
    const event: CRUDBroadcastEvent = {
      eventId: schema.events.onUpdatedEvent,
      entity,
      action: 'UPDATE',
      actor: user,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
      payload: rollbackResult.rolledBackState,
      version: rollbackResult.newVersion!
    };
    CRUDE8EventBus.emit(event);

    return {
      success: true,
      data: rollbackResult.rolledBackState as T,
      metadata: {
        entity,
        action: 'UPDATE',
        count: 1,
        timestamp: new Date().toISOString()
      },
      version: rollbackResult.newVersion!,
      events: [schema.events.onUpdatedEvent],
      auditId: audit.auditId,
      syncStatus: 'SYNCED'
    };
  }

  /**
   * EXECUTE: Universal Matrix-Driven Action Dispatcher
   * Resolves any of the 23 universal action types onto governed pipelines.
   * Every path inherits: permission gate -> validation -> version -> audit -> event -> sync.
   */
  static async execute<T = any>(
    entity: CRUDEntityName,
    action: UniversalActionType,
    user: UserContext,
    params: {
      id?: string;
      payload?: Record<string, any>;
      filters?: Record<string, any>;
      expectedVersion?: number;
      mode?: CRUDDeleteMode;
    } = {}
  ): Promise<CRUDStandardResponse<T>> {
    this.init();
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (!schema) {
      throw new Error(`CRUDE8: Entity '${entity}' not recognized in Universal Registry.`);
    }
    const capability = CRUDCapabilityMatrix.getCapability(entity);
    if (!CRUDCapabilityMatrix.supports(entity, action)) {
      throw new Error(`CRUDE8 Capability Denied: '${entity}' does not declare universal action '${action}'.`);
    }

    const store = this.getEntityStore(entity);
    const existing = params.id ? store.get(params.id) : undefined;
    if (params.id && !existing) {
      throw new Error(`CRUDE8 Not Found: Entity '${entity}' with ID '${params.id}' does not exist.`);
    }

    // Matrix permission gate (roles + tenant isolation)
    const guard = CRUDE8PermissionResolver.evaluateCapability(entity, action, user, existing);
    if (!guard.allowed) {
      throw new Error(`CRUDE8 Permission Denied: ${guard.reason}`);
    }

    const payload = params.payload || {};
    const lifecycleField = capability.lifecycleField;

    const withMeta = (res: CRUDStandardResponse<any>, baseVerb: CRUDActionType, fallbackEvent?: string): CRUDStandardResponse<T> => {
      const semanticEvent = capability.actionEvents[action] || fallbackEvent;
      const events = semanticEvent ? [...new Set([...res.events, semanticEvent])] : res.events;
      if (semanticEvent && existing) {
        CRUDE8EventBus.emit({
          eventId: semanticEvent,
          entity,
          action: baseVerb,
          actor: user,
          tenantId: user.tenantId,
          timestamp: new Date().toISOString(),
          payload: res.data,
          version: res.version
        });
      }
      return {
        ...res,
        metadata: { ...res.metadata, universalAction: action },
        events
      } as CRUDStandardResponse<T>;
    };

    switch (action) {
      // ----- Base CRUD verbs delegate to governed pipelines -----
      case 'CREATE':
        return withMeta(await this.create(entity, payload, user), 'CREATE');

      case 'READ':
        return withMeta(await this.read(entity, params.filters || {}, user), 'READ');

      case 'UPDATE': {
        this.requireId(params.id, action);
        return withMeta(await this.update(entity, params.id!, payload, user, params.expectedVersion), 'UPDATE');
      }

      case 'DELETE': {
        this.requireId(params.id, action);
        return withMeta(await this.delete(entity, params.id!, user, params.mode || 'SOFT_DELETE'), 'DELETE');
      }

      case 'ARCHIVE': {
        this.requireId(params.id, action);
        return withMeta(await this.delete(entity, params.id!, user, 'ARCHIVE'), 'DELETE');
      }

      case 'RESTORE': {
        this.requireId(params.id, action);
        const restoreValue = capability.lifecycleTransitions.RESTORE || 'ACTIVE';
        const patch: Record<string, any> = { [lifecycleField]: this.coerceLifecycle(existing![lifecycleField], restoreValue) };
        if ('deletedAt' in existing!) patch.deletedAt = null;
        if ('deletedBy' in existing!) patch.deletedBy = null;
        return withMeta(await this.update(entity, params.id!, patch, user, params.expectedVersion), 'UPDATE');
      }

      case 'PUBLISH':
      case 'UNPUBLISH':
      case 'APPROVE':
      case 'REJECT': {
        this.requireId(params.id, action);
        const transition = capability.lifecycleTransitions[action];
        if (transition === undefined) {
          throw new Error(`CRUDE8 Capability Error: '${entity}' does not define a '${action}' lifecycle transition.`);
        }
        return withMeta(
          await this.update(entity, params.id!, { [lifecycleField]: this.coerceLifecycle(existing![lifecycleField], transition) }, user, params.expectedVersion),
          'UPDATE'
        );
      }

      case 'CLONE': {
        this.requireId(params.id, action);
        const suffix = `copy-${Math.random().toString(36).substring(2, 7)}`;
        const copyPayload: Record<string, any> = {
          id: `${entity.toLowerCase()}-${Date.now()}-${suffix}`
        };
        for (const field of schema.fields) {
          if (field.name === 'id' || field.name === 'version' || field.name === 'createdAt' || field.name === 'updatedAt') continue;
          const value = existing![field.name];
          copyPayload[field.name] = field.unique && value !== undefined && value !== null
            ? `${value}-${suffix}`
            : value;
        }
        return withMeta(await this.create(entity, copyPayload, user), 'CREATE');
      }

      case 'ASSIGN': {
        this.requireId(params.id, action);
        if (!capability.assigneeField) {
          throw new Error(`CRUDE8 Capability Error: '${entity}' has no assigneeField for ASSIGN.`);
        }
        if (!payload.assigneeId) {
          throw new Error('CRUDE8 Validation Error: ASSIGN requires payload.assigneeId.');
        }
        return withMeta(await this.update(entity, params.id!, { [capability.assigneeField]: payload.assigneeId }, user, params.expectedVersion), 'UPDATE');
      }

      case 'TRANSFER': {
        this.requireId(params.id, action);
        if (!capability.assigneeField) {
          throw new Error(`CRUDE8 Capability Error: '${entity}' has no assigneeField for TRANSFER.`);
        }
        if (!payload.newOwnerId) {
          throw new Error('CRUDE8 Validation Error: TRANSFER requires payload.newOwnerId.');
        }
        const patch: Record<string, any> = {
          [capability.assigneeField]: payload.newOwnerId,
          [`${capability.assigneeField}Previous`]: existing![capability.assigneeField] ?? null
        };
        return withMeta(await this.update(entity, params.id!, patch, user, params.expectedVersion), 'UPDATE');
      }

      case 'EXPORT': {
        const readRes = await this.read(entity, params.filters || {}, user);
        const audit = CRUDE8AuditEngine.log(entity, 'bulk-export', 'READ', user, { filterCount: Object.keys(params.filters || {}).length }, `EXPORT of ${readRes.data.length} records`);
        return {
          success: true,
          data: {
            format: 'JSON',
            exportedAt: new Date().toISOString(),
            entity,
            records: readRes.data
          } as T,
          metadata: { entity, action: 'READ', universalAction: 'EXPORT', count: readRes.data.length, timestamp: new Date().toISOString() },
          version: 1,
          events: [],
          auditId: audit.auditId,
          syncStatus: 'SYNCED'
        };
      }

      case 'IMPORT': {
        const records: Record<string, any>[] = Array.isArray(payload.records) ? payload.records : [];
        if (records.length === 0) {
          throw new Error('CRUDE8 Validation Error: IMPORT requires payload.records as a non-empty array.');
        }
        const imported: string[] = [];
        const errors: { record: Record<string, any>; error: string }[] = [];
        for (const record of records) {
          try {
            const res = await this.create(entity, record, user);
            imported.push(res.data.id);
          } catch (err: any) {
            errors.push({ record, error: err.message });
          }
        }
        const audit = CRUDE8AuditEngine.log(entity, 'bulk-import', 'CREATE', user, { requested: records.length, imported: imported.length }, `IMPORT: ${imported.length} imported, ${errors.length} rejected`);
        return {
          success: errors.length < records.length,
          data: { imported, failed: errors.length, errors } as T,
          metadata: { entity, action: 'CREATE', universalAction: 'IMPORT', count: imported.length, timestamp: new Date().toISOString() },
          version: 1,
          events: [schema.events.onCreatedEvent],
          auditId: audit.auditId,
          syncStatus: 'SYNCED'
        };
      }

      case 'SHARE': {
        this.requireId(params.id, action);
        const token = `${entity}:${params.id}:${Date.now().toString(36)}`.toLowerCase();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const audit = CRUDE8AuditEngine.log(entity, params.id!, 'READ', user, { shareToken: token }, `SHARE link issued, expires ${expiresAt}`);
        return {
          success: true,
          data: { shareUrl: `/share/${entity.toLowerCase()}/${params.id}/${token}`, token, expiresAt } as T,
          metadata: { entity, action: 'READ', universalAction: 'SHARE', timestamp: new Date().toISOString() },
          version: existing!.version,
          events: [],
          auditId: audit.auditId,
          syncStatus: 'SYNCED'
        };
      }

      case 'SYNC': {
        this.requireId(params.id, action);
        Sync8Engine.init();
        const syncEvent: CRUDBroadcastEvent = {
          eventId: schema.events.onUpdatedEvent,
          entity,
          action: 'UPDATE',
          actor: user,
          tenantId: user.tenantId,
          timestamp: new Date().toISOString(),
          payload: existing!,
          version: existing!.version
        };
        const logs = await Sync8Engine.processEventCascade(syncEvent);
        const audit = CRUDE8AuditEngine.log(entity, params.id!, 'UPDATE', user, existing!, `Manual SYNC dispatch to ${logs.length} modules`);
        return {
          success: true,
          data: { dispatches: logs } as T,
          metadata: { entity, action: 'UPDATE', universalAction: 'SYNC', count: logs.length, timestamp: new Date().toISOString() },
          version: existing!.version,
          events: [schema.events.onUpdatedEvent],
          auditId: audit.auditId,
          syncStatus: 'SYNCED'
        };
      }

      case 'VERSION': {
        this.requireId(params.id, action);
        const history = CRUDE8VersionEngine.getHistory(entity, params.id!);
        const audit = CRUDE8AuditEngine.log(entity, params.id!, 'READ', user, {}, `VERSION history requested (${history.length} snapshots)`);
        return {
          success: true,
          data: { snapshots: history } as T,
          metadata: { entity, action: 'READ', universalAction: 'VERSION', count: history.length, timestamp: new Date().toISOString() },
          version: existing!.version,
          events: [],
          auditId: audit.auditId,
          syncStatus: 'SYNCED'
        };
      }

      case 'ROLLBACK': {
        this.requireId(params.id, action);
        const targetVersion = payload.targetVersion;
        if (typeof targetVersion !== 'number') {
          throw new Error('CRUDE8 Validation Error: ROLLBACK requires payload.targetVersion as a number.');
        }
        return withMeta(await this.rollback(entity, params.id!, targetVersion, user), 'UPDATE');
      }

      case 'GENERATE': {
        this.requireId(params.id, action);
        if (!schema.aiCapabilities.allowAiUpdate && !schema.aiCapabilities.allowAiCreation) {
          throw new Error(`CRUDE8 AI Gate: '${entity}' does not permit AI-driven generation.`);
        }
        const { targetField, content } = payload;
        if (!targetField || content === undefined) {
          throw new Error('CRUDE8 Validation Error: GENERATE requires payload.targetField and payload.content.');
        }
        const patch: Record<string, any> = { [targetField]: content };
        if (schema.aiCapabilities.requireApproval) {
          patch.aiApprovalStatus = 'PENDING_APPROVAL';
        }
        const res = await this.update(entity, params.id!, patch, user, params.expectedVersion);
        return withMeta(res, 'UPDATE', 'ENTITY_GENERATED');
      }

      case 'TRANSLATE': {
        this.requireId(params.id, action);
        if (!schema.aiCapabilities.allowAiUpdate) {
          throw new Error(`CRUDE8 AI Gate: '${entity}' does not permit AI-driven translation.`);
        }
        const { locale, translations } = payload;
        if (!locale || typeof translations !== 'object' || translations === null) {
          throw new Error('CRUDE8 Validation Error: TRANSLATE requires payload.locale and payload.translations object.');
        }
        const mergedTranslations = { ...(existing!.translations || {}), [locale]: translations };
        return withMeta(await this.update(entity, params.id!, { translations: mergedTranslations }, user, params.expectedVersion), 'UPDATE');
      }

      case 'ANALYZE': {
        this.requireId(params.id, action);
        const requiredFields = schema.fields.filter(f => f.required && f.name !== 'id');
        const presentFields = requiredFields.filter(f => {
          const v = existing![f.name];
          return v !== undefined && v !== null && v !== '';
        });
        const snapshots = CRUDE8VersionEngine.getHistory(entity, params.id!);
        const analysis = {
          entity,
          recordId: params.id,
          completenessScore: Math.round((presentFields.length / Math.max(requiredFields.length, 1)) * 100),
          missingRequiredFields: requiredFields.filter(f => !presentFields.includes(f)).map(f => f.name),
          versionCount: snapshots.length,
          currentVersion: existing!.version,
          aiCapabilities: schema.aiCapabilities,
          analyzedAt: new Date().toISOString()
        };
        const audit = CRUDE8AuditEngine.log(entity, params.id!, 'READ', user, analysis, 'ANALYZE executed');
        return {
          success: true,
          data: analysis as T,
          metadata: { entity, action: 'READ', universalAction: 'ANALYZE', timestamp: new Date().toISOString() },
          version: existing!.version,
          events: [],
          auditId: audit.auditId,
          syncStatus: 'SYNCED'
        };
      }

      case 'AUTOMATE': {
        this.requireId(params.id, action);
        const automationId = payload.automationId;
        const automation = capability.automations.find(a => a.automationId === automationId);
        if (!automation) {
          const available = capability.automations.map(a => a.automationId).join(', ') || 'none';
          throw new Error(`CRUDE8 Automation Error: automation '${automationId}' is not registered for '${entity}' (Available: ${available}).`);
        }
        const res = await this.update(
          entity,
          params.id!,
          { lastAutomationId: automation.automationId, lastAutomationRunAt: new Date().toISOString() },
          user,
          params.expectedVersion
        );
        CRUDE8EventBus.emit({
          eventId: 'AUTOMATION_TRIGGERED',
          entity,
          action: 'UPDATE',
          actor: user,
          tenantId: user.tenantId,
          timestamp: new Date().toISOString(),
          payload: { automation, record: res.data },
          version: res.version
        });
        return withMeta({
          ...res,
          data: { automation, record: res.data } as any
        }, 'UPDATE');
      }

      default:
        throw new Error(`CRUDE8: Universal action '${action}' has no dispatcher implementation.`);
    }
  }

  private static requireId(id: string | undefined, action: UniversalActionType): void {
    if (!id) {
      throw new Error(`CRUDE8 Validation Error: Universal action '${action}' requires params.id.`);
    }
  }

  private static coerceLifecycle(currentValue: any, transitionValue: string): any {
    if (typeof currentValue === 'boolean') {
      return transitionValue.toUpperCase() === 'TRUE';
    }
    return transitionValue;
  }

  /**
   * Reset store (for testing)
   */
  static clear(): void {
    this.store.clear();
    this.isInitialized = false;
    CRUDE8VersionEngine.clear();
    CRUDE8AuditEngine.clear();
    CRUDE8EventBus.clear();
    Sync8Engine.clear();
  }
}

// Auto-seed on load
CRUDE8Engine.init();
