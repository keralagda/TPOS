/**
 * KNOWLEDGE8: TEMPORAL PRICE & KNOWLEDGE GRAPH ENGINE
 * 
 * DOCTRINES:
 * K8-D01 Source Before Answer
 * K8-D02 Evidence Before Inference
 * K8-D03 Exact Value Preservation
 * K8-D04 Temporal Knowledge
 * K8-D05 Provenance Always
 * K8-D06 Conditions Travel With Price
 * K8-D07 Source Permission = Knowledge Permission
 * K8-D08 Newer Does Not Automatically Mean Valid
 * K8-D09 Conflicts Must Be Surfaced
 * K8-D10 Unknown > Fabrication
 * K8-D15 Time-Bound Pricing (3.5h - 5.0h default validity)
 * K8-D16 Explicit Expiry Priority
 * K8-D18 Current != Latest
 */

export type RushLevel = 'EXTREME' | 'HIGH' | 'NORMAL' | 'LOW';

export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export type PriceStatus =
  | 'FUTURE'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'EXPLICITLY_VALID'
  | 'TIME_SLOT_VALID'
  | 'SUPERSEDED'
  | 'CONFLICTING'
  | 'UNVERIFIED'
  | 'UNKNOWN';

export interface KnowledgePrice {
  priceId: string;
  sourceMessageId: string;
  sourceId: string;
  sourceName: string;
  entityId: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  destinationId: string;
  destinationName: string;
  amount: number;
  currency: string;
  unit: string; // e.g. "per person", "per room"
  conditions: string[];
  inclusions: string[];
  exclusions: string[];
  postedAt: string; // ISO string
  validFrom: string; // ISO string
  validUntil: string; // ISO string
  explicitExpiry: boolean;
  expirySource: 'EXPLICIT_SOURCE' | 'RUSH_RULE' | 'ORG_DEFAULT';
  validityDurationHours: number;
  postTimeSlot: TimeSlot;
  expiryTimeSlot: TimeSlot;
  rushLevel: RushLevel;
  confidence: number;
  verificationStatus: 'SOURCE_DIRECT' | 'SOURCE_EXTRACTED' | 'SYSTEM_DERIVED' | 'AI_INFERRED';
  sourceText: string;
  originalMessageLink: string;
  isInternalB2BOnly: boolean;
}

export interface PriceQueryResult {
  status: 'FOUND' | 'EXPIRED' | 'CONFLICTING' | 'NOT_FOUND';
  currentPrice?: KnowledgePrice;
  latestPrice?: KnowledgePrice;
  conflictingPrices?: KnowledgePrice[];
  explanation: string;
  provenanceTrace?: {
    sourceName: string;
    messageId: string;
    postedAt: string;
    validityWindow: string;
    conditions: string[];
    verification: string;
  };
}

export class TemporalPriceEngine {
  private static prices: KnowledgePrice[] = [];

