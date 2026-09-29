/**
 * Travel Planet (Voyage8) — VIBE Engine Security & Correctness Test Suite
 *
 * Executable specification for the pure logic in lib/vibe/pure.ts and
 * lib/vibe/binding-engine.ts. Mirrors the production algorithms (same repo
 * convention as rbac-matrix / tenant-isolation tests, which run standalone
 * under plain `node`). Guards:
 *   1. Slug normalization + deterministic collision suffixing (§15)
 *   2. Rich-text sanitizer strips scripts/markup, never emits raw HTML (§41)
 *   3. Binding path resolution + prototype-pollution rejection (§11)
 *   4. Conditional visibility operator semantics (§12)
 *   5. Diary review-workflow state machine (§20)
 *   6. Immutable publish versioning + optimistic-concurrency conflict (§33)
 */

const assert = require('assert');

let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  \x1b[32m✓\x1b[0m ${name}`); passed++; }
  catch (e) { console.log(`  \x1b[31m✗\x1b[0m ${name}\n      ${e.message}`); failed++; }
}

/* ---- mirrored from lib/vibe/pure.ts (keep in sync) ---- */
function normalizeSlug(input) {
  return input.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 160);
}
function slugCollisionCandidate(base, isTaken) {
  if (!isTaken(base)) return base;
  for (let i = 2; i <= 50; i++) { const c = `${base}-${i}`; if (!isTaken(c)) return c; }
  return null;
}
function safeRichSegments(html) {
  const str = v => (v === null || v === undefined ? '' : String(v));
  return str(html).replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .split(/\n+/).map(s => s.trim()).filter(Boolean);
}
const DIARY_TRANSITIONS = {
  DRAFT: ['REVIEW', 'ARCHIVED'], REVIEW: ['APPROVED', 'FLAGGED', 'DRAFT'],
  APPROVED: ['PUBLISHED', 'DRAFT'], PUBLISHED: ['ARCHIVED', 'FLAGGED'],
  ARCHIVED: ['DRAFT'], FLAGGED: ['REVIEW', 'ARCHIVED'],
};
const canTransitionDiary = (from, to) => (DIARY_TRANSITIONS[from] ?? []).includes(to);
const nextPublishedVersion = pv => (pv ?? 0) + 1;
const versionConflict = (expected, current) => expected !== current;
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype', 'globalThis']);

/* ---- mirrored from lib/vibe/binding-engine.ts (keep in sync) ---- */
function resolvePath(context, path) {
  const normalized = path.startsWith('metric:') ? `metrics.${path.slice(7).replace(/:/g, '.')}` : path;
  const segments = normalized.split('.');
  let current = context;
  for (const seg of segments) {
    if (current == null || typeof current !== 'object' || BLOCKED_KEYS.has(seg)) return undefined;
    if (Array.isArray(current)) {
      const idx = Number(seg);
      if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) return undefined;
      current = current[idx];
    } else {
      current = current[seg];
    }
  }
  return current;
}
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function looseEquals(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'string') return String(a) === b;
  if (typeof a === 'string' && typeof b === 'number') return a === String(b);
  if (typeof a === 'boolean' && typeof b === 'string') return String(a) === b.toLowerCase();
  return false;
}
function evaluate(cond, ctx) {
  const actual = resolvePath(ctx, cond.field);
  const expected = cond.value;
  switch (cond.operator) {
    case 'EXISTS': return actual !== undefined && actual !== null;
    case 'TRUTHY': return Boolean(actual);
    case 'EQUALS': return looseEquals(actual, expected);
    case 'NOT_EQUALS': return !looseEquals(actual, expected);
    case 'GT': return num(actual) > num(expected);
    case 'LT': return num(actual) < num(expected);
    case 'GTE': return num(actual) >= num(expected);
    case 'LTE': return num(actual) <= num(expected);
    case 'IN': return Array.isArray(expected) && expected.some(e => looseEquals(actual, e));
    case 'NOT_IN': return Array.isArray(expected) && !expected.some(e => looseEquals(actual, e));
    default: return false;
  }
}
const evaluateAll = (conds, ctx) => conds.every(c => evaluate(c, ctx));

/* =================== tests =================== */
console.log('\n VIBE Engine Test Suite\n' + '='.repeat(50));

console.log('\n[1] Slug normalization & collision suffixing');
test('normalizes accents, spaces, punctuation to kebab-case', () => {
  assert.strictEqual(normalizeSlug(' Wayãnaad — Monsoon!! '), 'wayanaad-monsoon');
  assert.strictEqual(normalizeSlug('Kerala Backwaters'), 'kerala-backwaters');
});
test('caps length at 160 chars', () => {
  assert.ok(normalizeSlug('a'.repeat(300)).length <= 160);
});
test('empty slug normalizes to empty string', () => {
  assert.strictEqual(normalizeSlug('!!!'), '');
});
test('collision suffixing appends -2, -3 …', () => {
  const taken = new Set(['dubai', 'dubai-2']);
  assert.strictEqual(slugCollisionCandidate('dubai', t => taken.has(t)), 'dubai-3');
});
test('collision resolution reports exhaustion past -50', () => {
  assert.strictEqual(slugCollisionCandidate('x', () => true), null);
});

console.log('\n[2] Rich-text sanitizer (no raw HTML / no script)');
test('strips script tags and their contents', () => {
  const out = safeRichSegments('Hello <script>alert(1)</script> world');
  assert.ok(!out.join('').includes('alert'));
  assert.ok(!out.join('').includes('script'));
  assert.deepStrictEqual(out, ['Hello  world']);
});
test('escapes all markup into text paragraphs', () => {
  const out = safeRichSegments('<img src=x onerror=alert(1)>Title');
  assert.ok(out.every(s => !s.includes('<') && !s.includes('onerror')));
});
test('decodes entities and splits paragraphs', () => {
  assert.deepStrictEqual(safeRichSegments('A &amp; B\n\nC &lt;D&gt;'), ['A & B', 'C <D>']);
});

console.log('\n[3] Binding resolution & prototype-pollution guard');
const ctx = { destination: { name: 'Kerala', places: [{ name: 'Wayanad' }] }, metrics: { bookings: { today: 42 } } };
test('resolves dotted field path', () => assert.strictEqual(resolvePath(ctx, 'destination.name'), 'Kerala'));
test('resolves array index path', () => assert.strictEqual(resolvePath(ctx, 'destination.places.0.name'), 'Wayanad'));
test('resolves metric: prefix', () => assert.strictEqual(resolvePath(ctx, 'metric:bookings.today'), 42));
test('rejects __proto__ traversal', () => assert.strictEqual(resolvePath(ctx, '__proto__.polluted'), undefined));
test('rejects constructor traversal', () => assert.strictEqual(resolvePath(ctx, 'constructor.prototype'), undefined));
test('rejects prototype traversal', () => assert.strictEqual(resolvePath({}, 'a.prototype'), undefined));
test('missing path yields undefined (caller applies fallback)', () => assert.strictEqual(resolvePath(ctx, 'destination.missing.x'), undefined));
test('out-of-range array index yields undefined', () => assert.strictEqual(resolvePath(ctx, 'destination.places.5.name'), undefined));

console.log('\n[4] Conditional visibility operators');
test('EQUALS with loose number/string coercion', () => assert.ok(evaluate({ field: 'metrics.bookings.today', operator: 'EQUALS', value: '42' }, ctx)));
test('GT numeric comparison', () => assert.ok(evaluate({ field: 'metrics.bookings.today', operator: 'GT', value: 10 }, ctx)));
test('IN membership', () => assert.ok(evaluate({ field: 'destination.name', operator: 'IN', value: ['Kerala', 'Goa'] }, ctx)));
test('EXISTS on present value', () => assert.ok(evaluate({ field: 'destination.name', operator: 'EXISTS' }, ctx)));
test('EXISTS false on missing value', () => assert.ok(!evaluate({ field: 'destination.none', operator: 'EXISTS' }, ctx)));
test('evaluateAll uses AND semantics', () => {
  assert.ok(evaluateAll([{ field: 'destination.name', operator: 'EQUALS', value: 'Kerala' }, { field: 'metrics.bookings.today', operator: 'GTE', value: 42 }], ctx));
  assert.ok(!evaluateAll([{ field: 'destination.name', operator: 'EQUALS', value: 'Kerala' }, { field: 'metrics.bookings.today', operator: 'LT', value: 42 }], ctx));
});

console.log('\n[5] Diary review-workflow state machine');
test('DRAFT cannot jump straight to PUBLISHED', () => assert.ok(!canTransitionDiary('DRAFT', 'PUBLISHED')));
test('happy path DRAFT->REVIEW->APPROVED->PUBLISHED', () => {
  assert.ok(canTransitionDiary('DRAFT', 'REVIEW'));
  assert.ok(canTransitionDiary('REVIEW', 'APPROVED'));
  assert.ok(canTransitionDiary('APPROVED', 'PUBLISHED'));
});
test('REVIEW can be FLAGGED or returned to DRAFT', () => {
  assert.ok(canTransitionDiary('REVIEW', 'FLAGGED'));
  assert.ok(canTransitionDiary('REVIEW', 'DRAFT'));
});
test('author cannot self-approve without review (DRAFT->APPROVED blocked)', () => assert.ok(!canTransitionDiary('DRAFT', 'APPROVED')));

console.log('\n[6] Immutable publish versioning & optimistic concurrency');
test('first publish produces version 1', () => assert.strictEqual(nextPublishedVersion(null), 1));
test('subsequent publish increments', () => assert.strictEqual(nextPublishedVersion(4), 5));
test('rollback still allocates a NEW version number', () => assert.strictEqual(nextPublishedVersion(7), 8));
test('stale edit is rejected via version conflict', () => assert.ok(versionConflict(3, 5)));
test('matching version saves cleanly', () => assert.ok(!versionConflict(5, 5)));

console.log('\n' + '='.repeat(50));
console.log(`   VIBE Results: ${passed} Passed, ${failed} Failed`);
console.log('='.repeat(50) + '\n');
process.exit(failed > 0 ? 1 : 0);
