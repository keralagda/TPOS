/**
 * Booking.com Connector Adapter
 * Governing documents: 09_CONNECT_HUB.md, 10_INITIAL_CONNECTORS.md
 *
 * Category: INVENTORY (P0)
 * Capabilities: HOTEL_SEARCH, AVAILABILITY, RATES
 * Integration mode: REST_API (Booking.com Demand API / Connectivity API)
 * Auth: OAuth2 client-credentials (credentialRefId → vault)
 *
 * IMPORTANT:
 * - Partner access required (Booking.com Connectivity Partner Programme).
 * - Verify commercial agreement and supported product types before activation.
 * - Connector is NOT_CONFIGURED by default in seeded DB.
 * - credentialRefId references vault secret — never inline credentials.
 */

import {
  BaseConnector,
  CanonicalOffer,
  CanonicalSearchCriteria,
  ConnectorHealth,
  FreshnessMetadata,
} from '../base-connector';

// ---------------------------------------------------------------------------
// Booking.com raw API shapes (Demand API v2 — confirm against live API docs)
// ---------------------------------------------------------------------------

interface BookingRoomCategory {
  id: string;
  name: string;
  maxOccupancy: number;
  bedType: string;
}

interface BookingRatePlan {
  id: string;
  name: string;
  mealPlan: string;       // 'room_only' | 'breakfast_included' | 'half_board' | 'full_board' | 'all_inclusive'
  cancellationPolicy: string;
  ratePerNight: number;
  totalRate: number;
  currency: string;
  availableRooms: number;
  refundable: boolean;
}

interface BookingPropertyOffer {
  hotelId: string;
  hotelName: string;
  starRating: number;
  city: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  checkIn: string;
  checkOut: string;
  roomCategories: BookingRoomCategory[];
  ratePlans: BookingRatePlan[];
  reviewScore?: number;
  reviewCount?: number;
  thumbnailUrl?: string;
}

interface BookingAvailabilityResponse {
  hotelId: string;
  available: boolean;
  remainingRooms: number;
}

// ---------------------------------------------------------------------------
// BookingConnector
// ---------------------------------------------------------------------------

export class BookingConnector extends BaseConnector {
  readonly code = 'BOOKING_COM';
  readonly name = 'Booking.com';
  readonly type = 'REST_API' as const;
  readonly capabilities = ['HOTEL_SEARCH', 'AVAILABILITY', 'RATES'];

  private readonly apiBaseUrl: string;

  /** OAuth2 bearer token */
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  /** Rate limit — confirm against Booking.com Connectivity Agreement */
  private readonly rateLimitRps = 5;

  constructor(credentialRefId?: string) {
    super(credentialRefId);
    this.apiBaseUrl =
      process.env.BOOKING_API_BASE_URL ?? 'https://supply-xml.booking.com/hotels/ota';
  }

  // -------------------------------------------------------------------------
  // authenticate — OAuth2 client-credentials flow
  // -------------------------------------------------------------------------

