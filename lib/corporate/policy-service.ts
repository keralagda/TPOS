/**
 * Corporate Travel Policy Engine & Approval Lifecycle
 * Conforms to §25 (25_CORPORATE_TRAVEL.md)
 * Policy Rules: Cabin Class, Per Diem, Advance Booking Window, Cost Centers, Approvals
 */

export interface CorporatePolicy {
  policyId: string;
  name: string;
  maxBudgetInr: number;
  maxHotelPerNightInr: number;
  allowedFlightCabins: ('ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS')[];
  minAdvanceBookingDays: number;
  requiresDirectorApprovalAboveInr: number;
}

export const DEFAULT_CORPORATE_POLICY: CorporatePolicy = {
  policyId: 'corp-standard-policy-2026',
  name: 'Standard Indian Enterprise Travel Policy',
  maxBudgetInr: 150000,
  maxHotelPerNightInr: 9000,
  allowedFlightCabins: ['ECONOMY', 'PREMIUM_ECONOMY'],
  minAdvanceBookingDays: 7,
  requiresDirectorApprovalAboveInr: 100000,
};

export interface CorporateTripRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string; // 'STAFF' | 'MANAGER' | 'DIRECTOR'
  costCenter: string;
  destination: string;
  departureDate: string;
  totalCostInr: number;
  flightCabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS';
  hotelRatePerNightInr: number;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING_MANAGER' | 'PENDING_DIRECTOR' | 'APPROVED' | 'REJECTED' | 'BOOKED';
  policyViolations: string[];
}

export class CorporatePolicyService {
  /**
   * Evaluate a corporate travel booking request against enterprise policy
   */
  static evaluatePolicy(request: Partial<CorporateTripRequest>, policy: CorporatePolicy = DEFAULT_CORPORATE_POLICY): {
    isCompliant: boolean;
    violations: string[];
    requiresDirectorApproval: boolean;
  } {
    const violations: string[] = [];

    // 1. Budget check
    if (request.totalCostInr && request.totalCostInr > policy.maxBudgetInr) {
      violations.push(`Total request (₹${request.totalCostInr.toLocaleString('en-IN')}) exceeds max budget limit (₹${policy.maxBudgetInr.toLocaleString('en-IN')}).`);
    }

    // 2. Hotel nightly rate check
    if (request.hotelRatePerNightInr && request.hotelRatePerNightInr > policy.maxHotelPerNightInr) {
      violations.push(`Hotel rate (₹${request.hotelRatePerNightInr}/night) exceeds permissible limit (₹${policy.maxHotelPerNightInr}/night).`);
    }

    // 3. Cabin class check
    if (request.flightCabin && !policy.allowedFlightCabins.includes(request.flightCabin)) {
      if (request.employeeRole !== 'DIRECTOR') {
        violations.push(`Cabin class "${request.flightCabin}" requires Director grade or exception waiver.`);
      }
    }

    // 4. Advance booking days check
    if (request.departureDate) {
      const departure = new Date(request.departureDate);
      const now = new Date();
      const diffDays = Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < policy.minAdvanceBookingDays) {
        violations.push(`Booking made ${diffDays} days ahead. Policy mandates minimum ${policy.minAdvanceBookingDays} days advance notice.`);
      }
    }

    const requiresDirectorApproval =
      (request.totalCostInr || 0) > policy.requiresDirectorApprovalAboveInr ||
      violations.length > 0;

    return {
      isCompliant: violations.length === 0,
      violations,
      requiresDirectorApproval,
    };
  }

  /**
   * Process state machine transition for corporate approval
   */
  static processApproval(
    currentRequest: CorporateTripRequest,
    action: 'APPROVE' | 'REJECT',
    approverRole: 'MANAGER' | 'DIRECTOR' | 'FINANCE_MANAGER',
    comments?: string
  ): CorporateTripRequest {
    if (action === 'REJECT') {
      return {
        ...currentRequest,
        status: 'REJECTED',
        policyViolations: [...currentRequest.policyViolations, `Rejected by ${approverRole}: ${comments || 'No comment'}`],
      };
    }

    // Approval transitions
    if (currentRequest.status === 'PENDING_MANAGER' && (approverRole === 'MANAGER' || approverRole === 'DIRECTOR')) {
      if (currentRequest.policyViolations.length > 0 || currentRequest.totalCostInr > DEFAULT_CORPORATE_POLICY.requiresDirectorApprovalAboveInr) {
        return { ...currentRequest, status: 'PENDING_DIRECTOR' };
      }
      return { ...currentRequest, status: 'APPROVED' };
    }

    if (currentRequest.status === 'PENDING_DIRECTOR' && approverRole === 'DIRECTOR') {
      return { ...currentRequest, status: 'APPROVED' };
    }

    return currentRequest;
  }
}
