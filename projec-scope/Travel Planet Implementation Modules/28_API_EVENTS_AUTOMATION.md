# API / EVENTS / AUTOMATION

## API

Versioned, authenticated, authorized, rate-limited, observable.

## Events

Domain events should be immutable facts, not commands disguised as events.

Examples:
CUSTOMER_CREATED
ENQUIRY_CREATED
QUOTE_ACCEPTED
BOOKING_CONFIRMED
PAYMENT_RECEIVED
DOCUMENT_VERIFIED
TRIP_STARTED
TRIP_COMPLETED
FEATURE_FLAG_CHANGED
MODE_ROLLOVER_STARTED.

## Automation

Trigger → condition → action → approval → notification → next state.

## Reliability

Idempotency keys, retries, dead-letter handling, correlation IDs and replay controls.
