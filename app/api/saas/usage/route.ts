import { NextResponse } from 'next/server';
import { SaaSControlPlane } from '@/lib/saas/saas-control-plane';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId is required' }, { status: 400 });
    }
    const meters = SaaSControlPlane.getTenantMeters(tenantId);
    return NextResponse.json({ success: true, count: meters.length, meters });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { tenantId, meterKey, units, planId, packIds } = await req.json();
    const result = SaaSControlPlane.recordUsage(
      tenantId,
      meterKey,
      units || 1,
      planId,
      packIds || []
    );
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
