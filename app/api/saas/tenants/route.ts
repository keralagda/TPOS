import { NextResponse } from 'next/server';
import { SaaSControlPlane } from '@/lib/saas/saas-control-plane';

export async function GET() {
  try {
    const tenants = SaaSControlPlane.getAllTenants();
    return NextResponse.json({ success: true, count: tenants.length, tenants });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await SaaSControlPlane.provisionTenant(body);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
