import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { useFlipbookPages } from '@/hooks/useFlipbookPages';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

interface FlipbookViewerProps {
  flipbookId: string;
  onClose?: () => void;
}

const FlipbookViewer = ({ flipbookId, onClose }: FlipbookViewerProps) => {
  const { data: pages, isLoading, error, refetch } = useFlipbookPages(flipbookId);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  console.log('FlipbookViewer - flipbookId:', flipbookId);
  console.log('FlipbookViewer - pages:', pages);
  console.log('FlipbookViewer - isLoading:', isLoading);
  console.log('FlipbookViewer - error:', error);

  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrentPage(api.selectedScrollSnap());
    });
  }, [api]);

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
    if (api && currentPage > 0) {
      api.scrollTo(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (api && pages && currentPage < pages.length - 1) {
      api.scrollTo(currentPage + 1);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading flipbook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('FlipbookViewer error:', error);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl text-red-400 mb-4">Error loading flipbook</p>
          <p className="text-sm text-gray-400 mb-4">{error.message}</p>
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No pages found in this flipbook</p>
          <p className="text-sm text-gray-400 mb-4">The PDF might still be processing or there was an error during conversion.</p>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Controls */}
      <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onClose && (
            <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
              <Home className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <span className="text-sm text-gray-300">
            Page {currentPage + 1} of {pages.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => setZoom(1)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-300 px-2">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                setIsFullscreen(true);
              } else {
                document.exitFullscreen();
                setIsFullscreen(false);
              }
            }}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Viewer */}
      <div className="flex-1 relative overflow-hidden">
        <Carousel
          setApi={setApi}
          className="w-full h-full"
          opts={{
            align: "center",
            loop: false,
          }}
        >
          <CarouselContent className="h-screen">
            {pages.map((page, index) => (
              <CarouselItem key={page.id} className="flex items-center justify-center p-8">
                <div 
                  className="relative max-w-full max-h-full flex items-center justify-center"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <Card className="shadow-2xl overflow-hidden bg-white relative">
                    {imageLoadingStates[page.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    )}
                    <img
                      src={page.image_url}
                      alt={`Page ${page.page_number}`}
                      className="max-w-full max-h-[80vh] object-contain block"
                      style={{ 
                        maxWidth: '800px',
                        minHeight: '400px',
                        backgroundColor: '#f8f9fa'
                      }}
                      onLoadStart={() => handleImageLoadStart(page.id)}
                      onLoad={() => handleImageLoad(page.id)}
                      onError={() => handleImageError(page.id, page.image_url)}
                    />
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={() => {
              if (api && currentPage > 0) {
                api.scrollTo(currentPage - 1);
              }
            }}
            disabled={currentPage === 0}
          />
          <CarouselNext 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={() => {
              if (api && pages && currentPage < pages.length - 1) {
                api.scrollTo(currentPage + 1);
              }
            }}
            disabled={currentPage === pages.length - 1}
          />
        </Carousel>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-black/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => {
              if (api && currentPage > 0) {
                api.scrollTo(currentPage - 1);
              }
            }}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPage ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={() => {
              if (api && currentPage < pages.length - 1) {
                api.scrollTo(currentPage + 1);
              }
            }}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            disabled={currentPage === pages.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlipbookViewer;
