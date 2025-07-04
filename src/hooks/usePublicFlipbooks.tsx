import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicFlipbook {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  publication_date: string | null;
}

interface UsePublicFlipbooksParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const usePublicFlipbooks = ({ 
  search = '', 
  page = 1, 
  limit = 8 
}: UsePublicFlipbooksParams = {}) => {
  return useQuery({
    queryKey: ['public-flipbooks', search, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('flipbooks')
        .select('id, title, description, cover_image, created_at, updated_at, publication_date')
        .eq('is_published', true)
        .eq('visibility', 'public')
        .order('updated_at', { ascending: false });

      // Add search filter if provided
      if (search) {
        query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`);
      }

      // Add pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        flipbooks: data as PublicFlipbook[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
      };
    },
  });
};