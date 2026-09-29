import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { ALL_PERMISSIONS, PERMISSION_DEFINITIONS } from '@/lib/auth/permissions';

export const GET = RouteGuard.protectApi('roles.view', async (req, user) => {
  // Group permissions by domain
  const byDomain = PERMISSION_DEFINITIONS.reduce((acc, perm) => {
    if (!acc[perm.domain]) {
      acc[perm.domain] = [];
    }
    acc[perm.domain].push(perm);
    return acc;
  }, {} as Record<string, typeof PERMISSION_DEFINITIONS>);

  return NextResponse.json({
    success: true,
    totalPermissions: ALL_PERMISSIONS.length,
    domainsCount: Object.keys(byDomain).length,
    domains: Object.keys(byDomain),
    byDomain,
    allPermissions: PERMISSION_DEFINITIONS,
  });
});
