/**
 * VIBE — Travel domain services (§17-§22)
 * Entities stay relational; slugs are ALWAYS registered centrally via SlugEngine;
 * publication flows through the review workflow with audit trail.
 */

import { prisma } from '@/lib/prisma';
import { Prisma, DiaryStatus } from '@prisma/client';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { SlugEngine } from './slug-engine';
import { canTransitionDiary, type DiaryState } from './pure';
import type { Actor } from './experience-service';

export class DomainError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); this.name = 'DomainError'; }
}

const slugField = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(160).optional();

export const placeCreateSchema = z.object({
  name: z.string().min(2).max(140),
  slug: slugField,
  destinationId: z.string().min(1),
  country: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  description: z.string().max(5000).optional(),
  coverImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(30).default([]),
  category: z.string().min(2).max(60),
  tags: z.array(z.string().max(40)).max(20).default([]),
  highlights: z.array(z.string().max(200)).max(20).default([]),
  bestTime: z.string().max(200).optional(),
  howToReach: z.string().max(2000).optional(),
  travelTips: z.string().max(2000).optional(),
  accessibility: z.string().max(500).optional(),
  familySuitability: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  seo: z.record(z.string()).optional(),
});

export const journeyCreateSchema = z.object({
  title: z.string().min(3).max(160),
  slug: slugField,
  subtitle: z.string().max(240).optional(),
  description: z.string().max(8000).optional(),
  journeyType: z.enum(['SELF_PLANNED', 'CURATED', 'AI_GENERATED', 'EXPERT_CURATED', 'COMMUNITY', 'CORPORATE', 'FAMILY', 'COUPLE', 'SOLO', 'BACKPACKING', 'LUXURY', 'ROAD_TRIP', 'SPIRITUAL', 'ADVENTURE', 'CULTURAL', 'FOOD', 'WELLNESS']).default('CURATED'),
  capability: z.enum(['INSPIRATIONAL', 'PLANNABLE', 'QUOTABLE', 'BOOKABLE']).default('INSPIRATIONAL'),
  destinationId: z.string().optional(),
  origin: z.string().max(120).optional(),
  durationDays: z.number().int().min(1).max(120).optional(),
  travelStyle: z.string().max(80).optional(),
  season: z.string().max(80).optional(),
  budgetRange: z.record(z.unknown()).optional(),
  coverImage: z.string().url().optional(),
  highlights: z.array(z.string().max(200)).max(20).default([]),
  tags: z.array(z.string().max(40)).max(20).default([]),
});

export const journeyDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(120),
  title: z.string().min(2).max(160),
  description: z.string().max(5000).optional(),
  startLocation: z.string().max(160).optional(),
  endLocation: z.string().max(160).optional(),
  estimatedCost: z.number().min(0).optional(),
  travelTime: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(z.object({
    type: z.enum(['PLACE', 'ATTRACTION', 'ACTIVITY', 'MEAL', 'ACCOMMODATION', 'TRANSPORT', 'EXPERIENCE']),
    refEntityId: z.string().optional(),
    title: z.string().min(1).max(160),
    description: z.string().max(2000).optional(),
    startTime: z.string().max(10).optional(),
    cost: z.number().min(0).optional(),
    orderIndex: z.number().int().min(0).default(0),
  })).max(40).default([]),
});

export const diaryCreateSchema = z.object({
  title: z.string().min(3).max(160),
  slug: slugField,
  placeId: z.string().optional(),
  journeyId: z.string().optional(),
  visitDate: z.coerce.date().optional(),
  duration: z.string().max(80).optional(),
  travelCompanions: z.string().max(80).optional(),
  travelStyle: z.string().max(80).optional(),
  season: z.string().max(80).optional(),
  coverImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(40).default([]),
  story: z.string().max(20000).optional(),
  whatISaw: z.string().max(5000).optional(),
  whatIDid: z.string().max(5000).optional(),
  whatIAte: z.string().max(5000).optional(),
  whereIStayed: z.string().max(5000).optional(),
  whatSurprisedMe: z.string().max(5000).optional(),
  whatIDoDifferently: z.string().max(5000).optional(),
  practicalNotes: z.string().max(5000).optional(),
  bestTime: z.string().max(200).optional(),
  gettingThere: z.string().max(2000).optional(),
  crowdLevel: z.string().max(40).optional(),
  difficulty: z.string().max(40).optional(),
  accessibility: z.string().max(500).optional(),
});

export const diaryStatusSchema = z.object({
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'FLAGGED']),
  reason: z.string().max(500).optional(),
});

export const observationCreateSchema = z.object({
  placeId: z.string().optional(),
  destinationId: z.string().optional(),
  diaryId: z.string().optional(),
  attribute: z.string().min(2).max(60),
  value: z.string().min(1).max(200),
  timeOfDay: z.string().max(40).optional(),
  season: z.string().max(40).optional(),
  extractionMethod: z.enum(['MANUAL', 'AI']).default('MANUAL'),
  confidence: z.number().min(0).max(1).default(0.5),
});

