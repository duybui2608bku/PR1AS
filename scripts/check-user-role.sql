-- Script để kiểm tra user role trong database

-- 1. Check xem bảng users có tồn tại không
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'users'
);

-- 2. Check tất cả users và role của họ
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 3. Nếu cần set user làm admin (thay YOUR_USER_ID bằng ID thực tế)
-- UPDATE users SET role = 'admin' WHERE id = 'YOUR_USER_ID';

-- 4. Check auth.users (bảng auth của Supabase)
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

