import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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
  } catch (error) {
    console.error("Admin check failed:", error);
    return false;
  }
}

/**
 * PUT /api/admin/users/:id/ban
 * Ban a user
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const isAdmin = await checkIsAdmin(authHeader);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;
    const body = await request.json();
    const { action } = body; // 'ban' or 'unban'

    if (action === "ban") {
      // Ban user for 100 years
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "876000h",
      });

      if (error) throw error;

      return NextResponse.json({ message: "User banned successfully" });
    } else if (action === "unban") {
      // Unban user
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (error) throw error;

      return NextResponse.json({ message: "User unbanned successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating user ban status:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const isAdmin = await checkIsAdmin(authHeader);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;

    // Delete user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/:id
 * Update user metadata
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const isAdmin = await checkIsAdmin(authHeader);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = params.id;
    const body = await request.json();
    const { user_metadata } = body;

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata,
    });

    if (error) throw error;

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
