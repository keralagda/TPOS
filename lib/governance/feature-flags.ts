/**
 * Travel Planet (Voyage8) — Multi-Scope Feature Flag Governance Engine
 * 
 * Evaluates feature activation across 4 hierarchical scopes:
 * GLOBAL -> ORGANIZATION -> WORKSPACE -> ROLE
 */

import { AuthUser } from '../auth/rbac-engine';

export interface FeatureFlagRule {
  key: string;
  name: string;
  description: string;
  enabledGlobally: boolean;
  allowedOrganizations?: string[];
  allowedWorkspaces?: string[];
  allowedRoles?: string[];
}

export class FeatureFlagsEngine {
  private static flags: Map<string, FeatureFlagRule> = new Map([
    ['new_dashboards', { key: 'new_dashboards', name: 'Composable Dashboard OS', description: 'Enable 16 role-specific workspace dashboards', enabledGlobally: true }],
    ['new_booking_engine', { key: 'new_booking_engine', name: 'Voyage8 Unified Booking Runtime', description: 'Multi-item flight + hotel + transfer booking engine', enabledGlobally: true }],
    ['connectors_ndc', { key: 'connectors_ndc', name: 'Direct Airline NDC Connectors', description: 'Bypass legacy GDS and connect directly to carrier APIs', enabledGlobally: true }],
    ['ai_copilot_assistant', { key: 'ai_copilot_assistant', name: 'Voyage8 AI Copilot & Assist', description: 'Natural language trip synthesis and operational assistance', enabledGlobally: true }],
    ['b2b2c_partner_portal', { key: 'b2b2c_partner_portal', name: 'B2B2C Partner Wallet & White-labeling', description: 'Deposit wallet drawdown and dynamic markups for agencies', enabledGlobally: true }],
    ['corporate_travel_approvals', { key: 'corporate_travel_approvals', name: 'Corporate Business Travel Hub', description: 'Employee travel policy compliance and GST invoice consolidation', enabledGlobally: true, allowedRoles: ['PLATFORM_SUPER_ADMIN', 'ADMIN'] }],
    ['supplier_marketplace', { key: 'supplier_marketplace', name: 'Direct Supplier Bidding Marketplace', description: 'Direct contracting for local destination DMCs and resorts', enabledGlobally: true }],
    ['experimental_features', { key: 'experimental_features', name: 'Experimental FinTech Alpha', description: 'Automated credit lines and forward currency hedging', enabledGlobally: false, allowedOrganizations: ['org_tp_hq'] }],
  ]);

  /**
   * Evaluate whether a feature is active for the given context
   */
  public static isEnabled(key: string, user?: AuthUser): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;

    // Platform Super Admin bypasses restrictions for preview
    if (user?.roles?.includes('PLATFORM_SUPER_ADMIN')) {
      return true;
    }

    // Organization specific override
    if (user?.organizationId && flag.allowedOrganizations) {
      if (flag.allowedOrganizations.includes(user.organizationId)) return true;
    }

    // Role specific override
    if (user?.roles && flag.allowedRoles) {
      if (flag.allowedRoles.some(r => user.roles.includes(r))) return true;
    }

    // Workspace specific override
    if (user?.workspaceId && flag.allowedWorkspaces) {
      if (flag.allowedWorkspaces.includes(user.workspaceId)) return true;
    }

    return flag.enabledGlobally;
  }

  public static getAllFlags(): FeatureFlagRule[] {
    return Array.from(this.flags.values());
  }
}
