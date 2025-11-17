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

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login
 * Login with email/password
 *
 * Body: { email, password }
 */
export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Attempt to sign in
    const { data: authData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Check user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("role, status")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      // Profile doesn't exist - this shouldn't happen with proper signup
      return NextResponse.json(
        {
          error: "NO_PROFILE",
          message: "Email này chưa có tài khoản. Vui lòng đăng ký.",
          userId: authData.user.id,
          email: authData.user.email,
        },
        { status: 404 }
      );
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

    // Return user data with profile
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
        status: profile.status,
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
