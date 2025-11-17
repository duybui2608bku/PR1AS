import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logout user (handled client-side with Supabase)
 *
 * This endpoint exists for consistency but the actual logout
 * should be done client-side using supabase.auth.signOut()
 */
export async function POST() {
  try {
    // Logout is handled client-side
    // This endpoint can be used for server-side cleanup if needed
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
