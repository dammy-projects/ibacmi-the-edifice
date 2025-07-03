
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import FlipbookViewer from '@/components/flipbooks/FlipbookViewer';

const ViewFlipbook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/my-flipbooks');
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Flipbook not found</p>
        </div>
      </div>
    );
  }

  return <FlipbookViewer flipbookId={id} onClose={handleClose} />;
};

export default ViewFlipbook;
