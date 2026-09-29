/**
 * VIBE — Central Slug Engine (§15)
 * The ONLY place slug logic lives. Modules never invent their own slug rules.
 *
 * Guarantees:
 * - unique slug per (locale, entityType)
 * - collision detection with suffixing
 * - rename = slug history + 301 Redirect record (never lose inbound links)
 * - parent-child canonical paths (/destinations/india/kerala/wayanad)
 * - breadcrumb generation and sitemap enumeration
 */

import { prisma } from '@/lib/prisma';
import { Prisma, SlugEntityType } from '@prisma/client';
import { normalizeSlug as _normalizeSlug } from './pure';

export type SlugEntityTypeValue =
  | 'DESTINATION' | 'COUNTRY' | 'STATE' | 'CITY' | 'PLACE' | 'ATTRACTION'
  | 'HOTEL' | 'EXPERIENCE' | 'PACKAGE' | 'JOURNEY' | 'DIARY' | 'TRAVEL_GUIDE'
  | 'TRAVEL_STORY' | 'LANDING_PAGE' | 'BLOG' | 'PAGE';

/** Canonical URL prefix per entity type (§16) */
export const ENTITY_ROUTE_PREFIX: Record<SlugEntityTypeValue, string> = {
  DESTINATION: '/destinations',
  COUNTRY: '/countries',
  STATE: '/states',
  CITY: '/cities',
  PLACE: '/places',
  ATTRACTION: '/attractions',
  HOTEL: '/hotels',
  EXPERIENCE: '/experiences',
  PACKAGE: '/packages',
  JOURNEY: '/journeys',
  DIARY: '/diaries',
  TRAVEL_GUIDE: '/travel-guides',
  TRAVEL_STORY: '/travel-stories',
  LANDING_PAGE: '/campaigns',
  BLOG: '/blog',
  PAGE: '/pages',
};

export interface SlugErrorCode { code: string }
export class SlugError extends Error {
  constructor(public code: 'COLLISION_UNRESOLVED' | 'INVALID_SLUG' | 'NOT_FOUND' | 'PATH_MISMATCH', message: string) {
    super(message);
    this.name = 'SlugError';
  }
}

export function normalizeSlug(input: string): string {
  const s = _normalizeSlug(input);
  if (!s) throw new SlugError('INVALID_SLUG', 'Slug is empty after normalization');
  return s;
}

