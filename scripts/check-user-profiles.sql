-- Check user_profiles table và set admin role

-- 1. Xem tất cả users và role
SELECT id, email, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC;

-- 2. Nếu cần set user làm admin (thay YOUR_USER_EMAIL bằng email thực tế)
-- Uncomment và chạy dòng dưới:

-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'YOUR_USER_EMAIL';

-- 3. Verify admin users
SELECT id, email, role 
FROM user_profiles 
WHERE role = 'admin';

