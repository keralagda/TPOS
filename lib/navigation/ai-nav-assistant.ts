/**
 * Travel Planet (Voyage8) — AI Navigation Assistant & Natural Language Resolver
 * 
 * Resolves natural language user inquiries to target modules, entities, quick actions,
 * or branch context switches.
 * 
 * Examples:
 * "Show today's bookings" -> Bookings Dashboard (/operations/dashboard)
 * "Create Kerala package" -> Package Builder (/admin/builder)
 * "Improve my website SEO" -> SEO Growth (/admin/seo)
 * "Switch Kochi branch"   -> Branch Context Switch (br_kochi)
 * "Dubai booking"         -> Entity: BOOKING, Module: Travel Operations
 * "Pending visa documents"-> Entity: DOCUMENT, Module: Documents Vault
 * "Customer Rahul"        -> Entity: CUSTOMER, Module: Customers & Sales
 */

import { BranchContextManager, BranchDefinition } from './branch-context';
import { UniversalSearchEngine, SearchResultItem } from '../search/universal-search';
import { AuthUser } from '../auth/rbac-engine';

export type ResolutionType = 'NAVIGATE' | 'ACTION' | 'BRANCH_SWITCH' | 'ENTITY_SEARCH';

export interface AINavResolution {
  type: ResolutionType;
  query: string;
  matched: boolean;
  targetRoute?: string;
  targetModule: string;
  businessTitle: string;
  techLabel: string;
  actionTitle: string;
  explanation: string;
  permissionRequired?: string;
  entityType?: string;
  entityId?: string;
  branch?: BranchDefinition;
  entityResults?: SearchResultItem[];
}

export class AINavigationAssistant {
  private static readonly INTENT_RULES = [
    // 1. "Show today's bookings" / "view bookings"
    {
      keywords: ['today booking', "today's booking", 'show booking', 'view bookings', 'booking list', 'bookings today'],
      type: 'NAVIGATE' as ResolutionType,
      targetRoute: '/operations/dashboard',
      targetModule: 'Travel Operations',
      businessTitle: 'Bookings Dashboard',
      techLabel: 'Powered by Voyage8 TMS',
      actionTitle: 'Open Bookings Dashboard',
      explanation: "Viewing today's traveler departures, PNR statuses and voucher queues.",
      permissionRequired: 'bookings.view',
      entityType: 'BOOKING',
    },
    // 2. "Create Kerala package" / "new package" / "package builder"
    {
      keywords: ['create package', 'kerala package', 'package builder', 'new package', 'build package', 'holiday package'],
      type: 'ACTION' as ResolutionType,
      targetRoute: '/admin/builder?action=new_package',
      targetModule: 'Website & Operations',
      businessTitle: 'Package Builder',
      techLabel: 'Powered by VIBE8 Builder',
      actionTitle: 'Launch Package Builder',
      explanation: 'Opening the interactive itinerary and holiday package creator.',
      permissionRequired: 'content.create',
      entityType: 'PACKAGE',
    },
    // 3. "Improve my website SEO" / "seo growth" / "search ranking"
    {
      keywords: ['improve seo', 'website seo', 'seo growth', 'improve ranking', 'google search', 'keywords'],
      type: 'NAVIGATE' as ResolutionType,
      targetRoute: '/admin/seo',
      targetModule: 'SEO & Growth',
      businessTitle: 'SEO Growth Hub',
      techLabel: 'Powered by HESTIA8',
      actionTitle: 'Navigate to SEO Growth',
      explanation: 'Opening HESTIA8 AI-driven keyword audit, content agent and schema compiler.',
      permissionRequired: 'content.view',
      entityType: 'SEO',
    },
    // 4. "Pending visa documents" / "customer documents" / "upload passport"
    {
      keywords: ['visa documents', 'pending visa', 'customer documents', 'passport', 'upload doc', 'travel documents'],
      type: 'NAVIGATE' as ResolutionType,
      targetRoute: '/admin/dms?filter=pending_visa',
      targetModule: 'Documents',
      businessTitle: 'Documents Vault',
      techLabel: 'Powered by DMS8',
      actionTitle: 'Open Document Approvals',
      explanation: 'Opening customer visa vault, passport verifications and pending approvals.',
      permissionRequired: 'content.view',
      entityType: 'DOCUMENT',
    },
    // 5. "Create customer" / "new enquiry" / "leads"
    {
      keywords: ['new customer', 'create customer', 'add client', 'add customer'],
      type: 'ACTION' as ResolutionType,
      targetRoute: '/crm/customers?action=create',
      targetModule: 'Customers & Sales',
      businessTitle: 'Customer 360',
      techLabel: 'Powered by CRUDE8 CRM',
      actionTitle: 'Create New Customer Profile',
      explanation: 'Initiating new traveler onboarding and passport vault capture.',
      permissionRequired: 'customers.create',
      entityType: 'CUSTOMER',
    },
    // 6. "New trip" / "synthesize itinerary"
    {
      keywords: ['new trip', 'create trip', 'plan trip', 'itinerary', 'journey'],
      type: 'ACTION' as ResolutionType,
      targetRoute: '/admin/journey-studio?action=create',
      targetModule: 'Travel Operations',
      businessTitle: 'Trips & Journeys',
      techLabel: 'Powered by Voyage8 Itinerary Hub',
      actionTitle: 'Create New Trip',
      explanation: 'Opening multi-destination journey synthesizer and day planner.',
      permissionRequired: 'trips.manage',
      entityType: 'TRIP',
    },
    // 7. "Generate quote" / "new quotation"
    {
      keywords: ['quote', 'quotation', 'generate quote', 'pricing estimate'],
      type: 'ACTION' as ResolutionType,
      targetRoute: '/crm/quotes?action=create',
      targetModule: 'Customers & Sales',
      businessTitle: 'Quotations',
      techLabel: 'Powered by Quote8',
      actionTitle: 'Generate Customer Quotation',
      explanation: 'Initiating multi-item quotation with GST/TCS tax calculations.',
      permissionRequired: 'bookings.create',
      entityType: 'QUOTE',
    },
    // 8. "Customer Rahul" or specific customer lookup
    {
      keywords: ['customer rahul', 'rahul', 'client rahul'],
      type: 'ENTITY_SEARCH' as ResolutionType,
      targetRoute: '/crm/customers?search=Rahul',
      targetModule: 'Customers & Sales',
      businessTitle: 'Customer Directory',
      techLabel: 'Powered by CRUDE8 CRM',
      actionTitle: 'View Rahul (VIP Customer)',
      explanation: 'Located customer Rahul Verma (ID: usr_rahul) with 3 past journeys.',
      permissionRequired: 'customers.view',
      entityType: 'CUSTOMER',
      entityId: 'usr_rahul',
    },
    // 9. "Dubai booking"
    {
      keywords: ['dubai booking', 'dubai reservation', 'dubai trip booking'],
      type: 'ENTITY_SEARCH' as ResolutionType,
      targetRoute: '/operations/dashboard?search=Dubai',
      targetModule: 'Travel Operations',
      businessTitle: 'Bookings',
      techLabel: 'Powered by Voyage8 TMS',
      actionTitle: 'Open Dubai Booking #TP-9082',
      explanation: 'Resolved Booking #TP-9082: Dubai Highlights for Amal Babu.',
      permissionRequired: 'bookings.view',
      entityType: 'BOOKING',
      entityId: 'TP-9082',
    },
    // 10. "Munnar packages"
    {
      keywords: ['munnar packages', 'munnar package', 'munnar tour'],
      type: 'ENTITY_SEARCH' as ResolutionType,
      targetRoute: '/destinations/munnar',
      targetModule: 'Travel Operations',
      businessTitle: 'Packages & Places',
      techLabel: 'Powered by GEM8 & VIBE8',
      actionTitle: 'Explore Munnar Tea Highlands Package',
      explanation: 'Resolved Munnar Package (4D/3N) with Top Station hidden gem excursion.',
      permissionRequired: 'content.view',
      entityType: 'PACKAGE',
      entityId: 'pkg_munnar',
    },
  ];

