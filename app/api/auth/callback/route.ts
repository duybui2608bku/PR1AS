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
 * POST /api/auth/callback
 * Handle OAuth callback and create/update profile
 *
 * Body: { userId, email, role }
 * This should be called after OAuth redirect on the client
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, role } = body;

    // Validate input
    if (!userId || !email) {
      return NextResponse.json(
        { error: "User ID and email are required" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } =
      await supabaseAdmin
        .from("user_profiles")
        .select("role, status")
        .eq("id", userId)
        .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      throw profileCheckError;
    }

    // Case A: Profile doesn't exist - create new
    if (!existingProfile) {
      if (!role) {
        return NextResponse.json(
          {
            error: "NO_PROFILE_NO_ROLE",
            message: "Email này chưa có tài khoản. Bạn muốn đăng ký Client hay Worker?",
            userId,
            email,
          },
          { status: 404 }
        );
      }

      if (!["client", "worker"].includes(role)) {
        return NextResponse.json(
          { error: "Role must be either 'client' or 'worker'" },
          { status: 400 }
        );
      }

      // Check if email already exists with different role
      const { data: emailCheck } = await supabaseAdmin
        .from("user_profiles")
        .select("role")
        .eq("email", email)
        .single();

      if (emailCheck && emailCheck.role !== role && emailCheck.role !== "admin") {
        return NextResponse.json(
          {
            error: "EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_ROLE",
            message: `Email này đã được đăng ký với vai trò ${emailCheck.role.toUpperCase()}. Bạn không thể tạo tài khoản ${role.toUpperCase()} với email này.`,
            existingRole: emailCheck.role,
          },
          { status: 409 }
        );
      }

      // Create new profile
      const { error: createError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          id: userId,
          email,
          role,
          status: "active",
        });

      if (createError) {
        throw createError;
      }

      return NextResponse.json({
        success: true,
        created: true,
        user: {
          id: userId,
          email,
          role,
          status: "active",
        },
      });
    }

    // Case B: Profile exists but different role
    if (role && existingProfile.role !== role && existingProfile.role !== "admin") {
      return NextResponse.json(
        {
          error: "EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_ROLE",
          message: `Email này đã được đăng ký với vai trò ${existingProfile.role.toUpperCase()}. Bạn không thể tạo tài khoản ${role.toUpperCase()} với email này.`,
          existingRole: existingProfile.role,
        },
        { status: 409 }
      );
    }

    // Case C: Profile exists and is banned
    if (existingProfile.status === "banned") {
      return NextResponse.json(
        {
          error: "ACCOUNT_BANNED",
          message: "Tài khoản này đã bị khóa",
        },
        { status: 403 }
      );
    }

    // Case D: Valid existing profile
    return NextResponse.json({
      success: true,
      created: false,
      user: {
        id: userId,
        email,
        role: existingProfile.role,
        status: existingProfile.status,
      },
    });
  } catch (error) {
    console.error("Error in callback:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
