/**
 * Travel Planet (Voyage8) — Universal Global Search Engine
 * 
 * Provides unified cross-entity search with strict permission awareness
 * and multi-tenant data scope boundaries.
 */

import { AuthUser, AuthorizationEngine } from '../auth/rbac-engine';

export interface SearchResultItem {
  id: string;
  entityType:
    | 'CUSTOMER'
    | 'LEAD'
    | 'BOOKING'
    | 'TRIP'
    | 'SUPPLIER'
    | 'OFFER'
    | 'DESTINATION'
    | 'HOTEL'
    | 'EXPERIENCE'
    | 'PAYMENT'
    | 'INVOICE'
    | 'DOCUMENT'
    | 'TICKET'
    | 'USER';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
  organizationId?: string;
  workspaceId?: string;
  requiredPermission: string;
}

export class UniversalSearchEngine {
  private static readonly SAMPLE_INDEX: SearchResultItem[] = [
    // Bookings
    { id: 'TP-9082', entityType: 'BOOKING', title: 'Booking #TP-9082: Dubai Highlights', subtitle: 'Customer: Amal Babu · ₹49,999 · Confirmed', url: '/admin/bookings?id=TP-9082', badge: 'CONFIRMED', organizationId: 'org_tp_hq', requiredPermission: 'bookings.view' },
    { id: 'TP-9081', entityType: 'BOOKING', title: 'Booking #TP-9081: Bali Escape', subtitle: 'Customer: Pooja Menon · ₹74,900 · Confirmed', url: '/admin/bookings?id=TP-9081', badge: 'CONFIRMED', organizationId: 'org_tp_hq', requiredPermission: 'bookings.view' },
    
    // Customers
    { id: 'usr_amal', entityType: 'CUSTOMER', title: 'Amal Babu', subtitle: 'amal.babu@travelplanet.com · Super Admin & VIP Traveler', url: '/crm/customers?id=usr_amal', badge: 'VIP', organizationId: 'org_tp_hq', requiredPermission: 'customers.view' },
    { id: 'usr_priya', entityType: 'CUSTOMER', title: 'Priya Sharma', subtitle: 'priya.s@gmail.com · Verified Passport · 2 Bookings', url: '/crm/customers?id=usr_priya', badge: 'VERIFIED', organizationId: 'org_tp_hq', requiredPermission: 'customers.view' },

    // Destinations
    { id: 'dest_dxb', entityType: 'DESTINATION', title: 'Dubai, United Arab Emirates', subtitle: '18 Packages · Express 24h eVisa Available', url: '/destinations/dubai', badge: 'TRENDING', requiredPermission: 'content.view' },
    { id: 'dest_bali', entityType: 'DESTINATION', title: 'Bali, Indonesia', subtitle: '24 Luxury Villas · Free Visa on Arrival', url: '/destinations/bali', badge: 'POPULAR', requiredPermission: 'content.view' },
    
    // Suppliers & NDC
    { id: 'vnd_emirates', entityType: 'SUPPLIER', title: 'Emirates Airlines (EK)', subtitle: 'Direct NDC Carrier Connect · Zero GDS Surcharge', url: '/suppliers?id=EK', badge: 'NDC LIVE', organizationId: 'org_tp_hq', requiredPermission: 'vendors.view' },
    { id: 'vnd_taj', entityType: 'SUPPLIER', title: 'Taj Hotels & Resorts', subtitle: 'Direct Contracting · Instant Room Allocations', url: '/suppliers?id=TAJ', badge: 'CONTRACTED', organizationId: 'org_tp_hq', requiredPermission: 'vendors.view' },

    // Payments & Invoices
    { id: 'inv_1049', entityType: 'INVOICE', title: 'Tax Invoice #INV-2026-1049', subtitle: 'Amount: ₹52,499 · 5% GST (SAC: 99855) Included', url: '/finance/invoices?id=INV-1049', badge: 'PAID', organizationId: 'org_tp_hq', requiredPermission: 'finance.view' },
  ];

  /**
   * Search entities filtering strictly by caller permissions and tenancy
   */
  public static search(query: string, user: AuthUser): SearchResultItem[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return this.SAMPLE_INDEX.filter(item => {
      // 1. Keyword match
      const matches =
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.entityType.toLowerCase().includes(q);

      if (!matches) return false;

      // 2. Permission check
      const hasPerm = AuthorizationEngine.hasPermission(user, item.requiredPermission);
      if (!hasPerm) return false;

      // 3. Tenancy check
      if (item.organizationId && user.organizationId) {
        const scope = AuthorizationEngine.getDataScope(user);
        if (scope !== 'GLOBAL' && item.organizationId !== user.organizationId) {
          return false;
        }
      }

      return true;
    });
  }
}
