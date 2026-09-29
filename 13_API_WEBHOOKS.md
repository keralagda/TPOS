# Travel Planet API + Webhook Specification

## API groups

/api/v1/search
/api/v1/destinations
/api/v1/products
/api/v1/offers
/api/v1/flights
/api/v1/hotels
/api/v1/packages
/api/v1/experiences
/api/v1/transport

/api/v1/quotes
/api/v1/bookings
/api/v1/payments
/api/v1/refunds

/api/v1/trips
/api/v1/itineraries
/api/v1/documents

/api/v1/customers
/api/v1/leads
/api/v1/vendors

/api/v1/connectors
/api/v1/sync-jobs
/api/v1/webhooks
/api/v1/ai

## Webhook examples

booking.created
booking.confirmed
booking.modified
booking.cancelled

payment.authorized
payment.captured
payment.failed
payment.refunded

offer.updated
inventory.updated
price.updated

vendor.sync.started
vendor.sync.completed
vendor.sync.failed

trip.updated
trip.disrupted

## Webhook processing

receive
→ authenticate
→ verify signature
→ idempotency
→ persist raw event
→ enqueue
→ process
→ domain event
→ audit
→ acknowledge

## API standards

- versioned endpoints
- OpenAPI specification
- consistent errors
- pagination
- filtering
- sorting
- idempotency
- request correlation IDs
- audit metadata
- RBAC
- rate limits
