import { NextResponse } from 'next/server';
import { SaaSControlPlane } from '@/lib/saas/saas-control-plane';

export async function POST(req: Request) {
  try {
    const { tenantContext, resource, capability } = await req.json();
    const evaluation = SaaSControlPlane.evaluateEntitlement(tenantContext, resource, capability);
    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
