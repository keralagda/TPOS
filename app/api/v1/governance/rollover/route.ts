import { NextRequest, NextResponse } from 'next/server';
import { TimedRolloverService } from '@/lib/governance/timed-rollover-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const schedules = await TimedRolloverService.listSchedules(status);
    return NextResponse.json({ success: true, data: schedules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Action trigger: Execute due schedules
    if (body.action === 'EXECUTE_PENDING') {
      const results = await TimedRolloverService.executePendingSchedules();
      return NextResponse.json({ success: true, message: `Processed ${results.length} schedules`, data: results });
    }

    // Action trigger: Rollback
    if (body.action === 'ROLLBACK' && body.scheduleId) {
      const rolledBack = await TimedRolloverService.rollbackSchedule(body.scheduleId);
      return NextResponse.json({ success: true, message: 'Snapshot rollback complete', data: rolledBack });
    }

    // Otherwise, create new schedule
    const created = await TimedRolloverService.scheduleRollover(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
