import { NextRequest, NextResponse } from 'next/server';
import { ControlPlaneService } from '@/lib/governance/control-plane-service';
import { z } from 'zod';

const updateFlagSchema = z.object({
  key: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  isEnabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  allowedTenants: z.array(z.string()).optional(),
  allowedRoles: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const flags = await ControlPlaneService.listFeatureFlags();
    return NextResponse.json({ success: true, data: flags });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = updateFlagSchema.parse(body);
    const updated = await ControlPlaneService.updateFeatureFlag(validated.key, validated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
