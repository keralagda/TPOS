# DMS + DOCUMENT TEMPLATE ENGINE

## Responsibility

Document storage, intelligence, workflow, templates, generation, lifecycle and compliance.

## Storage

Vercel Blob for binaries. Postgres/Neon for metadata, relationships, permissions, workflow and audit.

Never store document binaries in relational records.

## Lifecycle

`DRAFT → UPLOADED → PROCESSING → REVIEW → VERIFIED → APPROVED → ACTIVE → EXPIRED → ARCHIVED → DELETED`

Failure states:
UPLOAD_FAILED, PROCESSING_FAILED, REJECTED, QUARANTINED.

## Intelligence

`VALIDATE → SECURITY CHECK → OCR → CLASSIFY → EXTRACT → VALIDATE → CONFIDENCE → HUMAN REVIEW → REGISTRY`

Extracted ≠ verified.

## DTE

Blocks:
text, headings, rich text, lists, labels, badges, dynamic fields, conditions, lookups, relationships, containers, tables, page breaks, images, QR, barcode, signatures, maps, travel components.

## Travel blocks

Flight Segment, Hotel Card, Traveler Card, Itinerary Timeline, Booking Summary, Payment Summary, Visa Checklist, Destination Card, Transfer Details, Experience Card, Emergency Contact.

## Binding

`{{customer.firstName}}`
`{{traveler.passportNumber}}`
`{{booking.reference}}`
`{{booking.totalAmount}}`
`{{trip.destination.name}}`

## Generation

`Template → Version → Data Context → Validation → Render → PDF/DOCX → Store → Audit`

Published templates are immutable. New versions are created.
