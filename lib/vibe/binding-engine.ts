/**
 * VIBE — Data Binding Engine (§11) & Conditional Visibility (§12)
 *
 * Security contract:
 * - Bindings are dotted paths resolved against a server-assembled, whitelisted
 *   DataContext. There is NO expression language, NO function calls, NO SQL,
 *   NO JS evaluation. Paths never traverse prototype chains.
 * - Collection scoping (tenant/workspace/role) is enforced where the DataContext
 *   is built, not here; this module only reads what it is given.
 */

import { Condition, DataBinding } from './types';
import { BLOCKED_KEYS } from './pure';

export type DataContextRoots =
  | 'entity' | 'destination' | 'place' | 'journey' | 'diary' | 'product'
  | 'collections' | 'metrics' | 'insights' | 'currentUser' | 'role'
  | 'workspace' | 'runtime';

export type DataContext = Partial<Record<DataContextRoots, unknown>> & {
  /** raw map for server-resolved roots */
  [root: string]: unknown;
};

export class BindingEngine {
  /**
   * Resolve a dotted path like "destination.places.0.name" or
   * "metric:bookings.today" (stored as context key). Returns undefined when
   * missing — callers apply the binding's fallback value.
   */
  static resolvePath(context: DataContext, path: string): unknown {
    // metric paths arrive as "metrics.bookings.today" or "metric:bookings.today"
    const normalized = path.startsWith('metric:') ? `metrics.${path.slice(7).replace(/:/g, '.')}` : path;
    const segments = normalized.split('.');
    let current: unknown = context;
    for (const seg of segments) {
      if (current == null || typeof current !== 'object' || BLOCKED_KEYS.has(seg)) return undefined;
      if (Array.isArray(current)) {
        const idx = Number(seg);
        if (!Number.isInteger(idx) || idx < 0 || idx >= current.length) return undefined;
        current = current[idx];
      } else {
        current = (current as Record<string, unknown>)[seg];
      }
    }
    return current;
  }

  /** Apply all bindings of a node onto its props. Unresolvable -> fallback. */
  static applyBindings(
    props: Record<string, unknown>,
    bindings: DataBinding[],
    context: DataContext
  ): { props: Record<string, unknown>; failures: string[] } {
    const out = { ...props };
    const failures: string[] = [];
    for (const b of bindings) {
      const value = BindingEngine.resolvePath(context, b.path);
      if (value === undefined) {
        failures.push(b.path);
        if (b.fallback !== undefined) out[b.targetProp] = b.fallback;
      } else {
        out[b.targetProp] = value;
      }
    }
    return { props: out, failures };
  }
}

// ---------- Conditions (§12) ----------

export class ConditionEvaluator {
  static evaluate(condition: Condition, context: DataContext): boolean {
    const actual = BindingEngine.resolvePath(context, condition.field);
    const expected = condition.value;

    switch (condition.operator) {
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

  /** Node renders only when all conditions pass (AND) */
  static evaluateAll(conditions: Condition[], context: DataContext): boolean {
    return conditions.every(c => ConditionEvaluator.evaluate(c, context));
  }
}

function looseEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'string') return String(a) === b;
  if (typeof a === 'string' && typeof b === 'number') return a === String(b);
  if (typeof a === 'boolean' && typeof b === 'string') return String(a) === b.toLowerCase();
  return false;
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') { const n = Number(v); return Number.isNaN(n) ? -Infinity : n; }
  return -Infinity;
}
