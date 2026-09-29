/**
 * VIBE — Visual Intelligence & Builder Engine
 * Core structured configuration types. Zod-validated at every boundary.
 * Doctrine: Build once. Compose everywhere. Bind to anything. Govern centrally. Render contextually.
 *
 * SECURITY: compositions are pure data. No executable code, no SQL, no template
 * expressions beyond the whitelisted binding grammar in binding-engine.ts.
 */

import { z } from 'zod';

// ---------- Enums (mirror Prisma ExperienceType/Status) ----------

export const EXPERIENCE_TYPES = [
  'PAGE', 'LANDING_PAGE', 'DESTINATION', 'PLACE', 'JOURNEY', 'DIARY', 'GUIDE',
  'DASHBOARD', 'WORKSPACE', 'PORTAL', 'FORM', 'BOOKING_FLOW', 'SEARCH',
  'CHECKOUT', 'REPORT', 'CAMPAIGN', 'APPLICATION',
] as const;
export type ExperienceTypeValue = (typeof EXPERIENCE_TYPES)[number];

export const EXPERIENCE_STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const;
export type ExperienceStatusValue = (typeof EXPERIENCE_STATUSES)[number];

export const VISIBILITIES = ['PUBLIC', 'PRIVATE', 'WORKSPACE', 'ORGANIZATION'] as const;

export const BREAKPOINTS = ['desktop', 'tablet', 'mobile'] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

// ---------- Binding grammar (whitelisted — §11) ----------
// {{ path.to.field }}                        -> data binding
// {{ currentUser.name }} / {{ role }} / ...  -> runtime context
// {{ collection.field }}                     -> entity/collection field
// {{ metric:bookings.today }}                -> whitelisted metric id
// Deliberately NOT supported: operators, function calls, SQL, JS.

const BINDING_PATH = /^[a-zA-Z_][a-zA-Z0-9_:.\-]*$/;

export const bindingExpressionSchema = z
  .string()
  .regex(/^\{\{\s*[a-zA-Z_][a-zA-Z0-9_:.\-]*\s*\}\}$/, 'Invalid binding expression');

export type BindingKind = 'FIELD' | 'COLLECTION' | 'METRIC' | 'CONTEXT' | 'STATIC';

export const dataBindingSchema = z.object({
  id: z.string(),
  kind: z.enum(['FIELD', 'COLLECTION', 'METRIC', 'CONTEXT']),
  /** e.g. "destination.name", "currentUser.fullName", "metric:bookings.today" */
  path: z.string().regex(BINDING_PATH, 'Binding path must be a dotted whitelisted path'),
  /** prop on the component this binding feeds */
  targetProp: z.string().min(1),
  fallback: z.unknown().optional(),
});
export type DataBinding = z.infer<typeof dataBindingSchema>;

// ---------- Condition system (§12) ----------

export const conditionOperators = [
  'EQUALS', 'NOT_EQUALS', 'GT', 'LT', 'GTE', 'LTE', 'IN', 'NOT_IN', 'EXISTS', 'TRUTHY',
] as const;

export interface Condition {
  field: string;
  operator: (typeof conditionOperators)[number];
  value?: unknown;
}

export const conditionSchema: z.ZodType<Condition> = z.lazy(() => z.object({
  field: z.string().regex(BINDING_PATH),
  operator: z.enum(conditionOperators),
  value: z.unknown().optional(),
}));

export const visibilityRuleSchema = z.object({
  /** ALL conditions must pass for the node to render */
  all: z.array(conditionSchema).default([]),
  /** legacy single-condition shortcut */
  any: z.array(conditionSchema).default([]),
});
export type VisibilityRule = z.infer<typeof visibilityRuleSchema>;

// ---------- Action system (§13) ----------

