import { NextRequest, NextResponse } from 'next/server';
import { CircleService } from '@/lib/social8/circle-service';
import { PexelsService } from '@/lib/media/pexels';
import { z } from 'zod';

const createCircleSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(['DESTINATION', 'INTEREST', 'ACTIVITY', 'TRAVELER_STYLE', 'TIME_BASED', 'JOURNEY_SPECIFIC']).optional(),
  privacy: z.enum(['PUBLIC', 'DISCOVERABLE', 'PRIVATE', 'HIDDEN']).optional(),
  coverImage: z.string().url().optional(),
  destinationId: z.string().optional(),
  creatorId: z.string(),
  rules: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get('destinationId') || undefined;
    const type = (searchParams.get('type') as any) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const circles = await CircleService.listCircles({ destinationId, type, limit });
    return NextResponse.json({ success: true, data: circles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createCircleSchema.parse(body);

    // Auto-enrich cover image via Pexels if not explicitly specified
    if (!validated.coverImage) {
      try {
        const photos = await PexelsService.getDestinationPhotos(validated.name, 1);
        if (photos && photos.length > 0) {
          validated.coverImage = photos[0];
        }
      } catch (err) {
        console.warn('Pexels cover auto-enrich fallback:', err);
      }
    }

    const circle = await CircleService.createCircle(validated);
    return NextResponse.json({ success: true, data: circle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
