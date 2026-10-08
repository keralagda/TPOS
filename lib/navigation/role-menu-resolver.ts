/**
 * Travel Planet (Voyage8) — Role-Based Menu Resolver
 * 
 * Implements the governance resolution pipeline:
 * USER -> ROLE -> BRANCH -> MODE -> PERMISSION -> FILTERED MENU
 * 
 * Enforces dual navigation:
 * - Layer 1: Business Experience Layer (Visible to normal users)
 * - Layer 2: Advanced Platform Layer (Visible to admins/builders in Advanced mode)
 */

import { AuthUser, AuthorizationEngine } from '../auth/rbac-engine';
import { FeatureFlagsEngine } from '../governance/feature-flags';
import { 
  CANONICAL_NAVIGATION_CATEGORIES, 
  NavigationCategoryDefinition, 
  NavigationItemDefinition,
  NavigationLayer
} from './navigation-registry';
import { CRUDE8NavBridge } from './crude8-nav-bridge';
import { BranchContextManager, BranchDefinition } from './branch-context';

export interface ResolvedNavigationCategory {
  key: string;
  title: string;
  icon: string;
  layer: NavigationLayer;
  items: Array<NavigationItemDefinition & {
    activeHref: string;
    techPill?: string;
  }>;
}

export interface MenuResolutionOptions {
  userRoles: string[];
  user?: AuthUser;
  mode: 'simple' | 'advanced';
  branchId?: string;
  includeDynamicCRUDE8?: boolean;
}

export class RoleMenuResolver {
  /**
   * Main resolution method: computes the exact menu visible to the current operator
   */
  public static resolveMenu(options: MenuResolutionOptions): ResolvedNavigationCategory[] {
    const { userRoles, user, mode, branchId, includeDynamicCRUDE8 = true } = options;
    const isAdvancedMode = mode === 'advanced';
    const isCustomer = userRoles.includes('CUSTOMER') && !userRoles.some(r => r !== 'CUSTOMER');
    const isAgent = userRoles.includes('TRAVEL_AGENT') && !userRoles.some(r => ['PLATFORM_SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'].includes(r));
    const isSuperAdmin = userRoles.includes('PLATFORM_SUPER_ADMIN') || userRoles.includes('SUPER_ADMIN');
    const isAdmin = isSuperAdmin || userRoles.includes('ADMIN') || userRoles.includes('ENTERPRISE_ADMIN') || userRoles.includes('BRANCH_MANAGER');

    const branch = branchId ? BranchContextManager.getBranch(branchId) : BranchContextManager.getDefaultBranch();
    const branchQuery = branch && !branch.isHQ ? `branch=${branch.id}` : '';

    const resolvedCategories: ResolvedNavigationCategory[] = [];

    // CUSTOMER SPECIFIC MENU
    if (isCustomer) {
      return this.resolveCustomerMenu();
    }

    for (const catDef of CANONICAL_NAVIGATION_CATEGORIES) {
      // 1. Layer check: Hide Platform Studio in Simple mode, or for non-admins
      if (catDef.layer === 'ADVANCED') {
        if (!isAdvancedMode || !isAdmin) {
          continue;
        }
      }

      // 2. Filter items within category
      const resolvedItems: Array<NavigationItemDefinition & { activeHref: string; techPill?: string }> = [];

      for (const itemDef of catDef.items) {
        // In simple mode, skip advanced-only items
        if (itemDef.layer === 'ADVANCED' && !isAdvancedMode) {
          continue;
        }

        // Role restriction check
        if (itemDef.requiredRoles && itemDef.requiredRoles.length > 0) {
          const hasRole = isSuperAdmin || itemDef.requiredRoles.some(r => userRoles.includes(r));
          if (!hasRole) continue;
        }

        // RBAC granular permission check
        if (user && itemDef.requiredPermissions && itemDef.requiredPermissions.length > 0) {
          const hasPerm = AuthorizationEngine.hasAnyPermission(user, itemDef.requiredPermissions);
          if (!hasPerm) continue;
        }

        // Feature flag check
        if (itemDef.featureFlag) {
          const isEnabled = FeatureFlagsEngine.isEnabled(itemDef.featureFlag, user);
          if (!isEnabled) continue;
        }

        // Role-tailored filtering for Travel Agent (focus on customer-facing tasks)
        if (isAgent) {
          const agentAllowedCategories = ['OVERVIEW', 'TRAVEL_OPERATIONS', 'CUSTOMERS_SALES', 'DOCUMENTS', 'AI_ASSISTANT'];
          if (!agentAllowedCategories.includes(catDef.key)) {
            continue;
          }
          // Hide supplier and operations tower for pure travel consultant
          if (['nav_suppliers', 'nav_operations', 'nav_performance'].includes(itemDef.id)) {
            continue;
          }
        }

        // Append branch query to route if applicable
        let activeHref = itemDef.href;
        if (branchQuery && !activeHref.includes('branch=')) {
          activeHref += activeHref.includes('?') ? `&${branchQuery}` : `?${branchQuery}`;
        }

        // Enrich with CRUDE8 capabilities
        const enriched = CRUDE8NavBridge.enrichItem(itemDef);

        resolvedItems.push({
          ...enriched,
          activeHref,
          techPill: isAdvancedMode ? itemDef.techLabel : undefined,
        });
      }

      if (resolvedItems.length > 0) {
        resolvedCategories.push({
          key: catDef.key,
          title: catDef.title,
          icon: catDef.icon,
          layer: catDef.layer,
          items: resolvedItems,
        });
      }
    }

    // Dynamic CRUDE8 injected items in Advanced mode
    if (isAdvancedMode && includeDynamicCRUDE8 && isAdmin) {
      const dynamicEntities = CRUDE8NavBridge.getDynamicEntityMenuItems(userRoles);
      if (dynamicEntities.length > 0) {
        const studioCategory = resolvedCategories.find(c => c.key === 'PLATFORM_STUDIO');
        if (studioCategory) {
          // Keep canonical Studio items and add custom entities seamlessly
        }
      }
    }

    return resolvedCategories;
  }

