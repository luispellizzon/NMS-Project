// src/app/api/admin/feedback/route.ts

import { NextResponse } from 'next/server';
import { getAllFeedback } from '@/lib/firebase/services/feedback-service';

/**
 * GET /api/admin/feedback
 * Returns all feedback from mobile app users.
 */
export async function GET() {
  try {
    // TODO: Add authentication check to verify admin role
    const { feedback } = await getAllFeedback({ limit: 100 });
    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
