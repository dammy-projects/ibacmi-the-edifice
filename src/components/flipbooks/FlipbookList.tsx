import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Trash2, Upload } from 'lucide-react';
import { useFlipbooks, useDeleteFlipbook, type Flipbook } from '@/hooks/useFlipbooks';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FlipbookListProps {
  onEdit: (flipbook: Flipbook) => void;
}

const PLACEHOLDER = '/placeholder.svg';

const FlipbookList = ({ onEdit }: FlipbookListProps) => {
  const { data: flipbooks, isLoading, error } = useFlipbooks();
  const deleteFlipbook = useDeleteFlipbook();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flipbookToDelete, setFlipbookToDelete] = useState<Flipbook | null>(null);

  const handleDeleteClick = (flipbook: Flipbook) => {
    setFlipbookToDelete(flipbook);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (flipbookToDelete) {
      await deleteFlipbook.mutateAsync(flipbookToDelete.id);
      setDeleteDialogOpen(false);
      setFlipbookToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFlipbookToDelete(null);
  };

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
    <>
      <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {flipbooks.map((flipbook) => (
          <Card
            key={flipbook.id}
            className="group relative overflow-hidden rounded-2xl shadow-lg bg-white transition-transform hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative h-56 bg-gray-100 flex items-center justify-center">
              <img
                src={flipbook.cover_image || PLACEHOLDER}
                alt={flipbook.title}
                className="w-full h-full object-cover object-center transition-opacity duration-300 group-hover:opacity-80"
                onError={e => { e.currentTarget.src = PLACEHOLDER; }}
              />
              {/* Overlay actions on hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                <Link to={`/view/${flipbook.id}`} title="Read">
                  <Button size="icon" className="bg-white/90 hover:bg-white text-gray-800 shadow-lg" aria-label="Read">
                    <Eye className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                  aria-label="Edit"
                  onClick={() => onEdit(flipbook)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  className="bg-white/90 hover:bg-white text-red-600 shadow-lg"
                  aria-label="Delete"
                  onClick={() => handleDeleteClick(flipbook)}
                  disabled={deleteFlipbook.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">{flipbook.title}</CardTitle>
              {flipbook.description && (
                <CardDescription className="line-clamp-2 text-gray-500 mb-2">{flipbook.description}</CardDescription>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant={flipbook.is_published ? 'default' : 'secondary'}>
                  {flipbook.is_published ? 'Published' : 'Draft'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {flipbook.visibility}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Updated {new Date(flipbook.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flipbook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{flipbookToDelete?.title}"? This action cannot be undone and will permanently remove the flipbook and all its associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteFlipbook.isPending}
            >
              {deleteFlipbook.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FlipbookList;
