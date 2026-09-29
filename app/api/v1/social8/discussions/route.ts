import { NextRequest, NextResponse } from 'next/server';
import { CircleService } from '@/lib/social8/circle-service';
import { z } from 'zod';

const createDiscussionSchema = z.object({
  circleId: z.string(),
  authorId: z.string(),
  title: z.string().min(5),
  content: z.string().min(10),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createDiscussionSchema.parse(body);
    const discussion = await CircleService.createDiscussion(validated);
    return NextResponse.json({ success: true, data: discussion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
