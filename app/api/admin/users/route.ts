import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Check if user is admin
 */
async function checkIsAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "");

  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (!user) return false;

    // Check admin status
    return (
      user.email === "admin@pr1as.com" || user.user_metadata?.role === "admin"
    );
  } catch (error) {
    console.error("Admin check failed:", error);
    return false;
  }
}

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const isAdmin = await checkIsAdmin(authHeader);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // List all users using admin API
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    );
  }
}
