-- Script để debug vấn đề đăng nhập
-- Chạy từng section để tìm vấn đề

-- ===========================================
-- SECTION 1: Kiểm tra auth.users
-- ===========================================
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  CASE 
    WHEN deleted_at IS NOT NULL THEN 'DELETED'
    WHEN banned_until IS NOT NULL AND banned_until > NOW() THEN 'BANNED'
    ELSE 'ACTIVE'
  END as auth_status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ===========================================
-- SECTION 2: Kiểm tra user_profiles
-- ===========================================
SELECT 
  id,
  email,
  role,
  status,
  full_name,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- ===========================================
-- SECTION 3: Tìm accounts có auth nhưng KHÔNG có profile
-- ===========================================
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  'MISSING PROFILE' as issue
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ORDER BY au.created_at DESC;

-- ===========================================
-- SECTION 4: Tìm profiles KHÔNG có auth user (orphaned)
-- ===========================================
SELECT 
  up.id,
  up.email,
  up.role,
  up.created_at as profile_created_at,
  'ORPHANED PROFILE' as issue
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL
ORDER BY up.created_at DESC;

-- ===========================================
-- SECTION 5: Kiểm tra email không khớp
-- ===========================================
SELECT 
  au.id,
  au.email as auth_email,
  up.email as profile_email,
  up.role,
  'EMAIL MISMATCH' as issue
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email != up.email;

-- ===========================================
-- SECTION 6: Kiểm tra user_profiles với email cụ thể
-- Thay 'YOUR_EMAIL_HERE' bằng email bạn đang test
-- ===========================================
-- WITH your_email AS (
--   SELECT 'YOUR_EMAIL_HERE'::text as email
-- )
-- SELECT 
--   au.id as auth_id,
--   au.email as auth_email,
--   au.email_confirmed_at,
--   au.last_sign_in_at,
--   up.id as profile_id,
--   up.email as profile_email,
--   up.role,
--   up.status,
--   CASE 
--     WHEN au.id IS NULL THEN 'NO AUTH USER'
--     WHEN up.id IS NULL THEN 'NO PROFILE'
--     WHEN au.id != up.id THEN 'ID MISMATCH'
--     WHEN up.status = 'banned' THEN 'ACCOUNT BANNED'
--     ELSE 'OK'
--   END as diagnosis
-- FROM your_email ye
-- LEFT JOIN auth.users au ON au.email = ye.email
-- LEFT JOIN user_profiles up ON up.email = ye.email;

-- ===========================================
-- SECTION 7: Test RLS policies
-- Kiểm tra xem RLS có đang block không
-- ===========================================
-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'user_profiles';

-- View all policies on user_profiles
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
WHERE tablename = 'user_profiles';

