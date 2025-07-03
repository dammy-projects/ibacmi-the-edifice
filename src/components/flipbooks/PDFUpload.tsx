
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Images, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useFlipbookFiles, useUploadImages, useDeleteFlipbookFile } from '@/hooks/useFlipbookFiles';
import ReprocessPDF from './ReprocessPDF';

interface ImageUploadProps {
  flipbookId: string;
}

const ImageUpload = ({ flipbookId }: ImageUploadProps) => {
  const { data: files, isLoading } = useFlipbookFiles(flipbookId);
  const uploadImages = useUploadImages();
  const deleteFile = useDeleteFlipbookFile();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if all files are images
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !validImageTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Please select only image files (JPEG, PNG, WebP)');
      return;
    }

    // Check file sizes (5MB limit per image)
    const oversizedFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 5MB');
      return;
    }

    uploadImages.mutate({ files: Array.from(files), flipbookId });
    
    // Reset input
    event.target.value = '';
  }, [flipbookId, uploadImages]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Images className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <Images className="h-4 w-4 text-gray-600" />;
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
          <Images className="h-5 w-5" />
          Flipbook Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Upload multiple images to create your flipbook</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
            disabled={uploadImages.isPending}
          />
          <label htmlFor="image-upload">
            <Button 
              variant="outline" 
              disabled={uploadImages.isPending}
              className="cursor-pointer"
              asChild
            >
              <span>
                {uploadImages.isPending ? 'Uploading...' : 'Choose Images'}
              </span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 5MB per image. Supported formats: JPEG, PNG, WebP
          </p>
        </div>

        {/* Files List */}
        {files && files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Uploaded Images</h4>
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
                        <p>Images: {file.total_pages}</p>
                      )}
                      <p>Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</p>
                    </div>

                    {/* Progress Bar for Processing */}
                    {file.conversion_status === 'processing' && file.total_pages && file.converted_pages !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Processing images...</span>
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

export default ImageUpload;
