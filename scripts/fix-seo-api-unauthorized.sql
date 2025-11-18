-- ============================================
-- QUICK FIX: SEO API "Unauthorized" Error
-- ============================================
-- Chạy script này trong Supabase SQL Editor
-- Thay YOUR_EMAIL_HERE bằng email bạn dùng để login

-- Step 1: Tạo bảng site_settings nếu chưa có
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Step 2: Disable RLS (Row Level Security) cho development
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Step 3: Check xem bảng users có tồn tại không
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'users'
  ) THEN
    -- Tạo bảng users nếu chưa có
    CREATE TABLE users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'client',
      full_name TEXT,
      avatar_url TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role ON users(role);
  END IF;
END $$;

-- Step 4: Tạo/Update admin user
-- ⚠️ THAY 'YOUR_EMAIL_HERE' BẰNG EMAIL THỰC TẾ CỦA BẠN ⚠️
DO $$
DECLARE
  user_email TEXT := 'YOUR_EMAIL_HERE'; -- <-- THAY ĐỔI Ở ĐÂY
  auth_user_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF auth_user_id IS NOT NULL THEN
    -- Insert hoặc update user với role admin
    INSERT INTO users (id, email, role, created_at, updated_at)
    VALUES (auth_user_id, user_email, 'admin', NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
      role = 'admin',
      email = user_email,
      updated_at = NOW();
    
    RAISE NOTICE 'User % đã được set làm admin!', user_email;
  ELSE
    RAISE NOTICE 'Không tìm thấy user với email %. Vui lòng đăng ký trước!', user_email;
  END IF;
END $$;

-- Step 5: Verify kết quả
SELECT 
  '✅ site_settings table' as check_item,
  COUNT(*) as count
FROM site_settings

UNION ALL

SELECT 
  '✅ Total users' as check_item,
  COUNT(*) as count
FROM users

UNION ALL

SELECT 
  '✅ Admin users' as check_item,
  COUNT(*) as count
FROM users 
WHERE role = 'admin';

-- Step 6: Show admin users
SELECT 
  '👤 Admin Users:' as info,
  email,
  role,
  created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- DONE! Giờ thử lại API:
-- 1. Logout và login lại
-- 2. Truy cập: http://localhost:3000/admin/seo
-- 3. Upload ảnh và save settings
-- ============================================

