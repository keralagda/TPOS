'use client';

import React, { useState } from 'react';
import { 
  FileText, FolderLock, Sparkles, Search, CheckCircle2, 
  AlertTriangle, ShieldCheck, Download, RefreshCw, Send, 
  Clock, Plus, Copy, Check, Eye, ExternalLink, Bot, 
  Layers, HardDrive, Filter, UserCheck, ArrowRight
} from 'lucide-react';
import { InternalLayout } from '@/components/internal/InternalLayout';
import { DMS8VaultService } from '@/lib/dms8/vault-service';
import { DMS8TemplateEngine } from '@/lib/dms8/template-engine';
import { DMS8OCRService, OCRExtractionResult } from '@/lib/dms8/ocr-service';
import { DMS8SearchService } from '@/lib/dms8/search-service';
import { DMS8ApprovalService, ApprovalRequest } from '@/lib/dms8/approval-service';
import { DMS8ComplianceService, ComplianceHealthAudit } from '@/lib/dms8/compliance-service';
import { DMS8AIAssistant, AIAssistantResponse } from '@/lib/dms8/ai-assistant';
import { DMS8AnalyticsService, DMSAnalyticsReport } from '@/lib/dms8/analytics-service';
import { DMS8StorageAdapter } from '@/lib/dms8/storage-adapter';
import { DocumentRegistryItem } from '@/lib/dms8/types';

