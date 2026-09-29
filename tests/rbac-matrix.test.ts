/**
 * Travel Planet (Voyage8) — Comprehensive RBAC Matrix Automated Test Suite
 * 
 * TypeScript specification integrating directly with lib/auth modules
 */

import { SYSTEM_ROLES } from '../lib/auth/roles';
import { AuthorizationEngine, AuthUser } from '../lib/auth/rbac-engine';
import { TestFixturesManager } from '../lib/auth/test-fixtures';
import { RbacAuditLogger } from '../lib/auth/audit';

export class RbacMatrixTestRunner {
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

    // 1. Roles count
    test('19 standard system roles registered', () => {
      if (Object.keys(SYSTEM_ROLES).length !== 19) throw new Error('Expected 19 system roles');
    });

    // 2. Super admin wildcard
    test('Platform Super Admin has universal wildcard access', () => {
      const superAdmin: AuthUser = {
        id: 'usr_super_admin',
        email: 'admin@travelplanet.local',
        fullName: 'Super Admin',
        roles: ['PLATFORM_SUPER_ADMIN'],
      };
      if (!AuthorizationEngine.hasPermission(superAdmin, 'arbitrary.permission.name')) {
        throw new Error('Super admin should have wildcard access');
      }
      if (AuthorizationEngine.getDataScope(superAdmin) !== 'GLOBAL') {
        throw new Error('Super admin should have GLOBAL data scope');
      }
    });

    // 3. Finance Manager boundaries
    test('Finance Manager has payment rights but cannot delete users', () => {
      const financeUser: AuthUser = {
        id: 'usr_fin',
        email: 'finance@travelplanet.local',
        fullName: 'Finance Lead',
        roles: ['FINANCE_MANAGER'],
      };
      if (!AuthorizationEngine.hasPermission(financeUser, 'finance.view')) throw new Error('Finance view expected');
      if (!AuthorizationEngine.hasPermission(financeUser, 'payments.verify')) throw new Error('Payments verify expected');
      if (AuthorizationEngine.hasPermission(financeUser, 'users.delete')) throw new Error('Finance user must not delete users');
    });

    return { passed, failed, total: passed + failed };
  }
}
