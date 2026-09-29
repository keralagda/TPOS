import { NextRequest, NextResponse } from 'next/server';
import { StudioProjectStore } from '@/lib/crude8/studio/project-store';
import { StudioSandboxRuntime } from '@/lib/crude8/studio/sandbox-runtime';
import { StudioDataMockEngine } from '@/lib/crude8/studio/data-mock-engine';
import { SandboxPersona, SANDBOX_PERSONA_USERS } from '@/lib/crude8/studio/studio-types';
import { UniversalActionType } from '@/lib/crude8/types';
import { studioHttpStatusFor } from '@/lib/crude8/studio/api-user';

// GET /api/crude8/studio/sandbox — list active sandboxes
export async function GET() {
  return NextResponse.json({ success: true, data: StudioSandboxRuntime.listSandboxes() });
}

/**
 * POST /api/crude8/studio/sandbox — simulation operations (never touch production)
 * Body: { op, projectId, sandboxId?, ...op params }
 *  CREATE_SANDBOX | MOCK | RECORD_ACTION | RUN_WORKFLOW | PERMISSION_TEST | FIRE_EVENT | GET_STATE | DESTROY
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project = StudioProjectStore.getProject(body.projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: `Project '${body.projectId}' not found` }, { status: 404 });
    }

    switch (body.op) {
      case 'CREATE_SANDBOX': {
        const state = StudioSandboxRuntime.createSandbox(project, body.seedCounts);
        const records = StudioSandboxRuntime.getStore(state, project.entityName);
        return NextResponse.json({
          success: true,
          data: {
            sandboxId: state.sandboxId,
            seededCount: records.size,
            personas: Object.keys(SANDBOX_PERSONA_USERS),
            auditIntact: StudioSandboxRuntime.verifyAuditChain(state)
          }
        });
      }

      case 'MOCK': {
        const state = StudioSandboxRuntime.getSandbox(body.sandboxId);
        if (!state) return NextResponse.json({ success: false, error: 'Sandbox not found' }, { status: 404 });
        const records = StudioDataMockEngine.generateMockRecords(project, { count: Number(body.count) || 25, includeEdgeCases: true, relatedIds: {} });
        const store = StudioSandboxRuntime.getStore(state, project.entityName);
        store.clear();
        for (const record of records) store.set(record.id, record);
        return NextResponse.json({ success: true, data: { regenerated: records.length, sample: records.slice(0, 3) } });
      }

      case 'RECORD_ACTION': {
        const state = StudioSandboxRuntime.getSandbox(body.sandboxId);
        if (!state) return NextResponse.json({ success: false, error: 'Sandbox not found' }, { status: 404 });
        const persona = (body.persona || 'ADMIN') as SandboxPersona;
        const user = SANDBOX_PERSONA_USERS[persona];
        const result = StudioSandboxRuntime.execAction(state, project, body.action as UniversalActionType | string, user, {
          id: body.id,
          payload: body.payload,
          filters: body.filters
        });
        return NextResponse.json({ success: result.success, data: result }, { status: result.success ? 200 : 400 });
      }

      case 'RUN_WORKFLOW': {
        const state = StudioSandboxRuntime.getSandbox(body.sandboxId);
        if (!state) return NextResponse.json({ success: false, error: 'Sandbox not found' }, { status: 404 });
        const run = await StudioSandboxRuntime.runWorkflow(
          state, project, body.workflowId, (body.persona || 'ADMIN') as SandboxPersona, body.input || {}
        );
        return NextResponse.json({ success: run.success, data: run }, { status: run.success ? 200 : 400 });
      }

      case 'PERMISSION_TEST': {
        const state = StudioSandboxRuntime.getSandbox(body.sandboxId);
        if (!state) return NextResponse.json({ success: false, error: 'Sandbox not found' }, { status: 404 });
        const result = StudioSandboxRuntime.simulatePermission(
          state, project, (body.persona || 'AGENT') as SandboxPersona, body.action as UniversalActionType, body.recordId
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'FIRE_EVENT': {
        const state = StudioSandboxRuntime.getSandbox(body.sandboxId);
        if (!state) return NextResponse.json({ success: false, error: 'Sandbox not found' }, { status: 404 });
        const triggered = StudioSandboxRuntime.getEventLog(state);
        return NextResponse.json({
          success: true,
          data: {
            eventLog: triggered.slice(0, 25),
            note: `Event '${body.eventName}' simulated against project event registry (${project.events.length} events, ${project.automations.length} automations)`
          }
        });
      }

      case 'GET_STATE': {
        const state = StudioSandboxRuntime.getSandbox(body.sandboxId);
        if (!state) return NextResponse.json({ success: false, error: 'Sandbox not found' }, { status: 404 });
        const store = StudioSandboxRuntime.getStore(state, project.entityName);
        return NextResponse.json({
          success: true,
          data: {
            sandboxId: state.sandboxId,
            records: Array.from(store.values()).slice(0, 100),
            events: StudioSandboxRuntime.getEventLog(state).slice(0, 25),
            audit: StudioSandboxRuntime.getAuditChain(state).slice(0, 25),
            auditIntegrity: StudioSandboxRuntime.verifyAuditChain(state),
            workflowTraces: state.workflowTraces.slice(0, 5)
          }
        });
      }

      case 'DESTROY': {
        const destroyed = StudioSandboxRuntime.destroySandbox(body.sandboxId);
        return NextResponse.json({ success: destroyed, data: { destroyed } });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown sandbox op '${body.op}' (CREATE_SANDBOX | MOCK | RECORD_ACTION | RUN_WORKFLOW | PERMISSION_TEST | FIRE_EVENT | GET_STATE | DESTROY)` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: studioHttpStatusFor(error.message || '') });
  }
}
