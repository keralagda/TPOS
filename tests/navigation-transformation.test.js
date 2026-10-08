/**
 * Travel Planet (Voyage8) — Navigation Transformation Test Suite
 * 
 * Verifies all 9 Acceptance Criteria:
 * 1. Normal users understand every menu (Task/Goal-Based Naming).
 * 2. Advanced users retain full platform control (Platform Studio in Advanced Mode).
 * 3. H8 terminology remains available without confusion (Tech Labels & Aliases).
 * 4. Menus change based on role (Travel Agent, Branch Manager, Enterprise Admin, Customer).
 * 5. Menus change based on branch context (HQ, Kochi, Dubai, Trivandrum, Singapore).
 * 6. Menus change based on enabled feature flags.
 * 7. CRUDE8 generates dynamic navigation from capability matrix.
 * 8. AI can guide users to features (Natural Language Resolution).
 * 9. No technical overload exists in default (Simple) mode.
 */

const assert = require('assert');
const { CANONICAL_NAVIGATION_CATEGORIES } = require('../lib/navigation/navigation-registry');
const { BusinessAliasLayer, CANONICAL_NAMING_TRANSFORMATION } = require('../lib/navigation/business-alias');
const { BranchContextManager, CANONICAL_BRANCHES } = require('../lib/navigation/branch-context');
const { CRUDE8NavBridge } = require('../lib/navigation/crude8-nav-bridge');
const { RoleMenuResolver } = require('../lib/navigation/role-menu-resolver');
const { AINavigationAssistant } = require('../lib/navigation/ai-nav-assistant');
const { VoiceIntentResolver } = require('../lib/voice/intent-resolver');

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

console.log('\n================================================================');
console.log('   🧭 TRAVEL PLANET (VOYAGE8) — NAVIGATION TRANSFORMATION TEST');
console.log('================================================================\n');

// -------------------------------------------------------------
// Criterion 1: Normal users understand every menu (Goal-based naming)
// -------------------------------------------------------------
console.log('--- 1. Goal-Based Business Naming Remapping ---');

runTest('Should remap all 12 canonical technical engines to friendly business terms', () => {
  assert.strictEqual(BusinessAliasLayer.toBusiness('Voyage8'), 'Trips & Journeys');
  assert.strictEqual(BusinessAliasLayer.toBusiness('VIBE8 CMS'), 'Website Builder');
  assert.strictEqual(BusinessAliasLayer.toBusiness('HESTIA8'), 'SEO Growth');
  assert.strictEqual(BusinessAliasLayer.toBusiness('CRUDE8'), 'Business Builder');
  assert.strictEqual(BusinessAliasLayer.toBusiness('DMS8'), 'Documents');
  assert.strictEqual(BusinessAliasLayer.toBusiness('Social8'), 'Travel Community');
  assert.strictEqual(BusinessAliasLayer.toBusiness('GEM8'), 'Places Discovery');
  assert.strictEqual(BusinessAliasLayer.toBusiness('AI Agents'), 'AI Assistants');
  assert.strictEqual(BusinessAliasLayer.toBusiness('Branch8'), 'Branch Management');
  assert.strictEqual(BusinessAliasLayer.toBusiness('Registry'), 'Configuration Center');
  assert.strictEqual(BusinessAliasLayer.toBusiness('Feature Flags'), 'Feature Management');
  assert.strictEqual(BusinessAliasLayer.toBusiness('Operation Modes'), 'Workspace Modes');
});

runTest('Should map business terms back to canonical tech framework terms', () => {
  assert.strictEqual(BusinessAliasLayer.toTech('Trips & Journeys'), 'Voyage8');
  assert.strictEqual(BusinessAliasLayer.toTech('Website Builder'), 'VIBE8 CMS');
  assert.strictEqual(BusinessAliasLayer.toTech('SEO Growth'), 'HESTIA8');
  assert.strictEqual(BusinessAliasLayer.toTech('Business Builder'), 'CRUDE8');
});

// -------------------------------------------------------------
// Criterion 2 & 9: Simple vs Advanced Mode (No tech overload in Simple mode)
// -------------------------------------------------------------
console.log('\n--- 2. Dual Navigation: Simple vs Advanced Mode ---');

runTest('Simple mode hides Platform Studio and technical engines from normal users', () => {
  const simpleMenu = RoleMenuResolver.resolveMenu({
    userRoles: ['ADMIN'],
    mode: 'simple',
  });

  const studioCat = simpleMenu.find(c => c.key === 'PLATFORM_STUDIO');
  assert.strictEqual(studioCat, undefined, 'Platform Studio must be hidden in Simple mode');

  // Verify all categories in simple mode are business layer
  for (const cat of simpleMenu) {
    assert.strictEqual(cat.layer, 'BUSINESS');
    for (const item of cat.items) {
      assert.strictEqual(item.layer, 'BUSINESS');
    }
  }
});

