/**
 * CRUDE8: VERSION & OPTIMISTIC CONCURRENCY ENGINE
 * Provides snapshotting, field-level diffing, rollback, and race-condition prevention.
 */

import { CRUDEntityName } from './types';
import { UniversalEntityRegistry } from './entity-registry';

export interface EntitySnapshot {
  snapshotId: string;
  entity: CRUDEntityName;
  recordId: string;
  version: number;
  timestamp: string;
  actor: string;
  state: Record<string, any>;
  changeSummary: string;
}

export interface FieldDiff {
  field: string;
  oldValue: any;
  newValue: any;
}

export class CRUDE8VersionEngine {
  private static snapshots: Map<string, EntitySnapshot[]> = new Map();

  private static getKey(entity: CRUDEntityName, recordId: string): string {
    return `${entity}:${recordId}`;
  }

  /**
   * Save a version snapshot
   */
  static recordSnapshot(
    entity: CRUDEntityName,
    recordId: string,
    version: number,
    state: Record<string, any>,
    actor: string,
    changeSummary: string = 'Record updated'
  ): EntitySnapshot {
    const key = this.getKey(entity, recordId);
    if (!this.snapshots.has(key)) {
      this.snapshots.set(key, []);
    }

    const snapshot: EntitySnapshot = {
      snapshotId: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      entity,
      recordId,
      version,
      timestamp: new Date().toISOString(),
      actor,
      state: JSON.parse(JSON.stringify(state)),
      changeSummary
    };

    const history = this.snapshots.get(key)!;
    history.unshift(snapshot);

    // Enforce max snapshots policy
    const schema = UniversalEntityRegistry.getSchema(entity);
    const maxSnapshots = schema?.versionPolicy?.maxSnapshots || 50;
    if (history.length > maxSnapshots) {
      history.pop();
    }

    return snapshot;
  }

  /**
   * Get version history for a record
   */
  static getHistory(entity: CRUDEntityName, recordId: string): EntitySnapshot[] {
    return this.snapshots.get(this.getKey(entity, recordId)) || [];
  }

  /**
   * Compute diff between two snapshots or states
   */
  static computeDiff(oldState: Record<string, any>, newState: Record<string, any>): FieldDiff[] {
    const diffs: FieldDiff[] = [];
    const allKeys = Array.from(new Set([...Object.keys(oldState || {}), ...Object.keys(newState || {})]));

    for (const key of allKeys) {
      const oldVal = oldState?.[key];
      const newVal = newState?.[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    }

    return diffs;
  }

  /**
   * Validates optimistic locking version match
   */
  static validateVersion(currentVersion: number, expectedVersion?: number): { valid: boolean; error?: string } {
    if (expectedVersion !== undefined && expectedVersion !== currentVersion) {
      return {
        valid: false,
        error: `Optimistic Concurrency Conflict: Record was modified (current: v${currentVersion}, expected: v${expectedVersion}). Please refresh.`
      };
    }
    return { valid: true };
  }

  /**
   * Rollback to a specific target version
   */
  static rollback(
    entity: CRUDEntityName,
    recordId: string,
    targetVersion: number,
    actor: string
  ): { success: boolean; rolledBackState?: Record<string, any>; newVersion?: number; error?: string } {
    const schema = UniversalEntityRegistry.getSchema(entity);
    if (schema?.versionPolicy?.allowRollback === false) {
      return { success: false, error: `Rollback is disabled by policy for entity '${entity}'` };
    }

    const history = this.getHistory(entity, recordId);
    const targetSnapshot = history.find(s => s.version === targetVersion);

    if (!targetSnapshot) {
      return { success: false, error: `Version snapshot v${targetVersion} not found for ${entity} ${recordId}` };
    }

    const currentLatest = history[0];
    const newVersion = (currentLatest?.version || 1) + 1;

    // Create a new snapshot representing the rollback state
    const restoredState = { ...targetSnapshot.state, version: newVersion };
    this.recordSnapshot(
      entity,
      recordId,
      newVersion,
      restoredState,
      actor,
      `Rolled back to version v${targetVersion}`
    );

    return {
      success: true,
      rolledBackState: restoredState,
      newVersion
    };
  }

  /**
   * Clear for test isolation
   */
  static clear(): void {
    this.snapshots.clear();
  }
}
