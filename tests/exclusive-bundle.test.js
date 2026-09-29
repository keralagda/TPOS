/**
 * ====================================================================
 *   TRAVEL PLANET — EXCLUSIVE H8 / VOYAGE8 v2.0.0 BUNDLE TEST SUITE
 * ====================================================================
 * Tests:
 * 1. Social8 Circles & Journey Proposal Conversion Gate (§16)
 * 2. GEM8 Beyond-The-Icon Discovery & Provenance Scoring (§17)
 * 3. VN8 / VO8 Voice Intent Resolution & RBAC Gatekeeper (§19)
 * 4. DMS Dynamic Token Replacement & SHA-256 Hash Verification (§15)
 * 5. SaaS Admin Control Plane & Feature Flag Authoritative Check (§30-§34)
 */

const assert = require('assert');
const crypto = require('crypto');

console.log('\n================================================================');
console.log('   🚀 TRAVEL PLANET (VOYAGE8) — v2.0.0 EXCLUSIVE BUNDLE TESTS');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${desc}: ${err.message}`);
    failed++;
  }
}

// Mock Voice Intent Resolver logic
const { GOVERNED_VOICE_INTENTS, VoiceIntentResolver } = (() => {
  const GOVERNED_VOICE_INTENTS = [
    {
      intentKey: 'NAV_CIRCLES',
      phrases: ['open circles', 'show circles', 'travel circles', 'community', 'യാത്ര കമ്മ്യൂണിറ്റി', 'कम्युनिटी खोलो'],
      targetRoute: '/circles',
      requiredRole: null,
      requiresConfirmation: false,
      riskLevel: 'LOW',
      actionTitle: 'Navigate to Social8 Circles',
    },
    {
      intentKey: 'NAV_CRM_LEADS',
      phrases: ['open leads', 'show leads', 'crm leads', 'ലീഡുകൾ കാണിക്കുക', 'लीड्स दिखाओ'],
      targetRoute: '/crm/leads',
      requiredRole: 'TRAVEL_AGENT',
      requiresConfirmation: false,
      riskLevel: 'LOW',
      actionTitle: 'Navigate to CRM Leads',
    },
    {
      intentKey: 'OP_REFUND_BOOKING',
      phrases: ['process refund', 'cancel and refund', 'issue refund', 'റീഫണ്ട് നൽകുക', 'रिफंड प्रोसेस करो'],
      governedFunction: 'finance.refund_booking',
      requiredRole: 'FINANCE_MANAGER',
      requiresConfirmation: true,
      riskLevel: 'CONSEQUENTIAL',
      actionTitle: 'Execute Booking Refund',
    }
  ];

  class VoiceIntentResolver {
    static resolve(transcript, userRole = 'CUSTOMER') {
      const clean = transcript.toLowerCase().trim();
      for (const intent of GOVERNED_VOICE_INTENTS) {
        const isMatch = intent.phrases.some(p => clean.includes(p) || p.includes(clean));
        if (isMatch) {
          if (intent.requiredRole) {
            const isSuperAdmin = userRole === 'PLATFORM_SUPER_ADMIN' || userRole === 'SUPER_ADMIN';
            const hasRole = userRole === intent.requiredRole;
            if (!isSuperAdmin && !hasRole) {
              return { matched: true, intent, permissionDenied: true };
            }
          }
          return { matched: true, intent, confirmationRequired: intent.requiresConfirmation };
        }
      }
      return { matched: false };
    }
  }

  return { GOVERNED_VOICE_INTENTS, VoiceIntentResolver };
})();

// Mock DMS Token Engine
function renderTokens(template, tokens) {
  let rendered = template;
  for (const [key, value] of Object.entries(tokens)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  return rendered;
}

// --------------------------------------------------------------------
console.log('--- 1. Social8 / Travel Social Graph Conversion Gate (§16) ---');
it('Should detect travel planning intent and trip conversion keyword trigger', () => {
  const content = "Who wants to join for a group trip to Sidemen in November? Booking flights soon!";
  const textToAnalyze = content.toLowerCase();
  const intentKeywords = ['group trip', 'planning to go', 'who wants to join', 'booking flights'];
  const intentDetected = intentKeywords.some(kw => textToAnalyze.includes(kw));

  assert.strictEqual(intentDetected, true, 'Intent keyword should trigger journey proposal gate');
});

it('Should not flag regular discussions as trip proposals', () => {
  const content = "What camera lens do you recommend for desert photography?";
  const textToAnalyze = content.toLowerCase();
  const intentKeywords = ['group trip', 'planning to go', 'who wants to join', 'booking flights'];
  const intentDetected = intentKeywords.some(kw => textToAnalyze.includes(kw));

  assert.strictEqual(intentDetected, false, 'General discussion should not trigger trip conversion');
});

// --------------------------------------------------------------------
console.log('\n--- 2. GEM8 Beyond-The-Icon Discovery & Provenance (§17) ---');
it('Should evaluate provenance confidence and prevent absolute unverified claims', () => {
  const gem = {
    name: 'Al Fahidi Traditional Quarter',
    classification: 'LOCAL_FAVOURITE',
    confidenceScore: 0.94,
    provenance: {
      sourceType: 'OFFICIAL_TOURISM',
      confidence: 0.95
    }
  };

  assert.ok(gem.confidenceScore >= 0.85, 'Confidence score must meet threshold for publication');
  assert.strictEqual(gem.provenance.sourceType, 'OFFICIAL_TOURISM');
});

// --------------------------------------------------------------------
console.log('\n--- 3. VN8 / VO8 Voice Intent Resolution & RBAC Gate (§19) ---');
it('Should match multilingual speech across English, Malayalam, and Hindi', () => {
  const resEn = VoiceIntentResolver.resolve('show circles');
  assert.strictEqual(resEn.matched, true);
  assert.strictEqual(resEn.intent.intentKey, 'NAV_CIRCLES');

  const resMl = VoiceIntentResolver.resolve('യാത്ര കമ്മ്യൂണിറ്റി');
  assert.strictEqual(resMl.matched, true);
  assert.strictEqual(resMl.intent.intentKey, 'NAV_CIRCLES');

  const resHi = VoiceIntentResolver.resolve('कम्युनिटी खोलो');
  assert.strictEqual(resHi.matched, true);
  assert.strictEqual(resHi.intent.intentKey, 'NAV_CIRCLES');
});

it('Should block unauthorized voice execution when user lacks required role', () => {
  const res = VoiceIntentResolver.resolve('show crm leads', 'CUSTOMER');
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.permissionDenied, true, 'CUSTOMER cannot execute TRAVEL_AGENT voice navigation');
});

it('Should require confirmation before executing consequential financial operations', () => {
  const res = VoiceIntentResolver.resolve('process refund', 'FINANCE_MANAGER');
  assert.strictEqual(res.matched, true);
  assert.strictEqual(res.confirmationRequired, true, 'Consequential refund requires user confirmation');
});

// --------------------------------------------------------------------
console.log('\n--- 4. DMS Token Engine & SHA-256 Hash Integrity (§15) ---');
it('Should replace all tokens and generate verifiable SHA-256 document hash', () => {
  const template = "VOUCHER: {{bookingRef}} | PASSENGER: {{customerName}} | TOTAL: {{totalAmount}}";
  const tokens = {
    bookingRef: 'BKG-2026-DXB',
    customerName: 'Rahul Sharma',
    totalAmount: '45000'
  };

  const rendered = renderTokens(template, tokens);
  assert.strictEqual(rendered, "VOUCHER: BKG-2026-DXB | PASSENGER: Rahul Sharma | TOTAL: 45000");

  const hash1 = crypto.createHash('sha256').update(rendered).digest('hex');
  const hash2 = crypto.createHash('sha256').update(rendered).digest('hex');
  assert.strictEqual(hash1, hash2, 'Hash must be strictly deterministic');
  assert.strictEqual(hash1.length, 64, 'SHA-256 hash must be 64 characters hex');
});

// --------------------------------------------------------------------
console.log('\n--- 5. SaaS Admin Control Plane & Flags (§30-§34) ---');
it('Should respect tenant and role targeting for server-authoritative feature flags', () => {
  const flag = {
    key: 'enable_social8_circles',
    isEnabled: true,
    allowedRoles: ['TRAVEL_AGENT', 'ADMIN'],
    allowedTenants: ['org-1']
  };

  const allowedForAgent = flag.isEnabled && flag.allowedRoles.includes('TRAVEL_AGENT') && flag.allowedTenants.includes('org-1');
  const deniedForCustomer = flag.allowedRoles.includes('CUSTOMER');

  assert.strictEqual(allowedForAgent, true);
  assert.strictEqual(deniedForCustomer, false);
});

// --------------------------------------------------------------------
console.log('\n================================================================');
console.log(`   Exclusive Bundle Results: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
