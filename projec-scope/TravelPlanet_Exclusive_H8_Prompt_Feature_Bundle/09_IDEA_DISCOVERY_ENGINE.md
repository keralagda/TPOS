# IDEA DISCOVERY ENGINE

## Purpose

Continuously discover valuable platform ideas without polluting the architecture with every suggestion.

## Lifecycle

`CANDID8 → EVALU8 → EXPERIMEN8 → ADOP8 → ARCHIVE8`

## Discovery sources

- user requests
- support friction
- analytics
- failed workflows
- search behavior
- customer interviews
- operator feedback
- supplier feedback
- competitor observation
- new APIs
- AI capabilities
- regulatory changes
- emerging travel behaviors
- internal runtime telemetry

## Idea object

```text
ideaId
title
problem
targetPersona
trigger
evidence
hypothesis
proposedSolution
expectedOutcome
dependencies
risk
effort
reversibility
strategicFit
experiment
successMetric
status
owner
source
```

## Discovery matrix

Score only as decision-support metadata; never let a score silently become product truth.

Dimensions:
- user value
- business value
- strategic fit
- feasibility
- evidence strength
- differentiation
- operational complexity
- risk
- reversibility

## Idea experiment

`HYPOTHESIS → MINIMUM EXPERIMENT → OBSERVE → EVALUATE → ADOPT/REFINE/ARCHIVE`

## Anti-proliferation

Do not create a new module when:
- an existing engine can own the responsibility;
- the feature is only a configuration;
- the feature is a workflow over existing objects;
- the idea lacks evidence.

## Idea discovery prompt

“Inspect the current architecture, workflows, telemetry and user journey. Discover gaps, friction, opportunities and adjacent capabilities. Separate verified gaps from hypotheses. Cluster duplicates. Map each candidate to an existing engine/module before proposing a new one. Produce experiments before permanent architecture.”
