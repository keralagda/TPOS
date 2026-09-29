/**
 * TP-H8 ENTERPRISE API PLATFORM & DEVELOPER SERVICE
 * Manages Developer API Keys, Webhook Subscriptions, Quota Metering, and Sandbox Testing.
 */

import crypto from 'crypto';

export interface DeveloperApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  maskedKey: string;
  keyHash: string;
  environment: 'PRODUCTION' | 'SANDBOX';
  scopes: string[];
  tenantId: string;
  rateLimitPerMinute: number;
  monthlyQuota: number;
  currentMonthUsage: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  lastUsedAt?: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
  failureCount: number;
  tenantId: string;
  createdAt: string;
}

export interface ApiEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  category: 'SEARCH' | 'JOURNEYS' | 'BOOKINGS' | 'DMS' | 'VOICE';
  parameters: { name: string; type: string; required: boolean; description: string }[];
  sampleResponse: Record<string, any>;
}

export class DeveloperService {
  private static apiKeys: DeveloperApiKey[] = [
    {
      id: 'key-live-01',
      name: 'Production B2B Booking Engine',
      keyPrefix: 'tp_live_',
      maskedKey: 'tp_live_8f92********************3a12',
      keyHash: crypto.createHash('sha256').update('tp_live_8f92test3a12').digest('hex'),
      environment: 'PRODUCTION',
      scopes: ['bookings.read', 'bookings.write', 'search.read', 'dms.read'],
      tenantId: 'tenant-default',
      rateLimitPerMinute: 1200,
      monthlyQuota: 500000,
      currentMonthUsage: 48210,
      status: 'ACTIVE',
      createdAt: '2026-08-15T10:00:00Z',
      lastUsedAt: '2026-09-29T00:01:00Z'
    },
    {
      id: 'key-sand-02',
      name: 'Partner Integration Sandbox',
      keyPrefix: 'tp_test_',
      maskedKey: 'tp_test_1c44********************9b88',
      keyHash: crypto.createHash('sha256').update('tp_test_1c44test9b88').digest('hex'),
      environment: 'SANDBOX',
      scopes: ['search.read', 'journeys.read', 'quotes.create'],
      tenantId: 'tenant-default',
      rateLimitPerMinute: 300,
      monthlyQuota: 50000,
      currentMonthUsage: 3120,
      status: 'ACTIVE',
      createdAt: '2026-09-01T14:30:00Z',
      lastUsedAt: '2026-09-28T22:15:00Z'
    }
  ];

  private static webhooks: WebhookSubscription[] = [
    {
      id: 'wh-sub-01',
      url: 'https://api.travelpartner.com/v1/travelplanet-hooks',
      events: ['booking.created', 'payment.completed', 'flight.delayed', 'dms.document_approved'],
      secret: 'whsec_99182abcf9012384756',
      status: 'ACTIVE',
      failureCount: 0,
      tenantId: 'tenant-default',
      createdAt: '2026-09-10T12:00:00Z'
    }
  ];

  public static readonly API_CATALOG: ApiEndpointDoc[] = [
    {
      method: 'GET',
      path: '/api/v1/search',
      title: 'Global Travel Inventory Search',
      description: 'Search packages, hotels, flights, and living journeys with faceted filters and budget limits.',
      category: 'SEARCH',
      parameters: [
        { name: 'q', type: 'string', required: false, description: 'Keyword or destination name' },
        { name: 'category', type: 'string', required: false, description: 'Filter by PACKAGES, HOTELS, FLIGHTS' },
        { name: 'maxBudget', type: 'number', required: false, description: 'Maximum budget per person' }
      ],
      sampleResponse: {
        totalResults: 14,
        destinations: ['Kerala', 'Rajasthan'],
        packages: [{ id: 'pkg-kl-01', title: 'Kerala Monsoon Soul', price: 45000 }]
      }
    },
    {
      method: 'GET',
      path: '/api/v1/journeys',
      title: 'List Living Journeys',
      description: 'Query adaptive living journeys complete with real-time weather sensors and day itineraries.',
      category: 'JOURNEYS',
      parameters: [
        { name: 'destination', type: 'string', required: false, description: 'Target destination hub' },
        { name: 'theme', type: 'string', required: false, description: 'Travel theme e.g. LUXURY_TRAVEL, ADVENTURE' }
      ],
      sampleResponse: {
        count: 2,
        journeys: [{ id: 'journey-01', title: 'Royal Heritage & Desert Whispers', durationDays: 5 }]
      }
    },
    {
      method: 'POST',
      path: '/api/v1/b2b2c/quote',
      title: 'Generate B2B Partner Quotation',
      description: 'Calculate comprehensive B2B2C price quotations with margin breakdown and SAC 998555 tax.',
      category: 'BOOKINGS',
      parameters: [
        { name: 'packageId', type: 'string', required: true, description: 'Selected package or itinerary ID' },
        { name: 'paxCount', type: 'number', required: true, description: 'Number of travelers' },
        { name: 'partnerTier', type: 'string', required: false, description: 'SILVER, GOLD, PLATINUM' }
      ],
      sampleResponse: {
        quoteRef: 'QT-2026-9812',
        basePrice: 40000,
        markup: 5000,
        gst: 2250,
        totalPayable: 47250
      }
    }
  ];

  /**
   * List API keys
   */
  static listApiKeys(tenantId: string = 'tenant-default'): DeveloperApiKey[] {
    return this.apiKeys.filter(k => k.tenantId === tenantId);
  }

  /**
   * Create new API Key
   */
  static createApiKey(
    name: string,
    environment: 'PRODUCTION' | 'SANDBOX',
    scopes: string[],
    tenantId: string = 'tenant-default'
  ): { key: DeveloperApiKey; plainSecretKey: string } {
    const rawSecret = crypto.randomBytes(24).toString('hex');
    const prefix = environment === 'PRODUCTION' ? 'tp_live_' : 'tp_test_';
    const plainSecretKey = `${prefix}${rawSecret}`;
    const maskedKey = `${prefix}${rawSecret.slice(0, 4)}********************${rawSecret.slice(-4)}`;
    const keyHash = crypto.createHash('sha256').update(plainSecretKey).digest('hex');

    const newKey: DeveloperApiKey = {
      id: `key-${Date.now()}`,
      name,
      keyPrefix: prefix,
      maskedKey,
      keyHash,
      environment,
      scopes,
      tenantId,
      rateLimitPerMinute: environment === 'PRODUCTION' ? 1200 : 300,
      monthlyQuota: environment === 'PRODUCTION' ? 500000 : 50000,
      currentMonthUsage: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    this.apiKeys.unshift(newKey);
    return { key: newKey, plainSecretKey };
  }

  /**
   * Revoke Key
   */
  static revokeApiKey(id: string): void {
    const key = this.apiKeys.find(k => k.id === id);
    if (key) key.status = 'REVOKED';
  }

  /**
   * List Webhooks
   */
  static listWebhooks(tenantId: string = 'tenant-default'): WebhookSubscription[] {
    return this.webhooks.filter(w => w.tenantId === tenantId);
  }

  /**
   * Register Webhook
   */
  static registerWebhook(url: string, events: string[], tenantId: string = 'tenant-default'): WebhookSubscription {
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    const sub: WebhookSubscription = {
      id: `wh-${Date.now()}`,
      url,
      events,
      secret,
      status: 'ACTIVE',
      failureCount: 0,
      tenantId,
      createdAt: new Date().toISOString()
    };
    this.webhooks.unshift(sub);
    return sub;
  }
}
