/**
 * Travel Planet Connect — Inbound Webhook Verification Gateway
 * Governing documents: 09_CONNECT_HUB.md, 11_PAYMENT_HUB.md
 *
 * Rules:
 * - Signature verification: HMAC-SHA256 using connector/provider signing secret.
 * - Idempotency store: Deduplicate events using eventId or (connectorCode + idempotencyKey).
 * - Immutable Audit Logging on every received/processed/rejected webhook.
 * - Frontend success redirect NEVER confirms payment or booking — ONLY verified webhook or direct query.
 */

import * as crypto from 'crypto';
import { AuditLogger } from '../audit/audit-logger';

export type WebhookEventType =
  | 'payment.captured'
  | 'payment.failed'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'inventory.updated'
  | 'offer.updated'
  | 'pricing.delta';

export interface InboundWebhookRequest {
  connectorCode: string;
  signature: string;
  timestamp?: string | number;
  rawPayload: string;
  eventId?: string;
  eventType: WebhookEventType | string;
}

export interface WebhookProcessingResult {
  success: boolean;
  code: 'ACCEPTED' | 'DUPLICATE' | 'INVALID_SIGNATURE' | 'UNSUPPORTED_CONNECTOR' | 'PROCESSING_FAILED';
  message: string;
  eventId?: string;
  processedAt: Date;
}

export interface WebhookEventRecord {
  id: string;
  connectorCode: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'PROCESSED' | 'FAILED' | 'DUPLICATE' | 'REJECTED';
  processedAt: Date;
  error?: string;
}

export class WebhookVerificationGateway {
  private static instance: WebhookVerificationGateway;

  // In-memory idempotency store for processed/in-flight event IDs
  private idempotencyStore = new Map<string, { processedAt: Date; result: WebhookProcessingResult }>();

  // In-memory persistent history log (persists to DB in production via WebhookEvent model)
  private eventHistory: WebhookEventRecord[] = [];

  // Connector webhook signing secrets (in production, loaded securely from vault)
  private signingSecrets: Record<string, string> = {
    RAZORPAY: process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_demo_razorpay_9981',
    CASHFREE: process.env.CASHFREE_WEBHOOK_SECRET || 'whsec_demo_cashfree_8821',
    AKBAR: process.env.AKBAR_WEBHOOK_SECRET || 'whsec_demo_akbar_7731',
    BOOKING_COM: process.env.BOOKING_WEBHOOK_SECRET || 'whsec_demo_booking_6641',
    AMADEUS: process.env.AMADEUS_WEBHOOK_SECRET || 'whsec_demo_amadeus_5511',
  };

  private constructor() {}

  public static getInstance(): WebhookVerificationGateway {
    if (!WebhookVerificationGateway.instance) {
      WebhookVerificationGateway.instance = new WebhookVerificationGateway();
    }
    return WebhookVerificationGateway.instance;
  }

