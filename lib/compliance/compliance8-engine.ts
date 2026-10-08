/**
 * COMPLIANCE8: EVIDENCE-FIRST TRAVEL COMPLIANCE & DOUBLE-APPROVAL ENGINE
 * 
 * DOCTRINES:
 * C8-D01 Evidence Before Execution
 * C8-D02 Customer Owns Verification
 * C8-D03 Double Approval (Approval #1: Document Identity, Approval #2: Extracted Information & Processing Authorization)
 * C8-D04 No Silent Assumption
 * C8-D05 Approval Is Evidence
 * C8-D06 Change Invalidates Approval
 */

import { DMS8VaultService } from '../dms8/vault-service';

export type ComplianceState =
  | 'MISSING'
  | 'CORRECTION_REQUIRED'
  | 'REJECTED'
  | 'EXCEPTION'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'REVOKED'
  | 'SUPERSEDED'
  | 'BLOCKED';

export type JourneyComplianceStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'DOCUMENTS_PENDING'
  | 'CUSTOMER_REVIEW_PENDING'
  | 'CUSTOMER_APPROVAL_PENDING'
  | 'AGENCY_REVIEW_PENDING'
  | 'CORRECTION_REQUIRED'
  | 'PARTIALLY_CLEARED'
  | 'CLEARED'
  | 'BLOCKED'
  | 'EXPIRED'
  | 'REVOKED';

export interface CustomerDoubleApproval {
  journeyId: string;
  customerId: string;
  travellerId: string;
  documentId: string;
  documentVersion: number;
  documentHash: string;
  // Approval #1: Customer confirms correct document uploaded
  approval1_DocumentConfirmed: boolean;
  approval1_ConfirmedAt?: string;
  approval1_ConfirmedBy?: string;
  // Approval #2: Customer confirms extracted information & authorizes processing
  approval2_ExtractedDataConfirmed: boolean;
  approval2_ConfirmedAt?: string;
  approval2_ConfirmedBy?: string;
  // Extracted Snapshot Verified By Customer
  snapshot: {
    travellerName: string;
    dob: string;
    nationality: string;
    documentNumber: string;
    issueDate?: string;
    expiryDate: string;
    destination: string;
    travelDates: { departure: string; returnDate?: string };
    consentVersion: string;
    policyVersion: string;
  };
  agencyValidationStatus: 'PENDING' | 'VALIDATED' | 'REJECTED';
  agencyValidatedAt?: string;
  agencyValidatedBy?: string;
}

export interface GranularJourneyGate {
  journeyId: string;
  flightAllowed: boolean;
  hotelAllowed: boolean;
  visaStatus: 'PENDING' | 'CLEARED' | 'BLOCKED';
  dossierAllowed: boolean;
  notes?: string;
}

export class Compliance8Engine {
  private static doubleApprovals: Map<string, CustomerDoubleApproval> = new Map();
  private static granularGates: Map<string, GranularJourneyGate> = new Map();

  /**
   * Submit Document and initiate Compliance Flow
   */
  static initiateApproval(approval: Omit<CustomerDoubleApproval, 'agencyValidationStatus'>): CustomerDoubleApproval {
    const record: CustomerDoubleApproval = {
      ...approval,
      agencyValidationStatus: 'PENDING',
    };
    const key = `${approval.journeyId}-${approval.documentId}`;
    this.doubleApprovals.set(key, record);
    this.updateGranularGates(approval.journeyId);
    return record;
  }

  /**
   * Step 1: Customer confirms the uploaded document image/file is correct (Approval #1)
   */
  static customerConfirmDocument(journeyId: string, documentId: string, confirmedBy: string): CustomerDoubleApproval {
    const key = `${journeyId}-${documentId}`;
    const record = this.doubleApprovals.get(key);
    if (!record) throw new Error(`Compliance approval record not found for ${key}`);

    record.approval1_DocumentConfirmed = true;
    record.approval1_ConfirmedAt = new Date().toISOString();
    record.approval1_ConfirmedBy = confirmedBy;
    this.doubleApprovals.set(key, record);
    this.updateGranularGates(journeyId);
    return record;
  }

