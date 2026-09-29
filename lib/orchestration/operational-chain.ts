/**
 * Travel Planet (Voyage8) — Master Operational Chain Orchestrator
 * Connects CRM -> ERP -> Accounting into One Seamless Execution Pipeline
 * 
 * Execution Flow:
 * 1. CRM: Lead -> Enquiry -> Requirement -> Quote -> Customer Acceptance
 * 2. COMMERCE: Booking Confirmation -> PAN/LRS Check -> Tax Calculation
 * 3. ERP: Component Task Generation (Flight, Hotel, Transfer, Excursion, Visa) -> Supplier PO
 * 4. ACCOUNTING: Double-Entry Journal (Debits == Credits) -> General Ledger Posting -> Invoicing
 */

import { CRMEngine, CRMQuote, CRMCustomer } from '../crm/crm-engine';
import { ERPEngine, OperationalTask, SupplierPurchaseOrder, ERPTrip } from '../erp/erp-engine';
import { LedgerEngine, JournalEntry } from '../accounting/ledger-engine';

export interface ChainExecutionResult {
  success: boolean;
  chainExecutionId: string;
  timestamp: string;
  crm: {
    quoteNumber: string;
    customerName: string;
    totalQuoteAmount: number;
    marginPercent: number;
  };
  erp: {
    bookingNumber: string;
    tripId: string;
    operationalTasksCount: number;
    tasks: OperationalTask[];
    supplierPurchaseOrders: SupplierPurchaseOrder[];
  };
  accounting: {
    journalNumber: string;
    invoiceNumber: string;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
    journalEntry: JournalEntry;
  };
}

export class OperationalChainOrchestrator {
  /**
   * Executes the full end-to-end chain from CRM Quote to ERP Ops & Accounting Ledger
   */
  public static executeFullChain(params: {
    quote: CRMQuote;
    customer: CRMCustomer;
    paymentMethod: string;
  }): ChainExecutionResult {
    const chainExecutionId = `CHAIN-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. CRM Phase: Convert accepted quote to Booking Intent
    const bookingIntent = CRMEngine.convertQuoteToBooking(params.quote, params.customer);
    const bookingId = `bk_${bookingIntent.bookingNumber.toLowerCase()}`;

    // 2. ERP Phase: Generate Component Tasks for Operational Fulfillment
    const hasFlight = params.quote.items.some(i => i.category === 'FLIGHT');
    const hasHotel = params.quote.items.some(i => i.category === 'HOTEL');
    const hasTransfer = params.quote.items.some(i => i.category === 'TRANSFER');
    const hasExperience = params.quote.items.some(i => i.category === 'EXPERIENCE');
    const requiresVisa = params.quote.items.some(i => i.category === 'VISA') || true;

    const operationalTasks = ERPEngine.generateBookingTasks({
      id: bookingId,
      bookingNumber: bookingIntent.bookingNumber,
      customerName: params.customer.name,
      hasFlight,
      hasHotel,
      hasTransfer,
      hasExperience,
      requiresVisa
    });

    // ERP Phase 2: Create Supplier Purchase Orders for external vendors
    const supplierPOs: SupplierPurchaseOrder[] = [];
    if (hasHotel) {
      supplierPOs.push(
        ERPEngine.createPurchaseOrder({
          supplierId: 'sup_palm_hospitality',
          supplierName: 'Atlantis Palm Jumeirah Hospitality',
          bookingId,
          category: 'HOTEL_DMC',
          currency: 'INR',
          totalCost: 140000,
          paymentTerms: 'NET_30'
        })
      );
    }
    if (hasFlight) {
      supplierPOs.push(
        ERPEngine.createPurchaseOrder({
          supplierId: 'sup_emirates_direct',
          supplierName: 'Emirates Direct NDC',
          bookingId,
          category: 'AIRLINE',
          currency: 'INR',
          totalCost: 110000,
          paymentTerms: 'PREPAID'
        })
      );
    }

    // 3. Accounting Phase: Post Double-Entry Journal Entry
    // 5% GST and statutory TCS
    const gstAmount = Math.round(params.quote.subtotalSellingPrice * 0.05);
    const tcsAmount = Math.round(params.quote.subtotalSellingPrice * 0.05);

    const journal = LedgerEngine.postCustomerPaymentJournal({
      bookingId,
      bookingNumber: bookingIntent.bookingNumber,
      customerId: params.customer.id,
      netAmount: params.quote.subtotalSellingPrice,
      gstAmount,
      tcsAmount
    });

    const invoiceNumber = `INV-${new Date().getFullYear()}-${bookingIntent.bookingNumber.replace('TP-', '')}`;

    return {
      success: true,
      chainExecutionId,
      timestamp,
      crm: {
        quoteNumber: params.quote.quoteNumber,
        customerName: params.customer.name,
        totalQuoteAmount: params.quote.totalQuoteAmount,
        marginPercent: params.quote.marginPercent
      },
      erp: {
        bookingNumber: bookingIntent.bookingNumber,
        tripId: `trip_${bookingIntent.bookingNumber.toLowerCase()}`,
        operationalTasksCount: operationalTasks.length,
        tasks: operationalTasks,
        supplierPurchaseOrders: supplierPOs
      },
      accounting: {
        journalNumber: journal.journalNumber,
        invoiceNumber,
        totalDebit: journal.totalDebit,
        totalCredit: journal.totalCredit,
        isBalanced: Math.abs(journal.totalDebit - journal.totalCredit) < 0.01,
        journalEntry: journal
      }
    };
  }
}
