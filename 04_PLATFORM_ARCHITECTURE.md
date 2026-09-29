# Travel Planet — Platform Architecture

## High-level

H8
→ Voyage8
→ Travel Planet Core
→ Domain Services
→ Experience Apps / Admin OS / Vendor Portal / Partner APIs

## Major domains

IDENTITY
TRAVELER
DIRECTORY
DESTINATION
PRODUCT
OFFER
SUPPLIER
INVENTORY
SEARCH
BOOKING
TRIP
ITINERARY
CRM
FINANCE
ACCOUNTING
PAYMENT
INTEGRATION
NOTIFICATION
AI
CONTENT
MARKETING
ANALYTICS
AUDIT
REGISTRY

## Service boundaries

### Consumer Experience
- home
- search
- discovery
- product details
- checkout
- account
- trips

### Commerce
- search orchestration
- offer normalization
- pricing
- booking
- cancellation
- refund

### Operations
- booking operations
- trip operations
- support
- documents
- vendor operations

### Business
- CRM
- ERP
- finance
- accounting
- procurement

### Connect
- connector registry
- API gateway
- webhook gateway
- sync engine
- event bus
- integration logs

### Intelligence
- Voyage8 reasoning
- AI assistant
- recommendation
- offer intelligence
- trip planning

## Event-driven rules

External events must pass through:
authentication → signature verification → idempotency → event store → queue → processor → domain event.

## External source freshness

Every imported offer must record:
- source
- source_offer_id
- retrieved_at
- last_verified_at
- sync_mode
- sync_status
- freshness
- confidence
