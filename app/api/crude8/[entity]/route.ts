import { NextRequest, NextResponse } from 'next/server';
import { CRUDEntityName } from '@/lib/crude8/types';
import { UniversalEntityRegistry } from '@/lib/crude8/entity-registry';
import { CRUDE8Engine } from '@/lib/crude8/crud-engine';
import { UserContext } from '@/lib/crude8/permission-resolver';

function resolveUserContext(req: NextRequest, bodyUser?: Partial<UserContext>): UserContext {
  const role = bodyUser?.role || req.headers.get('x-user-role') || 'SUPER_ADMIN';
  const userId = bodyUser?.userId || req.headers.get('x-user-id') || 'usr-system-admin';
  const tenantId = bodyUser?.tenantId || req.headers.get('x-tenant-id') || 'tenant-voyage-india';

  return { userId, role, tenantId };
}

// 1. CREATE ENTITY
export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const rawEntity = params.entity;
    // Capitalize or match canonical entity
    const entity = (rawEntity.charAt(0).toUpperCase() + rawEntity.slice(1)) as CRUDEntityName;

    if (!UniversalEntityRegistry.hasEntity(entity)) {
      return NextResponse.json(
        { success: false, error: `Invalid CRUDE8 entity: '${rawEntity}'` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const user = resolveUserContext(req, body.user);
    const payload = body.payload || body;

    const response = await CRUDE8Engine.create(entity, payload, user);
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'CRUDE8 Creation Error' },
      { status: error.message?.includes('Permission') ? 403 : 400 }
    );
  }
}

// 2. READ ENTITIES
export async function GET(
  req: NextRequest,
  { params }: { params: { entity: string } }
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

    const { searchParams } = new URL(req.url);
    const filters: Record<string, any> = {};
    searchParams.forEach((val, key) => {
      filters[key] = val;
    });

    const user = resolveUserContext(req);
    const response = await CRUDE8Engine.read(entity, filters, user);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'CRUDE8 Query Error' },
      { status: error.message?.includes('Permission') ? 403 : 500 }
    );
  }
}

// 3. UPDATE ENTITY
export async function PATCH(
  req: NextRequest,
  { params }: { params: { entity: string } }
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

    const body = await req.json().catch(() => ({}));
    const user = resolveUserContext(req, body.user);
    const { id, updates, expectedVersion } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entity ID is required for PATCH update.' },
        { status: 400 }
      );
    }

    const response = await CRUDE8Engine.update(entity, id, updates || {}, user, expectedVersion);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'CRUDE8 Update Error' },
      { status: error.message?.includes('Permission') ? 403 : error.message?.includes('Conflict') ? 409 : 400 }
    );
  }
}

// 4. DELETE ENTITY
export async function DELETE(
  req: NextRequest,
  { params }: { params: { entity: string } }
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

    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = searchParams.get('id') || body.id;
    const mode = searchParams.get('mode') || body.mode || 'SOFT_DELETE';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entity ID is required for DELETE.' },
        { status: 400 }
      );
    }

    const user = resolveUserContext(req, body.user);
    const response = await CRUDE8Engine.delete(entity, id, user, mode);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'CRUDE8 Deletion Error' },
      { status: error.message?.includes('Permission') ? 403 : 400 }
    );
  }
}
