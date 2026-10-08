/**
 * Travel Planet (Voyage8) — Business Alias Layer
 * 
 * Provides bi-directional mapping between Heuris8 internal technical framework names
 * and user goal-based business experience nomenclature.
 * 
 * Principle:
 * User thinks in tasks.
 * Not frameworks, engines, registries, or system terms.
 */

export interface AliasMapping {
  techTerm: string;
  businessTerm: string;
  category: string;
  techLabel: string;
  description: string;
  userGoal: string;
}

export const CANONICAL_NAMING_TRANSFORMATION: AliasMapping[] = [
  {
    techTerm: 'Voyage8',
    businessTerm: 'Trips & Journeys',
    category: 'Travel Operations',
    techLabel: 'Powered by Voyage8',
    description: 'Create and manage dynamic traveler itineraries and day-by-day journeys.',
    userGoal: 'Manage Trips & Itineraries',
  },
  {
    techTerm: 'VIBE8 CMS',
    businessTerm: 'Website Builder',
    category: 'Website & Marketing',
    techLabel: 'Powered by VIBE8',
    description: 'Create and manage travel websites and landing pages.',
    userGoal: 'Build & Update Travel Websites',
  },
  {
    techTerm: 'HESTIA8',
    businessTerm: 'SEO Growth',
    category: 'SEO & Growth',
    techLabel: 'Powered by HESTIA8',
    description: 'Improve Google visibility, organic ranking and content performance.',
    userGoal: 'Grow Website Traffic & Rankings',
  },
  {
    techTerm: 'CRUDE8',
    businessTerm: 'Business Builder',
    category: 'Command & Architecture',
    techLabel: 'Powered by CRUDE8',
    description: 'Create custom business data models, forms and operational tools.',
    userGoal: 'Build Custom Business Workflows',
  },
  {
    techTerm: 'DMS8',
    businessTerm: 'Documents',
    category: 'Documents & Vault',
    techLabel: 'Powered by DMS8',
    description: 'Manage travel files, vouchers, passports, contracts and approvals.',
    userGoal: 'Manage Traveler Files & Approvals',
  },
  {
    techTerm: 'Social8',
    businessTerm: 'Travel Community',
    category: 'Community',
    techLabel: 'Powered by Social8',
    description: 'Connect travelers, group circles and customer discussions.',
    userGoal: 'Engage Travel Circles & Groups',
  },
  {
    techTerm: 'GEM8',
    businessTerm: 'Places Discovery',
    category: 'Community & Content',
    techLabel: 'Powered by GEM8',
    description: 'Curate hidden viewpoints, offbeat attractions and local secrets.',
    userGoal: 'Discover Offbeat Locations',
  },
  {
    techTerm: 'AI Agents',
    businessTerm: 'AI Assistants',
    category: 'AI Assistant',
    techLabel: 'Powered by Voyage8 AI',
    description: 'Autonomous copilot assistants for sales, content and fulfillment.',
    userGoal: 'Automate Tasks with AI',
  },
  {
    techTerm: 'Branch8',
    businessTerm: 'Branch Management',
    category: 'Settings',
    techLabel: 'Powered by Branch8',
    description: 'Multi-office branch isolation, quota oversight and regional desks.',
    userGoal: 'Manage Regional Offices & Desks',
  },
  {
    techTerm: 'Registry',
    businessTerm: 'Configuration Center',
    category: 'Platform Architecture',
    techLabel: 'Powered by Registry Pack',
    description: 'System specifications, canonical data structures and governance rules.',
    userGoal: 'Inspect System Configurations',
  },
  {
    techTerm: 'Feature Flags',
    businessTerm: 'Feature Management',
    category: 'Platform Control',
    techLabel: 'Powered by Control Plane',
    description: 'Toggle and roll out platform capabilities across roles and branches.',
    userGoal: 'Enable or Disable System Features',
  },
  {
    techTerm: 'Operation Modes',
    businessTerm: 'Workspace Modes',
    category: 'Platform Governance',
    techLabel: 'Powered by Mode Transition Engine',
    description: 'Switch between simple, advanced, peak season and maintenance modes.',
    userGoal: 'Switch Workspace Operational State',
  },
];

export class BusinessAliasLayer {
  private static techToBusiness = new Map<string, AliasMapping>();
  private static businessToTech = new Map<string, AliasMapping>();

  static {
    for (const mapping of CANONICAL_NAMING_TRANSFORMATION) {
      this.techToBusiness.set(mapping.techTerm.toLowerCase(), mapping);
      this.businessToTech.set(mapping.businessTerm.toLowerCase(), mapping);
    }
  }

  /**
   * Convert technical framework term to friendly business task title
   */
  public static toBusiness(techTerm: string): string {
    const found = this.techToBusiness.get(techTerm.toLowerCase());
    return found ? found.businessTerm : techTerm;
  }

  /**
   * Convert friendly business task title back to canonical framework term
   */
  public static toTech(businessTerm: string): string {
    const found = this.businessToTech.get(businessTerm.toLowerCase());
    return found ? found.techTerm : businessTerm;
  }

  /**
   * Get complete mapping metadata
   */
  public static getMapping(term: string): AliasMapping | undefined {
    const lower = term.toLowerCase();
    return this.techToBusiness.get(lower) || this.businessToTech.get(lower);
  }

  /**
   * Get standard "Powered by <Engine>" badge for progressive disclosure
   */
  public static getTechLabel(term: string): string {
    const mapping = this.getMapping(term);
    return mapping ? mapping.techLabel : `Powered by ${term}`;
  }

  /**
   * Format display label based on user experience mode:
   * Simple mode -> "Website Builder"
   * Advanced mode -> "Website Builder (Powered by VIBE8)" or returns label pill
   */
  public static formatItemTitle(businessTitle: string, techName: string, mode: 'simple' | 'advanced'): {
    primaryTitle: string;
    techPill?: string;
  } {
    if (mode === 'simple') {
      return { primaryTitle: businessTitle };
    }
    return {
      primaryTitle: businessTitle,
      techPill: techName,
    };
  }
}
