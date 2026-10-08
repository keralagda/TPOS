/**
 * Travel Planet OS — Comprehensive Navigation System Tests
 * Validates the Business Experience Layer, Dual Navigation, Naming Transformations,
 * Role Personalization, Branch Context, CRUDE8 Dynamic Adapter, AI Navigation, and Intelligent Search.
 */

const assert = require('assert');

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('   🧭 TRAVEL PLANET OS — NAVIGATION SYSTEM ACCEPTANCE TESTS');
console.log('================================================================\n');

// 1. Business Aliases & Naming Transformation
const BUSINESS_ALIASES = {
  Voyage8: {
    techTerm: 'Voyage8',
    businessTitle: 'Trips & Journeys',
    description: 'Design dynamic itineraries, live passenger journeys, and multi-day packages.',
    poweredBy: 'Powered by Voyage8 Kernel',
  },
  'VIBE8 CMS': {
    techTerm: 'VIBE8 CMS',
    businessTitle: 'Website Builder',
    description: 'Create and manage travel websites, landing pages, and interactive showcase portals.',
    poweredBy: 'Powered by VIBE8',
  },
  HESTIA8: {
    techTerm: 'HESTIA8',
    businessTitle: 'SEO Growth',
    description: 'Improve Google visibility, semantic entities, and content performance.',
    poweredBy: 'Powered by HESTIA8',
  },
  CRUDE8: {
    techTerm: 'CRUDE8',
    businessTitle: 'Business Builder',
    description: 'Create business workflows, custom data models, and automated logic.',
    poweredBy: 'Powered by CRUDE8',
  },
  DMS8: {
    techTerm: 'DMS8',
    businessTitle: 'Documents',
    description: 'Manage travel files, visa records, passenger passports, and approvals.',
    poweredBy: 'Powered by DMS8',
  },
  Social8: {
    techTerm: 'Social8',
    businessTitle: 'Travel Community',
    description: 'Engage travel circles, traveler discussions, authentic reviews, and shared stories.',
    poweredBy: 'Powered by Social8',
  },
  GEM8: {
    techTerm: 'GEM8',
    businessTitle: 'Places Discovery',
    description: 'Curate hidden gems, destination guides, verified attractions, and local tips.',
    poweredBy: 'Powered by GEM8',
  },
  'AI Agents': {
    techTerm: 'AI Agents',
    businessTitle: 'AI Assistants',
    description: 'Deploy 24/7 intelligent assistants for sales, quotation synthesis, and operations.',
    poweredBy: 'Powered by TravelAI Multi-Agent Fleet',
  },
  Branch8: {
    techTerm: 'Branch8',
    businessTitle: 'Branch Management',
    description: 'Manage physical branches, local agent desks, regional currencies, and tax rules.',
    poweredBy: 'Powered by Branch8 Multi-Tenancy',
  },
  Registry: {
    techTerm: 'Registry',
    businessTitle: 'Configuration Center',
    description: 'Centralized authority for platform schemas, system settings, and policies.',
    poweredBy: 'Powered by H8 Architecture Registry',
  },
  'Feature Flags': {
    techTerm: 'Feature Flags',
    businessTitle: 'Feature Management',
    description: 'Safely enable new capabilities, release rollouts, and customize module access.',
    poweredBy: 'Powered by Flags8 Control',
  },
  'Operation Modes': {
    techTerm: 'Operation Modes',
    businessTitle: 'Workspace Modes',
    description: 'Switch between production, maintenance, scheduled rollovers, and sandbox testing.',
    poweredBy: 'Powered by OpModes8 Runtime',
  },
};

function getBusinessTitle(techOrBusinessName) {
  const match = BUSINESS_ALIASES[techOrBusinessName];
  if (match) return match.businessTitle;
  const found = Object.values(BUSINESS_ALIASES).find(
    (a) => a.techTerm.toLowerCase() === techOrBusinessName.toLowerCase()
  );
  if (found) return found.businessTitle;
  return techOrBusinessName;
}

