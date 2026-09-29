# REVIEW / REPAIR PROMPTS

## Architecture review

Inspect for duplicate engines, responsibility leakage, route inconsistency, schema contradictions, missing registries and security gaps.

## UI review

Inspect for disconnected controls, inconsistent states, poor hierarchy, accessibility, responsive behavior and mode leakage.

## Data review

Inspect entities, foreign keys, constraints, indexes, tenant boundaries, lifecycle states, audit history and migration safety.

## API review

Inspect auth, validation, idempotency, rate limits, errors, pagination, consistency and event emission.

## AI review

Inspect data scope, provenance, tool permissions, hallucination controls, approval boundaries and observability.

## Production review

Find placeholders, fake data, TODOs, dead routes, unused flags, missing error handling and incomplete integrations.

## Repair rule

Repair the smallest coherent layer. Do not rewrite the system to fix one defect.
