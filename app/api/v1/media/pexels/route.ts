import { NextRequest, NextResponse } from 'next/server';
import { PexelsService } from '@/lib/media/pexels';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || 'travel destination';
    const perPage = searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!, 10) : 8;

    const photos = await PexelsService.searchPhotos(query, { perPage });
    return NextResponse.json({ success: true, data: photos });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