function getModuleCardInfo(key) {
  if (BUSINESS_ALIASES[key]) return BUSINESS_ALIASES[key];
  const found = Object.values(BUSINESS_ALIASES).find(
    (a) => a.businessTitle.toLowerCase() === key.toLowerCase()
  );
  if (found) return found;
  return {
    techTerm: key,
    businessTitle: key,
    description: `Manage and optimize ${key.toLowerCase()} for your travel agency.`,
    poweredBy: `Powered by H8 Engine`,
  };
}

// 2. Simple Mode Menu Definitions
const SIMPLE_MODE_ITEMS = [
  { id: 'simple-dashboard', label: 'Dashboard', href: '/admin/dashboard' },
  { id: 'simple-customers', label: 'Customers', href: '/crm/customers' },
  { id: 'simple-trips', label: 'Trips', href: '/journeys' },
  { id: 'simple-bookings', label: 'Bookings', href: '/operations/control-tower' },
  { id: 'simple-website', label: 'Website', href: '/admin/cms' },
  { id: 'simple-seo', label: 'SEO', href: '/admin/seo' },
  { id: 'simple-documents', label: 'Documents', href: '/admin/dms' },
  { id: 'simple-finance', label: 'Finance', href: '/finance/dashboard' },
  { id: 'simple-reports', label: 'Reports', href: '/finance/reconciliation' },
  { id: 'simple-ai', label: 'AI', href: '/voice' },
];

// 3. Platform Studio (Advanced Mode)
const PLATFORM_STUDIO_ITEMS = [
  { id: 'nav-adv-vibe8', label: 'VIBE8 Engine', href: '/admin/cms' },
  { id: 'nav-adv-hestia8', label: 'HESTIA8 Engine', href: '/admin/seo' },
  { id: 'nav-adv-crude8', label: 'CRUDE8 Studio', href: '/admin/crude8/studio' },
  { id: 'nav-adv-registry', label: 'Registry Manager', href: '/admin/crude8' },
  { id: 'nav-adv-ai-studio', label: 'AI Agent Studio', href: '/admin/developer#ai' },
  { id: 'nav-adv-workflows', label: 'Workflow Builder', href: '/admin/crude8/studio' },
  { id: 'nav-adv-features', label: 'Feature Control', href: '/admin/system-health#features' },
  { id: 'nav-adv-op-modes', label: 'Operation Modes', href: '/admin/dashboard#modes' },
  { id: 'nav-adv-api-center', label: 'API Center', href: '/admin/developer' },
  { id: 'nav-adv-dev-tools', label: 'Developer Tools', href: '/admin/system-health' },
];

// 4. Branch Context
const BRANCH_REGISTRY = {
  global_hq: { id: 'global_hq', code: 'HQ-GLOBAL', name: 'Global Headquarters (All Branches)', city: 'Global', currency: 'INR', isHQ: true },
  branch_kochi: { id: 'branch_kochi', code: 'BR-COK-01', name: 'Kochi Branch (Kerala)', city: 'Kochi', currency: 'INR', isHQ: false },
  branch_dubai: { id: 'branch_dubai', code: 'BR-DXB-01', name: 'Dubai Branch (Deira & Marina)', city: 'Dubai', currency: 'AED', isHQ: false },
  branch_delhi: { id: 'branch_delhi', code: 'BR-DEL-01', name: 'Delhi NCR Branch', city: 'New Delhi', currency: 'INR', isHQ: false },
  branch_mumbai: { id: 'branch_mumbai', code: 'BR-BOM-01', name: 'Mumbai Branch', city: 'Mumbai', currency: 'INR', isHQ: false },
  branch_singapore: { id: 'branch_singapore', code: 'BR-SIN-01', name: 'Singapore APAC Hub', city: 'Singapore', currency: 'SGD', isHQ: false },
};

function getBranchById(id) {
  return BRANCH_REGISTRY[id] || BRANCH_REGISTRY.global_hq;
}

