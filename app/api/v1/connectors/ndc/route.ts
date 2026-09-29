import { NextRequest, NextResponse } from 'next/server';
import { NDCConnector } from '@/lib/connectors/adapters/ndc-connector';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin') || 'DEL';
    const destination = searchParams.get('destination') || 'DXB';
    const departureDate = searchParams.get('departureDate') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const airline = (searchParams.get('airline') || 'INDIGO') as 'INDIGO' | 'EMIRATES';

    const connector = new NDCConnector(airline);
    await connector.authenticate();
    const offers = await connector.getFlightOffers(origin, destination, departureDate);

    const totalAvoidedSurcharges = offers.reduce((acc, curr) => acc + curr.gdsSurchargeAvoidedINR, 0);

    return NextResponse.json({
      success: true,
      protocol: 'IATA NDC 21.3 Direct Distribution',
      carrier: airline,
      route: `${origin} → ${destination}`,
      departureDate,
      totalOffers: offers.length,
      offers,
      gtmAdvantage: {
        averageSavingsPerBookingINR: Math.round(totalAvoidedSurcharges / (offers.length || 1)),
        distributionFeeBypassed: true,
        unbundledAncillariesIncluded: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'NDC Direct flight query failed'
    }, { status: 500 });
  }
}
