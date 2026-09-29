# FEATURE FLAG ENGINE

## Flag types

BOOLEAN, STRING, NUMBER, JSON, VARIANT, EXPERIMENT, KILL_SWITCH, CONFIGURATION.

## States

DRAFT, SCHEDULED, STAGED, ACTIVE, PAUSED, ROLLOVER_PENDING, ROLLED_OVER, ROLLED_BACK, EXPIRED, ARCHIVED.

## Targeting

Global, environment, region, organization, tenant, workspace, plan, role, cohort, percentage.

## Evaluation

`USER → TENANT → PLAN → ROLE → ENVIRONMENT → FLAG → SCHEDULE → TARGETING → ENTITLEMENT → OVERRIDE → FINAL VALUE`

## Requirements

Deterministic, fast, cacheable, server-authoritative, version-aware, auditable.

## Safety

Feature flags never substitute for permission checks.