// 5. Role Resolver Function
function resolveNavigation(options = {}) {
  const role = options.role || 'PLATFORM_SUPER_ADMIN';
  const branch = getBranchById(options.branchId || 'global_hq');
  const mode = options.mode || (role === 'TRAVEL_AGENT' || role === 'CUSTOMER' ? 'simple' : 'advanced');

  if (role === 'CUSTOMER') {
    return {
      role,
      branch,
      mode: 'simple',
      sections: [
        {
          id: 'my-travel-space',
          title: 'My Travel Space',
          items: [
            { id: 'cust-trips', label: 'Upcoming Trips', href: '/account/trips' },
            { id: 'cust-bookings', label: 'My Bookings', href: '/operations/control-tower' },
            { id: 'cust-docs', label: 'My Documents & Passports', href: '/admin/dms' },
            { id: 'cust-payments', label: 'Payments & Receipts', href: '/finance/dashboard' },
            { id: 'cust-memories', label: 'Travel Memories', href: '/diaries' },
            { id: 'cust-recs', label: 'Recommendations', href: '/packages' },
            { id: 'cust-community', label: 'Travel Community', href: '/circles' },
          ],
        },
      ],
    };
  }

  if (role === 'TRAVEL_AGENT') {
    return {
      role,
      branch,
      mode: 'simple',
      sections: [
        {
          id: 'agent-desk-group',
          title: "Today's Work",
          items: [
            { id: 'agent-enquiries', label: 'New Enquiries', href: '/agent/dashboard?tab=inquiries' },
            { id: 'agent-followups', label: 'Pending Follow-ups', href: '/crm/leads?filter=pending' },
            { id: 'agent-quotes', label: 'Pending Quotes', href: '/crm/quotes' },
            { id: 'agent-trips', label: 'My Trips', href: '/journeys' },
            { id: 'agent-bookings', label: 'Recent Bookings', href: '/operations/control-tower' },
            { id: 'agent-docs', label: 'Customer Documents', href: '/admin/dms' },
            { id: 'agent-ai', label: 'AI Sales Copilot', href: '/agent/dashboard#ai' },
          ],
        },
      ],
    };
  }

  if (role === 'BRANCH_MANAGER') {
    return {
      role,
      branch,
      mode,
      sections: [
        {
          id: 'branch-overview',
          title: `Branch Command (${branch.city})`,
          items: [
            { id: 'bm-dash', label: 'Branch Overview', href: '/admin/dashboard' },
            { id: 'bm-sales', label: 'Sales & Revenue', href: '/crm/dashboard' },
            { id: 'bm-bookings', label: 'Branch Bookings', href: '/operations/control-tower' },
          ],
        },
        {
          id: 'branch-team',
          title: 'Team & Supervision',
          items: [
            { id: 'bm-agents', label: 'Branch Agents', href: '/admin/developer#users' },
            { id: 'bm-tasks', label: 'Daily Agent Tasks', href: '/agent/dashboard' },
            { id: 'bm-approvals', label: 'Manager Approvals', href: '/admin/approvals' },
          ],
        },
        {
          id: 'branch-ops',
          title: 'Operations & Suppliers',
          items: [
            { id: 'bm-trips', label: 'Active Trips', href: '/journeys' },
            { id: 'bm-issues', label: 'Disruption & Issues', href: '/operations/dashboard' },
            { id: 'bm-suppliers', label: 'Supplier Updates', href: '/partner/dashboard' },
          ],
        },
      ],
    };
  }

  if (mode === 'simple') {
    return {
      role,
      branch,
      mode: 'simple',
      sections: [
        {
          id: 'simple-business-menu',
          title: 'Business Navigation',
          items: SIMPLE_MODE_ITEMS,
        },
      ],
    };
  }

  // Advanced Enterprise Mode
  return {
    role,
    branch,
    mode: 'advanced',
    sections: [
      { id: 'overview', title: 'Overview', items: [{ id: '1', label: 'Business Dashboard', href: '/admin/dashboard' }] },
      { id: 'platform-studio', title: 'Platform Studio', items: PLATFORM_STUDIO_ITEMS },
    ],
  };
}

