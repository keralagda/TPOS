import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { ExperienceService, listQuerySchema } from '@/lib/vibe/experience-service';
import { createExperienceSchema } from '@/lib/vibe/types';
import { ok, parseBody, parseQuery, handle, toActor } from '@/lib/vibe/api-helpers';

export const GET = RouteGuard.protectApi('vibe.view', async (req: NextRequest) => {
  const q = parseQuery(req, listQuerySchema);
  if (q.error) return q.error;
  try {
    const items = await ExperienceService.list(q.data!);
    return ok({ items, page: q.data!.page, pageSize: q.data!.pageSize });
  } catch (e) { return handle(e); }
});

export const POST = RouteGuard.protectApi('vibe.create', async (req: NextRequest, user) => {
  const body = await parseBody(req, createExperienceSchema);
  if (body.error) return body.error;
  try {
    const exp = await ExperienceService.create(body.data!, toActor(user));
    return ok(exp, 201);
  } catch (e) { return handle(e); }
});
