/**
 * Admin utilities and helpers
 */

import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Check if user is admin
    const isAdminUser =
      user.email === "admin@pr1as.com" || user.user_metadata?.role === "admin";

    return isAdminUser;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get site settings from database
 */
export async function getSiteSettings() {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "seo_settings")
      .single();

    if (error) throw error;

    return data?.value || null;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}

/**
 * Update site settings
 */
export async function updateSiteSettings(settings: Record<string, unknown>) {
  const supabase = getSupabaseClient();

  try {
    // Try update first
    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ value: settings, updated_at: new Date().toISOString() })
      .eq("key", "seo_settings");

    // If no rows updated, insert
    if (updateError?.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("site_settings")
        .insert({
          key: "seo_settings",
          value: settings,
        });

      if (insertError) throw insertError;
    } else if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating site settings:", error);
    return { success: false, error };
  }
}

/**
 * Admin-only database operations require service role
 * These should be called from API routes, not client-side
 */

export interface AdminStats {
  totalUsers: number;
  activeWorkers: number;
  totalJobs: number;
  revenue: number;
}

/**
 * Get admin dashboard statistics
 * Note: This is a placeholder. Implement actual queries based on your schema
 */
export async function getAdminStats(): Promise<AdminStats> {
  // TODO: Implement actual database queries
  // This requires proper tables: users, workers, jobs, transactions, etc.

  return {
    totalUsers: 0,
    activeWorkers: 0,
    totalJobs: 0,
    revenue: 0,
  };
}

/**
 * Format user role for display
 */
export function formatUserRole(role?: string): string {
  if (!role) return "User";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Get role color for tags
 */
export function getRoleColor(role?: string): string {
  const roleColors: Record<string, string> = {
    admin: "red",
    worker: "blue",
    client: "green",
  };
  return roleColors[role || "user"] || "default";
}

/**
 * Check if user is banned
 */
export function isUserBanned(bannedUntil?: string): boolean {
  if (!bannedUntil) return false;
  return new Date(bannedUntil) > new Date();
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
