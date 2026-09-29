import { NextRequest } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { COMPONENT_REGISTRY } from '@/lib/vibe/registry';
import { ok } from '@/lib/vibe/api-helpers';

export const dynamic = 'force-dynamic';

/** Builder component library — metadata only; no executable code crosses the API. */
export const GET = RouteGuard.protectApi('vibe.view', async (req: NextRequest) => {
  const category = new URL(req.url).searchParams.get('category');
  const components = Object.values(COMPONENT_REGISTRY)
    .filter(c => !category || c.category === category)
    .map(c => ({
      key: c.key, name: c.name, category: c.category, version: c.version, description: c.description,
      container: c.container, gridOnly: c.gridOnly, bindingRoots: c.bindingRoots,
      supportedActions: c.supportedActions, a11y: c.a11y,
      propsSchema: Object.fromEntries(Object.entries(c.propsSchema).map(([prop, def]) => [prop, {
        type: def.type, label: def.label, required: def.required ?? false,
        bindable: def.bindable ?? false, options: def.options, default: def.default, description: def.description,
      }])),
    }));
  return ok({ total: components.length, components });
});
