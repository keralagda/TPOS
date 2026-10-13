import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/login(.*)',
  '/register(.*)',
  '/verify-email(.*)',
  '/forgot-password(.*)',
  '/reset-password(.*)',
  '/destinations(.*)',
  '/packages(.*)',
  '/ideas(.*)',
  '/help(.*)',
  '/places(.*)',
  '/journeys(.*)',
  '/trips(.*)',
  '/campaigns(.*)',
  '/diaries(.*)',
  '/voice(.*)',
  '/trip-planner(.*)',
  '/checkout(.*)',
  '/api/public(.*)',
  '/api/v1/voice(.*)',
  '/api/v1/search(.*)',
  '/api/v1/places(.*)',
  '/api/v1/journeys(.*)',
  '/api/v1/destinations(.*)',
  '/api/v1/packages(.*)',
  '/api/v1/ideas(.*)',
  '/api/v1/media(.*)',
  '/api/v1/social8/circles(.*)',
  '/api/v1/voyage8(.*)',
  '/api/v1/health(.*)',
]);

const rawClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isBrokenVercelLiveKey =
  rawClerkKey &&
  (rawClerkKey.includes('Y2xlcmsudHBvc3gudmVyY2VsLmFwcCQ') ||
    rawClerkKey.includes('dmVyY2VsLmFwcCQ'));

const publishableKey =
  rawClerkKey && !isBrokenVercelLiveKey
    ? rawClerkKey
    : 'pk_test_ZGVjZW50LWZhd24tNjg5MC5jbGVyay5hY2NvdW50cy5kZXYk';

const rawSecretKey = process.env.CLERK_SECRET_KEY;
const secretKey =
  rawSecretKey && !isBrokenVercelLiveKey && !rawSecretKey.startsWith('sk_live_')
    ? rawSecretKey
    : 'sk_test_yjQ6FIi9lDmWB746pv2vLThs8z1nieIOGeWRrt8JSg';

export default clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    publishableKey,
    secretKey,
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
