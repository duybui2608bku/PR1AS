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
 * GET /api/admin/settings/seo
 * Get SEO settings
 */
export async function GET() {
  try {
    // Public endpoint - anyone can read SEO settings
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("key", "seo_settings")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({ data: data?.value || null });
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings/seo
 * Update SEO settings (admin only)
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const isAdmin = await checkIsAdmin(authHeader);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const settings = body.settings;

    // Try to update first
    const { error: updateError } = await supabaseAdmin
      .from("site_settings")
      .update({ value: settings, updated_at: new Date().toISOString() })
      .eq("key", "seo_settings");

    // If no rows updated, insert
    if (updateError?.code === "PGRST116") {
      const { error: insertError } = await supabaseAdmin
        .from("site_settings")
        .insert({
          key: "seo_settings",
          value: settings,
        });

      if (insertError) throw insertError;
    } else if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving SEO settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
