// ===================================
// WINZO PERFORMANCE OPTIMIZATION UTILITIES
// ===================================

import React from 'react';

// ===== LAZY LOADING FOR IMAGES =====

interface LazyImageOptions {
  rootMargin?: string;
  threshold?: number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const createLazyImage = (
  img: HTMLImageElement,
  src: string,
  options: LazyImageOptions = {}
) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallbackSrc,
    onLoad,
    onError
  } = options;

  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imageElement = entry.target as HTMLImageElement;
          
          // Add loading class
          imageElement.classList.add('loading');
          
          // Create new image to preload
          const newImg = new Image();
          
          newImg.onload = () => {
            imageElement.src = src;
            imageElement.classList.remove('loading');
            imageElement.classList.add('loaded');
            onLoad?.();
            observer.unobserve(imageElement);
          };
          
          newImg.onerror = () => {
            if (fallbackSrc) {
              imageElement.src = fallbackSrc;
            }
            imageElement.classList.remove('loading');
            imageElement.classList.add('error');
            onError?.();
            observer.unobserve(imageElement);
          };
          
          newImg.src = src;
        }
      });
    },
    {
      rootMargin,
      threshold
    }
  );

  observer.observe(img);
  
  return () => observer.unobserve(img);
};

// React hook for lazy images
export const useLazyImage = (src: string, options: LazyImageOptions = {}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const cleanup = createLazyImage(img, src, {
      ...options,
      onLoad: () => {
        setIsLoaded(true);
        options.onLoad?.();
      },
      onError: () => {
        setHasError(true);
        options.onError?.();
      }
    });

    return cleanup;
  }, [src, options]);

  return {
    imgRef,
    isLoaded,
    hasError,
    isInView: false // placeholder value since not currently used
  };
};

// ===== BUNDLE SIZE OPTIMIZATION =====

// Dynamic import helper with error handling
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

// ===== MEMORY MANAGEMENT =====

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryUsage: (): any => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },

  logMemoryUsage: (label: string = 'Memory Usage') => {
    const memory = memoryMonitor.getMemoryUsage();
    if (memory) {
      console.log(`${label}:`, {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  },

  checkMemoryPressure: (): boolean => {
    const memory = memoryMonitor.getMemoryUsage();
    if (!memory) return false;
    
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    return usageRatio > 0.8; // 80% threshold
  }
};

// ===== PERFORMANCE MONITORING =====

interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  start(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  end(name: string): PerformanceMetrics | null {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric = {
      ...metric,
      endTime,
      duration
    };

    this.metrics.set(name, completedMetric);
    return completedMetric;
  }

  getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceTracker = new PerformanceTracker();

// React hook for performance tracking
export const usePerformanceTracker = (name: string, dependencies: any[] = []) => {
  React.useEffect(() => {
    performanceTracker.start(name);
    
    return () => {
      const metric = performanceTracker.end(name);
      if (metric && metric.duration && metric.duration > 100) {
        console.warn(`Slow operation: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
    };
  }, [name, dependencies]);
};

// ===== NETWORK OPTIMIZATION =====

// Network status monitoring
export const networkMonitor = {
  getConnectionInfo: (): any => {
    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  },

  isSlowConnection: (): boolean => {
    const connection = networkMonitor.getConnectionInfo();
    if (!connection) return false;
    
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.downlink < 1.5;
  },

  getConnectionType: (): string => {
    const connection = networkMonitor.getConnectionInfo();
    return connection?.effectiveType || 'unknown';
  },

  onConnectionChange: (callback: (info: any) => void): (() => void) => {
    const connection = networkMonitor.getConnectionInfo();
    if (!connection) return () => {};

    const handleChange = () => callback(connection);
    connection.addEventListener('change', handleChange);
    
    return () => connection.removeEventListener('change', handleChange);
  }
};

// Simple fetch with timeout
export async function timeoutFetch(
  url: string, 
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ===== DEVICE OPTIMIZATION =====

export const deviceOptimization = {
  // Detect device capabilities
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  isIOS: (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  isAndroid: (): boolean => {
    return /Android/.test(navigator.userAgent);
  },

  hasTouch: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  getDeviceMemory: (): number => {
    return (navigator as any).deviceMemory || 4; // Default to 4GB
  },

  getCPUCores: (): number => {
    return navigator.hardwareConcurrency || 4; // Default to 4 cores
  },

  // Adaptive loading based on device capabilities
  shouldReduceAnimations: (): boolean => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }

    // Reduce animations on low-end devices
    const memory = deviceOptimization.getDeviceMemory();
    const cores = deviceOptimization.getCPUCores();
    
    return memory < 4 || cores < 4 || networkMonitor.isSlowConnection();
  },

  getOptimalImageQuality: (): number => {
    const memory = deviceOptimization.getDeviceMemory();
    const isSlowNetwork = networkMonitor.isSlowConnection();

    if (isSlowNetwork || memory < 2) return 0.6;
    if (memory < 4) return 0.8;
    return 1.0;
  }
};

// ===== VIRTUAL SCROLLING =====

interface VirtualScrollItem {
  id: string | number;
  height: number;
  data: any;
}

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  getItemHeight?: (index: number, item: any) => number;
}

export class VirtualScroller {
  private items: VirtualScrollItem[] = [];
  private options: VirtualScrollOptions;
  private scrollTop = 0;
  private containerHeight = 0;

  constructor(options: VirtualScrollOptions) {
    this.options = { overscan: 5, ...options };
    this.containerHeight = options.containerHeight;
  }

  setItems(items: any[]): void {
    this.items = items.map((item, index) => ({
      id: item.id || index,
      height: this.options.getItemHeight?.(index, item) || this.options.itemHeight,
      data: item
    }));
  }

  setScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  getVisibleRange(): { start: number; end: number; offset: number } {
    const { itemHeight, overscan = 5 } = this.options;
    
    let start = Math.floor(this.scrollTop / itemHeight);
    let end = Math.min(
      start + Math.ceil(this.containerHeight / itemHeight),
      this.items.length - 1
    );

    // Add overscan
    start = Math.max(0, start - overscan);
    end = Math.min(this.items.length - 1, end + overscan);

    const offset = start * itemHeight;

    return { start, end, offset };
  }

  getVisibleItems(): { items: VirtualScrollItem[]; totalHeight: number; offset: number } {
    const { start, end, offset } = this.getVisibleRange();
    const items = this.items.slice(start, end + 1);
    const totalHeight = this.items.length * this.options.itemHeight;

    return { items, totalHeight, offset };
  }
}

// React hook for virtual scrolling
export const useVirtualScroll = (
  items: any[],
  options: VirtualScrollOptions
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const scroller = React.useMemo(() => new VirtualScroller(options), [options]);

  React.useEffect(() => {
    scroller.setItems(items);
  }, [items, scroller]);

  React.useEffect(() => {
    scroller.setScrollTop(scrollTop);
  }, [scrollTop, scroller]);

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const visibleData = React.useMemo(() => {
    return scroller.getVisibleItems();
  }, [scroller]);

  return {
    ...visibleData,
    handleScroll
  };
};

const performanceUtils = {
  createLazyImage,
  useLazyImage,
  dynamicImport,
  debounce,
  throttle,
  memoryMonitor,
  performanceTracker,
  usePerformanceTracker,
  networkMonitor,
  timeoutFetch,
  VirtualScroller,
  useVirtualScroll,
  deviceOptimization
};

export default performanceUtils; 