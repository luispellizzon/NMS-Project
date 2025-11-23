// src/app/api/anonymization/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnonymizedDataStats } from '@/lib/firebase/services';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // Verify the requesting user is a doctor or admin

    const stats = await getAnonymizedDataStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching anonymization stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dataset statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}