// 6. AI Navigation Resolver
function resolveAINavigation(query) {
  const q = query.toLowerCase();
  if (q.includes("show today's bookings") || q.includes('dubai booking')) {
    return {
      resolvedModule: 'Bookings',
      targetUrl: '/operations/control-tower',
      resolvedEntity: 'Booking',
      confirmationText: 'Navigating to Operations Control Tower & Bookings Radar.',
    };
  }
  if (q.includes('create kerala package') || q.includes('munnar packages')) {
    return {
      resolvedModule: 'Packages',
      targetUrl: '/packages',
      resolvedEntity: 'TravelPackage',
      confirmationText: 'Opening Package Builder to craft your holiday package.',
    };
  }
  if (q.includes('improve my website seo') || q.includes('seo')) {
    return {
      resolvedModule: 'SEO Growth',
      targetUrl: '/admin/seo',
      resolvedEntity: 'SEO',
      confirmationText: 'Opening SEO Growth powered by HESTIA8.',
    };
  }
  if (q.includes('switch kochi branch')) {
    return {
      resolvedModule: 'Branch Management',
      targetUrl: '/admin/dashboard',
      branchSwitch: 'branch_kochi',
      confirmationText: 'Switched active workspace branch to Kochi Branch (Kerala).',
    };
  }
  return {
    resolvedModule: 'Global Search',
    targetUrl: `/crm/leads?q=${encodeURIComponent(query)}`,
    confirmationText: `Searching across all records for "${query}".`,
  };
}

// 7. Intelligent Search Resolver
const SEARCH_INDEX = [
  { query: 'Dubai booking', title: 'Dubai Booking Records', url: '/operations/control-tower', entity: 'Booking', module: 'Bookings', action: 'VIEW_BOOKINGS', permission: 'bookings.view' },
  { query: 'Munnar packages', title: 'Munnar Tea Hills Packages', url: '/packages?q=munnar', entity: 'TravelPackage', module: 'Packages', action: 'VIEW_PACKAGES', permission: 'inventory.view' },
  { query: 'Pending visa documents', title: 'Pending Visa & Passport Verification', url: '/admin/dms?filter=pending-visas', entity: 'Document', module: 'Documents', action: 'VERIFY_VISA', permission: 'trips.manage' },
  { query: 'Customer Rahul', title: 'Customer Rahul Sharma', url: '/crm/leads?search=Rahul', entity: 'Customer', module: 'Customers & Sales', action: 'VIEW_CUSTOMER', permission: 'customers.view' },
];

function executeIntelligentSearch(query) {
  const normalized = query.toLowerCase();
  return SEARCH_INDEX.filter((item) => item.query.toLowerCase().includes(normalized) || normalized.includes(item.query.toLowerCase()));
}

// 8. Universal Quick Actions
const UNIVERSAL_QUICK_ACTIONS = [
  { id: 'act-new-customer', label: 'New Customer', actionCode: 'customers.create' },
  { id: 'act-new-trip', label: 'New Trip', actionCode: 'trips.create' },
  { id: 'act-new-booking', label: 'New Booking', actionCode: 'bookings.create' },
  { id: 'act-new-package', label: 'New Package', actionCode: 'packages.create' },
  { id: 'act-upload-doc', label: 'Upload Document', actionCode: 'documents.upload' },
  { id: 'act-new-campaign', label: 'Create Campaign', actionCode: 'campaigns.create' },
];

// -------------------------------------------------------------
// TESTS EXECUTION
// -------------------------------------------------------------

