// src/app/api/admin/support/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAllSupportRequests } from '@/lib/firebase/services/support-service';
import { SupportRequestStatus } from '@/types/admin';

/**
 * GET /api/admin/support
 * Returns all support requests with optional status filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as SupportRequestStatus | null;

    // TODO: Add authentication check to verify admin role
    const { requests } = await getAllSupportRequests(status || undefined);
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching support requests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch support requests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
