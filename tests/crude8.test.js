/**
 * CRUDE8: UNIVERSAL REAL-TIME CRUD ENGINE TEST SUITE
 * Tests declarative registry, permission resolver, optimistic concurrency,
 * cryptographic audit, Sync8 multi-module cascades, and AI assistant safety gates.
 */

const assert = require('assert');

// Types / Modules
const { UniversalEntityRegistry } = require('../lib/crude8/entity-registry');
const { CRUDE8Engine } = require('../lib/crude8/crud-engine');
const { CRUDE8PermissionResolver } = require('../lib/crude8/permission-resolver');
const { CRUDE8VersionEngine } = require('../lib/crude8/version-engine');
const { CRUDE8AuditEngine } = require('../lib/crude8/audit-engine');
const { Sync8Engine } = require('../lib/crude8/sync-engine');
const { CRUDE8AIAssistant } = require('../lib/crude8/ai-crud-assistant');
const { CRUDCapabilityMatrix, CRUD_CAPABILITY_MATRIX } = require('../lib/crude8/capability-matrix');
const { UNIVERSAL_ACTION_TYPES } = require('../lib/crude8/types');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

async function runAll() {
  console.log('\n==================================================');
  console.log(' CRUDE8: UNIVERSAL REAL-TIME CRUD ENGINE TEST SUITE');
  console.log('==================================================\n');

  // Test 1: Registry Declaration
  runTest('UniversalEntityRegistry declares all 13 canonical entities with complete schemas', () => {
    const canonicalEntities = [
      'Customer', 'Journey', 'Booking', 'Document', 'Invoice',
      'Supplier', 'Destination', 'Experience', 'Content',
      'Campaign', 'User', 'Tenant', 'FeatureFlag'
    ];
    for (const ent of canonicalEntities) {
      const schema = UniversalEntityRegistry.getSchema(ent);
      assert.ok(schema, `Missing entity schema for ${ent}`);
      assert.strictEqual(schema.entityName, ent);
      assert.ok(schema.fields.length > 0, `${ent} has no fields defined`);
      assert.ok(schema.permissions, `${ent} has no permissions defined`);
      assert.ok(schema.events, `${ent} has no events defined`);
      assert.ok(schema.events.syncTargets.length > 0, `${ent} has no syncTargets`);
    }
  });

  // Test 2: Create Record Pipeline
  await runAsyncTest('CRUDE8Engine.create executes governed creation pipeline with v1 and audit', async () => {
    const user = { userId: 'usr-agent-01', role: 'SALES_AGENT', tenantId: 'tenant-delhi' };
    const payload = {
      id: 'cust-test-999',
      name: 'Rohan Mehra',
      email: 'rohan.mehra@example.com',
      phone: '+91 99887 66554',
      loyaltyTier: 'SILVER',
      status: 'ACTIVE'
    };

    const res = await CRUDE8Engine.create('Customer', payload, user);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.id, 'cust-test-999');
    assert.strictEqual(res.version, 1);
    assert.ok(res.auditId, 'Audit ID should be returned');
    assert.strictEqual(res.syncStatus, 'SYNCED');
  });

  // Test 3: Validation Gate on Required Fields
  await runAsyncTest('CRUDE8Engine.create enforces schema required field validation', async () => {
    const user = { userId: 'usr-agent-01', role: 'SALES_AGENT', tenantId: 'tenant-delhi' };
    const invalidPayload = {
      id: 'cust-invalid',
      name: 'Incomplete User'
      // missing required 'email'
    };

    let caught = false;
    try {
      await CRUDE8Engine.create('Customer', invalidPayload, user);
    } catch (err) {
      caught = true;
      assert.ok(err.message.includes('Missing required field \'email\''));
    }
    assert.strictEqual(caught, true, 'Should have thrown validation error for missing email');
  });

  // Test 4: Tenant Isolation on Read
  await runAsyncTest('CRUDE8Engine.read enforces strict multi-tenant boundary for non-SuperAdmin', async () => {
    const tenantAUser = { userId: 'usr-a', role: 'SALES_AGENT', tenantId: 'tenant-voyage-india' };
    const tenantBUser = { userId: 'usr-b', role: 'SALES_AGENT', tenantId: 'tenant-different' };

    const resA = await CRUDE8Engine.read('Customer', {}, tenantAUser);
    const hasTenantBRecords = resA.data.some(r => r.tenantId === 'tenant-different');
    assert.strictEqual(hasTenantBRecords, false, 'Tenant A should not see Tenant B records');

    const resB = await CRUDE8Engine.read('Customer', {}, tenantBUser);
    const hasTenantARecords = resB.data.some(r => r.tenantId === 'tenant-voyage-india');
    assert.strictEqual(hasTenantARecords, false, 'Tenant B should not see Tenant A records');
  });

  // Test 5: Optimistic Concurrency Control & Version Increment
  await runAsyncTest('CRUDE8Engine.update increments version and detects optimistic lock conflicts', async () => {
    const user = { userId: 'usr-agent-01', role: 'SALES_AGENT', tenantId: 'tenant-voyage-india' };
    
    // First update: pass matching expectedVersion: 1
    const update1 = await CRUDE8Engine.update(
      'Customer',
      'cust-101',
      { loyaltyTier: 'PLATINUM' },
      user,
      1
    );
    assert.strictEqual(update1.version, 2);
    assert.strictEqual(update1.data.loyaltyTier, 'PLATINUM');

    // Second update with stale version 1 -> should conflict
    let conflictCaught = false;
    try {
      await CRUDE8Engine.update(
        'Customer',
        'cust-101',
        { phone: '+91 99999 88888' },
        user,
        1 // stale expectedVersion
      );
    } catch (err) {
      conflictCaught = true;
      assert.ok(err.message.includes('Optimistic Concurrency Conflict'));
    }
    assert.strictEqual(conflictCaught, true, 'Stale version must trigger conflict');
  });

  // Test 6: Snapshot Rollback Pipeline
  await runAsyncTest('CRUDE8VersionEngine.rollback restores prior state with forward version increment', async () => {
    const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
    
    // Rollback cust-101 to v1
    const rollbackRes = await CRUDE8Engine.rollback('Customer', 'cust-101', 1, user);
    assert.strictEqual(rollbackRes.success, true);
    assert.strictEqual(rollbackRes.data.loyaltyTier, 'GOLD'); // Reverted from PLATINUM to GOLD
    assert.strictEqual(rollbackRes.version, 3); // Forward increment (was v2, rollback is v3)
  });

  // Test 7: Cryptographic SHA-256 Audit Engine & Sensitive Data Redaction
  runTest('CRUDE8AuditEngine redacts sensitive fields and verifies cryptographic chain integrity', () => {
    const user = { userId: 'usr-agent-01', role: 'SALES_AGENT', tenantId: 'tenant-voyage-india' };
    const sensitiveRecord = {
      id: 'cust-secret',
      name: 'Secret VIP',
      email: 'secret@example.com',
      passportNumber: 'PASS123456',
      loyaltyTier: 'PLATINUM'
    };

    const audit = CRUDE8AuditEngine.log('Customer', 'cust-secret', 'UPDATE', user, sensitiveRecord);
    // Verify redaction based on schema auditPolicy.redactFields: ['passportNumber']
    assert.strictEqual(audit.payloadSnapshot.passportNumber, '[REDACTED_BY_CRUDE8_POLICY]');
    assert.strictEqual(audit.payloadSnapshot.name, 'Secret VIP');

    // Verify cryptographic chain
    const chainCheck = CRUDE8AuditEngine.verifyChainIntegrity();
    assert.strictEqual(chainCheck.intact, true, 'Audit chain integrity must be 100% intact');
  });

  // Test 8: Sync8 Multi-Module Cascading Dispatch
  await runAsyncTest('Sync8Engine propagates Booking confirmation across CRM, TMS, ERP, DMS & Notifications', async () => {
    const event = {
      eventId: 'BOOKING_CONFIRMED',
      entity: 'Booking',
      action: 'CREATE',
      actor: { userId: 'usr-ops', role: 'OPS_EXECUTIVE', tenantId: 'tenant-voyage-india' },
      tenantId: 'tenant-voyage-india',
      timestamp: new Date().toISOString(),
      payload: { id: 'bk-sync-99', bookingNumber: 'TP-2026-999', totalAmount: 120000 },
      version: 1
    };

    const syncLogs = await Sync8Engine.processEventCascade(event);
    assert.ok(syncLogs.length >= 4, 'Must cascade to multiple target modules');
    const modules = syncLogs.map(l => l.targetModule);
    assert.ok(modules.includes('CRM'), 'Must sync to CRM');
    assert.ok(modules.includes('TMS'), 'Must sync to TMS');
    assert.ok(modules.includes('ERP'), 'Must sync to ERP');
    assert.ok(modules.includes('DMS'), 'Must sync to DMS');
    assert.ok(modules.includes('NOTIFICATIONS'), 'Must sync to NOTIFICATIONS');
  });

  // Test 9: RBAC Permission Gate Enforcement
  runTest('CRUDE8PermissionResolver blocks unauthorized roles from consequential mutations', () => {
    const guestUser = { userId: 'usr-guest', role: 'GUEST', tenantId: 'tenant-public' };
    
    // Guest attempting DELETE on Customer
    const deleteCheck = CRUDE8PermissionResolver.evaluate('Customer', 'DELETE', guestUser);
    assert.strictEqual(deleteCheck.allowed, false);
    assert.ok(deleteCheck.reason.includes('lacks permission'));

    // Super Admin should be universally allowed
    const superAdmin = { userId: 'usr-root', role: 'SUPER_ADMIN', tenantId: 'tenant-root' };
    const superCheck = CRUDE8PermissionResolver.evaluate('Customer', 'DELETE', superAdmin);
    assert.strictEqual(superCheck.allowed, true);
  });

  // Test 10: AI Natural Language CRUD Assistant & Safety Verification Gates
  runTest('CRUDE8AIAssistant parses intent and attaches safety gates on destructive/bulk operations', () => {
    const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
    
    // Command 1: Safe Create
    const createProp = CRUDE8AIAssistant.interpretCommand('Create VIP customer named Vikram Seth with gold tier', user);
    assert.strictEqual(createProp.action, 'CREATE');
    assert.strictEqual(createProp.entity, 'Customer');
    assert.strictEqual(createProp.suggestedPayload.name, 'Vikram Seth');
    assert.strictEqual(createProp.suggestedPayload.loyaltyTier, 'GOLD');

    // Command 2: Destructive Delete -> Safety Gate Required
    const deleteProp = CRUDE8AIAssistant.interpretCommand('Delete customer cust-101 permanently', user);
    assert.strictEqual(deleteProp.action, 'DELETE');
    assert.strictEqual(deleteProp.impactLevel, 'CRITICAL');
    assert.strictEqual(deleteProp.requiresConfirmation, true);
    assert.ok(deleteProp.safetyWarning.includes('Destructive DELETE'));
  });

  // ============ CRUD GOVERNANCE LAYER: CAPABILITY MATRIX TESTS ============

  // Test 11: Matrix Validation & Coverage Totals
  runTest('CRUD Capability Matrix governs all 31 entities across 14 modules and passes validation', () => {
    const validation = CRUDCapabilityMatrix.validate();
    assert.strictEqual(validation.valid, true, `Matrix validation failed: ${(validation.violations || []).join('; ')}`);

    const stats = CRUDCapabilityMatrix.getMatrixStats();
    assert.strictEqual(stats.totalEntities, 31, 'Matrix must govern every registered entity');
    assert.strictEqual(stats.totalModules, 14);
    assert.ok(stats.totalPages >= 31, 'Every entity must bind at least one page route');
  });

  // Test 12: Universal Action Taxonomy Coverage
  runTest('All 23 universal action types are declared by at least one governed entity', () => {
    assert.strictEqual(UNIVERSAL_ACTION_TYPES.length, 23);
    const entities = UniversalEntityRegistry.listEntities();
    for (const action of UNIVERSAL_ACTION_TYPES) {
      const covering = entities.filter(e => CRUDCapabilityMatrix.supports(e.entityName, action));
      assert.ok(covering.length > 0, `No entity declares universal action '${action}'`);
    }
  });

  // Test 13: Per-Entity Completeness (pages, sync rules, lifecycle, RBAC map)
  runTest('Every capability declares pages, sync rules, lifecycle field and complete RBAC action map', () => {
    for (const [entityName, cap] of Object.entries(CRUD_CAPABILITY_MATRIX)) {
      assert.ok(cap.pages.length > 0, `${entityName} has no page bindings`);
      assert.ok(cap.syncRules.length > 0, `${entityName} has no sync rules`);
      assert.ok(!!cap.lifecycleField, `${entityName} has no lifecycle field`);

      const declared = [...cap.crudActions, ...cap.bulkActions, ...cap.workflowActions];
      for (const action of declared) {
        const roles = cap.actionPermissions[action];
        assert.ok(Array.isArray(roles) && roles.length > 0, `${entityName} action '${action}' lacks role mapping`);
      }
    }
  });

  // Test 14: Matrix-Driven PUBLISH through Governed Pipeline
  await runAsyncTest('execute() routes PUBLISH through governed pipeline with semantic event and version bump', async () => {
    const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
    const res = await CRUDE8Engine.execute('Journey', 'PUBLISH', user, { id: 'jrn-201' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.metadata.universalAction, 'PUBLISH');
    assert.strictEqual(res.data.status, 'PUBLISHED');
    assert.ok(res.events.includes('JOURNEY_PUBLISHED'), 'Semantic action event must be emitted');
    assert.ok(res.version >= 2, 'Governed lifecycle change must increment version');
    assert.ok(res.auditId, 'Lifecycle change must be audited');
  });

  // Test 15: CLONE produces governed duplicate with unique id + suffixed unique fields
  await runAsyncTest('execute() CLONE creates governed duplicate with namespaced id and unique-suffixed fields', async () => {
    const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };
    const res = await CRUDE8Engine.execute('Journey', 'CLONE', user, { id: 'jrn-201' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.metadata.universalAction, 'CLONE');
    assert.notStrictEqual(res.data.id, 'jrn-201', 'Clone must not reuse source id');
    assert.ok(res.data.id.startsWith('journey-'), 'Clone id must be namespaced by entity');
    assert.ok(res.data.slug !== undefined && res.data.slug.includes('copy-'), 'Unique slug must be suffixed on clone');
    assert.strictEqual(res.version, 1, 'Clone is a fresh record at v1');
  });

  // Test 16: Matrix Permission Gate on Universal Actions
  await runAsyncTest('execute() denies unauthorized roles for workflow actions', async () => {
    const agent = { userId: 'usr-agent-01', role: 'SALES_AGENT', tenantId: 'tenant-voyage-india' };
    let denied = false;
    try {
      await CRUDE8Engine.execute('Journey', 'PUBLISH', agent, { id: 'jrn-201' });
    } catch (err) {
      denied = true;
      assert.ok(err.message.includes('Permission Denied'), `Expected permission denial, got: ${err.message}`);
      assert.ok(err.message.includes('PUBLISH'));
    }
    assert.strictEqual(denied, true, 'SALES_AGENT must not be able to PUBLISH journeys');
  });

  // Test 17: Automation Registry Gate
  await runAsyncTest('execute() AUTOMATE rejects unregistered automation ids and stamps valid runs', async () => {
    const user = { userId: 'usr-admin', role: 'SUPER_ADMIN', tenantId: 'tenant-voyage-india' };

    let rejected = false;
    try {
      await CRUDE8Engine.execute('Journey', 'AUTOMATE', user, { id: 'jrn-201', payload: { automationId: 'jrn-does-not-exist' } });
    } catch (err) {
      rejected = true;
      assert.ok(err.message.includes('not registered'), `Expected automation rejection, got: ${err.message}`);
    }
    assert.strictEqual(rejected, true, 'Unknown automation id must be rejected');

    const valid = await CRUDE8Engine.execute('Journey', 'AUTOMATE', user, { id: 'jrn-201', payload: { automationId: 'jrn-auto-seo-refresh' } });
    assert.strictEqual(valid.success, true);
    assert.strictEqual(valid.data.record.lastAutomationId, 'jrn-auto-seo-refresh');
    assert.ok(valid.data.record.lastAutomationRunAt, 'Automation run must be timestamped');
  });

  console.log('\n==================================================');
  console.log(` Results: ${passedTests} passed, ${failedTests} failed`);
  console.log('==================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
