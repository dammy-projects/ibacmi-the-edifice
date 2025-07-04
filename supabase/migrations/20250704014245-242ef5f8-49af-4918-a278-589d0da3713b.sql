-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role app_role DEFAULT 'user';

-- Update existing profiles to have the user role
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Make role column not nullable
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Create function to sync profile role when user_roles changes
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the profile role when user_roles changes
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.profiles 
    SET role = NEW.role,
        updated_at = now()
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- Handle deletions by setting back to default user role
  IF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET role = 'user',
        updated_at = now()
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger to automatically sync profile role
CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role();

-- Update the handle_new_user function to set the role in profiles as well
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, account_type, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username',
    'free',
    'user'
  );
  
  -- Assign default user role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;