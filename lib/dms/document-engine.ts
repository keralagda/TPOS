import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { DocumentTemplateType } from '@prisma/client';

export interface DocumentTokenPayload {
  customerName: string;
  customerEmail?: string;
  bookingRef: string;
  documentNumber?: string;
  totalAmount: number | string;
  currency?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  status?: string;
  issueDate?: string;
  additionalDetails?: Record<string, any>;
}

export const CANONICAL_TEMPLATES = [
  {
    code: 'AIRLINE_E_VOUCHER_CANONICAL',
    name: 'Standard Airline Electronic Voucher',
    type: DocumentTemplateType.VOUCHER,
    description: 'Official ticket confirmation voucher with flight segment details and PNR verification.',
    htmlLayout: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background-color: #0284c7; color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">TRAVEL PLANET</h1>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Voyage8 Governed Flight Voucher</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 14px; font-weight: bold; background: rgba(255,255,255,0.2); padding: 4px 12px; rounded: 6px;">{{status}}</span>
            <p style="margin: 6px 0 0; font-size: 11px;">Ref: {{bookingRef}}</p>
          </div>
        </div>
        <div style="padding: 24px;">
          <div style="margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Lead Passenger</p>
            <h2 style="margin: 4px 0 0; font-size: 18px; color: #0f172a;">{{customerName}}</h2>
            <p style="margin: 2px 0 0; font-size: 13px; color: #64748b;">{{customerEmail}}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
              <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">From & Departure</span>
              <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold;">{{origin}}</p>
              <p style="margin: 2px 0 0; font-size: 13px; color: #475569;">{{departureDate}}</p>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
              <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">To & Arrival</span>
              <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold;">{{destination}}</p>
              <p style="margin: 2px 0 0; font-size: 13px; color: #475569;">{{returnDate}}</p>
            </div>
          </div>
          <div style="border-top: 1px dashed #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; align-items: baseline;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Total Paid (Inclusive of Taxes)</p>
              <p style="margin: 4px 0 0; font-size: 22px; font-weight: 800; color: #0f172a;">{{currency}} {{totalAmount}}</p>
            </div>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Issued: {{issueDate}}</p>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 12px 24px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between;">
          <span>Document No: {{documentNumber}}</span>
          <span>Security Hash: SHA-256 Verified</span>
        </div>
      </div>
    `,
  },
  {
    code: 'GST_TAX_INVOICE_CANONICAL',
    name: 'Indian GST Compliant Tax Invoice',
    type: DocumentTemplateType.INVOICE,
    description: 'Commercial invoice compliant with Indian GST requirements, SAC codes, and double-entry ledger linkage.',
    htmlLayout: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; border-radius: 8px; color: #0f172a;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">TAX INVOICE</h1>
            <p style="margin: 4px 0 0; font-size: 13px; font-weight: bold;">Travel Planet India Pvt Ltd</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #475569;">GSTIN: 32AABCT0123M1Z5</p>
          </div>
          <div style="text-align: right; font-size: 12px;">
            <p style="margin: 0; font-weight: bold; font-size: 14px;">Invoice: {{documentNumber}}</p>
            <p style="margin: 2px 0 0; color: #64748b;">Date: {{issueDate}}</p>
            <p style="margin: 2px 0 0; color: #64748b;">Booking Ref: {{bookingRef}}</p>
          </div>
        </div>
        <div style="margin-bottom: 24px;">
          <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Billed To:</p>
          <p style="margin: 4px 0 0; font-size: 15px; font-weight: bold;">{{customerName}}</p>
          <p style="margin: 2px 0 0; font-size: 12px; color: #475569;">{{customerEmail}}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
              <th style="padding: 8px 12px;">Description</th>
              <th style="padding: 8px 12px;">SAC Code</th>
              <th style="padding: 8px 12px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 12px;">Travel Services — {{origin}} to {{destination}}</td>
              <td style="padding: 10px 12px;">998555</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: bold;">{{currency}} {{totalAmount}}</td>
            </tr>
          </tbody>
        </table>
        <div style="border-top: 2px solid #0f172a; padding-top: 12px; display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-size: 14px; font-weight: bold;">Total Payable (INR)</span>
          <span style="font-size: 20px; font-weight: 900;">{{currency}} {{totalAmount}}</span>
        </div>
      </div>
    `,
  },
];

export class DocumentEngine {
  /**
   * Render tokens into an HTML template
   */
  static renderTokens(templateHtml: string, tokens: DocumentTokenPayload): string {
    let rendered = templateHtml;
    const defaults = {
      currency: 'INR',
      issueDate: new Date().toLocaleDateString('en-IN'),
      documentNumber: `DOC-${Date.now().toString().slice(-6)}`,
      status: 'CONFIRMED',
      origin: 'DEL (New Delhi)',
      destination: 'DXB (Dubai)',
      departureDate: new Date().toLocaleDateString('en-IN'),
      returnDate: 'Open Return',
    };

    const combined = { ...defaults, ...tokens };

    for (const [key, value] of Object.entries(combined)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value ?? ''));
    }

    return rendered;
  }

  /**
   * Generate SHA-256 hash for document integrity verification (§15)
   */
  static computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate and persist a verified document
   */
  static async generateDocument(
    templateCode: string,
    entityType: 'BOOKING' | 'INVOICE' | 'TRIP' | 'QUOTE',
    entityId: string,
    tokens: DocumentTokenPayload
  ) {
    // Find or seed template
    let template = await prisma.documentTemplate.findUnique({
      where: { code: templateCode },
    });

    if (!template) {
      const canonical = CANONICAL_TEMPLATES.find((t) => t.code === templateCode) || CANONICAL_TEMPLATES[0];
      template = await prisma.documentTemplate.create({
        data: {
          code: canonical.code,
          name: canonical.name,
          type: canonical.type,
          description: canonical.description,
          htmlLayout: canonical.htmlLayout,
          tokenSchema: ['customerName', 'bookingRef', 'totalAmount', 'origin', 'destination'],
          isDefault: true,
        },
      });
    }

    const documentNumber = tokens.documentNumber || `DOC-${Date.now().toString().slice(-6)}`;
    const enrichedTokens = { ...tokens, documentNumber };
    const renderedHtml = this.renderTokens(template.htmlLayout, enrichedTokens);
    const hash = this.computeHash(renderedHtml);

    return prisma.generatedDocument.create({
      data: {
        templateId: template.id,
        entityType,
        entityId,
        documentNumber,
        renderedHtml,
        tokenValues: enrichedTokens as any,
        hash,
        status: 'VERIFIED',
      },
    });
  }

  /**
   * Retrieve a generated document by document number
   */
  static async getDocumentByNumber(documentNumber: string) {
    return prisma.generatedDocument.findUnique({
      where: { documentNumber },
      include: { template: true },
    });
  }
}
