'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  ArrowLeftRight, CheckCircle2, AlertTriangle, Clock, 
  Search, Filter, ShieldCheck, Download, RefreshCw, UploadCloud,
  FileSpreadsheet, Check
} from 'lucide-react';
import Link from 'next/link';

interface BankRecord {
  id: string;
  bankTxnDate: string;
  bankRef: string;
  description: string;
  amount: number;
  matchedBookingId?: string;
  matchedCustomer?: string;
  status: 'RECONCILED' | 'SUGGESTED' | 'UNMATCHED' | 'EXCEPTION';
}

export default function BankReconciliationPage() {
  const [activeTab, setActiveTab] = useState<'RECONCILE' | 'IMPORT'>('RECONCILE');
  const [notice, setNotice] = useState<string | null>(null);

  const [records, setRecords] = useState<BankRecord[]>([
    { id: 'REC-01', bankTxnDate: '2026-09-25', bankRef: 'RZP-PAY-881290', description: 'Razorpay Auto-Payout Booking TP-892401', amount: 341040, matchedBookingId: 'TP-892401', matchedCustomer: 'Rahul Sharma', status: 'RECONCILED' },
    { id: 'REC-02', bankTxnDate: '2026-09-25', bankRef: 'CMS-NEFT-99120', description: 'NEFT Corporate Retreat Payment', amount: 820000, matchedBookingId: 'TP-884120', matchedCustomer: 'Dr. Anand Verma', status: 'SUGGESTED' },
    { id: 'REC-03', bankTxnDate: '2026-09-24', bankRef: 'UPI-CR-441029', description: 'UPI Transfer Travel Planet Web', amount: 185000, matchedBookingId: 'TP-771920', matchedCustomer: 'Pooja Iyer', status: 'RECONCILED' },
    { id: 'REC-04', bankTxnDate: '2026-09-24', bankRef: 'SWIFT-INW-7712', description: 'Inward Wire Transfer (USD 2,400)', amount: 198000, status: 'UNMATCHED' },
    { id: 'REC-05', bankTxnDate: '2026-09-23', bankRef: 'CHQ-DEP-1102', description: 'Cheque Return / Fee Charge', amount: 250, status: 'EXCEPTION' }
  ]);

  // Import form state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank Corporate A/c 50200088192');
  const [statementMonth, setStatementMonth] = useState('September 2026');

  const handleReconcile = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'RECONCILED' } : r));
    setNotice(`Transaction ${id} verified and settled against General Ledger.`);
  };

  const handleManualMatch = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'RECONCILED', matchedBookingId: 'TP-MANUAL-ALLOC', matchedCustomer: 'Allocated by Finance' } : r));
    setNotice(`Transaction ${id} manually matched and posted.`);
  };

  const handleImportFeed = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: BankRecord = {
      id: `REC-0${records.length + 1}`,
      bankTxnDate: '2026-09-26',
      bankRef: `FEED-CMS-${Math.floor(1000 + Math.random() * 9000)}`,
      description: 'Incoming RTGS Customer Remittance',
      amount: 450000,
      status: 'SUGGESTED',
      matchedBookingId: 'TP-892999',
      matchedCustomer: 'Direct RTGS Client'
    };

    setRecords([newRec, ...records]);
    setNotice(`Bank statement CSV parsed successfully. Added new statement lines for reconciliation.`);
    setActiveTab('RECONCILE');
  };

  return (
    <InternalLayout
      headerTitle="Bank Statement Reconciliation Workbench"
      headerSubtitle="Automated Matching Engine • Direct Gateway Feeds • Zero Leakage"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('RECONCILE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'RECONCILE' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Workbench ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'IMPORT' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Statement Feed</span>
          </button>
          <Link
            href="/finance/general-ledger"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm"
          >
            General Ledger →
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Notice Banner */}
        {notice && (
          <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-emerald-400 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase">Reconciled MTD</div>
            <div className="text-xl font-black text-emerald-400 mt-1">₹4,28,40,000</div>
            <div className="text-[10px] text-slate-400 mt-0.5">97.2% Match Rate</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase">Suggested Matches</div>
            <div className="text-xl font-black text-amber-400 mt-1">
              {records.filter(r => r.status === 'SUGGESTED').length} Entries
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Click to confirm</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase">Unmatched Feed Items</div>
            <div className="text-xl font-black text-sky-400 mt-1">
              {records.filter(r => r.status === 'UNMATCHED').length} Wires
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting customer tag</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-400 font-semibold uppercase">Exceptions</div>
            <div className="text-xl font-black text-rose-400 mt-1">
              {records.filter(r => r.status === 'EXCEPTION').length} Items
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bank fee charge</div>
          </div>
        </div>

        {/* Tab 1: Reconciliation Table */}
        {activeTab === 'RECONCILE' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Bank Ref & Date</th>
                  <th className="p-4">Bank Narration</th>
                  <th className="p-4">Matched Booking / Client</th>
                  <th className="p-4">Amount (INR)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-mono font-bold text-white">{r.bankRef}</div>
                      <div className="text-[10px] text-slate-400">{r.bankTxnDate}</div>
                    </td>
                    <td className="p-4 text-slate-200">{r.description}</td>
                    <td className="p-4">
                      {r.matchedBookingId ? (
                        <div>
                          <span className="font-mono font-bold text-sky-400">{r.matchedBookingId}</span>
                          <div className="text-[11px] text-slate-400">{r.matchedCustomer}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No direct booking match</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-white text-sm">
                      ₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'RECONCILED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        r.status === 'SUGGESTED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        r.status === 'EXCEPTION' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'SUGGESTED' ? (
                        <button
                          onClick={() => handleReconcile(r.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-sm"
                        >
                          Accept Match
                        </button>
                      ) : r.status === 'RECONCILED' ? (
                        <span className="text-emerald-400 font-bold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleManualMatch(r.id)}
                          className="text-sky-400 hover:underline font-bold text-[11px]"
                        >
                          Match Manually
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Import Statement Feed Form */}
        {activeTab === 'IMPORT' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-400" /> Import Bank Feed & Statement
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload MT940, CSV, or CAMT.053 bank statement files to trigger rule-based reconciliation.
              </p>
            </div>

            <form onSubmit={handleImportFeed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Bank Account</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="HDFC Bank Corporate A/c 50200088192">HDFC Bank Corporate A/c (INR) — 50200088192</option>
                  <option value="ICICI Current A/c 00120501824">ICICI Current A/c (INR) — 00120501824</option>
                  <option value="Razorpay Settlement Clearing">Razorpay Virtual Settlement Account</option>
                  <option value="Mashreq Bank Dubai (AED)">Mashreq Bank Dubai (AED) — 0192841029</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Statement Period</label>
                <input
                  type="text"
                  value={statementMonth}
                  onChange={(e) => setStatementMonth(e.target.value)}
                  placeholder="September 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-950/40 space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-xs font-bold text-slate-300">Drop bank statement CSV or Excel file here</div>
                <div className="text-[11px] text-slate-500">Supports standard HDFC, ICICI, SBI, and Razorpay export formats</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('RECONCILE')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-sky-600/20"
                >
                  Execute Auto-Reconcile Pipeline
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
