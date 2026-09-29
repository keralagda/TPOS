'use client';

import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

export const FinanceLedger: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">General Ledger (Double-Entry Bookkeeping)</h2>
          <p className="text-xs text-slate-500">Strict separation of customer advances, supplier liabilities, tax, and revenue.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Total Debits == Total Credits (Balanced)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Gateway Clearing (DR)</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">₹52,499.00</div>
          <span className="text-[10px] text-slate-400">Account #1002</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Supplier Payable (CR)</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">₹42,000.00</div>
          <span className="text-[10px] text-slate-400">Account #2001</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">GST Payable (CR)</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">₹2,500.00</div>
          <span className="text-[10px] text-slate-400">Account #2003 (5%)</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Commission Income (CR)</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">₹7,999.00</div>
          <span className="text-[10px] text-slate-400">Account #4002 (Net Revenue)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h3 className="font-extrabold text-slate-900 text-sm mb-3">Immutable Journal Entries for Booking #TP-9082</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] font-sans">
                <th className="pb-2">Account Code</th>
                <th className="pb-2">Account Name</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Debit (₹)</th>
                <th className="pb-2 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 font-bold text-slate-900">1002-GATEWAY_CLEARING</td>
                <td className="font-sans">Razorpay Gateway Clearing</td>
                <td className="font-sans">Customer payment received for TP-9082</td>
                <td className="text-right font-bold text-slate-900">52,499.00</td>
                <td className="text-right text-slate-400">0.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">2003-TAX_GST_PAYABLE</td>
                <td className="font-sans">Goods & Services Tax Payable (5%)</td>
                <td className="font-sans">GST tax liability for TP-9082</td>
                <td className="text-right text-slate-400">0.00</td>
                <td className="text-right font-bold text-slate-900">2,500.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">2001-SUPPLIER_PAYABLE</td>
                <td className="font-sans">Supplier Direct Payable</td>
                <td className="font-sans">Payable to Emirates Airlines & Atlantis Resort</td>
                <td className="text-right text-slate-400">0.00</td>
                <td className="text-right font-bold text-slate-900">42,000.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">4002-COMMISSION_INCOME</td>
                <td className="font-sans">Travel Planet Commission Revenue</td>
                <td className="font-sans">Net platform commercial margin</td>
                <td className="text-right text-slate-400">0.00</td>
                <td className="text-right font-bold text-emerald-600">7,999.00</td>
              </tr>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                <td colSpan={3} className="py-2.5 text-right font-sans">Total Balanced:</td>
                <td className="text-right text-slate-900">₹52,499.00</td>
                <td className="text-right text-slate-900">₹52,499.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
