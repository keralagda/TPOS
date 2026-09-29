import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { RbacAuditLogger, AuditActionResult } from '@/lib/auth/audit';

export const GET = RouteGuard.protectApi('audit.view', async (req, user) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId') || undefined;
  const organizationId = url.searchParams.get('organizationId') || undefined;
  const workspaceId = url.searchParams.get('workspaceId') || undefined;
  const result = (url.searchParams.get('result') as AuditActionResult) || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  const logs = RbacAuditLogger.query({
    userId,
    organizationId,
    workspaceId,
    result,
    limit,
  });

  return NextResponse.json({
    success: true,
    totalLogs: logs.length,
    filtersApplied: {
      userId,
      organizationId,
      workspaceId,
      result,
      limit,
    },
    logs,
  });
});
