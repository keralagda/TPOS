# LOVABLE / FULL-STACK BUILDER MASTER PROMPT

Build the existing Travel Planet application as a production-grade Travel Operating System.

FIRST:
1. inspect repository;
2. inspect routes;
3. inspect auth/RBAC;
4. inspect database/schema;
5. inspect existing design system;
6. inspect current modules;
7. inspect integrations;
8. inspect feature flags;
9. inspect mode/workspace architecture;
10. produce a gap map before destructive changes.

THEN:
- preserve working features;
- reuse existing services;
- add migrations before code relying on new fields;
- build shared engines before repeated screens;
- enforce server-side authorization;
- use real persistence;
- implement loading/error/empty/success states;
- update registry;
- test each vertical slice.

DO NOT:
- rebuild from zero;
- invent APIs;
- fabricate connector credentials;
- replace existing working modules;
- create duplicate business logic;
- ship placeholder buttons.

IMPLEMENT IN PHASES:
Core → Identity/Tenancy/RBAC → Registry → Experience Shell → Voyage8 → CRM/TMS/ERP → Supplier/DMS/Finance → Social/GEM8 → AI/Voice → VIBE → SaaS Control Plane → OTA/Rollover → QA/Hardening.

At each phase report:
changed files, routes, schema, APIs, registry objects, tests, known gaps.
