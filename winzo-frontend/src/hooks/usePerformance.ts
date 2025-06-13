import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UsePerformanceOptions {
  enableCaching?: boolean;
  cacheTTL?: number;
  enableMonitoring?: boolean;
  enableLazyLoading?: boolean;
}

// Lazy loading hook
export const useLazyLoad = (callback: () => void, options: IntersectionObserverInit = {}) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return elementRef;
};

// Image optimization hook
export const useImageOptimization = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    const optimizeImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if browser supports WebP
        const supportsWebP = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
        });

        // Generate optimized URL
        let optimizedUrl = src;
        
        // Add width/height parameters if provided
        if (options.width || options.height) {
          const url = new URL(src, window.location.origin);
          if (options.width) url.searchParams.set('w', options.width.toString());
          if (options.height) url.searchParams.set('h', options.height.toString());
          if (options.quality) url.searchParams.set('q', options.quality.toString());
          if (supportsWebP && options.format === 'webp') {
            url.searchParams.set('f', 'webp');
          }
          optimizedUrl = url.toString();
        }

        setOptimizedSrc(optimizedUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to optimize image');
      } finally {
        setIsLoading(false);
      }
    };

    optimizeImage();
  }, [src, options.width, options.height, options.quality, options.format]);

  return { optimizedSrc, isLoading, error };
};

// Debounced function hook
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => func(...args), delay);
  }) as T;
};

// Throttled function hook
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0);

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      func(...args);
    }
  }) as T;
};

export const usePerformance = (options: UsePerformanceOptions = {}) => {
  const {
    enableCaching = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    enableMonitoring = true
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  });

  const cache = useRef<Map<string, CacheItem<any>>>(new Map());
  const performanceStart = useRef<number>(performance.now());

  // Performance monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    const measurePerformance = () => {
      const loadTime = performance.now() - performanceStart.current;
      
      // Measure memory usage if available
      const memoryUsage = (performance as any).memory 
        ? (performance as any).memory.usedJSHeapSize / 1024 / 1024 
        : 0;

      // Count network requests
      const networkRequests = performance.getEntriesByType('resource').length;

      setMetrics(prev => ({
        ...prev,
        loadTime,
        memoryUsage,
        networkRequests
      }));
    };

    // Measure initial load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [enableMonitoring]);

  // Cache management
  const getCachedData = useCallback(<T>(key: string): T | null => {
    if (!enableCaching) return null;

    const item = cache.current.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      cache.current.delete(key);
      return null;
    }

    return item.data;
  }, [enableCaching]);

  const setCachedData = useCallback(<T>(key: string, data: T, ttl?: number): void => {
    if (!enableCaching) return;

    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || cacheTTL
    });
  }, [enableCaching, cacheTTL]);

  const clearCache = useCallback((key?: string): void => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  // Performance reporting
  const reportPerformance = useCallback((componentName: string, additionalData?: any) => {
    if (!enableMonitoring) return;

    const report = {
      component: componentName,
      timestamp: new Date().toISOString(),
      metrics,
      additionalData
    };

    // Send to analytics service (replace with your service)
    console.log('Performance Report:', report);
    
    // In production, send to your analytics service
    // analytics.track('performance', report);
  }, [metrics, enableMonitoring]);

  return {
    metrics,
    getCachedData,
    setCachedData,
    clearCache,
    reportPerformance
  };
};

// Preload hook for critical resources
export const usePreload = (urls: string[]) => {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = url.endsWith('.css') ? 'style' : 'fetch';
      document.head.appendChild(link);
    });
  }, [urls]);
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
}; 