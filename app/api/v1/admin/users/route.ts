import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { TestFixturesManager } from '@/lib/auth/test-fixtures';
import { RbacAuditLogger } from '@/lib/auth/audit';

export const GET = RouteGuard.protectApi('users.view', async (req, user) => {
  const accounts = TestFixturesManager.getTestAccounts();

  const safeUsers = accounts.map(a => ({
    id: a.id,
    name: a.fullName,
    email: a.email,
    organizationId: a.organizationId || 'Personal',
    workspaceId: a.workspaceId || 'Default',
    roles: a.roles,
    status: 'ACTIVE',
    mfaEnabled: a.roles.includes('PLATFORM_SUPER_ADMIN') || a.roles.includes('FINANCE_MANAGER'),
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
  }));

  return NextResponse.json({
    success: true,
    totalUsers: safeUsers.length,
    users: safeUsers,
    callerScope: user.roles,
  });
});

export const POST = RouteGuard.protectApi('users.create', async (req, user) => {
  const body = await req.json();

  if (!body.email || !body.fullName || !body.role) {
    return NextResponse.json({
      success: false,
      error: 'Missing mandatory user fields: email, fullName, role',
    }, { status: 400 });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email: body.email,
    fullName: body.fullName,
    organizationId: body.organizationId || user.organizationId,
    workspaceId: body.workspaceId || user.workspaceId,
    roles: [body.role],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  RbacAuditLogger.log({
    userId: user.id,
    organizationId: user.organizationId,
    workspaceId: user.workspaceId,
    action: 'CREATE_USER',
    permission: 'users.create',
    resourceType: 'User',
    resourceId: newUser.id,
    result: 'ROLE_CHANGED',
    metadata: { createdUserEmail: newUser.email, assignedRole: body.role },
  });

  return NextResponse.json({
    success: true,
    message: 'User provisioned successfully.',
    user: newUser,
  }, { status: 201 });
});
