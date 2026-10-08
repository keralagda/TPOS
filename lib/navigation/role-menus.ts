/**
 * Travel Planet OS — Role & Context Navigation Resolver
 * 
 * RESOLUTION PIPELINE:
 * USER -> ROLE -> BRANCH -> MODE -> PERMISSION -> MENU
 */

import {
  NavigationSection,
  NavigationItem,
  ExperienceMode,
  UserRole,
  BranchDefinition
} from './types';
import {
  ADMIN_NAVIGATION_SECTIONS,
  PLATFORM_STUDIO_SECTION,
  SIMPLE_MODE_ITEMS
} from './registry';
import { getBranchById } from './branches';
import { generateDynamicCrude8MenuItems } from './crude8-adapter';

export interface ResolveNavigationOptions {
  role?: string;
  branchId?: string;
  mode?: ExperienceMode;
  userPermissions?: string[];
}

export interface ResolvedNavigationState {
  role: UserRole;
  branch: BranchDefinition;
  mode: ExperienceMode;
  sections: NavigationSection[];
  activeItemsCount: number;
}

/**
 * Resolves the appropriate navigation structure based on Role, Branch, Experience Mode, and Permissions.
 */
export function resolveNavigation(options: ResolveNavigationOptions = {}): ResolvedNavigationState {
  const role = (options.role as UserRole) || 'PLATFORM_SUPER_ADMIN';
  const branch = getBranchById(options.branchId || 'global_hq');
  const mode: ExperienceMode = options.mode || (role === 'TRAVEL_AGENT' || role === 'CUSTOMER' ? 'simple' : 'advanced');
  const permissions = options.userPermissions || ['*'];
  const hasWildcard = permissions.includes('*');

  // 1. CUSTOMER PORTAL NAVIGATION (CUSTOMER / CORPORATE_TRAVELER)
  if (role === 'CUSTOMER' || role === 'CORPORATE_TRAVELER') {
    const customerSections: NavigationSection[] = [
      {
        id: 'cust-my-travel',
        title: 'My Travel',
        icon: 'Compass',
        description: 'What is happening with my travel?',
        items: [
          { id: 'cust-trips', label: 'My Trips', href: '/account/trips', icon: 'Compass', badge: 'Active' },
          { id: 'cust-bookings', label: 'Bookings', href: '/operations/control-tower', icon: 'CheckSquare' },
          { id: 'cust-saved', label: 'Saved Trips', href: '/packages', icon: 'Star' },
          { id: 'cust-quotes', label: 'Quotes & Proposals', href: '/crm/quotes', icon: 'Calculator' },
          { id: 'cust-enquiries', label: 'My Enquiries', href: '/account/dashboard#enquiries', icon: 'PhoneCall' },
        ],
      },
      {
        id: 'cust-discover',
        title: 'Discover',
        icon: 'Globe',
        description: 'Explore destinations, hotels and holidays',
        items: [
          { id: 'cust-dest', label: 'Destinations', href: '/destinations', icon: 'MapPin' },
          { id: 'cust-exp', label: 'Experiences', href: '/experiences', icon: 'Sparkles' },
          { id: 'cust-hotels', label: 'Hotels & Resorts', href: '/hotels', icon: 'Building2' },
          { id: 'cust-packages', label: 'Packages', href: '/packages', icon: 'Package' },
          { id: 'cust-places', label: 'Hidden Gems', href: '/places', icon: 'MapPin', badge: 'Gems' },
        ],
      },
      {
        id: 'cust-profile8',
        title: 'My Profile & Vault',
        icon: 'User',
        description: 'PROFILE8 Digital Passport',
        items: [
          { id: 'cust-passport', label: 'Digital Passport', href: '/account/dashboard#profile8', icon: 'Shield', badge: 'Verified' },
          { id: 'cust-docs', label: 'My Documents', href: '/admin/dms', icon: 'FileText' },
          { id: 'cust-payments', label: 'Payments & Receipts', href: '/finance/dashboard', icon: 'CreditCard' },
          { id: 'cust-compliance', label: 'Traveler Approvals', href: '/admin/compliance', icon: 'ShieldCheck' },
        ],
      },
      {
        id: 'cust-community',
        title: 'Community & Stories',
        icon: 'Radio',
        description: 'Social8 Travel Community',
        items: [
          { id: 'cust-circles', label: 'Travel Circles', href: '/circles', icon: 'Radio' },
          { id: 'cust-stories', label: 'Travel Stories', href: '/diaries', icon: 'Image' },
        ],
      },
    ];

    return {
      role,
      branch,
      mode: 'simple',
      sections: customerSections,
      activeItemsCount: customerSections.reduce((acc, s) => acc + s.items.length, 0),
    };
  }

  // 2. VENDOR PORTAL NAVIGATION (VENDOR_ADMIN / VENDOR_MANAGER / VENDOR_OPERATOR / VENDOR_FINANCE / VENDOR_CONTENT / DMC_USER / HOTEL_USER / TRANSPORT_OPERATOR / EXPERIENCE_PROVIDER)
  const isVendorRole =
    role.startsWith('VENDOR_') ||
    role === 'DMC_USER' ||
    role === 'HOTEL_USER' ||
    role === 'TRANSPORT_OPERATOR' ||
    role === 'EXPERIENCE_PROVIDER';

  if (isVendorRole) {
    const vendorSections: NavigationSection[] = [
      {
        id: 'vendor-business',
        title: 'Business & Products',
        icon: 'Briefcase',
        description: 'Products, catalog, and vendor profile',
        items: [
          { id: 'v-products', label: 'Products & Rooms', href: '/partner/dashboard#products', icon: 'Package', badge: 'Catalog' },
          { id: 'v-packages', label: 'Supplier Packages', href: '/workspace/tms/packages', icon: 'Layers' },
          { id: 'v-media', label: 'Media Library', href: '/admin/cms?tab=media', icon: 'Image' },
          { id: 'v-profile', label: 'Business Profile', href: '/partner/dashboard', icon: 'Building2' },
        ],
      },
      {
        id: 'vendor-inventory',
        title: 'Inventory & Rates',
        icon: 'Calculator',
        description: 'Availability, calendar slots, and wholesale rates',
        items: [
          { id: 'v-availability', label: 'Availability & Slots', href: '/partner/dashboard#availability', icon: 'CheckSquare' },
          { id: 'v-rates', label: 'Rate Manager', href: '/partner/dashboard#rates', icon: 'Calculator', badge: 'Net Rate' },
          { id: 'v-promos', label: 'Promotions', href: '/campaigns', icon: 'Sparkles' },
        ],
      },
      {
        id: 'vendor-bookings',
        title: 'Bookings & Fulfillment',
        icon: 'CheckSquare',
        description: 'Reservations, confirmations, and modifications',
        items: [
          { id: 'v-bookings-all', label: 'All Bookings', href: '/operations/control-tower', icon: 'CheckSquare' },
          { id: 'v-confirmations', label: 'Pending Confirmation', href: '/operations/control-tower?filter=pending_vendor', icon: 'Clock', badge: 'Action Required' },
          { id: 'v-ops-today', label: "Today's Deliveries", href: '/operations/dashboard', icon: 'Compass', badge: 'Today' },
        ],
      },
      {
        id: 'vendor-finance',
        title: 'Finance & Settlements',
        icon: 'CreditCard',
        description: 'Payables, settlements, commissions, and statements',
        items: [
          { id: 'v-revenue', label: 'Settlement Ledger', href: '/partner/dashboard?tab=CREDIT_LEDGER', icon: 'DollarSign' },
          { id: 'v-invoices', label: 'Invoices & Payouts', href: '/finance/general-ledger', icon: 'CreditCard' },
          { id: 'v-contracts', label: 'Contracts & Terms', href: '/admin/dms?tab=contracts', icon: 'FileText' },
        ],
      },
    ];

    return {
      role,
      branch,
      mode: mode === 'simple' ? 'simple' : 'advanced',
      sections: vendorSections,
      activeItemsCount: vendorSections.reduce((acc, s) => acc + s.items.length, 0),
    };
  }

  // TRAVEL AGENT DASHBOARD & NAVIGATION
  if (role === 'TRAVEL_AGENT') {
    const agentWorkItems: NavigationItem[] = [
      { id: 'agent-desk', label: 'Agent Workspace', href: '/agent/dashboard', icon: 'Briefcase', badge: 'Today' },
      { id: 'agent-enquiries', label: 'New Enquiries', href: '/agent/dashboard?tab=inquiries', icon: 'PhoneCall', badge: '4 New' },
      { id: 'agent-followups', label: 'Pending Follow-ups', href: '/crm/leads?filter=pending', icon: 'Clock' },
      { id: 'agent-quotes', label: 'Pending Quotes', href: '/crm/quotes', icon: 'Calculator' },
      { id: 'agent-trips', label: 'My Trips', href: '/journeys', icon: 'Compass' },
      { id: 'agent-bookings', label: 'Recent Bookings', href: '/operations/control-tower', icon: 'CheckSquare' },
      { id: 'agent-docs', label: 'Customer Documents', href: '/admin/dms', icon: 'FileText' },
      { id: 'agent-ai', label: 'AI Sales Copilot', href: '/agent/dashboard#ai', icon: 'Sparkles', badge: 'AI' },
    ];

    return {
      role,
      branch,
      mode: 'simple',
      sections: [
        {
          id: 'agent-desk-group',
          title: "Today's Work",
          icon: 'Briefcase',
          description: `Daily consultant queue • ${branch.city} Branch`,
          items: agentWorkItems,
        },
      ],
      activeItemsCount: agentWorkItems.length,
    };
  }

  // BRANCH MANAGER
  if (role === 'BRANCH_MANAGER') {
    const branchSections: NavigationSection[] = [
      {
        id: 'branch-overview',
        title: `Branch Command (${branch.city})`,
        icon: 'Building',
        description: `Operational oversight for ${branch.name}`,
        items: [
          { id: 'bm-dash', label: 'Branch Overview', href: '/admin/dashboard', icon: 'LayoutDashboard', badge: branch.code },
          { id: 'bm-sales', label: 'Sales & Revenue', href: '/crm/dashboard', icon: 'TrendingUp' },
          { id: 'bm-bookings', label: 'Branch Bookings', href: '/operations/control-tower', icon: 'CheckSquare' },
        ],
      },
      {
        id: 'branch-team',
        title: 'Team & Supervision',
        icon: 'Users',
        description: 'Agent productivity and deal sign-offs',
        items: [
          { id: 'bm-agents', label: 'Branch Agents', href: '/admin/developer#users', icon: 'Users', badge: `${branch.activeAgentsCount} Agents` },
          { id: 'bm-tasks', label: 'Daily Agent Tasks', href: '/agent/dashboard', icon: 'CheckSquare' },
          { id: 'bm-approvals', label: 'Manager Approvals', href: '/admin/approvals', icon: 'Shield', badge: 'Pending' },
        ],
      },
      {
        id: 'branch-ops',
        title: 'Operations & Suppliers',
        icon: 'Plane',
        description: 'Active traveler trips and regional partner alerts',
        items: [
          { id: 'bm-trips', label: 'Active Trips', href: '/journeys', icon: 'Compass', badge: 'Live' },
          { id: 'bm-issues', label: 'Disruption & Issues', href: '/operations/dashboard', icon: 'AlertTriangle' },
          { id: 'bm-suppliers', label: 'Supplier Updates', href: '/partner/dashboard', icon: 'Building2' },
        ],
      },
    ];

    return {
      role,
      branch,
      mode,
      sections: branchSections,
      activeItemsCount: branchSections.reduce((acc, s) => acc + s.items.length, 0),
    };
  }

  // SIMPLE MODE FOR GENERAL USERS / ADMINS
  if (mode === 'simple') {
    return {
      role,
      branch,
      mode: 'simple',
      sections: [
        {
          id: 'simple-business-menu',
          title: 'Business Navigation',
          icon: 'Compass',
          description: 'User goal-based business experience menu',
          items: SIMPLE_MODE_ITEMS,
        },
      ],
      activeItemsCount: SIMPLE_MODE_ITEMS.length,
    };
  }

  // ADVANCED MODE FOR ENTERPRISE ADMINS & BUILDERS
  // Include standard admin sections with CRUDE8 capabilities merged + Platform Studio
  const resolvedSections: NavigationSection[] = [];

  for (const section of ADMIN_NAVIGATION_SECTIONS) {
    // Filter items based on permissions
    const permittedItems = section.items.filter((item) => {
      if (hasWildcard) return true;
      if (!item.permission) return true;
      return permissions.includes(item.permission);
    });

    if (permittedItems.length > 0) {
      resolvedSections.push({
        ...section,
        items: permittedItems,
      });
    }
  }

  // Add Platform Studio for Advanced or Expert Mode
  const isElevatedRole = hasWildcard || role === 'PLATFORM_SUPER_ADMIN' || role === 'ADMIN';
  const canAccessPlatformStudio = isElevatedRole && (mode === 'advanced' || mode === 'expert');
  if (canAccessPlatformStudio) {
    resolvedSections.push(PLATFORM_STUDIO_SECTION);
  }

  return {
    role,
    branch,
    mode: mode === 'expert' ? 'expert' : 'advanced',
    sections: resolvedSections,
    activeItemsCount: resolvedSections.reduce((acc, s) => acc + s.items.length, 0),
  };
}
