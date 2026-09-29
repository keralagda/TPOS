import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { RbacAuditLogger } from '@/lib/auth/audit';
import { TestFixturesManager } from '@/lib/auth/test-fixtures';

// In-memory active support sessions map: supportToken -> sessionDetails
interface SupportSession {
  token: string;
  operatorId: string;
  operatorEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  reason: string;
  ticketRef?: string;
  startTime: string;
  expiresAt: string;
  active: boolean;
}

const activeSupportSessions = new Map<string, SupportSession>();

export const POST = RouteGuard.protectApi('settings.manage', async (req, user) => {
  const body = await req.json();
  const { targetUserId, reason, ticketRef, durationMinutes = 60 } = body;

  if (!targetUserId || !reason) {
    return NextResponse.json({
      success: false,
      error: 'Missing mandatory fields: targetUserId and reason are required',
    }, { status: 400 });
  }

  // Operators must have super admin or security admin privileges
  const isSuperOrSecurity = user.roles.some(r => ['PLATFORM_SUPER_ADMIN', 'SECURITY_ADMIN'].includes(r));
  if (!isSuperOrSecurity) {
    return NextResponse.json({
      success: false,
      error: 'Support Access Mode requires PLATFORM_SUPER_ADMIN or SECURITY_ADMIN authorization',
    }, { status: 403 });
  }

  // Find target user
  const accounts = TestFixturesManager.getTestAccounts();
  const targetUser = accounts.find(a => a.id === targetUserId || a.email === targetUserId);

  if (!targetUser) {
    return NextResponse.json({
      success: false,
      error: `Target user '${targetUserId}' not found in active directory`,
    }, { status: 404 });
  }

  // Prevent impersonating another super admin
  if (targetUser.roles.includes('PLATFORM_SUPER_ADMIN') && user.id !== targetUser.id) {
    return NextResponse.json({
      success: false,
      error: 'Impersonation of PLATFORM_SUPER_ADMIN is prohibited by security policy',
    }, { status: 403 });
  }

  const cappedDuration = Math.min(Math.max(durationMinutes, 5), 120); // Between 5 and 120 minutes
  const now = new Date();
  const expires = new Date(now.getTime() + cappedDuration * 60000);
  const supportToken = `supp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const session: SupportSession = {
    token: supportToken,
    operatorId: user.id,
    operatorEmail: user.email || 'operator@travelplanet.local',
    targetUserId: targetUser.id,
    targetUserEmail: targetUser.email,
    reason,
    ticketRef: ticketRef || 'N/A',
    startTime: now.toISOString(),
    expiresAt: expires.toISOString(),
    active: true,
  };

  activeSupportSessions.set(supportToken, session);

  // Log audit event
  RbacAuditLogger.log({
    userId: user.id,
    organizationId: user.organizationId,
    workspaceId: user.workspaceId,
    action: 'INITIATE_SUPPORT_ACCESS',
    permission: 'settings.manage',
    resourceType: 'User',
    resourceId: targetUser.id,
    result: 'SUPPORT_ACCESS_INITIATED',
    metadata: {
      operatorId: user.id,
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      reason,
      ticketRef,
      durationMinutes: cappedDuration,
      expiresAt: session.expiresAt,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Support access active for target user ${targetUser.email}`,
    session: {
      supportToken,
      bannerText: `SUPPORT ACCESS ACTIVE: Impersonating ${targetUser.fullName} (${targetUser.email}) by ${user.id}. Audit logged under Ticket #${ticketRef || 'TEMP'}.`,
      expiresAt: session.expiresAt,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        fullName: targetUser.fullName,
        roles: targetUser.roles,
        organizationId: targetUser.organizationId,
        workspaceId: targetUser.workspaceId,
      },
    },
  });
});

export const DELETE = RouteGuard.protectApi('settings.manage', async (req, user) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token || !activeSupportSessions.has(token)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid or expired support session token',
    }, { status: 404 });
  }

  const session = activeSupportSessions.get(token)!;
  session.active = false;
  activeSupportSessions.delete(token);

  RbacAuditLogger.log({
    userId: user.id,
    organizationId: user.organizationId,
    workspaceId: user.workspaceId,
    action: 'REVOKE_SUPPORT_ACCESS',
    permission: 'settings.manage',
    resourceType: 'User',
    resourceId: session.targetUserId,
    result: 'SESSION_REVOKED',
    metadata: {
      token,
      targetUserId: session.targetUserId,
      endedAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Support access session terminated and audit logged.',
  });
});
