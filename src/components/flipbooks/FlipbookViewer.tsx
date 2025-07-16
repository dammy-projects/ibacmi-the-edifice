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
  Minimize2,
  Home,
  Loader2,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useFlipbookPages } from '@/hooks/useFlipbookPages';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Touch/swipe gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialTouch, setInitialTouch] = useState<{ x: number; y: number } | null>(null);

  // Pinch-to-zoom state for mobile
  const [isPinching, setIsPinching] = useState(false);
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Page flip animation state
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [flippingPage, setFlippingPage] = useState<number | null>(null);

  console.log('FlipbookViewer - flipbookId:', flipbookId);
  console.log('FlipbookViewer - pages:', pages);
  console.log('FlipbookViewer - isLoading:', isLoading);
  console.log('FlipbookViewer - error:', error);
  console.log('FlipbookViewer - isMobile:', isMobile);

  // Calculate book dimensions based on viewport
  const calculateBookDimensions = () => {
    if (!viewerRef.current) return { width: 400, height: 566 }; // Fallback
    
    const viewportWidth = viewerRef.current.clientWidth;
    const viewportHeight = viewerRef.current.clientHeight - (isFullscreen ? 80 : 120); // Account for header
    
    const MARGIN = isMobile ? 20 : 40; // Smaller margin on mobile
    
    if (isMobile) {
      // Mobile: single page view with better proportions
      const maxWidth = Math.min(viewportWidth - MARGIN, 500); // Cap max width on mobile
      const maxHeight = viewportHeight - MARGIN;
      
      // Use a reasonable mobile ratio (4:3) for better viewing
      const mobileRatio = 1.4; // height/width ratio for mobile viewing
      
      if (maxWidth * mobileRatio <= maxHeight) {
        return { width: maxWidth, height: maxWidth * mobileRatio };
      } else {
        return { width: maxHeight / mobileRatio, height: maxHeight };
      }
    } else {
      // Desktop: two-page spread with better proportions
      const maxWidth = Math.min(viewportWidth - MARGIN, 1200); // Cap max width on desktop
      const maxHeight = viewportHeight - MARGIN;
      
      // For desktop spread, use a more appropriate ratio
      const spreadRatio = 0.7; // height/width ratio for two-page spread
      
      if (maxWidth * spreadRatio <= maxHeight) {
        return { width: maxWidth, height: maxWidth * spreadRatio };
      } else {
        return { width: maxHeight / spreadRatio, height: maxHeight };
      }
    }
  };

  const [bookDimensions, setBookDimensions] = useState(calculateBookDimensions());

  // Update book dimensions on resize and mount
  useEffect(() => {
    const handleResize = () => {
      setBookDimensions(calculateBookDimensions());
    };

    // Initial calculation when component mounts
    const timer = setTimeout(() => {
      setBookDimensions(calculateBookDimensions());
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isMobile, isFullscreen]);

  // Recalculate dimensions when viewport or mobile state changes
  useEffect(() => {
    if (viewerRef.current) {
      setBookDimensions(calculateBookDimensions());
    }
  }, [isFullscreen, isMobile]);

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get center point between two touches
  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

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

  const animatePageFlip = (direction: 'left' | 'right', targetPage: number) => {
    setFlipDirection(direction);
    setFlippingPage(targetPage);
    setFlipProgress(0);
    setIsFlipping(true);
    playFlipSound();

    // Animate the flip progress
    const startTime = Date.now();
    const duration = 600; // 600ms for the flip animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setFlipProgress(easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        setCurrentPage(targetPage);
        setIsFlipping(false);
        setFlipDirection(null);
        setFlipProgress(0);
        setFlippingPage(null);
      }
    };

    requestAnimationFrame(animate);
  };

  const handlePrevPage = () => {
    if (!pages || isFlipping) return;
    
    const targetPage = isMobile ? Math.max(currentPage - 1, 0) : Math.max(currentPage - 2, 0);
    if (targetPage !== currentPage) {
      animatePageFlip('right', targetPage);
    }
  };

  const handleNextPage = () => {
    if (!pages || isFlipping) return;
    
    const targetPage = isMobile ? Math.min(currentPage + 1, pages.length - 1) : Math.min(currentPage + 2, pages.length - 1);
    if (targetPage !== currentPage) {
      animatePageFlip('left', targetPage);
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

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (viewerRef.current) {
          await viewerRef.current.requestFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback for browsers that don't support fullscreen API
      if (isMobile) {
        // For mobile, we can try to use screen orientation API
        try {
          if (screen.orientation && 'lock' in screen.orientation) {
            await (screen.orientation as any).lock('landscape');
            setIsFullscreen(true);
          }
        } catch (orientationError) {
          console.error('Orientation lock error:', orientationError);
        }
      }
    }
  };

  // Auto fullscreen if not already in fullscreen
  useEffect(() => {
    if (!document.fullscreenElement) {
      toggleFullscreen();
    }
  });

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    if (e.touches.length === 1) {
      // Single touch - swipe/pan
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setInitialTouch({ x: touch.clientX, y: touch.clientY });
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      setIsPinching(false);
      setTouchEnd(null); // Reset touchEnd when starting new touch
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const center = getTouchCenter(touch1, touch2);
      
      setIsPinching(true);
      setLastPinchDistance(distance);
      setPinchCenter(center);
      setTouchStart(null);
      setInitialTouch(null);
      setTouchEnd(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    if (e.touches.length === 1 && !isPinching) {
      // Single touch move - swipe/pan
      if (!touchStart || !initialTouch) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - initialTouch.x;
      const deltaY = touch.clientY - initialTouch.y;
      
      if (zoom > 1) {
        // When zoomed in, allow panning
        e.preventDefault();
        setPanOffset({ x: deltaX, y: deltaY });
      } else {
        // When not zoomed, check for horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          e.preventDefault();
          setIsDragging(true);
          setDragOffset({ x: deltaX, y: deltaY });
        }
      }
    } else if (e.touches.length === 2 && isPinching) {
      // Two touches - pinch to zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const center = getTouchCenter(touch1, touch2);
      
      if (lastPinchDistance > 0) {
        const pinchScale = distance / lastPinchDistance;
        const newZoom = Math.max(0.5, Math.min(3, zoom * pinchScale));
        setZoom(newZoom);
      }
      
      setLastPinchDistance(distance);
      setPinchCenter(center);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    if (e.touches.length === 0) {
      // All touches ended
      if (isPinching) {
        setIsPinching(false);
        setLastPinchDistance(0);
      } else if (touchStart && zoom <= 1 && !isDragging) {
        // Handle tap when not zoomed and not dragging
        const touch = e.changedTouches[0];
        setTouchEnd({ x: touch.clientX, y: touch.clientY });
      } else if (touchStart && zoom <= 1 && isDragging) {
        // Handle swipe when dragging occurred
        const touch = e.changedTouches[0];
        const distanceX = touchStart.x - touch.clientX;
        const distanceY = touchStart.y - touch.clientY;
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
        const minSwipeDistance = 20; // Reduced threshold for better responsiveness

        console.log('Swipe detection:', { distanceX, distanceY, isHorizontalSwipe, minSwipeDistance });

        if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
          if (distanceX > 0) {
            // Swipe left - next page
            console.log('Swiping to next page');
            handleNextPage();
          } else {
            // Swipe right - previous page
            console.log('Swiping to previous page');
            handlePrevPage();
          }
        }
      }
      
      // Reset drag and pan state
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      setPanOffset({ x: 0, y: 0 });
      setInitialTouch(null);
      
      // Reset touch states after a short delay to ensure swipe detection works
      setTimeout(() => {
        setTouchStart(null);
        setTouchEnd(null);
      }, 10);
    }
  };

  // Process swipe gesture - keep this as backup for tap-based swipes
  useEffect(() => {
    if (!touchStart || !touchEnd || isPinching || zoom > 1 || isDragging) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const minSwipeDistance = 20; // Reduced threshold for better responsiveness

    console.log('Backup swipe detection:', { distanceX, distanceY, isHorizontalSwipe, minSwipeDistance });

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - next page
        console.log('Backup: Swiping to next page');
        handleNextPage();
      } else {
        // Swipe right - previous page
        console.log('Backup: Swiping to previous page');
        handlePrevPage();
      }
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchEnd, isPinching, zoom, isDragging]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleOrientationChange = () => {
      // Handle orientation changes for mobile
      if (isMobile && screen.orientation && 'type' in screen.orientation) {
        setIsFullscreen((screen.orientation as any).type.includes('landscape'));
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (event.key === 'ArrowRight') {
        handleNextPage();
      } else if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      } else if (event.key === 'f' || event.key === 'F') {
        // Toggle fullscreen with 'f' key
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentPage, pages, isFlipping, isMobile, isFullscreen]);

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
  const totalPages = isMobile ? pages.length : Math.ceil(pages.length / 2);
  const currentSpread = isMobile ? currentPage + 1 : Math.floor(currentPage / 2) + 1;

  // Calculate flip animation transforms
  const getFlipTransform = () => {
    if (!isFlipping || !flipDirection) return '';

    const rotateY = flipDirection === 'left' ? -180 * flipProgress : 180 * flipProgress;
    const translateZ = 20 * Math.sin(flipProgress * Math.PI); // 3D effect
    const scaleX = 1 - 0.1 * Math.sin(flipProgress * Math.PI); // Slight scale effect

    return `perspective(1000px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scaleX(${scaleX})`;
  };

  const getFlipShadow = () => {
    if (!isFlipping || !flipDirection) return '';

    const shadowOpacity = flipProgress * 0.3;
    const shadowBlur = 10 + flipProgress * 20;
    const shadowOffset = flipDirection === 'left' ? -10 * flipProgress : 10 * flipProgress;

    return `0 ${shadowOffset}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`;
  };

  // Get the page that should be animated based on flip direction and current view
  const getAnimatedPage = () => {
    if (!isFlipping || !flipDirection) return null;
    
    if (isMobile) {
      // On mobile, always animate the current page
      return rightPage;
    } else {
      // On desktop, animate the appropriate page based on direction
      if (flipDirection === 'left') {
        // Going forward - animate the right page
        return rightPage;
      } else {
        // Going backward - animate the left page
        return leftPage;
      }
    }
  };

  const animatedPage = getAnimatedPage();

  return (
    <div
      ref={viewerRef}
      className={`relative flex flex-col items-center justify-center w-full h-full min-h-[70vh] transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
      style={{ background: 'transparent' }}
    >
      {/* Book and Navigation */}
      <div className="relative flex items-center justify-center w-full" style={{ minHeight: bookDimensions.height + 64 }}>
        {/* Left Arrow */}
        {!isMobile && (
          <Button
            onClick={handlePrevPage}
            disabled={currentPage <= 0 || isFlipping}
            className="absolute left-0 z-20 -translate-x-1/2 w-14 h-14 rounded-full bg-white/90 hover:bg-gray-100 text-gray-700 shadow-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
        )}
        {/* Book Container */}
        <div
          ref={bookRef}
          className="relative flex items-stretch justify-center bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{
            width: bookDimensions.width,
            height: bookDimensions.height,
            boxShadow: '0 8px 40px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 #e0e0e0',
          }}
        >
          {/* Spine/crease */}
          {!isMobile && (
            <div
              className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(180,180,180,0.10) 0%, rgba(180,180,180,0.30) 50%, rgba(180,180,180,0.10) 100%)',
                borderRadius: '1px',
                boxShadow: '0 0 16px 0 rgba(0,0,0,0.08)'
              }}
            />
          )}
          {/* Pages */}
          <div className={isMobile ? '' : 'flex h-full w-full'}>
            {/* Left Page (desktop) */}
            {!isMobile && (
              <div className="relative" style={{ width: bookDimensions.width / 2, height: bookDimensions.height }}>
                {leftPage ? (
                  <div 
                    className={`w-full h-full p-4 bg-white relative overflow-hidden ${
                      animatedPage?.id === leftPage.id ? '' : ''
                    }`}
                    style={{
                      borderRadius: '8px 0 0 8px',
                      transform: animatedPage?.id === leftPage.id ? getFlipTransform() : '',
                      boxShadow: animatedPage?.id === leftPage.id ? getFlipShadow() : '',
                      transformOrigin: flipDirection === 'right' ? 'right center' : 'left center',
                    }}
                  >
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
                  <div 
                    className="w-full h-full p-4 bg-amber-50 flex items-center justify-center"
                    style={{ borderRadius: '8px 0 0 8px' }}
                  >
                    <div className="text-amber-400 text-center">
                      <div className="text-6xl font-serif mb-4">📖</div>
                      <div className="text-lg font-serif">Start Reading</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right Page / Single Page (mobile) */}
            <div className="relative" style={{ width: isMobile ? bookDimensions.width : bookDimensions.width / 2, height: bookDimensions.height }}>
              {rightPage ? (
                <div 
                  className={`w-full h-full p-4 bg-white relative overflow-hidden`}
                  style={{
                    borderRadius: isMobile ? '8px' : '0 8px 8px 0',
                    transform: animatedPage?.id === rightPage.id ? getFlipTransform() : '',
                    boxShadow: animatedPage?.id === rightPage.id ? getFlipShadow() : '',
                    transformOrigin: flipDirection === 'left' ? 'left center' : 'right center',
                  }}
                >
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
                  <div className={`absolute bottom-2 text-xs text-gray-500 ${isMobile ? 'right-4' : 'right-4'}`}>
                    {rightPage.page_number}
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-full p-4 bg-amber-50 flex items-center justify-center"
                  style={{ borderRadius: isMobile ? '8px' : '0 8px 8px 0' }}
                >
                  <div className="text-amber-400 text-center">
                    <div className="text-6xl font-serif mb-4">📚</div>
                    <div className="text-lg font-serif">The End</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right Arrow */}
        {!isMobile && (
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= pages.length - 1 || isFlipping}
            className="absolute right-0 z-20 translate-x-1/2 w-14 h-14 rounded-full bg-white/90 hover:bg-gray-100 text-gray-700 shadow-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            aria-label="Next page"
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
        )}
      </div>
      {/* Toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/90 rounded-full shadow-lg border border-gray-200 px-6 py-2 backdrop-blur-md">
        <Button onClick={handleZoomOut} variant="ghost" size="icon" className="text-gray-700" disabled={zoom <= 0.5} aria-label="Zoom out">
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button onClick={handleResetZoom} variant="ghost" size="icon" className="text-gray-700" aria-label="Reset zoom">
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button onClick={handleZoomIn} variant="ghost" size="icon" className="text-gray-700" disabled={zoom >= 3} aria-label="Zoom in">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <span className="text-xs text-gray-500 px-2">{Math.round(zoom * 100)}%</span>
        <Button onClick={toggleFullscreen} variant="ghost" size="icon" className="text-gray-700" title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'} aria-label="Fullscreen">
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
        <Button onClick={() => setSoundEnabled(!soundEnabled)} variant="ghost" size="icon" className="text-gray-700" aria-label="Toggle sound">
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
        <Button onClick={handleRefresh} variant="ghost" size="icon" className="text-gray-700" aria-label="Refresh">
          <RefreshCw className="h-5 w-5" />
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-700" aria-label="Back to Flipbooks">
            <Home className="h-5 w-5" />
          </Button>
        )}
      </div>
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 w-full z-40 flex items-center justify-between bg-white/95 border-t border-gray-200 px-4 py-2 shadow-lg">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage <= 0 || isFlipping}
            className="w-14 h-14 rounded-full bg-gray-100 text-gray-700 shadow border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <span className="text-base text-gray-700 font-medium">
            Page {currentPage + 1} of {pages.length}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= pages.length - 1 || isFlipping}
            className="w-14 h-14 rounded-full bg-gray-100 text-gray-700 shadow border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            aria-label="Next page"
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
        </div>
      )}
      {/* Page number/progress */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-gray-500 text-sm bg-white/80 rounded-full px-4 py-1 shadow border border-gray-200">
        {isMobile
          ? `Page ${currentPage + 1} of ${pages.length}`
          : `Spread ${Math.floor(currentPage / 2) + 1} of ${Math.ceil(pages.length / 2)}`}
      </div>
      {/* Mobile navigation dots and swipe hints remain as before */}
      {isMobile && (
        <>
          <div className={`absolute left-1/2 transform -translate-x-1/2 flex space-x-2 transition-all duration-300 ${
            isFullscreen ? 'bottom-8' : 'bottom-4'
          }`}>
            {pages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentPage ? 'bg-amber-600' : 'bg-amber-300'
                }`}
              />
            ))}
          </div>
          <div className={`absolute left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs transition-all duration-300 ${
            isFullscreen ? 'top-8' : 'top-4'
          }`}>
            {zoom > 1 ? 'Drag to pan • Pinch to zoom' : 'Swipe left/right to navigate • Pinch to zoom'}
          </div>
          {isDragging && zoom <= 1 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`bg-black/30 text-white px-4 py-2 rounded-full text-sm transition-opacity duration-200 ${
                Math.abs(dragOffset.x) > 20 ? 'opacity-100' : 'opacity-50'
              }`}>
                {dragOffset.x > 20 ? '← Previous Page' : dragOffset.x < -20 ? 'Next Page →' : 'Swipe to navigate'}
              </div>
            </div>
          )}
        </>
      )}
      {/* Fullscreen Indicator */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
          <Maximize2 className="h-3 w-3" />
          Fullscreen Mode
        </div>
      )}
    </div>
  );
};

export default FlipbookViewer;