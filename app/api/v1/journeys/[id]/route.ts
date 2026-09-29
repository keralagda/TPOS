import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { z } from 'zod';
import { DomainService } from '@/lib/vibe/domain-service';
import { ok, parseBody, handle, toActor } from '@/lib/vibe/api-helpers';

export const PUT = RouteGuard.protectApi('journeys.manage', async (req: NextRequest, user, ctx: { params: { id: string } }) => {
  const body = await parseBody(req, z.object({
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PRIVATE'),
  }));
  if (body.error) return body.error;
  try {
    const journey = await DomainService.setJourneyStatus(ctx.params.id, body.data!.status, body.data!.visibility, toActor(user));
    return ok(journey);
  } catch (e) { return handle(e); }
});
