/**
 * Travel Planet (Voyage8) — Clerk Authentication & RBAC Bridge
 * 
 * Bridges Clerk identity (sessions, users, organizations) into canonical AuthUser
 * and Travel Planet OS RBAC Engine.
 */

import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { AuthUser } from './rbac-engine';

export const SUPER_ADMIN_EMAILS = [
  'amal50058@gmail.com',
  'amal50058@gmail',
  'superadmin@test.travelplanet.local',
];

export const SUPER_ADMIN_USER_IDS = [
  'user_3KdDb0aAOjYZSumCzD2gfXwvMfi', // prod
  'user_3KdEX5SAsy9wIytHCNib5cWolM6', // dev
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some(e => normalized === e || normalized.startsWith('amal50058@'));
}

export function isSuperAdminUserId(userId?: string | null): boolean {
  if (!userId) return false;
  return SUPER_ADMIN_USER_IDS.includes(userId);
}

export function normalizeClerkRole(role?: string | null, email?: string | null, userId?: string | null): string[] {
  if (isSuperAdminEmail(email) || isSuperAdminUserId(userId)) {
    return ['PLATFORM_SUPER_ADMIN'];
  }
  if (!role) return ['CUSTOMER'];
  const upper = role.toUpperCase();
  if (upper === 'PLATFORM_SUPER_ADMIN' || upper === 'SUPER_ADMIN') return ['PLATFORM_SUPER_ADMIN'];
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
    let email = (sessionClaims.email as string) || (sessionClaims.email_address as string) || '';
    let fullName = (sessionClaims.name as string) || (sessionClaims.fullName as string) || '';

    // Fast-path for known super admin user IDs
    if (isSuperAdminUserId(authState.userId)) {
      email = email || 'amal50058@gmail.com';
      fullName = fullName || 'Amal Babu';
    }

    // If email is still unknown or we want to verify metadata from Clerk API
    if (!email) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(authState.userId);
        if (user) {
          email = user.emailAddresses?.[0]?.emailAddress || '';
          fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || fullName;
          const publicMetaRole = (user.publicMetadata?.role as string) || (user.publicMetadata?.roles as string[])?.[0];
          if (publicMetaRole) {
            sessionClaims.role = publicMetaRole;
          }
        }
      } catch {
        // Fallback
      }
    }

    if (!email) {
      email = sessionClaims.sub ? `${sessionClaims.sub}@clerk.user` : 'user@clerk.local';
    }
    if (!fullName) {
      fullName = email.split('@')[0] || 'Clerk User';
    }

    const rawRole = (sessionClaims.role as string) || (sessionClaims.metadata?.role as string) || (sessionClaims.public_metadata?.role as string) || authState.orgRole;
    const roles = normalizeClerkRole(rawRole, email, authState.userId);

    return {
      id: authState.userId,
      email,
      fullName: isSuperAdminEmail(email) ? 'Amal Babu (Super Admin)' : fullName,
      organizationId: authState.orgId || 'org_tp_hq',
      workspaceId: 'ws_hq_main',
      teamIds: [],
      vendorId: null,
      roles,
    };
  } catch {
    return null;
  }
}
