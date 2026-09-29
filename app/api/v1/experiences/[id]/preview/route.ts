import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { AuthorizationEngine } from '@/lib/auth/rbac-engine';
import { prisma } from '@/lib/prisma';
import { VibeRuntime, type ViewerContext } from '@/lib/vibe/runtime';
import { buildEntityContext } from '@/lib/vibe/data-context';
import { ok, handle, parseQuery } from '@/lib/vibe/api-helpers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const previewQuerySchema = z.object({
  version: z.coerce.number().int().min(1).optional(),
  draft: z.enum(['true', 'false']).default('true'),
});

/** Secured preview of an Experience (draft or any version) — requires vibe.view_drafts. */
export const GET = RouteGuard.protectApi('vibe.view_drafts', async (req: NextRequest, user, ctx: { params: { id: string } }) => {
  const q = parseQuery(req, previewQuerySchema);
  if (q.error) return q.error;

  const exp = await prisma.experience.findUnique({ where: { id: ctx.params.id } });
  if (!exp) return handle(Object.assign(new Error('Experience not found'), { code: 'NOT_FOUND', status: 404 }));

  const effective = AuthorizationEngine.getEffectivePermissions(user);
  const viewer: ViewerContext = {
    permissions: effective.permissions,
    role: user.roles?.[0],
    workspaceId: user.workspaceId ?? null,
    userId: user.id,
    device: 'desktop',
  };

  try {
    const dataContext = exp.entityType && exp.entityId
      ? await buildEntityContext({ entityType: exp.entityType, entityId: exp.entityId }, { permissions: viewer.permissions, role: viewer.role })
      : {};

    const resolved = await VibeRuntime.resolveBySlug(exp.slug, dataContext, viewer, {
      allowDraftPreview: true,
      version: q.data!.version,
    });
    if (!resolved) return handle(Object.assign(new Error('Nothing published to preview'), { code: 'NOT_RENDERABLE', status: 404 }));

    return ok({
      experienceId: resolved.experienceId,
      version: resolved.version,
      usedDraft: resolved.usedDraft,
      diagnostics: resolved.diagnostics,
      seo: resolved.seo,
      nodes: resolved.nodes,
    });
  } catch (e) { return handle(e); }
});
