/**
 * API Route: /api/v1/operations/runbook
 * Daily operational checks and connector incident containment
 */

import { NextResponse } from 'next/server';
import { OperationsRunbookEngine } from '@/lib/operations/runbook-engine';

export async function GET() {
  const engine = OperationsRunbookEngine.getInstance();
  const checks = engine.runDailyChecks();
  const recentIncidents = engine.getRecentIncidents();

  return NextResponse.json({
    success: true,
    data: {
      dailyChecks: checks,
      recentIncidents,
      evaluatedAt: new Date().toISOString(),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, connectorCode, reason, affectedOffersCount } = body;

    const engine = OperationsRunbookEngine.getInstance();

    if (action === 'CONTAIN_CONNECTOR_INCIDENT') {
      const incident = engine.handleConnectorIncident(
        connectorCode || 'UNKNOWN',
        reason || 'Manual test containment',
        affectedOffersCount || 14
      );
      return NextResponse.json({
        success: true,
        message: `Connector incident contained: ${connectorCode} circuit breaker engaged.`,
        data: incident,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action '${action}'. Expected 'CONTAIN_CONNECTOR_INCIDENT'.` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Runbook execution error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
