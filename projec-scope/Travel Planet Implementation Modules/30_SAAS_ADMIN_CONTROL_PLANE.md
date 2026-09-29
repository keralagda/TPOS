# SAAS ADMIN CONTROL PLANE

## Purpose

Govern multi-tenant commercial access, platform configuration, feature exposure, operation modes, releases, schedules, rollovers, incidents and system health.

## Navigation

Command Center, Organizations, Tenants, Workspaces, Plans, Entitlements, Feature Flags, Operation Modes, Releases, OTA Updates, Schedules, Rollover Queue, Maintenance, Approvals, Incidents, Health, Usage, Billing, Audit, Automation, Integrations, Settings.

## Control hierarchy

`PLATFORM → ENVIRONMENT → ORGANIZATION → TENANT → PLAN → WORKSPACE → MODE → USER`

## Entitlement vs flag

Entitlement = commercial permission.

Feature flag = release/exposure state.

Mode = versioned operational experience.

## Tenant safety

Every operation carries organizationId, tenantId, workspaceId, environment, actorId, correlationId.
