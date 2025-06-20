// WINZO Performance Optimization Utilities
// Comprehensive performance improvements for production-ready application

import React from 'react';

// Type declarations for browser APIs
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
  
  interface Navigator {
    connection?: {
      saveData?: boolean;
      effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
      addEventListener?: (event: string, handler: () => void) => void;
    };
  }
  
  interface PerformanceEntry {
    processingStart?: number;
  }
}

/**
 * Image optimization and lazy loading
 */
export const optimizeImage = (src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}) => {
  const { width, height } = options || {};
  
  // For production, this would integrate with image CDN
  // For now, return optimized parameters
  return {
    src,
    srcSet: width && height ? `${src} 1x, ${src} 2x` : undefined,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    style: { 
      aspectRatio: width && height ? `${width}/${height}` : undefined,
      objectFit: 'cover' as const
    }
  };
};

/**
 * Component lazy loading with suspense
 */
export const lazyLoadComponent = (importFn: () => Promise<any>) => {
  return React.lazy(() => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Component load timeout'));
      }, 10000); // 10 second timeout
      
      importFn()
        .then((module) => {
          clearTimeout(timer);
          resolve(module);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  });
};

/**
 * API request optimization with caching
 */
const apiCache = new Map<string, { data: any; timestamp: number; expires: number }>();

export const cachedApiRequest = async (
  url: string, 
  options?: RequestInit,
  cacheTime: number = 5 * 60 * 1000 // 5 minutes default
) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cached.expires) {
    return cached.data;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expires: cacheTime
    });
    
    return data;
  } catch (error) {
    console.error('Cached API request failed:', error);
    throw error;
  }
};

/**
 * Memory optimization - cleanup cached data
 */
export const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > value.expires) {
      apiCache.delete(key);
    }
  }
};

/**
 * Debounced function for search and input optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttled function for scroll and resize events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Virtual scrolling for large lists
 */
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (event: React.UIEvent<HTMLElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    }
  };
};

/**
 * Intersection Observer for lazy loading
 */
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const elementRef = React.useRef<HTMLElement>(null);
  
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [callback, options]);
  
  return elementRef;
};

/**
 * Service Worker registration for PWA features
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update notification
              if (window.confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('SW registration failed: ', error);
    }
  }
};

/**
 * Bundle splitting and code optimization
 */
export const preloadRoute = (routePath: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = routePath;
  document.head.appendChild(link);
};

/**
 * Performance monitoring
 */
export const performanceMonitor = {
  // Mark performance measurements
  mark: (name: string) => {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
  },
  
  // Measure time between marks
  measure: (name: string, startMark: string, endMark?: string) => {
    if ('performance' in window && performance.measure) {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      if (measures.length > 0) {
        console.log(`${name}: ${measures[measures.length - 1].duration}ms`);
      }
    }
  },
  
  // Get Core Web Vitals
  getCoreWebVitals: () => {
    if ('performance' in window) {
      return {
        FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
        FID: performance.getEntriesByType('first-input')[0]?.processingStart,
        CLS: performance.getEntriesByType('layout-shift').reduce((sum, entry: any) => {
          return sum + (entry.hadRecentInput ? 0 : entry.value);
        }, 0)
      };
    }
    return null;
  }
};

/**
 * Memory usage monitoring
 */
export const memoryMonitor = {
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  },
  
  logMemoryUsage: () => {
    const usage = memoryMonitor.getMemoryUsage();
    if (usage) {
      console.log(`Memory: ${(usage.used / 1048576).toFixed(2)}MB / ${(usage.total / 1048576).toFixed(2)}MB`);
    }
  }
};

/**
 * Battery optimization for mobile devices
 */
export const batteryOptimization = {
  reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  lowPowerMode: () => {
    // Check if device is in low power mode (approximation)
    return navigator.connection?.saveData || 
           navigator.connection?.effectiveType === 'slow-2g' ||
           navigator.connection?.effectiveType === '2g';
  },
  
  adaptInterface: (callback: (isLowPower: boolean) => void) => {
    const isLowPower = batteryOptimization.lowPowerMode();
    callback(isLowPower);
    
    // Listen for connection changes
    if (navigator.connection && navigator.connection.addEventListener) {
      navigator.connection.addEventListener('change', () => {
        callback(batteryOptimization.lowPowerMode());
      });
    }
  }
};

// Auto-cleanup on app unmount
window.addEventListener('beforeunload', () => {
  cleanupCache();
  performanceMonitor.mark('app-unload');
});

// Initialize performance monitoring
performanceMonitor.mark('app-start');

const PerformanceUtils = {
  optimizeImage,
  lazyLoadComponent,
  cachedApiRequest,
  cleanupCache,
  debounce,
  throttle,
  useVirtualScroll,
  useIntersectionObserver,
  registerServiceWorker,
  preloadRoute,
  performanceMonitor,
  memoryMonitor,
  batteryOptimization
};

export default PerformanceUtils; 