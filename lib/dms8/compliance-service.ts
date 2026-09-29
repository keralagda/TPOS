/**
 * DMS8 COMPLIANCE & EXPIRY MANAGEMENT ENGINE
 * 30-Day Proactive Regulatory Alerts, Data Classifications, and Legal Retention Rules.
 */

import { SEED_DMS_DOCUMENTS } from './registries';
import { DocumentRegistryItem, DocumentDataClassification } from './types';
import { DMS8VaultService } from './vault-service';

export interface ExpiryAlertItem {
  documentId: string;
  documentTitle: string;
  documentType: string;
  ownerName: string;
  expiryDate: string;
  daysRemaining: number;
  urgency: 'CRITICAL_EXPIRED' | 'HIGH_EXPIRING_SOON' | 'MODERATE_MONITORED';
  automatedActionRequired: string;
}

export interface ComplianceHealthAudit {
  totalDocumentsAudited: number;
  complianceScore: number; // 0 - 100
  restrictedClassifiedCount: number;
  confidentialCount: number;
  expiringIn30DaysCount: number;
  expiredCount: number;
  legalHoldActiveCount: number;
  alerts: ExpiryAlertItem[];
}

export class DMS8ComplianceService {
  /**
   * Run Comprehensive Expiry & Compliance Audit
   */
  static runComplianceAudit(): ComplianceHealthAudit {
    const docs = DMS8VaultService.getAllDocuments();
    const alerts: ExpiryAlertItem[] = [];
    const now = new Date();

    let expiredCount = 0;
    let expiringIn30DaysCount = 0;
    let restrictedCount = 0;
    let confidentialCount = 0;
    let legalHoldCount = 0;

    for (const doc of docs) {
      if (doc.classification === 'RESTRICTED') restrictedCount++;
      if (doc.classification === 'CONFIDENTIAL') confidentialCount++;
      if (doc.retentionPolicy.legalHold) legalHoldCount++;

      if (doc.expiryDate) {
        const exp = new Date(doc.expiryDate);
        const diffMs = exp.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          expiredCount++;
          alerts.push({
            documentId: doc.documentId,
            documentTitle: doc.title,
            documentType: doc.documentType,
            ownerName: doc.ownerName,
            expiryDate: doc.expiryDate,
            daysRemaining,
            urgency: 'CRITICAL_EXPIRED',
            automatedActionRequired: `Notify ${doc.ownerName} and Travel Agent to furnish renewed credentials.`
          });
        } else if (daysRemaining <= 30) {
          expiringIn30DaysCount++;
          alerts.push({
            documentId: doc.documentId,
            documentTitle: doc.title,
            documentType: doc.documentType,
            ownerName: doc.ownerName,
            expiryDate: doc.expiryDate,
            daysRemaining,
            urgency: 'HIGH_EXPIRING_SOON',
            automatedActionRequired: `Trigger proactive renewal reminder via WhatsApp / Email 30 days prior.`
          });
        }
      }
    }

    // Calculate score (penalize expired documents)
    const baseScore = 100 - (expiredCount * 15) - (expiringIn30DaysCount * 5);
    const complianceScore = Math.max(0, Math.min(100, baseScore));

    return {
      totalDocumentsAudited: docs.length,
      complianceScore,
      restrictedClassifiedCount: restrictedCount,
      confidentialCount,
      expiringIn30DaysCount,
      expiredCount,
      legalHoldActiveCount: legalHoldCount,
      alerts
    };
  }

  /**
   * Apply Legal Hold (prevents purge or archiving during dispute or audit)
   */
  static setLegalHold(documentId: string, hold: boolean): DocumentRegistryItem {
    const doc = DMS8VaultService.getDocumentById(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    return DMS8VaultService.updateDocument(documentId, {
      retentionPolicy: {
        ...doc.retentionPolicy,
        legalHold: hold
      }
    });
  }
}
