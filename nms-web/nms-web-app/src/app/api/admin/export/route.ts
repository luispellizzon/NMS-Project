// src/app/api/admin/export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getFormattedExport } from '@/lib/firebase/services/data-export-service';
import { DataExportOptions } from '@/types/admin';

/**
 * POST /api/admin/export
 * Generates and returns exported data in the requested format.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const options: DataExportOptions = {
      doctorIds: body.doctorIds,
      includePatients: body.includePatients ?? true,
      includeRiskAssessments: body.includeRiskAssessments ?? true,
      format: body.format || 'csv',
      dateRange: body.dateRange ? {
        from: new Date(body.dateRange.from),
        to: new Date(body.dateRange.to),
      } : undefined,
    };

    // TODO: Add authentication check to verify admin role

    const { data, mimeType, filename } = await getFormattedExport(options);

    // Return the data as a downloadable file
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