  /**
   * Step 2: Customer reviews & authorizes the extracted facts and consent (Approval #2)
   */
  static customerConfirmDataAndAuthorize(journeyId: string, documentId: string, confirmedBy: string): CustomerDoubleApproval {
    const key = `${journeyId}-${documentId}`;
    const record = this.doubleApprovals.get(key);
    if (!record) throw new Error(`Compliance approval record not found for ${key}`);
    if (!record.approval1_DocumentConfirmed) {
      throw new Error(`Approval #1 (Document Confirmation) required before Approval #2 (Extracted Data Authorization)`);
    }

    record.approval2_ExtractedDataConfirmed = true;
    record.approval2_ConfirmedAt = new Date().toISOString();
    record.approval2_ConfirmedBy = confirmedBy;
    this.doubleApprovals.set(key, record);
    this.updateGranularGates(journeyId);
    return record;
  }

  /**
   * Step 3: Agency validates the customer double-approved dossier
   */
  static agencyValidate(journeyId: string, documentId: string, validatedBy: string, approved: boolean): CustomerDoubleApproval {
    const key = `${journeyId}-${documentId}`;
    const record = this.doubleApprovals.get(key);
    if (!record) throw new Error(`Compliance approval record not found for ${key}`);
    if (!record.approval1_DocumentConfirmed || !record.approval2_ExtractedDataConfirmed) {
      throw new Error(`Cannot agency-validate before both customer approvals are completed (C8-D03 Double Approval)`);
    }

    record.agencyValidationStatus = approved ? 'VALIDATED' : 'REJECTED';
    record.agencyValidatedAt = new Date().toISOString();
    record.agencyValidatedBy = validatedBy;
    this.doubleApprovals.set(key, record);
    this.updateGranularGates(journeyId);
    return record;
  }

  /**
   * C8-D06: Any change in the underlying document or facts immediately invalidates approvals
   */
  static invalidateApprovalOnChange(journeyId: string, documentId: string, reason: string): CustomerDoubleApproval {
    const key = `${journeyId}-${documentId}`;
    const record = this.doubleApprovals.get(key);
    if (!record) throw new Error(`Record not found: ${key}`);

    record.approval1_DocumentConfirmed = false;
    record.approval2_ExtractedDataConfirmed = false;
    record.agencyValidationStatus = 'PENDING';
    record.snapshot.policyVersion = `REVOKED: ${reason}`;
    this.doubleApprovals.set(key, record);
    this.updateGranularGates(journeyId);
    return record;
  }

  /**
   * Calculate granular compliance gate state for journey
   * Flights & Hotels may be allowed while Visa remains pending/blocked.
   */
  static updateGranularGates(journeyId: string): GranularJourneyGate {
    const approvals = Array.from(this.doubleApprovals.values()).filter(a => a.journeyId === journeyId);
    
    // Check if all documents have passed double approval + agency validation
    const hasPendingVisa = approvals.some(a => 
      a.snapshot.destination !== 'DOMESTIC_INDIA' && 
      (!a.approval2_ExtractedDataConfirmed || a.agencyValidationStatus !== 'VALIDATED')
    );

    const allApproved = approvals.length > 0 && approvals.every(a => 
      a.approval1_DocumentConfirmed && 
      a.approval2_ExtractedDataConfirmed && 
      a.agencyValidationStatus === 'VALIDATED'
    );

    const gate: GranularJourneyGate = {
      journeyId,
      flightAllowed: true, // Flight booking can proceed independently
      hotelAllowed: true,  // Hotel booking can proceed independently
      visaStatus: hasPendingVisa ? 'PENDING' : 'CLEARED',
      dossierAllowed: allApproved,
      notes: hasPendingVisa 
        ? 'Flight & Hotel authorized; Visa pending double customer verification'
        : 'All journey compliance gates CLEARED',
    };

    this.granularGates.set(journeyId, gate);
    return gate;
  }

  static getGranularGate(journeyId: string): GranularJourneyGate {
    return this.granularGates.get(journeyId) || {
      journeyId,
      flightAllowed: true,
      hotelAllowed: true,
      visaStatus: 'PENDING',
      dossierAllowed: false,
      notes: 'No compliance records submitted yet',
    };
  }

  static getApproval(journeyId: string, documentId: string): CustomerDoubleApproval | undefined {
    return this.doubleApprovals.get(`${journeyId}-${documentId}`);
  }

  static listApprovals(): CustomerDoubleApproval[] {
    return Array.from(this.doubleApprovals.values());
  }
}
