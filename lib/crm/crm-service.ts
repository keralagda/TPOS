/**
 * Travel Planet — CRM & Customer 360 Service
 * Governing document: 08_CRM_ERP_FINANCE.md, 07_ADMIN_OS.md
 * 
 * Pipeline stages:
 * LEAD -> INQUIRY -> REQUIREMENT -> PROPOSAL -> QUOTE -> NEGOTIATION -> BOOKING -> TRAVEL -> POST_TRIP
 */

export type PipelineStage =
  | 'LEAD'
  | 'INQUIRY'
  | 'REQUIREMENT'
  | 'PROPOSAL'
  | 'QUOTE'
  | 'NEGOTIATION'
  | 'BOOKING'
  | 'TRAVEL'
  | 'POST_TRIP';

export interface Customer360Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP';
  pipelineStage: PipelineStage;
  totalLifetimeValue: number;
  completedTripsCount: number;
  activeBookings: string[];
  preferences: string[];
  cases: CustomerCase[];
  createdAt: Date;
}

export interface CustomerCase {
  caseId: string;
  caseNumber: string;
  customerId: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
}

export class CRMOperationsService {
  private static instance: CRMOperationsService;
  private customers: Map<string, Customer360Profile> = new Map();

  private constructor() {
    this.seedCRMData();
  }

  static getInstance(): CRMOperationsService {
    if (!CRMOperationsService.instance) {
      CRMOperationsService.instance = new CRMOperationsService();
    }
    return CRMOperationsService.instance;
  }

  private seedCRMData(): void {
    const c1: Customer360Profile = {
      id: 'cust_amal_01',
      name: 'Amal Babu',
      email: 'amal.babu@travelplanet.com',
      phone: '+91 98460 00000',
      tier: 'VIP',
      pipelineStage: 'BOOKING',
      totalLifetimeValue: 124800,
      completedTripsCount: 3,
      activeBookings: ['TP-9082'],
      preferences: ['Window Seat', 'High Floor Hotel', 'Private Airport Transfers'],
      cases: [],
      createdAt: new Date('2025-06-15'),
    };

    const c2: Customer360Profile = {
      id: 'cust_pooja_02',
      name: 'Pooja Menon',
      email: 'pooja.menon@example.com',
      phone: '+91 98765 43210',
      tier: 'GOLD',
      pipelineStage: 'PROPOSAL',
      totalLifetimeValue: 74900,
      completedTripsCount: 1,
      activeBookings: ['TP-9081'],
      preferences: ['Vegetarian Meals', 'Beachfront Resort'],
      cases: [
        {
          caseId: 'case_101',
          caseNumber: 'CS-8812',
          customerId: 'cust_pooja_02',
          subject: 'Request for early hotel check-in at Bali',
          priority: 'MEDIUM',
          status: 'OPEN',
          createdAt: new Date('2026-09-22'),
        },
      ],
      createdAt: new Date('2026-01-10'),
    };

    this.customers.set(c1.id, c1);
    this.customers.set(c2.id, c2);
  }

  getAllCustomers(): Customer360Profile[] {
    return Array.from(this.customers.values());
  }

  advancePipelineStage(customerId: string, nextStage: PipelineStage): Customer360Profile {
    const cust = this.customers.get(customerId);
    if (!cust) throw new Error(`Customer ${customerId} not found.`);
    cust.pipelineStage = nextStage;
    return cust;
  }
}

export const crmService = CRMOperationsService.getInstance();
