import React, { useRef, useEffect, useState } from 'react';

interface SwipeHandlerProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: (startX: number, startY: number) => void;
  onSwipeEnd?: () => void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  velocityThreshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  deltaThreshold?: number;
}

interface TouchInfo {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

const SwipeHandler: React.FC<SwipeHandlerProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipeStart,
  onSwipeEnd,
  children,
  className = '',
  threshold = 50,
  velocityThreshold = 0.3,
  preventDefaultTouchmoveEvent = false,
  deltaThreshold = 10
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchInfo, setTouchInfo] = useState<TouchInfo | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const newTouchInfo: TouchInfo = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null
    };
    
    setTouchInfo(newTouchInfo);
    setIsTracking(true);
    
    if (onSwipeStart) {
      onSwipeStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchInfo || !isTracking) return;

    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchInfo.startX;
    const deltaY = touch.clientY - touchInfo.startY;
    const currentTime = Date.now();
    const deltaTime = currentTime - touchInfo.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    let direction: 'left' | 'right' | 'up' | 'down' | null = null;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > deltaThreshold) {
        direction = deltaX > 0 ? 'right' : 'left';
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > deltaThreshold) {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    setTouchInfo({
      ...touchInfo,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      velocity,
      direction
    });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchInfo || !isTracking) return;

    const deltaX = touchInfo.deltaX;
    const deltaY = touchInfo.deltaY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const velocity = touchInfo.velocity;

    // Determine if swipe meets threshold requirements
    const meetsDistanceThreshold = absDeltaX >= threshold || absDeltaY >= threshold;
    const meetsVelocityThreshold = velocity >= velocityThreshold;

    if (meetsDistanceThreshold || meetsVelocityThreshold) {
      // Determine swipe direction based on largest delta
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    setIsTracking(false);
    setTouchInfo(null);
    
    if (onSwipeEnd) {
      onSwipeEnd();
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmoveEvent });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchInfo, isTracking, preventDefaultTouchmoveEvent]);

  return (
    <div 
      ref={elementRef}
      className={`swipe-handler ${className}`}
      style={{ 
        touchAction: preventDefaultTouchmoveEvent ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};

// Hook for using swipe gestures
interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export const useSwipe = (options: UseSwipeOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX >= threshold || absDeltaY >= threshold || velocity >= velocityThreshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    setTouchStart(null);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
};

export default SwipeHandler; 