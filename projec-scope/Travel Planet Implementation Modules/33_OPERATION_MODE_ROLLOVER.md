# OPERATION MODE ROLLOVER

## First-class entity

Operation modes are versioned operational experiences, not static menu labels.

## Mode version can include

Navigation, dashboard, widgets, KPIs, workflows, functions, AI profile, search profile, permissions, data views, UX, help, Joyride, voice commands and feature flags.

## Mode lifecycle

DRAFT, SCHEDULED, STAGED, ACTIVE, PAUSED, ROLLING_OVER, ROLLED_OVER, DEPRECATED, DISABLED, EMERGENCY_DISABLED.

## Timed rollover

`CURRENT MODE/VERSION → PREPARE → VALIDATE → STAGE → ACTIVATE → OBSERVE → STABLE → RETIRE OLD`

## Coexistence

Different tenants may run different mode versions during controlled rollout.

## Permission diff

Before rollout compare added, removed and changed permissions. New privilege and removal of privilege require governed review.

## Mode switcher

Closed dropdown resolves to the active version. Normal users see friendly state; admins can inspect version/rollout state.

## Voice

“Schedule CRM update for tomorrow” and “Pause CRM rollout” are valid only for authorized SaaS operators.
