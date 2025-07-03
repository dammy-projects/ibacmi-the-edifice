
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useFlipbookFiles, useUploadPDF, useDeleteFlipbookFile } from '@/hooks/useFlipbookFiles';
import ReprocessPDF from './ReprocessPDF';

interface PDFUploadProps {
  flipbookId: string;
}

const PDFUpload = ({ flipbookId }: PDFUploadProps) => {
  const { data: files, isLoading } = useFlipbookFiles(flipbookId);
  const uploadPDF = useUploadPDF();
  const deleteFile = useDeleteFlipbookFile();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size must be less than 50MB');
      return;
    }

    uploadPDF.mutate({ file, flipbookId });
    
    // Reset input
    event.target.value = '';
  }, [flipbookId, uploadPDF]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <FileText className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Upload PDF to convert to flipbook pages</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
            disabled={uploadPDF.isPending}
          />
          <label htmlFor="pdf-upload">
            <Button 
              variant="outline" 
              disabled={uploadPDF.isPending}
              className="cursor-pointer"
              asChild
            >
              <span>
                {uploadPDF.isPending ? 'Uploading...' : 'Choose PDF File'}
              </span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 50MB
          </p>
        </div>

        {/* Files List */}
        {files && files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Uploaded Files</h4>
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(file.conversion_status)}
                      <span className="font-medium text-sm truncate">
                        {file.file_name}
                      </span>
                      <Badge variant={getStatusColor(file.conversion_status)}>
                        {file.conversion_status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Size: {(file.file_size / (1024 * 1024)).toFixed(2)} MB</p>
                      {file.total_pages && (
                        <p>Pages: {file.total_pages}</p>
                      )}
                      <p>Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</p>
                    </div>

                    {/* Progress Bar for Processing */}
                    {file.conversion_status === 'processing' && file.total_pages && file.converted_pages !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Converting pages...</span>
                          <span>{file.converted_pages}/{file.total_pages}</span>
                        </div>
                        <Progress 
                          value={(file.converted_pages / file.total_pages) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.conversion_status === 'failed' && (
                      <ReprocessPDF 
                        fileId={file.id}
                        filePath={file.file_path}
                        onSuccess={() => {
                          // Refetch files to update the UI
                          window.location.reload();
                        }}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile.mutate(file.id)}
                      disabled={deleteFile.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFUpload;
