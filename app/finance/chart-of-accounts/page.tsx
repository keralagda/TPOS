'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  Layers, Plus, Filter, Search, ShieldCheck, 
  ArrowRight, DollarSign, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

interface Account {
  code: string;
  name: string;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 'EXPENSE';
  balance: number;
  normal: 'DEBIT' | 'CREDIT';
  desc: string;
}

export default function ChartOfAccountsPage() {
  const [activeTab, setActiveTab] = useState<'ACCOUNTS' | 'CREATE'>('ACCOUNTS');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([
    // Assets
    { code: '1100', name: 'Cash on Hand', category: 'ASSET', balance: 250000, normal: 'DEBIT', desc: 'Petty cash and branch till balances' },
    { code: '1200', name: 'Operating Bank Account (HDFC/ICICI)', category: 'ASSET', balance: 8420000, normal: 'DEBIT', desc: 'Primary INR operational bank account' },
    { code: '1210', name: 'Gateway Settlement Clearing (Razorpay)', category: 'ASSET', balance: 1250000, normal: 'DEBIT', desc: 'Authorized & captured gateway payouts' },
    { code: '1300', name: 'Accounts Receivable (Customers/Agencies)', category: 'ASSET', balance: 3450000, normal: 'DEBIT', desc: 'Customer & B2B agency receivables' },
    { code: '1400', name: 'Supplier Advances & Prepaid Deposits', category: 'ASSET', balance: 980000, normal: 'DEBIT', desc: 'Prepayments to airlines and DMCs' },

    // Liabilities
    { code: '2100', name: 'Accounts Payable (Suppliers/DMCs)', category: 'LIABILITY', balance: 4120000, normal: 'CREDIT', desc: 'Due to airlines, hotels, and ground operators' },
    { code: '2200', name: 'Customer Advance Bookings', category: 'LIABILITY', balance: 5890000, normal: 'CREDIT', desc: 'Unearned customer revenue for future trips' },
    { code: '2300', name: 'GST Output Tax Payable (5% SAC 99855)', category: 'LIABILITY', balance: 420000, normal: 'CREDIT', desc: 'GST collected on outbound tour packages' },
    { code: '2310', name: 'TCS Collected Payable (Sec 206C(1G))', category: 'LIABILITY', balance: 812000, normal: 'CREDIT', desc: 'TCS collected for Form 27EQ filing' },
    { code: '2400', name: 'Accrued Commission Payable', category: 'LIABILITY', balance: 340000, normal: 'CREDIT', desc: 'Commissions owed to travel agents and partners' },

    // Equity
    { code: '3100', name: 'Paid-in Capital', category: 'EQUITY', balance: 5000000, normal: 'CREDIT', desc: 'Founding equity capital' },
    { code: '3200', name: 'Retained Earnings', category: 'EQUITY', balance: 1420000, normal: 'CREDIT', desc: 'Accumulated operational surplus' },

    // Revenue
    { code: '4100', name: 'Flight Ticketing Revenue', category: 'REVENUE', balance: 12400000, normal: 'CREDIT', desc: 'Direct NDC airfares' },
    { code: '4200', name: 'Hotel & Villa Revenue', category: 'REVENUE', balance: 18200000, normal: 'CREDIT', desc: 'Hospitality accommodation revenue' },
    { code: '4300', name: 'Holiday Packages Revenue', category: 'REVENUE', balance: 24800000, normal: 'CREDIT', desc: 'Paced multi-day packaged itineraries' },
    { code: '4400', name: 'Experience & Excursion Revenue', category: 'REVENUE', balance: 6100000, normal: 'CREDIT', desc: 'Activities, charters, safaris, transfers' },
    { code: '4500', name: 'Visa & Concierge Service Fees', category: 'REVENUE', balance: 1450000, normal: 'CREDIT', desc: 'Service fees for visa processing' },

    // Cost of Sales
    { code: '5100', name: 'Airline Supplier Cost', category: 'COST_OF_SALES', balance: 11400000, normal: 'DEBIT', desc: 'Direct carrier costs' },
    { code: '5200', name: 'Hotel & DMC Supplier Cost', category: 'COST_OF_SALES', balance: 15600000, normal: 'DEBIT', desc: 'Contracted wholesale accommodation' },
    { code: '5300', name: 'Excursion & Transfer Supplier Cost', category: 'COST_OF_SALES', balance: 4800000, normal: 'DEBIT', desc: 'Local ground operator costs' },

    // Expenses
    { code: '6100', name: 'Staff Salaries & Benefits', category: 'EXPENSE', balance: 3200000, normal: 'DEBIT', desc: 'Operational payroll' },
    { code: '6200', name: 'Marketing & Digital Acquisition', category: 'EXPENSE', balance: 1850000, normal: 'DEBIT', desc: 'Search and social campaigns' },
    { code: '6300', name: 'Technology & Cloud Infrastructure', category: 'EXPENSE', balance: 420000, normal: 'DEBIT', desc: 'Servers, AI APIs, database, and NDC' },
    { code: '6500', name: 'Payment Gateway Processing Charges', category: 'EXPENSE', balance: 280000, normal: 'DEBIT', desc: 'Card processing and merchant fees' }
  ]);

  // Form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 'EXPENSE'>('ASSET');
  const [newNormal, setNewNormal] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [newBalance, setNewBalance] = useState('0');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const acc: Account = {
      code: newCode,
      name: newName,
      category: newCategory,
      normal: newNormal,
      balance: parseFloat(newBalance) || 0,
      desc: newDesc
    };

    setAccounts([...accounts, acc]);
    setNotice(`Account GL-${newCode} (${newName}) successfully added to Chart of Accounts.`);
    setNewCode('');
    setNewName('');
    setNewDesc('');
    setActiveTab('ACCOUNTS');
  };

  const filtered = accounts.filter(a => selectedCat === 'ALL' || a.category === selectedCat);

  return (
    <InternalLayout
      headerTitle="Chart of Accounts (COA) Architecture"
      headerSubtitle="Master Ledger Code Directory • Double-Entry Classification Rules"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('ACCOUNTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ACCOUNTS' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Accounts Table ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'CREATE' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add GL Account</span>
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

        {/* Tab 1: Accounts List */}
        {activeTab === 'ACCOUNTS' && (
          <div className="space-y-5">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COST_OF_SALES', 'EXPENSE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCat === cat
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Accounts' : cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* COA Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Account Code</th>
                    <th className="p-4">Account Title & Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Normal Balance</th>
                    <th className="p-4 text-right">Current Balance (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((acc) => (
                    <tr key={acc.code} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono font-bold text-sky-400 text-sm">{acc.code}</td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{acc.name}</div>
                        <div className="text-[11px] text-slate-400">{acc.desc}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {acc.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-400">{acc.normal}</td>
                      <td className="p-4 text-right font-mono font-bold text-sm text-emerald-400">
                        ₹{acc.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Create Account Form */}
        {activeTab === 'CREATE' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" /> Register New Ledger Account
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Define an accounting chart code for financial transactions, vendor settlements, and tax postings.
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Code *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. 1250"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ASSET">ASSET (1000s)</option>
                    <option value="LIABILITY">LIABILITY (2000s)</option>
                    <option value="EQUITY">EQUITY (3000s)</option>
                    <option value="REVENUE">REVENUE (4000s)</option>
                    <option value="COST_OF_SALES">COST OF SALES (5000s)</option>
                    <option value="EXPENSE">EXPENSE (6000s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Title *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Foreign Currency Clearing AED"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Normal Balance</label>
                  <select
                    value={newNormal}
                    onChange={(e) => setNewNormal(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="DEBIT">DEBIT (Dr)</option>
                    <option value="CREDIT">CREDIT (Cr)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Opening Balance (INR)</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description / Purpose</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Operational purpose, statutory relevance, or supplier association..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('ACCOUNTS')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-sky-600/20"
                >
                  Save Account to COA
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
