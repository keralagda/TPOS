import { NextRequest, NextResponse } from 'next/server';
import { DocumentEngine } from '@/lib/dms/document-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const doc = await DocumentEngine.getDocumentByNumber(params.number);
    if (!doc) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Return pure HTML response for browser viewing/printing
    return new NextResponse(doc.renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Document-Hash': doc.hash,
        'X-Document-Number': doc.documentNumber,
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
