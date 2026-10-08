/**
 * Travel Planet OS — AI Navigation & Natural Intent Resolver
 * Translates conversational user goals into instant routing, branch switches, and actions.
 */

import { AINavigationResolution } from './types';
import { BRANCH_REGISTRY } from './branches';

interface IntentRule {
  keywords: string[];
  module: string;
  targetUrl: string;
  intent: string;
  entity?: string;
  action?: string;
  branchSwitch?: string;
  confirmation: (match: string) => string;
}

const INTENT_RULES: IntentRule[] = [
  // 1. Branch Context Switching
  {
    keywords: ['switch kochi branch', 'kochi branch', 'switch to kochi', 'kochi office'],
    module: 'Branch Management',
    targetUrl: '/admin/dashboard',
    intent: 'Switch Active Branch Context to Kochi',
    branchSwitch: 'branch_kochi',
    confirmation: () => 'Switched active workspace branch to Kochi Branch (Kerala).',
  },
  {
    keywords: ['switch dubai branch', 'dubai branch', 'switch to dubai', 'dubai office'],
    module: 'Branch Management',
    targetUrl: '/admin/dashboard',
    intent: 'Switch Active Branch Context to Dubai',
    branchSwitch: 'branch_dubai',
    confirmation: () => 'Switched active workspace branch to Dubai Branch (UAE).',
  },
  {
    keywords: ['switch delhi branch', 'delhi branch', 'switch to delhi'],
    module: 'Branch Management',
    targetUrl: '/admin/dashboard',
    intent: 'Switch Active Branch Context to Delhi',
    branchSwitch: 'branch_delhi',
    confirmation: () => 'Switched active workspace branch to Delhi NCR Branch.',
  },
  {
    keywords: ['global hq', 'switch hq', 'headquarters', 'all branches'],
    module: 'Branch Management',
    targetUrl: '/admin/dashboard',
    intent: 'Switch Active Branch Context to Global HQ',
    branchSwitch: 'global_hq',
    confirmation: () => 'Switched active workspace to Global Headquarters (All Branches).',
  },

  // 2. Bookings
  {
    keywords: ["show today's bookings", "today's bookings", 'todays bookings', 'show bookings', 'open bookings', 'dubai booking', 'recent bookings'],
    module: 'Bookings',
    targetUrl: '/operations/control-tower',
    intent: "View Today's Bookings and Flight PNRs",
    entity: 'Booking',
    action: 'VIEW_BOOKINGS',
    confirmation: () => 'Navigating to Operations Control Tower & Bookings Radar.',
  },

  // 3. Packages & Itineraries
  {
    keywords: ['create kerala package', 'kerala package', 'new package', 'package builder', 'munnar packages', 'create package'],
    module: 'Packages',
    targetUrl: '/packages',
    intent: 'Open Package Builder & Living Journeys',
    entity: 'TravelPackage',
    action: 'CREATE_PACKAGE',
    confirmation: () => 'Opening Package Builder to craft your holiday package.',
  },

  // 4. SEO & Growth
  {
    keywords: ['improve my website seo', 'improve website seo', 'seo growth', 'seo', 'search rankings', 'keywords', 'google visibility'],
    module: 'SEO Growth',
    targetUrl: '/admin/seo',
    intent: 'Open SEO Growth & AEO Dashboard',
    entity: 'SEO',
    action: 'OPTIMIZE_SEO',
    confirmation: () => 'Opening SEO Growth powered by HESTIA8.',
  },

  // 5. Website Builder
  {
    keywords: ['build website', 'website builder', 'landing page', 'edit pages', 'vibe cms'],
    module: 'Website Builder',
    targetUrl: '/admin/builder',
    intent: 'Open Visual Website Builder',
    entity: 'Page',
    action: 'BUILD_PAGE',
    confirmation: () => 'Opening Website Builder powered by VIBE8.',
  },

  // 6. Documents & Visas
  {
    keywords: ['pending visa documents', 'visa documents', 'customer documents', 'passports', 'documents', 'dms vault'],
    module: 'Documents',
    targetUrl: '/admin/dms',
    intent: 'Access Customer Documents & Visa Records',
    entity: 'Document',
    action: 'VERIFY_DOCUMENTS',
    confirmation: () => 'Navigating to Customer Documents Vault powered by DMS8.',
  },

  // 7. Customers & Leads
  {
    keywords: ['customer rahul', 'rahul', 'find customer', 'customers', 'leads', 'new enquiry'],
    module: 'Customers & Sales',
    targetUrl: '/crm/leads',
    intent: 'Search Customer Directory and Leads',
    entity: 'Customer',
    action: 'SEARCH_CUSTOMER',
    confirmation: (match) => `Searching customer records for "${match}". Navigating to Customer 360.`,
  },

  // 8. Finance & Invoices
  {
    keywords: ['invoices', 'gst reports', 'payments', 'show finance reports', 'bank reconciliation'],
    module: 'Finance',
    targetUrl: '/finance/reconciliation',
    intent: 'Review Financial Ledgers & Tax Reports',
    entity: 'Invoice',
    action: 'VIEW_FINANCE',
    confirmation: () => 'Opening Financial Ledgers, Bank Reconciliation & GST reports.',
  },

  // 9. Developer / Advanced Studio
  {
    keywords: ['crude8 studio', 'registry manager', 'developer tools', 'feature flags', 'operation modes'],
    module: 'Platform Studio',
    targetUrl: '/admin/crude8/studio',
    intent: 'Launch Advanced Platform Studio',
    entity: 'Registry',
    action: 'CONFIGURE_PLATFORM',
    confirmation: () => 'Accessing Advanced Platform Studio & Developer Tools.',
  },
];

/**
 * Resolves natural language user query into actionable navigation intent.
 */
export function resolveAINavigation(userInput: string): AINavigationResolution {
  const normalized = userInput.trim().toLowerCase();

  for (const rule of INTENT_RULES) {
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        return {
          understoodIntent: rule.intent,
          resolvedEntity: rule.entity,
          resolvedModule: rule.module,
          resolvedAction: rule.action,
          targetUrl: rule.targetUrl,
          branchSwitch: rule.branchSwitch,
          confirmationText: rule.confirmation(userInput),
          suggestedFollowUps: getFollowUpsForModule(rule.module),
        };
      }
    }
  }

  // Fallback intelligent resolution
  return {
    understoodIntent: `Search Travel Planet for "${userInput}"`,
    resolvedModule: 'Global Search',
    targetUrl: `/crm/leads?q=${encodeURIComponent(userInput)}`,
    confirmationText: `Searching across all records and modules for "${userInput}".`,
    suggestedFollowUps: ['Show today\'s bookings', 'Create Kerala package', 'Improve my website SEO'],
  };
}

function getFollowUpsForModule(module: string): string[] {
  switch (module) {
    case 'Bookings':
      return ['Export departures today', 'View flight PNR alerts', 'Open customer support desk'];
    case 'Packages':
      return ['Create Kerala package', 'Synthesize AI itinerary', 'Publish package to marketplace'];
    case 'SEO Growth':
      return ['Audit Core Web Vitals', 'Analyze competitor keywords', 'Generate schema JSON-LD'];
    case 'Branch Management':
      return ['View branch sales targets', 'Inspect branch agent roster', 'Switch Dubai branch'];
    default:
      return ["Show today's bookings", 'Improve my website SEO', 'Switch Kochi branch'];
  }
}
