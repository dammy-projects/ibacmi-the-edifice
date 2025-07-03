import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReprocessPDFProps {
  fileId: string;
  filePath: string;
  onSuccess?: () => void;
}

const ReprocessPDF = ({ fileId, filePath, onSuccess }: ReprocessPDFProps) => {
  const [isReprocessing, setIsReprocessing] = React.useState(false);

  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      // First, clear existing pages for this flipbook
      const { data: fileData } = await supabase
        .from('flipbook_files')
        .select('flipbook_id')
        .eq('id', fileId)
        .single();

      if (fileData) {
        await supabase
          .from('pages')
          .delete()
          .eq('flipbook_id', fileData.flipbook_id);

        // Reset file status
        await supabase
          .from('flipbook_files')
          .update({ 
            conversion_status: 'pending',
            converted_pages: 0
          })
          .eq('id', fileId);
      }

      // Trigger PDF processing again
      const { error } = await supabase.functions.invoke('process-pdf', {
        body: { fileId, filePath }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "PDF Reprocessing Started",
        description: "Your PDF is being processed again. Please wait a moment.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Reprocess error:', error);
      toast({
        title: "Reprocess Failed",
        description: "Failed to reprocess PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <Button
      onClick={handleReprocess}
      disabled={isReprocessing}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isReprocessing ? 'animate-spin' : ''}`} />
      {isReprocessing ? 'Reprocessing...' : 'Reprocess PDF'}
    </Button>
  );
};

export default ReprocessPDF;