/**
 * Travel Planet (Voyage8) — Branch Context & Regional Office Isolation
 * 
 * Provides branch-aware operational context for menus, data scopes, and dashboards.
 * USER -> ROLE -> BRANCH -> MODE -> PERMISSION -> MENU
 */

export interface BranchDefinition {
  id: string;
  code: string;
  name: string;
  location: string;
  country: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
  isHQ: boolean;
  contactEmail: string;
  activeAgentsCount: number;
  monthlyRevenueTarget: string;
}

export const CANONICAL_BRANCHES: BranchDefinition[] = [
  {
    id: 'org_tp_hq',
    code: 'HQ_GLOBAL',
    name: 'HQ • Global Operations',
    location: 'Cochin Tech Tower, Kochi & Dubai',
    country: 'Global',
    currency: 'INR',
    currencySymbol: '₹',
    timeZone: 'Asia/Kolkata',
    isHQ: true,
    contactEmail: 'hq@travelplanet.in',
    activeAgentsCount: 42,
    monthlyRevenueTarget: '₹5,00,00,000',
  },
  {
    id: 'br_kochi',
    code: 'BRANCH_KOCHI',
    name: 'Kochi Branch Desk',
    location: 'MG Road, Kochi, Kerala',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    timeZone: 'Asia/Kolkata',
    isHQ: false,
    contactEmail: 'kochi@travelplanet.in',
    activeAgentsCount: 14,
    monthlyRevenueTarget: '₹1,50,00,000',
  },
  {
    id: 'br_dubai',
    code: 'BRANCH_DUBAI',
    name: 'Dubai Regional Office',
    location: 'Business Bay, Dubai',
    country: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'AED ',
    timeZone: 'Asia/Dubai',
    isHQ: false,
    contactEmail: 'dubai@travelplanet.ae',
    activeAgentsCount: 12,
    monthlyRevenueTarget: 'AED 800,000',
  },
  {
    id: 'br_tvm',
    code: 'BRANCH_TVM',
    name: 'Trivandrum South Hub',
    location: 'Vellayambalam, Trivandrum, Kerala',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    timeZone: 'Asia/Kolkata',
    isHQ: false,
    contactEmail: 'tvm@travelplanet.in',
    activeAgentsCount: 8,
    monthlyRevenueTarget: '₹80,00,000',
  },
  {
    id: 'br_sin',
    code: 'BRANCH_SINGAPORE',
    name: 'Singapore Desk',
    location: 'Marina Bay Financial Centre, Singapore',
    country: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    timeZone: 'Asia/Singapore',
    isHQ: false,
    contactEmail: 'singapore@travelplanet.sg',
    activeAgentsCount: 5,
    monthlyRevenueTarget: 'S$ 250,000',
  },
];

export class BranchContextManager {
  private static branches = new Map<string, BranchDefinition>();

  static {
    for (const b of CANONICAL_BRANCHES) {
      this.branches.set(b.id, b);
      this.branches.set(b.code, b);
      this.branches.set(b.name.toLowerCase(), b);
    }
  }

  public static getAllBranches(): BranchDefinition[] {
    return CANONICAL_BRANCHES;
  }

  public static getBranch(identifier: string): BranchDefinition | undefined {
    return this.branches.get(identifier) || this.branches.get(identifier.toLowerCase());
  }

  public static getDefaultBranch(): BranchDefinition {
    return CANONICAL_BRANCHES[0];
  }

  /**
   * Filter branches allowed for a specific user role:
   * Super Admins / Enterprise Admins can view all branches.
   * Branch Managers / Travel Agents can view their assigned branch (or assigned group).
   */
  public static getAllowedBranches(userRoles: string[], assignedBranchId?: string): BranchDefinition[] {
    if (
      userRoles.includes('PLATFORM_SUPER_ADMIN') || 
      userRoles.includes('SUPER_ADMIN') || 
      userRoles.includes('ADMIN') ||
      userRoles.includes('ENTERPRISE_ADMIN')
    ) {
      return CANONICAL_BRANCHES;
    }

    if (assignedBranchId) {
      const match = this.getBranch(assignedBranchId);
      if (match) return [match];
    }

    return [CANONICAL_BRANCHES[1]]; // Defaults to Kochi Branch Desk
  }

  /**
   * Resolve branch from natural language command (e.g. "Switch Kochi branch", "Go to Dubai office")
   */
  public static matchBranchFromQuery(query: string): BranchDefinition | null {
    const q = query.toLowerCase();
    for (const branch of CANONICAL_BRANCHES) {
      if (
        q.includes(branch.code.toLowerCase()) ||
        q.includes(branch.name.toLowerCase()) ||
        q.includes(branch.location.toLowerCase()) ||
        q.includes(branch.country.toLowerCase())
      ) {
        return branch;
      }
      // Check partial names
      if (q.includes('kochi') && branch.id === 'br_kochi') return branch;
      if (q.includes('dubai') && branch.id === 'br_dubai') return branch;
      if (q.includes('trivandrum') || q.includes('tvm') && branch.id === 'br_tvm') return branch;
      if (q.includes('singapore') && branch.id === 'br_sin') return branch;
      if ((q.includes('hq') || q.includes('global') || q.includes('headquarters')) && branch.id === 'org_tp_hq') return branch;
    }
    return null;
  }
}
