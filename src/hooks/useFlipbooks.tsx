
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Flipbook {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  is_published: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFlipbookData {
  title: string;
  description?: string;
  cover_image?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  is_published?: boolean;
}

export const useFlipbooks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['flipbooks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('flipbooks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Flipbook[];
    },
    enabled: !!user,
  });
};

export const useCreateFlipbook = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateFlipbookData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: flipbook, error } = await supabase
        .from('flipbooks')
        .insert([
          {
            ...data,
            user_id: user.id,
            visibility: data.visibility || 'private',
            is_published: data.is_published || false,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return flipbook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flipbooks'] });
      toast({
        title: "Success",
        description: "Flipbook created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create flipbook. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating flipbook:', error);
    },
  });
};

export const useUpdateFlipbook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateFlipbookData> }) => {
      const { data: flipbook, error } = await supabase
        .from('flipbooks')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return flipbook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flipbooks'] });
      toast({
        title: "Success",
        description: "Flipbook updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update flipbook. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating flipbook:', error);
    },
  });
};

export const useUploadCoverImage = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/covers/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('flipbook-assets')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('flipbook-assets')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    },
    onError: (error) => {
      toast({
        title: "Upload Error",
        description: "Failed to upload cover image. Please try again.",
        variant: "destructive",
      });
      console.error('Error uploading cover image:', error);
    },
  });
};
