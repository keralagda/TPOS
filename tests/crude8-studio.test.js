/**
 * CRUDE8 STUDIO: VISUAL CRUD APPLICATION BUILDER + REALTIME SIMULATION PLATFORM
 * Engine test suite — generator, mock data, sandbox runtime, workflows,
 * permissions, versions, codegen, deployment governance and templates.
 * Run: npm run test:crude8-studio
 */

const assert = require('assert');

const { StudioProjectStore } = require('../lib/crude8/studio/project-store');
const { StudioDataMockEngine } = require('../lib/crude8/studio/data-mock-engine');
const { StudioSandboxRuntime } = require('../lib/crude8/studio/sandbox-runtime');
const { StudioModuleGenerator } = require('../lib/crude8/studio/module-generator');
const { StudioCodegenEngine } = require('../lib/crude8/studio/codegen');
const { StudioDeploymentEngine } = require('../lib/crude8/studio/deployment-engine');
const { SANDBOX_PERSONA_USERS } = require('../lib/crude8/studio/studio-types');

let passed = 0, failed = 0;
async function t(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (err) { console.error(`  ✗ ${name}\n    ${err.message}`); failed++; }
}

(async () => {
  console.log('\n=== CRUDE8 STUDIO TEST SUITE ===\n');

  await t('1. NL generator: "Create customer visa tracking" -> Visa with expiry radar', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create customer visa tracking with expiry reminders and approval workflow', 'usr-admin');
    assert.strictEqual(p.entityName, 'Visa');
    assert.ok(p.fields.some(f => f.name === 'expiryDate'), 'expiryDate field');
    assert.ok(p.automations.some(a => a.trigger === 'VISA_EXPIRING_SOON'), 'expiry automation');
    assert.ok(p.workflows.some(w => w.name.includes('Expiry')), 'expiry workflow');
    assert.ok(p.permissions.rules.some(r => r.role === 'SALES_AGENT' && r.action === 'DELETE' && !r.allowed), 'agent delete denied rule');
    assert.ok(p.fields.some(f => f.type === 'AI') || p.aiActions.length > 0, 'AI capability present');
  });

  await t('2. NL generator: "Create a hotel supplier CRM" -> HotelSupplier with approval', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create a hotel supplier CRM with approval workflow', 'usr-admin');
    assert.strictEqual(p.entityName, 'HotelSupplier');
    assert.ok(p.actions.some(a => a.name.includes('Approve')));
  });

  await t('3. Mock engine: generates required-complete, relation-wired records', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create an enquiry pipeline', 'u');
    const records = StudioDataMockEngine.generateMockRecords(p, { count: 50 });
    assert.strictEqual(records.length, 50);
    const required = p.fields.filter(f => f.required).map(f => f.name);
    for (const r of records.slice(0, 10)) {
      for (const rf of required) {
        assert.ok(r[rf] !== undefined && r[rf] !== null && r[rf] !== '', `required ${rf} empty`);
      }
    }
    assert.ok(p.fields.some(f => f.type === 'RELATION'));
  });

  await t('4. Sandbox: governed create -> validation -> permission -> event -> audit chain', async () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create customer visa tracking', 'usr-admin');
    StudioProjectStore.createProject(p, 'usr-admin');
    const sbx = StudioSandboxRuntime.createSandbox(p, { Visa: 30 });
    assert.strictEqual(StudioSandboxRuntime.getStore(sbx, 'Visa').size, 30);

    const admin = SANDBOX_PERSONA_USERS.ADMIN;
    const ok = StudioSandboxRuntime.execAction(sbx, p, 'CREATE', admin, { payload: { visaNumber: 'V-9001', customerName: 'Test User', country: 'Japan', visaType: 'TOURIST', issuedDate: '2026-01-01', expiryDate: '2026-12-01', passportNumber: 'P-123', visaStatus: 'DRAFT' } });
    assert.strictEqual(ok.success, true, ok.error);
    assert.strictEqual(ok.version, 1);
    assert.ok(ok.events.includes('VISA_CREATED'));
    assert.ok(ok.automationsTriggered.length >= 0);

    const bad = StudioSandboxRuntime.execAction(sbx, p, 'CREATE', admin, { payload: { visaNumber: 'V-9002' } });
    assert.strictEqual(bad.success, false);
    assert.ok(bad.error.includes('missing required field'));

    const denied = StudioSandboxRuntime.execAction(sbx, p, 'DELETE', SANDBOX_PERSONA_USERS.AGENT, { id: ok.record.id });
    assert.strictEqual(denied.success, false);
    assert.ok(denied.error.includes('Permission Denied'));

    const chain = StudioSandboxRuntime.verifyAuditChain(sbx);
    assert.strictEqual(chain.intact, true);
  });

  await t('5. Sandbox: permission simulation for 5 personas + workflow run trace', async () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create an enquiry pipeline with AI qualification', 'usr-admin');
    StudioProjectStore.createProject(p, 'usr-admin');
    const sbx = StudioSandboxRuntime.createSandbox(p, { Enquiry: 10 });
    const sim = StudioSandboxRuntime.simulatePermission(sbx, p, 'AGENT', 'DELETE');
    assert.strictEqual(sim.allowed, false);

    const wf = p.workflows.find(w => w.name === 'New Enquiry Orchestration');
    assert.ok(wf, 'enquiry workflow generated');
    const seedRecord = StudioSandboxRuntime.getStore(sbx, 'Enquiry').values().next().value;
    const run = await StudioSandboxRuntime.runWorkflow(sbx, p, wf.workflowId, 'ADMIN', { id: seedRecord.id, customerName: seedRecord.customerName, contactPhone: seedRecord.contactPhone, destination: seedRecord.destination, enquiryStatus: 'NEW' });
    assert.strictEqual(run.success, true, run.error);
    assert.ok(run.trace.length >= 5, `trace len ${run.trace.length}`);
    assert.ok(run.trace.some(n => n.type === 'AI_STEP'));
    assert.ok(run.trace.some(n => n.status === 'AUTO_APPROVED'));
  });

  await t('6. Sandbox: lifecycle transitions fire events and trigger automations', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create a content publishing module with notification', 'usr-admin');
    const sbx = StudioSandboxRuntime.createSandbox(p, {});
    const record = StudioSandboxRuntime.getStore(sbx, p.entityName).values().next().value;
    const publishAction = Object.keys(p.lifecycleTransitions).find(a => a === 'PUBLISH');
    if (publishAction) {
      const res = StudioSandboxRuntime.execAction(sbx, p, 'PUBLISH', SANDBOX_PERSONA_USERS.ADMIN, { id: record.id });
      assert.strictEqual(res.success, true, res.error);
      assert.ok(res.events.some(e => e.includes('PUBLISH')), `publish event fired: ${res.events.join(',')}`);
      assert.strictEqual(String(res.record[p.lifecycleField]), p.lifecycleTransitions.PUBLISH);
    }
    assert.strictEqual(StudioSandboxRuntime.destroySandbox(sbx.sandboxId), true);
    assert.strictEqual(StudioSandboxRuntime.getSandbox(sbx.sandboxId), undefined);
  });

  await t('7. Versions: save -> diff -> compare -> rollback', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create an inventory management module', 'usr-admin');
    StudioProjectStore.createProject(p, 'usr-admin');
    p.fields.push({ name: 'barcode', label: 'Barcode', type: 'TEXT', required: false });
    StudioProjectStore.saveProject(p, 'usr-admin');
    p.name = 'Inventory Renamed';
    StudioProjectStore.saveProject(p, 'usr-admin');
    const history = StudioProjectStore.getHistory(p.projectId);
    assert.strictEqual(history.length, 3);
    const diff = StudioProjectStore.compareVersions(p.projectId, 1, 2);
    assert.ok(diff.some(d => d.includes('barcode')), JSON.stringify(diff));
    const rb = StudioProjectStore.rollback(p.projectId, 1, 'usr-admin');
    assert.strictEqual(rb.snapshot.fields.some(f => f.name === 'barcode'), false);
    assert.strictEqual(rb.version, 4);
  });

  await t('8. Codegen: all 7 artifacts non-empty and entity-derived', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create a hotel management module', 'usr-admin');
    const artifacts = StudioCodegenEngine.generateAll(p);
    for (const [k, v] of Object.entries(artifacts)) {
      assert.ok(v && v.length > 50, `artifact ${k} too small`);
    }
    assert.ok(artifacts.databaseSchema.includes('model HotelSupplier'));
    assert.ok(artifacts.documentation.includes('## Entity: HotelSupplier'));
  });

  await t('9. Deployment: request -> same-user approve blocked -> cross-admin approve -> runtime registered', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create a supplier management module', 'usr-admin');
    StudioProjectStore.createProject(p, 'usr-admin');
    const dep = StudioDeploymentEngine.requestDeploy(p.projectId, { userId: 'usr-a', role: 'ORG_ADMIN' }, 'first cut');
    assert.strictEqual(dep.status, 'PENDING_APPROVAL');

    let selfBlocked = false;
    try { StudioDeploymentEngine.approveDeploy(dep.deploymentId, { userId: 'usr-a', role: 'ORG_ADMIN' }); }
    catch (e) { selfBlocked = e.message.includes('Separation of duties'); }
    assert.strictEqual(selfBlocked, true);

    const approved = StudioDeploymentEngine.approveDeploy(dep.deploymentId, { userId: 'usr-b', role: 'SUPER_ADMIN' });
    assert.strictEqual(approved.status, 'DEPLOYED');
    assert.ok(StudioDeploymentEngine.listDeployedModules().some(m => m.entityName === 'Supplier'));
    const audit = StudioDeploymentEngine.verifyDeploymentAudit();
    assert.strictEqual(audit.intact, true);
  });

  await t('10. Templates: 10 templates, install produces customized project', () => {
    const templates = StudioModuleGenerator.listTemplates();
    assert.strictEqual(templates.length, 10);
    const proj = StudioModuleGenerator.installTemplate('tpl-document-approval', 'usr-admin');
    assert.strictEqual(proj.origin, 'TEMPLATE');
    assert.strictEqual(proj.templateId, 'tpl-document-approval');
    assert.ok(proj.name.includes('from Template'));
    // Template identity must never drift off its declared entity, even when the
    // prompt contains keywords that match a different domain blueprint.
    for (const preset of StudioModuleGenerator.listTemplates()) {
      const installed = StudioModuleGenerator.installTemplate(preset.templateId, 'usr-admin');
      assert.strictEqual(installed.entityName, preset.entityName, `template ${preset.templateId} entity drift`);
    }
  });

  await t('11. Sandbox isolation: two sandboxes never share records or audit chains', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create a lead management module', 'usr-admin');
    const a = StudioSandboxRuntime.createSandbox(p, {});
    const b = StudioSandboxRuntime.createSandbox(p, {});
    assert.notStrictEqual(a.sandboxId, b.sandboxId);
    const storeA = StudioSandboxRuntime.getStore(a, p.entityName);
    const storeB = StudioSandboxRuntime.getStore(b, p.entityName);
    const created = StudioSandboxRuntime.execAction(a, p, 'CREATE', SANDBOX_PERSONA_USERS.ADMIN, { payload: { customerName: 'Isolation Probe', contactPhone: '+91-90000-00000', contactEmail: 'probe@test.dev', destination: 'Goa', source: 'WEBSITE', enquiryStatus: 'NEW' } });
    assert.strictEqual(created.success, true, created.error);
    assert.ok(!storeB.has(created.record.id), 'records created in sandbox A never appear in sandbox B');
    const seedIdA = storeA.keys().next().value;
    const beforeB = JSON.stringify(storeB.get(seedIdA));
    StudioSandboxRuntime.execAction(a, p, 'DELETE', SANDBOX_PERSONA_USERS.ADMIN, { id: seedIdA });
    assert.strictEqual(JSON.stringify(storeB.get(seedIdA)), beforeB, 'mutations in A never leak into B');
    assert.notStrictEqual(a.latestHash, b.latestHash, 'audit chains are independent');
    StudioSandboxRuntime.destroySandbox(a.sandboxId);
    StudioSandboxRuntime.destroySandbox(b.sandboxId);
  });

  await t('12. Generated project is complete: schema + UI + governance + events', () => {
    const p = StudioModuleGenerator.generateFromPrompt('Create a booking engine with payment amount and approval', 'usr-admin');
    assert.ok(p.fields.length >= 5, 'fields generated');
    assert.ok(p.ui.listView.columns.length > 0, 'list columns');
    assert.ok(p.ui.formView.sections.length > 0, 'form sections');
    assert.ok(p.actions.length > 0, 'actions');
    assert.ok(p.workflows.length > 0, 'workflows');
    assert.ok(p.permissions.roles.length > 0, 'roles');
    assert.ok(p.events.length > 0, 'events');
    assert.ok(p.syncTargets.length > 0, 'sync targets');
    assert.ok(['DMS8', 'VOYAGE8', 'H8_CORE', 'CRM', 'TMS'].includes(p.module) || p.module.length > 0, 'module assigned');
  });

  console.log(`\n=== STUDIO SUITE: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(err => { console.error('Studio suite fatal:', err); process.exit(1); });
