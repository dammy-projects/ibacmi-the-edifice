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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] relative overflow-hidden">
        {/* Geometric SVG accents */}
        <svg className="absolute top-0 left-0 w-1/2 h-1/2 opacity-10" viewBox="0 0 400 400" fill="none"><circle cx="200" cy="200" r="180" stroke="#bdbdbd" strokeWidth="2" /></svg>
        <svg className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-10" viewBox="0 0 300 300" fill="none"><circle cx="150" cy="150" r="120" stroke="#bdbdbd" strokeWidth="2" /></svg>
        <div className="text-foreground text-center bg-white/80 rounded-lg p-8 shadow-2xl z-10">
          <p className="text-xl">Flipbook not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] relative overflow-hidden">
      {/* Geometric SVG accents */}
      <svg className="absolute top-0 left-0 w-1/2 h-1/2 opacity-10" viewBox="0 0 400 400" fill="none"><circle cx="200" cy="200" r="180" stroke="#bdbdbd" strokeWidth="2" /></svg>
      <svg className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-10" viewBox="0 0 300 300" fill="none"><circle cx="150" cy="150" r="120" stroke="#bdbdbd" strokeWidth="2" /></svg>
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {/* Book shadow and container for 3D effect */}
        <div className="rounded-2xl shadow-2xl bg-white/95 p-2 md:p-6 flex items-center justify-center" style={{boxShadow:'0 8px 40px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 #e0e0e0'}}>
          <FlipbookViewer flipbookId={id} onClose={handleClose} />
        </div>
      </div>
    </div>
  );
};

export default ViewFlipbook;
