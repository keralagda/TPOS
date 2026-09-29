import { NextRequest, NextResponse } from 'next/server';
import { CorporatePolicyService, CorporateTripRequest } from '@/lib/corporate/policy-service';

export async function POST(req: NextRequest) {
  try {
    const body: Partial<CorporateTripRequest> = await req.json();

    const evaluation = CorporatePolicyService.evaluatePolicy(body);

    const tripRequest: CorporateTripRequest = {
      requestId: `corp-req-${Date.now()}`,
      employeeId: body.employeeId || 'emp-user-101',
      employeeName: body.employeeName || 'Aakash Verma',
      employeeRole: body.employeeRole || 'STAFF',
      costCenter: body.costCenter || 'CC-ENGINEERING-402',
      destination: body.destination || 'Dubai',
      departureDate: body.departureDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      totalCostInr: body.totalCostInr || 65000,
      flightCabin: body.flightCabin || 'ECONOMY',
      hotelRatePerNightInr: body.hotelRatePerNightInr || 7500,
      status: evaluation.requiresDirectorApproval ? 'PENDING_DIRECTOR' : 'PENDING_MANAGER',
      policyViolations: evaluation.violations,
    };

    return NextResponse.json({
      success: true,
      data: {
        request: tripRequest,
        compliance: evaluation,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