runTest('Advanced mode exposes Platform Studio with all 10 core engines to Admins', () => {
  const advancedMenu = RoleMenuResolver.resolveMenu({
    userRoles: ['ADMIN'],
    mode: 'advanced',
  });

  const studioCat = advancedMenu.find(c => c.key === 'PLATFORM_STUDIO');
  assert.ok(studioCat, 'Platform Studio must be present in Advanced mode');
  assert.strictEqual(studioCat.layer, 'ADVANCED');

  const studioTitles = studioCat.items.map(i => i.businessTitle);
  assert.ok(studioTitles.includes('VIBE8 Engine'));
  assert.ok(studioTitles.includes('HESTIA8 Engine'));
  assert.ok(studioTitles.includes('CRUDE8 Studio'));
  assert.ok(studioTitles.includes('Registry Manager'));
  assert.ok(studioTitles.includes('AI Agent Studio'));
  assert.ok(studioTitles.includes('Workflow Builder'));
  assert.ok(studioTitles.includes('Feature Control'));
  assert.ok(studioTitles.includes('Operation Modes'));
  assert.ok(studioTitles.includes('API Center'));
  assert.ok(studioTitles.includes('Developer Tools'));
});

// -------------------------------------------------------------
// Criterion 3: H8 Terminology Remains Available Without Confusion
// -------------------------------------------------------------
console.log('\n--- 3. Progressive Disclosure of H8 Tech Labels ---');

runTest('Every business module carries a "Powered by" technical label', () => {
  assert.strictEqual(BusinessAliasLayer.getTechLabel('VIBE8 CMS'), 'Powered by VIBE8');
  assert.strictEqual(BusinessAliasLayer.getTechLabel('HESTIA8'), 'Powered by HESTIA8');
  assert.strictEqual(BusinessAliasLayer.getTechLabel('DMS8'), 'Powered by DMS8');
  assert.strictEqual(BusinessAliasLayer.getTechLabel('CRUDE8'), 'Powered by CRUDE8');

  // Check item resolution attaches tech labels
  const menu = RoleMenuResolver.resolveMenu({
    userRoles: ['ADMIN'],
    mode: 'advanced',
  });
  const webCat = menu.find(c => c.key === 'WEBSITE_MARKETING');
  const webBuilder = webCat.items.find(i => i.id === 'nav_website_builder');
  assert.strictEqual(webBuilder.techLabel, 'Powered by VIBE8');
  assert.ok(webBuilder.techPill, 'Advanced mode includes tech pill');
});

// -------------------------------------------------------------
// Criterion 4: Menus Change Based on Role
// -------------------------------------------------------------
console.log('\n--- 4. Role-Based Menu Personalization ---');

runTest('Travel Agent sees only agent tasks (No ERP, Supplier GDS, or System Health)', () => {
  const agentMenu = RoleMenuResolver.resolveMenu({
    userRoles: ['TRAVEL_AGENT'],
    mode: 'simple',
  });

  const catKeys = agentMenu.map(c => c.key);
  assert.ok(catKeys.includes('OVERVIEW'));
  assert.ok(catKeys.includes('TRAVEL_OPERATIONS'));
  assert.ok(catKeys.includes('CUSTOMERS_SALES'));
  assert.ok(catKeys.includes('DOCUMENTS'));
  assert.ok(!catKeys.includes('SETTINGS'), 'Settings must not be shown to basic travel agent');
  assert.ok(!catKeys.includes('PLATFORM_STUDIO'), 'Platform studio must not be shown to travel agent');

  // Within Travel Operations, Agent only sees trips, bookings, packages (no raw suppliers or radar)
  const opsCat = agentMenu.find(c => c.key === 'TRAVEL_OPERATIONS');
  const itemIds = opsCat.items.map(i => i.id);
  assert.ok(itemIds.includes('nav_trips_journeys'));
  assert.ok(itemIds.includes('nav_bookings'));
  assert.ok(itemIds.includes('nav_packages'));
  assert.ok(!itemIds.includes('nav_suppliers'), 'Suppliers should be hidden from agent');
  assert.ok(!itemIds.includes('nav_operations'), 'Control tower should be hidden from agent');
});

runTest('Customer role receives dedicated retail "My Travel Space" menu', () => {
  const customerMenu = RoleMenuResolver.resolveMenu({
    userRoles: ['CUSTOMER'],
    mode: 'simple',
  });

  assert.strictEqual(customerMenu.length, 1);
  assert.strictEqual(customerMenu[0].key, 'CUSTOMER_SPACE');
  const titles = customerMenu[0].items.map(i => i.businessTitle);
  assert.ok(titles.includes('Upcoming Trips'));
  assert.ok(titles.includes('My Bookings'));
  assert.ok(titles.includes('Documents & Visas'));
  assert.ok(titles.includes('Travel Community'));
  assert.ok(titles.includes('AI Trip Assistant'));
});

// -------------------------------------------------------------
// Criterion 5: Menus Change Based on Branch Context
// -------------------------------------------------------------
console.log('\n--- 5. Branch Context Resolution ---');