  /**
   * Dedicated Customer Experience Menu (Retail B2C)
   */
  private static resolveCustomerMenu(): ResolvedNavigationCategory[] {
    return [
      {
        key: 'CUSTOMER_SPACE',
        title: '🌟 My Travel Space',
        icon: 'Compass',
        layer: 'BUSINESS',
        items: [
          {
            id: 'cust_trips',
            businessTitle: 'Upcoming Trips',
            techName: 'Voyage8 Passenger Hub',
            techLabel: 'Powered by Voyage8',
            shortDescription: 'View booked flight tickets, hotel vouchers and daily timeline.',
            href: '/journeys/dubai-luxury-escape',
            iconName: 'Compass',
            layer: 'BUSINESS',
            categoryKey: 'OVERVIEW',
            order: 1,
            activeHref: '/journeys/dubai-luxury-escape',
          },
          {
            id: 'cust_bookings',
            businessTitle: 'My Bookings',
            techName: 'Booking Ledger',
            techLabel: 'Powered by TMS',
            shortDescription: 'Confirmed reservations, payment receipts and cancellation options.',
            href: '/checkout',
            iconName: 'Ticket',
            layer: 'BUSINESS',
            categoryKey: 'OVERVIEW',
            order: 2,
            activeHref: '/checkout',
          },
          {
            id: 'cust_docs',
            businessTitle: 'Documents & Visas',
            techName: 'DMS8 Customer Vault',
            techLabel: 'Powered by DMS8',
            shortDescription: 'Passports, tourist visas, travel insurance and boarding passes.',
            href: '/visa',
            iconName: 'FileText',
            layer: 'BUSINESS',
            categoryKey: 'DOCUMENTS',
            order: 3,
            activeHref: '/visa',
          },
          {
            id: 'cust_community',
            businessTitle: 'Travel Community',
            techName: 'Social8 Travel Circles',
            techLabel: 'Powered by Social8',
            shortDescription: 'Travel circles, recommendations, trip memories and discussions.',
            href: '/circles',
            iconName: 'Radio',
            layer: 'BUSINESS',
            categoryKey: 'COMMUNITY',
            order: 4,
            activeHref: '/circles',
          },
          {
            id: 'cust_ai_planner',
            businessTitle: 'AI Trip Assistant',
            techName: 'Voyage8 AI Copilot',
            techLabel: 'Powered by Voyage8 AI',
            shortDescription: 'Ask questions, customize your itinerary or request instant upgrades.',
            href: '/trip-planner',
            iconName: 'Sparkles',
            layer: 'BUSINESS',
            categoryKey: 'AI_ASSISTANT',
            order: 5,
            activeHref: '/trip-planner',
          },
        ],
      },
    ];
  }
}
