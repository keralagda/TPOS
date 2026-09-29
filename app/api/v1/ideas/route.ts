import { NextRequest, NextResponse } from 'next/server';
import { IdeaDiscoveryService } from '@/lib/innovation/idea-service';
import { IdeaStage } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = (searchParams.get('stage') as IdeaStage) || undefined;
    const ideas = await IdeaDiscoveryService.listCandidates(stage);
    return NextResponse.json({ success: true, data: ideas });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'CREATE_EXPERIMENT' && body.ideaId) {
      const exp = await IdeaDiscoveryService.createExperiment(body.ideaId, body.experiment);
      return NextResponse.json({ success: true, data: exp }, { status: 201 });
    }

    if (body.action === 'EVALUATE' && body.id) {
      const evaluated = await IdeaDiscoveryService.evaluateCandidate(body.id, body.updates);
      return NextResponse.json({ success: true, data: evaluated });
    }

    const created = await IdeaDiscoveryService.createCandidate(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
