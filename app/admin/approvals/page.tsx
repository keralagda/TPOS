'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/travel/Navbar';
import { 
  CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, 
  DollarSign, FileText, ArrowRight, UserCheck, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

import { InternalLayout } from '@/components/internal/InternalLayout';

interface ApprovalItem {
  id: string;
  category: 'DISCOUNT' | 'REFUND' | 'SUPPLIER_PAYMENT' | 'PURCHASE_ORDER' | 'AI_ACTION';
  title: string;
  referenceId: string;
  requestedBy: string;
  amount?: string;
  reason: string;
  urgency: 'HIGH' | 'MEDIUM' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([
    { id: 'APP-101', category: 'DISCOUNT', title: 'Special Discount on Bali Luxury Honeymoon', referenceId: 'Q-2026-8812', requestedBy: 'Priya Sharma (Agent)', amount: '₹15,000 (8.5%)', reason: 'High-value customer repeat booking match against OTA price', urgency: 'HIGH', status: 'PENDING' },
    { id: 'APP-102', category: 'SUPPLIER_PAYMENT', title: 'Weekly Payout to Gulf Oasis DMC Dubai', referenceId: 'PO-2026-4410', requestedBy: 'System Auto-Batch', amount: 'AED 48,200 (₹10.8L)', reason: 'Contracted Net-30 hotel and desert safari fulfillment batch', urgency: 'URGENT', status: 'PENDING' },
    { id: 'APP-103', category: 'REFUND', title: 'Partial Cancellation Refund: Flight Leg Reschedule', referenceId: 'TP-771802', requestedBy: 'Customer Support Desk', amount: '₹18,500', reason: 'Carrier schedule change > 4 hours, passenger opted for partial refund', urgency: 'MEDIUM', status: 'PENDING' },
    { id: 'APP-104', category: 'AI_ACTION', title: 'Autonomous Room Category Upgrade Offer', referenceId: 'TP-892401', requestedBy: 'Voyage8 AI Agent', amount: '₹0 (Partner Incentive)', reason: 'Complimentary Atlantis Royal Suite upgrade based on high customer lifetime value', urgency: 'MEDIUM', status: 'PENDING' }
  ]);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: action } : item));
  };

  return (
    <InternalLayout
      headerTitle="Central Approval Workspace"
      headerSubtitle="Multi-Tenant Two-Phase Authorization Engine"
      actions={
        <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full">
          {items.filter(i => i.status === 'PENDING').length} Pending Approvals
        </span>
      }
    >
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition-all ${
                item.status === 'APPROVED' ? 'bg-emerald-950/20 border-emerald-800/60' :
                item.status === 'REJECTED' ? 'bg-rose-950/20 border-rose-800/60 opacity-60' :
                'bg-slate-800/80 border-slate-700/80 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-sky-400 font-bold">{item.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.urgency === 'URGENT' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      item.urgency === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {item.urgency}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300">{item.reason}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Reference: <strong className="text-slate-200 font-mono">{item.referenceId}</strong></span>
                    <span>Requested by: <strong className="text-slate-200">{item.requestedBy}</strong></span>
                    {item.amount && (
                      <span>Amount: <strong className="text-emerald-400 font-bold">{item.amount}</strong></span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  {item.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize</span>
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      item.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      'bg-rose-950 text-rose-300 border-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
    </InternalLayout>
  );
}
