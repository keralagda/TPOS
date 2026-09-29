/**
 * Travel Planet — Supplier & Vendor Settlement Service
 * Governing document: 08_CRM_ERP_FINANCE.md, 15_IMPLEMENTATION_PHASES.md (Phase 2)
 */

export interface VendorProfile {
  vendorId: string;
  name: string;
  category: 'AIRLINE' | 'HOTEL_BEDBANK' | 'TOUR_OPERATOR' | 'TRANSPORT';
  contractNumber: string;
  commissionRate: number; // percentage
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  bankDetails: {
    accountNumberMasked: string;
    ifscSwift: string;
  };
}

export interface SupplierSettlementBatch {
  settlementId: string;
  vendorId: string;
  vendorName: string;
  periodStart: Date;
  periodEnd: Date;
  grossBookingsAmount: number;
  commissionRetained: number;
  netPayableToSupplier: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED';
  approvedBy?: string;
  createdAt: Date;
}

export class SupplierManagementService {
  private static instance: SupplierManagementService;
  private vendors: Map<string, VendorProfile> = new Map();
  private settlements: SupplierSettlementBatch[] = [];

  private constructor() {
    this.seedVendors();
  }

  static getInstance(): SupplierManagementService {
    if (!SupplierManagementService.instance) {
      SupplierManagementService.instance = new SupplierManagementService();
    }
    return SupplierManagementService.instance;
  }

  private seedVendors(): void {
    const v1: VendorProfile = {
      vendorId: 'vnd_akbar_01',
      name: 'Akbar Travels B2B',
      category: 'AIRLINE',
      contractNumber: 'CNT-AKB-2026',
      commissionRate: 8.5,
      status: 'ACTIVE',
      bankDetails: { accountNumberMasked: '****4912', ifscSwift: 'HDFC0001234' },
    };

    const v2: VendorProfile = {
      vendorId: 'vnd_booking_02',
      name: 'Booking.com Stays Partner',
      category: 'HOTEL_BEDBANK',
      contractNumber: 'CNT-BK-2026',
      commissionRate: 15.0,
      status: 'ACTIVE',
      bankDetails: { accountNumberMasked: '****9931', ifscSwift: 'CITI0005678' },
    };

    this.vendors.set(v1.vendorId, v1);
    this.vendors.set(v2.vendorId, v2);

    // Initial settlement batch
    this.settlements.push({
      settlementId: 'stl_2026_09_01',
      vendorId: 'vnd_akbar_01',
      vendorName: 'Akbar Travels B2B',
      periodStart: new Date('2026-09-01'),
      periodEnd: new Date('2026-09-15'),
      grossBookingsAmount: 184500,
      commissionRetained: 15682.5,
      netPayableToSupplier: 168817.5,
      status: 'PENDING_APPROVAL',
      createdAt: new Date('2026-09-16'),
    });
  }

  getAllVendors(): VendorProfile[] {
    return Array.from(this.vendors.values());
  }

  getSettlements(): SupplierSettlementBatch[] {
    return this.settlements;
  }

  approveSettlement(settlementId: string, approverEmail: string): SupplierSettlementBatch {
    const s = this.settlements.find((b) => b.settlementId === settlementId);
    if (!s) throw new Error(`Settlement ${settlementId} not found.`);
    s.status = 'APPROVED';
    s.approvedBy = approverEmail;
    return s;
  }
}

export const supplierService = SupplierManagementService.getInstance();
