
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Image } from 'lucide-react';
import { useCreateFlipbook, useUpdateFlipbook, useUploadCoverImage, type Flipbook } from '@/hooks/useFlipbooks';
import { useCategories, useTags } from '@/hooks/useCategories';

interface FlipbookFormProps {
  flipbook?: Flipbook;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FlipbookForm = ({ flipbook, onSuccess, onCancel }: FlipbookFormProps) => {
  const [title, setTitle] = useState(flipbook?.title || '');
  const [description, setDescription] = useState(flipbook?.description || '');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>(
    flipbook?.visibility || 'private'
  );
  const [isPublished, setIsPublished] = useState(flipbook?.is_published || false);
  const [coverImage, setCoverImage] = useState(flipbook?.cover_image || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createFlipbook = useCreateFlipbook();
  const updateFlipbook = useUpdateFlipbook();
  const uploadCoverImage = useUploadCoverImage();
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  
  const isEditing = !!flipbook;
  const isLoading = createFlipbook.isPending || updateFlipbook.isPending || uploadCoverImage.isPending;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverImage(previewUrl);
    }
  };

  const handleRemoveCover = () => {
    setCoverImage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let finalCoverImage = coverImage;
      
      // Upload cover image if file is selected
      if (selectedFile) {
        finalCoverImage = await uploadCoverImage.mutateAsync(selectedFile);
      }
      
      const flipbookData = {
        title,
        description,
        visibility,
        is_published: isPublished,
        cover_image: finalCoverImage,
      };
      
      if (isEditing) {
        await updateFlipbook.mutateAsync({ id: flipbook.id, data: flipbookData });
      } else {
        await createFlipbook.mutateAsync(flipbookData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Flipbook' : 'Create New Flipbook'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter flipbook title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your flipbook..."
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="max-w-full max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Cover Image
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG or WebP up to 50MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(value: 'public' | 'private' | 'unlisted') => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private - Only you can see it</SelectItem>
                <SelectItem value="unlisted">Unlisted - Anyone with link can see it</SelectItem>
                <SelectItem value="public">Public - Everyone can discover it</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="published">
              {isPublished ? 'Published' : 'Draft'}
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Flipbook' : 'Create Flipbook'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FlipbookForm;
