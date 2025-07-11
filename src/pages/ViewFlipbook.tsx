import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import FlipbookViewer from '@/components/flipbooks/FlipbookViewer';
import { useAuth } from '@/hooks/useAuth';

const ViewFlipbook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClose = () => {
    if (user) {
      navigate('/my-flipbooks');
    } else {
      navigate('/');
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-center">
          <p className="text-xl">Flipbook not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FlipbookViewer flipbookId={id} onClose={handleClose} />
    </div>
  );
};

export default ViewFlipbook;
