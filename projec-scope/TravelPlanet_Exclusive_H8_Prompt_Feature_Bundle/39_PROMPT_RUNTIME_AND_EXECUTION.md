# PROMPT RUNTIME / EXECUTION SYSTEM

## Prompt tiers

1. Core System Instruction
2. Runtime Builder Prompt
3. Module/Artifact Prompt
4. Review/Repair Prompt

## Prompt contract

Every implementation prompt should specify:

`OBJECTIVE + CONTEXT + EXISTING EVIDENCE + CONSTRAINTS + SCOPE + DEPENDENCIES + INPUTS + OUTPUTS + FILES/ROUTES + DATA + REGISTRY + SECURITY + QA + ACCEPTANCE`

## Execution slices

Use:
- Full architecture slice
- Domain slice
- Vertical slice
- Feature slice
- Repair slice
- Audit slice
- Migration slice

## Runtime loop

`DISCOVER → PLAN → EXECUTE → OBSERVE → VERIFY → SAVE BACK`

## Anti-drift

Protect:
- user objective
- existing architecture
- accepted terminology
- non-negotiable constraints
- current registry
- security boundaries.

## Prompt assembly

The system should assemble only relevant module prompts into the active execution context. Do not blindly concatenate the entire knowledge base.
