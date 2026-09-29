'use client';

import React, { useState } from 'react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { 
  FileText, Plus, Trash2, ArrowRight, DollarSign, 
  Percent, ShieldCheck, CheckCircle2, RefreshCw, Calculator,
  Send, Download, History, Sparkles, Building, Plane, Hotel
} from 'lucide-react';
import Link from 'next/link';

interface QuoteItem {
  id: string;
  category: 'FLIGHT' | 'HOTEL' | 'EXPERIENCE' | 'TRANSFER' | 'VISA';
  description: string;
  cost: number;
  markupPercent: number;
}

export default function QuotesPage() {
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'ADD_ITEM' | 'HISTORY'>('BUILDER');
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [validDays, setValidDays] = useState(7);
  const [discount, setDiscount] = useState(10000);
  const [isConverted, setIsConverted] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // New item form state
  const [itemCat, setItemCat] = useState<'FLIGHT' | 'HOTEL' | 'EXPERIENCE' | 'TRANSFER' | 'VISA'>('EXPERIENCE');
  const [itemDesc, setItemDesc] = useState('');
  const [itemCost, setItemCost] = useState('25000');
  const [itemMarkup, setItemMarkup] = useState('12');

  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', category: 'FLIGHT', description: 'Emirates BOM-DXB-BOM Return (3 Pax)', cost: 110000, markupPercent: 6 },
    { id: '2', category: 'HOTEL', description: 'Atlantis The Royal Palm View Room (4 Nights)', cost: 140000, markupPercent: 10 },
    { id: '3', category: 'EXPERIENCE', description: 'Private Yacht Charter & VIP Desert Safari', cost: 35000, markupPercent: 12 },
    { id: '4', category: 'TRANSFER', description: 'Private Airport Chauffeur Limousine', cost: 12000, markupPercent: 15 }
  ]);

  let totalCost = 0;
  let subtotalSelling = 0;
  let gstTax = 0;

  items.forEach(item => {
    const selling = Math.round(item.cost * (1 + item.markupPercent / 100));
    totalCost += item.cost;
    subtotalSelling += selling;
    gstTax += Math.round(selling * 0.05); // 5% GST
  });

  const netSelling = subtotalSelling - discount;
  const grossMargin = netSelling - totalCost;
  const marginPercent = netSelling > 0 ? ((grossMargin / netSelling) * 100).toFixed(2) : '0';
  const totalPayable = netSelling + gstTax;

  const handleConvert = () => {
    setIsConverted(true);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDesc.trim()) return;

    const newItem: QuoteItem = {
      id: String(Date.now()),
      category: itemCat,
      description: itemDesc,
      cost: parseFloat(itemCost) || 0,
      markupPercent: parseFloat(itemMarkup) || 10
    };

    setItems([...items, newItem]);
    setItemDesc('');
    setBannerNotice(`Line item added: ${newItem.description}`);
    setActiveTab('BUILDER');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <InternalLayout
      headerTitle="Quotation Engine & Margin Manager"
      headerSubtitle="Client Pricing • Real-time Costing • Multi-Component Margin Lock"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BUILDER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'BUILDER' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Quote Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('ADD_ITEM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'ADD_ITEM' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line Item</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'HISTORY' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Revision History</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner notification */}
        {bannerNotice && (
          <div className="bg-sky-950/70 border border-sky-800 text-sky-200 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="text-sky-400 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {isConverted ? (
          <div className="bg-slate-900/90 border border-emerald-500/60 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Quote Converted to Booking!</h2>
            <p className="text-xs text-slate-300">
              Booking reference <strong className="text-white font-mono">TP-892401</strong> has been confirmed. Operational tasks have been auto-dispatched to the Airline and Hotel fulfillment desks.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/erp/trips/trip_tp892401"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Open Trip Command Center →
              </Link>
              <Link
                href="/finance/general-ledger"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition border border-slate-700"
              >
                Inspect Ledger Journal →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tab 1: Builder */}
            {activeTab === 'BUILDER' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Quote Items Editor */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-sky-400" /> Quotation Builder (Q-2026-9011)
                        </h2>
                        <p className="text-[11px] text-slate-400">Client: {customerName} • Validity: {validDays} Days</p>
                      </div>
                      <span className="text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-800 px-3 py-1 rounded-lg">
                        Dubai Luxury Family Itinerary
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 mr-2">
                              {item.category}
                            </span>
                            <span className="font-semibold text-slate-200">{item.description}</span>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <div className="text-[10px] text-slate-400">Supplier Cost</div>
                              <div className="font-mono text-slate-300">₹{item.cost.toLocaleString('en-IN')}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-purple-400">Markup</div>
                              <div className="font-mono font-bold text-purple-300">{item.markupPercent}%</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-emerald-400">Client Price</div>
                              <div className="font-mono font-bold text-white">
                                ₹{Math.round(item.cost * (1 + item.markupPercent / 100)).toLocaleString('en-IN')}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 transition"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financial Summary & Conversion Card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Financial Breakdown</h3>

                    <div className="space-y-3 text-xs border-t border-b border-slate-800 py-4">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Supplier Cost</span>
                        <span className="font-mono font-bold text-slate-200">₹{totalCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal Client Price</span>
                        <span className="font-mono font-bold text-slate-200">₹{subtotalSelling.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Discount Applied</span>
                        <span className="font-mono text-rose-400">-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>GST (5% Outbound Tour)</span>
                        <span className="font-mono text-slate-200">₹{gstTax.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="pt-2 border-t border-dashed border-slate-800 flex justify-between items-baseline">
                        <div>
                          <div className="text-xs text-purple-400 font-bold">Gross Margin</div>
                          <div className="text-[10px] text-slate-400">{marginPercent}% Margin</div>
                        </div>
                        <span className="font-mono font-bold text-purple-400 text-sm">
                          ₹{grossMargin.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-white">Total Quote Amount</span>
                        <span className="text-xl font-black text-emerald-400">
                          ₹{totalPayable.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handleConvert}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
                      >
                        <span>Convert to Booking</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setBannerNotice('Quotation PDF generated and dispatched via WhatsApp & Email to ' + customerName)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-xl transition border border-slate-700"
                      >
                        Send PDF to Customer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Add Line Item Form (Converted from Modal) */}
            {activeTab === 'ADD_ITEM' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
                <div className="border-b border-slate-800 pb-4 mb-6">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-sky-400" /> Add Quotation Line Item
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Add flights, hotels, ground activities, transfers, or visa components with automatic markup computation.
                  </p>
                </div>

                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={itemCat}
                        onChange={(e) => setItemCat(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="FLIGHT">Flight / NDC Airfare</option>
                        <option value="HOTEL">Hotel / Resort Stay</option>
                        <option value="EXPERIENCE">Experience / Activity</option>
                        <option value="TRANSFER">Transfer / Chauffeur</option>
                        <option value="VISA">Visa Concierge Fee</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Supplier Cost (INR)
                      </label>
                      <input
                        type="number"
                        required
                        value={itemCost}
                        onChange={(e) => setItemCost(e.target.value)}
                        placeholder="25000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Component Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      placeholder="e.g. Scuba Diving Certification at Coral Reef (2 Pax)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Markup Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={itemMarkup}
                      onChange={(e) => setItemMarkup(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      Computed Client Price: ₹
                      {Math.round(
                        (parseFloat(itemCost) || 0) * (1 + (parseFloat(itemMarkup) || 0) / 100)
                      ).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('BUILDER')}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-sky-600/20"
                    >
                      Insert Line Item
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: History */}
            {activeTab === 'HISTORY' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-xl space-y-4">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-sky-400" /> Quotation Revision Log
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete audit trail of price changes, discounts, and customer review actions.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { rev: 'v1.2', date: 'Today, 04:15 PM', author: 'Priya Sharma', change: 'Applied ₹10,000 seasonal discount and added private chauffeur limousine.' },
                    { rev: 'v1.1', date: 'Today, 11:30 AM', author: 'Priya Sharma', change: 'Upgraded hotel to Atlantis Palm View Room upon customer request.' },
                    { rev: 'v1.0', date: 'Yesterday, 06:00 PM', author: 'System AI', change: 'Initial quotation generated from Lead LD-902 requirement capture.' },
                  ].map((r, i) => (
                    <div key={i} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-sky-400">{r.rev}</span>
                        <span className="text-[10px] text-slate-500">{r.date}</span>
                      </div>
                      <div className="font-semibold text-white">{r.change}</div>
                      <div className="text-[10px] text-slate-400">Author: {r.author}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </InternalLayout>
  );
}
