/**
 * API Route: /api/v1/sync-jobs
 * Trigger and query background inventory / pricing sync jobs
 */

import { NextResponse } from 'next/server';
import { SyncEngine, SyncJobType } from '@/lib/connectors/sync-engine';

export async function GET() {
  const engine = SyncEngine.getInstance();
  const jobs = engine.getRecentJobs();
  const freshnessStats = engine.refreshOfferFreshnessStatus();

  return NextResponse.json({
    success: true,
    data: {
      recentJobs: jobs,
      freshnessOverview: freshnessStats,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { connectorCode, jobType, triggeredBy } = body;

    if (!connectorCode) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory connectorCode parameter.' },
        { status: 400 }
      );
    }

    const validJobTypes: SyncJobType[] = ['FULL_INVENTORY', 'DELTA_PRICING', 'AVAILABILITY'];
    const selectedJobType: SyncJobType = validJobTypes.includes(jobType) ? jobType : 'DELTA_PRICING';

    const engine = SyncEngine.getInstance();
    const jobRecord = await engine.runSyncJob(
      connectorCode,
      selectedJobType,
      triggeredBy || 'MANUAL_ADMIN'
    );

    return NextResponse.json({
      success: true,
      message: `Sync job initiated and processed for connector ${connectorCode}.`,
      data: jobRecord,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error executing sync job';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
