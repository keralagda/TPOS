import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { DomainService, journeyDaySchema } from '@/lib/vibe/domain-service';
import { ok, parseBody, handle, toActor } from '@/lib/vibe/api-helpers';

export const POST = RouteGuard.protectApi('journeys.manage', async (req: NextRequest, user, ctx: { params: { id: string } }) => {
  const body = await parseBody(req, journeyDaySchema);
  if (body.error) return body.error;
  try {
    const day = await DomainService.upsertJourneyDay(ctx.params.id, body.data!, toActor(user));
    return ok(day, 201);
  } catch (e) { return handle(e); }
});
