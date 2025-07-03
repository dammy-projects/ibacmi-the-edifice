
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Upload, Save, ArrowLeft } from 'lucide-react';
import { useCreateFlipbook, useUpdateFlipbook, useUploadCoverImage, type Flipbook } from '@/hooks/useFlipbooks';
import { useCategories, useTags } from '@/hooks/useCategories';
import PDFUpload from './PDFUpload';

const flipbookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']),
  is_published: z.boolean(),
});

type FlipbookFormData = z.infer<typeof flipbookSchema>;

interface FlipbookFormProps {
  flipbook?: Flipbook;
  onSuccess: () => void;
  onCancel: () => void;
}

const FlipbookForm = ({ flipbook, onSuccess, onCancel }: FlipbookFormProps) => {
  const [coverImage, setCoverImage] = useState<string | null>(flipbook?.cover_image || null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const createFlipbook = useCreateFlipbook();
  const updateFlipbook = useUpdateFlipbook();
  const uploadCoverImage = useUploadCoverImage();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FlipbookFormData>({
    resolver: zodResolver(flipbookSchema),
    defaultValues: {
      title: flipbook?.title || '',
      description: flipbook?.description || '',
      visibility: flipbook?.visibility || 'private',
      is_published: flipbook?.is_published || false,
    },
  });

  const watchedVisibility = watch('visibility');
  const watchedIsPublished = watch('is_published');

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      const publicUrl = await uploadCoverImage.mutateAsync(file);
      setCoverImage(publicUrl);
    } catch (error) {
      console.error('Cover image upload failed:', error);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const onSubmit = async (data: FlipbookFormData) => {
    try {
      const flipbookData = {
        ...data,
        cover_image: coverImage,
      };

      if (flipbook) {
        await updateFlipbook.mutateAsync({ id: flipbook.id, data: flipbookData });
      } else {
        await createFlipbook.mutateAsync(flipbookData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Failed to save flipbook:', error);
    }
  };

  const isSubmitting = createFlipbook.isPending || updateFlipbook.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Flipbooks
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {flipbook ? 'Edit Flipbook' : 'Create New Flipbook'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter flipbook title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your flipbook..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-2">
                    {coverImage ? (
                      <div className="relative inline-block">
                        <img
                          src={coverImage}
                          alt="Cover preview"
                          className="w-32 h-40 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => setCoverImage(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                          id="cover-upload"
                          disabled={uploadCoverImage.isPending}
                        />
                        <label htmlFor="cover-upload">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadCoverImage.isPending}
                            className="cursor-pointer"
                            asChild
                          >
                            <span>
                              {uploadCoverImage.isPending ? 'Uploading...' : 'Upload Cover Image'}
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories?.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-colors
                        ${selectedCategories.includes(category.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="font-medium text-sm">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {category.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {flipbook && <PDFUpload flipbookId={flipbook.id} />}
            {!flipbook && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">
                    Save your flipbook first to upload PDF content.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility & Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={watchedVisibility}
                    onValueChange={(value: 'public' | 'private' | 'unlisted') =>
                      setValue('visibility', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-gray-500">Visible to everyone</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div>
                          <div className="font-medium">Unlisted</div>
                          <div className="text-sm text-gray-500">Only accessible with direct link</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div>
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-gray-500">Only visible to you</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_published">Published</Label>
                    <p className="text-sm text-gray-500">
                      {watchedIsPublished
                        ? 'Your flipbook is live and accessible'
                        : 'Keep as draft - not visible to others'}
                    </p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={watchedIsPublished}
                    onCheckedChange={(checked) => setValue('is_published', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : (flipbook ? 'Update Flipbook' : 'Create Flipbook')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FlipbookForm;
