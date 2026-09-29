import { NextRequest, NextResponse } from 'next/server';
import { StudioDeploymentEngine } from '@/lib/crude8/studio/deployment-engine';
import { resolveStudioActor, studioHttpStatusFor } from '@/lib/crude8/studio/api-user';

// GET /api/crude8/studio/runtime/[entity] — read records of a deployed studio module
export async function GET(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const actor = resolveStudioActor(req);
    const filters = Object.fromEntries(req.nextUrl.searchParams.entries());
    const records = StudioDeploymentEngine.serveRecords(params.entity, actor, filters);
    return NextResponse.json({ success: true, data: records, count: records.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: studioHttpStatusFor(error.message || '') });
  }
}

// POST /api/crude8/studio/runtime/[entity] — insert a record into a deployed module
export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const entry = StudioDeploymentEngine.getDeployedModule(params.entity);
    if (!entry) {
      return NextResponse.json({ success: false, error: `CRUDE8 Runtime Not Found: no deployed module '${params.entity}'` }, { status: 404 });
    }
    const body = await req.json().catch(() => ({}));
    const actor = resolveStudioActor(req, body.user);

    const createRule = entry.module.permissionRules.find(r => r.role === actor.role && r.action === 'CREATE');
    const isAdmin = actor.role === 'SUPER_ADMIN' || actor.role === 'ORG_ADMIN';
    if (!createRule?.allowed && !isAdmin) {
      return NextResponse.json(
        { success: false, error: `CRUDE8 Permission Denied: role '${actor.role}' cannot create in deployed module '${params.entity}'` },
        { status: 403 }
      );
    }

    const missing = entry.module.fields.filter(f => f.required && (body.payload?.[f.name] === undefined || body.payload?.[f.name] === null || body.payload?.[f.name] === ''));
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `Validation Error: missing required field(s) ${missing.map(m => m.name).join(', ')}` },
        { status: 400 }
      );
    }

    const record = {
      ...(body.payload || {}),
      id: body.payload?.id || `${params.entity.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      version: 1,
      createdAt: new Date().toISOString()
    };
    StudioDeploymentEngine.insertRuntimeRecord(params.entity, record);
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: studioHttpStatusFor(error.message || '') });
  }
}
