/**
 * CRUDE8 STUDIO: WORKFLOW ENGINE
 * Executes visually-composed workflow graphs (trigger, condition, action,
 * approval, notification, AI step, API call, database update, delay, human
 * review) against a pluggable executor. Produces a full execution trace.
 * In the sandbox, approvals/reviews auto-resolve and API/AI calls are mocked;
 * the same engine is designed to run in production with real executors.
 */

import { StudioWorkflowDefinition, StudioWorkflowNode, WorkflowTraceEntry } from './studio-types';
import { UserContext } from '../permission-resolver';

export interface WorkflowExecutorContext {
  user: UserContext;
  execCrud: (entity: string, action: string, payload: Record<string, any>) => Promise<Record<string, any>>;
  notify: (channel: string, template: string, to: string) => Promise<string>;
  ai: (prompt: string, input: Record<string, any>) => Promise<Record<string, any>>;
  apiCall: (url: string, method: string, body: Record<string, any>) => Promise<Record<string, any>>;
  requestApproval: (label: string, context: Record<string, any>) => Promise<{ approved: boolean; approver: string }>;
}

function resolveTemplate(template: string, context: Record<string, any>): any {
  const match = template.match(/^\{\{\s*([\w.]+)\s*\}\}$/);
  if (match) {
    const value = match[1].split('.').reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), context as any);
    return value;
  }
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path: string) => {
    const value = path.split('.').reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), context as any);
    return value == null ? '' : String(value);
  });
}

function resolveConfig(config: Record<string, any>, context: Record<string, any>): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') resolved[key] = resolveTemplate(value, context);
    else if (value && typeof value === 'object' && !Array.isArray(value)) resolved[key] = resolveConfig(value, context);
    else resolved[key] = value;
  }
  return resolved;
}

function evaluateCondition(config: Record<string, any>, context: Record<string, any>): boolean {
  const field = String(config.field || '');
  const operator = String(config.operator || 'equals');
  const expected = config.value;
  const actual = field.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), context);

  switch (operator) {
    case 'equals': return actual == expected;
    case 'not_equals': return actual != expected;
    case 'gt': return Number(actual) > Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'lte': return Number(actual) <= Number(expected);
    case 'contains': return String(actual ?? '').toLowerCase().includes(String(expected).toLowerCase());
    case 'exists': return actual !== undefined && actual !== null && actual !== '';
    default: return false;
  }
}

export class StudioWorkflowEngine {
  /**
   * Runs a workflow definition and returns the full node-by-node trace.
   * Unknown/missing next nodes terminate the run gracefully.
   */
  static async run(
    workflow: StudioWorkflowDefinition,
    input: Record<string, any>,
    exec: WorkflowExecutorContext,
    maxSteps: number = 25
  ): Promise<WorkflowTraceEntry[]> {
    const trace: WorkflowTraceEntry[] = [];
    const nodeIndex = new Map<string, StudioWorkflowNode>(workflow.nodes.map(n => [n.nodeId, n]));

    const context: Record<string, any> = { ...input, workflow: { id: workflow.workflowId, name: workflow.name } };
    let currentNodeId: string | undefined = workflow.startNodeId;
    let steps = 0;

    while (currentNodeId && steps < maxSteps) {
      const node = nodeIndex.get(currentNodeId);
      if (!node) break;
      steps++;

      const entry: WorkflowTraceEntry = {
        nodeId: node.nodeId,
        type: node.type,
        name: node.name,
        status: 'EXECUTED',
        detail: '',
        timestamp: new Date().toISOString()
      };

      try {
        switch (node.type) {
          case 'TRIGGER': {
            entry.detail = `Workflow triggered by '${workflow.triggerEvent}'`;
            break;
          }
          case 'CONDITION': {
            const config = resolveConfig(node.config, context);
            const result = evaluateCondition(config, context);
            entry.detail = `Condition ${config.field} ${config.operator} ${JSON.stringify(config.value)} -> ${result}`;
            currentNodeId = result ? node.nextTrue : node.nextFalse;
            trace.push(entry);
            continue;
          }
          case 'ACTION': {
            const config = resolveConfig(node.config, context);
            const result = await exec.execCrud(config.entity || workflow.entity, config.action || 'CREATE', config.payload || {});
            context[node.nodeId] = result;
            context.last = result;
            entry.detail = `Executed ${config.action || 'CREATE'} on ${config.entity || workflow.entity} (id: ${result?.id ?? 'n/a'})`;
            break;
          }
          case 'DATABASE_UPDATE': {
            const config = resolveConfig(node.config, context);
            const result = await exec.execCrud(config.entity || workflow.entity, 'UPDATE', config.patch || {});
            context[node.nodeId] = result;
            context.last = result;
            entry.detail = `Database update on ${config.entity || workflow.entity}: ${Object.keys(config.patch || {}).join(', ')}`;
            break;
          }
          case 'APPROVAL': {
            const config = resolveConfig(node.config, context);
            const approval = await exec.requestApproval(node.name, context);
            entry.status = approval.approved ? 'AUTO_APPROVED' : 'SKIPPED';
            entry.detail = approval.approved ? `Approved by ${approval.approver}` : 'Approval denied — branch skipped';
            if (!approval.approved) {
              trace.push(entry);
              currentNodeId = node.nextFalse;
              continue;
            }
            break;
          }
          case 'HUMAN_REVIEW': {
            const review = await exec.requestApproval(node.name, context);
            entry.status = review.approved ? 'AUTO_APPROVED' : 'SKIPPED';
            entry.detail = review.approved ? `Reviewed by ${review.approver}` : 'Review rejected — branch skipped';
            if (!review.approved) {
              trace.push(entry);
              currentNodeId = node.nextFalse;
              continue;
            }
            break;
          }
          case 'NOTIFICATION': {
            const config = resolveConfig(node.config, context);
            const receipt = await exec.notify(config.channel || 'EMAIL', config.template || 'GENERIC', config.to || 'customer');
            context[node.nodeId] = { receipt };
            entry.detail = `Notification via ${config.channel || 'EMAIL'} (${config.template || 'GENERIC'}) — receipt ${receipt}`;
            break;
          }
          case 'AI_STEP': {
            const config = resolveConfig(node.config, context);
            const result = await exec.ai(config.prompt || 'Analyze the record', context);
            context[node.nodeId] = result;
            context.last = result;
            entry.detail = `AI step '${node.name}': ${JSON.stringify(result).slice(0, 140)}`;
            break;
          }
          case 'API_CALL': {
            const config = resolveConfig(node.config, context);
            const result = await exec.apiCall(config.url || 'https://api.internal/mock', config.method || 'POST', config.body || {});
            context[node.nodeId] = result;
            context.last = result;
            entry.status = 'MOCKED';
            entry.detail = `${config.method || 'POST'} ${config.url || 'internal'} -> mocked response`;
            break;
          }
          case 'DELAY': {
            const config = resolveConfig(node.config, context);
            entry.detail = `Delay ${config.durationMs || 0}ms resolved instantly in simulation`;
            break;
          }
          default:
            entry.detail = 'Node type executed';
        }
      } catch (err: any) {
        entry.status = 'FAILED';
        entry.detail = err.message || 'Workflow node failed';
        trace.push(entry);
        break;
      }

      trace.push(entry);
      currentNodeId = node.next;
    }

    return trace;
  }
}
