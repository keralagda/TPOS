/**
 * Travel Planet (Voyage8) — Server-Side Route & API Guard
 * 
 * Enforces server-side authorization:
 * - 401 Unauthorized for unauthenticated callers
 * - 403 Forbidden for authenticated callers with insufficient permissions or out-of-scope targets
 * - Never relies on UI visibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationEngine, AuthUser } from './rbac-engine';
import { ResourceScopeTarget } from './scopes';
import { TestFixturesManager } from './test-fixtures';

export interface GuardOptions {
  permission: string;
  getResourceTarget?: (req: NextRequest, body?: any) => ResourceScopeTarget | undefined;
}

export class RouteGuard {
  /**
   * Route protection mapping for application route prefixes
   */
  public static readonly PROTECTED_ROUTE_MAP: Record<string, { permission: string; allowedRoles: string[] }> = {
    '/admin': { permission: 'dashboard.view', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN'] },
    '/admin/users': { permission: 'users.view', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN'] },
    '/admin/roles': { permission: 'roles.view', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN'] },
    '/admin/audit': { permission: 'audit.view', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER'] },
    '/vendor': { permission: 'inventory.view', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_OPERATOR'] },
    '/agent': { permission: 'bookings.create', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN', 'TRAVEL_AGENT', 'SALES_MANAGER', 'PARTNER'] },
    '/finance': { permission: 'finance.view', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'] },
    '/operations': { permission: 'trips.manage', allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER'] },
  };

  /**
   * Extract AuthUser from incoming request headers or development bearer token
   */
  public static extractUserFromRequest(req: NextRequest): AuthUser | null {
    // 1. Check custom authorization headers (e.g. x-user-id or bearer token)
    const authHeader = req.headers.get('authorization') || '';
    const userIdHeader = req.headers.get('x-user-id');
    const userRoleHeader = req.headers.get('x-user-role');

    // Development/demo fallback accounts
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

    return null;
  }

  /**
   * Next.js API Handler Wrapper with strict Permission & Data Scope validation
   */
  public static protectApi(
    permission: string,
    handler: (req: NextRequest, user: AuthUser, context?: any) => Promise<NextResponse>,
    getResourceTarget?: (req: NextRequest) => ResourceScopeTarget | undefined
  ) {
    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
      const user = this.extractUserFromRequest(req);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication Required: No valid session token or credentials supplied.',
            code: 'UNAUTHENTICATED',
          },
          { status: 401 }
        );
      }

      const resourceTarget = getResourceTarget ? getResourceTarget(req) : undefined;
      const evaluation = AuthorizationEngine.canPerform(user, permission, resourceTarget, {
        ipAddress: req.ip || req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Browser',
      });

      if (!evaluation.authorized) {
        return NextResponse.json(
          {
            success: false,
            error: evaluation.reason,
            code: 'FORBIDDEN',
            permissionRequired: permission,
            effectiveScope: evaluation.effectiveScope,
          },
          { status: 403 }
        );
      }

      return handler(req, user, context);
    };
  }
}
