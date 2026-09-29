import { NextRequest, NextResponse } from 'next/server';
import { GemService } from '@/lib/gem8/gem-service';
import { z } from 'zod';

const createGemSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  destinationId: z.string(),
  iconicPairingPlaceId: z.string().optional(),
  classification: z.enum([
    'EMERGING', 'LESSER_KNOWN', 'LOCAL_FAVOURITE', 'ALTERNATIVE', 
    'OFFBEAT', 'SEASONAL', 'NICHE', 'UNDERRATED'
  ]).optional(),
  bestTimeToVisit: z.string().optional(),
  accessibilityNotes: z.string().optional(),
  safetyNotes: z.string().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  initialProvenance: z.object({
    sourceType: z.string(),
    sourceRef: z.string().optional(),
    authorName: z.string().optional(),
    evidenceNote: z.string(),
    confidence: z.number().optional(),
  }).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get('destinationId') || undefined;
    const classification = (searchParams.get('classification') as any) || undefined;
    const iconicPairingPlaceId = searchParams.get('iconicPairingPlaceId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    if (iconicPairingPlaceId) {
      const gems = await GemService.getGemsForIconicPairing(iconicPairingPlaceId);
      return NextResponse.json({ success: true, data: gems });
    }

    const gems = await GemService.listGems({ destinationId, classification, limit });
    return NextResponse.json({ success: true, data: gems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createGemSchema.parse(body);
    const gem = await GemService.createGem(validated);
    return NextResponse.json({ success: true, data: gem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
