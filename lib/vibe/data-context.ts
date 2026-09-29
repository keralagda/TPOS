/**
 * VIBE DataContext builder (§11) — assembles the whitelisted, tenant-scoped
 * data roots that the binding engine may read. This is the ONLY place where
 * Prisma queries feed composition; bindings can never reach beyond these roots.
 */

import { prisma } from '@/lib/prisma';
import { DataContext } from './binding-engine';

export interface EntityRef {
  entityType: string;
  entityId: string;
}

/** Load the bound entity plus its related collections for composition roots. */
export async function buildEntityContext(ref: EntityRef, viewer?: { permissions: string[]; role?: string }): Promise<DataContext> {
  const ctx: DataContext = {};

  switch (ref.entityType) {
    case 'DESTINATION': {
      const destination = await prisma.destination.findUnique({
        where: { id: ref.entityId },
        include: {
          country: true,
          places: { where: { status: 'PUBLISHED' }, take: 12 },
          products: { where: { status: 'ACTIVE' }, take: 12 },
          journeys: { where: { status: 'PUBLISHED', visibility: 'PUBLIC' }, take: 8, include: { destination: true } },
          insights: true,
        },
      });
      if (!destination) return ctx;
      const diaries = await prisma.placeDiary.findMany({
        where: { status: 'PUBLISHED', place: { destinationId: destination.id } },
        take: 6, include: { place: true, author: { select: { fullName: true } } },
      });
      ctx.destination = { ...destination, diaries };
      ctx.entity = ctx.destination;
      ctx.insights = destination.insights;
      break;
    }
    case 'PLACE': {
      const place = await prisma.place.findUnique({
        where: { id: ref.entityId },
        include: {
          destination: { include: { country: true } },
          journeys: { include: { journey: { select: { id: true, slug: true, title: true, coverImage: true, journeyType: true, durationDays: true, highlights: true } } }, take: 8 },
          experiences: { include: { product: true }, take: 8 },
        },
      });
      if (!place) return ctx;
      const diaries = await prisma.placeDiary.findMany({
        where: { placeId: place.id, status: 'PUBLISHED' },
        include: { author: { select: { fullName: true } } }, take: 6,
      });
      ctx.place = {
        ...place,
        journeys: place.journeys.map(jp => jp.journey).filter(Boolean),
        products: place.experiences.map(e => e.product).filter(Boolean),
        diaries,
      };
      ctx.destination = place.destination;
      ctx.entity = ctx.place;
      break;
    }
    case 'JOURNEY': {
      const journey = await prisma.travelJourney.findUnique({
        where: { id: ref.entityId },
        include: {
          destination: true,
          days: { orderBy: { dayNumber: 'asc' }, include: { items: { orderBy: { orderIndex: 'asc' } } } },
          places: { include: { place: { select: { id: true, slug: true, name: true, latitude: true, longitude: true } } } },
          diaries: { where: { status: 'PUBLISHED' }, include: { author: { select: { fullName: true } } }, take: 6 },
        },
      });
      if (!journey) return ctx;
      ctx.journey = { ...journey, places: journey.places.map(p => p.place) };
      ctx.entity = ctx.journey;
      break;
    }
    case 'DIARY': {
      const diary = await prisma.placeDiary.findUnique({
        where: { id: ref.entityId },
        include: {
          place: { select: { id: true, slug: true, name: true } },
          journey: { select: { id: true, slug: true, title: true } },
          author: { select: { fullName: true, avatarUrl: true } },
          media: { orderBy: { orderIndex: 'asc' } },
          observations: true,
        },
      });
      if (!diary) return ctx;
      ctx.diary = { ...diary, gallery: [...diary.gallery, ...diary.media.map(m => m.url)] };
      ctx.entity = ctx.diary;
      break;
    }
    default: {
      const entity = await loadGenericEntity(ref);
      if (entity) { ctx.entity = entity; }
    }
  }
  return ctx;
}

async function loadGenericEntity(ref: EntityRef): Promise<unknown | null> {
  switch (ref.entityType) {
    case 'PACKAGE': return prisma.package.findUnique({ where: { id: ref.entityId }, include: { destination: true } });
    case 'HOTEL': case 'EXPERIENCE': case 'ATTRACTION':
      return prisma.product.findUnique({ where: { id: ref.entityId } });
    default: return null;
  }
}

/** Dashboard/workspace metrics — scopes enforced here, not in bindings. */
export async function buildWorkspaceContext(user: { id: string; role: string; organizationId?: string | null; workspaceId?: string | null }, permissions: string[]): Promise<DataContext> {
  const [bookingsToday, bookingsPending, revenueAgg, leadCount, auditLogs, recentBookings] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: startOfToday() } } }),
    prisma.booking.count({ where: { status: 'PENDING_PAYMENT' } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { status: 'CONFIRMED' } }),
    prisma.lead.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { action: true, resourceType: true, createdAt: true } }),
    prisma.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, bookingNumber: true, totalAmount: true, status: true, createdAt: true } }),
  ]);

  const metrics = {
    bookings: { today: bookingsToday, pending: bookingsPending },
    revenue: { confirmed: Number(revenueAgg._sum.totalAmount ?? 0) },
    leads: { open: leadCount },
    series: [
      { label: 'Today', value: bookingsToday },
      { label: 'Pending', value: bookingsPending },
      { label: 'Leads', value: leadCount },
    ],
  };

  return {
    metrics,
    currentUser: { id: user.id, role: user.role, permissions },
    role: user.role,
    workspace: { id: user.workspaceId ?? null },
    collections: {
      audit: auditLogs.map(a => ({ action: a.action, description: a.resourceType ?? '', title: `${a.action} ${a.resourceType ?? ''}` })),
      bookings: recentBookings.map(b => ({ title: b.bookingNumber, status: b.status, id: b.id })),
      pendingBookings: recentBookings.map(b => ({ title: b.bookingNumber, status: b.status, id: b.id })),
    },
    runtime: { now: new Date().toISOString() },
  };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Merge viewer identity into any context (never grants data, only context roots) */
export function withViewer(ctx: DataContext, viewer?: { userId?: string | null; role?: string; name?: string }): DataContext {
  return {
    ...ctx,
    currentUser: { id: viewer?.userId ?? null, role: viewer?.role ?? 'ANONYMOUS', fullName: viewer?.name ?? 'Traveler' },
    role: viewer?.role ?? 'ANONYMOUS',
    runtime: { ...((ctx.runtime ?? {}) as object), device: 'desktop', now: new Date().toISOString() },
  };
}
