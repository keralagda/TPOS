import { redirect as nextRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { resolveVibePath, vibeMetadata, VibePublicPage } from '@/components/vibe/public-page';

export const dynamic = 'force-dynamic';

function pathFor(slug: string) {
  return `/campaigns/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return vibeMetadata(pathFor(params.slug));
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const path = pathFor(params.slug);
  const result = await resolveVibePath(path);
  if (result.kind === 'redirect' && result.redirectPath) nextRedirect(result.redirectPath);
  return <VibePublicPage path={path} />;
}
