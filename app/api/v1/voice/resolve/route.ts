import { NextRequest, NextResponse } from 'next/server';
import { VoiceIntentResolver, GOVERNED_VOICE_INTENTS } from '@/lib/voice/intent-resolver';
import { NvidiaNimService } from '@/lib/ai/nvidia-nim';

export async function POST(req: NextRequest) {
  try {
    const { transcript, userRole } = await req.json();
    if (!transcript) {
      return NextResponse.json({ success: false, error: 'Transcript required' }, { status: 400 });
    }

    // 1. Fast deterministic regex / phrase match
    const resolution = VoiceIntentResolver.resolve(transcript, userRole || 'CUSTOMER');
    if (resolution.matched) {
      return NextResponse.json({ success: true, data: resolution, aiEnhanced: false });
    }

    // 2. NVIDIA NIM Cognitive Voice Intent Recognition
    try {
      const nimParsed = await NvidiaNimService.parseVoiceIntent(transcript);
      if (nimParsed && nimParsed.intent) {
        let matchedIntent = GOVERNED_VOICE_INTENTS.find((i) => i.intentKey === 'NAV_PLANNER');
        let targetRoute = '/trip-planner';

        if (nimParsed.intent === 'EXPLORE_CIRCLES') {
          matchedIntent = GOVERNED_VOICE_INTENTS.find((i) => i.intentKey === 'NAV_CIRCLES');
          targetRoute = '/circles';
        } else if (nimParsed.intent === 'VIEW_LEADS') {
          matchedIntent = GOVERNED_VOICE_INTENTS.find((i) => i.intentKey === 'NAV_CRM_LEADS');
          targetRoute = '/crm/leads';
        } else if (nimParsed.destination) {
          targetRoute = `/trip-planner?destination=${encodeURIComponent(nimParsed.destination)}`;
        }

        return NextResponse.json({
          success: true,
          data: {
            matched: true,
            intent: {
              intentKey: matchedIntent?.intentKey || 'AI_VOICE_ASSIST',
              commandType: matchedIntent?.commandType || 'NAVIGATION',
              targetRoute,
              riskLevel: 'LOW',
              requiresConfirmation: false,
              actionTitle: nimParsed.action || `Explore ${nimParsed.destination || 'Travel Destinations'}`,
              actionDescription: `NVIDIA NIM AI recognized intent for ${nimParsed.destination || 'travel'}.`,
            },
            message: `NVIDIA NIM parsed intent: ${nimParsed.action || 'Navigate to destination'}`,
          },
          aiEnhanced: true,
          provider: 'NVIDIA-NIM-Llama-3.2',
        });
      }
    } catch (nimError) {
      console.warn('NVIDIA NIM voice parsing fallback:', nimError);
    }

    return NextResponse.json({ success: true, data: resolution });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