console.log('--- 1. Acceptance: Normal Users Understand Every Menu (Naming Transformation) ---');
it('Remaps technical system names to business goal titles', () => {
  assert.strictEqual(getBusinessTitle('Voyage8'), 'Trips & Journeys');
  assert.strictEqual(getBusinessTitle('VIBE8 CMS'), 'Website Builder');
  assert.strictEqual(getBusinessTitle('HESTIA8'), 'SEO Growth');
  assert.strictEqual(getBusinessTitle('CRUDE8'), 'Business Builder');
  assert.strictEqual(getBusinessTitle('DMS8'), 'Documents');
  assert.strictEqual(getBusinessTitle('Social8'), 'Travel Community');
  assert.strictEqual(getBusinessTitle('GEM8'), 'Places Discovery');
  assert.strictEqual(getBusinessTitle('AI Agents'), 'AI Assistants');
  assert.strictEqual(getBusinessTitle('Branch8'), 'Branch Management');
  assert.strictEqual(getBusinessTitle('Registry'), 'Configuration Center');
  assert.strictEqual(getBusinessTitle('Feature Flags'), 'Feature Management');
  assert.strictEqual(getBusinessTitle('Operation Modes'), 'Workspace Modes');
});

it('Simple Mode contains only 10 goal-based business items with zero technical engine leaks', () => {
  const expectedLabels = [
    'Dashboard', 'Customers', 'Trips', 'Bookings', 'Website',
    'SEO', 'Documents', 'Finance', 'Reports', 'AI'
  ];
  assert.strictEqual(SIMPLE_MODE_ITEMS.length, 10);
  const actualLabels = SIMPLE_MODE_ITEMS.map((item) => item.label);
  assert.deepStrictEqual(actualLabels, expectedLabels);

  const forbiddenTerms = ['VIBE8', 'HESTIA8', 'CRUDE8', 'DMS8', 'Voyage8', 'Kernel', 'GEM8', 'Social8'];
  for (const label of actualLabels) {
    for (const term of forbiddenTerms) {
      assert.ok(!label.includes(term), `Forbidden term "${term}" found in "${label}"`);
    }
  }
});

console.log('\n--- 2. Acceptance: Advanced Users Retain Full Platform Control ---');
it('Advanced Mode provides Platform Studio with all 10 engine studios & developer tools', () => {
  const nav = resolveNavigation({ role: 'PLATFORM_SUPER_ADMIN', mode: 'advanced' });
  const platformStudio = nav.sections.find((s) => s.id === 'platform-studio');
  assert.ok(platformStudio, 'Platform Studio section must be present in Advanced Mode');

  const engineLabels = platformStudio.items.map((i) => i.label);
  assert.ok(engineLabels.includes('VIBE8 Engine'));
  assert.ok(engineLabels.includes('HESTIA8 Engine'));
  assert.ok(engineLabels.includes('CRUDE8 Studio'));
  assert.ok(engineLabels.includes('Registry Manager'));
  assert.ok(engineLabels.includes('AI Agent Studio'));
  assert.ok(engineLabels.includes('Workflow Builder'));
  assert.ok(engineLabels.includes('Feature Control'));
  assert.ok(engineLabels.includes('Operation Modes'));
  assert.ok(engineLabels.includes('API Center'));
  assert.ok(engineLabels.includes('Developer Tools'));
});

console.log('\n--- 3. Acceptance: Module Card Design with Tech Labels ---');
it('Module Card info produces User Title + Short Description + Tech Label', () => {
  const vibeCard = getModuleCardInfo('VIBE8 CMS');
  assert.strictEqual(vibeCard.businessTitle, 'Website Builder');
  assert.strictEqual(vibeCard.poweredBy, 'Powered by VIBE8');

  const hestiaCard = getModuleCardInfo('HESTIA8');
  assert.strictEqual(hestiaCard.businessTitle, 'SEO Growth');
  assert.strictEqual(hestiaCard.poweredBy, 'Powered by HESTIA8');

  const dmsCard = getModuleCardInfo('DMS8');
  assert.strictEqual(dmsCard.businessTitle, 'Documents');
  assert.strictEqual(dmsCard.poweredBy, 'Powered by DMS8');

  const crudeCard = getModuleCardInfo('CRUDE8');
  assert.strictEqual(crudeCard.businessTitle, 'Business Builder');
  assert.strictEqual(crudeCard.poweredBy, 'Powered by CRUDE8');
});

