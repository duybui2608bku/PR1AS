-- Fix infinite recursion in user_profiles RLS policies
-- The issue: Policies query user_profiles to check admin role, which triggers policy evaluation again

-- Step 1: Create security definer functions to bypass RLS
-- These functions bypass RLS, preventing infinite recursion

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Function to get user's current role (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id;
  RETURN user_role;
END;
$$;

-- Function to get user's current status (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_status(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status TEXT;
BEGIN
  SELECT status INTO user_status
  FROM user_profiles
  WHERE id = user_id;
  RETURN user_status;
END;
$$;

-- Step 2: Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can modify any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Step 3: Recreate policies using the security definer function

-- Policy: Only admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Policy: Users can update their own profile (except role and status)
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = get_user_role(auth.uid())
    AND status = get_user_status(auth.uid())
  );

-- Policy: Only admins can modify any profile
CREATE POLICY "Admins can modify any profile"
  ON user_profiles FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Grant execute permission on the functions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_status(UUID) TO authenticated;

