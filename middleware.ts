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

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
