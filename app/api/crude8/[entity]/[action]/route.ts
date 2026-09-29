import { NextRequest, NextResponse } from 'next/server';
import { CRUDEntityName, UniversalActionType, UNIVERSAL_ACTION_TYPES } from '@/lib/crude8/types';
import { UniversalEntityRegistry } from '@/lib/crude8/entity-registry';
import { CRUDE8Engine } from '@/lib/crude8/crud-engine';
import { UserContext } from '@/lib/crude8/permission-resolver';

function resolveUserContext(req: NextRequest, bodyUser?: Partial<UserContext>): UserContext {
  const role = bodyUser?.role || req.headers.get('x-user-role') || 'SUPER_ADMIN';
  const userId = bodyUser?.userId || req.headers.get('x-user-id') || 'usr-system-admin';
  const tenantId = bodyUser?.tenantId || req.headers.get('x-tenant-id') || 'tenant-voyage-india';

  return { userId, role, tenantId };
}

function httpStatusFor(error: string): number {
  if (error.includes('Permission Denied')) return 403;
  if (error.includes('Capability Denied')) return 403;
  if (error.includes('AI Gate')) return 403;
  if (error.includes('Not Found')) return 404;
  if (error.includes('Conflict')) return 409;
  return 400;
}

// POST /api/crude8/[entity]/[action] — execute any universal action through the CRUDE8 pipeline
// Body: { id?, payload?, filters?, expectedVersion?, mode?, user? }
export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string; action: string } }
) {
  try {
    const rawEntity = params.entity;
    const entity = (rawEntity.charAt(0).toUpperCase() + rawEntity.slice(1)) as CRUDEntityName;

    if (!UniversalEntityRegistry.hasEntity(entity)) {
      return NextResponse.json(
        { success: false, error: `Invalid CRUDE8 entity: '${rawEntity}'` },
        { status: 400 }
      );
    }

    const action = params.action.toUpperCase() as UniversalActionType;
    if (!UNIVERSAL_ACTION_TYPES.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid universal action: '${params.action}' (Supported: ${UNIVERSAL_ACTION_TYPES.join(', ')})` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const user = resolveUserContext(req, body.user);

    const response = await CRUDE8Engine.execute(entity, action, user, {
      id: body.id,
      payload: body.payload,
      filters: body.filters,
      expectedVersion: body.expectedVersion,
      mode: body.mode
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const message = error.message || 'CRUDE8 Execution Error';
    return NextResponse.json(
      { success: false, error: message },
      { status: httpStatusFor(message) }
    );
  }
}
