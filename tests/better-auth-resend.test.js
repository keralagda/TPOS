/**
 * Travel Planet (Voyage8) — Better-Auth + Resend API Master Automated Test Suite
 * 
 * Verifies:
 * 1. Resend Email Provider initialization, API connectivity, and safe error handling
 * 2. Branded Travel Planet email templates (verification, password reset, welcome, security alert)
 * 3. Better-Auth emailAndPassword & emailVerification hook integration
 * 4. Travel Planet Auth Bridge (session, user mapping, tenant context, branch context)
 * 5. Multi-tenant boundary isolation & RBAC authorization enforcement
 * 6. Security audit logging with automatic credential & token redaction
 */

const assert = require('assert');

// Load environment variables for standalone test execution
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Ignore if already loaded
  }
}

// 1. Module imports
const {
  ResendEmailProvider,
  emailService,
} = require('../lib/email/resend');
const {
  renderVerificationEmail,
  renderPasswordResetEmail,
  renderWelcomeEmail,
  renderSecurityAlertEmail,
  renderEmailChangedEmail,
} = require('../lib/email/templates');
const {
  auth,
  toAuthUser,
  normalizeRoles,
} = require('../lib/auth/better-auth');
const {
  TravelPlanetAuthBridge,
  requirePermission,
  requireTenantAccess,
} = require('../lib/auth/bridge');
const {
  AuthAuditLogger,
  sanitizeAuditMetadata,
} = require('../lib/auth/auth-audit');

