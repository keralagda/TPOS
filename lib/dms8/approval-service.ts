/**
 * DMS8 APPROVAL ENGINE
 * Manages Multi-Role Approval Chains: Manager, Finance, Operations, Admin, Compliance.
 */

import { CANONICAL_APPROVAL_CHAINS } from './registries';
import { ApprovalStatus, ApprovalChainRule, TravelDocumentType } from './types';
import { DMS8VaultService } from './vault-service';

export interface ApprovalRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  documentType: TravelDocumentType;
  requestedBy: string;
  chainRuleId: string;
  requiredRoles: string[];
  approvalsCollected: {
    role: string;
    approverId: string;
    approvedAt: string;
    comment: string;
  }[];
  status: ApprovalStatus;
  createdAt: string;
}

export class DMS8ApprovalService {
  private static approvalRequests: ApprovalRequest[] = [
    {
      id: 'appr-req-01',
      documentId: 'doc-supp-004',
      documentTitle: 'Master Service Agreement - CGH Earth Hotels',
      documentType: 'SUPPLIER_CONTRACT',
      requestedBy: 'supp-manager-menon',
      chainRuleId: 'chain-supplier-contract',
      requiredRoles: ['OPERATIONS', 'FINANCE'],
      approvalsCollected: [
        { role: 'OPERATIONS', approverId: 'ops-lead-nair', approvedAt: '2026-08-01T15:30:00Z', comment: 'Inventory connectivity validated.' },
        { role: 'FINANCE', approverId: 'fin-mgr-priya', approvedAt: '2026-08-01T16:00:00Z', comment: 'Commissions and credit terms verified.' }
      ],
      status: 'APPROVED',
      createdAt: '2026-08-01T14:30:00Z'
    },
    {
      id: 'appr-req-02',
      documentId: 'doc-visa-002',
      documentTitle: 'UAE 30-Day Tourist E-Visa - Rahul Kumar',
      documentType: 'VISA',
      requestedBy: 'agent-sarah',
      chainRuleId: 'chain-passport-compliance',
      requiredRoles: ['COMPLIANCE'],
      approvalsCollected: [
        { role: 'COMPLIANCE', approverId: 'compliance-rajesh', approvedAt: '2026-09-27T11:02:00Z', comment: 'GDRFA permit authentic.' }
      ],
      status: 'APPROVED',
      createdAt: '2026-09-27T10:58:00Z'
    }
  ];

  /**
   * List all pending or historical approval requests
   */
  static listApprovalRequests(filter?: { status?: ApprovalStatus; role?: string }): ApprovalRequest[] {
    let list = [...this.approvalRequests];
    if (filter?.status) {
      list = list.filter(r => r.status === filter.status);
    }
    if (filter?.role) {
      list = list.filter(r => r.requiredRoles.includes(filter.role!));
    }
    return list;
  }

  /**
   * Submit document for approval
   */
  static submitForApproval(
    documentId: string,
    requestedBy: string
  ): ApprovalRequest {
    const doc = DMS8VaultService.getDocumentById(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const chain = CANONICAL_APPROVAL_CHAINS.find(c => c.documentType === doc.documentType) || {
      id: 'default-chain',
      name: 'Default Manager Approval Chain',
      documentType: doc.documentType,
      requiredRoles: ['MANAGER'] as any,
      minimumApprovals: 1,
      autoEscalateHours: 24
    };

    const newReq: ApprovalRequest = {
      id: `appr-${Date.now()}`,
      documentId,
      documentTitle: doc.title,
      documentType: doc.documentType,
      requestedBy,
      chainRuleId: chain.id,
      requiredRoles: chain.requiredRoles,
      approvalsCollected: [],
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.approvalRequests.unshift(newReq);
    DMS8VaultService.updateDocument(documentId, { approvalStatus: 'PENDING' });
    return newReq;
  }

  /**
   * Approve Request
   */
  static approve(
    requestId: string,
    approver: { id: string; role: string },
    comment: string = 'Approved'
  ): ApprovalRequest {
    const req = this.approvalRequests.find(r => r.id === requestId);
    if (!req) throw new Error(`Approval Request ${requestId} not found`);

    req.approvalsCollected.push({
      role: approver.role,
      approverId: approver.id,
      approvedAt: new Date().toISOString(),
      comment
    });

    // Check if required roles are fulfilled
    const distinctRoles = new Set(req.approvalsCollected.map(a => a.role));
    const allFulfilled = req.requiredRoles.every(r => distinctRoles.has(r));

    if (allFulfilled) {
      req.status = 'APPROVED';
      DMS8VaultService.updateDocument(req.documentId, {
        approvalStatus: 'APPROVED',
        approvedBy: approver.id
      });
    }

    return req;
  }

  /**
   * Reject Request
   */
  static reject(
    requestId: string,
    approver: { id: string; role: string },
    reason: string
  ): ApprovalRequest {
    const req = this.approvalRequests.find(r => r.id === requestId);
    if (!req) throw new Error(`Approval Request ${requestId} not found`);

    req.status = 'REJECTED';
    req.approvalsCollected.push({
      role: approver.role,
      approverId: approver.id,
      approvedAt: new Date().toISOString(),
      comment: `REJECTED: ${reason}`
    });

    DMS8VaultService.updateDocument(req.documentId, { approvalStatus: 'REJECTED' });
    return req;
  }
}
