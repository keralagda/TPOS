/**
 * VIBE — Pure, dependency-free logic extracted so security-critical rules
 * (slug normalization, collision suffixing, rich-text sanitization, diary
 * workflow transitions, version numbering) can be unit-tested without a
 * database or the Next.js runtime. Production modules import from here;
 * this module imports nothing from Prisma or React.
 */

/* ---------------- Slug rules (§15) ---------------- */

export function normalizeSlug(input: string): string {
  const s = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
  return s;
}

/** Deterministic collision suffix: base, base-2 … base-50 (or null if exhausted). */
export function slugCollisionCandidate(base: string, isTaken: (candidate: string) => boolean): string | null {
  if (!isTaken(base)) return base;
  for (let i = 2; i <= 50; i++) {
    const candidate = `${base}-${i}`;
    if (!isTaken(candidate)) return candidate;
  }
  return null;
}

/* ---------------- Rich text sanitizer (§41) ---------------- */

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

/** Strip script tags and all markup, decode entities, split into safe paragraphs. */
export function safeRichSegments(html: unknown): string[] {
  return str(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean);
}

/* ---------------- Diary review workflow (§20) ---------------- */

export type DiaryState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED' | 'FLAGGED';

export const DIARY_TRANSITIONS: Record<DiaryState, DiaryState[]> = {
  DRAFT: ['REVIEW', 'ARCHIVED'],
  REVIEW: ['APPROVED', 'FLAGGED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'DRAFT'],
  PUBLISHED: ['ARCHIVED', 'FLAGGED'],
  ARCHIVED: ['DRAFT'],
  FLAGGED: ['REVIEW', 'ARCHIVED'],
};

export function canTransitionDiary(from: DiaryState, to: DiaryState): boolean {
  return (DIARY_TRANSITIONS[from] ?? []).includes(to);
}

/* ---------------- Immutable publish versioning (§33) ---------------- */

/** Next immutable published version number given the current published pointer. */
export function nextPublishedVersion(publishedVersion: number | null | undefined): number {
  return (publishedVersion ?? 0) + 1;
}

/** Optimistic concurrency: a save succeeds only when expected equals current. */
export function versionConflict(expectedVersion: number, currentVersion: number): boolean {
  return expectedVersion !== currentVersion;
}

/* ---------------- Prototype-pollution guard (§11) ---------------- */

export const BLOCKED_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype', 'globalThis']);
