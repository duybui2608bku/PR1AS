/**
 * GET /api/services/categories
 * Get all service categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WorkerProfileService } from '@/lib/worker/service';
import { getErrorMessage } from '@/lib/utils/common';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const service = new WorkerProfileService(supabase);

    const categories = await service.getServiceCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: unknown) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, 'Failed to fetch service categories'),
      },
      { status: 500 }
    );
  }
}
