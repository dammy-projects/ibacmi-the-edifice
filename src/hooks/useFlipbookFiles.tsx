
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

export const useUploadPDF = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, flipbookId }: { file: File; flipbookId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/pdfs/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('flipbook-assets')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Create file record
      const { data: fileRecord, error: recordError } = await supabase
        .from('flipbook_files')
        .insert([
          {
            flipbook_id: flipbookId,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            conversion_status: 'pending',
          }
        ])
        .select()
        .single();
      
      if (recordError) throw recordError;
      
      // Trigger PDF processing
      const { error: processError } = await supabase.functions.invoke('process-pdf', {
        body: { fileId: fileRecord.id, filePath: fileName }
      });
      
      if (processError) {
        console.error('PDF processing error:', processError);
        // Don't throw here - let the file record exist even if processing fails
      }
      
      return fileRecord;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flipbook-files', variables.flipbookId] });
      toast({
        title: "PDF Uploaded",
        description: "Your PDF is being processed and will be converted to flipbook pages.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
      console.error('PDF upload error:', error);
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
