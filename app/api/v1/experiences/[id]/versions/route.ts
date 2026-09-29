import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { ExperienceService } from '@/lib/vibe/experience-service';
import { ok, handle } from '@/lib/vibe/api-helpers';

/** Version history for auditability (§44): who published what, when, why. */
export const GET = RouteGuard.protectApi('vibe.view', async (_req: NextRequest, _user, ctx: { params: { id: string } }) => {
  try {
    const versions = await ExperienceService.versions(ctx.params.id);
    return ok({ versions });
  } catch (e) { return handle(e); }
});
