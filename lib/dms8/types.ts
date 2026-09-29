/**
 * DMS8: INTELLIGENT TRAVEL DOCUMENT MANAGEMENT OPERATING SYSTEM
 * Types & Core Domain Contracts
 */

export type DocumentLifecyclePhase = 
  | 'CREATE'
  | 'UPLOAD'
  | 'CLASSIFY'
  | 'EXTRACT'
  | 'VERIFY'
  | 'LINK'
  | 'APPROVE'
  | 'USE'
  | 'ARCHIVE'
  | 'RETENTION'
  | 'PURGE';

export type DocumentCategory = 
  | 'CUSTOMER'
  | 'BOOKING'
  | 'JOURNEY'
  | 'SUPPLIER'
  | 'FINANCE'
  | 'CORPORATE'
  | 'COMPLIANCE';

export type TravelDocumentType = 
  // Customer Documents
  | 'PASSPORT'
  | 'VISA'
  | 'IDENTITY_PROOF'
  | 'INSURANCE'
  | 'TRAVEL_CONSENT'
  | 'MEDICAL_CERTIFICATE'
  | 'EMERGENCY_CONTACT'
  | 'MEMBERSHIP_CARD'
  // Booking Documents
  | 'BOOKING_CONFIRMATION'
  | 'TOUR_VOUCHER'
  | 'AIR_TICKET'
  | 'TAX_INVOICE'
  | 'PAYMENT_RECEIPT'
  | 'CANCELLATION_NOTICE'
  | 'REFUND_VOUCHER'
  | 'PAYMENT_PROOF'
  // Journey Documents
  | 'ITINERARY'
  | 'TRAVEL_PLAN'
  | 'ROUTE_MAP'
  | 'DAY_SCHEDULE'
  | 'GUIDE_DOCUMENT'
  | 'TRAVEL_DIARY'
  // Supplier Documents
  | 'SUPPLIER_CONTRACT'
  | 'RATE_CARD'
  | 'SERVICE_AGREEMENT'
  | 'BUSINESS_LICENSE'
  | 'SAFETY_CERTIFICATE'
  | 'SUPPLIER_INSURANCE'
  | 'COMPLIANCE_FILE'
  // Finance Documents
  | 'EXPENSE_BILL'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'
  | 'TAX_DOCUMENT'
  // Corporate Documents
  | 'TRAVEL_POLICY'
  | 'CORPORATE_APPROVAL'
  | 'EMPLOYEE_DOC'
  | 'EXPENSE_REPORT';

export type DocumentDataClassification = 
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export type VaultType = 
  | 'PERSONAL_VAULT'
  | 'CUSTOMER_VAULT'
  | 'TRIP_VAULT'
  | 'BOOKING_VAULT'
  | 'SUPPLIER_VAULT'
  | 'ORGANIZATION_VAULT'
  | 'COMPLIANCE_VAULT';

export type StorageProviderType = 
  | 'VERCEL_BLOB'
  | 'AWS_S3'
  | 'CLOUDFLARE_R2'
  | 'AZURE_BLOB'
  | 'GOOGLE_CLOUD_STORAGE'
  | 'ENCRYPTED_VAULT_LOCAL';

export type ApprovalStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'EXPIRED';

export type ESignStatus = 
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'SIGNED'
  | 'DECLINED'
  | 'EXPIRED';

export interface DocumentRegistryItem {
  documentId: string;
  documentType: TravelDocumentType;
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  organizationId: string;
  tenantId: string;
  workspaceId: string;
  entityType: 'CUSTOMER' | 'BOOKING' | 'JOURNEY' | 'SUPPLIER' | 'ORGANIZATION' | 'EXPENSE';
  entityId: string;
  category: DocumentCategory;
  classification: DocumentDataClassification;
  tags: string[];
  language: 'en-IN' | 'ml-IN' | 'hi-IN';
  version: number;
  lifecycleStatus: DocumentLifecyclePhase;
  approvalStatus: ApprovalStatus;
  eSignStatus?: ESignStatus;
  storageProvider: StorageProviderType;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  metadata: Record<string, any>;
  ocrData?: {
    rawText: string;
    extractedEntities: {
      fullName?: string;
      idOrPassportNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      nationality?: string;
      dateOfBirth?: string;
      totalAmount?: number;
      currency?: string;
      bookingReference?: string;
      supplierName?: string;
      destination?: string;
    };
    confidenceScore: number;
    processedAt: string;
  };
  expiryDate?: string;
  retentionPolicy: {
    durationDays: number;
    actionOnExpiry: 'ARCHIVE' | 'NOTIFY' | 'PURGE';
    legalHold: boolean;
  };
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersionEntry {
  version: number;
  documentId: string;
  storagePath: string;
  sha256Hash: string;
  fileSizeBytes: number;
  changedBy: string;
  changeSummary: string;
  timestamp: string;
}

export interface DocumentAuditTrailEntry {
  id: string;
  documentId: string;
  action: 'CREATE' | 'UPLOAD' | 'OCR_EXTRACT' | 'VERIFY' | 'LINK' | 'APPROVE' | 'REJECT' | 'DOWNLOAD' | 'SHARE' | 'E_SIGN' | 'ARCHIVE';
  performedBy: string;
  userRole: string;
  tenantId: string;
  ipAddress?: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface ApprovalChainRule {
  id: string;
  name: string;
  documentType: TravelDocumentType;
  requiredRoles: ('MANAGER' | 'FINANCE' | 'OPERATIONS' | 'ADMIN' | 'COMPLIANCE')[];
  minimumApprovals: number;
  autoApproveBelowAmount?: number;
  autoEscalateHours: number;
}
