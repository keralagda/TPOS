import { NextRequest, NextResponse } from 'next/server';
import { CHART_OF_ACCOUNTS } from '@/lib/accounting/ledger-engine';

export async function GET(request: NextRequest) {
  const accounts = Object.values(CHART_OF_ACCOUNTS);
  return NextResponse.json({
    success: true,
    totalAccounts: accounts.length,
    accounts
  });
}
