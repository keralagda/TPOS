# Travel Planet Registry Pack

## Registry families

TP-FRAMEWORK-REGISTRY
TP-DESTINATION-REGISTRY
TP-DIRECTORY-REGISTRY
TP-PRODUCT-REGISTRY
TP-OFFER-REGISTRY
TP-SUPPLIER-REGISTRY
TP-INVENTORY-REGISTRY
TP-BOOKING-REGISTRY
TP-TRIP-REGISTRY
TP-ITINERARY-REGISTRY
TP-DOCUMENT-REGISTRY
TP-POLICY-REGISTRY
TP-INTEGRATION-REGISTRY
TP-WEBHOOK-REGISTRY
TP-CONNECTOR-REGISTRY
TP-WORKFLOW-REGISTRY
TP-AI-SKILL-REGISTRY
TP-FINANCE-REGISTRY

## Required registry metadata

registry_id
object_id
canonical_name
type
version
status
generated_by
source_prompt_ref
source_request_ref
source_file_ref
derivation_method
confidence
supersedes
superseded_by
created_at
updated_at

## Supported object types

REQUEST
PROMPT
ENTITY
SCHEMA
FIELD
RELATIONSHIP
COMPONENT
MODULE
FEATURE
RULE
WORKFLOW
PERMISSION
ROLE
WORKSPACE
API
WEBHOOK
CONNECTOR
EVENT
DECISION
DOCTRINE
CONTEXT
REASONING
NAME
ARTIFACT
QA

## Governance

Architecture changes require Registry diff/version updates.

KLUE or AI may recommend changes but must not silently mutate governed architecture.
