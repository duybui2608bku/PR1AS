/**
 * API Client for Admin operations
 * Uses server-side API routes to securely perform admin operations
 */

import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Get authorization header with current user's token
 */
async function getAuthHeader(): Promise<string> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  return `Bearer ${session.access_token}`;
}

/**
 * Admin Users API
 */
export const adminUsersAPI = {
  /**
   * List all users
   */
  async listUsers() {
    const authHeader = await getAuthHeader();
    const response = await fetch("/api/admin/users", {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  },

  /**
   * Ban a user
   */
  async banUser(userId: string) {
    const authHeader = await getAuthHeader();
    const response = await fetch(`/api/admin/users/${userId}/ban`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ action: "ban" }),
    });

    if (!response.ok) {
      throw new Error("Failed to ban user");
    }

    return response.json();
  },

  /**
   * Unban a user
   */
  async unbanUser(userId: string) {
    const authHeader = await getAuthHeader();
    const response = await fetch(`/api/admin/users/${userId}/ban`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ action: "unban" }),
    });

    if (!response.ok) {
      throw new Error("Failed to unban user");
    }

    return response.json();
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string) {
    const authHeader = await getAuthHeader();
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return response.json();
  },

  /**
   * Update user metadata
   */
  async updateUser(userId: string, user_metadata: Record<string, unknown>) {
    const authHeader = await getAuthHeader();
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ user_metadata }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return response.json();
  },
};

/**
 * Admin Stats API
 */
export const adminStatsAPI = {
  /**
   * Get dashboard statistics
   */
  async getStats() {
    const authHeader = await getAuthHeader();
    const response = await fetch("/api/admin/stats", {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    return response.json();
  },
};

/**
 * Admin SEO Settings API
 */
export const adminSEOAPI = {
  /**
   * Get SEO settings (public)
   */
  async getSettings() {
    const response = await fetch("/api/admin/settings/seo");

    if (!response.ok) {
      throw new Error("Failed to fetch SEO settings");
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Update SEO settings (admin only)
   */
  async updateSettings(settings: Record<string, unknown>) {
    const authHeader = await getAuthHeader();
    const response = await fetch("/api/admin/settings/seo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      throw new Error("Failed to update SEO settings");
    }

    return response.json();
  },
};
