'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  DollarSign, FileSpreadsheet, ShieldAlert, ArrowUpRight, 
  TrendingUp, CheckCircle, Clock, Download, CheckCircle2,
  Layers, ArrowLeftRight
} from 'lucide-react';
import Link from 'next/link';

export default function FinanceDashboard() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q3 FY 24-25');
  const [activeTab, setActiveTab] = useState<'TCS_TAX' | 'GST_LIABILITY'>('TCS_TAX');
  const [notice, setNotice] = useState<string | null>(null);

  const handleGenerateTds = () => {
    setNotice('NSDL e-TDS FVU text file generated successfully and archived to compliance vault.');
  };

  return (
    <InternalLayout
      headerTitle="FinTech & Statutory Tax Command Center"
      headerSubtitle="Section 206C(1G) TCS • GST SAC 99855 • General Ledger Integration"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('TCS_TAX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'TCS_TAX' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            TCS Tax & Form 27D
          </button>
          <button
            onClick={() => setActiveTab('GST_LIABILITY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'GST_LIABILITY' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            GST SAC 99855 & Outbound
          </button>
          <button
            onClick={handleGenerateTds}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate e-TDS Return</span>
          </button>
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

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Gross Booking Volume (MTD)</div>
            <div className="text-2xl font-black text-white mt-1">₹4,82,40,000</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs last month
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">TCS Collected Sec 206C(1G)</div>
            <div className="text-2xl font-black text-sky-400 mt-1">₹41,20,500</div>
            <div className="text-[11px] text-slate-400 mt-1">
              5% tier: ₹24.2L • 20% tier: ₹17.0L
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">GST Liability (5% Outbound)</div>
            <div className="text-2xl font-black text-amber-400 mt-1">₹24,12,000</div>
            <div className="text-[11px] text-slate-400 mt-1">
              SAC 99855 Tour Operator Service
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase">Supplier Payouts Due</div>
            <div className="text-2xl font-black text-white mt-1">AED 412,000</div>
            <div className="text-[11px] text-indigo-400 mt-1">
              Direct DMC contracts settled weekly
            </div>
          </div>
        </div>

        {/* Tab 1: TCS Filing & Challan Status */}
        {activeTab === 'TCS_TAX' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Recent TCS Tax Challans & Form 27D Pipeline
                </h2>
                <span className="text-xs text-slate-400 font-mono">BSR Code: 0510304</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Customer PAN</th>
                      <th className="p-3.5">Remittance Value</th>
                      <th className="p-3.5">TCS Rate</th>
                      <th className="p-3.5">TCS Deposited</th>
                      <th className="p-3.5">Challan / 27D</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[
                      { pan: 'ABCDE1234F', rem: 125000, rate: '5%', tax: 6250, cert: '27D-2024-0012', status: 'ISSUED' },
                      { pan: 'BKUPP9921K', rem: 850000, rate: '20% (Split)', tax: 65000, cert: '27D-2024-0013', status: 'ISSUED' },
                      { pan: 'GHJTR4410M', rem: 320000, rate: '5%', tax: 16000, cert: 'Pending Challan', status: 'CHALLAN_GEN' },
                      { pan: 'ZXVBN8819L', rem: 1100000, rate: '20% (Split)', tax: 115000, cert: 'Pending Challan', status: 'CHALLAN_GEN' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono font-bold text-sky-400">{row.pan}</td>
                        <td className="p-3.5 text-slate-200">₹{row.rem.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-slate-300">{row.rate}</td>
                        <td className="p-3.5 font-semibold text-emerald-400">₹{row.tax.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-mono text-slate-400">{row.cert}</td>
                        <td className="p-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'ISSUED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statutory Tax Compliance Checklist */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-400" /> Compliance Health
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-200">TAN Registration Verified</div>
                    <div className="text-[11px] text-slate-400">TAN: BLRT09124D active on NSDL e-Gov portal.</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-200">Form 27EQ Quarterly Return</div>
                    <div className="text-[11px] text-slate-400">Q2 filed on schedule; Q3 draft in preparation.</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-200">Weekly FX Revaluation</div>
                    <div className="text-[11px] text-slate-400">Scheduled for Friday 18:00 IST for AED/USD positions.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GST Outbound SAC 99855 Details */}
        {activeTab === 'GST_LIABILITY' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> GST SAC 99855 (Tour Operator Services) Reconciliation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">5% GST without Input Tax Credit (ITC) applicable to outbound packaged tours.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">Total Taxable Outbound Turnover</div>
                <div className="text-xl font-black text-white">₹4,82,40,000</div>
                <div className="text-[10px] text-slate-500">Gross Package Sales MTD</div>
              </div>
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">GST Output Tax (5% SAC 99855)</div>
                <div className="text-xl font-black text-amber-400">₹24,12,000</div>
                <div className="text-[10px] text-emerald-400">Reconciled with GSTR-1 Draft</div>
              </div>
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">ITC Restriction Status</div>
                <div className="text-xl font-black text-emerald-400">Compliant (No ITC Claimed)</div>
                <div className="text-[10px] text-slate-500">Adheres strictly to Notification 11/2017-CT(R)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
