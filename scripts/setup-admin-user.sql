-- Script để tạo/update admin user

-- Option 1: Nếu user đã tồn tại trong auth.users nhưng chưa có trong bảng users
-- Thay YOUR_USER_EMAIL bằng email thực tế của bạn
INSERT INTO users (id, email, role, created_at, updated_at)
SELECT 
  id, 
  email, 
  'admin' as role,
  created_at,
  NOW() as updated_at
FROM auth.users 
WHERE email = 'YOUR_USER_EMAIL'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Option 2: Update user hiện tại thành admin
-- Thay YOUR_USER_EMAIL bằng email của bạn
UPDATE users 
SET role = 'admin' 
WHERE email = 'YOUR_USER_EMAIL';

-- Verify
SELECT id, email, role FROM users WHERE role = 'admin';