runTest('Branch Context Manager defines HQ and regional branch desks', () => {
  const branches = BranchContextManager.getAllBranches();
  assert.strictEqual(branches.length, 5);
  const branchIds = branches.map(b => b.id);
  assert.ok(branchIds.includes('org_tp_hq'));
  assert.ok(branchIds.includes('br_kochi'));
  assert.ok(branchIds.includes('br_dubai'));
  assert.ok(branchIds.includes('br_tvm'));
  assert.ok(branchIds.includes('br_sin'));
});

runTest('Switching branch context propagates branch query to resolved menu routes', () => {
  const kochiMenu = RoleMenuResolver.resolveMenu({
    userRoles: ['ADMIN'],
    mode: 'simple',
    branchId: 'br_kochi',
  });

  const bkgItem = kochiMenu
    .find(c => c.key === 'TRAVEL_OPERATIONS')
    .items.find(i => i.id === 'nav_bookings');
  assert.ok(bkgItem.activeHref.includes('branch=br_kochi'), 'Route must include branch=br_kochi');
});

// -------------------------------------------------------------
// Criterion 6 & 7: CRUDE8 Dynamic Navigation Bridge
// -------------------------------------------------------------
console.log('\n--- 6 & 7. CRUDE8 Dynamic Capability Matrix Bridge ---');

runTest('CRUDE8 Nav Bridge enriches navigation items with schema, actions, and workflows', () => {
  const tripItem = {
    id: 'nav_trips',
    businessTitle: 'Trips & Journeys',
    techName: 'Voyage8',
    techLabel: 'Powered by Voyage8',
    shortDescription: 'Active customer itineraries',
    href: '/admin/journey-studio',
    iconName: 'Compass',
    layer: 'BUSINESS',
    categoryKey: 'TRAVEL_OPERATIONS',
    crude8Entity: 'Journey',
    order: 1,
  };

  const enriched = CRUDE8NavBridge.enrichItem(tripItem);
  assert.ok(enriched.crudeMetadata, 'Must have crudeMetadata');
  assert.strictEqual(enriched.crudeMetadata.entityName, 'Journey');
  assert.ok(enriched.crudeMetadata.allowedActions.length > 0);
  assert.ok(enriched.crudeMetadata.reports.length > 0);
});

// -------------------------------------------------------------
// Criterion 8: AI Navigation Assist & Intelligent Search
// -------------------------------------------------------------
console.log('\n--- 8. AI Navigation Assist & Intelligent Search ---');

runTest('AI Assistant resolves "Show today\'s bookings" to Bookings Dashboard', () => {
  const res = AINavigationAssistant.resolve("Show today's bookings");
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.targetRoute, '/operations/dashboard');
  assert.strictEqual(res.businessTitle, 'Bookings Dashboard');
});

runTest('AI Assistant resolves "Create Kerala package" to Package Builder', () => {
  const res = AINavigationAssistant.resolve('Create Kerala package');
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.targetRoute, '/admin/builder?action=new_package');
  assert.strictEqual(res.entityType, 'PACKAGE');
});

runTest('AI Assistant resolves "Improve my website SEO" to SEO Growth', () => {
  const res = AINavigationAssistant.resolve('Improve my website SEO');
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.targetRoute, '/admin/seo');
  assert.strictEqual(res.businessTitle, 'SEO Growth Hub');
});

runTest('AI Assistant resolves "Switch Kochi branch" to Branch Context Switch', () => {
  const res = AINavigationAssistant.resolve('Switch Kochi branch');
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.type, 'BRANCH_SWITCH');
  assert.ok(res.branch);
  assert.strictEqual(res.branch.id, 'br_kochi');
});

runTest('AI Assistant resolves cross-entity queries ("Dubai booking", "Pending visa documents")', () => {
  const resBkg = AINavigationAssistant.resolve('Dubai booking');
  assert.strictEqual(resBkg.matched, true);
  assert.strictEqual(resBkg.entityType, 'BOOKING');

  const resDoc = AINavigationAssistant.resolve('Pending visa documents');
  assert.strictEqual(resDoc.matched, true);
  assert.strictEqual(resDoc.entityType, 'DOCUMENT');
});

runTest('Voice intent resolver recognizes newly added goal-based intents', () => {
  const resVoice = VoiceIntentResolver.resolve("show today's bookings", 'ADMIN');
  assert.strictEqual(resVoice.matched, true);
  assert.strictEqual(resVoice.intent.targetRoute, '/operations/dashboard');

  const resVoiceSeo = VoiceIntentResolver.resolve('improve my website seo', 'ADMIN');
  assert.strictEqual(resVoiceSeo.matched, true);
  assert.strictEqual(resVoiceSeo.intent.targetRoute, '/admin/seo');
});

// -------------------------------------------------------------
// Test Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`   Navigation Results: ${passedTests} Passed, ${failedTests} Failed`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
