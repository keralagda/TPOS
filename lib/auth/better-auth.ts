/**
 * Travel Planet (Voyage8) — Better-Auth Server Engine & RBAC Integration
 * 
 * Unifies Better-Auth multi-tenancy, sessions, bearer tokens, admin impersonation,
 * and organization plugin with Travel Planet OS 43 canonical roles, Resend email delivery,
 * and AuthorizationEngine.
 * 
 * Doctrine: "BETTER AUTH AUTHENTICATES. RESEND DELIVERS. TRAVEL PLANET AUTHORIZES."
 */

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, admin, organization, customSession } from 'better-auth/plugins';
import prisma from '../prisma';
import { SYSTEM_ROLES } from './roles';
import { AuthorizationEngine, AuthUser } from './rbac-engine';
import { DataScope } from './scopes';
import { emailService } from '../email/resend';
import { AuthAuditLogger } from './auth-audit';

// Build the Better Auth roles dictionary from the canonical SYSTEM_ROLES
const betterAuthRoles: Record<string, any> = {};
for (const [code, def] of Object.entries(SYSTEM_ROLES)) {
  betterAuthRoles[code] = {
    permissions: def.permissions,
  };
  betterAuthRoles[code.toLowerCase()] = {
    permissions: def.permissions,
  };
}

// Canonical Admin Roles permitted for administrative oversight
const CANONICAL_ADMIN_ROLES = [
  'PLATFORM_SUPER_ADMIN',
  'ADMIN',
  'ORGANIZATION_ADMIN',
  'SAAS_ADMIN',
  'platform_super_admin',
  'admin',
  'organization_admin',
  'saas_admin',
];

/**
 * Normalizes any role string or array to system-standard uppercase role codes
 */
export function normalizeRoles(rolesInput: unknown): string[] {
  let roles: string[] = [];

  if (Array.isArray(rolesInput)) {
    roles = rolesInput.map(r => String(r).trim());
  } else if (typeof rolesInput === 'string') {
    roles = rolesInput.includes(',')
      ? rolesInput.split(',').map(r => r.trim())
      : [rolesInput.trim()];
  }

  if (roles.length === 0) {
    roles = ['CUSTOMER'];
  }

  return roles.map(r => {
    const upper = r.toUpperCase();
    if (upper === 'SUPER_ADMIN') return 'PLATFORM_SUPER_ADMIN';
    if (upper === 'CRM_AGENT') return 'TRAVEL_AGENT';
    if (upper === 'CONSUMER') return 'CUSTOMER';
    if (upper === 'PARTNER_AGENT') return 'PARTNER';
    if (upper === 'USER') return 'CUSTOMER';
    return upper;
  });
}

/**
 * Transforms a Better-Auth User and Session into the canonical Travel Planet AuthUser
 */
export function toAuthUser(user: any, session?: any): AuthUser {
  if (!user) {
    throw new Error('toAuthUser: user object is required');
  }

  const rawRole = user.role || session?.user?.role || 'CUSTOMER';
  const rawRoles = user.roles || session?.user?.roles || [rawRole];
  const roles = normalizeRoles(rawRoles);

  const authUser: AuthUser = {
    id: user.id || session?.userId || 'usr_anonymous',
    email: user.email || '',
    fullName: user.fullName || user.name || user.email?.split('@')[0] || 'Traveler',
    organizationId: session?.activeOrganizationId || user.organizationId || null,
    workspaceId: user.workspaceId || null,
    teamIds: user.teamIds || [],
    vendorId: user.vendorId || null,
    roles,
    supportSession: session?.isSupportSession || session?.impersonatedBy ? {
      active: true,
      impersonatedByUserId: session.impersonatedBy || 'system_admin',
      reason: session.supportReason || 'Support & Troubleshooting Session',
      expiresAt: session.expiresAt ? new Date(session.expiresAt).toISOString() : new Date(Date.now() + 3600000).toISOString(),
    } : undefined,
  };

  return authUser;
}

