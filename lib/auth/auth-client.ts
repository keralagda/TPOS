'use client';

/**
 * Travel Planet (Voyage8) — Better-Auth Client SDK
 * 
 * Client-side authentication helpers, hooks, and RBAC utilities for React / Next.js.
 */

import { createAuthClient } from 'better-auth/react';
import { adminClient, organizationClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  plugins: [
    adminClient(),
    organizationClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  organization,
} = authClient;

export default authClient;
