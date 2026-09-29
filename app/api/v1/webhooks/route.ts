/**
 * API Route: /api/v1/webhooks
 * Public Inbound Webhook Endpoint for external partner callbacks
 *
 * Rules:
 * - Validates HMAC signature via WebhookVerificationGateway
 * - Checks idempotency before domain event execution
 * - Frontend redirects NEVER confirm payments; this server-to-server endpoint does!
 */

import { NextResponse } from 'next/server';
import { WebhookVerificationGateway } from '@/lib/webhooks/webhook-gateway';

export async function POST(request: Request) {
  try {
    const rawPayload = await request.text();
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('x-signature') || '';
    const connectorCode = request.headers.get('x-connector-code') || '';
    const eventType = request.headers.get('x-event-type') || 'unknown.event';
    const eventId = request.headers.get('x-event-id') || undefined;

    if (!connectorCode) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory X-Connector-Code header' },
        { status: 400 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory signature header (X-Webhook-Signature)' },
        { status: 401 }
      );
    }

    const gateway = WebhookVerificationGateway.getInstance();
    const result = await gateway.receiveWebhook({
      connectorCode,
      signature,
      rawPayload,
      eventType,
      eventId,
    });

    if (!result.success) {
      const statusCode = result.code === 'INVALID_SIGNATURE' ? 401 : 400;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error processing webhook';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  const gateway = WebhookVerificationGateway.getInstance();
  const recentEvents = gateway.getRecentEvents();
  return NextResponse.json({
    success: true,
    data: recentEvents,
    meta: { count: recentEvents.length },
  });
}
