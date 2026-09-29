import { NextRequest, NextResponse } from 'next/server';
import { StudioProjectStore } from '@/lib/crude8/studio/project-store';
import { StudioModuleGenerator } from '@/lib/crude8/studio/module-generator';
import { StudioModuleProject, StudioMode } from '@/lib/crude8/studio/studio-types';
import { CRUDE8Module } from '@/lib/crude8/types';
import { resolveStudioActor } from '@/lib/crude8/studio/api-user';

const MODE_TO_MODULE: Record<StudioMode, CRUDE8Module> = {
  CRM: 'CRM', TMS: 'TMS', ERP: 'ERP', FINANCE: 'FINANCE',
  DMS: 'DMS8', CMS: 'VIBE8', SEO: 'HESTIA8', SOCIAL: 'SOCIAL8'
};

// GET /api/crude8/studio/projects — list all built modules
export async function GET() {
  const projects = StudioProjectStore.listProjects();
  return NextResponse.json({
    success: true,
    data: projects,
    stats: {
      total: projects.length,
      deployed: projects.filter(p => p.status === 'DEPLOYED').length,
      drafts: projects.filter(p => p.status === 'DRAFT').length,
      byOrigin: projects.reduce<Record<string, number>>((acc, p) => {
        acc[p.origin] = (acc[p.origin] || 0) + 1;
        return acc;
      }, {})
    }
  });
}

// POST /api/crude8/studio/projects — create a module project
// Body: { name?, description?, mode?, prompt? , templateId? } — prompt/template trigger generation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const actor = resolveStudioActor(req, body.user);
    let project: StudioModuleProject;

    if (body.templateId) {
      project = StudioModuleGenerator.installTemplate(body.templateId, actor.userId);
    } else if (body.prompt) {
      project = StudioModuleGenerator.generateFromPrompt(String(body.prompt), actor.userId);
    } else {
      const mode: StudioMode = body.mode || 'CRM';
      project = StudioModuleGenerator.generateFromPrompt(
        body.description || `Create a ${String(body.name || 'Custom Entity')} module`,
        actor.userId
      );
      if (body.name) project.name = body.name;
      project.origin = 'MANUAL';
      project.mode = mode;
      project.module = MODE_TO_MODULE[mode] || 'CRM';
    }

    StudioProjectStore.createProject(project, actor.userId);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Studio project creation failed' },
      { status: 400 }
    );
  }
}
