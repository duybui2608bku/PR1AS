-- Script để đồng bộ auth.users với user_profiles
-- Chạy script này để fix các vấn đề phổ biến

-- ===========================================
-- FIX 1: Tạo profiles cho auth users chưa có profile
-- ===========================================
-- CẢNH BÁO: Script này sẽ tạo profile với role 'client' cho tất cả users chưa có profile
-- Nếu bạn muốn role khác, sửa 'client' thành 'worker' hoặc 'admin'

INSERT INTO user_profiles (id, email, role, status)
SELECT 
  au.id,
  au.email,
  'client' as role,  -- Thay đổi role nếu cần: 'client', 'worker', hoặc 'admin'
  'active' as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
  AND au.deleted_at IS NULL  -- Không tạo profile cho user đã xóa
ON CONFLICT (id) DO NOTHING;

-- Xem kết quả
SELECT 
  'Profiles created' as action,
  COUNT(*) as count
FROM user_profiles
WHERE created_at > NOW() - INTERVAL '1 minute';

-- ===========================================
-- FIX 2: Update email không khớp giữa auth và profile
-- ===========================================
UPDATE user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id
  AND up.email != au.email;

-- Xem kết quả
SELECT 
  'Emails synced' as action,
  COUNT(*) as count
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = au.email;

-- ===========================================
-- FIX 3: Xóa orphaned profiles (profiles không có auth user)
-- ===========================================
-- CẢNH BÁO: Script này sẽ XÓA profiles không còn auth user
-- Comment out nếu bạn không muốn xóa

-- DELETE FROM user_profiles
-- WHERE id NOT IN (SELECT id FROM auth.users);

-- Hoặc chỉ xem trước
SELECT 
  up.id,
  up.email,
  up.role,
  'WILL BE DELETED' as warning
FROM user_profiles up
WHERE up.id NOT IN (SELECT id FROM auth.users);

-- ===========================================
-- FIX 4: Tạo profile cho một user cụ thể
-- ===========================================
-- Uncomment và điền thông tin để tạo profile cho 1 user cụ thể

-- INSERT INTO user_profiles (id, email, role, status, full_name)
-- SELECT 
--   id,
--   email,
--   'client' as role,  -- Thay đổi: 'client', 'worker', hoặc 'admin'
--   'active' as status,
--   NULL as full_name  -- Thay đổi nếu có tên
-- FROM auth.users
-- WHERE email = 'YOUR_EMAIL_HERE'
-- ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- VERIFICATION: Kiểm tra sau khi fix
-- ===========================================
-- 1. Tất cả auth users có profile
SELECT 
  COUNT(*) as auth_users_with_profile
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.deleted_at IS NULL;

-- 2. Không có auth users thiếu profile
SELECT 
  COUNT(*) as auth_users_without_profile
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
  AND au.deleted_at IS NULL;

-- 3. Không có orphaned profiles
SELECT 
  COUNT(*) as orphaned_profiles
FROM user_profiles up
WHERE up.id NOT IN (SELECT id FROM auth.users);

