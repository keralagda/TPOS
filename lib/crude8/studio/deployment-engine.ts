/**
 * CRUDE8 STUDIO: DEPLOYMENT ENGINE
 * Promotion path: BUILD -> PREVIEW -> SIMULATE -> REQUEST -> APPROVE -> DEPLOY.
 * Deployment is approval-gated (requester != approver, role-gated), fully
 * audited on a SHA-256 chained log, and registers the module into the live
 * runtime registry where its records become servable — runtime generation.
 */

import crypto from 'crypto';
import { StudioModuleProject, StudioDeployment, DeployedRuntimeModule } from './studio-types';
import { StudioProjectStore } from './project-store';

const DEPLOY_ROLES = ['SUPER_ADMIN', 'ORG_ADMIN'];

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function studioFieldTypeToRuntime(type: string): 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'JSON' {
  switch (type) {
    case 'NUMBER': return 'NUMBER';
    case 'BOOLEAN': return 'BOOLEAN';
    case 'DATE': return 'DATE';
    case 'MULTISELECT': case 'RELATION': return 'JSON';
    default: return 'STRING';
  }
}

// Pin deployment state on globalThis so all API route bundles share one
// registry (Next.js dev isolates module instances per route).
interface DeploymentGlobalState {
  deployments: StudioDeployment[];
  deployedModules: Map<string, { module: DeployedRuntimeModule; records: Map<string, Record<string, any>> }>;
  latestHash: string;
}
const globalRef = globalThis as typeof globalThis & { __crude8StudioDeployment?: DeploymentGlobalState };
const deployState: DeploymentGlobalState = globalRef.__crude8StudioDeployment ?? (globalRef.__crude8StudioDeployment = {
  deployments: [],
  deployedModules: new Map(),
  latestHash: '0'.repeat(64)
});

export class StudioDeploymentEngine {

  // ----------------------------------------------------------
  // Deploy request (gate 1)
  // ----------------------------------------------------------

  static requestDeploy(projectId: string, requester: { userId: string; role: string }, notes?: string): StudioDeployment {
    if (!DEPLOY_ROLES.includes(requester.role)) {
      throw new Error('CRUDE8 Deployment Permission Denied: only SUPER_ADMIN or ORG_ADMIN may request deployment.');
    }
    const project = StudioProjectStore.getProject(projectId);
    if (!project) throw new Error(`CRUDE8 Deployment: project '${projectId}' not found.`);

    const existing = deployState.deployments.find(d => d.projectId === projectId && d.status === 'PENDING_APPROVAL');
    if (existing) throw new Error(`CRUDE8 Deployment Conflict: project '${projectId}' already has a pending approval (${existing.deploymentId}).`);

    const deploymentId = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const serialized = JSON.stringify({ deploymentId, timestamp, projectId, version: project.version, requester: requester.userId });
    const entryHash = sha256(serialized);

    const deployment: StudioDeployment = {
      deploymentId,
      projectId,
      projectName: project.name,
      entityName: project.entityName,
      version: project.version,
      status: 'PENDING_APPROVAL',
      requestedBy: requester.userId,
      requestedAt: timestamp,
      notes,
      previousHash: deployState.latestHash,
      entryHash
    };
    deployState.latestHash = entryHash;
    deployState.deployments.unshift(deployment);
    return deployment;
  }

  // ----------------------------------------------------------
  // Approval + promotion (gate 2)
  // ----------------------------------------------------------

  static approveDeploy(deploymentId: string, approver: { userId: string; role: string }): StudioDeployment {
    if (!DEPLOY_ROLES.includes(approver.role)) {
      throw new Error('CRUDE8 Deployment Permission Denied: only SUPER_ADMIN or ORG_ADMIN may approve deployment.');
    }
    const deployment = deployState.deployments.find(d => d.deploymentId === deploymentId);
    if (!deployment) throw new Error(`CRUDE8 Deployment Not Found: '${deploymentId}'.`);
    if (deployment.status !== 'PENDING_APPROVAL') {
      throw new Error(`CRUDE8 Deployment Conflict: deployment '${deploymentId}' is ${deployment.status}, not PENDING_APPROVAL.`);
    }
    if (deployment.requestedBy === approver.userId) {
      throw new Error('CRUDE8 Deployment Governance Violation: the requester cannot approve their own deployment. Separation of duties required.');
    }

    const project = StudioProjectStore.getProject(deployment.projectId);
    if (!project) throw new Error(`CRUDE8 Deployment: project '${deployment.projectId}' no longer exists.`);

    const approvedAt = new Date().toISOString();
    const serialized = JSON.stringify({ deploymentId, approvedAt, approver: approver.userId });
    deployment.status = 'APPROVED';
    deployment.approver = approver.userId;
    deployment.approvedAt = approvedAt;
    deployment.previousHash = deployState.latestHash;
    deployment.entryHash = sha256(serialized);
    deployState.latestHash = deployment.entryHash;

    // Runtime generation: register module + serve its records
    this.registerRuntimeModule(project);
    deployment.status = 'DEPLOYED';
    project.status = 'DEPLOYED';
    StudioProjectStore.saveProject({ ...project }, 'deployment-engine', `Deployed as v${project.version}`);

    return deployment;
  }

