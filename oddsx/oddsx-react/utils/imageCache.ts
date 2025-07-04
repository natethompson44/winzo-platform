import React, { useState, useEffect } from 'react';

/**
 * Enhanced Image Cache Utility
 * Prevents duplicate image requests and improves performance
 */

interface CacheItem {
  src: string;
  loaded: boolean;
  failed: boolean;
  timestamp: number;
}

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  failedRequests: number;
  duplicateRequests: number;
}

class ImageCache {
  private cache = new Map<string, CacheItem>();
  private pendingRequests = new Map<string, Promise<HTMLImageElement>>();
  private stats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    failedRequests: 0,
    duplicateRequests: 0
  };
  
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_CACHE_SIZE = 500;

  /**
   * Load image with caching and deduplication
   */
  async loadImage(src: string): Promise<HTMLImageElement> {
    this.stats.totalRequests++;

    // Check cache first
    const cached = this.cache.get(src);
    if (cached) {
      // Check if cache item is still valid
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        if (cached.loaded) {
          this.stats.cacheHits++;
          return this.createImageElement(src);
        }
        if (cached.failed) {
          this.stats.cacheHits++;
          throw new Error(`Image failed to load: ${src}`);
        }
      } else {
        // Remove expired cache item
        this.cache.delete(src);
      }
    }

    // Check if there's already a pending request for this image
    const pendingRequest = this.pendingRequests.get(src);
    if (pendingRequest) {
      this.stats.duplicateRequests++;
      return pendingRequest;
    }

    // Create new request
    this.stats.cacheMisses++;
    const imagePromise = this.createImageRequest(src);
    this.pendingRequests.set(src, imagePromise);

    try {
      const image = await imagePromise;
      
      // Cache successful load
      this.cache.set(src, {
        src,
        loaded: true,
        failed: false,
        timestamp: Date.now()
      });

      this.pendingRequests.delete(src);
      this.cleanupCache();
      
      return image;
    } catch (error) {
      // Cache failed load to prevent repeated attempts
      this.cache.set(src, {
        src,
        loaded: false,
        failed: true,
        timestamp: Date.now()
      });

      this.pendingRequests.delete(src);
      this.stats.failedRequests++;
      
      throw error;
    }
  }

  /**
   * Create image element
   */
  private createImageElement(src: string): HTMLImageElement {
    const img = new Image();
    img.src = src;
    return img;
  }

  /**
   * Create actual image request
   */
  private createImageRequest(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`));
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }

  /**
   * Preload image without throwing errors
   */
  async preloadImage(src: string): Promise<boolean> {
    try {
      await this.loadImage(src);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Preload multiple images
   */
  async preloadImages(sources: string[]): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src));
    await Promise.allSettled(promises);
  }

  /**
   * Check if image is cached and available
   */
  isImageCached(src: string): boolean {
    const cached = this.cache.get(src);
    if (!cached) return false;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(src);
      return false;
    }
    
    return cached.loaded && !cached.failed;
  }

  /**
   * Check if image previously failed to load
   */
  hasImageFailed(src: string): boolean {
    const cached = this.cache.get(src);
    if (!cached) return false;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(src);
      return false;
    }
    
    return cached.failed;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;
      
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Clean up old cache entries
   */
  private cleanupCache(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    // Convert to array and sort by timestamp
    const entries = Array.from(this.cache.entries()).sort((a, b) => 
      a[1].timestamp - b[1].timestamp
    );

    // Remove oldest 25% of entries
    const removeCount = Math.floor(this.cache.size * 0.25);
    for (let i = 0; i < removeCount; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      failedRequests: 0,
      duplicateRequests: 0
    };
  }

  /**
   * Clear only failed requests to allow retry
   */
  clearFailedRequests(): void {
    for (const [key, value] of this.cache.entries()) {
      if (value.failed) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size info
   */
  getCacheInfo(): { size: number; maxSize: number; pendingRequests: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Create singleton instance
export const imageCache = new ImageCache();

/**
 * React hook for using image cache
 */
export function useImageCache() {
  return {
    loadImage: (src: string) => imageCache.loadImage(src),
    preloadImage: (src: string) => imageCache.preloadImage(src),
    preloadImages: (sources: string[]) => imageCache.preloadImages(sources),
    isImageCached: (src: string) => imageCache.isImageCached(src),
    hasImageFailed: (src: string) => imageCache.hasImageFailed(src),
    getStats: () => imageCache.getStats(),
    clearCache: () => imageCache.clearCache(),
    clearFailedRequests: () => imageCache.clearFailedRequests(),
    getCacheInfo: () => imageCache.getCacheInfo()
  };
}

/**
 * Enhanced image component props
 */
export interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Performance optimized image component
 */
export function CachedImage({ 
  src, 
  alt, 
  className,
  width,
  height,
  fallbackSrc,
  onLoad,
  onError 
}: CachedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Check if image failed before
        if (imageCache.hasImageFailed(src)) {
          throw new Error('Image previously failed');
        }

        await imageCache.loadImage(src);
        
        if (!isCancelled) {
          setImageSrc(src);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        if (!isCancelled) {
          setHasError(true);
          setIsLoading(false);
          
          if (fallbackSrc) {
            setImageSrc(fallbackSrc);
          }
          
          onError?.();
        }
      }
    };

    loadImage();

    return () => {
      isCancelled = true;
    };
  }, [src, fallbackSrc, onLoad, onError]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    />
  );
}

export default imageCache; 