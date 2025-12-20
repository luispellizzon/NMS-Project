// src/app/api/admin/doctors/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAllDoctors, createDoctorWithAuth } from '@/lib/firebase/services/admin-service';

/**
 * GET /api/admin/doctors
 * Returns all doctors with their statistics.
 */
export async function GET() {
  try {
    // TODO: Add authentication check to verify admin role
    const doctors = await getAllDoctors();
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch doctors',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/doctors
 * Creates a new doctor with Firebase Auth and Firestore profile.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, specialty, hospital } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fullName, email, password' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check to verify admin role

    const doctorId = await createDoctorWithAuth({
      fullName,
      email,
      password,
      role: 'doctor',
    });

    return NextResponse.json({ success: true, doctorId });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create doctor',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
