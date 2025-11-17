/**
 * Script to create demo admin account
 * Run this with: npx tsx scripts/create-admin.ts
 *
 * IMPORTANT: This is for development only. Remove before production!
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables!");
  console.error("Make sure you have:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error(
    "- SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard > Settings > API)"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const adminEmail = "admin@pr1as.com";
  const adminPassword = "Admin@123456";

  console.log("Creating admin user...");
  console.log("Email:", adminEmail);
  console.log("Password:", adminPassword);
  console.log("");

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(
      (u) => u.email === adminEmail
    );

    if (existingUser) {
      console.log("⚠️  Admin user already exists!");
      console.log("Updating user metadata...");

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            role: "admin",
            full_name: "Admin Demo",
          },
        }
      );

      if (updateError) {
        console.error("❌ Error updating user:", updateError.message);
        process.exit(1);
      }

      console.log("✅ Admin user updated successfully!");
    } else {
      // Create new admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: "admin",
          full_name: "Admin Demo",
        },
      });

      if (error) {
        console.error("❌ Error creating admin:", error.message);
        process.exit(1);
      }

      console.log("✅ Admin user created successfully!");
      console.log("User ID:", data.user?.id);
    }

    console.log("");
    console.log("═══════════════════════════════════════");
    console.log("📋 ADMIN CREDENTIALS");
    console.log("═══════════════════════════════════════");
    console.log("Email:    ", adminEmail);
    console.log("Password: ", adminPassword);
    console.log("═══════════════════════════════════════");
    console.log("");
    console.log("🔗 Access admin panel at: http://localhost:3000/admin");
    console.log("");
    console.log(
      "⚠️  IMPORTANT: Remove this account before going to production!"
    );
    console.log("");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

createAdminUser();