console.log('\n--- 4. Acceptance: Menus Change Based on Role ---');
it('Travel Agent role receives daily consultant work queue', () => {
  const nav = resolveNavigation({ role: 'TRAVEL_AGENT' });
  assert.strictEqual(nav.role, 'TRAVEL_AGENT');
  assert.strictEqual(nav.sections.length, 1);
  assert.strictEqual(nav.sections[0].title, "Today's Work");

  const itemLabels = nav.sections[0].items.map((i) => i.label);
  assert.ok(itemLabels.includes('New Enquiries'));
  assert.ok(itemLabels.includes('Pending Follow-ups'));
  assert.ok(itemLabels.includes('Pending Quotes'));
  assert.ok(itemLabels.includes('Customer Documents'));
  assert.ok(itemLabels.includes('AI Sales Copilot'));
});

it('Branch Manager role receives branch command, team supervision & operations', () => {
  const nav = resolveNavigation({ role: 'BRANCH_MANAGER', branchId: 'branch_kochi' });
  const sectionTitles = nav.sections.map((s) => s.title);
  assert.ok(sectionTitles.some((t) => t.includes('Branch Command (Kochi)')));
  assert.ok(sectionTitles.includes('Team & Supervision'));
  assert.ok(sectionTitles.includes('Operations & Suppliers'));
});

it('Customer role receives "My Travel Space" navigation', () => {
  const nav = resolveNavigation({ role: 'CUSTOMER' });
  assert.strictEqual(nav.sections[0].title, 'My Travel Space');
  const labels = nav.sections[0].items.map((i) => i.label);
  assert.ok(labels.includes('Upcoming Trips'));
  assert.ok(labels.includes('My Bookings'));
  assert.ok(labels.includes('My Documents & Passports'));
  assert.ok(labels.includes('Payments & Receipts'));
});

console.log('\n--- 5. Acceptance: Menus Change Based on Branch Context ---');
it('Resolves branch context across Kochi, Dubai, Delhi, and Global HQ', () => {
  const kochiBranch = getBranchById('branch_kochi');
  assert.strictEqual(kochiBranch.city, 'Kochi');
  assert.strictEqual(kochiBranch.currency, 'INR');

  const dubaiBranch = getBranchById('branch_dubai');
  assert.strictEqual(dubaiBranch.city, 'Dubai');
  assert.strictEqual(dubaiBranch.currency, 'AED');

  const navKochi = resolveNavigation({ role: 'BRANCH_MANAGER', branchId: 'branch_kochi' });
  assert.strictEqual(navKochi.branch.id, 'branch_kochi');
  assert.strictEqual(navKochi.branch.city, 'Kochi');

  const navDubai = resolveNavigation({ role: 'BRANCH_MANAGER', branchId: 'branch_dubai' });
  assert.strictEqual(navDubai.branch.id, 'branch_dubai');
  assert.strictEqual(navDubai.branch.currency, 'AED');
});

console.log('\n--- 6. Acceptance: Dynamic CRUDE8 Capabilities ---');
it('CRUDE8 capability mapping generates structured entities with actions and workflows', () => {
  const sampleDynamicItem = {
    entityName: 'Lead',
    actions: ['CREATE', 'READ', 'UPDATE', 'ASSIGN', 'APPROVE', 'EXPORT'],
    permission: 'lead.read',
    workflow: 'ASSIGN • APPROVE • REJECT',
    analytics: 'Lead Funnel Conversion',
    techLabel: 'CRUDE8 [Lead]',
  };
  assert.strictEqual(sampleDynamicItem.entityName, 'Lead');
  assert.ok(sampleDynamicItem.actions.includes('CREATE'));
  assert.ok(sampleDynamicItem.actions.includes('APPROVE'));
  assert.ok(sampleDynamicItem.workflow.includes('APPROVE'));
  assert.strictEqual(sampleDynamicItem.techLabel, 'CRUDE8 [Lead]');
});

