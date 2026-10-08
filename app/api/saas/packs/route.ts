import { NextResponse } from 'next/server';
import { SaaSControlPlane } from '@/lib/saas/saas-control-plane';

export async function GET() {
  try {
    const packs = SaaSControlPlane.getAllPacks();
    return NextResponse.json({ success: true, count: packs.length, packs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { packCodes } = await req.json();
    const validation = SaaSControlPlane.validatePacks(packCodes || []);
    return NextResponse.json({ success: true, validation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
