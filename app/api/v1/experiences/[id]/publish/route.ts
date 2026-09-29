import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { z } from 'zod';
import { ExperienceService } from '@/lib/vibe/experience-service';
import { ok, parseBody, handle, toActor } from '@/lib/vibe/api-helpers';

const publishBody = z.object({ changeNote: z.string().max(500).default('') }).default({ changeNote: '' });

/** Publish current draft as a new immutable version (consequential). */
export const POST = RouteGuard.protectApi('vibe.publish', async (req: NextRequest, user, ctx: { params: { id: string } }) => {
  const body = await parseBody(req, publishBody);
  if (body.error) return body.error;
  try {
    const result = await ExperienceService.publish(ctx.params.id, toActor(user), body.data!.changeNote);
    return ok({ experienceId: result.experience.id, publishedVersion: result.experience.publishedVersion, versionId: result.version.id });
  } catch (e) { return handle(e); }
});
