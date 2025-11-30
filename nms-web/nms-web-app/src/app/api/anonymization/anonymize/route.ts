// src/app/api/anonymization/anonymize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { batchAnonymizePatients } from '@/lib/firebase/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientIds, doctorId } = body;

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json(
        { error: 'patientIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!doctorId) {
      return NextResponse.json(
        { error: 'doctorId is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here
    // Verify the requesting user is the doctor or an admin

    const result = await batchAnonymizePatients(patientIds);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error anonymizing patients:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to anonymize patients',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}