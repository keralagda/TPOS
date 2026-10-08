/**
 * Travel Planet (Voyage8) — Server Authentication Entry Point (src/lib/auth.ts)
 * 
 * Re-exports the unified Better Auth + RBAC engine for App Router and API handlers.
 */

export * from '../../lib/auth/better-auth';
export { auth as default } from '../../lib/auth/better-auth';
