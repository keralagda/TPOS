import { NextResponse } from 'next/server';
import { SaaSControlPlane } from '@/lib/saas/saas-control-plane';

export async function GET() {
  try {
    const plans = SaaSControlPlane.getAllPlans();
    return NextResponse.json({ success: true, count: plans.length, plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
