/**
 * Travel Planet (Voyage8) — Multi-Tenant Isolation & Boundary Security Test Suite
 * 
 * Verifies strict tenant, workspace, vendor, and user boundary isolation:
 * 1. Org A vs Org B (HQ vs B2B Partner)
 * 2. Vendor A vs Vendor B (Airline vs Hotel Supplier)
 * 3. Travel Agent A vs Travel Agent B (Lead assignment isolation)
 * 4. Customer A vs Customer B (Booking & PII isolation)
 * 5. Cross-tenant injection & scope bypass attempts
 */

const assert = require('assert');

// Scope evaluation logic
const SCOPE_RANK = {
  GLOBAL: 100,
  ORGANIZATION: 80,
  WORKSPACE: 60,
  TEAM: 50,
  ASSIGNED: 40,
  OWN_CUSTOMERS: 35,
  OWN_VENDOR: 30,
  OWN_RECORDS: 20,
  READ_ONLY: 10,
  NONE: 0,
};

function canAccessWithScope(userScope, userContext, targetResource) {
  if (!targetResource) return true;
  if (userScope === 'NONE') return false;
  if (userScope === 'GLOBAL') return true;

  const currentUserId = userContext.userId || userContext.id;

  // 1. Organization boundary
  if (targetResource.organizationId && targetResource.organizationId !== userContext.organizationId) {
    return false; // Cross-organization boundary violation
  }

  if (userScope === 'ORGANIZATION') {
    return !targetResource.organizationId || targetResource.organizationId === userContext.organizationId;
  }

  // 2. Workspace boundary
  if (targetResource.workspaceId && targetResource.workspaceId !== userContext.workspaceId) {
    return false; // Cross-workspace boundary violation
  }

  if (userScope === 'WORKSPACE') {
    return !targetResource.workspaceId || targetResource.workspaceId === userContext.workspaceId;
  }

  // 3. Team boundary
  if (userScope === 'TEAM') {
    if (!targetResource.teamId) return true;
    return (userContext.teamIds || []).includes(targetResource.teamId);
  }

  // 4. Assigned boundary (Lead or Booking assigned to agent)
  if (userScope === 'ASSIGNED') {
    return Boolean(
      (targetResource.assignedUserId && targetResource.assignedUserId === currentUserId) ||
      (targetResource.assignedAgentId && targetResource.assignedAgentId === currentUserId) ||
      (targetResource.ownerUserId && targetResource.ownerUserId === currentUserId)
    );
  }

  // 5. Vendor boundary (Supplier data isolation)
  if (userScope === 'OWN_VENDOR') {
    if (!targetResource.vendorId || !userContext.vendorId) return false;
    return targetResource.vendorId === userContext.vendorId;
  }

  // 6. Own Records boundary (Traveler private bookings/profile)
  if (userScope === 'OWN_RECORDS') {
    return targetResource.ownerUserId === currentUserId;
  }

  // 7. Read only scope (within org or workspace)
  if (userScope === 'READ_ONLY') {
    if (targetResource.organizationId && targetResource.organizationId !== userContext.organizationId) return false;
    if (targetResource.workspaceId && userContext.workspaceId && targetResource.workspaceId !== userContext.workspaceId) return false;
    return true;
  }

  return false;
}

// Test Fixtures
const TENANTS = {
  HQ: { id: 'org_tp_hq', workspaceId: 'ws_hq_main' },
  PARTNER_APEX: { id: 'org_apex_voyages', workspaceId: 'ws_apex_main' },
};

const VENDORS = {
  EMIRATES: 'vnd_emirates_skywards',
  TAJ_HOTELS: 'vnd_taj_hospitality',
};

const USERS = {
  superAdmin: {
    id: 'usr_super_admin',
    userId: 'usr_super_admin',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    scope: 'GLOBAL',
  },
  hqAdmin: {
    id: 'usr_hq_admin',
    userId: 'usr_hq_admin',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    scope: 'ORGANIZATION',
  },
  partnerAdmin: {
    id: 'usr_partner_apex',
    userId: 'usr_partner_apex',
    organizationId: TENANTS.PARTNER_APEX.id,
    workspaceId: TENANTS.PARTNER_APEX.workspaceId,
    scope: 'WORKSPACE',
  },
  emiratesVendorAdmin: {
    id: 'usr_emirates_admin',
    userId: 'usr_emirates_admin',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    vendorId: VENDORS.EMIRATES,
    scope: 'OWN_VENDOR',
  },
  tajVendorAdmin: {
    id: 'usr_taj_admin',
    userId: 'usr_taj_admin',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    vendorId: VENDORS.TAJ_HOTELS,
    scope: 'OWN_VENDOR',
  },
  agentSarah: {
    id: 'usr_agent_sarah',
    userId: 'usr_agent_sarah',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    scope: 'ASSIGNED',
  },
  agentDavid: {
    id: 'usr_agent_david',
    userId: 'usr_agent_david',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    scope: 'ASSIGNED',
  },
  customerPriya: {
    id: 'usr_cust_priya',
    userId: 'usr_cust_priya',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    scope: 'OWN_RECORDS',
  },
  customerRohan: {
    id: 'usr_cust_rohan',
    userId: 'usr_cust_rohan',
    organizationId: TENANTS.HQ.id,
    workspaceId: TENANTS.HQ.workspaceId,
    scope: 'OWN_RECORDS',
  },
};

// Test Runner
let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('\n================================================================');
console.log('   🏢 TRAVEL PLANET (VOYAGE8) — MULTI-TENANT ISOLATION TEST');
console.log('================================================================\n');

