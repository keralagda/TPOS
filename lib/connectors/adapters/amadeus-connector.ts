/**
 * Amadeus GDS Connector Adapter
 * Governing documents: 09_CONNECT_HUB.md, 10_INITIAL_CONNECTORS.md
 *
 * Category: INVENTORY (P1)
 * Capabilities: GDS_FLIGHTS, HOTELS, ACTIVITIES
 * Integration mode: REST_API (Amadeus Self-Service API — amadeus.com/en/developer)
 * Auth: OAuth2 client-credentials (credentialRefId → vault)
 *
 * IMPORTANT:
 * - This uses the Amadeus Self-Service (developer/test) API structure.
 * - Production activation requires Enterprise API agreement with Amadeus.
 * - Connector is NOT_CONFIGURED by default in seeded DB.
 * - credentialRefId references vault secret — never inline credentials.
 * - Verify partner eligibility, commercial agreement, and rate limits.
 */

import {
  BaseConnector,
  CanonicalOffer,
  CanonicalSearchCriteria,
  ConnectorHealth,
  FreshnessMetadata,
} from '../base-connector';

// ---------------------------------------------------------------------------
// Amadeus Self-Service API raw shapes
// ---------------------------------------------------------------------------

interface AmadeusItinerary {
  segments: AmadeusSegment[];
}

interface AmadeusSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  duration: string;
  numberOfStops: number;
}

interface AmadeusTravelerPricing {
  fareOption: string;
  travelerType: string;
  price: { currency: string; total: string; base: string };
  fareDetailsBySegment: unknown[];
}

interface AmadeusFlightOffer {
  id: string;
  source: string;
  itineraries: AmadeusItinerary[];
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  price: { currency: string; grandTotal: string; total: string; base: string };
  pricingOptions: { fareType: string[]; includedCheckedBagsOnly: boolean };
  validatingAirlineCodes: string[];
  travelerPricings: AmadeusTravelerPricing[];
}

interface AmadeusHotelOffer {
  hotel: {
    hotelId: string;
    name: string;
    rating: string;
    cityCode: string;
    latitude?: number;
    longitude?: number;
  };
  available: boolean;
  offers: {
    id: string;
    checkInDate: string;
    checkOutDate: string;
    rateCode: string;
    room: { type: string; typeEstimated: { category: string; beds: number; bedType: string } };
    guests: { adults: number };
    price: { currency: string; total: string; base: string };
    policies: { cancellations?: { type: string }[]; paymentType: string };
  }[];
}

interface AmadeusActivity {
  id: string;
  name: string;
  description?: string;
  geoCode: { latitude: number; longitude: number };
  rating?: string;
  price: { currencyCode: string; amount: string };
  pictures?: string[];
}

// ---------------------------------------------------------------------------
// AmadeusConnector
// ---------------------------------------------------------------------------

export class AmadeusConnector extends BaseConnector {
  readonly code = 'AMADEUS';
  readonly name = 'Amadeus GDS';
  readonly type = 'REST_API' as const;
  readonly capabilities = ['GDS_FLIGHTS', 'HOTELS', 'ACTIVITIES'];

  private readonly apiBaseUrl: string;
  private readonly tokenUrl: string;

  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(credentialRefId?: string) {
    super(credentialRefId);
    // Self-Service test endpoint — Enterprise uses different host
    this.apiBaseUrl =
      process.env.AMADEUS_API_BASE_URL ?? 'https://test.api.amadeus.com/v2';
    this.tokenUrl =
      process.env.AMADEUS_TOKEN_URL ??
      'https://test.api.amadeus.com/v1/security/oauth2/token';
  }

  // -------------------------------------------------------------------------
  // authenticate — Amadeus OAuth2 client-credentials
  // -------------------------------------------------------------------------

