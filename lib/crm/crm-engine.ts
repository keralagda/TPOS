/**
 * Travel Planet (Voyage8) — CRM Engine
 * Part 1 of the Unified Operational Chain: CRM -> ERP -> Accounting
 * 
 * Manages:
 * - Customers & Customer 360 aggregation
 * - Leads (14 Sources, 11 Statuses, Scoring)
 * - Enquiries (Specific travel requirements distinct from Leads)
 * - Opportunities (Commercially qualified requirements with probability)
 * - Quotes (Cost, Margin, Selling Price, Tax, Expiry, Conversion to Booking)
 * - Follow-up Work Queue & Activities
 * - CRM AI Assistant (RBAC-scoped summarization & recommendations)
 */

export interface CRMCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lifecycle: 'PROSPECT' | 'LEAD' | 'CUSTOMER' | 'VIP' | 'REPEAT_TRAVELER';
  tier: 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalSpend: number;
  openEnquiriesCount: number;
  activeBookingsCount: number;
  tags: string[];
  familyMembers?: { name: string; relationship: string; passportNumber?: string }[];
  preferences?: { seatPreference?: string; mealPreference?: string; preferredAirlines?: string[] };
}

export type LeadSource = 
  | 'WEBSITE' | 'GOOGLE' | 'SEO' | 'INSTAGRAM' | 'FACEBOOK' 
  | 'WHATSAPP' | 'PHONE' | 'EMAIL' | 'REFERRAL' | 'PARTNER' 
  | 'TRAVEL_AGENCY' | 'CAMPAIGN' | 'WALK_IN' | 'API';

export type LeadStatus = 
  | 'NEW' | 'ASSIGNED' | 'CONTACTED' | 'QUALIFIED' 
  | 'REQUIREMENT_CAPTURED' | 'QUOTE_REQUESTED' | 'QUOTED' 
  | 'NEGOTIATION' | 'WON' | 'LOST' | 'NURTURE';

export interface CRMLead {
  id: string;
  source: LeadSource;
  customerId?: string;
  contactName: string;
  email: string;
  phone: string;
  assignedTo: string; // Agent ID or Name
  destination: string;
  travelDate?: string;
  travellerCount: number;
  estimatedBudget: number;
  travelType: 'LEISURE' | 'HONEYMOON' | 'CORPORATE' | 'FAMILY' | 'ADVENTURE' | 'LUXURY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: LeadStatus;
  score: number; // 0 - 100
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMEnquiry {
  id: string;
  customerId: string;
  destination: string;
  origin: string;
  travelDates: { departure: string; returnDate: string };
  pax: { adults: number; children: number; infants: number };
  rooms: number;
  budget: number;
  preferredAirlines: string[];
  hotelPreference: '3_STAR' | '4_STAR' | '5_STAR' | 'LUXURY_VILLA';
  activities: string[];
  visaRequired: boolean;
  transportPreference: 'PRIVATE' | 'SHARED' | 'SELF_DRIVE';
  urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
  status: 'OPEN' | 'QUOTED' | 'CONVERTED' | 'CANCELLED';
  createdAt: string;
}

export interface CRMOpportunity {
  id: string;
  enquiryId: string;
  customerId: string;
  title: string;
  expectedBookingValue: number;
  estimatedCost: number;
  estimatedMargin: number;
  probability: number; // Percentage 0 - 100
  expectedClosingDate: string;
  assignedAgent: string;
  stage: 'QUALIFIED' | 'REQUIREMENT' | 'PRODUCT_MATCH' | 'QUOTE' | 'NEGOTIATION' | 'APPROVAL' | 'PAYMENT' | 'WON' | 'LOST';
  competitors?: string[];
  lostReason?: string;
}

export interface CRMQuoteItem {
  id: string;
  category: 'FLIGHT' | 'HOTEL' | 'EXPERIENCE' | 'TRANSFER' | 'VISA' | 'INSURANCE';
  description: string;
  supplierCost: number;
  markupPercent: number;
  sellingPrice: number;
  taxRatePercent: number;
}

export interface CRMQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
  enquiryId?: string;
  agentId: string;
  validUntil: string;
  currency: string;
  items: CRMQuoteItem[];
  totalCost: number;
  subtotalSellingPrice: number;
  discountAmount: number;
  taxAmount: number; // GST + TCS if applicable
  totalQuoteAmount: number;
  marginAmount: number;
  marginPercent: number;
  terms: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'NEGOTIATION' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED' | 'CONVERTED';
  convertedBookingId?: string;
  createdAt: string;
}

export interface CRMFollowUp {
  id: string;
  entityType: 'LEAD' | 'ENQUIRY' | 'QUOTE' | 'CUSTOMER';
  entityId: string;
  customerName: string;
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'QUOTE_FOLLOWUP' | 'PAYMENT_REMINDER' | 'DOCUMENT_REMINDER' | 'POST_TRIP';
  assignedTo: string;
  dueDate: string;
  dueTime: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SNOOZED';
  notes?: string;
}

