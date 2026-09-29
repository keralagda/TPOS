import { NextRequest, NextResponse } from 'next/server';
import { CRMEngine } from '@/lib/crm/crm-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || 'usr_cust_rahul';

  try {
    const customer360 = CRMEngine.getCustomer360(customerId);
    return NextResponse.json({
      success: true,
      customerId,
      data: customer360
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve Customer 360 profile.' },
      { status: 500 }
    );
  }
}
