import { NextRequest, NextResponse } from 'next/server';
import { RouteGuard } from '@/lib/auth/middleware-guard';
import { UniversalSearchEngine } from '@/lib/search/universal-search';

export const GET = RouteGuard.protectApi('dashboard.view', async (req, user) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';

  const results = UniversalSearchEngine.search(q, user);

  return NextResponse.json({
    success: true,
    query: q,
    totalResults: results.length,
    results,
  });
});