export interface Customer360Profile {
  customer: CRMCustomer;
  crm: {
    leads: CRMLead[];
    enquiries: CRMEnquiry[];
    opportunities: CRMOpportunity[];
    quotes: CRMQuote[];
    followUps: CRMFollowUp[];
  };
  travel: {
    bookings: any[];
    trips: any[];
    favoriteDestinations: string[];
  };
  finance: {
    totalSpent: number;
    outstandingBalance: number;
    invoicesCount: number;
    tcsAccumulatedFY: number;
    panNumber?: string;
  };
  support: {
    openTickets: number;
    resolvedTickets: number;
    csatScore: number;
  };
  documents: {
    passportNumber?: string;
    passportExpiry?: string;
    visaStatus: Record<string, string>;
  };
  activity: {
    timestamp: string;
    type: string;
    description: string;
    actor: string;
  }[];
  aiSummary: {
    personality: string;
    recommendedNextAction: string;
    propensityToBook: number;
    upsellOpportunities: string[];
  };
}

export class CRMEngine {
  /**
   * Calculate Quote Financials (Cost, Margin, Selling Price, Statutory Tax)
   */
  public static calculateQuote(
    items: { category: CRMQuoteItem['category']; description: string; supplierCost: number; markupPercent: number; taxRatePercent?: number }[],
    discount = 0
  ): {
    items: CRMQuoteItem[];
    totalCost: number;
    subtotalSellingPrice: number;
    taxAmount: number;
    totalQuoteAmount: number;
    marginAmount: number;
    marginPercent: number;
  } {
    let totalCost = 0;
    let subtotalSellingPrice = 0;
    let taxAmount = 0;

    const calculatedItems: CRMQuoteItem[] = items.map((item, idx) => {
      const taxRate = item.taxRatePercent ?? 5.0; // Default 5% GST on tour components
      const selling = Math.round(item.supplierCost * (1 + item.markupPercent / 100));
      const tax = Math.round(selling * (taxRate / 100));

      totalCost += item.supplierCost;
      subtotalSellingPrice += selling;
      taxAmount += tax;

      return {
        id: `qi_${idx + 1}`,
        category: item.category,
        description: item.description,
        supplierCost: item.supplierCost,
        markupPercent: item.markupPercent,
        sellingPrice: selling,
        taxRatePercent: taxRate
      };
    });

    const netSelling = subtotalSellingPrice - discount;
    const marginAmount = netSelling - totalCost;
    const marginPercent = netSelling > 0 ? parseFloat(((marginAmount / netSelling) * 100).toFixed(2)) : 0;
    const totalQuoteAmount = netSelling + taxAmount;

    return {
      items: calculatedItems,
      totalCost,
      subtotalSellingPrice: netSelling,
      taxAmount,
      totalQuoteAmount,
      marginAmount,
      marginPercent
    };
  }

