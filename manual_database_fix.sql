-- MANUAL DATABASE FIX FOR PROFILE MODULE
-- Run this script in the Supabase Dashboard -> SQL Editor

-- Fix 1: Add missing INSERT policy for profiles table
-- This is CRITICAL for profile updates to work
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix 2: Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Fix 3: Create trigger for profiles table to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix 4: Ensure the profiles table has the correct updated_at column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Verify the policies are applied correctly
-- You should see both SELECT, UPDATE, and INSERT policies for profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY cmd, policyname;