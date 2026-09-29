/**
 * API Route: /api/v1/b2b2c/wallet
 * Partner digital wallet top-up, drawdown, and transaction history
 */

import { NextResponse } from 'next/server';
import { PartnerService } from '@/lib/b2b2c/partner-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partnerId') || undefined;

  const partnerService = PartnerService.getInstance();
  const txs = partnerService.getRecentTransactions(partnerId);

  return NextResponse.json({
    success: true,
    data: txs,
    meta: { count: txs.length },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, partnerCode, amount, paymentRef, bookingRef } = body;

    const partnerService = PartnerService.getInstance();

    if (action === 'TOP_UP') {
      if (!partnerCode || !amount) {
        return NextResponse.json(
          { success: false, error: 'Missing partnerCode or amount for wallet top-up.' },
          { status: 400 }
        );
      }
      const ref = paymentRef || `pay_${Date.now()}`;
      const tx = partnerService.topUpWallet(partnerCode, Number(amount), ref);
      return NextResponse.json({
        success: true,
        message: `Successfully topped up ₹${amount.toLocaleString()} into partner wallet.`,
        data: tx,
      });
    }

    if (action === 'DRAWDOWN') {
      if (!partnerCode || !amount || !bookingRef) {
        return NextResponse.json(
          { success: false, error: 'Missing partnerCode, amount, or bookingRef for drawdown.' },
          { status: 400 }
        );
      }
      const tx = partnerService.drawdownForBooking(partnerCode, Number(amount), bookingRef);
      return NextResponse.json({
        success: true,
        message: `Successfully disbursed ₹${amount.toLocaleString()} from wallet for booking ${bookingRef}.`,
        data: tx,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action '${action}'. Expected 'TOP_UP' or 'DRAWDOWN'.` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Wallet transaction error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
