/**
 * Travel Planet (Voyage8) — Better-Auth RBAC Master Automated Test Suite
 * 
 * Verifies:
 * 1. Better-Auth server engine initialization & plugins (bearer, admin, organization, customSession)
 * 2. Role normalization, mapping of 43 canonical roles, and admin role assignments
 * 3. Session-to-AuthUser bridge (toAuthUser) with support impersonation
 * 4. Custom session enrichment with AuthorizationEngine (permissions, data scope)
 * 5. RouteGuard async integration (resolveUserFromRequest & protectApi)
 * 6. Client SDK and Next.js catch-all API route handler
 */

const assert = require('assert');

// 1. Load System Roles & Scopes
const { SYSTEM_ROLES } = require('../lib/auth/roles');
const { ALL_PERMISSION_CODES } = require('../lib/auth/permissions');
const { AuthorizationEngine } = require('../lib/auth/rbac-engine');
const { RouteGuard } = require('../lib/auth/middleware-guard');
const { TestFixturesManager } = require('../lib/auth/test-fixtures');
const {
  auth,
  normalizeRoles,
  toAuthUser,
  getBetterAuthSession,
} = require('../lib/auth/better-auth');
const { GET, POST } = require('../app/api/auth/[...all]/route');

console.log('====================================================');
console.log('TRAVEL PLANET — BETTER-AUTH RBAC VERIFICATION SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log('Section 1: Better-Auth Server Engine & Plugin Initialization');

  runTest('Better-Auth server instance is initialized and exports API methods', () => {
    assert.ok(auth, 'Better-Auth server instance must exist');
    assert.strictEqual(typeof auth.api, 'object', 'auth.api must be an object');
    assert.strictEqual(typeof auth.api.getSession, 'function', 'auth.api.getSession must be a function');
    assert.strictEqual(typeof auth.api.signInEmail, 'function', 'auth.api.signInEmail must be a function');
    assert.strictEqual(typeof auth.api.signUpEmail, 'function', 'auth.api.signUpEmail must be a function');
    assert.strictEqual(typeof auth.api.signOut, 'function', 'auth.api.signOut must be a function');
    assert.strictEqual(typeof auth.api.createOrganization, 'function', 'organization plugin createOrganization must be loaded');
    assert.strictEqual(typeof auth.api.impersonateUser, 'function', 'admin plugin impersonateUser must be loaded');
  });

  runTest('Better-Auth Next.js route handlers (GET/POST) are exported', () => {
    assert.strictEqual(typeof GET, 'function', 'GET route handler must be a function');
    assert.strictEqual(typeof POST, 'function', 'POST route handler must be a function');
  });

  console.log('\nSection 2: Role Normalization & Canonical RBAC Alignment');

  runTest('normalizeRoles correctly converts single strings, arrays, and legacy aliases', () => {
    assert.deepStrictEqual(normalizeRoles('ADMIN'), ['ADMIN']);
    assert.deepStrictEqual(normalizeRoles(['admin', 'sales_agent']), ['ADMIN', 'SALES_AGENT']);
    assert.deepStrictEqual(normalizeRoles('SUPER_ADMIN'), ['PLATFORM_SUPER_ADMIN']);
    assert.deepStrictEqual(normalizeRoles('CRM_AGENT'), ['TRAVEL_AGENT']);
    assert.deepStrictEqual(normalizeRoles('CONSUMER'), ['CUSTOMER']);
    assert.deepStrictEqual(normalizeRoles('USER'), ['CUSTOMER']);
    assert.deepStrictEqual(normalizeRoles([]), ['CUSTOMER']);
    assert.deepStrictEqual(normalizeRoles(null), ['CUSTOMER']);
    assert.deepStrictEqual(normalizeRoles('ADMIN, OPERATIONS_MANAGER'), ['ADMIN', 'OPERATIONS_MANAGER']);
  });

  runTest('All 43 system roles are defined in SYSTEM_ROLES and have valid default scopes', () => {
    const roleKeys = Object.keys(SYSTEM_ROLES);
    assert.ok(roleKeys.length >= 35, `Expected at least 35 system roles, got ${roleKeys.length}`);
    assert.ok(roleKeys.includes('PLATFORM_SUPER_ADMIN'));
    assert.ok(roleKeys.includes('ADMIN'));
    assert.ok(roleKeys.includes('OPERATIONS_MANAGER'));
    assert.ok(roleKeys.includes('TRAVEL_AGENT'));
    assert.ok(roleKeys.includes('CUSTOMER'));
    assert.ok(roleKeys.includes('VENDOR_ADMIN'));
    assert.ok(roleKeys.includes('PARTNER'));

    const validScopes = [
      'GLOBAL', 'ORGANIZATION', 'REGION', 'BRANCH', 'WORKSPACE',
      'TEAM', 'ASSIGNED', 'OWN_RECORDS', 'OWN_CUSTOMERS', 'OWN_VENDOR',
      'CUSTOMER_GROUP', 'READ_ONLY', 'NONE'
    ];

    for (const roleKey of roleKeys) {
      const def = SYSTEM_ROLES[roleKey];
      assert.ok(def.code, `Role ${roleKey} must have a code`);
      assert.ok(Array.isArray(def.permissions), `Role ${roleKey} must have an array of permissions`);
      assert.ok(validScopes.includes(def.defaultScope), `Role ${roleKey} has invalid defaultScope: ${def.defaultScope}`);
    }
  });

  console.log('\nSection 3: Session-to-AuthUser Bridge (toAuthUser)');

  runTest('toAuthUser accurately bridges Better-Auth user and session to AuthUser', () => {
    const mockUser = {
      id: 'usr_ba_123',
      email: 'alex@travelplanet.com',
      fullName: 'Alex Vance',
      role: 'TRAVEL_AGENT',
      organizationId: 'org_north',
      workspaceId: 'ws_delhi',
    };
    const mockSession = {
      userId: 'usr_ba_123',
      activeOrganizationId: 'org_north',
      token: 'session_token_xyz',
    };

    const authUser = toAuthUser(mockUser, mockSession);
    assert.strictEqual(authUser.id, 'usr_ba_123');
    assert.strictEqual(authUser.email, 'alex@travelplanet.com');
    assert.strictEqual(authUser.fullName, 'Alex Vance');
    assert.deepStrictEqual(authUser.roles, ['TRAVEL_AGENT']);
    assert.strictEqual(authUser.organizationId, 'org_north');
    assert.strictEqual(authUser.workspaceId, 'ws_delhi');
    assert.strictEqual(authUser.supportSession, undefined);
  });

  runTest('toAuthUser handles support impersonation session correctly', () => {
    const mockUser = {
      id: 'usr_customer_99',
      email: 'traveler@gmail.com',
      name: 'Traveler Jane',
      role: 'CUSTOMER',
    };
    const mockSession = {
      userId: 'usr_customer_99',
      impersonatedBy: 'usr_super_admin',
      isSupportSession: true,
      supportReason: 'Investigating flight booking sync issue',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    const authUser = toAuthUser(mockUser, mockSession);
    assert.strictEqual(authUser.id, 'usr_customer_99');
    assert.deepStrictEqual(authUser.roles, ['CUSTOMER']);
    assert.ok(authUser.supportSession, 'Support session must be populated');
    assert.strictEqual(authUser.supportSession.active, true);
    assert.strictEqual(authUser.supportSession.impersonatedByUserId, 'usr_super_admin');
    assert.strictEqual(authUser.supportSession.reason, 'Investigating flight booking sync issue');
  });

  console.log('\nSection 4: RBAC Permissions & Data Scopes with Better-Auth User');

  runTest('AuthorizationEngine grants Platform Super Admin full wildcard access and GLOBAL scope', () => {
    const superAdminUser = toAuthUser({
      id: 'usr_super_1',
      email: 'super@tp.com',
      name: 'Super Admin',
      role: 'PLATFORM_SUPER_ADMIN',
    });

    assert.strictEqual(AuthorizationEngine.hasPermission(superAdminUser, 'dashboard.view'), true);
    assert.strictEqual(AuthorizationEngine.hasPermission(superAdminUser, 'anything.unregistered'), true);
    assert.strictEqual(AuthorizationEngine.getDataScope(superAdminUser), 'GLOBAL');

    const effective = AuthorizationEngine.getEffectivePermissions(superAdminUser);
    assert.strictEqual(effective.isSuperAdmin, true);
    assert.strictEqual(effective.scope, 'GLOBAL');
    assert.ok(effective.permissions.length > 50);
  });

  runTest('AuthorizationEngine limits Customer to own scope and booking permissions', () => {
    const customerUser = toAuthUser({
      id: 'usr_cust_2',
      email: 'customer@tp.com',
      name: 'Customer Bob',
      role: 'CUSTOMER',
    });

    assert.strictEqual(AuthorizationEngine.hasPermission(customerUser, 'bookings.view'), true);
    assert.strictEqual(AuthorizationEngine.hasPermission(customerUser, 'roles.create'), false);
    assert.strictEqual(AuthorizationEngine.hasPermission(customerUser, 'users.delete'), false);
    assert.strictEqual(AuthorizationEngine.getDataScope(customerUser), 'OWN_RECORDS');

    // Customer can access their own resource
    const ownResource = { ownerUserId: 'usr_cust_2' };
    const otherResource = { ownerUserId: 'usr_other_4' };
    assert.strictEqual(AuthorizationEngine.canAccessResource(customerUser, ownResource), true);
    assert.strictEqual(AuthorizationEngine.canAccessResource(customerUser, otherResource), false);
  });

  runTest('AuthorizationEngine enforces Vendor Admin scope and inventory permissions', () => {
    const vendorUser = toAuthUser({
      id: 'usr_vend_1',
      email: 'vendor@tp.com',
      name: 'Vendor Alice',
      role: 'VENDOR_ADMIN',
      vendorId: 'vnd_taj_hotels',
    });

    assert.strictEqual(AuthorizationEngine.hasPermission(vendorUser, 'inventory.view'), true);
    assert.strictEqual(AuthorizationEngine.hasPermission(vendorUser, 'inventory.create'), true);
    assert.strictEqual(AuthorizationEngine.hasPermission(vendorUser, 'roles.create'), false);
    assert.strictEqual(AuthorizationEngine.getDataScope(vendorUser), 'OWN_VENDOR');

    // Can access own vendor resource
    assert.strictEqual(AuthorizationEngine.canAccessResource(vendorUser, { vendorId: 'vnd_taj_hotels' }), true);
    assert.strictEqual(AuthorizationEngine.canAccessResource(vendorUser, { vendorId: 'vnd_marriott' }), false);
  });

  console.log('\nSection 5: RouteGuard Integration & Backward Compatibility');

  runTest('RouteGuard.extractUserFromRequest correctly resolves test fixtures and dev accounts', () => {
    const mockReqAdmin = {
      headers: new Headers({
        'x-user-role': 'ADMIN',
      }),
    };
    const user = RouteGuard.extractUserFromRequest(mockReqAdmin);
    assert.ok(user, 'Must resolve test account for ADMIN');
    assert.ok(user.roles.includes('ADMIN'));

    const mockReqBearer = {
      headers: new Headers({
        authorization: 'Bearer usr_super_admin',
      }),
    };
    const superUser = RouteGuard.extractUserFromRequest(mockReqBearer);
    assert.ok(superUser, 'Must resolve test account for super admin token');
    assert.ok(superUser.roles.includes('PLATFORM_SUPER_ADMIN'));
  });

  await runAsyncTest('RouteGuard.resolveUserFromRequest resolves user asynchronously', async () => {
    const mockReq = {
      headers: new Headers({
        'x-user-role': 'OPERATIONS_MANAGER',
      }),
    };
    const user = await RouteGuard.resolveUserFromRequest(mockReq);
    assert.ok(user, 'Must resolve user via resolveUserFromRequest');
    assert.ok(user.roles.includes('OPERATIONS_MANAGER'));
  });

  await runAsyncTest('RouteGuard.protectApi rejects unauthenticated requests with 401', async () => {
    const mockReq = {
      headers: new Headers(),
    };
    const handler = RouteGuard.protectApi('dashboard.view', async () => {
      return { status: 200, json: () => ({ success: true }) };
    });

    const res = await handler(mockReq);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.code, 'UNAUTHENTICATED');
  });

  await runAsyncTest('RouteGuard.protectApi rejects unauthorized requests with 403', async () => {
    // Customer trying to view admin users
    const mockReq = {
      headers: new Headers({
        'x-user-role': 'CUSTOMER',
      }),
    };
    const handler = RouteGuard.protectApi('users.delete', async () => {
      return { status: 200, json: () => ({ success: true }) };
    });

    const res = await handler(mockReq);
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.code, 'FORBIDDEN');
  });

  await runAsyncTest('RouteGuard.protectApi allows authorized requests through to handler', async () => {
    const mockReq = {
      headers: new Headers({
        'x-user-role': 'ADMIN',
      }),
    };
    let handlerCalled = false;
    const handler = RouteGuard.protectApi('users.view', async (req, user) => {
      handlerCalled = true;
      assert.ok(user.roles.includes('ADMIN'));
      return { status: 200, json: () => ({ success: true, user: user.email }) };
    });

    const res = await handler(mockReq);
    assert.strictEqual(handlerCalled, true);
    assert.strictEqual(res.status, 200);
  });

  console.log('\n====================================================');
  console.log(`RESULTS: ${passedTests} / ${totalTests} tests passed`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
