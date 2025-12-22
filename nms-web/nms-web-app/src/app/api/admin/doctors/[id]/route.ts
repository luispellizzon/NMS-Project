// src/app/api/admin/doctors/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDoctorById, updateDoctorByAdmin, deleteDoctorSoft } from '@/lib/firebase/services/admin-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/doctors/[id]
 * Returns a specific doctor's profile.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // TODO: Add authentication check to verify admin role

    const doctor = await getDoctorById(id);

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, doctor });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch doctor',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/doctors/[id]
 * Updates a doctor's profile.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Add authentication check to verify admin role

    await updateDoctorByAdmin(id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update doctor',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/doctors/[id]
 * Soft deletes a doctor (sets isActive to false).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // TODO: Add authentication check to verify admin role

    await deleteDoctorSoft(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete doctor',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
