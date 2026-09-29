/**
 * Travel Planet B2B2C — Partner, Reseller & Wallet Engine
 * Governing documents: 02_PROJECT_CONSTITUTION.md, 08_CRM_ERP_FINANCE.md, 14_SECURITY_COMPLIANCE.md
 *
 * Capabilities:
 * - Multi-tenant partner organization management (Agencies, Corporate Desks, Affiliates, White-Label Resellers).
 * - Dynamic markup tiers and commission splits.
 * - Partner Wallet & Credit Line engine (deposit drawdown, balance tracking, ledger posting).
 * - White-label branding profile (custom domain, brand theme, co-branded vouchers).
 * - Partner API Key generation with scoped permissions.
 */

import { AuditLogger } from '../audit/audit-logger';

export type PartnerType = 'TRAVEL_AGENCY' | 'CORPORATE_DESK' | 'AFFILIATE_RESELLER' | 'WHITE_LABEL';
export type CommissionTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface PartnerBranding {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  customDomain?: string;
  voucherFooterNote: string;
}

export interface PartnerWallet {
  currency: string;
  availableBalance: number;
  creditLimit: number;
  utilizedCredit: number;
  lastTopUpAt?: Date;
}

export interface PartnerOrganization {
  id: string;
  code: string;                  // e.g. "PARTNER-APEX"
  name: string;
  type: PartnerType;
  tier: CommissionTier;
  commissionPercentage: number;   // e.g. 12%
  defaultMarkupPercentage: number;// e.g. 5%
  contactEmail: string;
  contactPhone: string;
  wallet: PartnerWallet;
  branding: PartnerBranding;
  apiKeyPrefix: string;
  isActive: boolean;
  createdAt: Date;
}

export interface WalletTransaction {
  id: string;
  partnerId: string;
  type: 'TOP_UP' | 'DRAWDOWN_BOOKING' | 'REFUND_CREDIT' | 'COMMISSION_PAYOUT';
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string;           // e.g. Booking Ref "TP-9082" or Payment Ref
  description: string;
  timestamp: Date;
}

export interface B2BQuoteResult {
  supplierNetFare: number;       // Wholesale rate from supplier connector
  partnerCommission: number;     // Partner tier commission
  partnerMarkup: number;         // Dynamic agent markup added
  retailCustomerPrice: number;   // Final end-traveler price
  taxGst: number;                // 5% GST
  currency: string;
  walletSufficient: boolean;
}

export class PartnerService {
  private static instance: PartnerService;

  // In-memory partner store (maps to Organization & PartnerAccount models in production DB)
  private partners: Map<string, PartnerOrganization> = new Map();
  private transactions: WalletTransaction[] = [];

  private constructor() {
    this.seedDemoPartners();
  }

  public static getInstance(): PartnerService {
    if (!PartnerService.instance) {
      PartnerService.instance = new PartnerService();
    }
    return PartnerService.instance;
  }

  /**
   * Seed initial verified partners
   */
  private seedDemoPartners(): void {
    const demoPartner: PartnerOrganization = {
      id: 'org_apex_voyages',
      code: 'APEX_VOYAGES',
      name: 'Apex Voyages International',
      type: 'TRAVEL_AGENCY',
      tier: 'GOLD',
      commissionPercentage: 12.0,
      defaultMarkupPercentage: 6.0,
      contactEmail: 'desk@apexvoyages.com',
      contactPhone: '+91 98201 55432',
      wallet: {
        currency: 'INR',
        availableBalance: 245000,
        creditLimit: 500000,
        utilizedCredit: 125000,
        lastTopUpAt: new Date(Date.now() - 3600 * 1000 * 48),
      },
      branding: {
        brandName: 'Apex Voyages',
        logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=200&auto=format&fit=crop',
        primaryColor: '#0284c7', // Sky-600
        customDomain: 'travel.apexvoyages.com',
        voucherFooterNote: 'Booked via Apex Voyages International powered by Travel Planet OS.',
      },
      apiKeyPrefix: 'tp_live_partner_apex_9a8b',
      isActive: true,
      createdAt: new Date('2026-01-15'),
    };

    const corporatePartner: PartnerOrganization = {
      id: 'org_tata_corp',
      code: 'TATA_CONSULTING',
      name: 'Tata Consultancy Travel Desk',
      type: 'CORPORATE_DESK',
      tier: 'PLATINUM',
      commissionPercentage: 14.0,
      defaultMarkupPercentage: 0.0, // Corporate passes wholesale straight through
      contactEmail: 'traveldesk@tataconsulting.demo',
      contactPhone: '+91 22 6777 8888',
      wallet: {
        currency: 'INR',
        availableBalance: 1200000,
        creditLimit: 2500000,
        utilizedCredit: 450000,
        lastTopUpAt: new Date(Date.now() - 3600 * 1000 * 24),
      },
      branding: {
        brandName: 'Tata Corporate Travel',
        logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop',
        primaryColor: '#1e3a8a', // Blue-900
        voucherFooterNote: 'Internal Corporate Travel Desk Voucher · Policy Compliant.',
      },
      apiKeyPrefix: 'tp_live_partner_tata_771f',
      isActive: true,
      createdAt: new Date('2026-02-01'),
    };

    this.partners.set(demoPartner.id, demoPartner);
    this.partners.set(demoPartner.code, demoPartner);
    this.partners.set(corporatePartner.id, corporatePartner);
    this.partners.set(corporatePartner.code, corporatePartner);
  }