/**
 * Better-Auth Server Instance configured with Prisma, Resend & RBAC Plugins
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'travel-planet-os-master-h8-voyage8-secret-2026-key',
  user: {
    fields: {
      name: 'fullName',
    },
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'CUSTOMER',
      },
      phone: {
        type: 'string',
        required: false,
      },
      avatarUrl: {
        type: 'string',
        required: false,
      },
      organizationId: {
        type: 'string',
        required: false,
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Email and Password Authentication Flows
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Permissive in dev; links sent for self-verification
    sendResetPassword: async ({ user, url, token }: { user: any; url: string; token: string }) => {
      AuthAuditLogger.log({
        authUserId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        result: 'SUCCESS',
        metadata: { email: user.email },
      });

      await emailService.sendPasswordResetEmail({
        email: user.email,
        name: user.name || user.fullName,
        resetUrl: url,
      });
    },
  },

  // Email Verification Flows
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }: { user: any; url: string; token: string }) => {
      AuthAuditLogger.log({
        authUserId: user.id,
        action: 'ACCOUNT_CREATED',
        result: 'SUCCESS',
        metadata: { email: user.email },
      });

      await emailService.sendVerificationEmail({
        email: user.email,
        name: user.name || user.fullName,
        verificationUrl: url,
      });
    },
  },

  // Lifecycle Database Hooks: Automatically sync authUserId -> TravelPlanetUser
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser: any) => {
          try {
            await prisma.user.updateMany({
              where: {
                OR: [
                  { email: createdUser.email },
                  { id: createdUser.id },
                ],
                authUserId: null,
              },
              data: {
                authUserId: createdUser.id,
              },
            });
          } catch {
            // Graceful non-blocking fallback in mock or offline testing
          }
        },
      },
    },
  },

  plugins: [
    // Support Bearer Tokens across mobile, API clients, and services
    bearer(),

    // Admin Plugin: role provisioning, unban/ban, and support impersonation
    admin({
      defaultRole: 'CUSTOMER',
      adminRoles: CANONICAL_ADMIN_ROLES,
      roles: betterAuthRoles,
    }),

    // Multi-Tenant Organization Plugin
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: 'owner',
    }),

    // Custom Session Enricher: Injects computed RBAC permissions & data scopes
    customSession(async ({ user, session }: { user: any; session: any }) => {
      const authUser = toAuthUser(user, session);
      const effectivePermissions = AuthorizationEngine.getEffectivePermissions(authUser);
      const dataScope = AuthorizationEngine.getDataScope(authUser);

      return {
        user: {
          ...user,
          fullName: authUser.fullName,
          roles: authUser.roles,
          effectivePermissions: effectivePermissions.permissions,
          dataScope,
          isSuperAdmin: effectivePermissions.isSuperAdmin,
          organizationId: authUser.organizationId,
          vendorId: authUser.vendorId,
          workspaceId: authUser.workspaceId,
          supportSession: authUser.supportSession,
        },
        session: {
          ...session,
          roles: authUser.roles,
          dataScope,
          activeOrganizationId: session.activeOrganizationId || authUser.organizationId,
        },
      };
    }),
  ],
});

/**
 * Safely extracts Better-Auth session from incoming Next.js / Fetch request headers
 */
export async function getBetterAuthSession(
  reqOrHeaders: Request | { headers: Headers | Record<string, string | string[] | undefined> } | Headers
): Promise<{ user: any; session: any; authUser: AuthUser } | null> {
  try {
    let headers: Headers;
    if (reqOrHeaders instanceof Headers) {
      headers = reqOrHeaders;
    } else if ('headers' in reqOrHeaders && reqOrHeaders.headers instanceof Headers) {
      headers = reqOrHeaders.headers;
    } else if ('headers' in reqOrHeaders && typeof reqOrHeaders.headers === 'object') {
      headers = new Headers();
      for (const [k, v] of Object.entries(reqOrHeaders.headers)) {
        if (typeof v === 'string') headers.set(k, v);
        else if (Array.isArray(v)) v.forEach(item => headers.append(k, item));
      }
    } else {
      headers = new Headers();
    }

    const sessionResult = await auth.api.getSession({
      headers,
    });

    if (!sessionResult || !sessionResult.user) {
      return null;
    }

    const authUser = toAuthUser(sessionResult.user, sessionResult.session);
    return {
      user: sessionResult.user,
      session: sessionResult.session,
      authUser,
    };
  } catch (error) {
    // Graceful fallback when database connection is not reachable in mock or test modes
    return null;
  }
}
