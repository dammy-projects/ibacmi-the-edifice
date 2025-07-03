
-- Create storage bucket for flipbook files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'flipbook-assets',
  'flipbook-assets',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Create storage policies for flipbook assets
CREATE POLICY "Anyone can view flipbook assets" ON storage.objects
FOR SELECT USING (bucket_id = 'flipbook-assets');

CREATE POLICY "Authenticated users can upload flipbook assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'flipbook-assets' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own flipbook assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'flipbook-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own flipbook assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'flipbook-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add some default categories
INSERT INTO public.categories (name, description) VALUES
('Art & Design', 'Creative works, illustrations, and design portfolios'),
('Business', 'Corporate brochures, reports, and presentations'),
('Education', 'Educational materials, textbooks, and learning resources'),
('Fashion', 'Fashion magazines, lookbooks, and style guides'),
('Food & Cooking', 'Recipe books, culinary magazines, and food photography'),
('Health & Fitness', 'Wellness guides, workout plans, and health information'),
('Lifestyle', 'Lifestyle magazines, home decor, and personal interest content'),
('Technology', 'Tech magazines, product catalogs, and innovation showcases'),
('Travel', 'Travel guides, destination magazines, and adventure stories'),
('Entertainment', 'Entertainment magazines, comics, and pop culture content');

-- Add some default tags
INSERT INTO public.tags (name) VALUES
('magazine'), ('brochure'), ('catalog'), ('portfolio'), ('report'),
('guide'), ('manual'), ('newsletter'), ('ebook'), ('presentation'),
('annual-report'), ('lookbook'), ('menu'), ('flyer'), ('booklet');

-- Enable RLS on categories and tags
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flipbook_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flipbook_tags ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories
FOR SELECT USING (true);

-- Tags policies (public read, admin write)  
CREATE POLICY "Anyone can view tags" ON public.tags
FOR SELECT USING (true);

-- Flipbook categories junction table policies
CREATE POLICY "Anyone can view flipbook categories" ON public.flipbook_categories
FOR SELECT USING (true);

CREATE POLICY "Users can manage their flipbook categories" ON public.flipbook_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = flipbook_categories.flipbook_id 
    AND flipbooks.user_id = auth.uid()
  )
);

-- Flipbook tags junction table policies
CREATE POLICY "Anyone can view flipbook tags" ON public.flipbook_tags
FOR SELECT USING (true);

CREATE POLICY "Users can manage their flipbook tags" ON public.flipbook_tags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = flipbook_tags.flipbook_id 
    AND flipbooks.user_id = auth.uid()
  )
);
