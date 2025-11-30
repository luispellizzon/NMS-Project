// src/app/api/model-retraining/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { triggerModelRetraining } from '@/lib/firebase/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId } = body;

    if (!doctorId) {
      return NextResponse.json(
        { error: 'doctorId is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here
    // Verify the requesting user is the doctor or an admin

    const result = await triggerModelRetraining(doctorId);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error triggering model retraining:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger model retraining',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}