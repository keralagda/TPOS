/**
 * VIBE API helpers — consistent structured errors, Zod parsing, pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { AuthUser } from '@/lib/auth/rbac-engine';
import type { Actor } from './experience-service';

export function toActor(user: AuthUser): Actor {
  return {
    id: user.id,
    email: user.email,
    role: user.roles?.[0],
    organizationId: user.organizationId ?? null,
    workspaceId: user.workspaceId ?? null,
  };
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json({ success: false, error: { code, message, details } }, { status });
}

export function parseBody<T extends z.ZodTypeAny>(req: NextRequest, schema: T): Promise<{ data?: z.infer<T>; error?: NextResponse }> {
  return req.json().then(
    (body) => {
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return { error: fail('VALIDATION_ERROR', 'Invalid request body', 422, parsed.error.flatten()) };
      }
      return { data: parsed.data };
    },
    () => ({ error: fail('INVALID_JSON', 'Request body must be valid JSON', 400) })
  );
}

export function parseQuery<T extends z.ZodTypeAny>(req: NextRequest, schema: T): { data?: z.infer<T>; error?: NextResponse } {
  const url = new URL(req.url);
  const raw: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { raw[k] = v; });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: fail('VALIDATION_ERROR', 'Invalid query parameters', 422, parsed.error.flatten()) };
  return { data: parsed.data };
}

/** Map thrown service errors to structured responses */
export function handle(err: unknown): NextResponse {
  if (err && typeof err === 'object' && 'code' in err && 'status' in err) {
    const e = err as { code: string; message: string; status: number };
    return fail(e.code, e.message, e.status);
  }
  if (err instanceof z.ZodError) {
    return fail('VALIDATION_ERROR', 'Validation failed', 422, err.flatten());
  }
  const msg = err instanceof Error ? err.message : 'Internal error';
  console.error('[VIBE API ERROR]', err);
  return fail('INTERNAL_ERROR', msg, 500);
}
