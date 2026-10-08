/**
 * Travel Planet OS — Business Alias Layer (§Naming Transformation)
 * Translates technical engine names into user goal-based business terminology.
 * Preserves H8 engine power via "Powered by [Tech]" labels in Advanced mode.
 */

export interface SystemAlias {
  techTerm: string;
  businessTitle: string;
  description: string;
  poweredBy: string;
  userGoal: string;
  category: 'OPERATIONS' | 'GROWTH' | 'DOCUMENTS' | 'CUSTOM' | 'COMMUNITY' | 'INTELLIGENCE' | 'GOVERNANCE';
}

export const BUSINESS_ALIASES: Record<string, SystemAlias> = {
  Voyage8: {
    techTerm: 'Voyage8',
    businessTitle: 'Trips & Journeys',
    description: 'Design dynamic itineraries, live passenger journeys, and multi-day packages.',
    poweredBy: 'Powered by Voyage8 Kernel',
    userGoal: 'Manage customer journeys and travel bookings',
    category: 'OPERATIONS',
  },
  'VIBE8 CMS': {
    techTerm: 'VIBE8 CMS',
    businessTitle: 'Website Builder',
    description: 'Create and manage travel websites, landing pages, and interactive showcase portals.',
    poweredBy: 'Powered by VIBE8',
    userGoal: 'Build high-converting destination pages and storefronts',
    category: 'GROWTH',
  },
  HESTIA8: {
    techTerm: 'HESTIA8',
    businessTitle: 'SEO Growth',
    description: 'Improve Google visibility, semantic entities, and content performance.',
    poweredBy: 'Powered by HESTIA8',
    userGoal: 'Boost organic search rankings and AI discoverability',
    category: 'GROWTH',
  },
  CRUDE8: {
    techTerm: 'CRUDE8',
    businessTitle: 'Business Builder',
    description: 'Create business workflows, custom data models, and automated logic.',
    poweredBy: 'Powered by CRUDE8',
    userGoal: 'Automate business processes and define customized entities',
    category: 'CUSTOM',
  },
  DMS8: {
    techTerm: 'DMS8',
    businessTitle: 'Documents',
    description: 'Manage travel files, visa records, passenger passports, and approvals.',
    poweredBy: 'Powered by DMS8',
    userGoal: 'Store and verify customer travel documentation',
    category: 'DOCUMENTS',
  },
  Social8: {
    techTerm: 'Social8',
    businessTitle: 'Travel Community',
    description: 'Engage travel circles, traveler discussions, authentic reviews, and shared stories.',
    poweredBy: 'Powered by Social8',
    userGoal: 'Connect travelers and collect verified social proof',
    category: 'COMMUNITY',
  },
  GEM8: {
    techTerm: 'GEM8',
    businessTitle: 'Places Discovery',
    description: 'Curate hidden gems, destination guides, verified attractions, and local tips.',
    poweredBy: 'Powered by GEM8',
    userGoal: 'Help travelers discover unique experiences',
    category: 'COMMUNITY',
  },
  'AI Agents': {
    techTerm: 'AI Agents',
    businessTitle: 'AI Assistants',
    description: 'Deploy 24/7 intelligent assistants for sales, quotation synthesis, and operations.',
    poweredBy: 'Powered by TravelAI Multi-Agent Fleet',
    userGoal: 'Scale sales and customer operations effortlessly',
    category: 'INTELLIGENCE',
  },
  Branch8: {
    techTerm: 'Branch8',
    businessTitle: 'Branch Management',
    description: 'Manage physical branches, local agent desks, regional currencies, and tax rules.',
    poweredBy: 'Powered by Branch8 Multi-Tenancy',
    userGoal: 'Oversee regional branch performance and teams',
    category: 'GOVERNANCE',
  },
  Registry: {
    techTerm: 'Registry',
    businessTitle: 'Configuration Center',
    description: 'Centralized authority for platform schemas, system settings, and policies.',
    poweredBy: 'Powered by H8 Architecture Registry',
    userGoal: 'Configure company-wide rules and default parameters',
    category: 'GOVERNANCE',
  },
  'Feature Flags': {
    techTerm: 'Feature Flags',
    businessTitle: 'Feature Management',
    description: 'Safely enable new capabilities, release rollouts, and customize module access.',
    poweredBy: 'Powered by Flags8 Control',
    userGoal: 'Enable or disable features for specific branches or roles',
    category: 'GOVERNANCE',
  },
  'Operation Modes': {
    techTerm: 'Operation Modes',
    businessTitle: 'Workspace Modes',
    description: 'Switch between production, maintenance, scheduled rollovers, and sandbox testing.',
    poweredBy: 'Powered by OpModes8 Runtime',
    userGoal: 'Maintain operational stability during upgrades',
    category: 'GOVERNANCE',
  },
};

/**
 * Given a technical term or business name, return the business title.
 */
export function getBusinessTitle(techOrBusinessName: string): string {
  const match = BUSINESS_ALIASES[techOrBusinessName];
  if (match) return match.businessTitle;

  // Search by techTerm case-insensitively
  const found = Object.values(BUSINESS_ALIASES).find(
    (a) => a.techTerm.toLowerCase() === techOrBusinessName.toLowerCase()
  );
  if (found) return found.businessTitle;

  return techOrBusinessName;
}

/**
 * Return module metadata for rendering cards (User Title + Short Description + Tech Label)
 */
export function getModuleCardInfo(key: string): SystemAlias {
  if (BUSINESS_ALIASES[key]) {
    return BUSINESS_ALIASES[key];
  }
  // Lookup by business title
  const found = Object.values(BUSINESS_ALIASES).find(
    (a) => a.businessTitle.toLowerCase() === key.toLowerCase()
  );
  if (found) return found;

  return {
    techTerm: key,
    businessTitle: key,
    description: `Manage and optimize ${key.toLowerCase()} for your travel agency.`,
    poweredBy: `Powered by H8 Engine`,
    userGoal: `Perform tasks in ${key}`,
    category: 'CUSTOM',
  };
}
