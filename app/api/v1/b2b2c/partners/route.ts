/**
 * API Route: /api/v1/b2b2c/partners
 * Multi-tenant partner directory and configuration
 */

import { NextResponse } from 'next/server';
import { PartnerService } from '@/lib/b2b2c/partner-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const partnerService = PartnerService.getInstance();

  if (code) {
    const partner = partnerService.getPartner(code);
    if (!partner) {
      return NextResponse.json({ success: false, error: `Partner ${code} not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: partner });
  }

  const allPartners = partnerService.getAllPartners();
  return NextResponse.json({
    success: true,
    data: allPartners,
    meta: { count: allPartners.length, timestamp: new Date().toISOString() },
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { code, defaultMarkupPercentage, branding } = body;

    const partnerService = PartnerService.getInstance();
    const partner = partnerService.getPartner(code);

    if (!partner) {
      return NextResponse.json({ success: false, error: `Partner ${code} not found` }, { status: 404 });
    }

    if (defaultMarkupPercentage !== undefined) {
      partner.defaultMarkupPercentage = Number(defaultMarkupPercentage);
    }

    if (branding) {
      partner.branding = { ...partner.branding, ...branding };
    }

    return NextResponse.json({
      success: true,
      message: `Partner ${code} configuration updated successfully.`,
      data: partner,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
