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

interface CreateProfileRequest {
  role: UserRole;
}

/**
 * POST /api/auth/create-profile
 * Create profile for authenticated user who doesn't have one yet
 * (e.g., after OAuth login)
 *
 * Requires: Authorization header with Bearer token
 * Body: { role }
 */
export async function POST(request: Request) {
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

    const body: CreateProfileRequest = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !["client", "worker"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'client' or 'worker'" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        {
          error: "PROFILE_ALREADY_EXISTS",
          message: "Profile already exists",
          role: existingProfile.role,
        },
        { status: 409 }
      );
    }

    // Check if email already has a different role
    const { data: emailCheck } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("email", user.email!)
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

    // Create profile
    const { error: createError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: user.id,
        email: user.email!,
        role,
        status: "active",
      });

    if (createError) {
      throw createError;
    }

    // Update user metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { role },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        role,
        status: "active",
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