export class DomainService {
  static async createPlace(input: z.infer<typeof placeCreateSchema>, actor: Actor) {
    const destination = await prisma.destination.findUnique({ where: { id: input.destinationId } });
    if (!destination) throw new DomainError('DESTINATION_NOT_FOUND', 'Destination does not exist', 404);

    const id = randomUUID();
    const { slug } = await SlugEngine.register({ entityType: 'PLACE', entityId: id, name: input.name, slug: input.slug, parentSlug: destination.slug, organizationId: actor.organizationId });
    const place = await prisma.place.create({
      data: { id, ...input, slug, status: 'DRAFT' },
    });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'CREATE', resourceType: 'place', resourceId: place.id, result: 'SUCCESS' } });
    return place;
  }

  static async createJourney(input: z.infer<typeof journeyCreateSchema>, actor: Actor) {
    const id = randomUUID();
    const { slug } = await SlugEngine.register({ entityType: 'JOURNEY', entityId: id, name: input.title, slug: input.slug, organizationId: actor.organizationId });
    const journey = await prisma.travelJourney.create({
      data: {
        id,
        ...input,
        budgetRange: input.budgetRange as Prisma.InputJsonValue | undefined,
        slug,
        status: 'DRAFT',
        visibility: 'PRIVATE',
        authorId: actor.id,
        organizationId: actor.organizationId ?? null,
      },
    });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'CREATE', resourceType: 'journey', resourceId: journey.id, result: 'SUCCESS' } });
    return journey;
  }

  static async setJourneyStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED', visibility: 'PUBLIC' | 'PRIVATE', actor: Actor) {
    const journey = await prisma.travelJourney.findUnique({ where: { id }, include: { destination: true } });
    if (!journey) throw new DomainError('NOT_FOUND', 'Journey not found', 404);
    if (status === 'PUBLISHED' && journey.capability !== 'INSPIRATIONAL') {
      // bookable journeys must have at least one day before publishing
      const days = await prisma.journeyDay.count({ where: { journeyId: id } });
      if (days === 0) throw new DomainError('NO_DAYS', 'Journey must have at least one day before publishing');
    }
    if (status === 'PUBLISHED' && visibility === 'PUBLIC') {
      await SlugEngine.register({ entityType: 'JOURNEY', entityId: id, name: journey.title, slug: journey.slug, parentSlug: journey.destination?.slug, organizationId: journey.organizationId });
    }
    const updated = await prisma.travelJourney.update({ where: { id }, data: { status, visibility } });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'PUBLISH', resourceType: 'journey', resourceId: id, result: 'SUCCESS', metadata: { status, visibility } } });
    return updated;
  }

  static async upsertJourneyDay(journeyId: string, input: z.infer<typeof journeyDaySchema>, actor: Actor) {
    const journey = await prisma.travelJourney.findUnique({ where: { id: journeyId } });
    if (!journey) throw new DomainError('NOT_FOUND', 'Journey not found', 404);
    const { items, ...dayData } = input;
    const day = await prisma.journeyDay.upsert({
      where: { journeyId_dayNumber: { journeyId, dayNumber: input.dayNumber } },
      create: { journeyId, ...dayData },
      update: { ...dayData },
    });
    await prisma.journeyDayItem.deleteMany({ where: { dayId: day.id } });
    if (items.length > 0) {
      await prisma.journeyDayItem.createMany({ data: items.map(it => ({ dayId: day.id, ...it })) });
    }
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'UPDATE', resourceType: 'journey_day', resourceId: day.id, result: 'SUCCESS', metadata: { dayNumber: input.dayNumber, itemCount: items.length } } });
    return prisma.journeyDay.findUniqueOrThrow({ where: { id: day.id }, include: { items: { orderBy: { orderIndex: 'asc' } } } });
  }

  static async createDiary(input: z.infer<typeof diaryCreateSchema>, actor: Actor) {
    if (input.placeId) {
      const place = await prisma.place.findUnique({ where: { id: input.placeId } });
      if (!place) throw new DomainError('PLACE_NOT_FOUND', 'Place does not exist', 404);
    }
    const id = randomUUID();
    const place = input.placeId ? await prisma.place.findUnique({ where: { id: input.placeId } }) : null;
    const { slug } = await SlugEngine.register({ entityType: 'DIARY', entityId: id, name: input.title, slug: input.slug, parentSlug: place?.slug, organizationId: actor.organizationId });
    const diary = await prisma.placeDiary.create({
      data: { id, ...input, slug, authorId: actor.id, status: 'DRAFT', organizationId: actor.organizationId ?? null },
    });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'CREATE', resourceType: 'diary', resourceId: diary.id, result: 'SUCCESS' } });
    return diary;
  }

  /** Diary publishing is a workflow: DRAFT -> REVIEW -> APPROVED -> PUBLISHED (§20) */
  static async transitionDiary(id: string, input: z.infer<typeof diaryStatusSchema>, actor: Actor) {
    const diary = await prisma.placeDiary.findUnique({ where: { id }, include: { place: { include: { destination: true } } } });
    if (!diary) throw new DomainError('NOT_FOUND', 'Diary not found', 404);
    if (!canTransitionDiary(diary.status as DiaryState, input.status as DiaryState)) {
      throw new DomainError('INVALID_TRANSITION', `Cannot move diary from ${diary.status} to ${input.status}`);
    }
    if (input.status === 'PUBLISHED') {
      await SlugEngine.register({ entityType: 'DIARY', entityId: id, name: diary.title, slug: diary.slug, parentSlug: diary.place?.slug, organizationId: diary.organizationId });
    }
    const updated = await prisma.placeDiary.update({ where: { id }, data: { status: input.status } });
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'UPDATE', resourceType: 'diary', resourceId: id, result: 'SUCCESS', metadata: { from: diary.status, to: input.status, reason: input.reason } } });
    return updated;
  }

  /**
   * Structured observation with provenance (§22). Individual diary statements
   * are NEVER promoted to universal facts — insights aggregate evidence only.
   */
  static async recordObservation(input: z.infer<typeof observationCreateSchema>, actor: Actor) {
    if (!input.placeId && !input.destinationId) throw new DomainError('NO_SUBJECT', 'Observation needs placeId or destinationId');
    let author = 'unknown';
    let visitDate: Date | null = null;
    if (input.diaryId) {
      const diary = await prisma.placeDiary.findUnique({ where: { id: input.diaryId }, include: { author: { select: { fullName: true } } } });
      author = diary?.author?.fullName ?? 'unknown';
      visitDate = diary?.visitDate ?? null;
    }
    const observation = await prisma.placeObservation.create({
      data: {
        placeId: input.placeId ?? null,
        destinationId: input.destinationId ?? null,
        sourceDiaryId: input.diaryId ?? null,
        sourceType: input.diaryId ? 'DIARY' : 'MANUAL',
        sourceId: input.diaryId ?? null,
        attribute: input.attribute,
        value: input.value,
        timeOfDay: input.timeOfDay,
        season: input.season,
        extractionMethod: input.extractionMethod,
        confidence: input.confidence,
        author,
        visitDate,
      },
    });

    // refresh aggregate insight (attributed, non-universal)
    const destinationId = input.destinationId ?? (input.placeId ? (await prisma.place.findUnique({ where: { id: input.placeId } }))?.destinationId : null);
    if (destinationId) {
      const group = await prisma.placeObservation.groupBy({
        by: ['value'],
        where: { destinationId, attribute: input.attribute },
        _count: { value: true },
      });
      const top = group.sort((a, b) => b._count.value - a._count.value)[0];
      const total = group.reduce((acc, g) => acc + g._count.value, 0);
      await prisma.destinationInsight.upsert({
        where: { destinationId_attribute: { destinationId, attribute: input.attribute } },
        create: {
          destinationId, attribute: input.attribute, value: top.value,
          label: `Traveler diary reports: ${input.attribute.replace(/([A-Z])/g, ' $1').toLowerCase()} often ${top.value.toLowerCase()}`,
          evidenceCount: total, confidence: total > 0 ? (top._count.value / total) : 0.5,
          isUniversal: false, provenance: { sources: group.map(g => ({ value: g.value, count: g._count.value })) },
        },
        update: {
          value: top.value, evidenceCount: total, confidence: top._count.value / total,
          label: `Traveler diary reports: ${input.attribute.replace(/([A-Z])/g, ' $1').toLowerCase()} often ${top.value.toLowerCase()}`,
          provenance: { sources: group.map(g => ({ value: g.value, count: g._count.value })) },
        },
      });
    }
    await prisma.auditLog.create({ data: { userId: actor.id, action: 'CREATE', resourceType: 'place_observation', resourceId: observation.id, result: 'SUCCESS', metadata: { attribute: input.attribute } } });
    return observation;
  }

  static list(model: 'place' | 'journey' | 'diary', opts: { page: number; pageSize: number; status?: string; destinationId?: string; placeId?: string }) {
    const where = {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.destinationId && model === 'place' ? { destinationId: opts.destinationId } : {}),
      ...(opts.destinationId && model === 'journey' ? { destinationId: opts.destinationId } : {}),
      ...(opts.placeId ? { placeId: opts.placeId } : {}),
    };
    const skip = (opts.page - 1) * opts.pageSize;
    switch (model) {
      case 'place': return prisma.place.findMany({ where, skip, take: opts.pageSize, orderBy: { updatedAt: 'desc' } });
      case 'journey': return prisma.travelJourney.findMany({ where, skip, take: opts.pageSize, orderBy: { updatedAt: 'desc' } });
      case 'diary': return prisma.placeDiary.findMany({ where: { ...where, status: opts.status as DiaryStatus | undefined }, skip, take: opts.pageSize, orderBy: { updatedAt: 'desc' }, include: { place: { select: { name: true, slug: true } } } });
    }
  }
}
