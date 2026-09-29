/**
 * Travel Planet (Voyage8) — Development Test Credentials & Tenant Fixtures
 * 
 * Complies with Section 11 & 12 of RBAC Specification:
 * - 17 role-specific test accounts with @test.travelplanet.local
 * - Seed password derived from TEST_SEED_PASSWORD environment variable
 * - Multi-tenant organization and workspace fixtures
 * - Strict production guard: NEVER seeds into production
 */

import crypto from 'crypto';
import { AuthUser } from './rbac-engine';

export interface TestUserAccount extends AuthUser {
  passwordHash: string;
  seedPasswordCleartext?: string; // Displayed ONLY during local development seed execution
}

export interface TestTenantFixture {
  id: string;
  name: string;
  type: string;
  workspaces: Array<{ id: string; name: string; slug: string }>;
}

export class TestFixturesManager {
  /**
   * Safe check: Throws error if attempted in production
   */
  public static assertNonProduction(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SECURITY VIOLATION: Test credential seeding is strictly forbidden in production environment!');
    }
  }

  /**
   * Retrieve development test password
   */
  public static getSeedPassword(): string {
    this.assertNonProduction();
    return process.env.TEST_SEED_PASSWORD || 'Voyage8@DevTest2026';
  }

  /**
   * Simple SHA-256 hash with salt for local development fixtures
   */
  public static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(`tp_salt_${password}`).digest('hex');
  }

  /**
   * 4 Test Organizations & Workspaces
   */
  public static getOrganizations(): TestTenantFixture[] {
    return [
      {
        id: 'org_tp_hq',
        name: 'Travel Planet HQ',
        type: 'PLATFORM_OPERATOR',
        workspaces: [
          { id: 'ws_hq_main', name: 'HQ Executive Workspace', slug: 'hq-main' },
        ],
      },
      {
        id: 'org_tp_operations',
        name: 'Travel Planet Operations',
        type: 'OPERATOR',
        workspaces: [
          { id: 'ws_operations', name: 'Operations Dispatch Workspace', slug: 'operations-dispatch' },
        ],
      },
      {
        id: 'org_demo_agency',
        name: 'Demo Travel Agency (Apex Voyages)',
        type: 'AGENCY',
        workspaces: [
          { id: 'ws_agency', name: 'Agency Front Desk', slug: 'agency-desk' },
        ],
      },
      {
        id: 'org_demo_vendor',
        name: 'Demo Vendor (Bali Luxury DMC)',
        type: 'VENDOR',
        workspaces: [
          { id: 'ws_vendor', name: 'Vendor Portal Workspace', slug: 'vendor-portal' },
        ],
      },
    ];
  }

  /**
   * 17 Role-Specific Test Accounts
   */
  public static getTestAccounts(): TestUserAccount[] {
    this.assertNonProduction();
    const seedPw = this.getSeedPassword();
    const pwHash = this.hashPassword(seedPw);

    return [
      // 1. Platform Super Admin (Amal Babu)
      {
        id: 'usr_super_admin',
        email: 'superadmin@test.travelplanet.local',
        fullName: 'Amal Babu (Super Admin)',
        organizationId: 'org_tp_hq',
        workspaceId: 'ws_hq_main',
        roles: ['PLATFORM_SUPER_ADMIN'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 2. Organization Admin
      {
        id: 'usr_admin',
        email: 'admin@test.travelplanet.local',
        fullName: 'Tara Mehta (Org Admin)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['ADMIN'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 3. Operations Manager
      {
        id: 'usr_operations',
        email: 'operations@test.travelplanet.local',
        fullName: 'Karan Verma (Ops Manager)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['OPERATIONS_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 4. Travel Agent
      {
        id: 'usr_agent_priya',
        email: 'agent@test.travelplanet.local',
        fullName: 'Priya Nair (Senior Consultant)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['TRAVEL_AGENT'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 5. Sales Manager
      {
        id: 'usr_sales',
        email: 'sales@test.travelplanet.local',
        fullName: 'Vikram Sethi (Sales Lead)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['SALES_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 6. CRM Manager
      {
        id: 'usr_crm',
        email: 'crm@test.travelplanet.local',
        fullName: 'Ananya Rao (CRM Head)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['CRM_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 7. Finance Manager
      {
        id: 'usr_finance',
        email: 'finance@test.travelplanet.local',
        fullName: 'Suresh Menon (Treasury Head)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['FINANCE_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 8. Accountant
      {
        id: 'usr_accountant',
        email: 'accountant@test.travelplanet.local',
        fullName: 'Sunita Joshi (Senior Accountant)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['ACCOUNTANT'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 9. Supplier Manager
      {
        id: 'usr_supplier',
        email: 'supplier@test.travelplanet.local',
        fullName: 'Rohan Gupta (Contracting Head)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['SUPPLIER_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 10. Vendor Admin (Tenant: Demo Vendor)
      {
        id: 'usr_vendor_admin',
        email: 'vendoradmin@test.travelplanet.local',
        fullName: 'Wayan Sudarta (Bali DMC Admin)',
        organizationId: 'org_demo_vendor',
        workspaceId: 'ws_vendor',
        vendorId: 'vnd_bali_luxury',
        roles: ['VENDOR_ADMIN'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 11. Vendor Operator (Tenant: Demo Vendor)
      {
        id: 'usr_vendor_operator',
        email: 'vendoroperator@test.travelplanet.local',
        fullName: 'Ketut Astawa (Bali DMC Operator)',
        organizationId: 'org_demo_vendor',
        workspaceId: 'ws_vendor',
        vendorId: 'vnd_bali_luxury',
        roles: ['VENDOR_OPERATOR'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 12. Customer Support
      {
        id: 'usr_support',
        email: 'support@test.travelplanet.local',
        fullName: 'Deepak Patel (Support Specialist)',
        organizationId: 'org_tp_operations',
        workspaceId: 'ws_operations',
        roles: ['CUSTOMER_SUPPORT'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 13. Content Manager
      {
        id: 'usr_content',
        email: 'content@test.travelplanet.local',
        fullName: 'Meera Sen (Editorial Lead)',
        organizationId: 'org_tp_hq',
        workspaceId: 'ws_hq_main',
        roles: ['CONTENT_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 14. Marketing Manager
      {
        id: 'usr_marketing',
        email: 'marketing@test.travelplanet.local',
        fullName: 'Aditya Roy (Growth Head)',
        organizationId: 'org_tp_hq',
        workspaceId: 'ws_hq_main',
        roles: ['MARKETING_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 15. Integration Manager
      {
        id: 'usr_integration',
        email: 'integration@test.travelplanet.local',
        fullName: 'Neha Kapoor (GDS Integration Engineer)',
        organizationId: 'org_tp_hq',
        workspaceId: 'ws_hq_main',
        roles: ['INTEGRATION_MANAGER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 16. AI Operator
      {
        id: 'usr_ai_operator',
        email: 'ai@test.travelplanet.local',
        fullName: 'Dr. Kabir Das (AI Cognitive Architect)',
        organizationId: 'org_tp_hq',
        workspaceId: 'ws_hq_main',
        roles: ['AI_OPERATOR'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 17. Analyst
      {
        id: 'usr_analyst',
        email: 'analyst@test.travelplanet.local',
        fullName: 'Aakash Singhal (BI Analyst)',
        organizationId: 'org_tp_hq',
        workspaceId: 'ws_hq_main',
        roles: ['ANALYST'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 18. Customer (B2C Traveler)
      {
        id: 'usr_customer_rahul',
        email: 'customer@test.travelplanet.local',
        fullName: 'Rahul Sharma (Traveler)',
        roles: ['CUSTOMER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },

      // 19. Partner Agency Agent (Tenant: Demo Agency)
      {
        id: 'usr_partner_agent',
        email: 'agent@apexvoyages.test.local',
        fullName: 'Siddharth Roy (Apex Agency Desk)',
        organizationId: 'org_demo_agency',
        workspaceId: 'ws_agency',
        roles: ['PARTNER'],
        passwordHash: pwHash,
        seedPasswordCleartext: seedPw,
      },
    ];
  }
}
