# Next.js + Vercel Implementation Prompt

Implement Travel Planet using a modular Next.js application.

## Suggested structure

app/
  (marketing)/
  (consumer)/
  (account)/
  (admin)/
  (vendor)/
  api/

components/
  travel/
  booking/
  directory/
  admin/
  crm/
  finance/
  integrations/
  ai/

lib/
  auth/
  db/
  payments/
  connectors/
  webhooks/
  search/
  voyage8/
  registry/
  audit/

prisma/
  schema.prisma
  migrations/
  seed/

## Route families

/
/explore
/destinations/[slug]
/hotels
/flights
/packages
/experiences
/trips
/account

/admin
/admin/bookings
/admin/trips
/admin/customers
/admin/vendors
/admin/integrations
/admin/finance
/admin/ai
/admin/settings

/vendor
/vendor/products
/vendor/bookings
/vendor/inventory
/vendor/settlements

/api/v1/*

## Deployment

Use environment variables for all credentials.

Separate:
development
staging
production

Use background jobs for long-running synchronization.

Do not execute supplier scraping or large sync jobs in synchronous request handlers.
