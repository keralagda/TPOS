# Travel Planet — Domain Model / ERD Specification

## Core entities

### Identity
User
Organization
Role
Permission
Team
Workspace

### Traveler
TravelerProfile
TravelerPreference
TravelerDocument
Passenger

### Directory
Country
Region
City
Destination
Place
Attraction
Business
Experience
TravelService

### Commerce
Product
ProductVariant
Package
PackageComponent
Offer
RatePlan
Price
Availability
Promotion
Coupon

### Supplier
Vendor
VendorContact
VendorContract
SupplierSource
SupplierProduct
SupplierCredentialReference
SupplierSettlement

### Booking
SearchSession
Quote
Booking
BookingItem
BookingPassenger
BookingStatus
Cancellation
Refund
Voucher
Ticket

### Trip
Trip
Journey
JourneyLeg
Itinerary
ItineraryItem
TravelEvent
TripDocument
TripAlert

### CRM
Lead
Customer
Conversation
Case
Task
Activity
Campaign
CustomerSegment

### Finance
Payment
PaymentAttempt
Invoice
InvoiceLine
CreditNote
DebitNote
Commission
Markup
Settlement
LedgerEntry
Expense
TaxRecord

### Integration
Connector
ConnectorCapability
SyncJob
SyncRun
WebhookEndpoint
WebhookEvent
IntegrationEvent
IntegrationError

### AI
AIConversation
AIInsight
AIAction
AIRecommendation
AIJob
AISkill

## Relationship rules

- User may own one or more TravelerProfiles.
- Organization may own users and channels.
- Vendor is an organization participating as supplier.
- Product belongs to a vendor or Travel Planet.
- Offer references a canonical product and source offer.
- Booking references customer, channel, supplier, source and booking items.
- Trip may contain many bookings and itinerary items.
- Payment belongs to an order/booking and may have many attempts.
- Settlement aggregates supplier/partner financial obligations.
- Connector belongs to a provider and has explicit capabilities.
- SyncJob creates SyncRuns and IntegrationEvents.
- AIAction must reference an authorized target and execution policy.

## ERD implementation instruction

Use Prisma migrations.

Do not modify production schema directly without:
1. schema proposal
2. migration
3. data-impact review
4. rollback consideration
5. seed/test updates
