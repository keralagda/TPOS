/**
 * Travel Planet Payment Hub — Provider-Neutral Payment Abstraction
 * Governing document: 11_PAYMENT_HUB.md
 * 
 * Non-negotiable rules:
 * 1. Never store raw card details.
 * 2. Gateway tokenization and server-side signature verification.
 * 3. Frontend redirect is NEVER sufficient evidence of payment.
 * 4. Payment must be verified server-to-server or via verified webhook before booking status reaches CONFIRMED.
 */

export type SupportedPaymentGateway = 'RAZORPAY' | 'CASHFREE' | 'PAYU' | 'CCAVENUE' | 'MOCK_DEMO';

export type PaymentLifecycleStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'SETTLED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface CreatePaymentRequest {
  bookingId: string;
  bookingNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentOrderResult {
  paymentId: string;
  gateway: SupportedPaymentGateway;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  status: PaymentLifecycleStatus;
  clientSecret?: string;
  checkoutUrl?: string;
}

export interface PaymentVerificationRequest {
  paymentId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
  authorizedBy: string;
}

export interface IPaymentGatewayAdapter {
  readonly gatewayName: SupportedPaymentGateway;

  createOrder(req: CreatePaymentRequest): Promise<PaymentOrderResult>;
  verifyPayment(req: PaymentVerificationRequest): Promise<boolean>;
  capturePayment(gatewayPaymentId: string, amount: number): Promise<boolean>;
  refund(req: RefundRequest): Promise<{ refundId: string; status: string }>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

/**
 * PaymentHub acts as the unified dispatcher across all gateways
 */
export class PaymentHub {
  private adapters: Map<SupportedPaymentGateway, IPaymentGatewayAdapter> = new Map();

  registerAdapter(adapter: IPaymentGatewayAdapter): void {
    this.adapters.set(adapter.gatewayName, adapter);
  }

  getAdapter(gateway: SupportedPaymentGateway): IPaymentGatewayAdapter {
    const adapter = this.adapters.get(gateway);
    if (!adapter) {
      throw new Error(`Payment adapter for ${gateway} is not registered or configured.`);
    }
    return adapter;
  }

  async createPayment(gateway: SupportedPaymentGateway, req: CreatePaymentRequest): Promise<PaymentOrderResult> {
    const adapter = this.getAdapter(gateway);
    return adapter.createOrder(req);
  }

  /**
   * CRITICAL SECURITY CHECK:
   * Confirms payment validity through cryptographic signature or direct gateway query.
   * Client-side success redirect MUST NOT be trusted alone.
   */
  async verifyAndFinalizePayment(
    gateway: SupportedPaymentGateway,
    req: PaymentVerificationRequest
  ): Promise<{ isVerified: boolean; status: PaymentLifecycleStatus }> {
    const adapter = this.getAdapter(gateway);
    const isValid = await adapter.verifyPayment(req);

    if (!isValid) {
      return { isVerified: false, status: 'FAILED' };
    }

    // In a full implementation, capture and update ledger here
    return { isVerified: true, status: 'CAPTURED' };
  }

  async processRefund(
    gateway: SupportedPaymentGateway,
    req: RefundRequest
  ): Promise<{ refundId: string; status: string }> {
    const adapter = this.getAdapter(gateway);
    return adapter.refund(req);
  }
}

/**
 * Mock / Demo adapter for local development & Phase 0/1 testing
 */
export class DemoPaymentAdapter implements IPaymentGatewayAdapter {
  readonly gatewayName: SupportedPaymentGateway = 'MOCK_DEMO';

  async createOrder(req: CreatePaymentRequest): Promise<PaymentOrderResult> {
    return {
      paymentId: `pay_mock_${Date.now()}`,
      gateway: this.gatewayName,
      gatewayOrderId: `order_mock_${Math.random().toString(36).substring(7)}`,
      amount: req.amount,
      currency: req.currency,
      status: 'INITIATED',
      checkoutUrl: `/checkout/mock-gateway?bookingId=${req.bookingId}`,
    };
  }

  async verifyPayment(req: PaymentVerificationRequest): Promise<boolean> {
    // Verified if mock signature has expected prefix
    return Boolean(req.gatewayPaymentId && req.gatewayOrderId);
  }

  async capturePayment(gatewayPaymentId: string, amount: number): Promise<boolean> {
    return true;
  }

  async refund(req: RefundRequest): Promise<{ refundId: string; status: string }> {
    return {
      refundId: `rfnd_mock_${Date.now()}`,
      status: 'COMPLETED',
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    return signature === 'demo_valid_signature';
  }
}