// 1. Organization Boundary Isolation
console.log('--- 1. Organization Boundaries (HQ vs B2B Partner) ---');
runTest('HQ Admin can access HQ booking but CANNOT access Partner Apex booking', () => {
  const hqBooking = { id: 'bk_1', organizationId: TENANTS.HQ.id, workspaceId: TENANTS.HQ.workspaceId };
  const partnerBooking = { id: 'bk_2', organizationId: TENANTS.PARTNER_APEX.id, workspaceId: TENANTS.PARTNER_APEX.workspaceId };

  assert.strictEqual(canAccessWithScope(USERS.hqAdmin.scope, USERS.hqAdmin, hqBooking), true);
  assert.strictEqual(canAccessWithScope(USERS.hqAdmin.scope, USERS.hqAdmin, partnerBooking), false);
});

runTest('Partner Apex Admin CANNOT access HQ records or ledgers', () => {
  const hqLedger = { id: 'led_1', organizationId: TENANTS.HQ.id, workspaceId: TENANTS.HQ.workspaceId };
  assert.strictEqual(canAccessWithScope(USERS.partnerAdmin.scope, USERS.partnerAdmin, hqLedger), false);
});

runTest('Platform Super Admin can access all organizations (GLOBAL scope)', () => {
  const hqBooking = { id: 'bk_1', organizationId: TENANTS.HQ.id };
  const partnerBooking = { id: 'bk_2', organizationId: TENANTS.PARTNER_APEX.id };
  assert.strictEqual(canAccessWithScope(USERS.superAdmin.scope, USERS.superAdmin, hqBooking), true);
  assert.strictEqual(canAccessWithScope(USERS.superAdmin.scope, USERS.superAdmin, partnerBooking), true);
});

// 2. Vendor Isolation
console.log('\n--- 2. Supplier & Vendor Isolation ---');
runTest('Emirates Vendor Admin can access Emirates inventory but CANNOT access Taj Hotels inventory', () => {
  const emiratesFlightFare = { id: 'inv_ek202', vendorId: VENDORS.EMIRATES, organizationId: TENANTS.HQ.id };
  const tajRoomRate = { id: 'inv_taj_suite', vendorId: VENDORS.TAJ_HOTELS, organizationId: TENANTS.HQ.id };

  assert.strictEqual(canAccessWithScope(USERS.emiratesVendorAdmin.scope, USERS.emiratesVendorAdmin, emiratesFlightFare), true);
  assert.strictEqual(canAccessWithScope(USERS.emiratesVendorAdmin.scope, USERS.emiratesVendorAdmin, tajRoomRate), false);
});

runTest('Taj Hotels Vendor Admin CANNOT access Emirates flight inventory', () => {
  const emiratesFlightFare = { id: 'inv_ek202', vendorId: VENDORS.EMIRATES, organizationId: TENANTS.HQ.id };
  assert.strictEqual(canAccessWithScope(USERS.tajVendorAdmin.scope, USERS.tajVendorAdmin, emiratesFlightFare), false);
});

// 3. Agent Lead Assignment Isolation
console.log('\n--- 3. Travel Agent Lead & Booking Isolation ---');
runTest('Agent Sarah can access leads assigned to her, but CANNOT access leads assigned to Agent David', () => {
  const sarahLead = { id: 'ld_1', assignedUserId: USERS.agentSarah.userId, organizationId: TENANTS.HQ.id, workspaceId: TENANTS.HQ.workspaceId };
  const davidLead = { id: 'ld_2', assignedUserId: USERS.agentDavid.userId, organizationId: TENANTS.HQ.id, workspaceId: TENANTS.HQ.workspaceId };

  assert.strictEqual(canAccessWithScope(USERS.agentSarah.scope, USERS.agentSarah, sarahLead), true);
  assert.strictEqual(canAccessWithScope(USERS.agentSarah.scope, USERS.agentSarah, davidLead), false);
});

// 4. Customer PII & Booking Isolation
console.log('\n--- 4. B2C Customer PII & Booking Isolation ---');
runTest('Customer Priya can view her own booking, but CANNOT view Customer Rohan\'s booking', () => {
  const priyaTrip = { id: 'bk_paris_1', ownerUserId: USERS.customerPriya.userId, organizationId: TENANTS.HQ.id };
  const rohanTrip = { id: 'bk_tokyo_2', ownerUserId: USERS.customerRohan.userId, organizationId: TENANTS.HQ.id };

  assert.strictEqual(canAccessWithScope(USERS.customerPriya.scope, USERS.customerPriya, priyaTrip), true);
  assert.strictEqual(canAccessWithScope(USERS.customerPriya.scope, USERS.customerPriya, rohanTrip), false);
});

// 5. Cross-Tenant Tampering Prevention
console.log('\n--- 5. Malicious Cross-Tenant Payload Tampering ---');
runTest('Cross-tenant injection attempt with spoofed organizationId is firmly denied', () => {
  const spoofedPayload = {
    id: 'bk_hacked',
    organizationId: TENANTS.PARTNER_APEX.id, // Trying to target Apex data from HQ context
    workspaceId: TENANTS.PARTNER_APEX.workspaceId,
  };

  // Agent Sarah in HQ tries to evaluate against spoofed Apex payload
  const accessResult = canAccessWithScope(USERS.agentSarah.scope, USERS.agentSarah, spoofedPayload);
  assert.strictEqual(accessResult, false);
});

console.log('\n================================================================');
console.log(`   Tenant Isolation Results: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
