# Travel Planet Payment Hub

## Goal

Make payments provider-neutral.

Initial candidates:
- Razorpay
- Cashfree
- PayU
- CCAvenue

## Internal interface

createPayment()
authorizePayment()
capturePayment()
verifyPayment()
refundPayment()
partialRefund()
getPaymentStatus()
createPaymentLink()
handleWebhook()
reconcilePayment()

## Payment lifecycle

INITIATED
→ PENDING
→ AUTHORIZED
→ CAPTURED
→ SETTLED

Failure:
FAILED
EXPIRED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED

## Security

- never store raw card data
- use gateway tokenization
- verify gateway signatures
- idempotency keys
- server-side payment verification
- immutable payment event history
- reconciliation jobs

## Booking rule

A successful frontend redirect is not sufficient evidence of payment.

Payment state must be verified through the gateway/API/webhook layer before booking finalization.
