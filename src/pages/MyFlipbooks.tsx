
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FlipbookForm from '@/components/flipbooks/FlipbookForm';
import FlipbookList from '@/components/flipbooks/FlipbookList';
import { type Flipbook } from '@/hooks/useFlipbooks';
import Header from '@/components/layout/Header';

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
      <div className="min-h-screen bg-background py-8">
        <Header />
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Flipbooks</h1>
            <p className="text-muted-foreground mt-1">Create and manage your digital flipbooks</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Flipbook
          </Button>
        </div>
        <FlipbookList onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default MyFlipbooks;
