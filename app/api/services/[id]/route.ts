/**
 * GET /api/services/[id]
 * Get service by ID with options
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WorkerProfileService } from '@/lib/worker/service';
import { getErrorMessage } from '@/lib/utils/common';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const service = new WorkerProfileService(supabase);

    const serviceData = await service.getServiceById(params.id);

    return NextResponse.json({
      success: true,
      data: serviceData,
    });
  } catch (error: unknown) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, 'Failed to fetch service'),
      },
      { status: 404 }
    );
  }
}
