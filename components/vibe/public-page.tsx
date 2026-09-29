/**
 * VIBE — shared shell for public dynamic routes (§16, §37, §38).
 * Server-only; never imports editor code.
 */

import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/travel/Navbar';
import { Footer } from '@/components/travel/Footer';
import { VibeRenderer } from './VibeRenderer';
import { renderPublicPath, type PublicRender } from '@/lib/vibe/page-render';

/** Dedupe the resolver call between generateMetadata and the page render. */
export const resolveVibePath = cache((path: string): Promise<PublicRender> => renderPublicPath(path));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelplanet.voyage8.com';

export async function vibeMetadata(path: string): Promise<Metadata> {
  const result = await resolveVibePath(path);
  if (result.kind !== 'render' || !result.seo) {
    return { title: 'Page not found' };
  }
  return {
    title: `${result.seo.title} | Travel Planet Voyage8`,
    description: result.seo.description || undefined,
    alternates: { canonical: `${SITE_URL}${result.seo.canonical}` },
    openGraph: {
      title: result.seo.title,
      description: result.seo.description || undefined,
      url: `${SITE_URL}${result.seo.canonical}`,
      type: 'website',
    },
  };
}

export async function VibePublicPage({ path }: { path: string }) {
  const result = await resolveVibePath(path);
  if (result.kind === 'redirect') {
    // 301 handled by caller (route file) so Next emits a real redirect
    notFound();
  }
  if (result.kind !== 'render' || !result.resolved) notFound();

  const { resolved, breadcrumbs } = result;
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      {breadcrumbs && breadcrumbs.length > 1 && (
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
          <ol className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <li>
              <Link href="/" className="inline-flex items-center gap-1 hover:text-sky-600">
                <Home className="w-3 h-3" /> Home
              </Link>
            </li>
            {breadcrumbs.map(crumb => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-slate-300" />
                {crumb.href === resolved.canonicalPath ? (
                  <span className="text-slate-800 font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-sky-600">{crumb.label}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <main id="main-content" className="flex-1">
        <VibeRenderer nodes={resolved.nodes} />
      </main>
      {resolved.diagnostics.length > 0 && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6">
          <p className="text-[10px] text-slate-400">{resolved.diagnostics.length} content block(s) used fallback rendering.</p>
        </div>
      )}
      <Footer />
    </div>
  );
}
