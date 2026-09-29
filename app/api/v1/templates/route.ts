import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { SECTION_REGISTRY, TEMPLATE_REGISTRY, resolveTemplateSections } from '@/lib/vibe/registry';
import { ok } from '@/lib/vibe/api-helpers';

export const dynamic = 'force-dynamic';

/** Template + section catalog with resolved inheritance. */
export const GET = RouteGuard.protectApi('vibe.view', async (_req: NextRequest) => {
  const templates = Object.values(TEMPLATE_REGISTRY).map(t => ({
    key: t.key, name: t.name, type: t.type, parentKey: t.parentKey ?? null,
    category: t.category, dataSources: t.dataSources,
    sections: resolveTemplateSections(t.key).map(key => {
      const s = SECTION_REGISTRY[key];
      return { key, name: s?.name ?? key, family: s?.family ?? 'unknown' };
    }),
  }));
  const sections = Object.values(SECTION_REGISTRY).map(s => ({
    key: s.key, name: s.name, family: s.family, version: s.version,
    description: s.description, dataNeeds: s.dataNeeds, nodeCount: s.nodes.length,
  }));
  return ok({ templates, sections });
});