export default function DMS8AdminPage() {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'DIGITAL_VAULT' | 'TEMPLATES' | 'OCR_AI' | 'APPROVALS' | 'COMPLIANCE' | 'AI_ASSISTANT'
  >('DASHBOARD');

  // Data states
  const [documents, setDocuments] = useState<DocumentRegistryItem[]>(() => DMS8VaultService.getAllDocuments());
  const [selectedDoc, setSelectedDoc] = useState<DocumentRegistryItem>(documents[0]);
  const [analytics, setAnalytics] = useState<DMSAnalyticsReport>(() => DMS8AnalyticsService.getAnalyticsReport());
  const [complianceAudit, setComplianceAudit] = useState<ComplianceHealthAudit>(() => DMS8ComplianceService.runComplianceAudit());
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => DMS8ApprovalService.listApprovalRequests());

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // OCR Console State
  const [ocrInputText, setOcrInputText] = useState(
    'P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<\nZ123456784IND8801156M3201142<<<<<<<<<<<<<<06\nREPUBLIC OF INDIA PASSPORT\nEXPIRY: 2032-01-14'
  );
  const [ocrResult, setOcrResult] = useState<OCRExtractionResult | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);

  // Template State
  const templates = DMS8TemplateEngine.listTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [renderedTemplateFormat, setRenderedTemplateFormat] = useState<'HTML' | 'WHATSAPP'>('HTML');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('Find my Dubai visa');
  const [aiResponse, setAiResponse] = useState<AIAssistantResponse | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  // Handle OCR Run
  const handleRunOCR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingOCR(true);
    try {
      const res = await DMS8OCRService.extractDocumentIntelligence(ocrInputText);
      setOcrResult(res);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Handle AI Assistant Query
  const handleAIQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setIsAILoading(true);
    try {
      const res = await DMS8AIAssistant.query(aiPrompt, {
        userId: 'admin-01',
        userRole: 'SAAS_ADMIN',
        tenantId: 'tenant-default'
      });
      setAiResponse(res);
    } finally {
      setIsAILoading(false);
    }
  };

  // Handle Approval Action
  const handleApprove = (requestId: string) => {
    DMS8ApprovalService.approve(requestId, { id: 'admin-01', role: 'ADMIN' }, 'Approved via DMS8 Console');
    setApprovalRequests(DMS8ApprovalService.listApprovalRequests());
    setDocuments([...DMS8VaultService.getAllDocuments()]);
  };

  const handleReject = (requestId: string) => {
    DMS8ApprovalService.reject(requestId, { id: 'admin-01', role: 'ADMIN' }, 'Rejected during verification');
    setApprovalRequests(DMS8ApprovalService.listApprovalRequests());
    setDocuments([...DMS8VaultService.getAllDocuments()]);
  };

  // Filtered documents
  const filteredDocs = documents.filter(d => {
    const matchCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchQ = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   d.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQ;
  });

  return (
    <InternalLayout
      headerTitle="DMS8 Intelligent Travel Document OS"
      headerSubtitle="Digital Vault • OCR AI • Template Engine • Regulatory Compliance • AI Document Assistant"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('AI_ASSISTANT')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (Strictly No Modals) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'DASHBOARD'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Overview & Quota</span>
          </button>

          <button
            onClick={() => setActiveTab('DIGITAL_VAULT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'DIGITAL_VAULT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5" />
            <span>Digital Vault ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'TEMPLATES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Template Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('OCR_AI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'OCR_AI'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>OCR AI Extraction</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'APPROVALS'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Approvals Queue ({approvalRequests.filter(r => r.status === 'PENDING').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLIANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'COMPLIANCE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Compliance & Expiry ({complianceAudit.expiringIn30DaysCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_ASSISTANT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'AI_ASSISTANT'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Storage Consumption</span>
                <div className="text-2xl font-black text-white">{analytics.formattedStorageSize}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Quota: 10 GB (Vercel Blob)</span>
                  <span className="text-sky-400 font-bold">{analytics.storageUsagePercent}%</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Documents</span>
                <div className="text-2xl font-black text-sky-400">{analytics.totalDocumentCount}</div>
                <span className="text-[11px] text-slate-400 block pt-1">Across 6 Travel Categories</span>
              </div>

              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Compliance Health</span>
                <div className="text-2xl font-black text-emerald-400">{analytics.complianceScore}%</div>
                <span className="text-[11px] text-emerald-400 block pt-1">All audit policies active</span>
              </div>

              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">30-Day Expiry Alerts</span>
                <div className="text-2xl font-black text-amber-400">{analytics.expiringIn30Days}</div>
                <span className="text-[11px] text-amber-400 block pt-1">Passports & Insurance monitored</span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Document Distribution by Travel Domain
                </span>
                <div className="space-y-2">
                  {analytics.categoryBreakdown.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-white">{cat.category}</span>
                        <span className="text-[10px] font-mono text-slate-400">({(cat.bytes / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-slate-800 text-sky-400 font-bold rounded-lg text-xs font-mono">
                        {cat.count} files
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Security Classification Distribution
                </span>
                <div className="space-y-2">
                  {analytics.classificationBreakdown.map((cls, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cls.classification === 'RESTRICTED' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' :
                          cls.classification === 'CONFIDENTIAL' ? 'bg-amber-950 text-amber-400 border border-amber-800/40' :
                          'bg-sky-950 text-sky-400 border border-sky-800/40'
                        }`}>
                          {cls.classification}
                        </span>
                      </div>
                      <span className="text-xs font-black text-white font-mono">{cls.count} items</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL VAULT */}
        {activeTab === 'DIGITAL_VAULT' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vault documents, tags..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="CUSTOMER">Customer KYC & Visas</option>
                  <option value="BOOKING">Booking Vouchers & Invoices</option>
                  <option value="SUPPLIER">Supplier Agreements</option>
                  <option value="FINANCE">Finance & Taxes</option>
                </select>
              </div>
            </div>

            {/* Two-Pane Vault View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document List */}
              <div className="space-y-2">
                {filteredDocs.map(doc => (
                  <div
                    key={doc.documentId}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      selectedDoc.documentId === doc.documentId
                        ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-sky-400 px-2 py-0.5 bg-sky-950 rounded">
                        {doc.documentType}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.classification === 'RESTRICTED' ? 'bg-rose-950 text-rose-400' :
                        doc.classification === 'CONFIDENTIAL' ? 'bg-amber-950 text-amber-400' :
                        'bg-sky-950 text-sky-400'
                      }`}>
                        {doc.classification}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-white text-xs leading-snug">{doc.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Owner: {doc.ownerName}</span>
                      <span className="text-emerald-400 font-bold font-mono">v{doc.version}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Document Detailed Inspector */}
              <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedDoc.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedDoc.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <a
                      href={DMS8StorageAdapter.generateSignedDownloadUrl(selectedDoc.storagePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Signed Download</span>
                    </a>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Storage</span>
                    <span className="font-mono text-white text-[11px]">{selectedDoc.storageProvider}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Lifecycle State</span>
                    <span className="font-bold text-emerald-400 text-[11px]">{selectedDoc.lifecycleStatus}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">File Size</span>
                    <span className="font-mono text-white text-[11px]">{(selectedDoc.fileSizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Expiry Date</span>
                    <span className="font-mono text-amber-400 text-[11px]">{selectedDoc.expiryDate || 'N/A'}</span>
                  </div>
                </div>

                {/* SHA-256 Hash Verification */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cryptographic Integrity (SHA-256)
                  </span>
                  <div className="font-mono text-[11px] text-emerald-400 break-all">{selectedDoc.sha256Hash}</div>
                </div>

                {/* OCR Extracted Entities */}
                {selectedDoc.ocrData && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Extracted Intelligence
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Confidence: {(selectedDoc.ocrData.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {selectedDoc.ocrData.extractedEntities.fullName && (
                        <div><strong>Name:</strong> {selectedDoc.ocrData.extractedEntities.fullName}</div>
                      )}
                      {selectedDoc.ocrData.extractedEntities.idOrPassportNumber && (
                        <div><strong>ID/Passport No:</strong> {selectedDoc.ocrData.extractedEntities.idOrPassportNumber}</div>
                      )}
                      {selectedDoc.ocrData.extractedEntities.expiryDate && (
                        <div><strong>Expiry:</strong> {selectedDoc.ocrData.extractedEntities.expiryDate}</div>
                      )}
                      {selectedDoc.ocrData.extractedEntities.nationality && (
                        <div><strong>Nationality:</strong> {selectedDoc.ocrData.extractedEntities.nationality}</div>
                      )}
                      {selectedDoc.ocrData.extractedEntities.totalAmount && (
                        <div><strong>Amount:</strong> ₹{selectedDoc.ocrData.extractedEntities.totalAmount.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEMPLATES */}
        {activeTab === 'TEMPLATES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Standard Travel Templates
              </span>
              {templates.map(tpl => (
                <div
                  key={tpl.code}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    selectedTemplate.code === tpl.code
                      ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">{tpl.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{tpl.description}</p>
                </div>
              ))}
            </div>

            {/* Template Inspector & Live Rendering */}
            <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedTemplate.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedTemplate.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRenderedTemplateFormat('HTML')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      renderedTemplateFormat === 'HTML' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    HTML / PDF
                  </button>
                  <button
                    onClick={() => setRenderedTemplateFormat('WHATSAPP')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      renderedTemplateFormat === 'WHATSAPP' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Rendered Output */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                {renderedTemplateFormat === 'WHATSAPP' ? (
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                    {DMS8TemplateEngine.renderTemplate(selectedTemplate.code, selectedTemplate.sampleVariables, 'WHATSAPP').content}
                  </pre>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DMS8TemplateEngine.renderTemplate(selectedTemplate.code, selectedTemplate.sampleVariables, 'HTML').content
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: OCR AI */}
        {activeTab === 'OCR_AI' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div>
                <h3 className="text-lg font-black text-white">OCR & Entity Extraction Console</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Input scanned travel document text, MRZ strips, or invoice details. The engine runs NVIDIA NIM entity classification and normalizes business objects.
                </p>
              </div>

              <form onSubmit={handleRunOCR} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Raw Scanned Text</label>
                  <textarea
                    rows={8}
                    required
                    value={ocrInputText}
                    onChange={e => setOcrInputText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingOCR}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessingOCR ? 'Analyzing & Extracting...' : 'Run OCR AI Extraction'}</span>
                </button>
              </form>
            </div>

            {/* Results */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Normalized Business Entity Output
              </span>

              {ocrResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Classified Type:</span>
                      <div className="font-extrabold text-white text-sm">{ocrResult.classifiedType}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded-lg text-xs font-bold font-mono">
                      {(ocrResult.confidenceScore * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Extracted Fields:</span>
                    <pre className="text-xs font-mono text-purple-300 whitespace-pre-wrap">
                      {JSON.stringify(ocrResult.extractedEntities, null, 2)}
                    </pre>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400">
                    Pipeline Steps: {ocrResult.processingPipeline.join(' → ')}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Sparkles className="w-8 h-8 mb-2 opacity-40 text-purple-400" />
                  <span>Click &quot;Run OCR AI Extraction&quot; to test autonomous travel document parsing.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: APPROVALS */}
        {activeTab === 'APPROVALS' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Governed Document Approvals Queue</h3>
              <p className="text-xs text-slate-400 mt-1">
                Multi-role approval chains: Supplier master agreements, high-value vouchers, passport compliance, and tax invoice reversals.
              </p>
            </div>

            <div className="space-y-3">
              {approvalRequests.map(req => (
                <div key={req.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{req.documentTitle}</span>
                        <span className="px-2 py-0.5 bg-slate-900 text-sky-400 text-[10px] font-mono rounded">
                          {req.documentType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Requested by: {req.requestedBy}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                        req.status === 'REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' :
                        'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}>
                        {req.status}
                      </span>

                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 flex flex-wrap gap-4">
                    <span>Required Roles: {req.requiredRoles.join(', ')}</span>
                    <span>Approvals Collected: {req.approvalsCollected.length} / {req.requiredRoles.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COMPLIANCE & EXPIRY */}
        {activeTab === 'COMPLIANCE' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-lg font-black text-white">Regulatory Expiry & Compliance Radar</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proactive 30-day alerts for passport validity (minimum 6 months for international travel) and overseas insurance.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Compliance Score</span>
                  <div className="text-xl font-black text-emerald-400">{complianceAudit.complianceScore}%</div>
                </div>
              </div>

              <div className="space-y-3">
                {complianceAudit.alerts.map((alertItem, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      alertItem.urgency === 'CRITICAL_EXPIRED'
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-extrabold text-sm">{alertItem.documentTitle}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-white rounded">
                          {alertItem.ownerName}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-300">
                        Expiry Date: <strong>{alertItem.expiryDate}</strong> ({alertItem.daysRemaining} days remaining)
                      </div>
                      <div className="text-[11px] text-sky-400 mt-1 font-mono">
                        Action: {alertItem.automatedActionRequired}
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Automated renewal notification dispatched to ${alertItem.ownerName}`)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shrink-0 transition"
                    >
                      Trigger Reminder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AI COPILOT */}
        {activeTab === 'AI_ASSISTANT' && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 max-w-4xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-white">AI Travel Document Assistant</h3>
              <p className="text-xs text-slate-400 mt-1">
                Conversational document queries with strict RBAC boundary checks and tenant isolation.
              </p>
            </div>

            <form onSubmit={handleAIQuery} className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ask e.g. 'Find my Dubai visa', 'Check passport expiry', 'Summarize this contract'..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={isAILoading}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Bot className="w-4 h-4" />
                <span>{isAILoading ? 'Thinking...' : 'Ask Copilot'}</span>
              </button>
            </form>

            {aiResponse && (
              <div className="bg-slate-950 rounded-xl border border-teal-500/40 p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-teal-400 uppercase text-[10px]">Intent: {aiResponse.intent}</span>
                  <span className="text-[10px] text-slate-400 font-mono">RBAC Verified</span>
                </div>

                <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {aiResponse.answerMarkdown}
                </div>

                {aiResponse.matchedDocuments.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Referenced Documents:</span>
                    <div className="flex flex-wrap gap-2">
                      {aiResponse.matchedDocuments.map(d => (
                        <span key={d.documentId} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-sky-400 font-mono">
                          {d.title} (v{d.version})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </InternalLayout>
  );
}
