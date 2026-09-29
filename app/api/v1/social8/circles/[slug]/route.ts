import { NextRequest, NextResponse } from 'next/server';
import { CircleService } from '@/lib/social8/circle-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const circle = await CircleService.getCircleBySlug(params.slug);
    if (!circle) {
      return NextResponse.json({ success: false, error: 'Circle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: circle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
