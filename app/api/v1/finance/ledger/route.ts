import { NextRequest, NextResponse } from 'next/server';
import { LedgerEngine } from '@/lib/accounting/ledger-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const traceRef = searchParams.get('trace') || 'TP-892401';

  const journal = LedgerEngine.postCustomerPaymentJournal({
    bookingId: 'bk_tp892401',
    bookingNumber: 'TP-892401',
    customerId: 'usr_cust_rahul',
    netAmount: 309800,
    gstAmount: 15490,
    tcsAmount: 15750
  });

  const traceChain = LedgerEngine.traceTransaction(traceRef);

  return NextResponse.json({
    success: true,
    journal,
    traceChain: traceChain.traceChain
  });
}
