
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FlipbookPage {
  id: string;
  flipbook_id: string;
  page_number: number;
  image_url: string;
  text_content?: string;
  created_at: string;
}

export const useFlipbookPages = (flipbookId?: string) => {
  return useQuery({
    queryKey: ['flipbook-pages', flipbookId],
    queryFn: async () => {
      if (!flipbookId) return [];
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('flipbook_id', flipbookId)
        .order('page_number', { ascending: true });
      
      if (error) throw error;
      return data as FlipbookPage[];
    },
    enabled: !!flipbookId,
  });
};
