/**
 * Travel Planet — Booking & Operations Engine
 * Governing document: 15_IMPLEMENTATION_PHASES.md (Phase 2), 07_ADMIN_OS.md, 08_CRM_ERP_FINANCE.md
 * 
 * Rules:
 * - Immutable booking lifecycle state transitions.
 * - Consequential actions (cancellation, refund, ticket issue) require audit logging and permission verification.
 * - Integration with PaymentHub and LedgerService.
 */

import { auditLogger } from '../audit/audit-logger';

export type BookingLifecycleState =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_VERIFIED'
  | 'CONFIRMED'
  | 'TICKETED'
  | 'ACTIVE_TRAVEL'
  | 'COMPLETED'
  | 'CANCELLATION_REQUESTED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
  passportNumber?: string;
  seatPreference?: string;
}

export interface BookingDetails {
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageTitle: string;
  destination: string;
  travelDates: {
    startDate: Date;
    endDate: Date;
  };
  passengers: PassengerInfo[];
  financials: {
    currency: string;
    grossAmount: number;
    taxAmount: number;
    supplierCost: number;
    platformCommission: number;
    netAmountPaid: number;
  };
  status: BookingLifecycleState;
  fulfillmentStage?: 'ISSUANCE_PENDING' | 'ISSUED' | 'FAILED' | string;
  ticketVouchers: TicketVoucher[];
  auditHistory: { state: BookingLifecycleState; timestamp: Date; actor: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketVoucher {
  voucherId: string;
  serviceType: 'FLIGHT' | 'HOTEL' | 'TRANSFER' | 'EXPERIENCE';
  providerCode: string;
  serviceName: string;
  confirmationCode: string;
  validDate: Date;
  details: Record<string, unknown>;
}

export class BookingOperationsService {
  private static instance: BookingOperationsService;
  private bookings: Map<string, BookingDetails> = new Map();

  private constructor() {
    this.seedInitialBookings();
  }

  static getInstance(): BookingOperationsService {
    if (!BookingOperationsService.instance) {
      BookingOperationsService.instance = new BookingOperationsService();
    }
    return BookingOperationsService.instance;
  }

  private seedInitialBookings(): void {
    const b1: BookingDetails = {
      bookingId: 'bk_dubai_001',
      bookingNumber: 'TP-9082',
      customerId: 'usr_amal_01',
      customerName: 'Amal Babu',
      customerEmail: 'amal.babu@travelplanet.com',
      customerPhone: '+91 98460 00000',
      packageTitle: 'Dubai Highlights & Marina Yacht',
      destination: 'Dubai, UAE',
      travelDates: {
        startDate: new Date('2026-10-12'),
        endDate: new Date('2026-10-17'),
      },
      passengers: [
        { firstName: 'Amal', lastName: 'Babu', type: 'ADULT', passportNumber: 'P1234567' },
        { firstName: 'Maya', lastName: 'Amal', type: 'ADULT', passportNumber: 'P7654321' },
      ],
      financials: {
        currency: 'INR',
        grossAmount: 49999,
        taxAmount: 2500,
        supplierCost: 42000,
        platformCommission: 7999,
        netAmountPaid: 52499,
      },
      status: 'CONFIRMED',
      fulfillmentStage: 'ISSUANCE_PENDING',
      ticketVouchers: [
        {
          voucherId: 'vch_fl_01',
          serviceType: 'FLIGHT',
          providerCode: 'EK',
          serviceName: 'Emirates EK-512 (COK -> DXB)',
          confirmationCode: 'EK-DXB-98124',
          validDate: new Date('2026-10-12T04:30:00Z'),
          details: { seats: '14A, 14B', baggage: '30kg' },
        },
        {
          voucherId: 'vch_ht_01',
          serviceType: 'HOTEL',
          providerCode: 'BOOKING_COM',
          serviceName: 'Atlantis The Palm — Ocean King Suite',
          confirmationCode: 'ATL-RES-8821',
          validDate: new Date('2026-10-12T14:00:00Z'),
          details: { nights: 4, mealPlan: 'Breakfast & Dinner' },
        },
        {
          voucherId: 'vch_tr_01',
          serviceType: 'TRANSFER',
          providerCode: 'LOCAL_OPERATOR',
          serviceName: 'Dubai Airport to Atlantis Luxury Sedan',
          confirmationCode: 'DXB-TR-301',
          validDate: new Date('2026-10-12T08:00:00Z'),
          details: { vehicle: 'Lexus ES 300h' },
        },
      ],
      auditHistory: [
        { state: 'DRAFT', timestamp: new Date('2026-09-20'), actor: 'CUSTOMER' },
        { state: 'PENDING_PAYMENT', timestamp: new Date('2026-09-20T10:00:00Z'), actor: 'CUSTOMER' },
        { state: 'CONFIRMED', timestamp: new Date('2026-09-20T10:05:00Z'), actor: 'PAYMENT_HUB' },
      ],
      createdAt: new Date('2026-09-20'),
      updatedAt: new Date('2026-09-20T10:05:00Z'),
    };

    this.bookings.set(b1.bookingNumber, b1);
  }

  getAllBookings(): BookingDetails[] {
    return Array.from(this.bookings.values());
  }

  getBookingByNumber(bookingNumber: string): BookingDetails | undefined {
    return this.bookings.get(bookingNumber);
  }

  getBooking(bookingNumber: string): BookingDetails | undefined {
    return this.getBookingByNumber(bookingNumber);
  }

  async issueTickets(bookingNumber: string, actorEmail: string): Promise<BookingDetails> {
    const booking = this.bookings.get(bookingNumber);
    if (!booking) throw new Error(`Booking ${bookingNumber} not found.`);

    if (booking.status !== 'CONFIRMED') {
      throw new Error(`Cannot issue tickets for booking in state: ${booking.status}. Must be CONFIRMED.`);
    }

    booking.status = 'TICKETED';
    booking.updatedAt = new Date();
    booking.auditHistory.push({
      state: 'TICKETED',
      timestamp: new Date(),
      actor: actorEmail,
    });

    await auditLogger.log({
      userEmail: actorEmail,
      action: 'UPDATE',
      entityType: 'Booking',
      entityId: bookingNumber,
      changes: { status: { before: 'CONFIRMED', after: 'TICKETED' } },
      timestamp: new Date(),
    });

    return booking;
  }

  async processCancellation(
    bookingNumber: string,
    reason: string,
    actorEmail: string,
    cancellationFee: number = 5000
  ): Promise<{ booking: BookingDetails; refundAmount: number }> {
    const booking = this.bookings.get(bookingNumber);
    if (!booking) throw new Error(`Booking ${bookingNumber} not found.`);

    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      throw new Error(`Booking ${bookingNumber} is already ${booking.status}.`);
    }

    const previousState = booking.status;
    booking.status = 'CANCELLED';
    booking.updatedAt = new Date();
    booking.auditHistory.push({
      state: 'CANCELLED',
      timestamp: new Date(),
      actor: actorEmail,
    });

    const refundAmount = Math.max(0, booking.financials.netAmountPaid - cancellationFee);

    await auditLogger.log({
      userEmail: actorEmail,
      action: 'AUTHORIZE',
      entityType: 'Booking',
      entityId: bookingNumber,
      metadata: { reason, cancellationFee, refundAmount },
      changes: { status: { before: previousState, after: 'CANCELLED' } },
      timestamp: new Date(),
    });

    return { booking, refundAmount };
  }
}

export const bookingService = BookingOperationsService.getInstance();
