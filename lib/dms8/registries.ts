/**
 * DMS8 CANONICAL REGISTRIES & SEED KNOWLEDGE
 * Enterprise Travel Documents across Customer, Booking, Journey, Supplier, Finance, and Corporate.
 */

import { DocumentRegistryItem, TravelDocumentType, ApprovalChainRule } from './types';

export const DMS8_DOCUMENT_TYPE_DEFINITIONS: {
  type: TravelDocumentType;
  category: string;
  name: string;
  defaultClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  requiresExpiryTracking: boolean;
  retentionDays: number;
}[] = [
  // Customer
  { type: 'PASSPORT', category: 'CUSTOMER', name: 'Passport Bio Page', defaultClassification: 'RESTRICTED', requiresExpiryTracking: true, retentionDays: 3650 },
  { type: 'VISA', category: 'CUSTOMER', name: 'Entry Visa / E-Visa', defaultClassification: 'RESTRICTED', requiresExpiryTracking: true, retentionDays: 1825 },
  { type: 'IDENTITY_PROOF', category: 'CUSTOMER', name: 'National ID / Aadhaar / Driving License', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: false, retentionDays: 1825 },
  { type: 'INSURANCE', category: 'CUSTOMER', name: 'Overseas Travel & Medical Insurance', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: true, retentionDays: 1095 },
  { type: 'TRAVEL_CONSENT', category: 'CUSTOMER', name: 'Minor / Parental Consent Affidavit', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: false, retentionDays: 1825 },
  { type: 'MEDICAL_CERTIFICATE', category: 'CUSTOMER', name: 'Medical Fitness / Altitude Clearance', defaultClassification: 'RESTRICTED', requiresExpiryTracking: true, retentionDays: 365 },
  // Booking
  { type: 'BOOKING_CONFIRMATION', category: 'BOOKING', name: 'Voyage8 Booking Confirmation Voucher', defaultClassification: 'INTERNAL', requiresExpiryTracking: false, retentionDays: 2555 },
  { type: 'TOUR_VOUCHER', category: 'BOOKING', name: 'Activity & Hotel Electronic Voucher', defaultClassification: 'INTERNAL', requiresExpiryTracking: false, retentionDays: 1825 },
  { type: 'AIR_TICKET', category: 'BOOKING', name: 'Flight E-Ticket (PNR)', defaultClassification: 'INTERNAL', requiresExpiryTracking: true, retentionDays: 1095 },
  { type: 'TAX_INVOICE', category: 'BOOKING', name: 'GST Compliant Tax Invoice', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: false, retentionDays: 2920 },
  { type: 'PAYMENT_RECEIPT', category: 'BOOKING', name: 'Payment Acknowledgment Receipt', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: false, retentionDays: 2555 },
  // Journey
  { type: 'ITINERARY', category: 'JOURNEY', name: 'Handcrafted Living Itinerary', defaultClassification: 'INTERNAL', requiresExpiryTracking: false, retentionDays: 1825 },
  { type: 'ROUTE_MAP', category: 'JOURNEY', name: 'Expedition Trail & Route Blueprint', defaultClassification: 'INTERNAL', requiresExpiryTracking: false, retentionDays: 1825 },
  { type: 'GUIDE_DOCUMENT', category: 'JOURNEY', name: 'Local Storyteller Dossier', defaultClassification: 'INTERNAL', requiresExpiryTracking: false, retentionDays: 1825 },
  // Supplier
  { type: 'SUPPLIER_CONTRACT', category: 'SUPPLIER', name: 'Hotel / Transporter Master Contract', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: true, retentionDays: 2555 },
  { type: 'RATE_CARD', category: 'SUPPLIER', name: 'Seasonal Wholesale Rate Card', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: true, retentionDays: 730 },
  { type: 'BUSINESS_LICENSE', category: 'SUPPLIER', name: 'DOT / Tourism Board Operator License', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: true, retentionDays: 1825 },
  { type: 'SAFETY_CERTIFICATE', category: 'SUPPLIER', name: 'Adventure Safety & Equipment Audit', defaultClassification: 'INTERNAL', requiresExpiryTracking: true, retentionDays: 365 },
  // Finance
  { type: 'EXPENSE_BILL', category: 'FINANCE', name: 'Vendor Dispatch Expense Voucher', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: false, retentionDays: 2555 },
  { type: 'CREDIT_NOTE', category: 'FINANCE', name: 'Credit Reversal Note', defaultClassification: 'CONFIDENTIAL', requiresExpiryTracking: false, retentionDays: 2920 },
  // Corporate
  { type: 'TRAVEL_POLICY', category: 'CORPORATE', name: 'Corporate Travel & Expense Mandate', defaultClassification: 'INTERNAL', requiresExpiryTracking: true, retentionDays: 1825 }
];

