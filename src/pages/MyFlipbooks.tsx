
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FlipbookForm from '@/components/flipbooks/FlipbookForm';
import FlipbookList from '@/components/flipbooks/FlipbookList';
import { type Flipbook } from '@/hooks/useFlipbooks';

const MyFlipbooks = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingFlipbook, setEditingFlipbook] = useState<Flipbook | null>(null);

  const handleCreate = () => {
    setEditingFlipbook(null);
    setShowForm(true);
  };

  const handleEdit = (flipbook: Flipbook) => {
    setEditingFlipbook(flipbook);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFlipbook(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFlipbook(null);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <FlipbookForm
            flipbook={editingFlipbook || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Flipbooks</h1>
              <p className="text-gray-600 mt-1">Create and manage your digital flipbooks</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Flipbook
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <FlipbookList onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default MyFlipbooks;