  /**
   * Convert Quote into Booking Intent for ERP
   */
  public static convertQuoteToBooking(quote: CRMQuote, customer: CRMCustomer): {
    bookingNumber: string;
    totalAmount: number;
    netAmount: number;
    taxAmount: number;
    customerName: string;
    itemsCount: number;
  } {
    const bookingNumber = `TP-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      bookingNumber,
      totalAmount: quote.totalQuoteAmount,
      netAmount: quote.subtotalSellingPrice,
      taxAmount: quote.taxAmount,
      customerName: customer.name,
      itemsCount: quote.items.length
    };
  }

  /**
   * Synthesize unified Customer 360 profile
   */
  public static getCustomer360(customerId: string): Customer360Profile {
    return {
      customer: {
        id: customerId,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        lifecycle: 'REPEAT_TRAVELER',
        tier: 'PLATINUM',
        totalSpend: 425000,
        openEnquiriesCount: 1,
        activeBookingsCount: 1,
        tags: ['High-Net-Worth', 'Luxury Villa Preference', 'Dubai Frequent'],
        familyMembers: [
          { name: 'Priya Sharma', relationship: 'Spouse', passportNumber: 'P8921445' },
          { name: 'Aarav Sharma', relationship: 'Child' }
        ],
        preferences: {
          seatPreference: 'Window Aisle Duo',
          mealPreference: 'Vegetarian Hindu Meal (AVML)',
          preferredAirlines: ['Emirates', 'Singapore Airlines']
        }
      },
      crm: {
        leads: [
          {
            id: 'lead_1092',
            source: 'WEBSITE',
            contactName: 'Rahul Sharma',
            email: 'rahul.sharma@example.com',
            phone: '+91 98765 43210',
            assignedTo: 'Priya Sharma (Senior Agent)',
            destination: 'Dubai & Abu Dhabi',
            travellerCount: 3,
            estimatedBudget: 280000,
            travelType: 'FAMILY',
            priority: 'HIGH',
            status: 'QUOTED',
            score: 92,
            notes: 'Looking for 5D/4N luxury stay with desert safari and private yacht.',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
          }
        ],
        enquiries: [
          {
            id: 'enq_801',
            customerId,
            destination: 'Dubai, UAE',
            origin: 'Mumbai (BOM)',
            travelDates: { departure: '2026-11-12', returnDate: '2026-11-17' },
            pax: { adults: 2, children: 1, infants: 0 },
            rooms: 1,
            budget: 300000,
            preferredAirlines: ['Emirates'],
            hotelPreference: '5_STAR',
            activities: ['Desert Safari', 'Private Yacht', 'Burj Khalifa Sky'],
            visaRequired: true,
            transportPreference: 'PRIVATE',
            urgency: 'HIGH',
            status: 'QUOTED',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        opportunities: [
          {
            id: 'opp_402',
            enquiryId: 'enq_801',
            customerId,
            title: 'Dubai Family 5D Luxury Odyssey',
            expectedBookingValue: 285000,
            estimatedCost: 228000,
            estimatedMargin: 57000,
            probability: 85,
            expectedClosingDate: '2026-10-15',
            assignedAgent: 'Priya Sharma',
            stage: 'NEGOTIATION'
          }
        ],
        quotes: [
          {
            id: 'qt_9011',
            quoteNumber: 'Q-2026-9011',
            customerId,
            agentId: 'agt_priya',
            validUntil: '2026-10-10',
            currency: 'INR',
            items: [
              { id: 'qi_1', category: 'FLIGHT', description: 'Emirates BOM-DXB-BOM Return (3 Pax)', supplierCost: 110000, markupPercent: 6, sellingPrice: 116600, taxRatePercent: 5 },
              { id: 'qi_2', category: 'HOTEL', description: 'Atlantis The Royal Palm View Room (4 Nights)', supplierCost: 140000, markupPercent: 10, sellingPrice: 154000, taxRatePercent: 5 },
              { id: 'qi_3', category: 'EXPERIENCE', description: 'Private Yacht Charter & VIP Desert Safari', supplierCost: 35000, markupPercent: 12, sellingPrice: 39200, taxRatePercent: 5 }
            ],
            totalCost: 285000,
            subtotalSellingPrice: 309800,
            discountAmount: 10000,
            taxAmount: 15490,
            totalQuoteAmount: 315290,
            marginAmount: 24800,
            marginPercent: 8.01,
            terms: 'Includes complimentary 3-day UAE eVisa processing and private transfers.',
            status: 'SENT',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        followUps: [
          {
            id: 'fu_301',
            entityType: 'QUOTE',
            entityId: 'qt_9011',
            customerName: 'Rahul Sharma',
            type: 'CALL',
            assignedTo: 'Priya Sharma',
            dueDate: new Date().toISOString().split('T')[0],
            dueTime: '15:30',
            priority: 'HIGH',
            status: 'PENDING',
            notes: 'Follow up on Quote Q-2026-9011. Customer reviewed hotel amenities yesterday.'
          }
        ]
      },
      travel: {
        bookings: [
          { id: 'TP-771920', destination: 'Bali, Indonesia', date: 'March 2026', amount: 185000, status: 'COMPLETED' },
          { id: 'TP-892401', destination: 'Dubai, UAE', date: 'November 2026', amount: 315290, status: 'CONFIRMED' }
        ],
        trips: [
          { id: 'trip_bali_26', title: 'Bali Island Wellness Retreat', status: 'COMPLETED' }
        ],
        favoriteDestinations: ['Dubai', 'Bali', 'Singapore']
      },
      finance: {
        totalSpent: 500290,
        outstandingBalance: 0,
        invoicesCount: 3,
        tcsAccumulatedFY: 42000,
        panNumber: 'ABCDE1234F'
      },
      support: {
        openTickets: 0,
        resolvedTickets: 2,
        csatScore: 5.0
      },
      documents: {
        passportNumber: 'Z9876543',
        passportExpiry: '2031-08-14',
        visaStatus: {
          UAE: 'ACTIVE_EVISA',
          Indonesia: 'VOA_ELIGIBLE',
          Schengen: 'EXPIRED'
        }
      },
      activity: [
        { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'QUOTE_VIEWED', description: 'Client viewed Quote Q-2026-9011 online', actor: 'Client' },
        { timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'QUOTE_SENT', description: 'Agent sent custom 5D Dubai Itinerary quote', actor: 'Priya Sharma' },
        { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'LEAD_CREATED', description: 'Inquiry captured via web trip planner', actor: 'System' }
      ],
      aiSummary: {
        personality: 'Decisive luxury traveler, family-focused, values time efficiency and private excursions.',
        recommendedNextAction: 'Call customer at 3:30 PM regarding suite upgrade at Atlantis The Royal before quote expiry.',
        propensityToBook: 88,
        upsellOpportunities: ['Helicopter city flyover over Palm Jumeirah', 'VIP airport fast-track concierge']
      }
    };
  }
}