  /**
   * Resolve user natural language query to navigation / action / branch switch
   */
  public static resolve(query: string, user?: AuthUser): AINavResolution {
    const raw = query.trim();
    const q = raw.toLowerCase();

    if (!q) {
      return {
        type: 'NAVIGATE',
        query: raw,
        matched: false,
        targetModule: 'Overview',
        businessTitle: 'Business Dashboard',
        techLabel: 'Powered by Voyage8',
        actionTitle: 'No Query Provided',
        explanation: 'Please enter a goal or task to navigate.',
      };
    }

    // 1. Check for Branch Switching ("Switch Kochi branch", "Dubai office", etc.)
    const branchMatch = BranchContextManager.matchBranchFromQuery(q);
    if (branchMatch && (q.includes('switch') || q.includes('branch') || q.includes('office') || q.includes('change'))) {
      return {
        type: 'BRANCH_SWITCH',
        query: raw,
        matched: true,
        targetRoute: `/admin/dashboard?branch=${branchMatch.id}`,
        targetModule: 'Settings',
        businessTitle: 'Branch Management',
        techLabel: 'Powered by Branch8',
        actionTitle: `Switch to ${branchMatch.name}`,
        explanation: `Switched operational context to ${branchMatch.name} (${branchMatch.location}, ${branchMatch.currency}).`,
        branch: branchMatch,
      };
    }

    // 2. Check Intent Rules
    for (const rule of this.INTENT_RULES) {
      if (rule.keywords.some(k => q.includes(k))) {
        return {
          type: rule.type,
          query: raw,
          matched: true,
          targetRoute: rule.targetRoute,
          targetModule: rule.targetModule,
          businessTitle: rule.businessTitle,
          techLabel: rule.techLabel,
          actionTitle: rule.actionTitle,
          explanation: rule.explanation,
          permissionRequired: rule.permissionRequired,
          entityType: rule.entityType,
          entityId: (rule as any).entityId,
        };
      }
    }

    // 3. Fallback to Universal Search Engine for Entity Cross-Reference
    const defaultUser: AuthUser = user || {
      id: 'usr_guest',
      email: 'user@travelplanet.in',
      fullName: 'Active User',
      roles: ['ADMIN'],
    };

    const entityResults = UniversalSearchEngine.search(raw, defaultUser);
    if (entityResults.length > 0) {
      const top = entityResults[0];
      return {
        type: 'ENTITY_SEARCH',
        query: raw,
        matched: true,
        targetRoute: top.url,
        targetModule: top.entityType,
        businessTitle: top.title,
        techLabel: `Powered by Voyage8 ${top.entityType}`,
        actionTitle: `Open ${top.title}`,
        explanation: `${top.subtitle} (${top.badge || 'RECORD'})`,
        permissionRequired: top.requiredPermission,
        entityType: top.entityType,
        entityId: top.id,
        entityResults,
      };
    }

    // 4. Default intelligent fallback: Search directory
    return {
      type: 'NAVIGATE',
      query: raw,
      matched: false,
      targetRoute: `/admin/dashboard?search=${encodeURIComponent(raw)}`,
      targetModule: 'Search',
      businessTitle: 'Global Search',
      techLabel: 'Universal Search Hub',
      actionTitle: `Search for "${raw}"`,
      explanation: `No exact intent matched. Searching all travel entities for "${raw}".`,
    };
  }
}