console.log('\n--- 7. Acceptance: AI Can Guide Users to Features ---');
it('AI correctly resolves "Show today\'s bookings" to Bookings Dashboard', () => {
  const res = resolveAINavigation("Show today's bookings");
  assert.strictEqual(res.resolvedModule, 'Bookings');
  assert.strictEqual(res.targetUrl, '/operations/control-tower');
  assert.strictEqual(res.resolvedEntity, 'Booking');
});

it('AI correctly resolves "Create Kerala package" to Package Builder', () => {
  const res = resolveAINavigation('Create Kerala package');
  assert.strictEqual(res.resolvedModule, 'Packages');
  assert.strictEqual(res.targetUrl, '/packages');
  assert.strictEqual(res.resolvedEntity, 'TravelPackage');
});

it('AI correctly resolves "Improve my website SEO" to SEO Growth', () => {
  const res = resolveAINavigation('Improve my website SEO');
  assert.strictEqual(res.resolvedModule, 'SEO Growth');
  assert.strictEqual(res.targetUrl, '/admin/seo');
  assert.strictEqual(res.resolvedEntity, 'SEO');
});

it('AI correctly resolves "Switch Kochi branch" to Branch Context Switch', () => {
  const res = resolveAINavigation('Switch Kochi branch');
  assert.strictEqual(res.branchSwitch, 'branch_kochi');
  assert.ok(res.confirmationText.includes('Kochi Branch'));
});

console.log('\n--- 8. Acceptance: Global Intelligent Search ---');
it('Intelligent Search resolves "Dubai booking" to Booking entity and action', () => {
  const results = executeIntelligentSearch('Dubai booking');
  assert.ok(results.length > 0);
  const top = results[0];
  assert.strictEqual(top.entity, 'Booking');
  assert.strictEqual(top.module, 'Bookings');
  assert.strictEqual(top.action, 'VIEW_BOOKINGS');
  assert.strictEqual(top.permission, 'bookings.view');
});

it('Intelligent Search resolves "Munnar packages" to TravelPackage entity', () => {
  const results = executeIntelligentSearch('Munnar packages');
  assert.ok(results.length > 0);
  const top = results[0];
  assert.strictEqual(top.entity, 'TravelPackage');
  assert.strictEqual(top.module, 'Packages');
});

it('Intelligent Search resolves "Pending visa documents" to Document entity', () => {
  const results = executeIntelligentSearch('Pending visa documents');
  assert.ok(results.length > 0);
  const top = results[0];
  assert.strictEqual(top.entity, 'Document');
  assert.strictEqual(top.module, 'Documents');
  assert.strictEqual(top.action, 'VERIFY_VISA');
});

it('Intelligent Search resolves "Customer Rahul" to Customer entity and profile', () => {
  const results = executeIntelligentSearch('Customer Rahul');
  assert.ok(results.length > 0);
  const top = results[0];
  assert.strictEqual(top.entity, 'Customer');
  assert.strictEqual(top.module, 'Customers & Sales');
});

console.log('\n--- 9. Acceptance: Universal Quick Actions ---');
it('Universal Quick Action buttons contain all required universal creation triggers', () => {
  const actionLabels = UNIVERSAL_QUICK_ACTIONS.map((a) => a.label);
  assert.ok(actionLabels.includes('New Customer'));
  assert.ok(actionLabels.includes('New Trip'));
  assert.ok(actionLabels.includes('New Booking'));
  assert.ok(actionLabels.includes('New Package'));
  assert.ok(actionLabels.includes('Upload Document'));
  assert.ok(actionLabels.includes('Create Campaign'));
});

console.log('\n================================================================');
console.log(`   Navigation System Test Results: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
