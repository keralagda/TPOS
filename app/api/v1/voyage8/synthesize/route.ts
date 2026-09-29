/**
 * API Route: /api/v1/voyage8/synthesize
 * Executes the 16-Stage Canonical Journey Runtime to generate a custom itinerary
 */

import { NextResponse } from 'next/server';
import { ItinerarySynthesizer, TravelIntentRequest } from '@/lib/voyage8/itinerary-synthesizer';
import { DestinationIntelligenceService } from '@/lib/voyage8/destination-intelligence';
import { NvidiaNimService } from '@/lib/ai/nvidia-nim';
import { PexelsService } from '@/lib/media/pexels';

export async function POST(request: Request) {
  try {
    const body: TravelIntentRequest = await request.json();

    if (!body.destination) {
      return NextResponse.json(
        { success: false, error: 'Destination is mandatory for itinerary synthesis.' },
        { status: 400 }
      );
    }

    const synthesizer = ItinerarySynthesizer.getInstance();
    const destinationIntel = DestinationIntelligenceService.getInstance();

    // 1. Synthesize multi-day itinerary with conflict-free pacing
    const itinerary = await synthesizer.synthesize(body);

    // 2. Attach destination intelligence & visa rules
    const visa = destinationIntel.getVisaRequirements(body.destination);
    const weather = destinationIntel.getWeatherAdvisory(body.destination);

    // 3. Enrich with NVIDIA NIM AI Narrative & Pexels Live Photography
    const [aiNarrative, pexelsPhotos] = await Promise.all([
      NvidiaNimService.synthesizeItinerary({
        destination: body.destination,
        durationDays: body.durationDays || 5,
        budgetTier: body.budgetTier || 'COMFORT',
        travelerStyle: body.travelerStyle || 'CULTURE',
        travelersCount: body.travelersCount || 2,
      }).catch(() => null),
      PexelsService.getDestinationPhotos(body.destination, 4).catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        itinerary,
        aiNarrative,
        photos: pexelsPhotos,
        destinationIntel: {
          visa,
          weather,
        },
      },
      meta: {
        engine: 'Voyage8-Canonical-Journey-Runtime',
        aiProvider: 'NVIDIA-NIM-Llama-3.2',
        mediaProvider: 'Pexels-High-Res-API',
        stagesExecuted: 16,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Itinerary synthesis error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
