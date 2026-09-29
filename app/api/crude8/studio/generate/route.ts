import { NextRequest, NextResponse } from 'next/server';
import { StudioModuleGenerator } from '@/lib/crude8/studio/module-generator';
import { StudioProjectStore } from '@/lib/crude8/studio/project-store';
import { resolveStudioActor } from '@/lib/crude8/studio/api-user';

// GET /api/crude8/studio/generate — template marketplace catalog
export async function GET() {
  return NextResponse.json({ success: true, data: StudioModuleGenerator.listTemplates() });
}

// POST /api/crude8/studio/generate — AI CRUD generation from natural language
// Body: { prompt } | { templateId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actor = resolveStudioActor(req, body.user);

    const project = body.templateId
      ? StudioModuleGenerator.installTemplate(String(body.templateId), actor.userId)
      : StudioModuleGenerator.generateFromPrompt(String(body.prompt || ''), actor.userId);

    StudioProjectStore.createProject(project, actor.userId);

    return NextResponse.json({
      success: true,
      data: {
        project,
        generation: {
          entity: project.entityName,
          fields: project.fields.length,
          views: 4,
          actions: project.actions.length,
          workflows: project.workflows.length,
          permissionRules: project.permissions.rules.length,
          events: project.events.length,
          automations: project.automations.length,
          aiActions: project.aiActions.length,
          reports: project.reports.length
        }
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Generation failed' }, { status: 400 });
  }
}
