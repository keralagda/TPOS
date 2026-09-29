/**
 * VIBE — Experience lifecycle service (§05, §43, §44)
 * Draft editing is non-destructive; publishing creates immutable versions;
 * rollback re-points publishedVersion without deleting history.
 */

import { prisma } from '@/lib/prisma';
import { Prisma, SlugEntityType } from '@prisma/client';
import { auditLogger } from '@/lib/audit/audit-logger';
import { normalizeSlug, SlugEngine } from './slug-engine';
import { compositionSchema, CreateExperienceInput, EXPERIENCE_TYPES } from './types';
import { VibeRuntime } from './runtime';
import { TEMPLATE_REGISTRY } from './registry';
import { nextPublishedVersion, versionConflict } from './pure';
import { z } from 'zod';

export class ExperienceError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
    this.name = 'ExperienceError';
  }
}

export interface Actor {
  id: string;
  email: string;
  role?: string;
  organizationId?: string | null;
  workspaceId?: string | null;
}

export class ExperienceService {
  static async create(input: CreateExperienceInput, actor: Actor) {
    const name = input.name.trim();
    const baseSlug = normalizeSlug(input.slug ?? name);
    // ensure global uniqueness across both Experience.slug and Slug registry
    const slug = await ExperienceService.freeExperienceSlug(baseSlug);

    let composition = input.composition ?? { schemaVersion: 1 as const, nodes: [] };
    if (composition.nodes.length === 0 && input.templateId) {
      const tpl = TEMPLATE_REGISTRY[input.templateId] ?? (await prisma.experienceTemplate.findUnique({ where: { key: input.templateId } }));
      if (tpl) {
        const nodes = await VibeRuntime.materializeTemplate(input.templateId);
        composition = { schemaVersion: 1, nodes };
      }
    }

    const parsed = compositionSchema.parse(composition);

    const exp = await prisma.experience.create({
      data: {
        name,
        slug,
        type: input.type as Prisma.ExperienceCreateInput['type'],
        status: 'DRAFT',
        visibility: input.visibility as Prisma.ExperienceCreateInput['visibility'],
        templateId: input.templateId && TEMPLATE_REGISTRY[input.templateId] ? undefined : input.templateId,
        draftComposition: parsed as unknown as Prisma.InputJsonValue,
        entityType: input.entityType as SlugEntityType | undefined,
        entityId: input.entityId,
        organizationId: actor.organizationId ?? null,
        workspaceId: actor.workspaceId ?? null,
        createdBy: actor.id,
        updatedBy: actor.id,
      },
    });

    await auditLogger.log({ userId: actor.id, userEmail: actor.email, role: actor.role, action: 'CREATE', entityType: 'experience', entityId: exp.id, changes: { status: { before: null, after: 'DRAFT' } }, metadata: { slug: exp.slug, type: exp.type } });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'CREATE', resourceType: 'experience', resourceId: exp.id, result: 'SUCCESS', metadata: { slug: exp.slug, type: exp.type } } });
    return exp;
  }

  private static async freeExperienceSlug(base: string): Promise<string> {
    let candidate = base;
    for (let i = 2; i <= 50; i++) {
      const clash = await prisma.experience.findUnique({ where: { slug: candidate } });
      if (!clash) return candidate;
      candidate = `${base}-${i}`;
    }
    throw new ExperienceError('SLUG_EXHAUSTED', 'Could not allocate a unique slug');
  }

  /** Save draft composition with optimistic concurrency */
  static async updateComposition(id: string, expectedVersion: number, composition: z.infer<typeof compositionSchema>, actor: Actor, changeNote?: string) {
    const exp = await prisma.experience.findUnique({ where: { id } });
    if (!exp) throw new ExperienceError('NOT_FOUND', 'Experience not found', 404);
    if (versionConflict(expectedVersion, exp.version)) {
      throw new ExperienceError('VERSION_CONFLICT', `Stale edit: server version ${exp.version}, client ${expectedVersion}`, 409);
    }
    const parsed = compositionSchema.parse(composition);
    const updated = await prisma.experience.update({
      where: { id },
      data: {
        draftComposition: parsed as unknown as Prisma.InputJsonValue,
        version: { increment: 1 },
        updatedBy: actor.id,
      },
    });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'UPDATE', resourceType: 'experience', resourceId: id, result: 'SUCCESS', metadata: { changeNote: changeNote ?? '', version: updated.version } } });
    return updated;
  }

  /**
   * Publish = freeze current draft into an immutable ExperienceVersion and
   * point publishedVersion at it. Never overwrites prior published snapshots.
   */
  static async publish(id: string, actor: Actor, changeNote = '') {
    const exp = await prisma.experience.findUnique({ where: { id } });
    if (!exp) throw new ExperienceError('NOT_FOUND', 'Experience not found', 404);
    const nodes = exp.draftComposition as { nodes?: unknown[] } | null;
    if (!nodes?.nodes?.length) throw new ExperienceError('EMPTY_COMPOSITION', 'Cannot publish an empty composition');

    const nextVersion = nextPublishedVersion(exp.publishedVersion);
    const version = await prisma.experienceVersion.create({
      data: {
        experienceId: id,
        version: nextVersion,
        status: 'PUBLISHED',
        composition: exp.draftComposition as Prisma.InputJsonValue,
        changeNote,
        publishedBy: actor.id,
        publishedAt: new Date(),
        createdBy: actor.id,
      },
    });

    const updated = await prisma.experience.update({
      where: { id },
      data: { publishedVersion: nextVersion, status: 'PUBLISHED', updatedBy: actor.id },
    });

    // keep the public slug registry in sync for resolvable experiences
    if (updated.entityType && updated.entityId) {
      await SlugEngine.register({
        entityType: updated.entityType, entityId: updated.entityId, name: updated.name,
        organizationId: updated.organizationId ?? undefined,
      }).catch(() => undefined);
    }

    await prisma.auditLog.create({ data: { userId: actor.id, action: 'PUBLISH', resourceType: 'experience', resourceId: id, result: 'SUCCESS', metadata: { version: nextVersion, changeNote } } });
    return { experience: updated, version };
  }

  static async unpublish(id: string, actor: Actor) {
    const updated = await prisma.experience.update({
      where: { id },
      data: { status: 'ARCHIVED', publishedVersion: null, updatedBy: actor.id },
    });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'UNPUBLISH', resourceType: 'experience', resourceId: id, result: 'SUCCESS' } });
    return updated;
  }

  /**
   * Rollback restores a previous published version as the current published
   * pointer AND as the editable draft — history is never deleted (§43).
   */
  static async rollback(id: string, targetVersion: number, actor: Actor, reason: string) {
    const v = await prisma.experienceVersion.findUnique({
      where: { experienceId_version: { experienceId: id, version: targetVersion } },
    });
    if (!v) throw new ExperienceError('VERSION_NOT_FOUND', `Version ${targetVersion} does not exist`, 404);

    // re-publish the old snapshot as a NEW immutable version (audit honest)
    const exp = await prisma.experience.findUniqueOrThrow({ where: { id } });
    const nextVersion = nextPublishedVersion(exp.publishedVersion);
    const rolled = await prisma.experienceVersion.create({
      data: {
        experienceId: id,
        version: nextVersion,
        status: 'PUBLISHED',
        composition: v.composition as Prisma.InputJsonValue,
        changeNote: `Rollback to v${targetVersion}: ${reason}`,
        publishedBy: actor.id,
        publishedAt: new Date(),
        createdBy: actor.id,
      },
    });
    const updated = await prisma.experience.update({
      where: { id },
      data: {
        publishedVersion: nextVersion,
        draftComposition: v.composition as Prisma.InputJsonValue,
        version: { increment: 1 },
        updatedBy: actor.id,
      },
    });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'ROLLBACK', resourceType: 'experience', resourceId: id, result: 'SUCCESS', metadata: { from: exp.publishedVersion, to: targetVersion, asVersion: nextVersion, reason } } });
    return { experience: updated, version: rolled };
  }

  static async duplicate(id: string, actor: Actor) {
    const exp = await prisma.experience.findUnique({ where: { id } });
    if (!exp) throw new ExperienceError('NOT_FOUND', 'Experience not found', 404);
    const slug = await ExperienceService.freeExperienceSlug(`${exp.slug}-copy`);
    return prisma.experience.create({
      data: {
        name: `${exp.name} (Copy)`, slug, type: exp.type, status: 'DRAFT', visibility: 'PRIVATE',
        draftComposition: (exp.draftComposition ?? undefined) as Prisma.InputJsonValue | undefined,
        templateId: exp.templateId, entityType: exp.entityType, entityId: null,
        organizationId: exp.organizationId, workspaceId: exp.workspaceId,
        createdBy: actor.id, updatedBy: actor.id,
      },
    });
  }

  static async archive(id: string, actor: Actor) {
    const updated = await prisma.experience.update({
      where: { id },
      data: { status: 'ARCHIVED', publishedVersion: null, updatedBy: actor.id },
    });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'DELETE', resourceType: 'experience', resourceId: id, result: 'SUCCESS', metadata: { mode: 'archive' } } });
    return updated;
  }

  static list(opts: { page: number; pageSize: number; type?: string; status?: string; search?: string }) {
    const where: Prisma.ExperienceWhereInput = {
      ...(opts.type ? { type: opts.type as Prisma.ExperienceWhereInput['type'] } : {}),
      ...(opts.status ? { status: opts.status as Prisma.ExperienceWhereInput['status'] } : {}),
      ...(opts.search ? { name: { contains: opts.search, mode: 'insensitive' } } : {}),
    };
    return prisma.experience.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
      include: { _count: { select: { versions: true } } },
    });
  }

  static versions(id: string) {
    return prisma.experienceVersion.findMany({
      where: { experienceId: id },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, status: true, changeNote: true, publishedAt: true, publishedBy: true, createdBy: true, createdAt: true },
    });
  }
}

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(EXPERIENCE_TYPES).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().max(140).optional(),
});
