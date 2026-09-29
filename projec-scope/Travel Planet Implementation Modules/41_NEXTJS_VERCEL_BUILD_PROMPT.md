# NEXT.JS / VERCEL BUILD PROMPT

Target:
Next.js App Router + TypeScript + existing project stack.

Inspect before changing.

Use:
- stable filesystem routes
- server components where appropriate
- server-side authorization
- typed domain services
- validated API contracts
- database transactions for critical mutations
- background jobs for long-running operations
- object storage for document binaries
- caching with explicit invalidation
- observability and structured logs.

Vercel deployment concerns:
- environment separation
- preview/staging/production
- secrets
- cron/scheduled jobs where appropriate
- queues/background execution through supported infrastructure
- Blob storage
- database connection limits
- webhook security.

Do not put long-running stateful orchestration into a fragile request handler.
