import { NextRequest, NextResponse } from 'next/server';
import { IndianTaxEngine, TaxCalculationParams } from '@/lib/finance/tax-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const params: TaxCalculationParams = {
      bookingId: body.bookingId || `bkg_${Date.now()}`,
      travelerPan: body.travelerPan || 'ABCDE1234F',
      panHolderName: body.panHolderName || 'Rahul Sharma',
      isInternational: body.isInternational !== false,
      baseAmountINR: Number(body.baseAmountINR) || 120000,
      convenienceFeeINR: Number(body.convenienceFeeINR) || 1500,
      corporateGstin: body.corporateGstin,
      supplyStateCode: body.supplyStateCode || '07',
      posStateCode: body.posStateCode,
      priorRemittancesInCurrentFY_INR: Number(body.priorRemittancesInCurrentFY_INR) || 0
    };

    const breakdown = IndianTaxEngine.calculateTaxes(params);

    return NextResponse.json({
      success: true,
      breakdown,
      statutoryCompliance: {
        tcsSection: 'Income Tax Act Section 206C(1G)',
        gstSacCode: '99855 (Tour Operator Services)',
        doubleEntryIntegrity: breakdown.ledgerJournalEntry.balanced
      },
      calculatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Tax calculation failed'
    }, { status: 500 });
  }
}
