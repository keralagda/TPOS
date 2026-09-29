import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { prisma } from '@/lib/prisma';
import { ExperienceService } from '@/lib/vibe/experience-service';
import { updateCompositionSchema } from '@/lib/vibe/types';
import { ok, parseBody, handle, toActor } from '@/lib/vibe/api-helpers';

export const GET = RouteGuard.protectApi('vibe.view', async (_req: NextRequest, _user, ctx: { params: { id: string } }) => {
  try {
    const exp = await prisma.experience.findUnique({
      where: { id: ctx.params.id },
      include: { versions: { orderBy: { version: 'desc' }, take: 20, select: { version: true, status: true, changeNote: true, publishedAt: true, publishedBy: true, createdAt: true } } },
    });
    if (!exp) return handle(Object.assign(new Error('Experience not found'), { code: 'NOT_FOUND', status: 404 }));
    return ok(exp);
  } catch (e) { return handle(e); }
});

export const PATCH = RouteGuard.protectApi('vibe.edit', async (req: NextRequest, user, ctx: { params: { id: string } }) => {
  const body = await parseBody(req, updateCompositionSchema);
  if (body.error) return body.error;
  try {
    const exp = await ExperienceService.updateComposition(ctx.params.id, body.data!.expectedVersion, body.data!.composition, toActor(user), body.data!.changeNote);
    return ok({ id: exp.id, version: exp.version });
  } catch (e) { return handle(e); }
});

export const DELETE = RouteGuard.protectApi('vibe.edit', async (_req: NextRequest, user, ctx: { params: { id: string } }) => {
  try {
    const exp = await ExperienceService.archive(ctx.params.id, toActor(user));
    return ok({ id: exp.id, status: exp.status });
  } catch (e) { return handle(e); }
});
