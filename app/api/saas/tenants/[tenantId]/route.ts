import { NextResponse } from 'next/server';
import { SaaSControlPlane } from '@/lib/saas/saas-control-plane';

export async function GET(
  req: Request,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenant = SaaSControlPlane.getTenant(params.tenantId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }
    const meters = SaaSControlPlane.getTenantMeters(tenant.id);
    return NextResponse.json({ success: true, tenant, meters });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { tenantId: string } }
) {
  try {
    const body = await req.json();
    const { action, planCode, packCodes, reason } = body;

    let tenant;
    if (action === 'SUSPEND') {
      tenant = SaaSControlPlane.suspendTenant(params.tenantId, reason || 'Manual admin suspension');
    } else if (action === 'REACTIVATE') {
      tenant = SaaSControlPlane.reactivateTenant(params.tenantId);
    } else if (action === 'UPDATE_PLAN_PACKS') {
      tenant = SaaSControlPlane.updateTenantPlanAndPacks(params.tenantId, planCode, packCodes);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, tenant });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
