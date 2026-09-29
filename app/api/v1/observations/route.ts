import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { DomainService, observationCreateSchema } from '@/lib/vibe/domain-service';
import { ok, parseBody, handle, toActor } from '@/lib/vibe/api-helpers';

/** Structured, attributed observation with provenance (§22). Never a "fact". */
export const POST = RouteGuard.protectApi('places.manage', async (req: NextRequest, user) => {
  const body = await parseBody(req, observationCreateSchema);
  if (body.error) return body.error;
  try {
    const observation = await DomainService.recordObservation(body.data!, toActor(user));
    return ok(observation, 201);
  } catch (e) { return handle(e); }
});
