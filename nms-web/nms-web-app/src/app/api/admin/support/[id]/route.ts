// src/app/api/admin/support/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupportRequestById, updateSupportRequestStatus } from '@/lib/firebase/services/support-service';
import { SupportRequestStatus } from '@/types/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/support/[id]
 * Returns a specific support request.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // TODO: Add authentication check to verify admin role

    const supportRequest = await getSupportRequestById(id);

    if (!supportRequest) {
      return NextResponse.json(
        { success: false, error: 'Support request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, request: supportRequest });
  } catch (error) {
    console.error('Error fetching support request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch support request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/support/[id]
 * Updates a support request's status.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, resolvedBy } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: status' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to verify admin role

    await updateSupportRequestStatus(id, status as SupportRequestStatus, resolvedBy);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating support request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update support request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