  /**
   * Verify signature using HMAC-SHA256
   */
  public verifySignature(connectorCode: string, rawPayload: string, signature: string): boolean {
    const secret = this.signingSecrets[connectorCode];
    if (!secret) {
      return false;
    }

    try {
      const computedHash = crypto
        .createHmac('sha256', secret)
        .update(rawPayload)
        .digest('hex');

      // Secure constant-time comparison
      const computedBuffer = Buffer.from(computedHash, 'utf8');
      const signatureBuffer = Buffer.from(signature, 'utf8');

      if (computedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(computedBuffer, signatureBuffer);
    } catch (err) {
      console.error(`[WebhookGateway] Signature verification error for ${connectorCode}:`, err);
      return false;
    }
  }

  /**
   * Main Inbound Webhook Processing Pipeline
   */
  public async receiveWebhook(request: InboundWebhookRequest): Promise<WebhookProcessingResult> {
    const now = new Date();
    const eventId = request.eventId || `wh_evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Validate connector existence
    const secret = this.signingSecrets[request.connectorCode];
    if (!secret) {
      AuditLogger.getInstance().log({
        action: 'WEBHOOK_REJECTED',
        entityType: 'WEBHOOK_EVENT',
        entityId: eventId,
        metadata: { connectorCode: request.connectorCode, reason: 'UNSUPPORTED_CONNECTOR' },
      });
      return {
        success: false,
        code: 'UNSUPPORTED_CONNECTOR',
        message: `Connector ${request.connectorCode} is not registered for webhooks.`,
        eventId,
        processedAt: now,
      };
    }

    // 2. Cryptographic signature check
    const isValidSignature = this.verifySignature(request.connectorCode, request.rawPayload, request.signature);
    if (!isValidSignature) {
      AuditLogger.getInstance().log({
        action: 'WEBHOOK_SIGNATURE_FAILED',
        entityType: 'WEBHOOK_EVENT',
        entityId: eventId,
        metadata: { connectorCode: request.connectorCode, eventType: request.eventType },
      });
      return {
        success: false,
        code: 'INVALID_SIGNATURE',
        message: 'Webhook HMAC signature validation failed.',
        eventId,
        processedAt: now,
      };
    }

    // 3. Idempotency Check
    const idempotencyKey = `${request.connectorCode}:${eventId}`;
    if (this.idempotencyStore.has(idempotencyKey)) {
      const previous = this.idempotencyStore.get(idempotencyKey)!;
      return {
        success: true,
        code: 'DUPLICATE',
        message: 'Event previously received and processed. Idempotent acknowledgment.',
        eventId,
        processedAt: previous.processedAt,
      };
    }

    // 4. Parse payload
    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(request.rawPayload);
    } catch {
      return {
        success: false,
        code: 'PROCESSING_FAILED',
        message: 'Malformed JSON payload.',
        eventId,
        processedAt: now,
      };
    }

    // 5. Dispatch domain event handler based on eventType
    try {
      await this.dispatchDomainAction(request.connectorCode, request.eventType, parsedPayload);

      const result: WebhookProcessingResult = {
        success: true,
        code: 'ACCEPTED',
        message: `Webhook event ${request.eventType} successfully verified and dispatched.`,
        eventId,
        processedAt: now,
      };

      // Store in idempotency cache
      this.idempotencyStore.set(idempotencyKey, { processedAt: now, result });

      // Record in history log
      this.eventHistory.unshift({
        id: eventId,
        connectorCode: request.connectorCode,
        eventType: request.eventType,
        payload: parsedPayload,
        status: 'PROCESSED',
        processedAt: now,
      });

      // Audit log the confirmed webhook mutation
      AuditLogger.getInstance().log({
        action: 'WEBHOOK_PROCESSED',
        entityType: 'WEBHOOK_EVENT',
        entityId: eventId,
        metadata: {
          connectorCode: request.connectorCode,
          eventType: request.eventType,
        },
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown processing error';

      this.eventHistory.unshift({
        id: eventId,
        connectorCode: request.connectorCode,
        eventType: request.eventType,
        payload: parsedPayload,
        status: 'FAILED',
        processedAt: now,
        error: errorMessage,
      });

      return {
        success: false,
        code: 'PROCESSING_FAILED',
        message: `Failed to process webhook domain action: ${errorMessage}`,
        eventId,
        processedAt: now,
      };
    }
  }

  /**
   * Internal Domain Event Handlers
   */
  private async dispatchDomainAction(
    connectorCode: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    console.info(`[WebhookGateway] Dispatching domain action for ${connectorCode} -> ${eventType}`);

    switch (eventType) {
      case 'payment.captured': {
        // e.g. from Razorpay or Cashfree
        const paymentId = (payload.paymentId as string) || (payload.id as string);
        const bookingId = (payload.bookingId as string) || (payload.notes as Record<string, string>)?.bookingId;
        console.log(`[WebhookGateway] Payment captured: paymentId=${paymentId}, bookingId=${bookingId}`);
        break;
      }

      case 'booking.confirmed': {
        // Supplier confirmed ticket issuance or reservation
        const supplierRef = payload.supplierRef as string;
        const pnr = payload.pnr as string;
        console.log(`[WebhookGateway] Supplier booking confirmed: supplierRef=${supplierRef}, pnr=${pnr}`);
        break;
      }

      case 'inventory.updated':
      case 'offer.updated':
      case 'pricing.delta': {
        // Live supplier inventory or pricing update
        const offerId = payload.offerId as string;
        const newPrice = payload.newPrice as number;
        console.log(`[WebhookGateway] Live offer update: offerId=${offerId}, newPrice=${newPrice}`);
        break;
      }

      default:
        console.log(`[WebhookGateway] Generic unhandled event type: ${eventType}`);
        break;
    }
  }

  /**
   * Diagnostic inspection methods
   */
  public getRecentEvents(limit: number = 20): WebhookEventRecord[] {
    return this.eventHistory.slice(0, limit);
  }

  public getSigningSecret(connectorCode: string): string | undefined {
    return this.signingSecrets[connectorCode];
  }
}
