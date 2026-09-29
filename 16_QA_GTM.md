# Travel Planet — QA / GTM Prompt

## QA layers

### Requirement
Every requested feature has evidence of implementation.

### Functional
Core flows work end to end.

### Integration
External APIs, webhooks and connector failures are tested.

### Schema
Relationships, indexes, constraints and migrations are correct.

### Permission
Every role sees and mutates only authorized data.

### Tenant isolation
Cross-organization leakage is impossible by default.

### Security
Secrets, PII, payments and integrations are protected.

### Realtime
Freshness and synchronization semantics are truthful.

### Concurrency
Double booking/payment/webhook/retry behavior is safe.

### Performance
Search, booking, dashboard and admin operations are measured.

### Accessibility
Keyboard, labels, focus, contrast and semantic structure.

### Responsive
Mobile/tablet/desktop.

### Zero state
No inventory, no bookings, no vendors, no customers.

### Failure recovery
API down, payment failure, timeout, webhook duplicate, vendor stale, connector disabled.

### Regression
Existing features remain functional.

## GTM states

READY
READY_WITH_CONDITIONS
NOT_READY
BLOCKED

Never mark READY when critical payment, booking, authorization or data-integrity paths remain unverified.
