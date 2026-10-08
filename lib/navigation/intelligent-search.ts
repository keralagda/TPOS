/**
 * Travel Planet OS — Global Intelligent Search
 * Resolves free-form user search queries into:
 * Entity, Module, Action, Permission, URL.
 */

import { IntelligentSearchResult } from './types';

interface SearchIndexEntry {
  title: string;
  subtitle: string;
  url: string;
  entity?: string;
  module: string;
  action?: string;
  permission?: string;
  keywords: string[];
  category: 'NAVIGATION' | 'RECORD' | 'ACTION' | 'AI_PROMPT';
}

const SEARCH_CATALOG: SearchIndexEntry[] = [
  // Specific requested examples:
  {
    title: 'Dubai Booking Records & Flight PNRs',
    subtitle: 'Operations Control Tower • 42 Confirmed departures to DXB',
    url: '/operations/control-tower?destination=dubai',
    entity: 'Booking',
    module: 'Bookings',
    action: 'VIEW_BOOKINGS',
    permission: 'bookings.view',
    keywords: ['dubai booking', 'dubai bookings', 'dubai', 'dxb', 'flight dubai'],
    category: 'RECORD',
  },
  {
    title: 'Munnar Tea Hills & Wilderness Packages',
    subtitle: 'Holiday Packages • 4D3N Kerala Highlands curated package',
    url: '/packages?q=munnar',
    entity: 'TravelPackage',
    module: 'Packages',
    action: 'VIEW_PACKAGES',
    permission: 'inventory.view',
    keywords: ['munnar packages', 'munnar package', 'munnar', 'kerala munnar', 'hill station'],
    category: 'RECORD',
  },
  {
    title: 'Pending Visa & Passport Verification',
    subtitle: 'DMS8 Vault • 12 UAE & Schengen visa grants awaiting inspection',
    url: '/admin/dms?filter=pending-visas',
    entity: 'Document',
    module: 'Documents',
    action: 'VERIFY_VISA',
    permission: 'trips.manage',
    keywords: ['pending visa documents', 'pending visa', 'visa documents', 'passports', 'visas'],
    category: 'RECORD',
  },
  {
    title: 'Customer Rahul Sharma (VIP Traveler)',
    subtitle: 'Customer 360 • 4 Completed Trips (Dubai, Paris, Bali) • Loyalty Gold',
    url: '/crm/leads?search=Rahul',
    entity: 'Customer',
    module: 'Customers & Sales',
    action: 'VIEW_CUSTOMER',
    permission: 'customers.view',
    keywords: ['customer rahul', 'rahul sharma', 'rahul', 'vip rahul'],
    category: 'RECORD',
  },

  // Navigation Items
  {
    title: 'Website Builder',
    subtitle: 'Create and manage travel websites • Powered by VIBE8',
    url: '/admin/builder',
    entity: 'Page',
    module: 'Website & Marketing',
    action: 'BUILD_WEBSITE',
    permission: 'vibe.create',
    keywords: ['website builder', 'vibe cms', 'builder', 'pages', 'landing page'],
    category: 'NAVIGATION',
  },
  {
    title: 'SEO Growth & AEO Optimization',
    subtitle: 'Google rankings, citations & structured data • Powered by HESTIA8',
    url: '/admin/seo',
    entity: 'SEO',
    module: 'SEO & Growth',
    action: 'OPTIMIZE_SEO',
    permission: 'content.view',
    keywords: ['seo growth', 'hestia8', 'seo', 'keywords', 'google rank', 'search'],
    category: 'NAVIGATION',
  },
  {
    title: 'Quotations Desk',
    subtitle: 'Generate instant travel quotations and PDF proposals',
    url: '/crm/quotes',
    entity: 'Quote',
    module: 'Customers & Sales',
    action: 'CREATE_QUOTE',
    permission: 'bookings.create',
    keywords: ['quote', 'quotations', 'pricing', 'estimate', 'proposal'],
    category: 'NAVIGATION',
  },
  {
    title: 'Finance & Bank Reconciliation',
    subtitle: 'Cash inflows, TCS 20% statutory ledger, and GST reconciliation',
    url: '/finance/reconciliation',
    entity: 'Ledger',
    module: 'Finance',
    action: 'VIEW_FINANCE',
    permission: 'finance.view',
    keywords: ['finance', 'bank reconciliation', 'tcs', 'gst', 'invoices', 'payments'],
    category: 'NAVIGATION',
  },
  {
    title: 'CRUDE8 Business Builder Studio',
    subtitle: 'Define custom entities, visual schemas, and sync rules',
    url: '/admin/crude8/studio',
    entity: 'Registry',
    module: 'Platform Studio',
    action: 'BUILD_ENTITY',
    permission: 'settings.manage',
    keywords: ['crude8 studio', 'business builder', 'custom entities', 'workflow builder'],
    category: 'NAVIGATION',
  },
];

/**
 * Searches the catalog and returns matches with resolved entity, module, action, and permission.
 */
export function executeIntelligentSearch(query: string): IntelligentSearchResult[] {
  if (!query || !query.trim()) return [];

  const normalized = query.trim().toLowerCase();
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const scoredResults = SEARCH_CATALOG.map((entry) => {
    let score = 0;

    // Direct phrase match in keywords
    if (entry.keywords.some((kw) => kw === normalized)) {
      score += 100;
    } else if (entry.keywords.some((kw) => kw.includes(normalized) || normalized.includes(kw))) {
      score += 60;
    }

    // Title / subtitle matches
    if (entry.title.toLowerCase().includes(normalized)) score += 40;
    if (entry.subtitle.toLowerCase().includes(normalized)) score += 20;

    // Token overlaps
    for (const token of tokens) {
      if (entry.keywords.some((kw) => kw.includes(token))) score += 15;
      if (entry.title.toLowerCase().includes(token)) score += 10;
    }

    return {
      entry,
      score,
    };
  });

  const sorted = scoredResults
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return sorted.map(({ entry, score }) => ({
    query,
    title: entry.title,
    subtitle: entry.subtitle,
    url: entry.url,
    entity: entry.entity,
    module: entry.module,
    action: entry.action,
    permission: entry.permission,
    confidence: Math.min(100, score),
    category: entry.category,
  }));
}
