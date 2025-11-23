// src/app/api/model-retraining/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRetrainingHistory } from '@/lib/firebase/services';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // Verify the requesting user is a doctor or admin

    const history = await getRetrainingHistory();

    return NextResponse.json({
      history,
      total: history.length,
    });
  } catch (error) {
    console.error('Error fetching retraining history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch retraining history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}