/**
 * Akbar Travels Connector Adapter
 * Governing documents: 09_CONNECT_HUB.md, 10_INITIAL_CONNECTORS.md
 *
 * Category: INVENTORY (P0)
 * Capabilities: FLIGHT_SEARCH, HOTEL_SEARCH, B2B_BOOKING
 * Integration mode: REST_API (official partner API)
 * Auth: JWT/API Key via credentialRefId (vault-resolved at runtime)
 *
 * IMPORTANT:
 * - Connector is NOT_CONFIGURED by default in seeded DB.
 * - Provider names are candidate integrations, not guaranteed production access.
 * - Before activation: verify API availability, partner eligibility, commercial agreement.
 * - Never store plaintext credentials — credentialRefId references vault secret.
 * - Browser automation is NOT used; official API integration only.
 */

import {
  BaseConnector,
  CanonicalOffer,
  CanonicalSearchCriteria,
  ConnectorHealth,
  FreshnessMetadata,
} from '../base-connector';

// ---------------------------------------------------------------------------
// Akbar Raw API payload shapes (approximate — confirm against live API docs)
// ---------------------------------------------------------------------------

interface AkbarFlightSegment {
  flightNo: string;
  depAirport: string;
  arrAirport: string;
  depTime: string;       // ISO8601
  arrTime: string;       // ISO8601
  aircraft?: string;
  carrier: string;
}

interface AkbarFlightOffer {
  offerId: string;
  pnrCode?: string;
  segments: AkbarFlightSegment[];
  cabin: string;
  availableSeats: number;
  baseFare: number;
  taxes: number;
  totalFare: number;
  currency: string;
  refundable: boolean;
  fareRuleCode?: string;
}

interface AkbarHotelOffer {
  offerId: string;
  hotelCode: string;
  hotelName: string;
  starRating: number;
  roomType: string;
  roomsAvailable: number;
  ratePerNight: number;
  totalRate: number;
  currency: string;
  mealPlan: string;           // BB, HB, FB, AI, RO
  checkIn: string;
  checkOut: string;
  cancellationPolicy: string;
}

// ---------------------------------------------------------------------------
// AkbarConnector
// ---------------------------------------------------------------------------

export class AkbarConnector extends BaseConnector {
  readonly code = 'AKBAR';
  readonly name = 'Akbar Travels';
  readonly type = 'REST_API' as const;
  readonly capabilities = ['FLIGHT_SEARCH', 'HOTEL_SEARCH', 'B2B_BOOKING'];

  /** Base URL resolved per environment via environment variable */
  private readonly apiBaseUrl: string;

  /** In-memory token cache — production should use distributed store */
  private authToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  /** Rate-limit: Akbar partner API — confirm exact limits in commercial agreement */
  private readonly rateLimitRps = 10;

  constructor(credentialRefId?: string) {
    super(credentialRefId);
    this.apiBaseUrl =
      process.env.AKBAR_API_BASE_URL ?? 'https://api.partner.akbartravels.com/v1';
  }

  // -------------------------------------------------------------------------
  // authenticate
  // -------------------------------------------------------------------------

