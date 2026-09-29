import { NextRequest } from 'next/server';

export interface StudioActor {
  userId: string;
  role: string;
  tenantId: string;
}

export function resolveStudioActor(req: NextRequest, bodyUser?: Partial<StudioActor>): StudioActor {
  return {
    role: bodyUser?.role || req.headers.get('x-user-role') || 'SUPER_ADMIN',
    userId: bodyUser?.userId || req.headers.get('x-user-id') || 'usr-studio-admin',
    tenantId: bodyUser?.tenantId || req.headers.get('x-tenant-id') || 'tenant-voyage-india'
  };
}

export function studioHttpStatusFor(error: string): number {
  if (error.includes('Permission Denied')) return 403;
  if (error.includes('Not Found')) return 404;
  if (error.includes('Conflict') || error.includes('Governance Violation')) return 409;
  return 400;
}
