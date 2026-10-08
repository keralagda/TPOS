/**
 * PACKAGE8: TRAVEL PACKAGE MANAGER & HYPER CONFIGURATOR ENGINE
 * 
 * PRODUCT != PACKAGE
 * Product = Sellable individual item (Flight, Hotel, Transfer, Experience).
 * Package = Coordinated journey composition with dynamic pricing, margins, availability, rules, and immutable version snapshots.
 */

export interface PackageComponentItem {
  componentId: string;
  type: 'FLIGHT' | 'HOTEL' | 'TRANSFER' | 'EXPERIENCE' | 'ACTIVITY' | 'VISA' | 'INSURANCE' | 'ADD_ON';
  title: string;
  supplierId: string;
  supplierName: string;
  netCost: number;
  markupPercent: number;
  taxPercent: number;
  commissionPercent: number;
  isOptional: boolean;
  isIncluded: boolean;
}

export interface TravelPackageDefinition {
  packageId: string;
  version: number;
  title: string;
  destination: string;
  durationNights: number;
  durationDays: number;
  components: PackageComponentItem[];
  pricing: {
    totalNetCost: number;
    totalMarkup: number;
    totalTaxes: number;
    commissionAmount: number;
    finalSellingPrice: number;
    currency: string;
    pricingModel: 'PER_PERSON' | 'PER_ROOM' | 'PER_PACKAGE';
  };
  availability: {
    status: 'IN_STOCK' | 'LIMITED' | 'ON_REQUEST';
    seatsRemaining: number;
    minPax: number;
    maxPax: number;
  };
  rules: {
    cancellationPolicy: string;
    advanceBookingDays: number;
    requiresVisaApproval: boolean;
  };
  status: 'DRAFT' | 'COSTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  immutableSnapshotHash?: string;
}

export class Package8Manager {
  private static packages: Map<string, TravelPackageDefinition> = new Map();

  static {
    // Seed canonical holiday package
    this.createOrUpdatePackage({
      packageId: 'pkg-dubai-luxury-5d',
      version: 1,
      title: 'Dubai Extravaganza with Desert Safari & Marina Cruise',
      destination: 'Dubai',
      durationNights: 4,
      durationDays: 5,
      components: [
        {
          componentId: 'comp-hotel-marina',
          type: 'HOTEL',
          title: '5★ Address Dubai Marina (4 Nights)',
          supplierId: 'supp-address-hotels',
          supplierName: 'Address Hospitality',
          netCost: 45000,
          markupPercent: 12,
          taxPercent: 5,
          commissionPercent: 5,
          isOptional: false,
          isIncluded: true,
        },
        {
          componentId: 'comp-transfer-dxb',
          type: 'TRANSFER',
          title: 'Private Luxury Airport Transfers (Arrival + Departure)',
          supplierId: 'supp-dubai-transfers',
          supplierName: 'Arabian Express Transfers',
          netCost: 6500,
          markupPercent: 15,
          taxPercent: 5,
          commissionPercent: 0,
          isOptional: false,
          isIncluded: true,
        },
        {
          componentId: 'comp-exp-safari',
          type: 'EXPERIENCE',
          title: 'Dune Bashing & VIP Desert Camp BBQ Dinner',
          supplierId: 'supp-desert-adventures',
          supplierName: 'Arabian Adventures',
          netCost: 8000,
          markupPercent: 20,
          taxPercent: 5,
          commissionPercent: 10,
          isOptional: false,
          isIncluded: true,
        },
      ],
      availability: {
        status: 'IN_STOCK',
        seatsRemaining: 18,
        minPax: 2,
        maxPax: 20,
      },
      rules: {
        cancellationPolicy: 'Free cancellation up to 7 days before departure.',
        advanceBookingDays: 3,
        requiresVisaApproval: true,
      },
      status: 'PUBLISHED',
    });
  }

  /**
   * Calculate precise costing, markup, taxes and selling price (§12-13)
   */
  static calculatePackagePricing(components: PackageComponentItem[], currency = 'INR') {
    let totalNetCost = 0;
    let totalMarkup = 0;
    let totalTaxes = 0;
    let totalCommission = 0;

    for (const comp of components) {
      if (!comp.isIncluded) continue;
      const net = comp.netCost;
      const markup = net * (comp.markupPercent / 100);
      const subtotal = net + markup;
      const tax = subtotal * (comp.taxPercent / 100);
      const comm = subtotal * (comp.commissionPercent / 100);

      totalNetCost += net;
      totalMarkup += markup;
      totalTaxes += tax;
      totalCommission += comm;
    }

    const finalSellingPrice = Math.round(totalNetCost + totalMarkup + totalTaxes);

    return {
      totalNetCost: Math.round(totalNetCost),
      totalMarkup: Math.round(totalMarkup),
      totalTaxes: Math.round(totalTaxes),
      commissionAmount: Math.round(totalCommission),
      finalSellingPrice,
      currency,
      pricingModel: 'PER_PERSON' as const,
    };
  }

  /**
   * Create or update package with automatic price calculation
   */
  static createOrUpdatePackage(
    payload: Omit<TravelPackageDefinition, 'pricing' | 'immutableSnapshotHash'>
  ): TravelPackageDefinition {
    const pricing = this.calculatePackagePricing(payload.components);
    const pkg: TravelPackageDefinition = {
      ...payload,
      pricing,
    };
    this.packages.set(pkg.packageId, pkg);
    return pkg;
  }

  /**
   * Freeze and create an immutable package version snapshot for booking linkage (§13)
   */
  static freezeSnapshotForBooking(packageId: string): TravelPackageDefinition {
    const pkg = this.packages.get(packageId);
    if (!pkg) throw new Error(`Package ${packageId} not found`);

    const snapshot = JSON.parse(JSON.stringify(pkg)) as TravelPackageDefinition;
    snapshot.immutableSnapshotHash = `SNAP-SHA256-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return snapshot;
  }

  static getPackage(id: string): TravelPackageDefinition | undefined {
    return this.packages.get(id);
  }

  static getAllPackages(): TravelPackageDefinition[] {
    return Array.from(this.packages.values());
  }
}
