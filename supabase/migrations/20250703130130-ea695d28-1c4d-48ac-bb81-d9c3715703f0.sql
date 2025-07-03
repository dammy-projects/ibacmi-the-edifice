
-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flipbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

-- Flipbooks policies
CREATE POLICY "Anyone can view published flipbooks" ON public.flipbooks
FOR SELECT USING (is_published = true AND visibility = 'public');

CREATE POLICY "Users can view their own flipbooks" ON public.flipbooks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create flipbooks" ON public.flipbooks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flipbooks" ON public.flipbooks
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flipbooks" ON public.flipbooks
FOR DELETE USING (auth.uid() = user_id);

-- Pages policies
CREATE POLICY "Anyone can view pages of published flipbooks" ON public.pages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = pages.flipbook_id 
    AND flipbooks.is_published = true 
    AND flipbooks.visibility = 'public'
  )
);

CREATE POLICY "Users can view pages of their own flipbooks" ON public.pages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = pages.flipbook_id 
    AND flipbooks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage pages of their own flipbooks" ON public.pages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = pages.flipbook_id 
    AND flipbooks.user_id = auth.uid()
  )
);

-- Likes policies
CREATE POLICY "Anyone can view likes" ON public.likes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like flipbooks" ON public.likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments on published flipbooks" ON public.comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = comments.flipbook_id 
    AND flipbooks.is_published = true 
    AND flipbooks.visibility = 'public'
  )
);

CREATE POLICY "Authenticated users can create comments" ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies (track views)
CREATE POLICY "Anyone can create analytics records" ON public.analytics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Analytics are viewable by everyone" ON public.analytics
FOR SELECT USING (true);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, account_type)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username',
    'free'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
