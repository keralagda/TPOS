# Initial Connector Pack

## P0 candidates

### Akbar Travels
Potential:
- flights
- hotels
- B2B travel inventory

Integration:
official API/partner access where available.

### Booking.com
Potential:
- accommodation
- cars
- attractions
- booking/search flows depending on partner/API access.

### Razorpay
Payment collection, verification, refunds, webhook events.

### Cashfree
Payment collection, refunds, webhook events and related payment operations.

### Google Maps Platform
Places, geocoding, maps, routes, route matrices and location services.

### MSG91
SMS and WhatsApp communication.

### Custom Vendor Connector
Authorized vendor portals without an API.

## P1 candidates

### Amadeus
Flights, hotels, destination experiences, cars/transfers depending on product/access level.

### Hotelbeds
Hotels, activities and transfers.

### PayU
Payments, refunds, webhook events.

### CCAvenue
Payment gateway and merchant payment integration.

### Zoho Books
Accounting, invoices, customers/vendors, tax and reconciliation workflows.

### TallyPrime
Accounting data exchange and reporting integration.

## Connector implementation order

1. Connector Registry
2. generic auth layer
3. API client abstraction
4. retry/idempotency
5. normalization
6. freshness
7. webhook processing
8. monitoring
9. provider connector
10. test fixtures
11. contract tests
12. production activation

## Important

Provider names are candidate integrations, not guaranteed production access.

Before implementation, verify:
- current API availability
- partner eligibility
- commercial agreement
- supported products
- booking permissions
- rate limits
- webhook support
- production requirements
