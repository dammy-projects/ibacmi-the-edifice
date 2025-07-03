
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface FlipbookFile {
  id: string;
  flipbook_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  conversion_status: 'pending' | 'processing' | 'completed' | 'failed';
  total_pages?: number;
  converted_pages?: number;
  uploaded_at: string;
}

export const useFlipbookFiles = (flipbookId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['flipbook-files', flipbookId],
    queryFn: async () => {
      if (!flipbookId) return [];
      
      const { data, error } = await supabase
        .from('flipbook_files')
        .select('*')
        .eq('flipbook_id', flipbookId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as FlipbookFile[];
    },
    enabled: !!flipbookId && !!user,
  });
};

export const useUploadImages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ files, flipbookId }: { files: File[]; flipbookId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const results = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/images/${flipbookId}/${Date.now()}-${i + 1}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('flipbook-assets')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error('Upload error for file', file.name, uploadError);
          continue;
        }
        
        results.push({ fileName, originalName: file.name, size: file.size });
      }
      
      if (results.length === 0) {
        throw new Error('No files were uploaded successfully');
      }
      
      // Calculate total size
      const totalSize = results.reduce((sum, result) => sum + result.size, 0);
      
      // Create file record for the batch
      const { data: fileRecord, error: recordError } = await supabase
        .from('flipbook_files')
        .insert([
          {
            flipbook_id: flipbookId,
            file_name: `${results.length} images`,
            file_path: `${user.id}/images/${flipbookId}/`,
            file_size: totalSize,
            mime_type: 'image/collection',
            conversion_status: 'pending',
            total_pages: results.length,
          }
        ])
        .select()
        .single();
      
      if (recordError) throw recordError;
      
      // Trigger image processing
      const { error: processError } = await supabase.functions.invoke('process-images', {
        body: { 
          fileId: fileRecord.id, 
          flipbookId,
          images: results
        }
      });
      
      if (processError) {
        console.error('Image processing error:', processError);
        // Don't throw here - let the file record exist even if processing fails
      }
      
      return fileRecord;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flipbook-files', variables.flipbookId] });
      toast({
        title: "Images Uploaded",
        description: "Your images are being processed and will be added to your flipbook.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
      console.error('Image upload error:', error);
    },
  });
};

export const useDeleteFlipbookFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fileId: string) => {
      // Get file info first
      const { data: fileData, error: fetchError } = await supabase
        .from('flipbook_files')
        .select('file_path, flipbook_id')
        .eq('id', fileId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('flipbook-assets')
        .remove([fileData.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete record
      const { error: deleteError } = await supabase
        .from('flipbook_files')
        .delete()
        .eq('id', fileId);
      
      if (deleteError) throw deleteError;
      
      return fileData.flipbook_id;
    },
    onSuccess: (flipbookId) => {
      queryClient.invalidateQueries({ queryKey: ['flipbook-files', flipbookId] });
      toast({
        title: "File Deleted",
        description: "PDF file and associated pages have been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
      console.error('File delete error:', error);
    },
  });
};
