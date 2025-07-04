import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Home,
  Loader2,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useFlipbookPages } from '@/hooks/useFlipbookPages';

interface FlipbookViewerProps {
  flipbookId: string;
  onClose?: () => void;
}

const FlipbookViewer = ({ flipbookId, onClose }: FlipbookViewerProps) => {
  const { data: pages, isLoading, error, refetch } = useFlipbookPages(flipbookId);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  console.log('FlipbookViewer - flipbookId:', flipbookId);
  console.log('FlipbookViewer - pages:', pages);
  console.log('FlipbookViewer - isLoading:', isLoading);
  console.log('FlipbookViewer - error:', error);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/page-flip.mp3');
    audioRef.current.volume = 0.3;
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  const playFlipSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Handle audio play failure silently
      });
    }
  };

  const handleImageLoad = (pageId: string) => {
    console.log(`Image loaded for page ${pageId}`);
    setImageLoadingStates(prev => ({ ...prev, [pageId]: false }));
  };

  const handleImageLoadStart = (pageId: string) => {
    console.log(`Image loading started for page ${pageId}`);
    setImageLoadingStates(prev => ({ ...prev, [pageId]: true }));
  };

  const handleImageError = (pageId: string, imageUrl: string) => {
    console.error(`Failed to load image for page ${pageId}:`, imageUrl);
    setImageLoadingStates(prev => ({ ...prev, [pageId]: false }));
  };

  const handleRefresh = () => {
    console.log('Refreshing flipbook pages...');
    refetch();
  };

  const handlePrevPage = () => {
    if (!pages || currentPage <= 0 || isFlipping) return;
    
    setIsFlipping(true);
    playFlipSound();
    
    setTimeout(() => {
      setCurrentPage(prev => Math.max(prev - 2, 0));
      setIsFlipping(false);
    }, 300);
  };

  const handleNextPage = () => {
    if (!pages || currentPage >= pages.length - 1 || isFlipping) return;
    
    setIsFlipping(true);
    playFlipSound();
    
    setTimeout(() => {
      setCurrentPage(prev => Math.min(prev + 2, pages.length - 1));
      setIsFlipping(false);
    }, 300);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (event.key === 'ArrowRight') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentPage, pages, isFlipping]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-amber-800">Loading flipbook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('FlipbookViewer error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Error loading flipbook</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Back to Flipbooks
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4 text-amber-800">No pages found in this flipbook</p>
          <p className="text-sm text-gray-600 mb-4">The PDF might still be processing or there was an error during conversion.</p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Back to Flipbooks
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Get current pages for book spread
  const leftPage = currentPage > 0 ? pages[currentPage - 1] : null;
  const rightPage = pages[currentPage];
  const totalPages = Math.ceil(pages.length / 2);
  const currentSpread = Math.floor(currentPage / 2) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header Controls */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-amber-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onClose && (
            <Button onClick={onClose} variant="ghost" className="text-amber-800 hover:bg-amber-100">
              <Home className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <span className="text-sm text-amber-700">
            Spread {currentSpread} of {totalPages}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleResetZoom}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <span className="text-sm text-amber-700 px-2">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Book Viewer */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[calc(100vh-120px)] p-8">
        <div className="relative" style={{ transform: `scale(${zoom})` }}>
          {/* Book Container */}
          <div className="relative">
            {/* Book Shadow */}
            <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/20 blur-xl rounded-full" />
            
            {/* Book Spine Shadow */}
            <div className="absolute top-4 bottom-4 left-1/2 w-2 bg-black/30 blur-sm transform -translate-x-1/2" />
            
            {/* Main Book */}
            <div className={`
              relative bg-amber-100 border-4 border-amber-200 rounded-lg shadow-2xl
              transition-all duration-300 ${isFlipping ? 'animate-pulse' : ''}
            `}>
              <div className="flex">
                {/* Left Page */}
                <div className="relative w-80 h-96 border-r-2 border-amber-300">
                  {leftPage ? (
                    <div className="w-full h-full p-4 bg-white rounded-l-md">
                      {imageLoadingStates[leftPage.id] && (
                        <div className="absolute inset-4 flex items-center justify-center bg-gray-100 rounded">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      )}
                      <img
                        src={leftPage.image_url}
                        alt={`Page ${leftPage.page_number}`}
                        className="w-full h-full object-contain rounded"
                        onLoadStart={() => handleImageLoadStart(leftPage.id)}
                        onLoad={() => handleImageLoad(leftPage.id)}
                        onError={() => handleImageError(leftPage.id, leftPage.image_url)}
                      />
                      <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                        {leftPage.page_number}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full p-4 bg-amber-50 rounded-l-md flex items-center justify-center">
                      <div className="text-amber-400 text-center">
                        <div className="text-6xl font-serif mb-4">📖</div>
                        <div className="text-lg font-serif">Start Reading</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Page */}
                <div className="relative w-80 h-96">
                  {rightPage ? (
                    <div className="w-full h-full p-4 bg-white rounded-r-md">
                      {imageLoadingStates[rightPage.id] && (
                        <div className="absolute inset-4 flex items-center justify-center bg-gray-100 rounded">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      )}
                      <img
                        src={rightPage.image_url}
                        alt={`Page ${rightPage.page_number}`}
                        className="w-full h-full object-contain rounded"
                        onLoadStart={() => handleImageLoadStart(rightPage.id)}
                        onLoad={() => handleImageLoad(rightPage.id)}
                        onError={() => handleImageError(rightPage.id, rightPage.image_url)}
                      />
                      <div className="absolute bottom-2 right-4 text-xs text-gray-500">
                        {rightPage.page_number}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full p-4 bg-amber-50 rounded-r-md flex items-center justify-center">
                      <div className="text-amber-400 text-center">
                        <div className="text-6xl font-serif mb-4">📚</div>
                        <div className="text-lg font-serif">The End</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          onClick={handlePrevPage}
          disabled={currentPage <= 0 || isFlipping}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-800 shadow-lg border border-amber-300"
          size="sm"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          onClick={handleNextPage}
          disabled={currentPage >= pages.length - 1 || isFlipping}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-800 shadow-lg border border-amber-300"
          size="sm"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-amber-200 p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={handlePrevPage}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
            disabled={currentPage <= 0 || isFlipping}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {/* Page Indicators */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isFlipping) {
                    setCurrentPage(index * 2);
                    playFlipSound();
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  Math.floor(currentPage / 2) === index 
                    ? 'bg-amber-600 scale-110' 
                    : 'bg-amber-300 hover:bg-amber-400'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNextPage}
            variant="ghost"
            size="sm"
            className="text-amber-800 hover:bg-amber-100"
            disabled={currentPage >= pages.length - 1 || isFlipping}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="text-center mt-2 text-xs text-amber-600">
          Use arrow keys or click arrows to turn pages
        </div>
      </div>
    </div>
  );
};

export default FlipbookViewer;