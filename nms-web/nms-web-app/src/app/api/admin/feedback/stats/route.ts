// src/app/api/admin/feedback/stats/route.ts

import { NextResponse } from 'next/server';
import { getFeedbackStats } from '@/lib/firebase/services/feedback-service';

/**
 * GET /api/admin/feedback/stats
 * Returns feedback statistics.
 */
export async function GET() {
  try {
    // TODO: Add authentication check to verify admin role
    const stats = await getFeedbackStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch feedback statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
