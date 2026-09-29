/**
 * API Route: /api/v1/connectors
 * Handles listing connectors and updating configuration/credentials/status
 */

import { NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/audit/audit-logger';

// In-memory connector state for API responses
const connectors = [
  {
    code: 'AKBAR',
    name: 'Akbar Travels',
    category: 'INVENTORY',
    status: 'NOT_CONFIGURED',
    capabilities: ['FLIGHT_SEARCH', 'HOTEL_SEARCH', 'B2B_BOOKING'],
    rateLimitRps: 10,
    syncMode: 'DELTA_FEED',
    lastSyncAt: null,
  },
  {
    code: 'BOOKING_COM',
    name: 'Booking.com',
    category: 'INVENTORY',
    status: 'NOT_CONFIGURED',
    capabilities: ['HOTEL_SEARCH', 'AVAILABILITY', 'RATES'],
    rateLimitRps: 5,
    syncMode: 'DELTA_FEED',
    lastSyncAt: null,
  },
  {
    code: 'AMADEUS',
    name: 'Amadeus GDS',
    category: 'INVENTORY',
    status: 'NOT_CONFIGURED',
    capabilities: ['GDS_FLIGHTS', 'HOTELS', 'ACTIVITIES'],
    rateLimitRps: 10,
    syncMode: 'ON_DEMAND',
    lastSyncAt: null,
  },
  {
    code: 'RAZORPAY',
    name: 'Razorpay',
    category: 'PAYMENT',
    status: 'NOT_CONFIGURED',
    capabilities: ['PAYMENT_COLLECTION', 'REFUNDS', 'WEBHOOKS'],
    rateLimitRps: 20,
    syncMode: 'WEBHOOK',
    lastSyncAt: null,
  },
  {
    code: 'CASHFREE',
    name: 'Cashfree Payments',
    category: 'PAYMENT',
    status: 'NOT_CONFIGURED',
    capabilities: ['PAYMENT_COLLECTION', 'REFUNDS', 'PAYOUTS'],
    rateLimitRps: 20,
    syncMode: 'WEBHOOK',
    lastSyncAt: null,
  },
  {
    code: 'GOOGLE_MAPS',
    name: 'Google Maps Platform',
    category: 'LOCATION',
    status: 'NOT_CONFIGURED',
    capabilities: ['GEOCODING', 'PLACES_SEARCH', 'ROUTES_MATRIX'],
    rateLimitRps: 50,
    syncMode: 'ON_DEMAND',
    lastSyncAt: null,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: connectors,
    meta: { count: connectors.length, timestamp: new Date().toISOString() },
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { code, status, credentialRefId } = body;

    const connector = connectors.find((c) => c.code === code);
    if (!connector) {
      return NextResponse.json(
        { success: false, error: `Connector with code ${code} not found.` },
        { status: 404 }
      );
    }

    if (status) {
      connector.status = status;
    }

    AuditLogger.getInstance().log({
      action: 'UPDATE',
      entityType: 'Connector',
      entityId: code,
      metadata: { event: 'CONNECTOR_UPDATED', newStatus: status, credentialConfigured: Boolean(credentialRefId) },
    });

    return NextResponse.json({
      success: true,
      message: `Connector ${code} successfully updated.`,
      data: connector,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
