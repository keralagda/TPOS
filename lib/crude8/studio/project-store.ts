/**
 * CRUDE8 STUDIO: PROJECT STORE & VERSION ENGINE
 * Persists built modules in server memory. Every save creates an immutable
 * version snapshot with a field-level diff; supports compare + rollback.
 */

import { StudioModuleProject, StudioProjectVersion } from './studio-types';

interface ProjectRecord {
  project: StudioModuleProject;
  versions: StudioProjectVersion[];
}

function computeDiff(previous: StudioModuleProject | undefined, next: StudioModuleProject): string[] {
  if (!previous) return ['Project created'];

  const diffs: string[] = [];
  const count = (p: StudioModuleProject) => ({
    fields: p.fields.length,
    sections: p.ui.formView.sections.length,
    actions: p.actions.length,
    workflows: p.workflows.length,
    rules: p.permissions.rules.length,
    events: p.events.length,
    automations: p.automations.length
  });

  const prev = count(previous);
  const nextC = count(next);
  if (prev.fields !== nextC.fields) diffs.push(`fields: ${prev.fields} -> ${nextC.fields}`);
  if (prev.sections !== nextC.sections) diffs.push(`form sections: ${prev.sections} -> ${nextC.sections}`);
  if (prev.actions !== nextC.actions) diffs.push(`actions: ${prev.actions} -> ${nextC.actions}`);
  if (prev.workflows !== nextC.workflows) diffs.push(`workflows: ${prev.workflows} -> ${nextC.workflows}`);
  if (prev.rules !== nextC.rules) diffs.push(`permission rules: ${prev.rules} -> ${nextC.rules}`);
  if (prev.events !== nextC.events) diffs.push(`events: ${prev.events} -> ${nextC.events}`);
  if (prev.automations !== nextC.automations) diffs.push(`automations: ${prev.automations} -> ${nextC.automations}`);

  if (previous.name !== next.name) diffs.push(`name: '${previous.name}' -> '${next.name}'`);
  if (previous.entityName !== next.entityName) diffs.push(`entity: '${previous.entityName}' -> '${next.entityName}'`);
  if (previous.mode !== next.mode) diffs.push(`mode: ${previous.mode} -> ${next.mode}`);
  if (previous.lifecycleField !== next.lifecycleField) diffs.push(`lifecycleField: ${previous.lifecycleField} -> ${next.lifecycleField}`);

  const prevFieldNames = new Set(previous.fields.map(f => f.name));
  const nextFieldNames = new Set(next.fields.map(f => f.name));
  for (const added of next.fields.filter(f => !prevFieldNames.has(f.name))) diffs.push(`+ field ${added.name} (${added.type})`);
  for (const removed of previous.fields.filter(f => !nextFieldNames.has(f.name))) diffs.push(`- field ${removed.name}`);

  if (diffs.length === 0) diffs.push('No structural changes');
  return diffs;
}

// Pin the store on globalThis: Next.js dev compiles each API route as its own
// bundle, so plain module singletons are not shared across routes.
const globalRef = globalThis as typeof globalThis & { __crude8StudioProjects?: Map<string, ProjectRecord> };
const projects: Map<string, ProjectRecord> = globalRef.__crude8StudioProjects ?? (globalRef.__crude8StudioProjects = new Map());

export class StudioProjectStore {
  static createProject(project: StudioModuleProject, actor: string): StudioProjectVersion {
    const record: ProjectRecord = { project, versions: [] };
    projects.set(project.projectId, record);
    return this.recordVersion(project.projectId, actor, 'Project created', project);
  }

  static saveProject(next: StudioModuleProject, actor: string, summary?: string): StudioProjectVersion {
    const record = projects.get(next.projectId);
    if (!record) throw new Error(`CRUDE8 Studio: project '${next.projectId}' not found.`);
    const diffSummary = computeDiff(record.project, next);
    next.version = record.project.version + 1;
    next.updatedAt = new Date().toISOString();
    record.project = next;
    return this.recordVersion(next.projectId, actor, summary || `Saved v${next.version}`, next, diffSummary);
  }

  private static recordVersion(projectId: string, actor: string, summary: string, snapshot: StudioModuleProject, diffSummary: string[] = ['Project created']): StudioProjectVersion {
    const record = projects.get(projectId)!;
    const version: StudioProjectVersion = {
      versionId: `pver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      version: snapshot.version,
      timestamp: new Date().toISOString(),
      actor,
      summary,
      diffSummary,
      snapshot: JSON.parse(JSON.stringify(snapshot))
    };
    record.versions.unshift(version);
    if (record.versions.length > 100) record.versions.pop();
    return version;
  }

  static getProject(projectId: string): StudioModuleProject | undefined {
    return projects.get(projectId)?.project;
  }

  static listProjects(): StudioModuleProject[] {
    return Array.from(projects.values()).map(r => r.project);
  }

  static getHistory(projectId: string): StudioProjectVersion[] {
    return projects.get(projectId)?.versions || [];
  }

  static getVersion(projectId: string, versionNumber: number): StudioProjectVersion | undefined {
    return this.getHistory(projectId).find(v => v.version === versionNumber);
  }

  static compareVersions(projectId: string, fromVersion: number, toVersion: number): string[] {
    const from = this.getVersion(projectId, fromVersion);
    const to = this.getVersion(projectId, toVersion);
    if (!from || !to) throw new Error(`CRUDE8 Studio: version ${!from ? fromVersion : toVersion} not found on project '${projectId}'.`);
    return computeDiff(from.snapshot, to.snapshot);
  }

  static rollback(projectId: string, targetVersion: number, actor: string): StudioProjectVersion {
    const target = this.getVersion(projectId, targetVersion);
    if (!target) throw new Error(`CRUDE8 Studio: version ${targetVersion} not found for rollback on '${projectId}'.`);
    const restored: StudioModuleProject = JSON.parse(JSON.stringify(target.snapshot));
    return this.saveProject(restored, actor, `Rolled back to v${targetVersion}`);
  }

  static deleteProject(projectId: string): boolean {
    return projects.delete(projectId);
  }

  static clear(): void {
    projects.clear();
  }
}
