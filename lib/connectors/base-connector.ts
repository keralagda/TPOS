/**
 * Travel Planet Connect — Provider-Neutral Connector Interface
 * Governing document: 09_CONNECT_HUB.md, 10_INITIAL_CONNECTORS.md
 * 
 * Rules:
 * - Decouple vendor specifics from Travel Planet domain core
 * - External inventory must maintain freshness metadata
 * - Never store plaintext credentials in entity tables
 * - Browser automation only when authorized by contract/terms
 */

export type ConnectorType =
  | 'REST_API'
  | 'GRAPHQL'
  | 'WEBHOOK'
  | 'FILE_FEED'
  | 'AUTHORIZED_BROWSER'
  | 'MANUAL_IMPORT';

export type FreshnessStatus = 'FRESH' | 'STALE' | 'EXPIRED';

export interface FreshnessMetadata {
  source: string;
  sourceOfferId?: string;
  retrievedAt: Date;
  lastVerifiedAt: Date;
  freshness: FreshnessStatus;
  ttlSeconds: number;
}

export interface ConnectorHealth {
  connectorCode: string;
  isHealthy: boolean;
  latencyMs: number;
  lastCheckedAt: Date;
  errorMessage?: string;
  status: 'ACTIVE' | 'DEGRADED' | 'NOT_CONFIGURED' | 'DISABLED';
}

export interface CanonicalSearchCriteria {
  category: 'FLIGHT' | 'HOTEL' | 'PACKAGE' | 'EXPERIENCE' | 'TRANSFER';
  destinationSlug?: string;
  originCode?: string;
  destinationCode?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestsCount?: number;
  cabinClass?: string;
}

export interface CanonicalOffer {
  id: string;
  source: string;
  sourceOfferId: string;
  productId?: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  ratePlanCode?: string;
  freshness: FreshnessMetadata;
  availability: boolean;
  details: Record<string, unknown>;
}

export interface IConnector {
  readonly code: string;
  readonly name: string;
  readonly type: ConnectorType;
  readonly capabilities: string[];

  authenticate(): Promise<boolean>;
  healthCheck(): Promise<ConnectorHealth>;
  discover(): Promise<string[]>;
  search(criteria: CanonicalSearchCriteria): Promise<CanonicalOffer[]>;
  fetchOffers(productId: string): Promise<CanonicalOffer[]>;
  fetchAvailability(offerId: string): Promise<boolean>;
  fetchPricing(offerId: string): Promise<{ price: number; currency: string }>;
  normalize(rawPayload: unknown): CanonicalOffer;
  validate(offer: CanonicalOffer): boolean;
  detectChanges(existing: CanonicalOffer, incoming: CanonicalOffer): boolean;
  sync(): Promise<{ itemsProcessed: number; errorsCount: number }>;
  logout(): Promise<void>;
}

/**
 * Base abstract connector class providing default guardrails & freshness helpers
 */
export abstract class BaseConnector implements IConnector {
  abstract readonly code: string;
  abstract readonly name: string;
  abstract readonly type: ConnectorType;
  abstract readonly capabilities: string[];

  protected isConfigured: boolean = false;

  constructor(protected credentialRefId?: string) {
    this.isConfigured = Boolean(credentialRefId);
  }

  abstract authenticate(): Promise<boolean>;
  abstract search(criteria: CanonicalSearchCriteria): Promise<CanonicalOffer[]>;
  abstract fetchOffers(productId: string): Promise<CanonicalOffer[]>;
  abstract normalize(rawPayload: unknown): CanonicalOffer;

  async healthCheck(): Promise<ConnectorHealth> {
    if (!this.isConfigured) {
      return {
        connectorCode: this.code,
        isHealthy: false,
        latencyMs: 0,
        lastCheckedAt: new Date(),
        status: 'NOT_CONFIGURED',
        errorMessage: 'Connector lacks valid credentialRefId configuration',
      };
    }
    return {
      connectorCode: this.code,
      isHealthy: true,
      latencyMs: 45,
      lastCheckedAt: new Date(),
      status: 'ACTIVE',
    };
  }

  async discover(): Promise<string[]> {
    return this.capabilities;
  }

  async fetchAvailability(offerId: string): Promise<boolean> {
    return true;
  }

  async fetchPricing(offerId: string): Promise<{ price: number; currency: string }> {
    return { price: 0, currency: 'INR' };
  }

  validate(offer: CanonicalOffer): boolean {
    return Boolean(offer.id && offer.source && offer.discountedPrice >= 0);
  }

  detectChanges(existing: CanonicalOffer, incoming: CanonicalOffer): boolean {
    return (
      existing.discountedPrice !== incoming.discountedPrice ||
      existing.availability !== incoming.availability
    );
  }

  async sync(): Promise<{ itemsProcessed: number; errorsCount: number }> {
    return { itemsProcessed: 0, errorsCount: 0 };
  }

  async logout(): Promise<void> {
    // Default no-op
  }

  protected createFreshnessMeta(ttlSeconds: number = 900): FreshnessMetadata {
    const now = new Date();
    return {
      source: this.code,
      retrievedAt: now,
      lastVerifiedAt: now,
      freshness: 'FRESH',
      ttlSeconds,
    };
  }
}
