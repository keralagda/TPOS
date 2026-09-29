import { NextRequest, NextResponse } from 'next/server';
import { StudioDeploymentEngine } from '@/lib/crude8/studio/deployment-engine';
import { StudioProjectStore } from '@/lib/crude8/studio/project-store';
import { StudioCodegenEngine } from '@/lib/crude8/studio/codegen';
import { StudioSandboxRuntime } from '@/lib/crude8/studio/sandbox-runtime';
import { resolveStudioActor, studioHttpStatusFor } from '@/lib/crude8/studio/api-user';

// GET /api/crude8/studio/deploy — deployments + live runtime modules + audit integrity
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      deployments: StudioDeploymentEngine.listDeployments(),
      deployedModules: StudioDeploymentEngine.listDeployedModules(),
      auditIntegrity: StudioDeploymentEngine.verifyDeploymentAudit()
    }
  });
}

/**
 * POST /api/crude8/studio/deploy — deployment lifecycle
 * Body: { action: 'REQUEST'|'APPROVE'|'REJECT'|'PROMOTE'|'ARTIFACTS', ... }
 *  REQUEST  { projectId, notes? }                    -> PENDING_APPROVAL
 *  APPROVE  { deploymentId }                          -> DEPLOYED (requester != approver)
 *  REJECT   { deploymentId, reason }                  -> REJECTED
 *  PROMOTE  { entityName, sandboxId, projectId }      -> promote sandbox records as seed data
 *  ARTIFACTS{ projectId }                             -> generated code artifacts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = resolveStudioActor(req, body.user);

    switch (body.action) {
      case 'REQUEST': {
        const deployment = StudioDeploymentEngine.requestDeploy(body.projectId, actor, body.notes);
        return NextResponse.json({ success: true, data: deployment }, { status: 201 });
      }
      case 'APPROVE': {
        const deployment = StudioDeploymentEngine.approveDeploy(body.deploymentId, actor);
        return NextResponse.json({ success: true, data: deployment });
      }
      case 'REJECT': {
        const deployment = StudioDeploymentEngine.rejectDeploy(body.deploymentId, actor, body.reason || 'Rejected by approver');
        return NextResponse.json({ success: true, data: deployment });
      }
      case 'PROMOTE': {
        const project = StudioProjectStore.getProject(body.projectId);
        if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        const state = StudioSandboxRuntime.getSandbox(body.sandboxId);
        if (!state) return NextResponse.json({ success: false, error: 'Sandbox not found' }, { status: 404 });
        const store = StudioSandboxRuntime.getStore(state, project.entityName);
        const promoted = StudioDeploymentEngine.promoteSandboxRecords(project.entityName, Array.from(store.values()).filter(r => !r.deletedAt));
        return NextResponse.json({ success: true, data: { promoted, entityName: project.entityName } });
      }
      case 'ARTIFACTS': {
        const project = StudioProjectStore.getProject(body.projectId);
        if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: StudioCodegenEngine.generateAll(project) });
      }
      default:
        return NextResponse.json({ success: false, error: `Unknown deploy op '${body.action}'` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: studioHttpStatusFor(error.message || '') });
  }
}
