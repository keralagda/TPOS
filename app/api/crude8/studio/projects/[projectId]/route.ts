import { NextRequest, NextResponse } from 'next/server';
import { StudioProjectStore } from '@/lib/crude8/studio/project-store';
import { StudioModuleProject } from '@/lib/crude8/studio/studio-types';
import { resolveStudioActor, studioHttpStatusFor } from '@/lib/crude8/studio/api-user';

// GET /api/crude8/studio/projects/[projectId] — project + version history
export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const project = StudioProjectStore.getProject(params.projectId);
  if (!project) {
    return NextResponse.json({ success: false, error: `Project '${params.projectId}' not found` }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: project,
    versions: StudioProjectStore.getHistory(params.projectId).map(v => ({
      versionId: v.versionId,
      version: v.version,
      timestamp: v.timestamp,
      actor: v.actor,
      summary: v.summary,
      diffSummary: v.diffSummary
    }))
  });
}

// PUT /api/crude8/studio/projects/[projectId] — save a new version
export async function PUT(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json();
    const actor = resolveStudioActor(req, body.user);
    const incoming = body.project as StudioModuleProject;
    if (!incoming || incoming.projectId !== params.projectId) {
      return NextResponse.json({ success: false, error: 'Body must carry the full project with matching projectId' }, { status: 400 });
    }
    const version = StudioProjectStore.saveProject(incoming, actor.userId, body.summary);
    return NextResponse.json({
      success: true,
      data: { version: version.version, diffSummary: version.diffSummary, project: version.snapshot }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: studioHttpStatusFor(error.message || '') });
  }
}

// POST /api/crude8/studio/projects/[projectId] — version operations
// Body: { action: 'ROLLBACK', targetVersion } | { action: 'COMPARE', fromVersion, toVersion } | { action: 'DELETE_PROJECT' }
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json();
    const actor = resolveStudioActor(req, body.user);

    switch (body.action) {
      case 'ROLLBACK': {
        const version = StudioProjectStore.rollback(params.projectId, Number(body.targetVersion), actor.userId);
        return NextResponse.json({ success: true, data: { version: version.version, project: version.snapshot, diffSummary: version.diffSummary } });
      }
      case 'COMPARE': {
        const diff = StudioProjectStore.compareVersions(params.projectId, Number(body.fromVersion), Number(body.toVersion));
        return NextResponse.json({ success: true, data: { diff } });
      }
      case 'DELETE_PROJECT': {
        const removed = StudioProjectStore.deleteProject(params.projectId);
        if (!removed) return NextResponse.json({ success: false, error: `Project '${params.projectId}' not found` }, { status: 404 });
        return NextResponse.json({ success: true, data: { deleted: true } });
      }
      default:
        return NextResponse.json({ success: false, error: `Unknown version op '${body.action}' (ROLLBACK | COMPARE | DELETE_PROJECT)` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: studioHttpStatusFor(error.message || '') });
  }
}
