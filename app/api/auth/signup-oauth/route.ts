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

interface SignUpOAuthRequest {
  role: UserRole;
  provider: "google";
  redirectTo?: string;
}

/**
 * POST /api/auth/signup-oauth
 * Initiate OAuth signup with role selection
 *
 * Body: { role, provider, redirectTo? }
 * Returns: { url } - Redirect URL for OAuth flow
 */
export async function POST(request: Request) {
  try {
    const body: SignUpOAuthRequest = await request.json();
    const { role, provider, redirectTo } = body;

    // Validate input
    if (!role || !provider) {
      return NextResponse.json(
        { error: "Role and provider are required" },
        { status: 400 }
      );
    }

    if (!["client", "worker"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'client' or 'worker'" },
        { status: 400 }
      );
    }

    if (provider !== "google") {
      return NextResponse.json(
        { error: "Only Google OAuth is supported" },
        { status: 400 }
      );
    }

    // Generate OAuth URL with role in state
    const callbackUrl = redirectTo || `${request.headers.get("origin")}/auth/callback`;

    // The role will be passed via query params to the callback
    const callbackWithRole = `${callbackUrl}?role=${role}`;

    return NextResponse.json({
      success: true,
      provider,
      role,
      callbackUrl: callbackWithRole,
      message: "Use Supabase client to call signInWithOAuth on the frontend",
    });
  } catch (error) {
    console.error("Error in signup-oauth:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth signup" },
      { status: 500 }
    );
  }
}
