import { useState, useEffect, useCallback } from 'react';

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  wide: 1440,
} as const;

// Platform types
export type Platform = 'mobile' | 'tablet' | 'desktop' | 'wide';

// Screen orientation
export type Orientation = 'portrait' | 'landscape';

// Device capabilities
export interface DeviceCapabilities {
  hasTouch: boolean;
  hasHover: boolean;
  isHighDensity: boolean;
  supportsWebGL: boolean;
}

// Responsive state interface
export interface ResponsiveState {
  platform: Platform;
  width: number;
  height: number;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isTouch: boolean;
  capabilities: DeviceCapabilities;
}

// Custom hook for responsive behavior
export const useResponsive = () => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      // SSR fallback
      return {
        platform: 'desktop',
        width: 1200,
        height: 800,
        orientation: 'landscape',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false,
        isTouch: false,
        capabilities: {
          hasTouch: false,
          hasHover: true,
          isHighDensity: false,
          supportsWebGL: false,
        },
      };
    }

    return getResponsiveState();
  });

  // Get current responsive state
  const getResponsiveState = useCallback((): ResponsiveState => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';

    // Determine platform
    let platform: Platform = 'desktop';
    if (width < BREAKPOINTS.mobile) {
      platform = 'mobile';
    } else if (width < BREAKPOINTS.tablet) {
      platform = 'tablet';
    } else if (width < BREAKPOINTS.desktop) {
      platform = 'desktop';
    } else {
      platform = 'wide';
    }

    // Device capabilities detection
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const isHighDensity = window.devicePixelRatio > 1.5;
    
    let supportsWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      supportsWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      supportsWebGL = false;
    }

    const capabilities: DeviceCapabilities = {
      hasTouch,
      hasHover,
      isHighDensity,
      supportsWebGL,
    };

    return {
      platform,
      width,
      height,
      orientation,
      isMobile: platform === 'mobile',
      isTablet: platform === 'tablet',
      isDesktop: platform === 'desktop' || platform === 'wide',
      isWide: platform === 'wide',
      isTouch: hasTouch,
      capabilities,
    };
  }, []);

  // Update state on resize
  useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState());
    };

    // Throttle resize events for performance
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial state update
    handleResize();

    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, [getResponsiveState]);

  // Utility functions
  const isBreakpoint = useCallback((breakpoint: keyof typeof BREAKPOINTS) => {
    return state.width >= BREAKPOINTS[breakpoint];
  }, [state.width]);

  const isBetween = useCallback((min: keyof typeof BREAKPOINTS, max: keyof typeof BREAKPOINTS) => {
    return state.width >= BREAKPOINTS[min] && state.width < BREAKPOINTS[max];
  }, [state.width]);

  const isAbove = useCallback((breakpoint: keyof typeof BREAKPOINTS) => {
    return state.width > BREAKPOINTS[breakpoint];
  }, [state.width]);

  const isBelow = useCallback((breakpoint: keyof typeof BREAKPOINTS) => {
    return state.width < BREAKPOINTS[breakpoint];
  }, [state.width]);

  // Platform-specific checks
  const shouldUseMobileLayout = useCallback(() => {
    return state.isMobile || (state.isTablet && state.orientation === 'portrait');
  }, [state.isMobile, state.isTablet, state.orientation]);

  const shouldUseDesktopLayout = useCallback(() => {
    return state.isDesktop || (state.isTablet && state.orientation === 'landscape');
  }, [state.isDesktop, state.isTablet, state.orientation]);

  // CSS class generator for responsive styling
  const getResponsiveClasses = useCallback(() => {
    const classes = [
      `platform-${state.platform}`,
      `orientation-${state.orientation}`,
      state.isTouch ? 'touch-device' : 'no-touch',
      state.capabilities.hasHover ? 'has-hover' : 'no-hover',
      state.capabilities.isHighDensity ? 'high-density' : 'standard-density',
    ];

    return classes.join(' ');
  }, [state]);

  return {
    ...state,
    isBreakpoint,
    isBetween,
    isAbove,
    isBelow,
    shouldUseMobileLayout,
    shouldUseDesktopLayout,
    getResponsiveClasses,
    BREAKPOINTS,
  };
};

export default useResponsive;