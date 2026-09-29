# Travel Planet — Voyage8 Prompt Bundle

Version: 1.0.0
Status: Build-Ready Draft
Product: Travel Planet
Backbone: H8 → Voyage8 → Travel Planet
Initial model: B2C
Target evolution: B2B2C

## Purpose

This bundle contains a phased, sliced prompt system for building Travel Planet as a Travel Management + Directory OS.

Travel Planet combines:

- B2C travel marketplace
- Travel directory
- Search and discovery
- Flights, hotels, packages, experiences and transport
- Trip and itinerary management
- CRM
- ERP
- Accounting and finance
- Vendor/supplier management
- API and webhook integration
- Authorized vendor connectors
- Payment gateway abstraction
- AI administration and Voyage8 intelligence
- Future B2B2C, partner, reseller and white-label capabilities

## H8/Voyage8 operating model

H8 governs engineering and cognitive architecture.

Voyage8 provides travel-domain intelligence and capability architecture.

Travel Planet is the concrete commercial implementation.

The H8 source architecture separates reusable Platform Capability Profiles (PCPs) from complete Platform Solution Profiles (PSPs), uses Registry governance, and expects schema/relationship planning before implementation.

## Prompt execution order

1. 01_MASTER_SYSTEM_INSTRUCTION.md
2. 02_PROJECT_CONSTITUTION.md
3. 03_VOYAGE8_TRAVEL_BACKBONE.md
4. 04_PLATFORM_ARCHITECTURE.md
5. 05_DOMAIN_MODEL_ERD.md
6. 06_B2C_EXPERIENCE.md
7. 07_ADMIN_OS.md
8. 08_CRM_ERP_FINANCE.md
9. 09_CONNECT_HUB.md
10. 10_INITIAL_CONNECTORS.md
11. 11_PAYMENT_HUB.md
12. 12_AI_ASSISTANT.md
13. 13_API_WEBHOOKS.md
14. 14_SECURITY_COMPLIANCE.md
15. 15_IMPLEMENTATION_PHASES.md
16. 16_QA_GTM.md
17. 17_REGISTRY_PACK.md
18. 18_LOVABLE_MASTER_BUILD_PROMPT.md
19. 19_NEXTJS_VERCEL_BUILD_PROMPT.md
20. 20_SEED_DATA.md
21. 21_OPERATIONS_RUNBOOK.md
22. 22_CHANGE_REQUEST_TEMPLATE.md

## Usage

Use the master instruction first. Then execute implementation prompts in slices.

Do not ask the builder to implement the entire platform in one uncontrolled pass.

Each phase must:
- inspect existing code
- preserve working functionality
- plan schema changes before mutation
- update Registry artifacts
- implement
- test
- report changed files/routes/schema
- identify remaining work

## Connector note

Akbar Travels, Booking.com, Amadeus, Hotelbeds, Razorpay, Cashfree, PayU, CCAvenue, Google Maps, MSG91, Zoho Books and TallyPrime are included as initial connector candidates. Actual API availability, partner eligibility, commercial terms and production permissions must be confirmed before activation.

Authenticated vendor-site automation must only be used with explicit authorization and where the vendor permits it. APIs and official feeds are preferred.
