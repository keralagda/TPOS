/**
 * Travel Planet (Voyage8) — Clerk Authentication & RBAC Bridge
 * 
 * Bridges Clerk identity (sessions, users, organizations) into canonical AuthUser
 * and Travel Planet OS RBAC Engine.
 */

import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { AuthUser } from './rbac-engine';

export function normalizeClerkRole(role?: string | null): string[] {
  if (!role) return ['CUSTOMER'];
  const upper = role.toUpperCase();
  if (upper === 'ADMIN' || upper === 'ORG:ADMIN') return ['ORGANIZATION_ADMIN'];
  if (upper === 'MEMBER' || upper === 'ORG:MEMBER') return ['CUSTOMER'];
  return [upper];
}

export async function getClerkAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authState = getAuth(req);
    if (!authState || !authState.userId) {
      return null;
    }

    const sessionClaims = (authState.sessionClaims || {}) as Record<string, any>;
    const email = (sessionClaims.email as string) || (sessionClaims.sub ? `${sessionClaims.sub}@clerk.user` : 'user@clerk.local');
    const fullName = (sessionClaims.name as string) || (sessionClaims.fullName as string) || 'Clerk User';

    const roles = normalizeClerkRole(authState.orgRole || (sessionClaims.role as string) || 'CUSTOMER');

    return {
      id: authState.userId,
      email,
      fullName,
      organizationId: authState.orgId || null,
      workspaceId: null,
      teamIds: [],
      vendorId: null,
      roles,
    };
  } catch {
    return null;
  }
}
