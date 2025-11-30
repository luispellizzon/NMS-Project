// src/app/api/anonymization/eligible-patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEligiblePatientsForAnonymization } from '@/lib/firebase/services';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] /api/anonymization/eligible-patients called');
    const body = await request.json();
    const { doctorId } = body;
    console.log('[API] Request body:', { doctorId });

    if (!doctorId) {
      console.error('[API] Missing doctorId in request');
      return NextResponse.json(
        { error: 'doctorId is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here
    // Verify the requesting user is the doctor or an admin

    console.log('[API] Calling getEligiblePatientsForAnonymization...');
    const patients = await getEligiblePatientsForAnonymization(doctorId);
    console.log('[API] Found patients:', patients.length);

    return NextResponse.json({
      patients,
      total: patients.length,
    });
  } catch (error) {
    console.error('[API] Error fetching eligible patients:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch eligible patients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}