export const SEED_DMS_DOCUMENTS: DocumentRegistryItem[] = [
  {
    documentId: 'doc-pass-001',
    documentType: 'PASSPORT',
    title: 'Passport Bio Page - Rahul Kumar',
    description: 'Republic of India Passport Bio page scanned for Dubai International Trip verification.',
    ownerId: 'cust-rahul-01',
    ownerName: 'Rahul Kumar',
    organizationId: 'org-travel-planet-hq',
    tenantId: 'tenant-default',
    workspaceId: 'ws-outbound-luxury',
    entityType: 'CUSTOMER',
    entityId: 'cust-rahul-01',
    category: 'CUSTOMER',
    classification: 'RESTRICTED',
    tags: ['passport', 'dubai-trip', 'verified-kyc'],
    language: 'en-IN',
    version: 1,
    lifecycleStatus: 'USE',
    approvalStatus: 'APPROVED',
    storageProvider: 'VERCEL_BLOB',
    storagePath: 'vault/customers/rahul-kumar/passport-bio-2026.pdf',
    fileSizeBytes: 2450120,
    mimeType: 'application/pdf',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    metadata: {
      issuingCountry: 'IND',
      verifiedByOfficer: 'Priya Sharma (Operations)',
      scanDpi: 300
    },
    ocrData: {
      rawText: 'P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<\nZ123456784IND8801156M3201142<<<<<<<<<<<<<<06',
      extractedEntities: {
        fullName: 'RAHUL KUMAR',
        idOrPassportNumber: 'Z1234567',
        nationality: 'INDIAN',
        dateOfBirth: '1988-01-15',
        expiryDate: '2032-01-14'
      },
      confidenceScore: 0.98,
      processedAt: '2026-09-27T10:15:00Z'
    },
    expiryDate: '2032-01-14',
    retentionPolicy: {
      durationDays: 3650,
      actionOnExpiry: 'NOTIFY',
      legalHold: false
    },
    createdBy: 'agent-sarah',
    approvedBy: 'mgr-vikram',
    createdAt: '2026-09-27T10:14:00Z',
    updatedAt: '2026-09-27T10:15:30Z'
  },
  {
    documentId: 'doc-visa-002',
    documentType: 'VISA',
    title: 'UAE 30-Day Tourist E-Visa - Rahul Kumar',
    description: 'Official GDRFA Tourist Entry Permit for Dubai.',
    ownerId: 'cust-rahul-01',
    ownerName: 'Rahul Kumar',
    organizationId: 'org-travel-planet-hq',
    tenantId: 'tenant-default',
    workspaceId: 'ws-outbound-luxury',
    entityType: 'CUSTOMER',
    entityId: 'cust-rahul-01',
    category: 'CUSTOMER',
    classification: 'RESTRICTED',
    tags: ['visa', 'dubai', 'approved'],
    language: 'en-IN',
    version: 1,
    lifecycleStatus: 'USE',
    approvalStatus: 'APPROVED',
    storageProvider: 'VERCEL_BLOB',
    storagePath: 'vault/customers/rahul-kumar/uae-visa-2027.pdf',
    fileSizeBytes: 980400,
    mimeType: 'application/pdf',
    sha256Hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    metadata: {
      entryType: 'SINGLE_ENTRY',
      sponsor: 'Travel Planet Tourism LLC Dubai'
    },
    ocrData: {
      rawText: 'UNITED ARAB EMIRATES MINISTRY OF INTERIOR ENTRY PERMIT\nNAME: RAHUL KUMAR\nVISA NO: 201/2026/89412\nVALID UNTIL: 2026-11-20',
      extractedEntities: {
        fullName: 'RAHUL KUMAR',
        idOrPassportNumber: '201/2026/89412',
        expiryDate: '2026-11-20',
        destination: 'Dubai, UAE'
      },
      confidenceScore: 0.96,
      processedAt: '2026-09-27T11:00:00Z'
    },
    expiryDate: '2026-11-20',
    retentionPolicy: {
      durationDays: 1825,
      actionOnExpiry: 'ARCHIVE',
      legalHold: false
    },
    createdBy: 'agent-sarah',
    approvedBy: 'compliance-rajesh',
    createdAt: '2026-09-27T10:55:00Z',
    updatedAt: '2026-09-27T11:02:00Z'
  },
  {
    documentId: 'doc-vouch-003',
    documentType: 'TOUR_VOUCHER',
    title: 'Kumarakom Lake Resort Presidential Pool Villa Voucher',
    description: 'Confirmed hotel check-in voucher with complimentary Ayurvedic rejuvenation session.',
    ownerId: 'cust-sunita-02',
    ownerName: 'Sunita Mehra',
    organizationId: 'org-travel-planet-hq',
    tenantId: 'tenant-default',
    workspaceId: 'ws-kerala-experiential',
    entityType: 'BOOKING',
    entityId: 'bk-kerala-2026-44',
    category: 'BOOKING',
    classification: 'INTERNAL',
    tags: ['voucher', 'kumarakom', 'kerala', 'luxury'],
    language: 'en-IN',
    version: 2,
    lifecycleStatus: 'USE',
    approvalStatus: 'APPROVED',
    storageProvider: 'VERCEL_BLOB',
    storagePath: 'vault/bookings/bk-kerala-2026-44/hotel-voucher.pdf',
    fileSizeBytes: 1240000,
    mimeType: 'application/pdf',
    sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    metadata: {
      checkIn: '2026-10-12',
      checkOut: '2026-10-15',
      roomType: 'Heritage Lake Villa with Private Plunge Pool'
    },
    ocrData: {
      rawText: 'TRAVEL PLANET VOUCHER #TP-KL-9842\nSUPPLIER: KUMARAKOM LAKE RESORT\nGUEST: SUNITA MEHRA\nTOTAL PAID: INR 84,000',
      extractedEntities: {
        fullName: 'SUNITA MEHRA',
        bookingReference: 'TP-KL-9842',
        supplierName: 'Kumarakom Lake Resort',
        totalAmount: 84000,
        currency: 'INR'
      },
      confidenceScore: 0.99,
      processedAt: '2026-09-28T09:00:00Z'
    },
    retentionPolicy: {
      durationDays: 2555,
      actionOnExpiry: 'ARCHIVE',
      legalHold: false
    },
    createdBy: 'agent-anand',
    approvedBy: 'ops-lead-nair',
    createdAt: '2026-09-28T08:50:00Z',
    updatedAt: '2026-09-28T09:05:00Z'
  },
  {
    documentId: 'doc-supp-004',
    documentType: 'SUPPLIER_CONTRACT',
    title: 'Master Service Agreement - CGH Earth Hotels 2026-2028',
    description: 'Contracted rates, cancellation terms, and dynamic inventory integration agreement.',
    ownerId: 'supp-cgh-01',
    ownerName: 'CGH Earth Hospitality Group',
    organizationId: 'org-travel-planet-hq',
    tenantId: 'tenant-default',
    workspaceId: 'ws-suppliers',
    entityType: 'SUPPLIER',
    entityId: 'supp-cgh-01',
    category: 'SUPPLIER',
    classification: 'CONFIDENTIAL',
    tags: ['contract', 'cgh-earth', 'wholesale-agreement', 'signed'],
    language: 'en-IN',
    version: 1,
    lifecycleStatus: 'USE',
    approvalStatus: 'APPROVED',
    eSignStatus: 'SIGNED',
    storageProvider: 'VERCEL_BLOB',
    storagePath: 'vault/suppliers/cgh-earth/msa-2026-2028.pdf',
    fileSizeBytes: 4200000,
    mimeType: 'application/pdf',
    sha256Hash: '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    metadata: {
      contractPeriodYears: 2,
      signedDate: '2026-08-01',
      eSignProvider: 'DMS8_CRYPTO_SIGN'
    },
    ocrData: {
      rawText: 'MASTER ACCOMMODATION & EXPERIENTIAL SERVICES AGREEMENT BETWEEN TRAVEL PLANET OS AND CGH EARTH HOSPITALITY.\nEXPIRY: 2028-07-31',
      extractedEntities: {
        supplierName: 'CGH Earth Hospitality Group',
        expiryDate: '2028-07-31',
        destination: 'South India & Kerala'
      },
      confidenceScore: 0.97,
      processedAt: '2026-08-01T15:00:00Z'
    },
    expiryDate: '2028-07-31',
    retentionPolicy: {
      durationDays: 2555,
      actionOnExpiry: 'NOTIFY',
      legalHold: true
    },
    createdBy: 'supp-manager-menon',
    approvedBy: 'exec-director',
    createdAt: '2026-08-01T14:30:00Z',
    updatedAt: '2026-08-01T16:00:00Z'
  },
  {
    documentId: 'doc-ins-005',
    documentType: 'INSURANCE',
    title: 'Tata AIG Overseas Travel Guard - Amit Roy',
    description: 'Comprehensive medical and trip cancellation policy.',
    ownerId: 'cust-amit-03',
    ownerName: 'Amit Roy',
    organizationId: 'org-travel-planet-hq',
    tenantId: 'tenant-default',
    workspaceId: 'ws-outbound-luxury',
    entityType: 'CUSTOMER',
    entityId: 'cust-amit-03',
    category: 'CUSTOMER',
    classification: 'CONFIDENTIAL',
    tags: ['insurance', 'tata-aig', 'expiring-soon'],
    language: 'en-IN',
    version: 1,
    lifecycleStatus: 'USE',
    approvalStatus: 'APPROVED',
    storageProvider: 'VERCEL_BLOB',
    storagePath: 'vault/customers/amit-roy/travel-guard.pdf',
    fileSizeBytes: 1850000,
    mimeType: 'application/pdf',
    sha256Hash: 'c4ca4238a0b923820dcc509a6f75849b8a3648e3cf352ca476c2436154699503',
    metadata: {
      policyNumber: '0289123491',
      coverageUsd: 250000
    },
    ocrData: {
      rawText: 'TATA AIG OVERSEAS TRAVEL GUARD POLICY NO 0289123491\nINSURED: AMIT ROY\nEXPIRY DATE: 2026-10-15',
      extractedEntities: {
        fullName: 'AMIT ROY',
        idOrPassportNumber: '0289123491',
        expiryDate: '2026-10-15'
      },
      confidenceScore: 0.99,
      processedAt: '2026-09-10T12:00:00Z'
    },
    expiryDate: '2026-10-15', // Under 30 days expiry!
    retentionPolicy: {
      durationDays: 1095,
      actionOnExpiry: 'NOTIFY',
      legalHold: false
    },
    createdBy: 'agent-sarah',
    approvedBy: 'compliance-rajesh',
    createdAt: '2026-09-10T11:45:00Z',
    updatedAt: '2026-09-10T12:05:00Z'
  }
];

export const CANONICAL_APPROVAL_CHAINS: ApprovalChainRule[] = [
  {
    id: 'chain-supplier-contract',
    name: 'Supplier & Hotel Master Agreement Approval',
    documentType: 'SUPPLIER_CONTRACT',
    requiredRoles: ['OPERATIONS', 'FINANCE', 'ADMIN'],
    minimumApprovals: 2,
    autoEscalateHours: 48
  },
  {
    id: 'chain-passport-compliance',
    name: 'Customer Passport & Visa Regulatory Compliance',
    documentType: 'PASSPORT',
    requiredRoles: ['OPERATIONS', 'COMPLIANCE'],
    minimumApprovals: 1,
    autoEscalateHours: 24
  },
  {
    id: 'chain-tax-invoice-reversal',
    name: 'Credit Note & Refund Authorization',
    documentType: 'CREDIT_NOTE',
    requiredRoles: ['FINANCE', 'MANAGER'],
    minimumApprovals: 2,
    autoApproveBelowAmount: 5000,
    autoEscalateHours: 24
  }
];
