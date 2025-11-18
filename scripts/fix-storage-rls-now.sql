-- Quick Fix: Storage RLS Policies for image bucket
-- Chạy script này trong Supabase SQL Editor để fix lỗi "new row violates row-level security policy"

-- ===========================================
-- OPTION 1: Simple Policies (Recommended for development)
-- ===========================================
-- Drop existing policies
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Policy 1: Anyone can view images (public read)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'image');

-- Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'image');

-- Policy 3: Authenticated users can update
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'image')
WITH CHECK (bucket_id = 'image');

-- Policy 4: Authenticated users can delete
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'image');

-- ===========================================
-- OPTION 2: Disable RLS (Only for development!)
-- ===========================================
-- ⚠️ WARNING: Only use this for development/testing
-- Uncomment below to disable RLS completely:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ===========================================
-- Verify policies
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
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    policyname LIKE '%image%'
    OR bucket_id = 'image'
  )
ORDER BY policyname;

-- ===========================================
-- Check bucket exists
-- ===========================================
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE name = 'image';