  async authenticate(): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('[AmadeusConnector] authenticate() skipped — connector NOT_CONFIGURED');
      return false;
    }

    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[AmadeusConnector] Missing AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET');
      return false;
    }

    try {
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      const res = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!res.ok) throw new Error(`Token request failed: ${res.status}`);

      const data = (await res.json()) as {
        access_token: string;
        expires_in: number;
        token_type: string;
      };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
      console.info('[AmadeusConnector] Token acquired, expires in', data.expires_in, 's');
      return true;
    } catch (err) {
      console.error('[AmadeusConnector] Authentication failed:', err);
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
        errorMessage: 'Requires OAuth2 credentials and partner agreement',
      };
    }
    const t0 = Date.now();
    try {
      // Light call: reference-data/locations lookup as health indicator
      await this._get<unknown>('/reference-data/locations', {
        keyword: 'DEL',
        subType: 'AIRPORT',
      });
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
  // search — routes by category
  // -------------------------------------------------------------------------

  async search(criteria: CanonicalSearchCriteria): Promise<CanonicalOffer[]> {
    if (!this.isConfigured) return [];

    switch (criteria.category) {
      case 'FLIGHT':
        return this._searchFlights(criteria);
      case 'HOTEL':
        return this._searchHotels(criteria);
      case 'EXPERIENCE':
        return this._searchActivities(criteria);
      default:
        return [];
    }
  }

  // -- Flights (v2/shopping/flight-offers) --

  private async _searchFlights(
    criteria: CanonicalSearchCriteria
  ): Promise<CanonicalOffer[]> {
    const raw = await this._get<{ data: AmadeusFlightOffer[] }>(
      '/shopping/flight-offers',
      {
        originLocationCode: criteria.originCode,
        destinationLocationCode: criteria.destinationCode,
        departureDate: criteria.checkInDate,
        adults: criteria.guestsCount ?? 1,
        travelClass: criteria.cabinClass ?? 'ECONOMY',
        max: 20,
        currencyCode: 'INR',
      }
    );
    return (raw.data ?? []).map((o) => this.normalize(o));
  }

  // -- Hotels (v2/shopping/hotel-offers) --

  private async _searchHotels(
    criteria: CanonicalSearchCriteria
  ): Promise<CanonicalOffer[]> {
    const raw = await this._get<{ data: AmadeusHotelOffer[] }>(
      '/shopping/hotel-offers',
      {
        cityCode: criteria.destinationCode ?? criteria.destinationSlug?.toUpperCase(),
        checkInDate: criteria.checkInDate,
        checkOutDate: criteria.checkOutDate,
        adults: criteria.guestsCount ?? 2,
        roomQuantity: 1,
        currency: 'INR',
        bestRateOnly: true,
      }
    );
    const offers: CanonicalOffer[] = [];
    for (const hotelEntry of raw.data ?? []) {
      for (const roomOffer of hotelEntry.offers ?? []) {
        offers.push(this.normalize({ hotelEntry, roomOffer }));
      }
    }
    return offers;
  }

  // -- Activities (v1/shopping/activities) --

  private async _searchActivities(
    criteria: CanonicalSearchCriteria
  ): Promise<CanonicalOffer[]> {
    // Activities API requires lat/lng — for MVP, map destination slug to rough coords
    const coords = this._destinationCoords(criteria.destinationSlug ?? '');
    const raw = await this._get<{ data: AmadeusActivity[] }>('/shopping/activities', {
      latitude: coords.lat,
      longitude: coords.lng,
      radius: 20,
    });
    return (raw.data ?? []).map((o) => this.normalize(o));
  }

  // -------------------------------------------------------------------------
  // fetchOffers
  // -------------------------------------------------------------------------

  async fetchOffers(productId: string): Promise<CanonicalOffer[]> {
    if (!this.isConfigured) return [];
    // productId format: "FLIGHT:{offer-id}" | "HOTEL:{hotelId}" | "ACT:{actId}"
    const [type, id] = productId.split(':');
    if (type === 'HOTEL') {
      const raw = await this._get<{ data: AmadeusHotelOffer }>(
        `/shopping/hotel-offers/by-hotel`,
        { hotelId: id }
      );
      return (raw.data?.offers ?? []).map((roomOffer) =>
        this.normalize({ hotelEntry: raw.data, roomOffer })
      );
    }
    return [];
  }

  // -------------------------------------------------------------------------
  // normalize — maps Amadeus raw → CanonicalOffer
  // -------------------------------------------------------------------------

  normalize(rawPayload: unknown): CanonicalOffer {
    const now = new Date();
    const freshness: FreshnessMetadata = this.createFreshnessMeta(300); // 5-min TTL (GDS pricing is volatile)

    // ----- Flight offer path -----
    if (this._isFlightOffer(rawPayload)) {
      const o = rawPayload as AmadeusFlightOffer;
      const firstSeg = o.itineraries[0]?.segments[0];
      const title = firstSeg
        ? `${firstSeg.carrierCode}${firstSeg.number} · ${firstSeg.departure.iataCode}→${firstSeg.arrival.iataCode}`
        : 'Amadeus Flight';
      const price = parseFloat(o.price.grandTotal ?? o.price.total ?? '0');
      return {
        id: `AMADEUS-FL-${o.id}`,
        source: this.code,
        sourceOfferId: o.id,
        title,
        originalPrice: price,
        discountedPrice: price,
        currency: o.price.currency,
        freshness: { ...freshness, sourceOfferId: o.id },
        availability: (o.numberOfBookableSeats ?? 0) > 0,
        details: {
          type: 'FLIGHT',
          itineraries: o.itineraries,
          validatingAirlines: o.validatingAirlineCodes,
          lastTicketingDate: o.lastTicketingDate,
          fareTypes: o.pricingOptions?.fareType,
          bookableSeats: o.numberOfBookableSeats,
          baseFare: parseFloat(o.price.base ?? '0'),
        },
      };
    }

    // ----- Hotel offer path -----
    if (this._isHotelRoomOffer(rawPayload)) {
      const { hotelEntry, roomOffer } = rawPayload as {
        hotelEntry: AmadeusHotelOffer;
        roomOffer: AmadeusHotelOffer['offers'][0];
      };
      const h = hotelEntry.hotel;
      const price = parseFloat(roomOffer.price.total ?? '0');
      return {
        id: `AMADEUS-HT-${h.hotelId}::${roomOffer.id}`,
        source: this.code,
        sourceOfferId: `${h.hotelId}::${roomOffer.id}`,
        title: `${h.name} · ${roomOffer.room?.typeEstimated?.category ?? roomOffer.room?.type ?? 'Room'}`,
        originalPrice: price,
        discountedPrice: price,
        currency: roomOffer.price.currency,
        ratePlanCode: roomOffer.rateCode,
        freshness: { ...freshness, sourceOfferId: roomOffer.id },
        availability: hotelEntry.available ?? true,
        details: {
          type: 'HOTEL',
          hotelId: h.hotelId,
          starRating: parseInt(h.rating ?? '0'),
          cityCode: h.cityCode,
          checkIn: roomOffer.checkInDate,
          checkOut: roomOffer.checkOutDate,
          bedType: roomOffer.room?.typeEstimated?.bedType,
          beds: roomOffer.room?.typeEstimated?.beds,
          adults: roomOffer.guests?.adults,
          cancellationPolicy: roomOffer.policies?.cancellations,
          paymentType: roomOffer.policies?.paymentType,
          coordinates:
            h.latitude !== undefined
              ? { lat: h.latitude, lng: h.longitude }
              : undefined,
        },
      };
    }

    // ----- Activity path -----
    if (this._isActivity(rawPayload)) {
      const a = rawPayload as AmadeusActivity;
      const price = parseFloat(a.price?.amount ?? '0');
      return {
        id: `AMADEUS-ACT-${a.id}`,
        source: this.code,
        sourceOfferId: a.id,
        title: a.name,
        originalPrice: price,
        discountedPrice: price,
        currency: a.price?.currencyCode ?? 'INR',
        freshness: { ...freshness, sourceOfferId: a.id },
        availability: true,
        details: {
          type: 'ACTIVITY',
          description: a.description,
          rating: a.rating,
          coordinates: a.geoCode,
          pictures: a.pictures,
        },
      };
    }

    // Fallback
    return {
      id: `AMADEUS-UNKNOWN-${now.getTime()}`,
      source: this.code,
      sourceOfferId: 'UNKNOWN',
      title: 'Amadeus Offer (unmapped shape)',
      originalPrice: 0,
      discountedPrice: 0,
      currency: 'INR',
      freshness,
      availability: false,
      details: { raw: rawPayload },
    };
  }

  // -------------------------------------------------------------------------
  // sync (override)
  // -------------------------------------------------------------------------

  async sync(): Promise<{ itemsProcessed: number; errorsCount: number }> {
    // Amadeus Self-Service does not expose delta feeds — re-search popular routes
    return { itemsProcessed: 0, errorsCount: 0 };
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
      throw new Error('[AmadeusConnector] No valid token. Call authenticate() first.');
    }
  }

  private async _get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    this._ensureToken();
    const baseVersioned = path.startsWith('/v')
      ? `https://test.api.amadeus.com${path}`
      : `${this.apiBaseUrl}${path}`;
    const url = new URL(baseVersioned);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(
        `[AmadeusConnector] GET ${path} failed: ${res.status} ${res.statusText}`
      );
    }
    return res.json() as Promise<T>;
  }

  private _isFlightOffer(o: unknown): o is AmadeusFlightOffer {
    return typeof o === 'object' && o !== null && 'itineraries' in o && 'price' in o;
  }

  private _isHotelRoomOffer(o: unknown): boolean {
    return (
      typeof o === 'object' &&
      o !== null &&
      'hotelEntry' in o &&
      'roomOffer' in o
    );
  }

  private _isActivity(o: unknown): o is AmadeusActivity {
    return typeof o === 'object' && o !== null && 'geoCode' in o && 'price' in o && !('itineraries' in o);
  }

  /** Rough lat/lng lookup for demo purposes — replace with geocoding service */
  private _destinationCoords(slug: string): { lat: number; lng: number } {
    const map: Record<string, { lat: number; lng: number }> = {
      dubai: { lat: 25.2048, lng: 55.2708 },
      bali: { lat: -8.4095, lng: 115.1889 },
      singapore: { lat: 1.3521, lng: 103.8198 },
      thailand: { lat: 15.87, lng: 100.9925 },
      kashmir: { lat: 34.0837, lng: 74.7973 },
      kerala: { lat: 10.8505, lng: 76.2711 },
    };
    return map[slug.toLowerCase()] ?? { lat: 20.5937, lng: 78.9629 }; // India centre fallback
  }
}
