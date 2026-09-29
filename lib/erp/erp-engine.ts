/**
 * Travel Planet (Voyage8) — ERP Engine
 * Part 2 of the Unified Operational Chain: CRM -> ERP -> Accounting
 * 
 * Manages:
 * - Booking Operations & Component Task Generation (Flight, Hotel, Transfer, Experience, Document, Payment)
 * - Trip Command Center & Trip Lifecycle Engine (PLANNED -> CONFIRMATION -> PRE_TRAVEL -> ACTIVE -> COMPLETED -> POST_TRIP)
 * - Supplier Management & Procurement (PO, Supplier Bill, Service Receipts)
 * - Operational Inventory States (AVAILABLE, HELD, RESERVED, CONFIRMED, SOLD, BLOCKED, EXPIRED)
 * - Configurable Workflow Engine
 * - Central Approval Center (Booking, Discount, Refund, Supplier Payment, AI Action)
 * - Task & SLA Engine with countdowns and escalation
 */

export type OperationalTaskType = 
  | 'FLIGHT_TICKETING' 
  | 'HOTEL_VOUCHER' 
  | 'TRANSFER_DISPATCH' 
  | 'EXPERIENCE_CONFIRMATION' 
  | 'VISA_VERIFICATION' 
  | 'PAYMENT_AUDIT';

export type TaskStatus = 
  | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING' 
  | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';

