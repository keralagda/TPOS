import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { prisma } from '@/lib/prisma';
import { ok, parseQuery } from '@/lib/vibe/api-helpers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  entityType: z.string().optional(),
  status: z.string().optional(),
  search: z.string().max(120).optional(),
});

/** Central SLUG_REGISTRY inspection (§15) — collision & canonical path auditing. */
export const GET = RouteGuard.protectApi('vibe.view', async (req: NextRequest) => {
  const q = parseQuery(req, listSchema);
  if (q.error) return q.error;
  const { page, pageSize, entityType, status, search } = q.data!;

  const where = {
    ...(entityType ? { entityType: entityType as never } : {}),
    ...(status ? { status } : {}),
    ...(search ? { OR: [{ slug: { contains: search, mode: 'insensitive' as const } }, { canonicalPath: { contains: search, mode: 'insensitive' as const } }] } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.slug.count({ where }),
    prisma.slug.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: 'desc' } }),
  ]);

  return ok({
    total, page, pageSize,
    slugs: rows.map(r => ({
      id: r.id, slug: r.slug, canonicalPath: r.canonicalPath, entityType: r.entityType,
      entityId: r.entityId, parentSlug: r.parentSlug, locale: r.locale, status: r.status,
      isCanonical: r.isCanonical, redirectTo: r.redirectTo, updatedAt: r.updatedAt,
    })),
  });
});