  static rejectDeploy(deploymentId: string, approver: { userId: string; role: string }, reason: string): StudioDeployment {
    if (!DEPLOY_ROLES.includes(approver.role)) {
      throw new Error('CRUDE8 Deployment Permission Denied: only SUPER_ADMIN or ORG_ADMIN may reject deployment.');
    }
    const deployment = deployState.deployments.find(d => d.deploymentId === deploymentId);
    if (!deployment) throw new Error(`CRUDE8 Deployment Not Found: '${deploymentId}'.`);
    if (deployment.status !== 'PENDING_APPROVAL') {
      throw new Error(`CRUDE8 Deployment Conflict: deployment '${deploymentId}' is ${deployment.status}.`);
    }
    const timestamp = new Date().toISOString();
    deployment.status = 'REJECTED';
    deployment.approver = approver.userId;
    deployment.approvedAt = timestamp;
    deployment.notes = reason;
    deployment.previousHash = deployState.latestHash;
    deployment.entryHash = sha256(JSON.stringify({ deploymentId, rejectedAt: timestamp, reason }));
    deployState.latestHash = deployment.entryHash;
    return deployment;
  }

  // ----------------------------------------------------------
  // Runtime registry
  // ----------------------------------------------------------

  private static registerRuntimeModule(project: StudioModuleProject): DeployedRuntimeModule {
    const runtimeModule: DeployedRuntimeModule = {
      entityName: project.entityName,
      projectId: project.projectId,
      projectName: project.name,
      module: project.module,
      deployedAt: new Date().toISOString(),
      deployedVersion: project.version,
      fields: project.fields.map(fl => ({
        name: fl.name,
        type: studioFieldTypeToRuntime(fl.type),
        required: fl.required,
        unique: fl.unique || false
      })),
      permissionRules: project.permissions.rules,
      syncTargets: project.syncTargets
    };

    if (!deployState.deployedModules.has(project.entityName)) {
      deployState.deployedModules.set(project.entityName, { module: runtimeModule, records: new Map() });
    } else {
      const existing = deployState.deployedModules.get(project.entityName)!;
      existing.module = runtimeModule; // new version replaces, records persist
    }
    return runtimeModule;
  }

  static listDeployments(): StudioDeployment[] {
    return deployState.deployments;
  }

  static listDeployedModules(): DeployedRuntimeModule[] {
    return Array.from(deployState.deployedModules.values()).map(e => e.module);
  }

  static getDeployedModule(entityName: string): { module: DeployedRuntimeModule; records: Map<string, Record<string, any>> } | undefined {
    return deployState.deployedModules.get(entityName);
  }

  /**
   * Runtime record service for deployed modules — governed by the module's
   * own studio permission rules. This is the live generated API surface.
   */
  static serveRecords(
    entityName: string,
    user: { userId: string; role: string; tenantId: string },
    filters: Record<string, any> = {}
  ): Record<string, any>[] {
    const entry = deployState.deployedModules.get(entityName);
    if (!entry) throw new Error(`CRUDE8 Runtime Not Found: no deployed module '${entityName}'.`);

    const readRule = entry.module.permissionRules.find(r => r.role === user.role && r.action === 'READ');
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ORG_ADMIN';
    if (!readRule?.allowed && !isAdmin) {
      throw new Error(`CRUDE8 Permission Denied: role '${user.role}' cannot read deployed module '${entityName}'.`);
    }

    let results = Array.from(entry.records.values()).filter(r => !r.deletedAt);
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;
      results = results.filter(r => String(r[key]) === String(value));
    }
    return results;
  }

  static insertRuntimeRecord(entityName: string, record: Record<string, any>): void {
    const entry = deployState.deployedModules.get(entityName);
    if (!entry) throw new Error(`CRUDE8 Runtime Not Found: no deployed module '${entityName}'.`);
    entry.records.set(record.id, record);
  }

  /**
   * Promotes sandbox records into the deployed runtime at deployment time,
   * so the simulated data becomes the module's seed data.
   */
  static promoteSandboxRecords(entityName: string, records: Record<string, any>[]): number {
    const entry = deployState.deployedModules.get(entityName);
    if (!entry) return 0;
    for (const record of records) {
      entry.records.set(record.id, record);
    }
    return records.length;
  }

  static verifyDeploymentAudit(): { intact: boolean; verifiedCount: number } {
    const chronological = [...deployState.deployments].filter(d => d.status !== 'PENDING_APPROVAL').reverse();
    for (let i = 1; i < chronological.length; i++) {
      if (chronological[i].previousHash !== chronological[i - 1].entryHash) {
        return { intact: false, verifiedCount: i };
      }
    }
    return { intact: true, verifiedCount: chronological.length };
  }

  static clear(): void {
    deployState.deployments = [];
    deployState.deployedModules.clear();
    deployState.latestHash = '0'.repeat(64);
  }
}
