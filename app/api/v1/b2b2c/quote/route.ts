/**
 * API Route: /api/v1/b2b2c/quote
 * Calculates wholesale net fares vs retail marked-up traveler quotations
 */

import { NextResponse } from 'next/server';
import { PartnerService } from '@/lib/b2b2c/partner-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerCode, supplierNetFare, customMarkupPercentage } = body;

    if (!partnerCode || !supplierNetFare) {
      return NextResponse.json(
        { success: false, error: 'Missing partnerCode or supplierNetFare parameter.' },
        { status: 400 }
      );
    }

    const partnerService = PartnerService.getInstance();
    const quote = partnerService.calculateQuote(
      partnerCode,
      Number(supplierNetFare),
      customMarkupPercentage !== undefined ? Number(customMarkupPercentage) : undefined
    );

    return NextResponse.json({
      success: true,
      data: quote,
      meta: {
        partnerCode,
        evaluatedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Quote calculation error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
