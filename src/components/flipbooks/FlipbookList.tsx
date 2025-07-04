import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2, Upload } from 'lucide-react';
import { useFlipbooks, type Flipbook } from '@/hooks/useFlipbooks';
import { Link } from 'react-router-dom';

interface FlipbookListProps {
  onEdit: (flipbook: Flipbook) => void;
}

const FlipbookList = ({ onEdit }: FlipbookListProps) => {
  const { data: flipbooks, isLoading, error } = useFlipbooks();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-red-600">Error loading flipbooks. Please try again.</p>
      </div>
    );
  }

  if (!flipbooks || flipbooks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No flipbooks yet</h3>
        <p className="text-gray-600">Create your first flipbook to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {flipbooks.map((flipbook) => (
        <Card key={flipbook.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {flipbook.cover_image && (
            <div className="h-48 overflow-hidden">
              <img
                src={flipbook.cover_image}
                alt={flipbook.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">{flipbook.title}</CardTitle>
                {flipbook.description && (
                  <CardDescription className="line-clamp-2 mt-1">
                    {flipbook.description}
                  </CardDescription>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={flipbook.is_published ? 'default' : 'secondary'}>
                {flipbook.is_published ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {flipbook.visibility}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Updated {new Date(flipbook.updated_at).toLocaleDateString()}
              </p>
              
              <div className="flex items-center gap-2">
                <Link to={`/view/${flipbook.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(flipbook)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FlipbookList;
