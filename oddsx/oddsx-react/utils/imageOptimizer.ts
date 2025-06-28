/**
 * Image Optimization Service for WINZO Platform
 * 
 * This service provides:
 * - Image preloading and caching
 * - Optimized image delivery
 * - Fallback handling
 * - CDN-like functionality
 */

interface ImageCache {
  [key: string]: HTMLImageElement;
}

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  sizes?: string;
  critical?: boolean;
}

class ImageOptimizer {
  private cache: ImageCache = {};
  private preloadedImages = new Set<string>();
  private observer: IntersectionObserver | null = null;
  private pendingLoads = new Map<string, Promise<HTMLImageElement>>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeIntersectionObserver();
      this.preloadCriticalImages();
    }
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  private initializeIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              if (src) {
                this.loadImage(src).then(() => {
                  img.src = src;
                  img.classList.remove('lazy-loading');
                  img.classList.add('lazy-loaded');
                });
                this.observer?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );
    }
  }

  /**
   * Preload critical images that are likely to be used
   */
  private preloadCriticalImages() {
    const criticalImages = [
      '/images/clubs/default-team.png',
      '/images/icon/america-football.png',
      '/images/icon/updwon.png',
      '/images/icon/t-shart.png',
      '/images/icon/line-chart.png',
      '/images/icon/star2.png',
    ];

    criticalImages.forEach((src) => {
      this.preloadImage(src, { priority: 'high', critical: true });
    });
  }

  /**
   * Preload NFL team logos in batches
   */
  preloadNFLTeamLogos(teams: string[]) {
    const nflLogos = teams.map(team => this.getTeamLogoUrl(team));
    
    // Preload in batches of 5 to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < nflLogos.length; i += batchSize) {
      const batch = nflLogos.slice(i, i + batchSize);
      setTimeout(() => {
        batch.forEach(src => {
          this.preloadImage(src, { priority: 'medium' });
        });
      }, i * 100); // Stagger batches by 100ms
    }
  }

  /**
   * Get optimized team logo URL with fallback
   */
  getTeamLogoUrl(teamName: string): string {
    if (!teamName) return '/images/clubs/default-team.png';
    
    // Normalize team name for consistent logo paths
    const normalizedName = teamName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    return `/images/clubs/nfl/${normalizedName}.png`;
  }

  /**
   * Preload an image with caching
   */
  async preloadImage(src: string, config: PreloadConfig = { priority: 'medium' }): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.cache[src]) {
      return this.cache[src];
    }

    // Return pending load if already in progress
    if (this.pendingLoads.has(src)) {
      return this.pendingLoads.get(src)!;
    }

    // Create new image load promise
    const loadPromise = this.loadImage(src);
    this.pendingLoads.set(src, loadPromise);

    try {
      const img = await loadPromise;
      this.cache[src] = img;
      this.preloadedImages.add(src);
      this.pendingLoads.delete(src);
      
      // Add to document head for critical images
      if (config.critical) {
        this.addPreloadLink(src, config);
      }
      
      return img;
    } catch (error) {
      this.pendingLoads.delete(src);
      console.warn(`Failed to preload image: ${src}`, error);
      throw error;
    }
  }

  /**
   * Load an image and return promise
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Try fallback to default team image
        if (src !== '/images/clubs/default-team.png') {
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          fallbackImg.src = '/images/clubs/default-team.png';
        } else {
          reject(new Error(`Failed to load image: ${src}`));
        }
      };
      
      img.src = src;
    });
  }

  /**
   * Add preload link to document head
   */
  private addPreloadLink(src: string, config: PreloadConfig) {
    if (typeof document === 'undefined') return;
    
    // Don't add duplicate preload links
    if (document.querySelector(`link[href="${src}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.crossOrigin = 'anonymous';
    
    if (config.sizes) {
      link.setAttribute('imagesizes', config.sizes);
    }
    
    document.head.appendChild(link);
  }

  /**
   * Get cached image or trigger lazy load
   */
  getCachedImageSrc(src: string): string {
    // Return original src if already preloaded
    if (this.preloadedImages.has(src) || this.cache[src]) {
      return src;
    }
    
    // For non-critical images, return a data URL placeholder
    // and trigger preload in background
    this.preloadImage(src, { priority: 'low' });
    
    return src; // Return original src for Next.js Image component
  }

  /**
   * Setup lazy loading for an image element
   */
  setupLazyLoading(imgElement: HTMLImageElement, src: string) {
    if (!this.observer) return;
    
    imgElement.dataset.src = src;
    imgElement.classList.add('lazy-loading');
    this.observer.observe(imgElement);
  }

  /**
   * Clear cache and cleanup
   */
  cleanup() {
    this.cache = {};
    this.preloadedImages.clear();
    this.pendingLoads.clear();
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedImages: Object.keys(this.cache).length,
      preloadedImages: this.preloadedImages.size,
      pendingLoads: this.pendingLoads.size,
    };
  }
}

// Create singleton instance
const imageOptimizer = new ImageOptimizer();

export default imageOptimizer;
export type { ImageCache, PreloadConfig }; 