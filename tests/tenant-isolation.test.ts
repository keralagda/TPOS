/**
 * Travel Planet (Voyage8) — Multi-Tenant Isolation & Boundary Security Test Suite
 * 
 * TypeScript specification integrating directly with lib/auth modules
 */

import { ScopeEvaluator, ResourceScopeTarget } from '../lib/auth/scopes';
import { AuthorizationEngine, AuthUser } from '../lib/auth/rbac-engine';

export class TenantIsolationTestRunner {
  public static run(): { passed: number; failed: number; total: number } {
    let passed = 0;
    let failed = 0;

    const test = (name: string, fn: () => void) => {
      try {
        fn();
        passed++;
      } catch (err: unknown) {
        failed++;
        console.error(`[FAIL] ${name}:`, err);
      }
    };

    const hqUser: AuthUser = {
      id: 'usr_hq',
      email: 'admin@hq.local',
      fullName: 'HQ Admin',
      organizationId: 'org_tp_hq',
      workspaceId: 'ws_hq_main',
      roles: ['ADMIN'],
    };

    const partnerUser: AuthUser = {
      id: 'usr_partner',
      email: 'admin@apex.local',
      fullName: 'Apex Admin',
      organizationId: 'org_apex_voyages',
      workspaceId: 'ws_apex_main',
      roles: ['PARTNER'],
    };

    test('HQ user cannot access Apex partner resource', () => {
      const partnerBooking: ResourceScopeTarget = {
        organizationId: 'org_apex_voyages',
        workspaceId: 'ws_apex_main',
      };
      const allowed = AuthorizationEngine.canAccessResource(hqUser, partnerBooking);
      if (allowed) throw new Error('HQ user must not access Apex partner resources');
    });

    test('Partner user cannot access HQ resource', () => {
      const hqBooking: ResourceScopeTarget = {
        organizationId: 'org_tp_hq',
        workspaceId: 'ws_hq_main',
      };
      const allowed = AuthorizationEngine.canAccessResource(partnerUser, hqBooking);
      if (allowed) throw new Error('Partner must not access HQ resources');
    });

    return { passed, failed, total: passed + failed };
  }
}
