import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { SECTION_REGISTRY } from '@/lib/vibe/registry';
import { ok } from '@/lib/vibe/api-helpers';

export const dynamic = 'force-dynamic';

export const GET = RouteGuard.protectApi('vibe.view', async (_req: NextRequest) => {
  const sections = Object.values(SECTION_REGISTRY).map(s => ({
    key: s.key, name: s.name, family: s.family, version: s.version,
    description: s.description, dataNeeds: s.dataNeeds, nodeCount: s.nodes.length, status: s.status,
  }));
  return ok({ total: sections.length, sections });
});
