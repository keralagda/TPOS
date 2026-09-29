# Security / Compliance Prompt

## Identity

- RBAC
- MFA for privileged roles
- session controls
- tenant isolation
- organization boundaries
- least privilege

## Data

- encryption in transit
- encryption at rest
- secrets vault
- PII classification
- retention policy
- deletion/anonymization workflows
- audit trails

## Integration

- OAuth where possible
- API key rotation
- webhook signature validation
- IP restrictions where appropriate
- connector-specific permissions
- retry limits
- circuit breakers

## Payments

- gateway tokenization
- no raw card storage
- payment verification
- reconciliation
- fraud/risk controls
- immutable event records

## Vendor scraping/browser connectors

Only permitted, authorized automation.

Do not:
- bypass CAPTCHA
- bypass access controls
- evade anti-bot systems
- reuse credentials outside authorization
- scrape restricted content
- ignore provider terms

## AI

- tool permission boundaries
- confirmation for consequential actions
- audit AI actions
- protect PII
- prevent cross-tenant context leakage
- maintain provenance
