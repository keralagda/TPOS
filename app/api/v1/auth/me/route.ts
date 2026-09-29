import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { AuthorizationEngine } from '@/lib/auth/rbac-engine';
import { TestFixturesManager } from '@/lib/auth/test-fixtures';

export async function GET(req: NextRequest) {
  let user = RouteGuard.extractUserFromRequest(req);

  // Default to Super Admin in local development demo if no header is present
  if (!user) {
    const testAccounts = TestFixturesManager.getTestAccounts();
    user = testAccounts[0]; // Super Admin
  }

  const effectiveAccess = AuthorizationEngine.getEffectivePermissions(user);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      organizationId: user.organizationId,
      workspaceId: user.workspaceId,
      roles: user.roles,
      effectiveScope: effectiveAccess.scope,
      isSuperAdmin: effectiveAccess.isSuperAdmin,
      supportModeActive: effectiveAccess.supportModeActive,
      permissionsCount: effectiveAccess.permissions.length,
      permissions: effectiveAccess.permissions,
    },
    meta: {
      authenticatedAt: new Date().toISOString(),
      serverAuthority: 'Travel Planet RBAC Kernel',
    },
  });
}