  public getPartner(partnerIdentifier: string): PartnerOrganization | undefined {
    return this.partners.get(partnerIdentifier);
  }

  public getAllPartners(): PartnerOrganization[] {
    // Unique list by ID
    const unique = new Map<string, PartnerOrganization>();
    for (const p of this.partners.values()) {
      unique.set(p.id, p);
    }
    return Array.from(unique.values());
  }

  /**
   * Calculate B2B2C Wholesale Net Fare vs End-Customer Retail Quote
   */
  public calculateQuote(
    partnerCode: string,
    supplierNetFare: number,
    customMarkupPercentage?: number
  ): B2BQuoteResult {
    const partner = this.partners.get(partnerCode);
    const markupPct = customMarkupPercentage !== undefined
      ? customMarkupPercentage
      : partner?.defaultMarkupPercentage || 5.0;

    const commissionPct = partner?.commissionPercentage || 10.0;
    const partnerCommission = Math.round(supplierNetFare * (commissionPct / 100));
    const partnerMarkup = Math.round(supplierNetFare * (markupPct / 100));

    const taxableAmount = supplierNetFare + partnerMarkup;
    const taxGst = Math.round(taxableAmount * 0.05); // 5% GST
    const retailCustomerPrice = taxableAmount + taxGst;

    const netDeductionFromWallet = supplierNetFare - partnerCommission;
    const walletSufficient = (partner?.wallet.availableBalance || 0) >= netDeductionFromWallet;

    return {
      supplierNetFare,
      partnerCommission,
      partnerMarkup,
      retailCustomerPrice,
      taxGst,
      currency: 'INR',
      walletSufficient,
    };
  }

  /**
   * Top-Up Partner Wallet
   */
  public topUpWallet(
    partnerCode: string,
    amount: number,
    paymentRef: string
  ): WalletTransaction {
    const partner = this.partners.get(partnerCode);
    if (!partner) {
      throw new Error(`Partner ${partnerCode} not found.`);
    }

    const before = partner.wallet.availableBalance;
    partner.wallet.availableBalance += amount;
    partner.wallet.lastTopUpAt = new Date();

    const tx: WalletTransaction = {
      id: `wtx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      partnerId: partner.id,
      type: 'TOP_UP',
      amount,
      currency: partner.wallet.currency,
      balanceBefore: before,
      balanceAfter: partner.wallet.availableBalance,
      referenceId: paymentRef,
      description: `Wallet deposit top-up via Bank Gateway clearing (${paymentRef})`,
      timestamp: new Date(),
    };

    this.transactions.unshift(tx);

    AuditLogger.getInstance().log({
      action: 'PARTNER_WALLET_TOPUP',
      entityType: 'FINANCIAL_TRANSACTION',
      entityId: tx.id,
      metadata: { partnerCode, amount, balanceAfter: tx.balanceAfter },
    });

    return tx;
  }

  /**
   * Drawdown Wallet for Instant B2B Booking Issuance
   */
  public drawdownForBooking(
    partnerCode: string,
    netAmount: number,
    bookingRef: string
  ): WalletTransaction {
    const partner = this.partners.get(partnerCode);
    if (!partner) {
      throw new Error(`Partner ${partnerCode} not found.`);
    }

    if (partner.wallet.availableBalance < netAmount) {
      // Check credit line eligibility
      const remainingCredit = partner.wallet.creditLimit - partner.wallet.utilizedCredit;
      if (remainingCredit < netAmount) {
        throw new Error(`Insufficient wallet balance and credit limit. Balance: ₹${partner.wallet.availableBalance}, Net Required: ₹${netAmount}`);
      }
      partner.wallet.utilizedCredit += netAmount;
    } else {
      partner.wallet.availableBalance -= netAmount;
    }

    const tx: WalletTransaction = {
      id: `wtx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      partnerId: partner.id,
      type: 'DRAWDOWN_BOOKING',
      amount: netAmount,
      currency: partner.wallet.currency,
      balanceBefore: partner.wallet.availableBalance + netAmount,
      balanceAfter: partner.wallet.availableBalance,
      referenceId: bookingRef,
      description: `Wholesale net ticket disbursement for ${bookingRef}`,
      timestamp: new Date(),
    };

    this.transactions.unshift(tx);

    AuditLogger.getInstance().log({
      action: 'PARTNER_WALLET_DRAWDOWN',
      entityType: 'FINANCIAL_TRANSACTION',
      entityId: tx.id,
      metadata: { partnerCode, netAmount, bookingRef, balanceAfter: tx.balanceAfter },
    });

    return tx;
  }

  public getRecentTransactions(partnerId?: string, limit: number = 20): WalletTransaction[] {
    if (partnerId) {
      return this.transactions.filter(t => t.partnerId === partnerId).slice(0, limit);
    }
    return this.transactions.slice(0, limit);
  }
}
