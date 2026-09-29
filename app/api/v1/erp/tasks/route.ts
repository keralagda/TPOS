import { NextRequest, NextResponse } from 'next/server';
import { ERPEngine } from '@/lib/erp/erp-engine';

export async function GET(request: NextRequest) {
  const tasks = ERPEngine.generateBookingTasks({
    id: 'bk_tp892401',
    bookingNumber: 'TP-892401',
    customerName: 'Rahul Sharma',
    hasFlight: true,
    hasHotel: true,
    hasTransfer: true,
    hasExperience: true,
    requiresVisa: true
  });

  return NextResponse.json({
    success: true,
    totalTasks: tasks.length,
    tasks
  });
}
