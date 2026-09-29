/**
 * DMS8 DOCUMENT TEMPLATE ENGINE & VISUAL BUILDER
 * Generates dynamic business travel documents: PDF, HTML, Email, WhatsApp, and Digital Cards.
 */

import { TravelDocumentType } from './types';

export type OutputDocumentFormat = 'HTML' | 'PDF' | 'EMAIL' | 'WHATSAPP' | 'DIGITAL_CARD' | 'PRINT';

export interface TemplateComponentNode {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'TABLE' | 'SIGNATURE' | 'QR_CODE' | 'BARCODE' | 'MAP' | 'JOURNEY_TIMELINE' | 'PAYMENT_SUMMARY' | 'DYNAMIC_FIELD';
  config: Record<string, any>;
}

export interface DocumentTemplateDefinition {
  code: string;
  name: string;
  category: 'TRAVEL' | 'BUSINESS' | 'OPERATIONS';
  documentType: TravelDocumentType;
  description: string;
  components: TemplateComponentNode[];
  supportedFormats: OutputDocumentFormat[];
  sampleVariables: Record<string, any>;
  htmlTemplate: string;
  whatsappTemplate: string;
}

export const CANONICAL_DMS_TEMPLATES: DocumentTemplateDefinition[] = [
  {
    code: 'TPL_LIVING_ITINERARY_V1',
    name: 'Living Itinerary & Traveler Journey Dossier',
    category: 'TRAVEL',
    documentType: 'ITINERARY',
    description: 'Dynamic day-by-day travel plan with real-time weather alerts and concierge hooks.',
    components: [
      { id: 'c1', type: 'IMAGE', config: { src: '{{journey.heroImage}}', height: 260 } },
      { id: 'c2', type: 'TEXT', config: { content: '{{journey.title}}', size: '24px', weight: 'bold' } },
      { id: 'c3', type: 'JOURNEY_TIMELINE', config: { days: '{{journey.days}}' } },
      { id: 'c4', type: 'QR_CODE', config: { data: 'https://travelplanet.io/journeys/{{journey.slug}}' } },
      { id: 'c5', type: 'SIGNATURE', config: { signer: 'Travel Planet Curator' } }
    ],
    supportedFormats: ['HTML', 'PDF', 'EMAIL', 'WHATSAPP', 'DIGITAL_CARD'],
    sampleVariables: {
      customer: { name: 'Rahul Kumar', email: 'rahul.k@example.com' },
      journey: { title: 'Kerala Monsoon & Soul Awakening', slug: 'kerala-monsoon-soul', days: 6, destination: 'Kerala' },
      booking: { reference: 'TP-KL-2026-984', departureDate: '2026-10-12' },
      concierge: { name: 'Maya Nair', phone: '+91-9876543210' }
    },
    htmlTemplate: `
      <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; color: #0f172a;">
        <div style="background: linear-gradient(135deg, #0284c7, #4f46e5); padding: 32px; color: white;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 999px;">TRAVEL PLANET LIVING DOSSIER</span>
          <h1 style="margin: 12px 0 4px; font-size: 26px; font-weight: 900;">{{journey.title}}</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Curated exclusively for {{customer.name}} • Booking Ref: {{booking.reference}}</p>
        </div>
        <div style="padding: 32px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Departure Date</span>
              <div style="font-size: 16px; font-weight: 800; margin-top: 4px; color: #0f172a;">{{booking.departureDate}}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">24/7 Concierge</span>
              <div style="font-size: 16px; font-weight: 800; margin-top: 4px; color: #0284c7;">{{concierge.name}} ({{concierge.phone}})</div>
            </div>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #475569;">
            <p><strong>Adaptive Sensor Notice:</strong> This Living Itinerary is connected to real-time weather and crowd sensors. Any adjustments will automatically reflect on your mobile concierge app.</p>
          </div>
        </div>
      </div>
    `,
    whatsappTemplate: `✨ *TRAVEL PLANET LIVING ITINERARY* ✨\n\nDear {{customer.name}},\nYour living itinerary for *{{journey.title}}* ({{journey.days}} Days) is ready!\n\n📅 Departure: {{booking.departureDate}}\n📍 Ref: {{booking.reference}}\n🛎️ Concierge: {{concierge.name}} ({{concierge.phone}})\n\n📲 Access your interactive mobile pass: https://travelplanet.io/dossier/{{booking.reference}}`
  },
  {
    code: 'TPL_GST_TAX_INVOICE_V1',
    name: 'Voyage8 Tax Invoice (GST Compliant)',
    category: 'BUSINESS',
    documentType: 'TAX_INVOICE',
    description: 'Official SAC 998555 travel agency invoice with CGST/SGST/IGST breakdown and QR validation.',
    components: [
      { id: 'c1', type: 'TEXT', config: { content: 'TAX INVOICE', size: '20px' } },
      { id: 'c2', type: 'PAYMENT_SUMMARY', config: { amount: '{{payment.amount}}', currency: '{{payment.currency}}' } },
      { id: 'c3', type: 'QR_CODE', config: { data: 'https://einvoice.gst.gov.in/verify/{{invoice.irn}}' } }
    ],
    supportedFormats: ['HTML', 'PDF', 'EMAIL', 'PRINT'],
    sampleVariables: {
      customer: { name: 'Rahul Kumar', gstin: '32AABCT1332L1Z5', address: 'Bangalore, Karnataka' },
      invoice: { number: 'INV-2026-0891', date: '2026-09-28', irn: 'a1b2c3d4e5f67890' },
      booking: { reference: 'TP-KL-2026-984', service: 'Experiential Tour Package' },
      payment: { taxableAmount: 71186, cgst: 6407, sgst: 6407, totalAmount: 84000, currency: 'INR' }
    },
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; color: #1e293b;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 16px;">
          <div>
            <h2 style="margin: 0; color: #0284c7; font-size: 22px;">TRAVEL PLANET PRIVATE LIMITED</h2>
            <p style="margin: 4px 0 0; font-size: 11px; color: #64748b;">GSTIN: 32AABCT9999M1ZQ • SAC Code: 998555 (Tour Operator Services)</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 18px;">TAX INVOICE</h3>
            <p style="margin: 4px 0 0; font-size: 12px; font-weight: bold;">{{invoice.number}}</p>
          </div>
        </div>
        <div style="margin: 20px 0;">
          <p><strong>Billed To:</strong> {{customer.name}} (GSTIN: {{customer.gstin}})</p>
          <p><strong>Booking Ref:</strong> {{booking.reference}} • {{booking.service}}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px;">
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Description</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Taxable Amount</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">CGST (9%)</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">SGST (9%)</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Total</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">{{booking.service}}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">₹{{payment.taxableAmount}}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">₹{{payment.cgst}}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">₹{{payment.sgst}}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">₹{{payment.totalAmount}}</td>
          </tr>
        </table>
      </div>
    `,
    whatsappTemplate: `🧾 *TRAVEL PLANET TAX INVOICE*\nInvoice No: {{invoice.number}}\nCustomer: {{customer.name}}\nTotal: ₹{{payment.totalAmount}}\nDownload PDF: https://travelplanet.io/invoices/{{invoice.number}}`
  },
  {
    code: 'TPL_SUPPLIER_CONFIRMATION_V1',
    name: 'Hotel & Transporter Operation Voucher',
    category: 'OPERATIONS',
    documentType: 'TOUR_VOUCHER',
    description: 'B2B confirmation dispatch with driver contact, room tier, and meal plan instructions.',
    components: [
      { id: 'c1', type: 'TEXT', config: { content: 'SUPPLIER DISPATCH ORDER' } },
      { id: 'c2', type: 'DYNAMIC_FIELD', config: { field: 'supplier.name' } }
    ],
    supportedFormats: ['HTML', 'PDF', 'WHATSAPP', 'PRINT'],
    sampleVariables: {
      supplier: { name: 'Kumarakom Lake Resort', contactPerson: 'Front Desk Manager' },
      booking: { reference: 'TP-KL-2026-984', guestName: 'Sunita Mehra', checkIn: '2026-10-12', nights: 3 },
      instructions: 'Early check-in requested at 11:00 AM. Welcome traditional coconut water and Ayurvedic foot massage.'
    },
    htmlTemplate: `
      <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0284c7;">HOTEL CONFIRMATION & DISPATCH VOUCHER</h2>
        <p><strong>Supplier:</strong> {{supplier.name}} (Attn: {{supplier.contactPerson}})</p>
        <p><strong>Guest:</strong> {{booking.guestName}} • Check-In: {{booking.checkIn}} ({{booking.nights}} Nights)</p>
        <div style="background: #f8fafc; padding: 12px; border-left: 4px solid #0284c7; margin-top: 12px;">
          <strong>Special Instructions:</strong> {{instructions}}
        </div>
      </div>
    `,
    whatsappTemplate: `🏨 *HOTEL SERVICE VOUCHER*\nTo: {{supplier.name}}\nGuest: {{booking.guestName}}\nCheck-in: {{booking.checkIn}}\nNotes: {{instructions}}`
  }
];

