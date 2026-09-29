import { NextRequest, NextResponse } from 'next/server';
import { DocumentEngine } from '@/lib/dms/document-engine';
import { z } from 'zod';

const generateDocumentSchema = z.object({
  templateCode: z.string().default('AIRLINE_E_VOUCHER_CANONICAL'),
  entityType: z.enum(['BOOKING', 'INVOICE', 'TRIP', 'QUOTE']),
  entityId: z.string(),
  tokens: z.object({
    customerName: z.string(),
    customerEmail: z.string().email().optional(),
    bookingRef: z.string(),
    totalAmount: z.union([z.string(), z.number()]),
    currency: z.string().default('INR'),
    origin: z.string().optional(),
    destination: z.string().optional(),
    departureDate: z.string().optional(),
    returnDate: z.string().optional(),
    status: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = generateDocumentSchema.parse(body);

    const doc = await DocumentEngine.generateDocument(
      validated.templateCode,
      validated.entityType,
      validated.entityId,
      validated.tokens
    );

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
