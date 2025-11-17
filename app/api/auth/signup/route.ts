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

export type UserRole = "client" | "worker";

interface SignUpRequest {
  email: string;
  password: string;
  role: UserRole;
}

/**
 * POST /api/auth/signup
 * Register a new user with email/password
 *
 * Body: { email, password, role }
 */
export async function POST(request: Request) {
  try {
    const body: SignUpRequest = await request.json();
    const { email, password, role } = body;

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!["client", "worker"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'client' or 'worker'" },
        { status: 400 }
      );
    }

    // Check if email already exists in user_profiles with different role
    const { data: existingProfile, error: profileCheckError } =
      await supabaseAdmin
        .from("user_profiles")
        .select("role, status")
        .eq("email", email)
        .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      // PGRST116 = not found, which is OK
      throw profileCheckError;
    }

    if (existingProfile) {
      if (existingProfile.role !== role && existingProfile.role !== "admin") {
        return NextResponse.json(
          {
            error: "EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_ROLE",
            message: `Email này đã được đăng ký với vai trò ${existingProfile.role.toUpperCase()}. Bạn không thể tạo tài khoản ${role.toUpperCase()} với email này.`,
            existingRole: existingProfile.role,
          },
          { status: 409 }
        );
      }

      if (existingProfile.status === "banned") {
        return NextResponse.json(
          {
            error: "ACCOUNT_BANNED",
            message: "Tài khoản này đã bị khóa",
          },
          { status: 403 }
        );
      }
    }

    // Create user in Supabase Auth
    const { data: authData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for now
        user_metadata: {
          role,
        },
      });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        return NextResponse.json(
          {
            error: "EMAIL_ALREADY_EXISTS",
            message: "Email đã được đăng ký",
          },
          { status: 409 }
        );
      }
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        role,
        status: "active",
      });

    if (profileError) {
      // Rollback: delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
