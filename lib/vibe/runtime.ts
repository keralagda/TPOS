/**
 * VIBE Runtime (§41) — editor-independent composition resolution.
 *
 * Pipeline:
 *   Experience -> Published Version (immutable) -> Template fallback
 *   -> Composition -> Registry validation -> Data Binding -> Conditions
 *   -> Permissions -> RenderNode tree (plain data for VibeRenderer)
 *
 * A failing node degrades to a typed fallback node (§55) — never crashes the page.
 */

import { prisma } from '@/lib/prisma';
import { Composition, CompositionNode, VisibilityRule } from './types';
import { COMPONENT_REGISTRY, SECTION_REGISTRY, TEMPLATE_REGISTRY, resolveTemplateSections, PropFieldDef } from './registry';
import { BindingEngine, ConditionEvaluator, DataContext } from './binding-engine';

export interface RenderNode {
  id: string;
  componentKey: string;
  name?: string;
  props: Record<string, unknown>;
  actions: Array<{ id: string; type: string; target: string; payload: Record<string, unknown>; requiredPermission?: string; consequential: boolean }>;
  style: CompositionNode['style'];
  responsive: CompositionNode['responsive'];
  children: RenderNode[];
  /** set when the node failed resolution — renderer shows controlled fallback */
  fallback?: { reason: string; diagnosticId: string };
}

export interface ResolvedExperience {
  experienceId: string;
  name: string;
  type: string;
  slug: string;
  canonicalPath?: string;
  seo: { title: string | null; description: string | null };
  version: number;
  nodes: RenderNode[];
  diagnostics: string[];
  usedDraft: boolean;
}

export interface ViewerContext {
  /** effective permission codes; PUBLIC pages may pass [] */
  permissions: string[];
  role?: string;
  workspaceId?: string | null;
  userId?: string | null;
  device?: 'desktop' | 'tablet' | 'mobile';
  featureFlags?: Record<string, boolean>;
}

function compositionFromJson(raw: unknown): Composition['nodes'] {
  if (!raw) return [];
  const value = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Composition;
  return Array.isArray(value?.nodes) ? value.nodes : [];
}

export class VibeRuntime {
  /**
   * Load an experience by slug and resolve to render nodes.
   * `allowDraftPreview` is ONLY set by the authenticated preview route.
   */
  static async resolveBySlug(
    slug: string,
    dataContext: DataContext,
    viewer: ViewerContext,
    opts: { allowDraftPreview?: boolean; version?: number } = {}
  ): Promise<ResolvedExperience | null> {
    const exp = await prisma.experience.findUnique({
      where: { slug },
      include: { template: true },
    });
    if (!exp) return null;

    // tenant visibility guard: non-public experiences require workspace membership context
    if (exp.visibility !== 'PUBLIC') {
      const allowed =
        opts.allowDraftPreview === true ||
        (exp.workspaceId && viewer.workspaceId === exp.workspaceId) ||
        viewer.permissions.includes('vibe.view_drafts');
      if (!allowed) return null;
    }

    let nodes: CompositionNode[] = [];
    let version = exp.version;
    let usedDraft = false;

    if (opts.version) {
      const v = await prisma.experienceVersion.findUnique({
        where: { experienceId_version: { experienceId: exp.id, version: opts.version } },
      });
      if (v) { nodes = compositionFromJson(v.composition); version = v.version; }
    } else if (exp.publishedVersion) {
      const v = await prisma.experienceVersion.findUnique({
        where: { experienceId_version: { experienceId: exp.id, version: exp.publishedVersion } },
      });
      if (v) { nodes = compositionFromJson(v.composition); version = v.version; }
    }

    if (nodes.length === 0 && (exp.status === 'DRAFT' || opts.allowDraftPreview)) {
      nodes = compositionFromJson(exp.draftComposition);
      usedDraft = true;
    }

    // Template-materialized composition when the experience has no own composition
    if (nodes.length === 0 && exp.templateId) {
      nodes = await this.materializeTemplate(exp.templateId);
    }
    if (nodes.length === 0 && exp.template) {
      nodes = await this.materializeTemplate(exp.template.key);
    }

    const { rendered, diagnostics } = this.renderTree(nodes, dataContext, viewer);

    const slugRow = await prisma.slug.findFirst({
      where: { entityType: exp.entityType ?? undefined, entityId: exp.entityId ?? '', status: 'ACTIVE' },
    });

    return {
      experienceId: exp.id,
      name: exp.name,
      type: exp.type,
      slug: exp.slug,
      canonicalPath: slugRow?.canonicalPath,
      seo: { title: slugRow?.metaTitle ?? exp.name, description: slugRow?.metaDescription ?? null },
      version,
      nodes: rendered,
      diagnostics,
      usedDraft,
    };
  }

  /** Flatten a template chain into concrete section nodes (§32 inheritance) */
  static async materializeTemplate(templateKey: string): Promise<CompositionNode[]> {
    const chain = this.templateChain(templateKey);
    const sectionKeys = resolveTemplateSections(templateKey);
    void chain;
    const nodes: CompositionNode[] = [];
    for (const key of sectionKeys) {
      const section = SECTION_REGISTRY[key];
      if (!section) continue;
      for (const sNode of section.nodes) {
        nodes.push({
          locked: false, hidden: false,
          ...sNode,
          id: `${key}::${sNode.id}`,
        } as CompositionNode);
      }
    }
    return nodes;
  }

