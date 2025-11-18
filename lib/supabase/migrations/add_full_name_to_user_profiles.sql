-- Add full_name column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create index on full_name for faster search
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name ON user_profiles(full_name);

