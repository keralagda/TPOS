/**
 * Travel Planet (Voyage8) — VIBE Isolated Demo Seed (§51)
 *
 * Creates a small, self-contained, PUBLIC travel demo so the VIBE runtime,
 * public routes and builder have realistic content WITHOUT touching live data.
 *
 * Design constraints honored:
 *  - Production guard: never seeds in production (same rule as master seed).
 *  - Idempotent: safe to re-run (upserts on stable slugs / keys).
 *  - Isolated: uses clearly demo entities and does not modify bookings/ledger.
 *  - Slugs are registered centrally (Slug table) so /destinations, /places,
 *    /journeys, /diaries resolve through the §16 pipeline.
 *
 * Run AFTER the master seed (expects Country + base Destinations to exist):
 *   npm run db:seed          # master foundation
 *   npm run db:seed:vibe     # this demo layer
 */

import {
  PrismaClient, ExperienceType, ExperienceStatus, ExperienceVisibility,
  SlugEntityType, JourneyDayItemType,
} from '@prisma/client';

const prisma = new PrismaClient();

function assertNonProduction() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY VIOLATION: VIBE demo seeding is strictly forbidden in production!');
  }
}

async function getOrCreateDestination(name: string, slug: string, countryCode: string, countryName: string, currency: string, isDomestic: boolean) {
  const existing = await prisma.destination.findUnique({ where: { slug } });
  if (existing) return existing;
  const country = await prisma.country.upsert({
    where: { code: countryCode }, update: {}, create: { code: countryCode, name: countryName, currency },
  });
  return prisma.destination.create({
    data: { slug, name, headline: `Discover ${name}`, description: `VIBE demo destination: ${name}.`, countryId: country.id, isFeatured: true, isDomestic },
  });
}

/** Register a flat canonical public path for an entity (idempotent). */
async function registerPath(entityType: SlugEntityType, entityId: string, slug: string, canonicalPath: string, metaTitle: string, metaDescription: string) {
  const existing = await prisma.slug.findUnique({ where: { slug_locale_entityType: { slug, locale: 'en', entityType } } });
  if (existing) {
    return prisma.slug.update({ where: { id: existing.id }, data: { canonicalPath, entityId, metaTitle, metaDescription, status: 'ACTIVE', isCanonical: true } });
  }
  return prisma.slug.create({ data: { slug, canonicalPath, entityType, entityId, metaTitle, metaDescription, status: 'ACTIVE', isCanonical: true } });
}