console.log('====================================================');
console.log('TRAVEL PLANET — BETTER-AUTH + RESEND TEST SUITE');
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
  console.log('Section 1: Resend Email Provider & Configuration');

  runTest('ResendEmailProvider initializes with RESEND_API_KEY', () => {
    assert.ok(emailService, 'emailService singleton must exist');
    assert.strictEqual(typeof emailService.sendEmail, 'function');
    assert.strictEqual(typeof emailService.sendVerificationEmail, 'function');
    assert.strictEqual(typeof emailService.sendPasswordResetEmail, 'function');
    assert.strictEqual(typeof emailService.sendWelcomeEmail, 'function');
    assert.strictEqual(typeof emailService.sendSecurityEmail, 'function');
  });

  await runAsyncTest('ResendEmailProvider sends or mock-delivers transactional email without leaking secrets', async () => {
    const result = await emailService.sendEmail({
      to: 'delivered@test.travelplanet.local',
      subject: 'Travel Planet Test Delivery',
      html: '<p>Testing Resend Provider</p>',
    });

    assert.ok(typeof result.success === 'boolean', 'Result must return boolean success status');
    assert.strictEqual(result.recipient, 'delivered@test.travelplanet.local');
    assert.strictEqual(result.subject, 'Travel Planet Test Delivery');

    // Never leak API keys or internal tokens in result error strings
    if (result.error) {
      assert.ok(!result.error.includes('re_'), 'Error message must not leak Resend API key');
    }
  });

  await runAsyncTest('ResendEmailProvider delivers real branded verification email to verified account recipient', async () => {
    const result = await emailService.sendVerificationEmail({
      name: 'Travel Planet Admin',
      email: 'travelplanetkpba@gmail.com',
      verificationUrl: 'https://travelplanet.tours/verify-email?token=test_live_verify_token_789',
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.messageId, 'Must return a real Resend messageId');
    assert.strictEqual(result.provider, 'resend');
  });

  console.log('\nSection 2: Travel Planet Branded Email Templates');

  runTest('Verification Email template contains required variables and security notices', () => {
    const verificationUrl = 'https://travelplanet.tours/verify-email?token=sec_verify_token_123';
    const email = renderVerificationEmail({
      name: 'Amal Babu',
      email: 'amal@travelplanet.tours',
      verificationUrl,
    });

    assert.strictEqual(email.subject, 'Verify your email address — Travel Planet');
    assert.ok(email.html.includes('Verify Email Address'));
    assert.ok(email.html.includes(verificationUrl));
    assert.ok(email.html.includes('expire in 24 hours'));
    assert.ok(email.text.includes(verificationUrl));
  });

  runTest('Password Reset Email template contains 1-hour expiry and reset link', () => {
    const resetUrl = 'https://travelplanet.tours/reset-password?token=sec_reset_token_456';
    const email = renderPasswordResetEmail({
      name: 'Sarah Jenkins',
      email: 'sarah@domain.com',
      resetUrl,
    });

    assert.strictEqual(email.subject, 'Reset your password — Travel Planet');
    assert.ok(email.html.includes('Reset Password'));
    assert.ok(email.html.includes(resetUrl));
    assert.ok(email.html.includes('expires in 1 hour'));
    assert.ok(email.text.includes(resetUrl));
  });

  runTest('Welcome Email template contains Travel Space & Digital Vault features', () => {
    const email = renderWelcomeEmail({
      name: 'David Miller',
      email: 'david@domain.com',
      loginUrl: 'https://travelplanet.tours/login',
    });

    assert.ok(email.subject.includes('Welcome to Travel Planet'));
    assert.ok(email.html.includes('My Travel Space'));
    assert.ok(email.html.includes('Digital Document Vault'));
    assert.ok(email.html.includes('AI Travel Assistant'));
  });

  runTest('Security Alert Email template renders event details and IP metadata', () => {
    const email = renderSecurityAlertEmail({
      name: 'Priya Nair',
      email: 'priya@travelplanet.tours',
      alertType: 'NEW_LOGIN',
      ipAddress: '103.21.124.5',
      userAgent: 'Chrome on macOS',
    });

    assert.ok(email.subject.includes('Security Alert: New login detected'));
    assert.ok(email.html.includes('103.21.124.5'));
    assert.ok(email.html.includes('Chrome on macOS'));
  });

  console.log('\nSection 3: Better-Auth Server Engine & Email Hooks');

  runTest('Better-Auth is configured with emailAndPassword and emailVerification', () => {
    assert.ok(auth.options.emailAndPassword, 'emailAndPassword must be enabled');
    assert.strictEqual(auth.options.emailAndPassword.enabled, true);
    assert.strictEqual(typeof auth.options.emailAndPassword.sendResetPassword, 'function');

    assert.ok(auth.options.emailVerification, 'emailVerification must be configured');
    assert.strictEqual(typeof auth.options.emailVerification.sendVerificationEmail, 'function');
  });

  runTest('Better-Auth databaseHooks are configured for user identity synchronization', () => {
    assert.ok(auth.options.databaseHooks, 'databaseHooks must be configured');
    assert.ok(auth.options.databaseHooks.user, 'user databaseHooks must exist');
    assert.strictEqual(typeof auth.options.databaseHooks.user.create.after, 'function');
  });

  console.log('\nSection 4: Travel Planet Auth Bridge & Tenant Context');

  runTest('TravelPlanetAuthBridge resolves trusted TenantContext with SaaS plane entitlements', async () => {
    const user = toAuthUser({
      id: 'usr_hq_admin',
      email: 'admin@travelplanet.tours',
      fullName: 'HQ Admin',
      role: 'ADMIN',
      organizationId: 'org_tp_hq',
    });

    const tenant = await TravelPlanetAuthBridge.getTenantContext(user);
    assert.strictEqual(tenant.organizationId, 'org_tp_hq');
    assert.strictEqual(tenant.status, 'ACTIVE');
    assert.ok(Array.isArray(tenant.entitlements));
    assert.ok(Array.isArray(tenant.packs));
  });

  runTest('TravelPlanetAuthBridge resolves trusted BranchContext across Kochi, Dubai, Delhi', () => {
    const user = toAuthUser({
      id: 'usr_agent_karan',
      email: 'karan@travelplanet.tours',
      role: 'TRAVEL_AGENT',
      organizationId: 'org_tp_hq',
    });

    const kochiBranch = TravelPlanetAuthBridge.getBranchContext(user, 'kochi');
    assert.strictEqual(kochiBranch.branchCode, 'kochi');
    assert.strictEqual(kochiBranch.currency, 'INR');

    const dubaiBranch = TravelPlanetAuthBridge.getBranchContext(user, 'dubai');
    assert.strictEqual(dubaiBranch.branchCode, 'dubai');
    assert.strictEqual(dubaiBranch.currency, 'AED');

    const delhiBranch = TravelPlanetAuthBridge.getBranchContext(user, 'delhi');
    assert.strictEqual(delhiBranch.branchCode, 'delhi');
    assert.strictEqual(delhiBranch.currency, 'INR');
  });

  console.log('\nSection 5: Tenant Isolation & RBAC Protection');

  runTest('requireTenantAccess allows matching tenant and Platform Super Admin', () => {
    const superAdmin = toAuthUser({
      id: 'usr_super',
      email: 'super@tp.com',
      role: 'PLATFORM_SUPER_ADMIN',
      organizationId: 'org_tp_hq',
    });

    // Super admin can access any tenant
    assert.doesNotThrow(() => {
      requireTenantAccess(superAdmin, 'org_partner_dubai');
    });

    const orgUser = toAuthUser({
      id: 'usr_org_1',
      email: 'org@tp.com',
      role: 'ADMIN',
      organizationId: 'org_tp_hq',
    });

    // Allowed for own org
    assert.doesNotThrow(() => {
      requireTenantAccess(orgUser, 'org_tp_hq');
    });

    // Blocked for cross-tenant access
    assert.throws(() => {
      requireTenantAccess(orgUser, 'org_partner_dubai');
    }, /Tenant isolation breach/);
  });

  runTest('requirePermission enforces RBAC and throws 403 on insufficient privilege', () => {
    const customer = toAuthUser({
      id: 'usr_cust_1',
      email: 'cust@domain.com',
      role: 'CUSTOMER',
    });

    // Customer has bookings.view
    assert.doesNotThrow(() => {
      requirePermission(customer, 'bookings.view');
    });

    // Customer lacks users.delete
    assert.throws(() => {
      requirePermission(customer, 'users.delete');
    }, /Forbidden:.*lacks required permission/i);
  });

  console.log('\nSection 6: Security Audit Logging & Redaction');

  runTest('AuthAuditLogger redacts passwords, tokens, and secrets from audit entries', () => {
    const rawMetadata = {
      email: 'user@travelplanet.tours',
      password: 'SuperSecretPassword123!',
      sessionToken: 'sec_tok_xyz890',
      apiKey: 're_secret_resend_key',
      browser: 'Chrome 128',
    };

    const sanitized = sanitizeAuditMetadata(rawMetadata);
    assert.strictEqual(sanitized.email, 'user@travelplanet.tours');
    assert.strictEqual(sanitized.password, '[REDACTED]');
    assert.strictEqual(sanitized.sessionToken, '[REDACTED]');
    assert.strictEqual(sanitized.apiKey, '[REDACTED]');
    assert.strictEqual(sanitized.browser, 'Chrome 128');

    const entry = AuthAuditLogger.log({
      action: 'LOGIN',
      result: 'SUCCESS',
      authUserId: 'usr_test_auth_id',
      metadata: rawMetadata,
    });

    assert.strictEqual(entry.action, 'LOGIN');
    assert.strictEqual(entry.metadata.password, '[REDACTED]');
    assert.strictEqual(entry.metadata.sessionToken, '[REDACTED]');
    assert.ok(entry.timestamp);
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