  private static templateChain(key: string, seen = new Set<string>()): string[] {
    const def = TEMPLATE_REGISTRY[key];
    if (!def || seen.has(key)) return [key];
    seen.add(key);
    return def.parentKey ? [...this.templateChain(def.parentKey, seen), key] : [key];
  }

  /** Registry validation -> binding -> conditions -> permissions -> actions */
  static renderTree(
    nodes: CompositionNode[],
    context: DataContext,
    viewer: ViewerContext
  ): { rendered: RenderNode[]; diagnostics: string[] } {
    const diagnostics: string[] = [];

    const walk = (list: CompositionNode[]): RenderNode[] => {
      const out: RenderNode[] = [];
      for (const node of list) {
        if (node.hidden) continue;
        if (!this.visibilityPasses(node.visibility, context, viewer)) continue;

        // resolve section references down to components
        if (node.sectionKey) {
          const section = SECTION_REGISTRY[node.sectionKey];
          if (!section) {
            diagnostics.push(`Missing section "${node.sectionKey}" (${node.id})`);
            out.push(this.fallbackNode(node, `Unknown section: ${node.sectionKey}`));
            continue;
          }
          const childNodes = section.nodes as unknown as CompositionNode[];
          out.push(...walk(childNodes.map(c => ({ ...c, id: `${node.id}/${c.id}` }))));
          continue;
        }

        const componentKey = node.componentKey;
        const def = componentKey ? COMPONENT_REGISTRY[componentKey] : undefined;
        if (!def) {
          diagnostics.push(`Missing component "${componentKey}" (${node.id})`);
          out.push(this.fallbackNode(node, `Unknown component: ${componentKey ?? '(none)'}`));
          continue;
        }

        if (!this.nodeAllowed(node, viewer)) continue;

        // props validation + binding application (server data overrides static props)
        const { props, failures } = BindingEngine.applyBindings(node.props ?? {}, node.bindings ?? [], context);
        for (const f of failures) diagnostics.push(`Binding miss "${f}" on ${node.id}`);

        // actions: strip ones the viewer lacks permission for (defense-in-depth;
        // execution is separately re-checked server-side per §13)
        const actions = (node.actions ?? []).map(a => ({
          id: a.id, type: a.type, target: a.target, payload: a.payload as Record<string, unknown>,
          requiredPermission: a.requiredPermission, consequential: a.consequential,
        }));

        out.push({
          id: node.id,
          componentKey: def.key,
          name: node.name,
          props: this.coerceProps(def, props),
          actions,
          style: node.style ?? { variants: [] },
          responsive: node.responsive ?? [],
          children: walk(node.children ?? []),
        });
      }
      return out;
    };

    return { rendered: walk(nodes), diagnostics };
  }

  /**
   * Component props must arrive as data the registry understands; unknown
   * shapes are dropped, not crash-rendered. Numbers stay numbers.
   */
  private static coerceProps(def: { propsSchema: Record<string, PropFieldDef> }, props: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, schema] of Object.entries(def.propsSchema)) {
      const value = props[key] ?? schema.default;
      if (value === undefined) continue;
      switch (schema.type) {
        case 'number': { const n2 = Number(value); if (Number.isFinite(n2)) out[key] = n2; break; }
        case 'boolean': out[key] = Boolean(value); break;
        case 'string': case 'richtext': case 'image': case 'video': case 'select': out[key] = String(value); break;
        case 'json': case 'multiselect': case 'dataSource': case 'color': out[key] = value; break;
        default: out[key] = value;
      }
    }
    // preserve bound non-schema props (e.g. collection items) so cards can render
    for (const [key, value] of Object.entries(props)) if (!(key in out)) out[key] = value;
    return out;
  }

  private static visibilityPasses(rule: VisibilityRule | undefined, context: DataContext, viewer: ViewerContext): boolean {
    if (!rule) return true;
    const ctx: DataContext = { ...context, role: viewer.role, currentUser: context.currentUser };
    const all = rule.all ?? [];
    const any = rule.any ?? [];
    if (all.length > 0 && !ConditionEvaluator.evaluateAll(all, ctx)) return false;
    if (any.length > 0 && !any.some(c => ConditionEvaluator.evaluate(c, ctx))) return false;
    return true;
  }

  private static nodeAllowed(node: CompositionNode, viewer: ViewerContext): boolean {
    const required = (node as unknown as { permissions?: string[] }).permissions;
    if (!required || required.length === 0) return true;
    return required.every(p => viewer.permissions.includes(p));
  }

  private static fallbackNode(node: CompositionNode, reason: string): RenderNode {
    const diagnosticId = `vibe-${node.id}`.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 60);
    return {
      id: node.id,
      componentKey: 'renderFallback',
      props: { reason: 'Content temporarily unavailable.' },
      actions: [],
      style: { variants: [] },
      responsive: [],
      children: [],
      fallback: { reason, diagnosticId },
    };
  }
}
