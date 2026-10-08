/**
 * Travel Planet (Voyage8) — Server Authentication & Business Authorization Bridge
 * 
 * Strict Doctrine:
 * "BETTER AUTH AUTHENTICATES. RESEND DELIVERS. TRAVEL PLANET AUTHORIZES."
 * 
 * Flow:
 * REQUEST
 * -> Better Auth Session
 * -> authUserId
 * -> TravelPlanetUser
 * -> Tenant
 * -> Organization
 * -> Branch
 * -> Role
 * -> Permission
 * -> Data Scope
 * -> Pack
 * -> Entitlement
 * -> Feature Flag
 * -> Resource Authorization
 * -> ALLOW/DENY
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import prisma from '../prisma';
import { auth, toAuthUser, getBetterAuthSession } from './better-auth';
import { getClerkAuthUser } from './clerk-auth';
import { auth as clerkAuthServer } from '@clerk/nextjs/server';
import { AuthorizationEngine, AuthUser } from './rbac-engine';
import { ResourceScopeTarget, DataScope } from './scopes';
import { TestFixturesManager } from './test-fixtures';

export interface TenantContext {
  organizationId: string;
  name: string;
  type: string; // 'OPERATOR' | 'VENDOR' | 'AGENCY' | 'CORPORATE'
  status: string;
  plan: string;
  entitlements: string[];
  packs: string[];
}

export interface BranchContext {
  branchCode: string;
  name: string;
  organizationId: string;
  currency: string;
}

export class TravelPlanetAuthBridge {
  /**
   * Safe session extractor working across API routes, Server Actions, and Server Components
   */
  public static async getSession(req?: NextRequest): Promise<any | null> {
    try {
      if (req) {
        const result = await getBetterAuthSession(req);
        return result?.session || null;
      }

      // Next.js App Router server component / action context
      const reqHeaders = headers();
      const sessionResult = await auth.api.getSession({
        headers: reqHeaders,
      });
      return sessionResult?.session || null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves the current authenticated AuthUser
   */
  public static async getCurrentUser(req?: NextRequest): Promise<AuthUser | null> {
    // 1. Try Clerk authentication
    try {
      if (req) {
        const clerkUser = await getClerkAuthUser(req);
        if (clerkUser) return clerkUser;
      } else {
        const clerkAuth = await clerkAuthServer();
        if (clerkAuth && clerkAuth.userId) {
          return {
            id: clerkAuth.userId,
            email: `${clerkAuth.userId}@clerk.user`,
            fullName: 'Clerk User',
            organizationId: clerkAuth.orgId || null,
            workspaceId: null,
            teamIds: [],
            vendorId: null,
            roles: clerkAuth.orgRole ? [clerkAuth.orgRole.toUpperCase()] : ['CUSTOMER'],
          };
        }
      }
    } catch {
      // Continue to Better Auth / dev fixtures fallback
    }

    // 2. Try Better Auth session
    try {
      if (req) {
        const result = await getBetterAuthSession(req);
        if (result?.authUser) return result.authUser;
      } else {
        const reqHeaders = headers();
        const sessionResult = await auth.api.getSession({
          headers: reqHeaders,
        });
        if (sessionResult?.user) {
          return toAuthUser(sessionResult.user, sessionResult.session);
        }
      }
    } catch {
      // Continue to test fixtures fallback
    }

    // 2. Fallback to developer tokens/headers (preserves test fixtures & local runner)
    if (req) {
      const authHeader = req.headers.get('authorization') || '';
      const userIdHeader = req.headers.get('x-user-id');
      const userRoleHeader = req.headers.get('x-user-role');

      const testAccounts = TestFixturesManager.getTestAccounts();

      if (userIdHeader) {
        const match = testAccounts.find(a => a.id === userIdHeader || a.email === userIdHeader);
        if (match) return match;
      }

      if (userRoleHeader) {
        const match = testAccounts.find(a => a.roles.includes(userRoleHeader));
        if (match) return match;
      }

      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim();
        const match = testAccounts.find(a => a.email === token || a.id === token || a.roles.includes(token));
        if (match) return match;
      }
    }

    return null;
  }

  /**
   * Maps Better-Auth identity to persistent TravelPlanetUser record
   * Uses immutable authUserId as primary link. Never uses email as permanent FK.
   */
  public static async getTravelPlanetUser(authUserIdOrEmail: string): Promise<any | null> {
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { authUserId: authUserIdOrEmail },
            { id: authUserIdOrEmail },
            { email: authUserIdOrEmail },
          ],
        },
        include: {
          organization: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      return dbUser;
    } catch {
      // Graceful fallback for mock or offline environments
      const testAccounts = TestFixturesManager.getTestAccounts();
      return testAccounts.find(a => a.id === authUserIdOrEmail || a.email === authUserIdOrEmail) || null;
    }
  }

  /**
   * Resolves trusted server-side TenantContext
   * Never trusts client-provided tenantId
   */
  public static async getTenantContext(user: AuthUser): Promise<TenantContext> {
    const orgId = user.organizationId || 'org_tp_hq';

    // Default HQ Tenant Context
    let tenantContext: TenantContext = {
      organizationId: orgId,
      name: 'Travel Planet India HQ',
      type: 'OPERATOR',
      status: 'ACTIVE',
      plan: 'ENTERPRISE_UNLIMITED',
      entitlements: ['VOYAGE8_ALL', 'DMS8_ENTERPRISE', 'HESTIA8_SEO', 'CRUDE8_STUDIO', 'AI_INTELLIGENCE'],
      packs: ['B2C_COMMERCE', 'B2B2C_SUPPLY', 'GLOBAL_NDC', 'DMC_SETTLEMENTS'],
    };

    try {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (org) {
        tenantContext = {
          organizationId: org.id,
          name: org.name,
          type: org.type,
          status: org.status,
          plan: 'BUSINESS_TIER',
          entitlements: ['VOYAGE8_CORE', 'DMS8_STANDARD', 'HESTIA8_STANDARD'],
          packs: ['TRAVEL_OPERATIONS', 'BOOKING_ENGINE'],
        };
      }
    } catch {
      // Retain default in offline / mock mode
    }

    return tenantContext;
  }

  /**
   * Resolves trusted Branch context
   */
  public static getBranchContext(user: AuthUser, requestedBranchCode?: string): BranchContext {
    const defaultBranch = 'kochi';
    const activeBranch = (requestedBranchCode || defaultBranch).toLowerCase();

    const branchDirectory: Record<string, BranchContext> = {
      kochi: { branchCode: 'kochi', name: 'Kochi Regional Hub', organizationId: user.organizationId || 'org_tp_hq', currency: 'INR' },
      dubai: { branchCode: 'dubai', name: 'Dubai Global Office', organizationId: user.organizationId || 'org_tp_hq', currency: 'AED' },
      delhi: { branchCode: 'delhi', name: 'Delhi NCR Command', organizationId: user.organizationId || 'org_tp_hq', currency: 'INR' },
      'global-hq': { branchCode: 'global-hq', name: 'Travel Planet World HQ', organizationId: user.organizationId || 'org_tp_hq', currency: 'USD' },
    };

    return branchDirectory[activeBranch] || branchDirectory.kochi;
  }

  /**
   * Enforces that request is authenticated, throwing 401 Unauthorized if missing
   */
  public static async requireAuth(req?: NextRequest): Promise<AuthUser> {
    const user = await this.getCurrentUser(req);
    if (!user) {
      const error = new Error('Authentication Required: Valid Better Auth session or token is missing.');
      (error as any).statusCode = 401;
      (error as any).code = 'UNAUTHENTICATED';
      throw error;
    }
    return user;
  }

  /**
   * Enforces permission and data scope, throwing 403 Forbidden if disallowed
   */
  public static requirePermission(
    user: AuthUser,
    permission: string,
    resourceTarget?: ResourceScopeTarget
  ): void {
    const evaluation = AuthorizationEngine.canPerform(user, permission, resourceTarget);
    if (!evaluation.authorized) {
      const error = new Error(evaluation.reason || `Forbidden: Lacks permission '${permission}'`);
      (error as any).statusCode = 403;
      (error as any).code = 'FORBIDDEN';
      (error as any).effectiveScope = evaluation.effectiveScope;
      throw error;
    }
  }

  /**
   * Enforces strict multi-tenant boundary isolation
   */
  public static requireTenantAccess(user: AuthUser, targetTenantId: string): void {
    // Platform Super Admin has unrestricted global access
    if (user.roles.includes('PLATFORM_SUPER_ADMIN') || user.roles.includes('SUPER_ADMIN')) {
      return;
    }

    if (!user.organizationId || user.organizationId !== targetTenantId) {
      const error = new Error(`Forbidden: Tenant isolation breach. Cannot access organization '${targetTenantId}'.`);
      (error as any).statusCode = 403;
      (error as any).code = 'TENANT_ISOLATION_VIOLATION';
      throw error;
    }
  }
}

// Re-exports
export const getSession = (req?: NextRequest) => TravelPlanetAuthBridge.getSession(req);
export const getCurrentUser = (req?: NextRequest) => TravelPlanetAuthBridge.getCurrentUser(req);
export const getTravelPlanetUser = (id: string) => TravelPlanetAuthBridge.getTravelPlanetUser(id);
export const getTenantContext = (user: AuthUser) => TravelPlanetAuthBridge.getTenantContext(user);
export const getBranchContext = (user: AuthUser, code?: string) => TravelPlanetAuthBridge.getBranchContext(user, code);
export const requireAuth = (req?: NextRequest) => TravelPlanetAuthBridge.requireAuth(req);
export const requirePermission = (user: AuthUser, perm: string, target?: ResourceScopeTarget) => TravelPlanetAuthBridge.requirePermission(user, perm, target);
export const requireTenantAccess = (user: AuthUser, tenantId: string) => TravelPlanetAuthBridge.requireTenantAccess(user, tenantId);