export interface RegisterSlugInput {
  entityType: SlugEntityTypeValue;
  entityId: string;
  name: string;
  slug?: string;
  parentSlug?: string;
  locale?: string;
  organizationId?: string | null;
  workspaceId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ResolvedSlug {
  entityType: SlugEntityTypeValue;
  entityId: string;
  canonicalPath: string;
  isCanonical: boolean;
  redirectPath?: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export class SlugEngine {
  /**
   * Register (or idempotently refresh) the canonical slug for an entity.
   * On rename, the previous path is captured as a 301 Redirect record.
   */
  static async register(input: RegisterSlugInput): Promise<{ slug: string; canonicalPath: string; created: boolean }> {
    const locale = input.locale ?? 'en';
    const base = normalizeSlug(input.slug ?? input.name);

    // Does this entity already have a slug row?
    const existing = await prisma.slug.findFirst({
      where: { entityType: input.entityType as SlugEntityType, entityId: input.entityId, locale },
    });

    let candidate = base;
    // Collision detection against OTHER entities
    if (!existing || existing.slug !== candidate) {
      candidate = await this.resolveCollision(base, locale, input.entityType, existing?.id);
    }

    const prefix = ENTITY_ROUTE_PREFIX[input.entityType];
    const parentPath = input.parentSlug
      ? (prefix === '/pages' || prefix === '/campaigns' ? `${prefix}/${input.parentSlug}` : `${prefix}/${input.parentSlug}`)
      : prefix;
    const canonicalPath = `${parentPath}/${candidate}`;

    if (existing) {
      if (existing.canonicalPath !== canonicalPath) {
        // rename: old path must 301 to new canonical
        await prisma.redirect.upsert({
          where: { fromPath: existing.canonicalPath },
          create: { fromPath: existing.canonicalPath, toPath: canonicalPath, statusCode: 301, reason: 'slug-rename' },
          update: { toPath: canonicalPath, isActive: true },
        });
      }
      const updated = await prisma.slug.update({
        where: { id: existing.id },
        data: { slug: candidate, canonicalPath, parentSlug: input.parentSlug ?? null, metaTitle: input.metaTitle ?? existing.metaTitle, metaDescription: input.metaDescription ?? existing.metaDescription },
      });
      return { slug: updated.slug, canonicalPath: updated.canonicalPath, created: false };
    }

    const created = await prisma.slug.create({
      data: {
        slug: candidate,
        canonicalPath,
        entityType: input.entityType as Prisma.SlugCreateInput['entityType'],
        entityId: input.entityId,
        parentSlug: input.parentSlug ?? null,
        locale,
        organizationId: input.organizationId ?? null,
        workspaceId: input.workspaceId ?? null,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
      },
    });
    return { slug: created.slug, canonicalPath: created.canonicalPath, created: true };
  }

  /** Append -2, -3... until free (excluding own row id on rename) */
  private static async resolveCollision(base: string, locale: string, entityType: SlugEntityTypeValue, excludeId?: string): Promise<string> {
    for (let i = 0; i < 50; i++) {
      const candidate = i === 0 ? base : `${base}-${i + 1}`;
      const clash = await prisma.slug.findUnique({
        where: { slug_locale_entityType: { slug: candidate, locale, entityType: entityType as SlugEntityType } },
      });
      if (!clash || clash.id === excludeId) return candidate;
    }
    throw new SlugError('COLLISION_UNRESOLVED', `Could not resolve slug collision for "${base}"`);
  }

  /**
   * Resolve a request path -> entity pointer, following internal redirects once.
   * This is the first stage of the §16 resolver pipeline.
   */
  static async resolvePath(path: string, locale = 'en'): Promise<ResolvedSlug | null> {
    const clean = path.replace(/\/+$/, '') || '/';

    const row = await prisma.slug.findFirst({ where: { canonicalPath: clean, locale } });
    if (row) {
      return {
        entityType: row.entityType, entityId: row.entityId, canonicalPath: row.canonicalPath,
        isCanonical: row.isCanonical, metaTitle: row.metaTitle, metaDescription: row.metaDescription,
      };
    }

    // historical path -> 301 target
    const redirect = await prisma.redirect.findUnique({ where: { fromPath: clean } });
    if (redirect?.isActive) {
      const moved = await this.resolvePath(redirect.toPath, locale);
      if (moved) return { ...moved, isCanonical: false, redirectPath: redirect.toPath };
    }
    return null;
  }

  /** Mark entity slug inactive and free its uniqueness namespace */
  static async retire(entityType: SlugEntityTypeValue, entityId: string, redirectTo?: string): Promise<void> {
    const rows = await prisma.slug.findMany({ where: { entityType: entityType as SlugEntityType, entityId } });
    for (const row of rows) {
      await prisma.slug.update({
        where: { id: row.id },
        data: { status: 'ARCHIVED', slug: `${row.slug}--archived-${row.id.slice(-6)}`, isCanonical: false, redirectTo: redirectTo ?? null },
      });
      if (redirectTo) {
        await prisma.redirect.upsert({
          where: { fromPath: row.canonicalPath },
          create: { fromPath: row.canonicalPath, toPath: redirectTo, statusCode: 301, reason: 'entity-retired' },
          update: { toPath: redirectTo, isActive: true },
        });
      }
    }
  }

  /** Breadcrumb trail from parent chain (§15, §37) */
  static async breadcrumbs(path: string): Promise<Array<{ label: string; href: string }>> {
    const parts = path.split('/').filter(Boolean);
    const crumbs: Array<{ label: string; href: string }> = [];
    let acc = '';
    for (const part of parts) {
      acc += `/${part}`;
      crumbs.push({ label: part.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), href: acc });
    }
    return crumbs;
  }

  /** All indexable canonical paths for sitemap generation */
  static async sitemapEntries(): Promise<Array<{ loc: string; updatedAt: Date }>> {
    const rows = await prisma.slug.findMany({
      where: { status: 'ACTIVE', isCanonical: true },
      select: { canonicalPath: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(r => ({ loc: r.canonicalPath, updatedAt: r.updatedAt }));
  }
}
