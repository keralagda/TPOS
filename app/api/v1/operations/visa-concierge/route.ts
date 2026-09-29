import { NextRequest, NextResponse } from 'next/server';
import { VisaConciergeEngine } from '@/lib/operations/visa-concierge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Option A: Direct MRZ lines parsing
    let mrzData = body.mrzData;
    if (body.line1 && body.line2) {
      mrzData = VisaConciergeEngine.parseMRZ(body.line1, body.line2);
    } else if (!mrzData && body.sampleMRZ) {
      // Default sample for demo/quick test: Indian passport holder travelling to Dubai
      mrzData = VisaConciergeEngine.parseMRZ(
        'P<INDSHARMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        'Z1234567<8IND9205143M2911204<<<<<<<<<<<<<<06'
      );
    }

    if (!mrzData) {
      return NextResponse.json({
        success: false,
        error: 'Missing passport MRZ lines (line1, line2) or mrzData object'
      }, { status: 400 });
    }

    const destination = body.destination || 'AE';
    const travelDate = body.travelDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const evaluation = VisaConciergeEngine.evaluateVisaEligibility(mrzData, destination, travelDate);

    // Optional photo validation
    let photoCheck = undefined;
    if (body.photoSpecs) {
      photoCheck = VisaConciergeEngine.validatePhotoSpecs(body.photoSpecs);
    }

    return NextResponse.json({
      success: true,
      mrzData,
      evaluation,
      photoCheck,
      processedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Visa concierge evaluation failed'
    }, { status: 500 });
  }
}
