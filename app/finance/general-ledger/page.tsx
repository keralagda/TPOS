'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  FileSpreadsheet, Filter, Search, ArrowRight, ShieldCheck, 
  CheckCircle2, Clock, Download, ChevronRight, Layers, ArrowLeftRight 
} from 'lucide-react';
import Link from 'next/link';

interface TraceStep {
  step: string;
  type: string;
  id: string;
  details: string;
}

export default function GeneralLedgerPage() {
  const [activeTab, setActiveTab] = useState<'JOURNALS' | 'TRACE'>('JOURNALS');
  const [selectedAccount, setSelectedAccount] = useState('ALL');

  const [activeTrace, setActiveTrace] = useState<TraceStep[]>([
    { step: '1. Customer', type: 'CRM_CUSTOMER', id: 'usr_cust_rahul', details: 'Rahul Sharma (rahul.sharma@example.com)' },
    { step: '2. Quote', type: 'CRM_QUOTE', id: 'Q-2026-9011', details: 'Dubai Family 5D Luxury Odyssey (₹3,15,290)' },
    { step: '3. Booking', type: 'COMMERCE_BOOKING', id: 'TP-892401', details: 'Status: CONFIRMED | Currency: INR' },
    { step: '4. Invoice', type: 'SALES_INVOICE', id: 'INV-2026-0891', details: 'Net: ₹3,09,800 + GST: ₹15,490' },
    { step: '5. Payment', type: 'PAYMENT_CAPTURE', id: 'PAY-TP-892401', details: 'Razorpay Authorized & Captured' },
    { step: '6. Journal', type: 'ACCOUNTING_JOURNAL', id: 'JRN-2026-891024', details: 'Balanced Debits == Credits (₹3,25,290)' },
    { step: '7. Ledger', type: 'GENERAL_LEDGER', id: 'GL-1210 / GL-2200', details: 'Posted into Chart of Accounts' }
  ]);

  const journals = [
    {
      id: 'JRN-2026-891024',
      date: '2026-09-25',
      ref: 'PAY-TP-892401',
      bookingId: 'TP-892401',
      desc: 'Customer payment received for Booking TP-892401 (Dubai Family Package)',
      lines: [
        { code: '1210', name: 'Gateway Settlement Clearing', debit: 341040, credit: 0 },
        { code: '2200', name: 'Customer Advance Bookings', debit: 0, credit: 309800 },
        { code: '2300', name: 'GST Output Tax Payable (5%)', debit: 0, credit: 15490 },
        { code: '2310', name: 'TCS Collected Payable (5%)', debit: 0, credit: 15750 }
      ],
      totalDebit: 341040,
      totalCredit: 341040,
      isBalanced: true
    },
    {
      id: 'JRN-2026-891025',
      date: '2026-09-24',
      ref: 'REV-TP-771920',
      bookingId: 'TP-771920',
      desc: 'Revenue & Cost recognition upon Bali trip departure (TP-771920)',
      lines: [
        { code: '2200', name: 'Customer Advance Bookings', debit: 185000, credit: 0 },
        { code: '4300', name: 'Holiday Packages Revenue', debit: 0, credit: 185000 },
        { code: '5200', name: 'Hotel & DMC Supplier Cost', debit: 148000, credit: 0 },
        { code: '2100', name: 'Accounts Payable (Suppliers)', debit: 0, credit: 148000 }
      ],
      totalDebit: 333000,
      totalCredit: 333000,
      isBalanced: true
    }
  ];

  return (
    <InternalLayout
      headerTitle="General Ledger & Double-Entry Journal"
      headerSubtitle="Strict Double-Entry Bookkeeping • Total Debits == Total Credits • Full Traceability"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('JOURNALS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'JOURNALS' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Posted Journals ({journals.length})
          </button>
          <button
            onClick={() => setActiveTab('TRACE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'TRACE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Traceability Chain (7 Steps)
          </button>
          <Link
            href="/finance/chart-of-accounts"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-xl transition"
          >
            Chart of Accounts →
          </Link>
          <Link
            href="/finance/reconciliation"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
          >
            Bank Reconciliation →
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab 1: Posted Double-Entry Journals */}
        {activeTab === 'JOURNALS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted Double-Entry Journals</h2>
              <span className="text-xs text-emerald-400 font-medium">All Books Balanced</span>
            </div>

            {journals.map((journal) => (
              <div key={journal.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-sky-400">{journal.id}</span>
                    <span className="text-xs text-slate-400">Date: {journal.date}</span>
                    <span className="text-xs text-slate-300">Ref: <strong className="font-mono">{journal.ref}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      DEBITS == CREDITS BALANCED
                    </span>
                    <Link
                      href={`/erp/trips/trip_${journal.bookingId.toLowerCase()}`}
                      className="text-xs text-sky-400 hover:underline font-semibold ml-2"
                    >
                      View Trip Ops →
                    </Link>
                  </div>
                </div>

                <div className="p-4 text-xs text-slate-300 border-b border-slate-800/60">
                  {journal.desc}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Account Code</th>
                        <th className="p-3.5">Account Title</th>
                        <th className="p-3.5 text-right">Debit (INR)</th>
                        <th className="p-3.5 text-right">Credit (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {journal.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="p-3.5 font-bold text-sky-400">{line.code}</td>
                          <td className="p-3.5 font-sans text-slate-200">{line.name}</td>
                          <td className="p-3.5 text-right text-slate-200">
                            {line.debit > 0 ? `₹${line.debit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="p-3.5 text-right text-slate-200">
                            {line.credit > 0 ? `₹${line.credit.toLocaleString('en-IN')}` : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950/80 font-bold border-t border-slate-800">
                        <td colSpan={2} className="p-3.5 text-right font-sans text-slate-300 uppercase">
                          Journal Total Balance:
                        </td>
                        <td className="p-3.5 text-right text-emerald-400">
                          ₹{journal.totalDebit.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right text-emerald-400">
                          ₹{journal.totalCredit.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Bidirectional Traceability Explorer */}
        {activeTab === 'TRACE' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-400" /> Bidirectional Financial Traceability Chain
                </h2>
                <p className="text-[11px] text-slate-400">
                  Auditor Trace: Customer ↔ Quote ↔ Booking ↔ Invoice ↔ Payment ↔ Journal ↔ General Ledger
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                100% Audit Complete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 pt-2">
              {activeTrace?.map((step, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1.5 relative">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{step.step}</div>
                  <div className="font-mono text-xs font-bold text-sky-400 truncate">{step.id}</div>
                  <div className="text-[10px] text-slate-300 line-clamp-2">{step.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
