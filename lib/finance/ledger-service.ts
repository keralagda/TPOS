/**
 * Travel Planet — General Ledger & Financial Accounting Service
 * Governing document: 08_CRM_ERP_FINANCE.md, 15_IMPLEMENTATION_PHASES.md (Phase 2)
 * 
 * Non-negotiable rules:
 * 1. Double-entry bookkeeping: Total Debits == Total Credits.
 * 2. Separate customer money, supplier payable, commission, tax liability, and refund liability.
 * 3. Never infer financial truth from UI state; ledger entries are immutable.
 */

export interface LedgerEntry {
  entryId: string;
  transactionRef: string; // e.g. "INV-2026-001", "PAY-9082", "REF-001"
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  timestamp: Date;
}

export interface JournalTransaction {
  id?: string;
  transactionId: string;
  reference: string;
  eventType: 'BOOKING_PAYMENT_CAPTURED' | 'SUPPLIER_PAYABLE_RECOGNIZED' | 'REFUND_ISSUED' | 'SUPPLIER_SETTLEMENT_PAID';
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  timestamp: Date;
}

export class LedgerAccountingService {
  private static instance: LedgerAccountingService;
  private transactions: JournalTransaction[] = [];
  private allEntries: LedgerEntry[] = [];

  private constructor() {
    this.seedInitialLedger();
  }

  static getInstance(): LedgerAccountingService {
    if (!LedgerAccountingService.instance) {
      LedgerAccountingService.instance = new LedgerAccountingService();
    }
    return LedgerAccountingService.instance;
  }

  private seedInitialLedger(): void {
    // Booking TP-9082 Payment & Revenue Recognition
    this.recordBookingTransaction(
      'TP-9082',
      52499, // Customer Total Paid (Gross + GST)
      2500,  // 5% GST
      42000, // Cost owed to Emirates + Atlantis
      7999   // Platform Net Margin
    );
  }

  /**
   * Records a confirmed customer booking:
   * DR Gateway Clearing (1002): Full payment from customer
   *   CR Tax / GST Payable (2003): Government tax component
   *   CR Supplier Accounts Payable (2001): Obligation to suppliers
   *   CR Commission / Service Revenue (4002): Travel Planet platform revenue
   */
  recordBookingTransaction(
    bookingNumber: string,
    customerPaidAmount: number,
    taxAmount: number,
    supplierPayable: number,
    platformMargin: number
  ): JournalTransaction {
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    const entries: LedgerEntry[] = [
      {
        entryId: `ent_${Math.random().toString(36).substring(7)}`,
        transactionRef: bookingNumber,
        accountCode: '1002-GATEWAY_CLEARING',
        accountName: 'Razorpay Gateway Clearing',
        debit: customerPaidAmount,
        credit: 0,
        description: `Customer payment received for ${bookingNumber}`,
        timestamp: now,
      },
      {
        entryId: `ent_${Math.random().toString(36).substring(7)}`,
        transactionRef: bookingNumber,
        accountCode: '2003-TAX_GST_PAYABLE',
        accountName: 'Goods & Services Tax Payable (5%)',
        debit: 0,
        credit: taxAmount,
        description: `GST liability for ${bookingNumber}`,
        timestamp: now,
      },
      {
        entryId: `ent_${Math.random().toString(36).substring(7)}`,
        transactionRef: bookingNumber,
        accountCode: '2001-SUPPLIER_PAYABLE',
        accountName: 'Supplier Direct Payable',
        debit: 0,
        credit: supplierPayable,
        description: `Payable to airlines and hotel operators for ${bookingNumber}`,
        timestamp: now,
      },
      {
        entryId: `ent_${Math.random().toString(36).substring(7)}`,
        transactionRef: bookingNumber,
        accountCode: '4002-COMMISSION_INCOME',
        accountName: 'Travel Planet Commission Revenue',
        debit: 0,
        credit: platformMargin,
        description: `Net commercial commission earned on ${bookingNumber}`,
        timestamp: now,
      },
    ];

    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

    // CRITICAL INTEGRITY CHECK
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(`Accounting Ledger Out of Balance! Debit: ${totalDebit}, Credit: ${totalCredit}`);
    }

    const journalTx: JournalTransaction = {
      transactionId: txId,
      reference: bookingNumber,
      eventType: 'BOOKING_PAYMENT_CAPTURED',
      entries,
      totalDebit,
      totalCredit,
      timestamp: now,
    };

    this.transactions.push(journalTx);
    this.allEntries.push(...entries);
    return journalTx;
  }

  getLedgerSummary(): {
    totalDebits: number;
    totalCredits: number;
    cashInClearing: number;
    supplierLiability: number;
    taxLiability: number;
    earnedCommission: number;
    transactionsCount: number;
  } {
    let totalDebits = 0;
    let totalCredits = 0;
    let cashInClearing = 0;
    let supplierLiability = 0;
    let taxLiability = 0;
    let earnedCommission = 0;

    for (const e of this.allEntries) {
      totalDebits += e.debit;
      totalCredits += e.credit;

      if (e.accountCode === '1002-GATEWAY_CLEARING') cashInClearing += (e.debit - e.credit);
      if (e.accountCode === '2001-SUPPLIER_PAYABLE') supplierLiability += (e.credit - e.debit);
      if (e.accountCode === '2003-TAX_GST_PAYABLE') taxLiability += (e.credit - e.debit);
      if (e.accountCode === '4002-COMMISSION_INCOME') earnedCommission += (e.credit - e.debit);
    }

    return {
      totalDebits,
      totalCredits,
      cashInClearing,
      supplierLiability,
      taxLiability,
      earnedCommission,
      transactionsCount: this.transactions.length,
    };
  }

  getAllEntries(): LedgerEntry[] {
    return this.allEntries;
  }

  getJournals(): (JournalTransaction & { id: string })[] {
    return this.transactions.map(t => ({
      ...t,
      id: t.transactionId,
    }));
  }
}

export const ledgerService = LedgerAccountingService.getInstance();