export class DMS8TemplateEngine {
  /**
   * List all canonical document templates
   */
  static listTemplates(): DocumentTemplateDefinition[] {
    return CANONICAL_DMS_TEMPLATES;
  }

  /**
   * Get Template by Code
   */
  static getTemplate(code: string): DocumentTemplateDefinition | undefined {
    return CANONICAL_DMS_TEMPLATES.find(t => t.code === code);
  }

  /**
   * Interpolate nested tokens: {{customer.name}}, {{journey.title}}
   */
  static interpolate(templateStr: string, context: Record<string, any>): string {
    return templateStr.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
      const parts = path.split('.');
      let current: any = context;
      for (const part of parts) {
        if (current === undefined || current === null) return match;
        current = current[part];
      }
      return current !== undefined && current !== null ? String(current) : match;
    });
  }

  /**
   * Render Template to Target Format
   */
  static renderTemplate(
    templateCode: string,
    variables: Record<string, any>,
    format: OutputDocumentFormat = 'HTML'
  ): { format: OutputDocumentFormat; content: string; renderedAt: string } {
    const template = this.getTemplate(templateCode);
    if (!template) {
      throw new Error(`Template ${templateCode} not found in DMS8 registry`);
    }

    let rendered = '';
    if (format === 'WHATSAPP') {
      rendered = this.interpolate(template.whatsappTemplate, variables);
    } else {
      rendered = this.interpolate(template.htmlTemplate, variables);
    }

    return {
      format,
      content: rendered.trim(),
      renderedAt: new Date().toISOString()
    };
  }
}
