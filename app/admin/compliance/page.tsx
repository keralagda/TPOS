import { Metadata } from 'next';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { Compliance8Engine } from '@/lib/compliance/compliance8-engine';
import { Shield, CheckCircle2, AlertTriangle, Lock, FileCheck, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compliance & Governance Center | Travel Planet OS',
  description: 'Evidence verification, double approvals (C8-D03), granular travel gates, and immutable regulatory audit.',
};

export default function ComplianceCenterPage() {
  const approvals = Compliance8Engine.listApprovals();

  return (
    <InternalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                COMPLIANCE8 AUDIT ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">Evidence-First Gatekeeper</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              Travel Compliance Center
            </h1>
            <p className="text-sm text-slate-400">
              Enforce C8-D03 Double Approvals: Customer confirms document identity (#1) and authorizes extracted travel facts (#2) before agency validation.
            </p>
          </div>
        </div>

        {/* Doctrines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <UserCheck className="w-4 h-4 text-sky-400" />
              C8-D02 / C8-D03
            </div>
            <div className="text-lg font-black text-white">Customer Owns Verification</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Approval #1 (Document upload confirmation) + Approval #2 (Extracted fact authorization). AI never approves for customer.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <Lock className="w-4 h-4 text-purple-400" />
              C8-D06 Change Invalidation
            </div>
            <div className="text-lg font-black text-white">Cryptographic Guard</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Any post-approval document or passenger name edit immediately revokes verification and resets approval state to pending.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Granular Travel Gates
            </div>
            <div className="text-lg font-black text-white">Non-Blocking Fulfillment</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Hotel and domestic flights may proceed while visa validation remains strictly pending without blocking unrelated inventory.
            </p>
          </div>
        </div>

        {/* Active Journey Compliance Queue */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Double-Approval Compliance Queue ({approvals.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Scope: Global HQ & Regional Branches</span>
          </div>

          {approvals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No pending compliance violations. All current journeys are operating within verified regulatory thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map((app) => (
                <div key={`${app.journeyId}-${app.documentId}`} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{app.snapshot.travellerName} ({app.snapshot.nationality})</div>
                    <div className="text-xs text-slate-400">
                      Doc: {app.snapshot.documentNumber} • Exp: {app.snapshot.expiryDate} • Dest: {app.snapshot.destination}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${app.approval1_DocumentConfirmed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      #1 Document: {app.approval1_DocumentConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${app.approval2_ExtractedDataConfirmed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      #2 Data: {app.approval2_ExtractedDataConfirmed ? 'Authorized' : 'Pending'}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${app.agencyValidationStatus === 'VALIDATED' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'}`}>
                      Agency: {app.agencyValidationStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </InternalLayout>
  );
}
