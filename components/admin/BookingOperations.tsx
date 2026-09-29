'use client';

import React, { useState } from 'react';
import { Download, Search, CheckCircle, XCircle, FileText } from 'lucide-react';

interface BookingRow {
  ref: string;
  customerName: string;
  customerEmail: string;
  packageTitle: string;
  travelDates: string;
  amount: number;
  status: 'CONFIRMED' | 'TICKETED' | 'CANCELLED';
}

const INITIAL_ROWS: BookingRow[] = [
  { ref: 'TP-9082', customerName: 'Amal Babu', customerEmail: 'amal.babu@travelplanet.com', packageTitle: 'Dubai Highlights & Marina Yacht', travelDates: '12 Oct – 17 Oct 2026', amount: 52499, status: 'CONFIRMED' },
  { ref: 'TP-9081', customerName: 'Pooja Menon', customerEmail: 'pooja.menon@example.com', packageTitle: 'Bali Escape (5D/4N)', travelDates: '20 Nov – 25 Nov 2026', amount: 74900, status: 'CONFIRMED' },
  { ref: 'TP-9080', customerName: 'Aditya Varma', customerEmail: 'aditya@varma.in', packageTitle: 'Kashmir Paradise (6D/5N)', travelDates: '05 Dec – 11 Dec 2026', amount: 45798, status: 'TICKETED' },
];

export const BookingOperations: React.FC = () => {
  const [rows, setRows] = useState<BookingRow[]>(INITIAL_ROWS);
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'TICKETED' | 'CANCELLED'>('ALL');

  const issueTicket = (ref: string) => {
    setRows(prev => prev.map(r => r.ref === ref ? { ...r, status: 'TICKETED' } : r));
    alert(`Tickets & vouchers issued for booking ${ref}. Audit record generated.`);
  };

  const cancelBooking = (ref: string) => {
    if (confirm(`Confirm cancellation of ${ref}? A 10% fee applies; refund will be issued via gateway clearing.`)) {
      setRows(prev => prev.map(r => r.ref === ref ? { ...r, status: 'CANCELLED' } : r));
    }
  };

  const filtered = rows.filter(r => filter === 'ALL' || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Booking Operations & Fulfillment</h2>
          <p className="text-xs text-slate-500">Manage order lifecycle, ticket issuance, vouchers and cancellation requests.</p>
        </div>
        <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export Audit CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input type="text" placeholder="Search by Booking #..." className="text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 w-full focus:outline-none focus:border-sky-500" />
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            {(['ALL', 'CONFIRMED', 'TICKETED', 'CANCELLED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-full transition ${filter === tab ? 'bg-sky-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Ref Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Travel Package</th>
                <th className="pb-3">Travel Dates</th>
                <th className="pb-3">Total Paid</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map(r => (
                <tr key={r.ref} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-bold text-slate-900">{r.ref}</td>
                  <td>
                    <div className="font-bold text-slate-900">{r.customerName}</div>
                    <div className="text-[10px] text-slate-400">{r.customerEmail}</div>
                  </td>
                  <td>{r.packageTitle}</td>
                  <td>{r.travelDates}</td>
                  <td className="font-bold text-slate-900">₹{r.amount.toLocaleString()}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'TICKETED' ? 'bg-sky-100 text-sky-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-1.5">
                    {r.status === 'CONFIRMED' && (
                      <button onClick={() => issueTicket(r.ref)} className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold text-[10px] transition">
                        Issue Ticket
                      </button>
                    )}
                    {r.status !== 'CANCELLED' && (
                      <button onClick={() => cancelBooking(r.ref)} className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-bold text-[10px] transition">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
