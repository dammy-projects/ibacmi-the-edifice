
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff, Globe, Lock, Link } from 'lucide-react';
import { useFlipbooks, type Flipbook } from '@/hooks/useFlipbooks';

interface FlipbookListProps {
  onEdit?: (flipbook: Flipbook) => void;
}

const FlipbookList = ({ onEdit }: FlipbookListProps) => {
  const { data: flipbooks, isLoading, error } = useFlipbooks();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading flipbooks. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!flipbooks || flipbooks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No flipbooks yet. Create your first one!</p>
        </CardContent>
      </Card>
    );
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'unlisted':
        return <Link className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {flipbooks.map((flipbook) => (
        <Card key={flipbook.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{flipbook.title}</h3>
                  <div className="flex items-center gap-1">
                    {getVisibilityIcon(flipbook.visibility)}
                    <span className="text-sm text-gray-500 capitalize">
                      {flipbook.visibility}
                    </span>
                  </div>
                </div>
                
                {flipbook.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {flipbook.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={flipbook.is_published ? "default" : "secondary"}>
                    {flipbook.is_published ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-500">
                  Updated {new Date(flipbook.updated_at).toLocaleDateString()}
                </p>
              </div>
              
              {flipbook.cover_image && (
                <div className="ml-4">
                  <img
                    src={flipbook.cover_image}
                    alt={`${flipbook.title} cover`}
                    className="w-16 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(flipbook)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FlipbookList;
