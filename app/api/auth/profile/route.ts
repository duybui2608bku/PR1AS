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
 * GET /api/auth/profile
 * Get current user's profile
 *
 * Requires: Authorization header with Bearer token
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        return NextResponse.json(
          {
            error: "NO_PROFILE",
            message: "Profile not found",
            userId: user.id,
            email: user.email,
          },
          { status: 404 }
        );
      }
      throw profileError;
    }

    // Check if banned
    if (profile.status === "banned") {
      return NextResponse.json(
        {
          error: "ACCOUNT_BANNED",
          message: "Tài khoản này đã bị khóa",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/profile
 * Update current user's profile (limited fields)
 *
 * Requires: Authorization header with Bearer token
 * Body: { ... updatable fields ... }
 * Note: role and status cannot be changed by user
 */
export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Prevent updating role and status
    if (body.role || body.status) {
      return NextResponse.json(
        { error: "Cannot update role or status" },
        { status: 403 }
      );
    }

    // For now, we don't have other fields to update
    // This is a placeholder for future profile fields
    return NextResponse.json({
      success: true,
      message: "Profile updated (no fields to update yet)",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
