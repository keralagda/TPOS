import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { DomainService, diaryStatusSchema } from '@/lib/vibe/domain-service';
import { ok, parseBody, handle, toActor } from '@/lib/vibe/api-helpers';
import { AuthorizationEngine } from '@/lib/auth/rbac-engine';

export const PATCH = RouteGuard.protectApi('diaries.manage', async (req: NextRequest, user, ctx: { params: { id: string } }) => {
  const body = await parseBody(req, diaryStatusSchema);
  if (body.error) return body.error;

  // Approval/publication are consequential: separate permission required
  const consequential = ['APPROVED', 'PUBLISHED'].includes(body.data!.status);
  if (consequential && !AuthorizationEngine.hasPermission(user, 'diaries.publish')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'diaries.publish required to approve or publish diaries' } },
      { status: 403 }
    );
  }
  try {
    const diary = await DomainService.transitionDiary(ctx.params.id, body.data!, toActor(user));
    return ok(diary);
  } catch (e) { return handle(e); }
});