export interface OperationalTask {
  id: string;
  bookingId: string;
  tripId?: string;
  type: OperationalTaskType;
  title: string;
  department: 'FLIGHT_DESK' | 'HOSPITALITY_DESK' | 'GROUND_OPS' | 'VISA_CONCIERGE' | 'FINANCE_AUDIT';
  assignedUser?: string;
  team: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: TaskStatus;
  slaMinutes: number;
  slaExpiresAt: string;
  dueAt: string;
  supplierRef?: string;
  dependencies?: string[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type TripLifecycleStage = 
  | 'PLANNED' 
  | 'BOOKING' 
  | 'CONFIRMATION' 
  | 'PRE_TRAVEL' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'POST_TRIP';

export interface TripComponentStatus {
  flight: 'PENDING' | 'ISSUED' | 'FAILED';
  hotel: 'PENDING' | 'CONFIRMED' | 'FAILED';
  transfer: 'PENDING' | 'DISPATCHED' | 'FAILED';
  experience: 'PENDING' | 'CONFIRMED' | 'FAILED';
  visa: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  payment: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
}

export interface ERPTrip {
  id: string;
  tripNumber: string;
  customerId: string;
  customerName: string;
  destination: string;
  startDate: string;
  endDate: string;
  paxCount: number;
  stage: TripLifecycleStage;
  components: TripComponentStatus;
  allFulfilled: boolean;
  assignedOpsAgent: string;
  emergencyHotlineAssigned: string;
}

export interface SupplierPurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  bookingId: string;
  category: 'AIRLINE' | 'HOTEL_DMC' | 'TRANSFER_OPERATOR' | 'ACTIVITY_OPERATOR';
  currency: string;
  totalCost: number;
  paymentTerms: 'PREPAID' | 'NET_15' | 'NET_30' | 'PAY_AT_CHECKOUT';
  status: 'DRAFT' | 'ISSUED' | 'CONFIRMED' | 'SETTLED' | 'CANCELLED';
  serviceConfirmationRef?: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  category: 'BOOKING_DISCOUNT' | 'REFUND_REQUEST' | 'SUPPLIER_PAYMENT' | 'PURCHASE_ORDER' | 'AI_ACTION';
  referenceId: string;
  title: string;
  requestedBy: string;
  amount?: number;
  currency?: string;
  urgency: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewer?: string;
  reviewedAt?: string;
  reason: string;
  createdAt: string;
}

export class ERPEngine {
  /**
   * Generates component fulfillment tasks when a Booking is confirmed in CRM/Commerce
   */
  public static generateBookingTasks(booking: {
    id: string;
    bookingNumber: string;
    hasFlight: boolean;
    hasHotel: boolean;
    hasTransfer: boolean;
    hasExperience: boolean;
    requiresVisa: boolean;
    customerName: string;
  }): OperationalTask[] {
    const tasks: OperationalTask[] = [];
    const now = Date.now();

    if (booking.hasFlight) {
      tasks.push({
        id: `tsk_flt_${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: booking.id,
        type: 'FLIGHT_TICKETING',
        title: `Issue NDC Flight E-Tickets for ${booking.customerName} (${booking.bookingNumber})`,
        department: 'FLIGHT_DESK',
        team: 'Airline Ticketing Desk',
        priority: 'HIGH',
        status: 'OPEN',
        slaMinutes: 60,
        slaExpiresAt: new Date(now + 60 * 60000).toISOString(),
        dueAt: new Date(now + 120 * 60000).toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    if (booking.hasHotel) {
      tasks.push({
        id: `tsk_htl_${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: booking.id,
        type: 'HOTEL_VOUCHER',
        title: `Dispatch Direct Hotel Reservation & Voucher (${booking.bookingNumber})`,
        department: 'HOSPITALITY_DESK',
        team: 'DMC Hotel Coordination',
        priority: 'MEDIUM',
        status: 'OPEN',
        slaMinutes: 120,
        slaExpiresAt: new Date(now + 120 * 60000).toISOString(),
        dueAt: new Date(now + 240 * 60000).toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    if (booking.hasTransfer) {
      tasks.push({
        id: `tsk_trf_${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: booking.id,
        type: 'TRANSFER_DISPATCH',
        title: `Chauffeur Airport Transfer Allocation (${booking.bookingNumber})`,
        department: 'GROUND_OPS',
        team: 'Airport Dispatch Team',
        priority: 'MEDIUM',
        status: 'OPEN',
        slaMinutes: 240,
        slaExpiresAt: new Date(now + 240 * 60000).toISOString(),
        dueAt: new Date(now + 480 * 60000).toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    if (booking.hasExperience) {
      tasks.push({
        id: `tsk_exp_${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: booking.id,
        type: 'EXPERIENCE_CONFIRMATION',
        title: `Local DMC Excursion Slot Lock (${booking.bookingNumber})`,
        department: 'GROUND_OPS',
        team: 'Experience Dispatch Desk',
        priority: 'MEDIUM',
        status: 'OPEN',
        slaMinutes: 180,
        slaExpiresAt: new Date(now + 180 * 60000).toISOString(),
        dueAt: new Date(now + 360 * 60000).toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    if (booking.requiresVisa) {
      tasks.push({
        id: `tsk_vis_${Math.floor(1000 + Math.random() * 9000)}`,
        bookingId: booking.id,
        type: 'VISA_VERIFICATION',
        title: `MRZ Passport OCR & eVisa Filing (${booking.customerName})`,
        department: 'VISA_CONCIERGE',
        team: 'Consular Visa Ops',
        priority: 'CRITICAL',
        status: 'OPEN',
        slaMinutes: 90,
        slaExpiresAt: new Date(now + 90 * 60000).toISOString(),
        dueAt: new Date(now + 180 * 60000).toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    return tasks;
  }

  /**
   * Generates a Supplier Purchase Order for external procurement
   */
  public static createPurchaseOrder(params: {
    supplierId: string;
    supplierName: string;
    bookingId: string;
    category: SupplierPurchaseOrder['category'];
    currency: string;
    totalCost: number;
    paymentTerms?: SupplierPurchaseOrder['paymentTerms'];
  }): SupplierPurchaseOrder {
    return {
      id: `po_${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      supplierId: params.supplierId,
      supplierName: params.supplierName,
      bookingId: params.bookingId,
      category: params.category,
      currency: params.currency || 'INR',
      totalCost: params.totalCost,
      paymentTerms: params.paymentTerms || 'NET_30',
      status: 'CONFIRMED',
      serviceConfirmationRef: `CONF-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Evaluates Trip Readiness across all operational components
   */
  public static evaluateTripReadiness(components: TripComponentStatus): {
    isReadyForTravel: boolean;
    pendingComponents: string[];
    readinessScore: number;
  } {
    const pending: string[] = [];
    let score = 0;
    const totalWeight = 6;

    if (components.flight === 'ISSUED') score++; else pending.push('Flight Tickets');
    if (components.hotel === 'CONFIRMED') score++; else pending.push('Hotel Voucher');
    if (components.transfer === 'DISPATCHED') score++; else pending.push('Airport Transfer');
    if (components.experience === 'CONFIRMED') score++; else pending.push('Experience Confirmation');
    if (components.visa === 'APPROVED' || components.visa === 'NOT_REQUIRED') score++; else pending.push('Visa Verification');
    if (components.payment === 'PAID') score++; else pending.push('Payment Settlement');

    const readinessScore = Math.round((score / totalWeight) * 100);

    return {
      isReadyForTravel: pending.length === 0,
      pendingComponents: pending,
      readinessScore
    };
  }
}
