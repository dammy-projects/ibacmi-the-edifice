
-- Add columns to flipbook_files table to track PDF conversion status
ALTER TABLE public.flipbook_files 
ADD COLUMN IF NOT EXISTS conversion_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS total_pages INTEGER,
ADD COLUMN IF NOT EXISTS converted_pages INTEGER DEFAULT 0;

-- Create an index on conversion status for better query performance
CREATE INDEX IF NOT EXISTS idx_flipbook_files_conversion_status 
ON public.flipbook_files(conversion_status);

-- Add RLS policies for flipbook_files table
ALTER TABLE public.flipbook_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flipbook files" ON public.flipbook_files
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = flipbook_files.flipbook_id 
    AND flipbooks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own flipbook files" ON public.flipbook_files
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.flipbooks 
    WHERE flipbooks.id = flipbook_files.flipbook_id 
    AND flipbooks.user_id = auth.uid()
  )
);