  /**
   * Determine Time Slot based on 24-hour hour index
   * 05:00–11:59 = MORNING
   * 12:00–16:59 = AFTERNOON
   * 17:00–20:59 = EVENING
   * 21:00–04:59 = NIGHT
   */
  static getTimeSlot(date: Date): TimeSlot {
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) return 'MORNING';
    if (hours >= 12 && hours < 17) return 'AFTERNOON';
    if (hours >= 17 && hours < 21) return 'EVENING';
    return 'NIGHT';
  }

  /**
   * Calculate rush-based dynamic price validity (3.5 to 5 hours) (§30)
   * 05:00–07:59 = 5.0h (LOW rush)
   * 08:00–10:59 = 4.5h (NORMAL rush)
   * 11:00–13:59 = 4.0h (HIGH rush)
   * 14:00–16:59 = 3.5h (EXTREME rush)
   * 17:00–19:59 = 4.0h (HIGH rush)
   * 20:00–22:59 = 4.5h (NORMAL rush)
   * 23:00–04:59 = 5.0h (LOW rush)
   */
  static calculateRushValidity(date: Date): { durationHours: number; rushLevel: RushLevel } {
    const h = date.getHours();
    if (h >= 5 && h < 8) return { durationHours: 5.0, rushLevel: 'LOW' };
    if (h >= 8 && h < 11) return { durationHours: 4.5, rushLevel: 'NORMAL' };
    if (h >= 11 && h < 14) return { durationHours: 4.0, rushLevel: 'HIGH' };
    if (h >= 14 && h < 17) return { durationHours: 3.5, rushLevel: 'EXTREME' };
    if (h >= 17 && h < 20) return { durationHours: 4.0, rushLevel: 'HIGH' };
    if (h >= 20 && h < 23) return { durationHours: 4.5, rushLevel: 'NORMAL' };
    return { durationHours: 5.0, rushLevel: 'LOW' };
  }

  /**
   * Ingest and index a price record with explicit or calculated temporal bounds
   */
  static ingestPrice(payload: {
    priceId?: string;
    sourceMessageId: string;
    sourceId: string;
    sourceName: string;
    entityId: string;
    productId: string;
    productName: string;
    supplierId: string;
    supplierName: string;
    destinationId: string;
    destinationName: string;
    amount: number;
    currency: string;
    unit?: string;
    conditions?: string[];
    inclusions?: string[];
    exclusions?: string[];
    postedAt: string | Date;
    explicitValidUntil?: string | Date;
    sourceText: string;
    isInternalB2BOnly?: boolean;
  }): KnowledgePrice {
    const postDate = typeof payload.postedAt === 'string' ? new Date(payload.postedAt) : payload.postedAt;
    const postSlot = this.getTimeSlot(postDate);

    let validUntilDate: Date;
    let explicitExpiry = false;
    let expirySource: 'EXPLICIT_SOURCE' | 'RUSH_RULE' | 'ORG_DEFAULT' = 'RUSH_RULE';
    let durationHours: number;
    let rushLevel: RushLevel;

    if (payload.explicitValidUntil) {
      validUntilDate = typeof payload.explicitValidUntil === 'string' 
        ? new Date(payload.explicitValidUntil) 
        : payload.explicitValidUntil;
      explicitExpiry = true;
      expirySource = 'EXPLICIT_SOURCE';
      durationHours = (validUntilDate.getTime() - postDate.getTime()) / (1000 * 60 * 60);
      rushLevel = 'NORMAL';
    } else {
      const rush = this.calculateRushValidity(postDate);
      durationHours = rush.durationHours;
      rushLevel = rush.rushLevel;
      validUntilDate = new Date(postDate.getTime() + durationHours * 60 * 60 * 1000);
      expirySource = 'RUSH_RULE';
    }

    const expirySlot = this.getTimeSlot(validUntilDate);

    const priceRecord: KnowledgePrice = {
      priceId: payload.priceId || `price-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceMessageId: payload.sourceMessageId,
      sourceId: payload.sourceId,
      sourceName: payload.sourceName,
      entityId: payload.entityId,
      productId: payload.productId,
      productName: payload.productName,
      supplierId: payload.supplierId,
      supplierName: payload.supplierName,
      destinationId: payload.destinationId,
      destinationName: payload.destinationName,
      amount: payload.amount,
      currency: payload.currency,
      unit: payload.unit || 'per person',
      conditions: payload.conditions || [],
      inclusions: payload.inclusions || [],
      exclusions: payload.exclusions || [],
      postedAt: postDate.toISOString(),
      validFrom: postDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      explicitExpiry,
      expirySource,
      validityDurationHours: Number(durationHours.toFixed(1)),
      postTimeSlot: postSlot,
      expiryTimeSlot: expirySlot,
      rushLevel,
      confidence: 0.98,
      verificationStatus: explicitExpiry ? 'SOURCE_DIRECT' : 'SOURCE_EXTRACTED',
      sourceText: payload.sourceText,
      originalMessageLink: `/admin/knowledge/messages/${payload.sourceMessageId}`,
      isInternalB2BOnly: payload.isInternalB2BOnly ?? true,
    };

    this.prices.push(priceRecord);
    return priceRecord;
  }

  /**
   * Evaluate Price Status against a point in time (default NOW)
   */
  static getPriceStatus(price: KnowledgePrice, referenceTime = new Date()): PriceStatus {
    const now = referenceTime.getTime();
    const from = new Date(price.validFrom).getTime();
    const until = new Date(price.validUntil).getTime();

    if (now < from) return 'FUTURE';
    if (now >= until) return 'EXPIRED';
    if (until - now < 30 * 60 * 1000) return 'EXPIRING_SOON'; // within 30m
    return 'ACTIVE';
  }

  /**
   * Query price for product/destination with full Temporal Resolution (§33-35, 40)
   */
  static resolvePrice(options: {
    productIdOrDestination: string;
    referenceTime?: Date;
    isCustomerAudience?: boolean;
  }): PriceQueryResult {
    const ref = options.referenceTime || new Date();
    const target = options.productIdOrDestination.toLowerCase();

    // Filter relevant prices
    let matching = this.prices.filter(p =>
      p.productId.toLowerCase().includes(target) ||
      p.productName.toLowerCase().includes(target) ||
      p.destinationName.toLowerCase().includes(target) ||
      p.destinationId.toLowerCase().includes(target)
    );

    // K8-D07 / K8-D13: Enforce Customer vs Internal AI privacy gate
    if (options.isCustomerAudience) {
      matching = matching.filter(p => !p.isInternalB2BOnly);
    }

    if (matching.length === 0) {
      return {
        status: 'NOT_FOUND',
        explanation: "I couldn't find an exact price in the authorized knowledge sources.",
      };
    }

    // Sort descending by posted time
    matching.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    const latest = matching[0];

    // Find currently active prices (validity includes referenceTime)
    const activePrices = matching.filter(p => this.getPriceStatus(p, ref) === 'ACTIVE' || this.getPriceStatus(p, ref) === 'EXPIRING_SOON');

    // Check for conflict: multiple different amounts active at the same time
    if (activePrices.length > 1) {
      const distinctAmounts = Array.from(new Set(activePrices.map(p => p.amount)));
      if (distinctAmounts.length > 1) {
        return {
          status: 'CONFLICTING',
          latestPrice: latest,
          conflictingPrices: activePrices,
          explanation: `I found ${activePrices.length} active conflicting source rates (${activePrices.map(p => `${p.currency} ${p.amount.toLocaleString('en-IN')} from ${p.sourceName}`).join(' vs ')}). Neither is confirmed as the definitive selling price.`,
        };
      }
    }

    if (activePrices.length > 0) {
      const current = activePrices[0];
      return {
        status: 'FOUND',
        currentPrice: current,
        latestPrice: latest,
        explanation: `${current.productName} is currently ${current.currency} ${current.amount.toLocaleString('en-IN')} ${current.unit}. Valid until ${new Date(current.validUntil).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
        provenanceTrace: {
          sourceName: current.sourceName,
          messageId: current.sourceMessageId,
          postedAt: current.postedAt,
          validityWindow: `${current.validFrom} to ${current.validUntil} (${current.validityDurationHours}h)`,
          conditions: current.conditions,
          verification: current.verificationStatus,
        },
      };
    }

    // All matching prices are expired
    return {
      status: 'EXPIRED',
      latestPrice: latest,
      explanation: `The latest recorded rate was ${latest.currency} ${latest.amount.toLocaleString('en-IN')} ${latest.unit}, posted at ${new Date(latest.postedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} and valid until ${new Date(latest.validUntil).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. It has expired. No currently active rate was found.`,
      provenanceTrace: {
        sourceName: latest.sourceName,
        messageId: latest.sourceMessageId,
        postedAt: latest.postedAt,
        validityWindow: `${latest.validFrom} to ${latest.validUntil}`,
        conditions: latest.conditions,
        verification: latest.verificationStatus,
      },
    };
  }

  static getAllPrices(): KnowledgePrice[] {
    return this.prices;
  }

  static clearPrices(): void {
    this.prices = [];
  }
}
