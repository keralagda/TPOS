import { PrismaClient, CircleType, CirclePrivacy, GemClassification, GemVerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Social8 Circles and GEM8 Discoveries into Neon PostgreSQL...\n');

  // 1. Social8 Circles
  const circles = [
    {
      name: 'Dubai Luxury & Yachting Circle',
      slug: 'dubai-luxury-yachting',
      description: 'Curated experiences for luxury travelers, private desert safaris, and weekend marina charters in the UAE.',
      type: CircleType.DESTINATION,
      privacy: CirclePrivacy.PUBLIC,
      coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      creatorId: 'usr_super_admin',
      memberCount: 142,
      postCount: 1,
    },
    {
      name: 'Bali Solo Explorers & Digital Nomads',
      slug: 'bali-solo-explorers',
      description: 'Connecting remote workers, villa sharers, and scooter road-trippers across Canggu, Ubud, and Uluwatu.',
      type: CircleType.TRAVELER_STYLE,
      privacy: CirclePrivacy.PUBLIC,
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      creatorId: 'usr_super_admin',
      memberCount: 310,
      postCount: 1,
    },
    {
      name: 'Kerala Backwaters & Ayurveda Retreats',
      slug: 'kerala-backwaters-ayurveda',
      description: 'Slow travel, authentic houseboat journeys, organic farm stays, and classical wellness practitioners in God’s Own Country.',
      type: CircleType.INTEREST,
      privacy: CirclePrivacy.PUBLIC,
      coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      creatorId: 'usr_super_admin',
      memberCount: 88,
      postCount: 1,
    },
  ];

  for (const c of circles) {
    const circle = await prisma.circle.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });

    await prisma.circleDiscussion.create({
      data: {
        circleId: circle.id,
        authorId: 'usr_super_admin',
        title: `Welcome to the ${c.name}!`,
        content: `Connect with fellow travelers and plan group journeys. Who wants to join for our upcoming voyage?`,
        category: 'DISCUSSION',
        intentDetected: true,
      },
    });
  }

  console.log(`✅ ${circles.length} Social8 Circles with welcome discussions seeded.`);

  // 2. GEM8 Beyond-The-Icon Discoveries
  const destination = await prisma.destination.findFirst();
  const destinationId = destination?.id || 'dest_default';

  const gems = [
    {
      name: 'Al Fahidi Traditional Windtower Quarter & Coffee Museum',
      slug: 'al-fahidi-windtower-quarter',
      description: 'Step behind Dubai’s ultra-modern skyline into quiet sand-colored alleyways, artisan perfumeries, and historic coffee roasting courtyards.',
      destinationId,
      classification: GemClassification.LOCAL_FAVOURITE,
      confidenceScore: 0.94,
      bestTimeToVisit: 'November to March, early morning',
      tags: ['Heritage', 'Artisan Coffee', 'Architecture'],
      images: ['https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Sidemen Secret Rice Terraces & River Caves',
      slug: 'sidemen-secret-terraces',
      description: 'An untouched alternative to crowded Ubud. Walk through misty bamboo bridges and organic clove plantations along Mount Agung’s slopes.',
      destinationId,
      classification: GemClassification.OFFBEAT,
      confidenceScore: 0.91,
      bestTimeToVisit: 'April to October',
      tags: ['Trekking', 'Eco-Retreat', 'Scenic'],
      images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Pulau Ubin Chek Jawa Coastal Wetlands',
      slug: 'pulau-ubin-chek-jawa',
      description: 'Travel back to 1960s Singapore. Hop on a wooden bumboat to cycle through granite quarries and explore rich intertidal mangroves.',
      destinationId,
      classification: GemClassification.EMERGING,
      confidenceScore: 0.89,
      bestTimeToVisit: 'Year-round, low tide',
      tags: ['Nature', 'Cycling', 'Biodiversity'],
      images: ['https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80'],
    },
  ];

  for (const g of gems) {
    await prisma.gemDiscovery.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        ...g,
        verificationStatus: GemVerificationStatus.PUBLISHED,
        provenanceEntries: {
          create: {
            sourceType: 'OFFICIAL_TOURISM',
            evidenceNote: 'Verified through regional eco-tourism and cultural authority archives',
            confidence: 0.95,
          },
        },
      },
    });
  }

  console.log(`✅ ${gems.length} GEM8 Beyond-The-Icon Discoveries seeded.`);

  // 3. Feature Flags
  const flags = [
    {
      key: 'enable_social8_circles',
      name: 'Social8 Travel Circles & Discussions',
      description: 'Enables community group formation and journey proposals (§16)',
      isEnabled: true,
      rolloutPercentage: 100,
    },
    {
      key: 'enable_gem8_discovery',
      name: 'GEM8 Beyond-The-Icon Discovery',
      description: 'Enables verified offbeat places paired with iconic destinations (§17)',
      isEnabled: true,
      rolloutPercentage: 100,
    },
    {
      key: 'enable_voice_navigation',
      name: 'VN8/VO8 Voice Command Bar',
      description: 'Enables microphone voice-to-intent navigation and operations (§19)',
      isEnabled: true,
      rolloutPercentage: 100,
    },
    {
      key: 'enable_dms_documents',
      name: 'DMS Tokenized Document Engine',
      description: 'Enables automated PDF/HTML vouchers and tax invoices (§15)',
      isEnabled: true,
      rolloutPercentage: 100,
    },
  ];

  for (const f of flags) {
    await prisma.featureFlagRecord.upsert({
      where: { key: f.key },
      update: {},
      create: f,
    });
  }

  console.log(`✅ ${flags.length} Feature Flags seeded in Control Plane.\n`);
}

main()
  .catch((e) => {
    console.error('Exclusive bundle seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
