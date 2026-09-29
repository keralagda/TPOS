import { NextResponse } from 'next/server';
import { StudioProjectStore } from '@/lib/crude8/studio/project-store';
import { StudioDeploymentEngine } from '@/lib/crude8/studio/deployment-engine';
import { StudioSandboxRuntime } from '@/lib/crude8/studio/sandbox-runtime';
import { StudioModuleGenerator } from '@/lib/crude8/studio/module-generator';

// GET /api/crude8/studio/analytics — studio-wide telemetry
export async function GET() {
  const projects = StudioProjectStore.listProjects();
  const deployments = StudioDeploymentEngine.listDeployments();
  const sandboxes = StudioSandboxRuntime.listSandboxes();
  const templates = StudioModuleGenerator.listTemplates();

  const versionsTotal = projects.reduce((sum, p) => sum + StudioProjectStore.getHistory(p.projectId).length, 0);

  return NextResponse.json({
    success: true,
    data: {
      projects: {
        total: projects.length,
        byStatus: projects.reduce<Record<string, number>>((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {}),
        byMode: projects.reduce<Record<string, number>>((acc, p) => {
          acc[p.mode] = (acc[p.mode] || 0) + 1;
          return acc;
        }, {}),
        byOrigin: projects.reduce<Record<string, number>>((acc, p) => {
          acc[p.origin] = (acc[p.origin] || 0) + 1;
          return acc;
        }, {})
      },
      versioning: {
        totalVersions: versionsTotal,
        avgVersionsPerProject: projects.length ? Math.round((versionsTotal / projects.length) * 10) / 10 : 0
      },
      deployment: {
        total: deployments.length,
        pending: deployments.filter(d => d.status === 'PENDING_APPROVAL').length,
        deployed: deployments.filter(d => d.status === 'DEPLOYED').length,
        rejected: deployments.filter(d => d.status === 'REJECTED').length,
        auditIntegrity: StudioDeploymentEngine.verifyDeploymentAudit()
      },
      simulation: {
        activeSandboxes: sandboxes.length,
        liveRuntimeModules: StudioDeploymentEngine.listDeployedModules().length
      },
      marketplace: {
        templatesAvailable: templates.length,
        templateInstalls: templates.reduce((sum, t) => sum + t.installs, 0)
      }
    }
  });
}
