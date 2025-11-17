import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkIsAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");

  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (!user) return false;

    return (
      user.email === "admin@pr1as.com" || user.user_metadata?.role === "admin"
    );
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const isAdmin = await checkIsAdmin(authHeader);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get total users count
    const {
      data: { users },
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) throw usersError;

    const totalUsers = users?.length || 0;

    // Count workers (users with role = 'worker')
    const activeWorkers =
      users?.filter((u) => u.user_metadata?.role === "worker").length || 0;

    // TODO: Replace with actual queries when you have jobs/transactions tables
    // For now, return mock data
    const stats = {
      totalUsers,
      activeWorkers,
      totalJobs: 0, // TODO: Query from jobs table
      revenue: 0, // TODO: Query from transactions table
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