async function main() {
  assertNonProduction();
  console.log('🌱 Seeding VIBE isolated demo content (Kerala · Wayanad)...\n');

  // ---- anchor entities ----
  const kerala = await getOrCreateDestination('Kerala', 'kerala', 'IN', 'India', 'INR', true);
  const wayanadUser = await prisma.user.findFirst({ where: { email: 'content@test.travelplanet.local' } });
  const authorId = wayanadUser?.id ?? null;

  // ---- Place: Wayanad Hills ----
  const placeSlug = 'wayanad-monsoon-hills';
  const place = await prisma.place.upsert({
    where: { slug: placeSlug },
    update: {},
    create: {
      slug: placeSlug,
      name: 'Wayanad Monsoon Hills',
      destinationId: kerala.id,
      country: 'India', state: 'Kerala', city: 'Wayanad',
      description: 'Mist-laced tea and spice hills famous for monsoon treks, caves and wildlife sanctuaries.',
      coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
      category: 'NATURE',
      tags: ['monsoon', 'trek', 'wildlife', 'tea'],
      highlights: ['Chembra Peak sunrise trek', 'Edakkal Caves', 'Banasura Sagar dam'],
      bestTime: 'June to September for monsoon; December to February for trekking',
      howToReach: 'Nearest airport Calicut (CCJ), ~100 km by road.',
      travelTips: 'Carry rain gear; roads are slippery during peak monsoon.',
      status: 'PUBLISHED',
    },
  });
  await registerPath(SlugEntityType.PLACE, place.id, placeSlug, `/places/${placeSlug}`, 'Wayanad Monsoon Hills — Kerala', 'A first-class VIBE Place page rendered from bound data.');

  // ---- TravelJourney (planning entity, separate from transport Journey) ----
  const journeySlug = 'kerala-5-day-monsoon-retreat';
  let journey = await prisma.travelJourney.findUnique({ where: { slug: journeySlug } });
  if (!journey) {
    journey = await prisma.travelJourney.create({
      data: {
        slug: journeySlug, title: 'Kerala 5-Day Monsoon Retreat',
        subtitle: 'Backwaters, hills and spice gardens at the greenest hour',
        description: 'A curated, quotable monsoon journey across Kerala authored for the VIBE demo.',
        journeyType: 'CURATED', capability: 'PLANNABLE', status: 'PUBLISHED', visibility: 'PUBLIC',
        authorId, destinationId: kerala.id, origin: 'Kochi', durationDays: 5,
        travelStyle: 'Leisure', season: 'Monsoon', highlights: ['Houseboat night', 'Wayanad trek', 'Spice plantation'],
        tags: ['kerala', 'monsoon', 'family'],
        days: {
          create: [
            { dayNumber: 1, title: 'Arrive Kochi & Fort Kochi wander', startLocation: 'Kochi', endLocation: 'Kochi', travelTime: '2 hrs', items: { create: [
              { type: JourneyDayItemType.ACCOMMODATION, title: 'Check in — Fort Kochi boutique stay', orderIndex: 0 },
              { type: JourneyDayItemType.ATTRACTION, title: 'Chinese Fishing Nets sunset', startTime: '17:30', orderIndex: 1 },
            ] } },
            { dayNumber: 2, title: 'Wayanad hills & Chembra trek', startLocation: 'Kochi', endLocation: 'Wayanad', travelTime: '4 hrs', items: { create: [
              { type: JourneyDayItemType.TRANSPORT, title: 'Scenic drive to Wayanad', orderIndex: 0 },
              { type: JourneyDayItemType.ACTIVITY, refEntityId: place.id, title: 'Chembra Peak sunrise trek', startTime: '06:00', cost: 1200, orderIndex: 1 },
              { type: JourneyDayItemType.MEAL, title: 'Kerala sadya lunch', orderIndex: 2 },
            ] } },
          ],
        },
        places: { create: [{ placeId: place.id }] },
      },
      include: { days: { include: { items: true } } },
    });
  }
  await registerPath(SlugEntityType.JOURNEY, journey.id, journeySlug, `/journeys/${journeySlug}`, 'Kerala 5-Day Monsoon Retreat', 'A plannable VIBE TravelJourney with day-by-day itinerary.');

  // ---- PlaceDiary (traveler voice) ----
  const diarySlug = 'a-monsoon-weekend-in-wayanad';
  let diary = await prisma.placeDiary.findUnique({ where: { slug: diarySlug } });
  if (!diary) {
    diary = await prisma.placeDiary.create({
      data: {
        slug: diarySlug, title: 'A Monsoon Weekend in Wayanad', authorId, placeId: place.id, journeyId: journey.id,
        visitDate: new Date('2026-07-18'), duration: '2 nights', season: 'Monsoon', travelStyle: 'Solo',
        story: 'The hills dissolved into cloud by mid-afternoon. Trails were slick, waterfalls were roaring, and the tea estates smelled electric.',
        whatISaw: 'Zero-visibility mist on Chembra, three waterfalls in one drive.',
        whatIDid: 'Sunrise trek, Banasura Sagar viewpoint, spice plantation walk.',
        whatIAte: 'Hot kozhakkattam and karimeen fry at a roadside shack.',
        whatSurprisedMe: 'How fast the weather turns — clear at dawn, blank by 11am.',
        practicalNotes: 'Book homestays with attached bathrooms; leeches on trails after heavy rain.',
        crowdLevel: 'Moderate', status: 'PUBLISHED',
      },
    });
  }
  await registerPath(SlugEntityType.DIARY, diary.id, diarySlug, `/diaries/${diarySlug}`, 'A Monsoon Weekend in Wayanad', 'A published traveler diary rendered as a VIBE Place page.');

  // ---- Observation -> Insight (provenance; never a universal fact) ----
  const existingObs = await prisma.placeObservation.findFirst({ where: { sourceId: diary.id, attribute: 'weatherCondition' } });
  if (!existingObs) {
    const obs = await prisma.placeObservation.create({
      data: { placeId: place.id, destinationId: kerala.id, attribute: 'weatherCondition', value: 'Heavy afternoon rain', season: 'Monsoon', timeOfDay: 'afternoon', sourceType: 'DIARY', sourceId: diary.id, sourceDiaryId: diary.id, author: 'traveler', visitDate: new Date('2026-07-18'), extractionMethod: 'MANUAL', confidence: 0.6, verified: false },
    });
    const insight = await prisma.destinationInsight.upsert({
      where: { destinationId_attribute: { destinationId: kerala.id, attribute: 'weatherCondition' } },
      update: { value: 'Heavy afternoon rain', evidenceCount: { increment: 1 }, label: 'Traveler diary reports: heavy afternoon rain in monsoon' },
      create: { destinationId: kerala.id, attribute: 'weatherCondition', value: 'Heavy afternoon rain', label: 'Traveler diary reports: heavy afternoon rain in monsoon', evidenceCount: 1, confidence: 0.6, isUniversal: false, verified: false, provenance: { method: 'AGGREGATED_FROM_DIARIES', sample: 1 } },
    });
    await prisma.placeObservation.update({ where: { id: obs.id }, data: { insightId: insight.id } });
  }

  // ---- Destination Experience (PUBLIC, published, bound to Kerala) with immutable v1 ----
  const expSlug = 'kerala-destination-home';
  const composition = {
    schemaVersion: 1,
    nodes: [
      { id: 'hero1', componentKey: 'hero', locked: false, hidden: false,
        props: { variant: 'FULLSCREEN', eyebrow: 'God\u2019s Own Country' },
        bindings: [
          { id: 'hb1', kind: 'FIELD', path: 'entity.name', targetProp: 'title', fallback: 'Kerala' },
          { id: 'hb2', kind: 'FIELD', path: 'entity.headline', targetProp: 'subtitle', fallback: '' },
          { id: 'hb3', kind: 'FIELD', path: 'entity.heroImageUrl', targetProp: 'mediaUrl', fallback: '' },
        ],
        actions: [], responsive: [], style: { variants: [] }, children: [] },
      { id: 'overview1', componentKey: 'richText', locked: false, hidden: false, props: {},
        bindings: [{ id: 'ob1', kind: 'FIELD', path: 'entity.description', targetProp: 'html', fallback: '' }],
        actions: [], responsive: [], style: { variants: [] }, children: [] },
      { id: 'places1', componentKey: 'heading', locked: false, hidden: false, props: { text: 'Featured Places', level: 'h2' }, bindings: [], actions: [], responsive: [], style: { variants: [] }, children: [] },
      { id: 'grid1', componentKey: 'grid', locked: false, hidden: false, props: { columns: 3, gap: 'md' },
        bindings: [], actions: [], responsive: [], style: { variants: [] }, children: [
          { id: 'pc1', componentKey: 'placeCard', locked: false, hidden: false, props: {}, bindings: [{ id: 'pcb1', kind: 'FIELD', path: 'entity.places.0', targetProp: 'place', fallback: null }], actions: [], responsive: [], style: { variants: [] }, children: [] },
          { id: 'pc2', componentKey: 'placeCard', locked: false, hidden: false, props: {}, bindings: [{ id: 'pcb2', kind: 'FIELD', path: 'entity.places.1', targetProp: 'place', fallback: null }], actions: [], responsive: [], style: { variants: [] }, children: [],
            visibility: { all: [{ field: 'entity.places.1', operator: 'EXISTS' }], any: [] } },
          { id: 'pc3', componentKey: 'placeCard', locked: false, hidden: false, props: {}, bindings: [{ id: 'pcb3', kind: 'FIELD', path: 'entity.places.2', targetProp: 'place', fallback: null }], actions: [], responsive: [], style: { variants: [] }, children: [],
            visibility: { all: [{ field: 'entity.places.2', operator: 'EXISTS' }], any: [] } },
        ] },
      { id: 'diaries1', componentKey: 'heading', locked: false, hidden: false, props: { text: 'Traveler Diaries', level: 'h2' }, bindings: [], actions: [], responsive: [], style: { variants: [] }, children: [] },
    ],
  };

  let experience = await prisma.experience.findUnique({ where: { slug: expSlug } });
  if (!experience) {
    experience = await prisma.experience.create({
      data: {
        name: 'Kerala — Destination Home', slug: expSlug, type: ExperienceType.DESTINATION,
        status: ExperienceStatus.PUBLISHED, visibility: ExperienceVisibility.PUBLIC,
        entityType: SlugEntityType.DESTINATION, entityId: kerala.id,
        draftComposition: composition as object, publishedVersion: 1, version: 1,
        createdBy: authorId, updatedBy: authorId,
        versions: { create: [{ version: 1, status: ExperienceStatus.PUBLISHED, composition: composition as object, changeNote: 'Initial VIBE demo publish', publishedBy: authorId, publishedAt: new Date(), createdBy: authorId }] },
      },
    });
  } else {
    // keep the demo deterministic on re-runs (v1 snapshot refreshed in place)
    await prisma.experience.update({ where: { id: experience.id }, data: { draftComposition: composition as object, status: ExperienceStatus.PUBLISHED, visibility: ExperienceVisibility.PUBLIC, entityType: SlugEntityType.DESTINATION, entityId: kerala.id, publishedVersion: 1 } });
    await prisma.experienceVersion.upsert({
      where: { experienceId_version: { experienceId: experience.id, version: 1 } },
      update: { composition: composition as object },
      create: { experienceId: experience.id, version: 1, status: ExperienceStatus.PUBLISHED, composition: composition as object, changeNote: 'Initial VIBE demo publish', publishedBy: authorId, publishedAt: new Date(), createdBy: authorId },
    });
  }
  await registerPath(SlugEntityType.DESTINATION, kerala.id, kerala.slug, `/destinations/${kerala.slug}`, 'Kerala | Travel Planet Voyage8', 'God\u2019s Own Country — rendered by the VIBE Experience runtime.');

  console.log('✅ VIBE demo content seeded: 1 place, 1 journey (2 days), 1 diary, 1 insight, 1 published Experience.');
  console.log('   Try: /destinations/kerala  /places/' + placeSlug + '  /journeys/' + journeySlug + '  /diaries/' + diarySlug + '\n');
}

main()
  .catch(e => { console.error('VIBE seed execution error:', e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
