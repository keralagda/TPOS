import { NextResponse } from 'next/server';
import { CRUDCapabilityMatrix, CRUD_CAPABILITY_MATRIX } from '@/lib/crude8/capability-matrix';
import { UNIVERSAL_ACTION_TYPES } from '@/lib/crude8/types';
import { CRUDE8EventBus } from '@/lib/crude8/event-bus';
import { Sync8Engine } from '@/lib/crude8/sync-engine';
import { CRUDE8AuditEngine } from '@/lib/crude8/audit-engine';
import { CRUDE8Engine } from '@/lib/crude8/crud-engine';

// GET /api/crude8/matrix — full CRUD Capability Matrix + live governance telemetry
export async function GET() {
  try {
    CRUDE8Engine.init();
    Sync8Engine.init();

    const validation = CRUDCapabilityMatrix.validate();

    return NextResponse.json(
      {
        success: true,
        data: {
          stats: CRUDCapabilityMatrix.getMatrixStats(),
          validation,
          universalActionTypes: UNIVERSAL_ACTION_TYPES,
          modules: CRUDCapabilityMatrix.listModules(),
          matrix: CRUD_CAPABILITY_MATRIX,
          telemetry: {
            events: CRUDE8EventBus.getEventHistory(25),
            syncLogs: Sync8Engine.getLogs(25),
            syncHealth: Sync8Engine.getHealth(),
            auditChain: CRUDE8AuditEngine.query({ limit: 25 }),
            auditIntegrity: CRUDE8AuditEngine.verifyChainIntegrity()
          }
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'CRUDE8 Matrix Error' },
      { status: 500 }
    );
  }
}
