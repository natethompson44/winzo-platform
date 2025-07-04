/**
 * Image Cache & Preloading System
 * Eliminates excessive HTTP requests for team logos and sport icons
 */

interface ImageCacheEntry {
  url: string;
  loaded: boolean;
  failed: boolean;
  fallbackUrl?: string;
}

class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache = new Map<string, ImageCacheEntry>();
  private preloadedImages = new Set<string>();
  
  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  /**
   * Preload common images to prevent repeated requests
   */
  preloadCommonImages() {
    const commonImages = [
      // Sport icons
      '/images/icon/epl-icon.png',
      '/images/icon/soccer-icon.png',
      '/images/icon/laliga-icon.png',
      '/images/icon/bundesliga-icon.png',
      '/images/icon/seriea-icon.png',
      '/images/icon/ligue1-icon.png',
      '/images/icon/champions-league-icon.png',
      
      // Common UI icons
      '/images/icon/live.png',
      '/images/icon/play.png',
      '/images/icon/line-chart.png',
      '/images/icon/star2.png',
      '/images/icon/updwon.png',
      '/images/icon/t-shart.png',
      '/images/icon/live-match.png',
      '/images/icon/clock-icon.png',
      
      // Default fallback
      '/images/clubs/default-team.png'
    ];
    
    commonImages.forEach(src => this.preloadImage(src));
    console.log(`🎯 Preloaded ${commonImages.length} common images`);
  }

  /**
   * Preload a single image
   */
  private preloadImage(src: string) {
    if (this.preloadedImages.has(src)) return;
    
    const img = new Image();
    img.onload = () => {
      this.cache.set(src, { url: src, loaded: true, failed: false });
      this.preloadedImages.add(src);
    };
    img.onerror = () => {
      this.cache.set(src, { url: src, loaded: false, failed: true });
      this.preloadedImages.add(src);
    };
    img.src = src;
  }

  /**
   * Get optimized image URL with smart fallback
   */
  getOptimizedImageUrl(originalUrl: string, fallbackUrl?: string): string {
    // If we have a cached entry and it failed, return fallback immediately
    const cached = this.cache.get(originalUrl);
    if (cached?.failed && fallbackUrl) {
      return fallbackUrl;
    }
    
    // Return original URL (browser will handle caching)
    return originalUrl;
  }

  /**
   * Mark an image as failed to prevent future requests
   */
  markImageAsFailed(url: string, fallbackUrl?: string) {
    this.cache.set(url, { url, loaded: false, failed: true, fallbackUrl });
  }

  /**
   * Check if an image is likely to fail based on cache
   */
  isImageLikelyToFail(url: string): boolean {
    const cached = this.cache.get(url);
    return cached?.failed || false;
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const total = this.cache.size;
    const loaded = Array.from(this.cache.values()).filter(entry => entry.loaded).length;
    const failed = Array.from(this.cache.values()).filter(entry => entry.failed).length;
    
    return {
      total,
      loaded,
      failed,
      preloaded: this.preloadedImages.size,
      hitRate: total > 0 ? Math.round((loaded / total) * 100) : 0
    };
  }
}

// Export singleton instance
export const imageCache = ImageCacheManager.getInstance();

// Initialize preloading on module load
if (typeof window !== 'undefined') {
  // Delay preloading to avoid blocking initial page load
  setTimeout(() => {
    imageCache.preloadCommonImages();
  }, 1000);
}

/**
 * Optimized Image component wrapper
 */
export function useOptimizedImage(src: string, fallbackSrc?: string) {
  const optimizedSrc = imageCache.getOptimizedImageUrl(src, fallbackSrc);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    
    // Mark original as failed
    imageCache.markImageAsFailed(src, fallbackSrc);
    
    // Set fallback if available and not already set
    if (fallbackSrc && target.src !== fallbackSrc) {
      target.src = fallbackSrc;
    }
  };
  
  return {
    src: optimizedSrc,
    onError: handleImageError
  };
}

export default imageCache; 