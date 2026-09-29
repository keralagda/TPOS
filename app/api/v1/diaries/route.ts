import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { z } from 'zod';
import { DomainService, diaryCreateSchema } from '@/lib/vibe/domain-service';
import { ok, parseBody, parseQuery, handle, toActor } from '@/lib/vibe/api-helpers';

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'FLAGGED']).optional(),
  placeId: z.string().optional(),
});

export const GET = RouteGuard.protectApi('vibe.view', async (req: NextRequest) => {
  const q = parseQuery(req, listSchema);
  if (q.error) return q.error;
  try {
    const items = await DomainService.list('diary', q.data!);
    return ok({ items, page: q.data!.page, pageSize: q.data!.pageSize });
  } catch (e) { return handle(e); }
});

export const POST = RouteGuard.protectApi('diaries.manage', async (req: NextRequest, user) => {
  const body = await parseBody(req, diaryCreateSchema);
  if (body.error) return body.error;
  try {
    const diary = await DomainService.createDiary(body.data!, toActor(user));
    return ok(diary, 201);
  } catch (e) { return handle(e); }
});
