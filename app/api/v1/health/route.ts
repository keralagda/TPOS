import { NextResponse } from 'next/server';
import { SystemHealthAggregator } from '@/lib/observability/system-health';

export async function GET() {
  const report = await SystemHealthAggregator.getHealthReport();
  return NextResponse.json({
    success: true,
    data: report,
  });
}
