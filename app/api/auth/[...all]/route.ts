import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Authentication is managed by Clerk.' });
}

export async function POST() {
  return NextResponse.json({ message: 'Authentication is managed by Clerk.' });
}
