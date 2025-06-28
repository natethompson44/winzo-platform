/**
 * Performance Monitoring Utility for WINZO Platform
 * 
 * Tracks:
 * - API call frequency and duration
 * - Image loading performance
 * - Component render times
 * - Memory usage
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ApiCallMetric {
  url: string;
  method: string;
  duration: number;
  success: boolean;
  timestamp: number;
  cached?: boolean;
}

interface ImageLoadMetric {
  src: string;
  loadTime: number;
  fromCache: boolean;
  timestamp: number;
  size?: { width: number; height: number };
}

class PerformanceMonitor {
  private apiCalls: ApiCallMetric[] = [];
  private imageLoads: ImageLoadMetric[] = [];
  private metrics: PerformanceMetric[] = [];
  private renderTimes = new Map<string, number>();
  private maxHistorySize = 100;

  /**
   * Track API call performance
   */
  trackApiCall(
    url: string,
    method: string,
    startTime: number,
    success: boolean,
    cached: boolean = false
  ) {
    const duration = performance.now() - startTime;
    
    const metric: ApiCallMetric = {
      url,
      method,
      duration,
      success,
      timestamp: Date.now(),
      cached,
    };

    this.apiCalls.push(metric);
    
    // Keep only recent calls
    if (this.apiCalls.length > this.maxHistorySize) {
      this.apiCalls = this.apiCalls.slice(-this.maxHistorySize);
    }

    // Log excessive API calls
    if (!cached && this.getRecentApiCallCount() > 10) {
      console.warn('🚨 High API call frequency detected:', {
        recentCalls: this.getRecentApiCallCount(),
        lastCall: metric,
      });
    }
  }

  /**
   * Track image loading performance
   */
  trackImageLoad(
    src: string,
    loadTime: number,
    fromCache: boolean = false,
    size?: { width: number; height: number }
  ) {
    const metric: ImageLoadMetric = {
      src,
      loadTime,
      fromCache,
      timestamp: Date.now(),
      size,
    };

    this.imageLoads.push(metric);
    
    // Keep only recent loads
    if (this.imageLoads.length > this.maxHistorySize) {
      this.imageLoads = this.imageLoads.slice(-this.maxHistorySize);
    }

    // Log slow image loads
    if (loadTime > 2000 && !fromCache) {
      console.warn('🐌 Slow image load detected:', metric);
    }
  }

  /**
   * Track component render time
   */
  startRender(componentName: string) {
    this.renderTimes.set(componentName, performance.now());
  }

  endRender(componentName: string) {
    const startTime = this.renderTimes.get(componentName);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.renderTimes.delete(componentName);
      
      this.metrics.push({
        name: `${componentName}.render`,
        value: duration,
        timestamp: Date.now(),
      });

      // Log slow renders
      if (duration > 100) {
        console.warn(`🐌 Slow render detected for ${componentName}:`, `${duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Get recent API call count (last 10 seconds)
   */
  private getRecentApiCallCount(): number {
    const tenSecondsAgo = Date.now() - 10000;
    return this.apiCalls.filter(call => call.timestamp > tenSecondsAgo).length;
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentApiCalls = this.apiCalls.filter(call => call.timestamp > oneMinuteAgo);
    const recentImageLoads = this.imageLoads.filter(load => load.timestamp > oneMinuteAgo);
    
    return {
      apiCalls: {
        total: recentApiCalls.length,
        successful: recentApiCalls.filter(call => call.success).length,
        failed: recentApiCalls.filter(call => !call.success).length,
        cached: recentApiCalls.filter(call => call.cached).length,
        averageDuration: recentApiCalls.reduce((sum, call) => sum + call.duration, 0) / recentApiCalls.length || 0,
      },
      imageLoads: {
        total: recentImageLoads.length,
        fromCache: recentImageLoads.filter(load => load.fromCache).length,
        averageLoadTime: recentImageLoads.reduce((sum, load) => sum + load.loadTime, 0) / recentImageLoads.length || 0,
      },
      memory: this.getMemoryUsage(),
      timestamp: now,
    };
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
      };
    }
    return null;
  }

  /**
   * Log performance summary
   */
  logSummary() {
    const stats = this.getStats();
    console.group('🔍 Performance Summary');
    console.log('API Calls (last minute):', stats.apiCalls);
    console.log('Image Loads (last minute):', stats.imageLoads);
    if (stats.memory) {
      console.log('Memory Usage:', stats.memory);
    }
    console.groupEnd();
  }

  /**
   * Detect performance issues
   */
  detectIssues(): string[] {
    const issues: string[] = [];
    const stats = this.getStats();
    
    // Check for excessive API calls
    if (stats.apiCalls.total > 20) {
      issues.push(`High API call frequency: ${stats.apiCalls.total} calls in last minute`);
    }
    
    // Check for high cache miss rate
    const cacheHitRate = stats.apiCalls.cached / stats.apiCalls.total;
    if (cacheHitRate < 0.5 && stats.apiCalls.total > 5) {
      issues.push(`Low cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`);
    }
    
    // Check for slow API calls
    if (stats.apiCalls.averageDuration > 2000) {
      issues.push(`Slow API responses: ${stats.apiCalls.averageDuration.toFixed(0)}ms average`);
    }
    
    // Check for excessive image loads
    if (stats.imageLoads.total > 50) {
      issues.push(`High image load count: ${stats.imageLoads.total} images in last minute`);
    }
    
    // Check for slow image loads
    if (stats.imageLoads.averageLoadTime > 1000) {
      issues.push(`Slow image loading: ${stats.imageLoads.averageLoadTime.toFixed(0)}ms average`);
    }
    
    // Check memory usage
    if (stats.memory && stats.memory.used > 100) {
      issues.push(`High memory usage: ${stats.memory.used}MB`);
    }
    
    return issues;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.apiCalls = [];
    this.imageLoads = [];
    this.metrics = [];
    this.renderTimes.clear();
  }

  /**
   * Enable automatic monitoring
   */
  enableAutoMonitoring() {
    // Monitor every 30 seconds
    setInterval(() => {
      const issues = this.detectIssues();
      if (issues.length > 0) {
        console.warn('🚨 Performance Issues Detected:', issues);
      }
    }, 30000);

    // Log summary every 5 minutes
    setInterval(() => {
      this.logSummary();
    }, 300000);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Enable monitoring in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  performanceMonitor.enableAutoMonitoring();
  
  // Add to window for debugging
  (window as any).performanceMonitor = performanceMonitor;
}

export default performanceMonitor; 