  async authenticate(): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('[BookingConnector] authenticate() skipped — connector NOT_CONFIGURED');
      return false;
    }

    // Production: resolve from vault using this.credentialRefId
    const clientId = process.env.BOOKING_CLIENT_ID;
    const clientSecret = process.env.BOOKING_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[BookingConnector] Missing BOOKING_CLIENT_ID / BOOKING_CLIENT_SECRET');
      return false;
    }

    try {
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      const res = await fetch(
        process.env.BOOKING_TOKEN_URL ?? 'https://account.booking.com/oauth2/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        }
      );

      if (!res.ok) throw new Error(`Token request failed: ${res.status}`);

      const data = (await res.json()) as { access_token: string; expires_in: number };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
      console.info('[BookingConnector] OAuth2 token acquired');
      return true;
    } catch (err) {
      console.error('[BookingConnector] Authentication failed:', err);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // healthCheck (override)
  // -------------------------------------------------------------------------

  async healthCheck(): Promise<ConnectorHealth> {
    if (!this.isConfigured) {
      return {
        connectorCode: this.code,
        isHealthy: false,
        latencyMs: 0,
        lastCheckedAt: new Date(),
        status: 'NOT_CONFIGURED',
        errorMessage: 'Requires OAuth2 credentials via credentialRefId',
      };
    }
    const t0 = Date.now();
    try {
      await this._get<{ status: string }>('/ping');
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
    if (criteria.category !== 'HOTEL') return [];

    const raw = await this._get<{ properties: BookingPropertyOffer[] }>(
      '/availability/search',
      {
        dest_type: 'city',
        dest_id: criteria.destinationCode ?? criteria.destinationSlug,
        checkin: criteria.checkInDate,
        checkout: criteria.checkOutDate,
        adults: criteria.guestsCount ?? 2,
        rooms: 1,
        currency: 'INR',
        locale: 'en-gb',
        order_by: 'price',
      }
    );

    const offers: CanonicalOffer[] = [];
    for (const property of raw.properties ?? []) {
      // Expand one CanonicalOffer per rate plan
      for (const ratePlan of property.ratePlans ?? []) {
        offers.push(this.normalize({ property, ratePlan }));
      }
    }
    return offers;
  }

  // -------------------------------------------------------------------------
  // fetchOffers
  // -------------------------------------------------------------------------

  async fetchOffers(hotelId: string): Promise<CanonicalOffer[]> {
    if (!this.isConfigured) return [];
    const raw = await this._get<{ property: BookingPropertyOffer }>(
      `/hotels/${hotelId}/rates`
    );
    const property = raw.property;
    return (property.ratePlans ?? []).map((ratePlan) =>
      this.normalize({ property, ratePlan })
    );
  }

  // -------------------------------------------------------------------------
  // fetchAvailability (override)
  // -------------------------------------------------------------------------

  async fetchAvailability(offerId: string): Promise<boolean> {
    if (!this.isConfigured) return false;
    const [hotelId] = offerId.split('::');
    const raw = await this._get<BookingAvailabilityResponse>(
      `/hotels/${hotelId}/availability`
    );
    return raw.available ?? false;
  }

  // -------------------------------------------------------------------------
  // fetchPricing (override)
  // -------------------------------------------------------------------------

  async fetchPricing(offerId: string): Promise<{ price: number; currency: string }> {
    if (!this.isConfigured) return { price: 0, currency: 'INR' };
    const [hotelId, ratePlanId] = offerId.split('::');
    const raw = await this._get<{ totalRate: number; currency: string }>(
      `/hotels/${hotelId}/rates/${ratePlanId}/price`
    );
    return { price: raw.totalRate ?? 0, currency: raw.currency ?? 'INR' };
  }

  // -------------------------------------------------------------------------
  // normalize — maps Booking.com property+ratePlan → CanonicalOffer
  // -------------------------------------------------------------------------

  normalize(rawPayload: unknown): CanonicalOffer {
    const now = new Date();
    const freshness: FreshnessMetadata = this.createFreshnessMeta(600); // 10-min TTL

    if (this._isPropertyRatePlan(rawPayload)) {
      const { property, ratePlan } = rawPayload as {
        property: BookingPropertyOffer;
        ratePlan: BookingRatePlan;
      };
      const nights = this._nightsBetween(property.checkIn, property.checkOut);
      const offerId = `${property.hotelId}::${ratePlan.id}`;
      return {
        id: `BOOKING-${offerId}`,
        source: this.code,
        sourceOfferId: offerId,
        title: `${property.hotelName} · ${ratePlan.name}`,
        originalPrice: ratePlan.totalRate,
        discountedPrice: ratePlan.totalRate,
        currency: ratePlan.currency,
        ratePlanCode: ratePlan.id,
        freshness: { ...freshness, sourceOfferId: offerId },
        availability: (ratePlan.availableRooms ?? 0) > 0,
        details: {
          type: 'HOTEL',
          hotelId: property.hotelId,
          starRating: property.starRating,
          city: property.city,
          countryCode: property.countryCode,
          checkIn: property.checkIn,
          checkOut: property.checkOut,
          nights,
          ratePerNight: ratePlan.ratePerNight,
          mealPlan: ratePlan.mealPlan,
          cancellationPolicy: ratePlan.cancellationPolicy,
          refundable: ratePlan.refundable,
          availableRooms: ratePlan.availableRooms,
          reviewScore: property.reviewScore,
          reviewCount: property.reviewCount,
          thumbnailUrl: property.thumbnailUrl,
          coordinates:
            property.latitude !== undefined
              ? { lat: property.latitude, lng: property.longitude }
              : undefined,
        },
      };
    }

    // Fallback
    return {
      id: `BOOKING-UNKNOWN-${now.getTime()}`,
      source: this.code,
      sourceOfferId: 'UNKNOWN',
      title: 'Booking.com Offer (unmapped shape)',
      originalPrice: 0,
      discountedPrice: 0,
      currency: 'INR',
      freshness,
      availability: false,
      details: { raw: rawPayload },
    };
  }

  // -------------------------------------------------------------------------
  // sync (override — delta pricing refresh)
  // -------------------------------------------------------------------------

  async sync(): Promise<{ itemsProcessed: number; errorsCount: number }> {
    if (!this.isConfigured) return { itemsProcessed: 0, errorsCount: 0 };
    let itemsProcessed = 0;
    let errorsCount = 0;
    try {
      const raw = await this._get<{ updates: unknown[]; count: number }>(
        '/rates/delta',
        { since: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
      );
      itemsProcessed = raw.count ?? raw.updates?.length ?? 0;
    } catch {
      errorsCount++;
    }
    return { itemsProcessed, errorsCount };
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _ensureToken(): void {
    if (
      !this.accessToken ||
      (this.tokenExpiresAt && this.tokenExpiresAt < new Date())
    ) {
      throw new Error('[BookingConnector] No valid OAuth token. Call authenticate() first.');
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
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Affiliate-Id': process.env.BOOKING_AFFILIATE_ID ?? '',
      },
    });
    if (!res.ok) {
      throw new Error(
        `[BookingConnector] GET ${path} failed: ${res.status} ${res.statusText}`
      );
    }
    return res.json() as Promise<T>;
  }

  private _isPropertyRatePlan(o: unknown): boolean {
    return (
      typeof o === 'object' &&
      o !== null &&
      'property' in o &&
      'ratePlan' in o
    );
  }

  private _nightsBetween(checkIn: string, checkOut: string): number {
    const msPerDay = 86_400_000;
    return Math.max(
      1,
      Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay)
    );
  }
}
