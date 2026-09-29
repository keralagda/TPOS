/**
 * API Route: /api/v1/operations/qa-suite
 * Triggers the 16-layer QA & GTM certification test suite
 */

import { NextResponse } from 'next/server';
import { VerificationSuite } from '@/tests/verification-suite';

export async function GET() {
  try {
    const report = await VerificationSuite.runAllTests();
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'QA suite execution error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const report = await VerificationSuite.runAllTests();
    return NextResponse.json({
      success: true,
      message: `QA & GTM Suite Executed: ${report.passedCount}/${report.totalTests} tests passed. State: ${report.gtmState}.`,
      data: report,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'QA suite execution error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
