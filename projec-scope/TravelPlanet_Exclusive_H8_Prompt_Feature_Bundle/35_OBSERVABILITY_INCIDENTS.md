# OBSERVABILITY / INCIDENT OPS

## Signals

Errors, latency, availability, auth failures, booking failures, payment failures, search failures, AI failures, workflow failures, queue depth, DB latency.

## Correlation

All major operations carry correlation IDs.

## Incident states

DETECTED → ACKNOWLEDGED → INVESTIGATING → MITIGATING → RESOLVED → CLOSED.

## Incident links

Incident ↔ release ↔ mode ↔ feature flag ↔ tenant ↔ audit.

## Operations

Pause rollout, kill switch, notify, create task, request approval, rollback, resume.

## Product telemetry

Track feature adoption, workflow completion, search success, voice success, error rates and tenant health without collecting unnecessary sensitive content.
