# Lovable Master Build Prompt — Travel Planet

Build Travel Planet as a production-oriented B2C-first Travel Management + Directory OS.

Use the H8 → Voyage8 architecture described in the accompanying bundle.

## Build constraints

- Next.js/React/TypeScript style architecture
- Tailwind/shadcn-style UI
- PostgreSQL/Prisma-compatible domain model
- modular services
- API-first integration layer
- responsive design
- accessible UI
- real loading/error/empty states
- no fake backend claims

## First build slice

Implement:
1. landing page
2. search shell
3. destination directory
4. product cards
5. product detail
6. authentication
7. customer account
8. My Trips shell
9. admin shell
10. admin dashboard
11. expanded sidebar
12. AI Assistant shell
13. vendor shell
14. connector registry shell

## Admin identity

Amal Babu — Super Admin.

## Admin style

Travel Planet travel-commerce visual language:
- dark expanded sidebar
- light workspace
- clean cards
- operational tables
- charts
- integration status
- travel imagery only where useful
- clear hierarchy
- desktop-first admin with responsive support

## AI Assistant

Right-side assistant:
Chat / Insights / Actions / Automations.

## Important

Do not fabricate live supplier inventory.

Use seeded demo data behind explicit development/demo flags until real connectors are configured.

Create a clear separation between:
- UI
- domain services
- connector adapters
- external APIs
- database
- AI services.

After implementation provide:
- routes
- components
- schema
- APIs
- seed data
- TODOs
- test coverage