  async authenticate(): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('[AkbarConnector] authenticate() skipped — connector NOT_CONFIGURED');
      return false;
    }

    // Production: resolve apiKey from vault using this.credentialRefId
    // const { apiKey, apiSecret } = await vaultClient.resolve(this.credentialRefId!);
    const apiKey = process.env.AKBAR_API_KEY;
    const apiSecret = process.env.AKBAR_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('[AkbarConnector] Missing AKBAR_API_KEY / AKBAR_API_SECRET env vars');
      return false;
    }

    try {
      // Simulates POST /auth/token with partner credentials
      // Production: replace fetch stub with real HTTP client (node-fetch / axios)
      const response = await this._post<{ token: string; expiresIn: number }>(
        '/auth/token',
        { apiKey, apiSecret }
      );
      this.authToken = response.token;
      this.tokenExpiresAt = new Date(Date.now() + response.expiresIn * 1000);
      console.info('[AkbarConnector] Authentication successful');
      return true;
    } catch (err) {
      console.error('[AkbarConnector] Authentication failed:', err);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // healthCheck (override — adds token expiry awareness)
  // -------------------------------------------------------------------------

  async healthCheck(): Promise<ConnectorHealth> {
    if (!this.isConfigured) {
      return {
        connectorCode: this.code,
        isHealthy: false,
        latencyMs: 0,
        lastCheckedAt: new Date(),
        status: 'NOT_CONFIGURED',
        errorMessage: 'Connector requires credentialRefId configuration',
      };
    }
    const t0 = Date.now();
    try {
      await this._get<{ status: string }>('/health');
      return {
        connectorCode: this.code,
        isHealthy: true,
        latencyMs: Date.now() - t0,
        lastCheckedAt: new Date(),
        status: 'ACTIVE',
      };
    } catch (err: unknown) {
      return {
        connectorCode: this.code,
        isHealthy: false,
        latencyMs: Date.now() - t0,
        lastCheckedAt: new Date(),
        status: 'DEGRADED',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // -------------------------------------------------------------------------
  // search
  // -------------------------------------------------------------------------

  async search(criteria: CanonicalSearchCriteria): Promise<CanonicalOffer[]> {
    if (!this.isConfigured) return [];

    if (criteria.category === 'FLIGHT') {
      return this._searchFlights(criteria);
    }
    if (criteria.category === 'HOTEL') {
      return this._searchHotels(criteria);
    }
    // PACKAGE, EXPERIENCE, TRANSFER — extend when Akbar exposes those endpoints
    return [];
  }

  private async _searchFlights(
    criteria: CanonicalSearchCriteria
  ): Promise<CanonicalOffer[]> {
    const raw = await this._get<{ offers: AkbarFlightOffer[] }>('/flights/search', {
      origin: criteria.originCode,
      destination: criteria.destinationCode,
      departDate: criteria.checkInDate,
      cabin: criteria.cabinClass ?? 'ECONOMY',
      passengers: criteria.guestsCount ?? 1,
    });
    return (raw.offers ?? []).map((o) => this.normalize(o));
  }

  private async _searchHotels(
    criteria: CanonicalSearchCriteria
  ): Promise<CanonicalOffer[]> {
    const raw = await this._get<{ offers: AkbarHotelOffer[] }>('/hotels/search', {
      destination: criteria.destinationCode ?? criteria.destinationSlug,
      checkIn: criteria.checkInDate,
      checkOut: criteria.checkOutDate,
      rooms: 1,
      adults: criteria.guestsCount ?? 2,
    });
    return (raw.offers ?? []).map((o) => this.normalize(o));
  }

  // -------------------------------------------------------------------------
  // fetchOffers
  // -------------------------------------------------------------------------

  async fetchOffers(productId: string): Promise<CanonicalOffer[]> {
    if (!this.isConfigured) return [];
    const raw = await this._get<{ offers: (AkbarFlightOffer | AkbarHotelOffer)[] }>(
      `/offers/${productId}`
    );
    return (raw.offers ?? []).map((o) => this.normalize(o));
  }

  // -------------------------------------------------------------------------
  // fetchAvailability (override)
  // -------------------------------------------------------------------------

  async fetchAvailability(offerId: string): Promise<boolean> {
    if (!this.isConfigured) return false;
    const raw = await this._get<{ available: boolean }>(`/offers/${offerId}/availability`);
    return raw.available ?? false;
  }

  // -------------------------------------------------------------------------
  // fetchPricing (override)
  // -------------------------------------------------------------------------

  async fetchPricing(offerId: string): Promise<{ price: number; currency: string }> {
    if (!this.isConfigured) return { price: 0, currency: 'INR' };
    const raw = await this._get<{ price: number; currency: string }>(
      `/offers/${offerId}/pricing`
    );
    return { price: raw.price ?? 0, currency: raw.currency ?? 'INR' };
  }

  // -------------------------------------------------------------------------
  // normalize  — maps Akbar raw → CanonicalOffer
  // -------------------------------------------------------------------------

  normalize(rawPayload: unknown): CanonicalOffer {
    const now = new Date();
    const freshness: FreshnessMetadata = this.createFreshnessMeta(900); // 15-min TTL

    // ----- Flight offer path -----
    if (this._isFlightOffer(rawPayload)) {
      const o = rawPayload as AkbarFlightOffer;
      const seg = o.segments[0];
      const title = seg
        ? `${seg.carrier} ${seg.flightNo} · ${seg.depAirport}→${seg.arrAirport}`
        : 'Akbar Flight Offer';
      return {
        id: `AKBAR-FL-${o.offerId}`,
        source: this.code,
        sourceOfferId: o.offerId,
        title,
        originalPrice: o.totalFare,
        discountedPrice: o.totalFare,
        currency: o.currency,
        ratePlanCode: o.fareRuleCode,
        freshness: { ...freshness, sourceOfferId: o.offerId },
        availability: o.availableSeats > 0,
        details: {
          type: 'FLIGHT',
          segments: o.segments,
          cabin: o.cabin,
          availableSeats: o.availableSeats,
          baseFare: o.baseFare,
          taxes: o.taxes,
          refundable: o.refundable,
        },
      };
    }

    // ----- Hotel offer path -----
    if (this._isHotelOffer(rawPayload)) {
      const o = rawPayload as AkbarHotelOffer;
      return {
        id: `AKBAR-HT-${o.offerId}`,
        source: this.code,
        sourceOfferId: o.offerId,
        title: `${o.hotelName} · ${o.roomType}`,
        originalPrice: o.totalRate,
        discountedPrice: o.totalRate,
        currency: o.currency,
        ratePlanCode: `${o.mealPlan}-${o.roomType}`,
        freshness: { ...freshness, sourceOfferId: o.offerId },
        availability: o.roomsAvailable > 0,
        details: {
          type: 'HOTEL',
          hotelCode: o.hotelCode,
          starRating: o.starRating,
          mealPlan: o.mealPlan,
          checkIn: o.checkIn,
          checkOut: o.checkOut,
          cancellationPolicy: o.cancellationPolicy,
          ratePerNight: o.ratePerNight,
        },
      };
    }

    // Fallback — unknown shape
    return {
      id: `AKBAR-UNKNOWN-${now.getTime()}`,
      source: this.code,
      sourceOfferId: 'UNKNOWN',
      title: 'Akbar Offer (unmapped shape)',
      originalPrice: 0,
      discountedPrice: 0,
      currency: 'INR',
      freshness,
      availability: false,
      details: { raw: rawPayload },
    };
  }

  // -------------------------------------------------------------------------
  // sync (override — full inventory delta sync)
  // -------------------------------------------------------------------------

  async sync(): Promise<{ itemsProcessed: number; errorsCount: number }> {
    if (!this.isConfigured) return { itemsProcessed: 0, errorsCount: 0 };
    let itemsProcessed = 0;
    let errorsCount = 0;
    try {
      // In production: stream paginated delta feed from Akbar
      const page = await this._get<{ offers: AkbarFlightOffer[]; total: number }>(
        '/flights/offers/delta',
        { since: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
      );
      itemsProcessed = page.offers?.length ?? 0;
    } catch {
      errorsCount++;
    }
    return { itemsProcessed, errorsCount };
  }

  async logout(): Promise<void> {
    this.authToken = null;
    this.tokenExpiresAt = null;
  }

  // -------------------------------------------------------------------------
  // Private HTTP helpers — replace with production HTTP client (axios, etc.)
  // -------------------------------------------------------------------------

  private _ensureToken(): void {
    if (!this.authToken || (this.tokenExpiresAt && this.tokenExpiresAt < new Date())) {
      throw new Error('[AkbarConnector] No valid auth token. Call authenticate() first.');
    }
  }

  private async _get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    this._ensureToken();
    const url = new URL(`${this.apiBaseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    // Production: use real fetch / axios with retry, timeout, circuit-breaker
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        'X-Partner-Id': process.env.AKBAR_PARTNER_ID ?? '',
      },
    });
    if (!res.ok) {
      throw new Error(`[AkbarConnector] GET ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  private async _post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`[AkbarConnector] POST ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  // -------------------------------------------------------------------------
  // Type guards
  // -------------------------------------------------------------------------

  private _isFlightOffer(o: unknown): o is AkbarFlightOffer {
    return (
      typeof o === 'object' &&
      o !== null &&
      'segments' in o &&
      Array.isArray((o as AkbarFlightOffer).segments)
    );
  }

  private _isHotelOffer(o: unknown): o is AkbarHotelOffer {
    return (
      typeof o === 'object' &&
      o !== null &&
      'hotelCode' in o &&
      typeof (o as AkbarHotelOffer).hotelCode === 'string'
    );
  }
}
