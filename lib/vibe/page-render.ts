/**
 * VIBE Public Page Resolver (§16, §41)
 * URL -> Slug Registry -> Entity -> Type -> Template -> Overrides -> Bindings -> Render
 * Server Components only. The editor is NEVER loaded on public routes (§38).
 */

import { prisma } from '@/lib/prisma';
import { SlugEngine, ENTITY_ROUTE_PREFIX, type SlugEntityTypeValue } from './slug-engine';
import { buildEntityContext } from './data-context';
import { VibeRuntime, type ResolvedExperience, type ViewerContext } from './runtime';

const ENTITY_BY_PREFIX: Record<string, SlugEntityTypeValue> = Object.fromEntries(
  Object.entries(ENTITY_ROUTE_PREFIX).map(([type, prefix]) => [prefix, type as SlugEntityTypeValue])
);

/** Default template per entity type when no bound/published Experience exists */
const ENTITY_DEFAULT_TEMPLATE: Partial<Record<SlugEntityTypeValue, string>> = {
  DESTINATION: 'tpl.destination',
  PLACE: 'tpl.place',
  JOURNEY: 'tpl.journey',
  DIARY: 'tpl.diary',
  LANDING_PAGE: 'tpl.landing',
  PACKAGE: 'tpl.place',
  HOTEL: 'tpl.place',
  EXPERIENCE: 'tpl.place',
};

export interface PublicRender {
  kind: 'render' | 'redirect' | 'not_found' | 'forbidden';
  resolved?: ResolvedExperience;
  redirectPath?: string;
  seo?: { title: string; description: string; canonical: string };
  breadcrumbs?: Array<{ label: string; href: string }>;
}

function viewerForRequest(user?: PublicViewer | null): ViewerContext {
  return {
    permissions: user?.permissions ?? [],
    role: user?.role,
    workspaceId: user?.workspaceId ?? null,
    userId: user?.userId ?? null,
    device: 'desktop',
  };
}

export interface PublicViewer {
  permissions: string[];
  role?: string;
  workspaceId?: string | null;
  userId?: string | null;
}

/**
 * Resolve a canonical public path to a renderable experience.
 * `viewer` is supplied only for authenticated/preview rendering; public callers
 * pass nothing (anonymous -> empty permissions, PUBLIC experiences only).
 */
export async function renderPublicPath(path: string, opts: { allowDraftPreview?: boolean; viewer?: PublicViewer | null } = {}): Promise<PublicRender> {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const resolved = await SlugEngine.resolvePath(clean);
  if (!resolved) return { kind: 'not_found' };

  if (!resolved.isCanonical && resolved.redirectPath) {
    return { kind: 'redirect', redirectPath: resolved.redirectPath };
  }

  const viewer = viewerForRequest(opts.viewer ?? null);
  const context = await buildEntityContext(
    { entityType: resolved.entityType, entityId: resolved.entityId },
    { permissions: viewer.permissions, role: viewer.role }
  );

  // 1) Prefer an explicit bound + published Experience for this entity
  const bound = await prisma.experience.findFirst({
    where: { entityType: resolved.entityType as never, entityId: resolved.entityId, status: 'PUBLISHED' },
    orderBy: { publishedVersion: 'desc' },
  });

  let rendered: ResolvedExperience | null = null;

  if (bound) {
    rendered = await VibeRuntime.resolveBySlug(bound.slug, context, viewer, { allowDraftPreview: opts.allowDraftPreview });
  }

  // 2) Otherwise materialize the type's default template against entity data
  if (!rendered || rendered.nodes.length === 0) {
    const templateKey = ENTITY_DEFAULT_TEMPLATE[resolved.entityType];
    if (!templateKey) return { kind: 'not_found' };
    const nodes = await VibeRuntime.materializeTemplate(templateKey);
    const { rendered: tree, diagnostics } = VibeRuntime.renderTree(nodes, context, viewer);
    rendered = {
      experienceId: templateKey,
      name: String((context.entity as { name?: string; title?: string })?.name ?? (context.entity as { title?: string })?.title ?? resolved.entityType),
      type: resolved.entityType,
      slug: clean.replace(/^\//, ''),
      canonicalPath: resolved.canonicalPath,
      seo: { title: resolved.metaTitle ?? null, description: resolved.metaDescription ?? null },
      version: 1,
      nodes: tree,
      diagnostics,
      usedDraft: Boolean(opts.allowDraftPreview),
    };
  }

  const breadcrumbs = await SlugEngine.breadcrumbs(resolved.canonicalPath);
  return {
    kind: 'render',
    resolved: rendered,
    seo: {
      title: rendered.seo.title ?? rendered.name,
      description: rendered.seo.description ?? '',
      canonical: resolved.canonicalPath,
    },
    breadcrumbs,
  };
}

export { ENTITY_BY_PREFIX };