export const ACTION_TYPES = [
  'NAVIGATE', 'OPEN_MODAL', 'SUBMIT_FORM', 'SEARCH', 'BOOK', 'SAVE', 'SHARE',
  'ADD_TO_JOURNEY', 'REMOVE_FROM_JOURNEY', 'APPROVE', 'REJECT', 'ASSIGN',
  'START_WORKFLOW', 'CALL_API', 'TRIGGER_AI',
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const actionSchema = z.object({
  id: z.string(),
  type: z.enum(ACTION_TYPES),
  /** structured target: api route name, workflow code, journey id... */
  target: z.string().min(1),
  payload: z.record(z.unknown()).default({}),
  /** permission code required at execution time (enforced server-side) */
  requiredPermission: z.string().optional(),
  /** consequential actions render a confirmation gate */
  consequential: z.boolean().default(false),
});
export type ActionConfig = z.infer<typeof actionSchema>;

// ---------- Composition tree ----------

export const responsiveOverrideSchema = z.object({
  breakpoint: z.enum(BREAKPOINTS),
  hidden: z.boolean().optional(),
  width: z.number().int().min(1).max(12).optional(),
  order: z.number().int().optional(),
  style: z.record(z.string()).optional(),
});
export type ResponsiveOverride = z.infer<typeof responsiveOverrideSchema>;

/** Style must reference design tokens; raw CSS is limited to a safe subset */
export const nodeStyleSchema = z.object({
  tokenSet: z.string().optional(),
  variants: z.array(z.string()).default([]),
  spacing: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  /** allowlisted inline styles only — never arbitrary CSS from composition */
  width: z.enum(['full', 'contained', 'narrow']).optional(),
});
export type NodeStyle = z.infer<typeof nodeStyleSchema>;

export const compositionNodeSchema: z.ZodType<CompositionNode, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    /** reference into COMPONENT_REGISTRY or SECTION_REGISTRY (mutually exclusive) */
    componentKey: z.string().optional(),
    sectionKey: z.string().optional(),
    /** reusable block reference (versioned) */
    reusableId: z.string().optional(),
    name: z.string().optional(),
    locked: z.boolean().default(false),
    hidden: z.boolean().default(false),
    props: z.record(z.unknown()).default({}),
    bindings: z.array(dataBindingSchema).default([]),
    visibility: visibilityRuleSchema.optional(),
    actions: z.array(actionSchema).default([]),
    responsive: z.array(responsiveOverrideSchema).default([]),
    style: nodeStyleSchema.default({ variants: [] }),
    children: z.array(compositionNodeSchema).default([]),
  })
);

export interface CompositionNode {
  id: string;
  componentKey?: string;
  sectionKey?: string;
  reusableId?: string;
  name?: string;
  locked: boolean;
  hidden: boolean;
  props: Record<string, unknown>;
  bindings: DataBinding[];
  visibility?: VisibilityRule;
  actions: ActionConfig[];
  responsive: ResponsiveOverride[];
  style: NodeStyle;
  children: CompositionNode[];
}

export const compositionSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  nodes: z.array(compositionNodeSchema),
});
export type Composition = z.infer<typeof compositionSchema>;

// ---------- Data sources (§11) ----------

export const dataSourceSchema = z.object({
  id: z.string(),
  /** only server-registered resolvers may be referenced */
  resolver: z.string().min(1),
  params: z.record(z.unknown()).default({}),
  cacheHintSeconds: z.number().int().min(0).max(3600).default(60),
  requiredPermission: z.string().optional(),
});
export type DataSourceConfig = z.infer<typeof dataSourceSchema>;

// ---------- Experience create/update payloads ----------

export const createExperienceSchema = z.object({
  name: z.string().min(2).max(140),
  type: z.enum(EXPERIENCE_TYPES),
  templateId: z.string().optional(),
  slug: z.string().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case').optional(),
  visibility: z.enum(VISIBILITIES).default('PRIVATE'),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  composition: compositionSchema.optional(),
});
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;

export const updateCompositionSchema = z.object({
  expectedVersion: z.number().int().min(1),
  composition: compositionSchema,
  changeNote: z.string().max(500).optional(),
});
export type UpdateCompositionInput = z.infer<typeof updateCompositionSchema>;

export const publishSchema = z.object({
  experienceId: z.string(),
  changeNote: z.string().max(500).default(''),
});

export const rollbackSchema = z.object({
  experienceId: z.string(),
  targetVersion: z.number().int().min(1),
  reason: z.string().max(500),
});

// ---------- Helpers ----------

export const DEFAULT_NODE: Omit<CompositionNode, 'id'> = {
  locked: false,
  hidden: false,
  props: {},
  bindings: [],
  actions: [],
  responsive: [],
  style: { variants: [] },
  children: [],
};
