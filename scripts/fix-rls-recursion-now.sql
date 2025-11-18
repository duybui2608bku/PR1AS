-- Script để fix lỗi infinite recursion trong RLS policies
-- Chạy script này trong Supabase SQL Editor

-- ===========================================
-- STEP 1: Kiểm tra các policies hiện tại
-- ===========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ===========================================
-- STEP 2: Drop các policies gây đệ quy
-- ===========================================
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can modify any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- ===========================================
-- STEP 3: Tạo security definer functions
-- ===========================================

-- Function để check admin (bypass RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Function để lấy role (bypass RLS)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id;
  RETURN COALESCE(user_role, '');
END;
$$;

-- Function để lấy status (bypass RLS)
CREATE OR REPLACE FUNCTION get_user_status(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_status TEXT;
BEGIN
  SELECT status INTO user_status
  FROM user_profiles
  WHERE id = user_id;
  RETURN COALESCE(user_status, '');
END;
$$;

-- ===========================================
-- STEP 4: Tạo lại các policies với functions
-- ===========================================

-- Policy: Users can read their own profile (giữ nguyên, không gây đệ quy)
-- Policy này đã tồn tại, chỉ cần đảm bảo nó vẫn hoạt động

-- Policy: Admins can read all profiles
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

-- Policy: Admins can modify any profile
CREATE POLICY "Admins can modify any profile"
  ON user_profiles FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ===========================================
-- STEP 5: Grant permissions
-- ===========================================
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_status(UUID) TO authenticated;

-- ===========================================
-- STEP 6: Verify các policies đã được tạo
-- ===========================================
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'HAS USING'
    ELSE 'NO USING'
  END as has_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'HAS WITH CHECK'
    ELSE 'NO WITH CHECK'
  END as has_with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ===========================================
-- STEP 7: Test function (optional)
-- ===========================================
-- Uncomment và thay user_id để test
-- SELECT is_admin('YOUR_USER_ID_HERE'::uuid);

