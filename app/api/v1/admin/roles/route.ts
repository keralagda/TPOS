import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { SYSTEM_ROLES, SystemRoleDefinition } from '@/lib/auth/roles';
import { RbacAuditLogger } from '@/lib/auth/audit';
import { ALL_PERMISSIONS } from '@/lib/auth/permissions';

// In-memory custom roles storage for runtime additions
const customRoles: Record<string, SystemRoleDefinition> = {};

export const GET = RouteGuard.protectApi('roles.view', async (req, user) => {
  const allRoles = {
    ...SYSTEM_ROLES,
    ...customRoles,
  };

  const roleList = Object.values(allRoles).map(role => ({
    code: role.code,
    name: role.name,
    description: role.description,
    defaultScope: role.defaultScope,
    isSystem: role.isSystem,
    permissionCount: role.permissions.includes('*') ? ALL_PERMISSIONS.length : role.permissions.length,
    permissions: role.permissions,
  }));

  return NextResponse.json({
    success: true,
    totalRoles: roleList.length,
    systemRolesCount: Object.keys(SYSTEM_ROLES).length,
    customRolesCount: Object.keys(customRoles).length,
    roles: roleList,
  });
});

export const POST = RouteGuard.protectApi('roles.create', async (req, user) => {
  const body = await req.json();

  if (!body.code || !body.name || !Array.isArray(body.permissions)) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: code, name, and permissions array',
    }, { status: 400 });
  }

  const roleCode = body.code.toUpperCase().replace(/\s+/g, '_');

  if (SYSTEM_ROLES[roleCode]) {
    return NextResponse.json({
      success: false,
      error: `Cannot overwrite protected system role: ${roleCode}`,
    }, { status: 409 });
  }

  // Validate permissions against catalog (unless wildcard or support access)
  const validCodes = new Set(ALL_PERMISSIONS.map(p => p.code));
  const invalidPerms = body.permissions.filter((p: string) => p !== '*' && !validCodes.has(p));

  if (invalidPerms.length > 0) {
    return NextResponse.json({
      success: false,
      error: `Invalid permissions requested: ${invalidPerms.join(', ')}`,
    }, { status: 400 });
  }

  const newRole: SystemRoleDefinition = {
    code: roleCode,
    name: body.name,
    description: body.description || `Custom role ${body.name}`,
    defaultScope: body.defaultScope || 'WORKSPACE',
    isSystem: false,
    permissions: body.permissions,
  };

  customRoles[roleCode] = newRole;

  RbacAuditLogger.log({
    userId: user.id,
    organizationId: user.organizationId,
    workspaceId: user.workspaceId,
    action: 'CREATE_ROLE',
    permission: 'roles.create',
    resourceType: 'Role',
    resourceId: roleCode,
    result: 'ROLE_CHANGED',
    metadata: { roleName: newRole.name, permissionsCount: newRole.permissions.length },
  });

  return NextResponse.json({
    success: true,
    message: `Role ${roleCode} created successfully.`,
    role: newRole,
  }, { status: 201 });
});
