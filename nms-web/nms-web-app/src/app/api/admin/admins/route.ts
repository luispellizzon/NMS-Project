// src/app/api/admin/admins/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAllAdmins, createAdminWithAuth } from '@/lib/firebase/services/admin-service';

/**
 * GET /api/admin/admins
 * Returns all administrators.
 */
export async function GET() {
  try {
    // TODO: Add authentication check to verify admin role
    const admins = await getAllAdmins();
    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admins',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/admins
 * Creates a new administrator.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fullName, email, password' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to verify admin role

    const adminId = await createAdminWithAuth({ fullName, email, password });

    return NextResponse.json({ success: true, adminId });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create admin',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
