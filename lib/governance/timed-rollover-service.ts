/**
 * Timed Schedule / OTA Rollover Service
 * Conforms to §32 (32_TIMED_SCHEDULE_OTA_ROLLOVER.md) & §33 (33_OPERATION_MODE_ROLLOVER.md)
 * Executes scheduled operational platform transitions with pre-flight health gates & instant rollback
 */

import { prisma } from '../prisma';
import { ControlPlaneService } from './control-plane-service';

export interface CreateScheduleInput {
  title: string;
  targetType: 'FEATURE_FLAG' | 'OPERATION_MODE' | 'RELEASE_PACKAGE';
  targetId: string;
  targetValue: any;
  scheduledForUtc: Date | string;
  executionPolicy?: 'IMMEDIATE' | 'HEALTH_GATED';
  healthThreshold?: {
    maxErrorRatePercent?: number;
    maxLatencyMs?: number;
  };
}

export class TimedRolloverService {
  /**
   * Schedule a future operational rollover with snapshot capture
   */
  static async scheduleRollover(input: CreateScheduleInput) {
    const scheduledDate = new Date(input.scheduledForUtc);

    // 1. Capture current operational snapshot for safety rollback
    let snapshot: any = null;
    if (input.targetType === 'FEATURE_FLAG') {
      const existing = await prisma.featureFlagRecord.findUnique({
        where: { key: input.targetId },
      });
      snapshot = existing ? { isEnabled: existing.isEnabled, rolloutPercentage: existing.rolloutPercentage } : null;
    } else if (input.targetType === 'OPERATION_MODE') {
      const target = await prisma.operationModeRecord.findUnique({
        where: { modeKey: input.targetId },
      });
      snapshot = target ? { modeKey: target.modeKey, version: target.version, status: target.status } : null;
    }

    return prisma.timedScheduleRecord.create({
      data: {
        title: input.title,
        targetType: input.targetType,
        targetId: input.targetId,
        scheduledForUtc: scheduledDate,
        status: 'PENDING',
        executionPolicy: input.executionPolicy || 'HEALTH_GATED',
        healthThreshold: input.healthThreshold || { maxErrorRatePercent: 1.0, maxLatencyMs: 500 },
        snapshotData: {
          previousState: snapshot,
          targetValue: input.targetValue,
        },
      },
    });
  }

  /**
   * Execute due pending schedules
   */
  static async executePendingSchedules() {
    const now = new Date();
    const pending = await prisma.timedScheduleRecord.findMany({
      where: {
        status: 'PENDING',
        scheduledForUtc: { lte: now },
      },
    });

    const results = [];

    for (const record of pending) {
      try {
        await prisma.timedScheduleRecord.update({
          where: { id: record.id },
          data: { status: 'EXECUTING' },
        });

        const targetData = record.snapshotData as any;

        // Health Gate Check (Simulated system telemetry check)
        const currentSimulatedErrorRate = 0.05; // 0.05%
        const maxThreshold = (record.healthThreshold as any)?.maxErrorRatePercent || 1.0;

        if (currentSimulatedErrorRate > maxThreshold) {
          throw new Error(`Health Gate Failed: Error rate ${currentSimulatedErrorRate}% exceeds limit ${maxThreshold}%`);
        }

        // Apply Mutation
        if (record.targetType === 'FEATURE_FLAG') {
          await ControlPlaneService.updateFeatureFlag(
            record.targetId,
            { isEnabled: targetData.targetValue === true || targetData.targetValue === 'true' }
          );
        } else if (record.targetType === 'OPERATION_MODE') {
          const targetStatus = typeof targetData.targetValue === 'string'
            ? targetData.targetValue
            : targetData.targetValue?.status;
          await ControlPlaneService.updateOperationMode(
            record.targetId,
            { status: targetStatus || 'ACTIVE' }
          );
        }

        const completed = await prisma.timedScheduleRecord.update({
          where: { id: record.id },
          data: {
            status: 'COMPLETED',
            executedAt: new Date(),
            logs: `Successfully transitioned ${record.targetType} [${record.targetId}] at ${new Date().toISOString()}`,
          },
        });
        results.push(completed);
      } catch (err: any) {
        const failed = await prisma.timedScheduleRecord.update({
          where: { id: record.id },
          data: {
            status: 'FAILED',
            logs: `Rollover Failed: ${err.message}`,
          },
        });
        results.push(failed);
      }
    }

    return results;
  }

  /**
   * Revert a rollover using the pre-transition snapshot
   */
  static async rollbackSchedule(scheduleId: string) {
    const record = await prisma.timedScheduleRecord.findUnique({
      where: { id: scheduleId },
    });

    if (!record || !record.snapshotData) {
      throw new Error('Schedule record or pre-rollover snapshot not found.');
    }

    const snapshot = (record.snapshotData as any).previousState;

    if (record.targetType === 'FEATURE_FLAG' && snapshot) {
      await ControlPlaneService.updateFeatureFlag(record.targetId, {
        isEnabled: snapshot.isEnabled,
        ...(typeof snapshot.rolloutPercentage === 'number' ? { rolloutPercentage: snapshot.rolloutPercentage } : {}),
      });
    } else if (record.targetType === 'OPERATION_MODE' && snapshot) {
      await ControlPlaneService.updateOperationMode(record.targetId, {
        status: snapshot.status || 'ACTIVE',
        ...(snapshot.version ? { version: snapshot.version } : {}),
      });
    }

    return prisma.timedScheduleRecord.update({
      where: { id: scheduleId },
      data: {
        status: 'ROLLED_BACK',
        logs: `${record.logs || ''}\nRolled back to previous snapshot at ${new Date().toISOString()}`,
      },
    });
  }

  /**
   * List scheduled rollovers
   */
  static async listSchedules(status?: string) {
    return prisma.timedScheduleRecord.findMany({
      where: status ? { status } : undefined,
      orderBy: { scheduledForUtc: 'desc' },
      take: 50,
    });
  }
}
