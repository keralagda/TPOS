import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { z } from 'zod';
import { ExperienceService } from '@/lib/vibe/experience-service';
import { ok, parseBody, handle, toActor } from '@/lib/vibe/api-helpers';

const rollbackBody = z.object({
  targetVersion: z.number().int().min(1),
  reason: z.string().min(3).max(500),
});

/** Roll back to a previous published version without deleting history. */
export const POST = RouteGuard.protectApi('vibe.publish', async (req: NextRequest, user, ctx: { params: { id: string } }) => {
  const body = await parseBody(req, rollbackBody);
  if (body.error) return body.error;
  try {
    const result = await ExperienceService.rollback(ctx.params.id, body.data!.targetVersion, toActor(user), body.data!.reason);
    return ok({ experienceId: result.experience.id, publishedVersion: result.experience.publishedVersion });
  } catch (e) { return handle(e); }
});
