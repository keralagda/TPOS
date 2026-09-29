/**
 * TP-H8 TRAVEL CONTROL TOWER & REAL-TIME INCIDENT RADAR
 * Mission Control monitoring Bookings, Flights, Hotels, Documents, Payments, Supplier Tasks, and Incidents.
 */

export type OperationalEventType = 
  | 'BOOKING_CREATED'
  | 'PAYMENT_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'VISA_APPROVED'
  | 'JOURNEY_STARTED'
  | 'FLIGHT_DELAYED'
  | 'SUPPLIER_CONFIRMED'
  | 'INCIDENT_RAISED';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface OperationalEvent {
  id: string;
  type: OperationalEventType;
  severity: IncidentSeverity;
  bookingRef: string;
  travelerName: string;
  destination: string;
  summary: string;
  timestamp: string;
  resolved: boolean;
  assignedTo?: string;
  actionTaken?: string;
}

export interface ControlTowerMetrics {
  activeTripsInFlight: number;
  criticalIncidentsCount: number;
  pendingSupplierConfirmations: number;
  flightDelayAlerts: number;
  visaPendingArrivalCount: number;
  dispatchedConciergesCount: number;
}

export class TravelControlTowerService {
  private static events: OperationalEvent[] = [
    {
      id: 'evt-001',
      type: 'FLIGHT_DELAYED',
      severity: 'HIGH',
      bookingRef: 'TP-DXB-881',
      travelerName: 'Rahul Kumar',
      destination: 'Dubai (DXB)',
      summary: 'Emirates EK-531 delayed by 3h 40m due to air traffic control in Mumbai. Chauffeur arrival rescheduled.',
      timestamp: '2026-09-29T00:02:00Z',
      resolved: false,
      assignedTo: 'Ops Concierge Team'
    },
    {
      id: 'evt-002',
      type: 'INCIDENT_RAISED',
      severity: 'MEDIUM',
      bookingRef: 'TP-KL-984',
      travelerName: 'Sunita Mehra',
      destination: 'Alleppey Backwaters',
      summary: 'Flash monsoon rain alert. Living Journey dynamic trigger rerouted afternoon kayaking to indoor Kathakali.',
      timestamp: '2026-09-28T22:30:00Z',
      resolved: true,
      actionTaken: 'Rerouted successfully with customer consent & pushed WhatsApp alert.'
    },
    {
      id: 'evt-003',
      type: 'VISA_APPROVED',
      severity: 'LOW',
      bookingRef: 'TP-DXB-881',
      travelerName: 'Rahul Kumar',
      destination: 'Dubai, UAE',
      summary: 'UAE GDRFA E-Visa verified and archived in DMS8 Digital Vault.',
      timestamp: '2026-09-28T21:10:00Z',
      resolved: true
    },
    {
      id: 'evt-004',
      type: 'SUPPLIER_CONFIRMED',
      severity: 'LOW',
      bookingRef: 'TP-KL-984',
      travelerName: 'Sunita Mehra',
      destination: 'Kumarakom Lake Resort',
      summary: 'Heritage Lake Villa confirmed with complimentary Ayurvedic rejuvenation session.',
      timestamp: '2026-09-28T19:45:00Z',
      resolved: true
    },
    {
      id: 'evt-005',
      type: 'PAYMENT_COMPLETED',
      severity: 'LOW',
      bookingRef: 'TP-RJ-310',
      travelerName: 'Vikram Patel',
      destination: 'Udaipur, Rajasthan',
      summary: 'Received ₹45,000 via Razorpay UPI. Tax invoice INV-2026-0891 dispatched.',
      timestamp: '2026-09-28T18:12:00Z',
      resolved: true
    }
  ];

  /**
   * Get Live Events Feed
   */
  static getLiveEvents(filterSeverity?: IncidentSeverity): OperationalEvent[] {
    if (filterSeverity) {
      return this.events.filter(e => e.severity === filterSeverity);
    }
    return this.events;
  }

  /**
   * Get Mission Control KPIs
   */
  static getMetrics(): ControlTowerMetrics {
    return {
      activeTripsInFlight: 48,
      criticalIncidentsCount: this.events.filter(e => e.severity === 'CRITICAL' && !e.resolved).length,
      pendingSupplierConfirmations: 3,
      flightDelayAlerts: this.events.filter(e => e.type === 'FLIGHT_DELAYED' && !e.resolved).length,
      visaPendingArrivalCount: 1,
      dispatchedConciergesCount: 18
    };
  }

  /**
   * Log real-time event
   */
  static broadcastEvent(event: Omit<OperationalEvent, 'id' | 'timestamp' | 'resolved'>): OperationalEvent {
    const newEvt: OperationalEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    this.events.unshift(newEvt);
    return newEvt;
  }

  /**
   * Resolve an incident
   */
  static resolveIncident(eventId: string, actionTaken: string): OperationalEvent {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) throw new Error(`Event ${eventId} not found`);
    evt.resolved = true;
    evt.actionTaken = actionTaken;
    return evt;
  }
}
