import React, { ComponentType, LazyExoticComponent, Suspense } from 'react';
import { useResponsive, Platform } from '../../hooks/responsive/useResponsive';

// Component variant configuration
export interface ComponentVariants<T = {}> {
  mobile?: ComponentType<T> | LazyExoticComponent<ComponentType<T>>;
  tablet?: ComponentType<T> | LazyExoticComponent<ComponentType<T>>;
  desktop?: ComponentType<T> | LazyExoticComponent<ComponentType<T>>;
  wide?: ComponentType<T> | LazyExoticComponent<ComponentType<T>>;
  fallback?: ComponentType<T>;
}

// Responsive component configuration
export interface ResponsiveComponentConfig<T = {}> {
  variants: ComponentVariants<T>;
  loadingComponent?: ComponentType;
  errorBoundary?: ComponentType<{ children: React.ReactNode; error?: Error }>;
  strategy?: 'immediate' | 'lazy' | 'hybrid';
}

// Responsive component factory options
export interface ResponsiveFactoryOptions {
  enableSuspense?: boolean;
  enableErrorBoundary?: boolean;
  defaultLoadingComponent?: ComponentType;
  defaultErrorBoundary?: ComponentType<{ children: React.ReactNode; error?: Error }>;
}

// Default loading component
const DefaultLoadingComponent: React.FC = () => (
  <div className="responsive-loading">
    <div className="loading-spinner" />
    <span>Loading...</span>
  </div>
);

// Default error boundary
const DefaultErrorBoundary: React.FC<{ children: React.ReactNode; error?: Error }> = ({ 
  children, 
  error 
}) => {
  if (error) {
    return (
      <div className="responsive-error">
        <h3>Component Error</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
  return <>{children}</>;
};

// Responsive component factory
export const createResponsiveComponent = <T extends object = {}>(
  config: ResponsiveComponentConfig<T>,
  options: ResponsiveFactoryOptions = {}
) => {
  const {
    enableSuspense = true,
    enableErrorBoundary = true,
    defaultLoadingComponent = DefaultLoadingComponent,
    defaultErrorBoundary = DefaultErrorBoundary,
  } = options;

  const ResponsiveComponent: React.FC<T> = (props) => {
    const { platform, shouldUseMobileLayout, shouldUseDesktopLayout } = useResponsive();
    
    // Determine which component to render based on platform and availability
    const getComponentForPlatform = (): ComponentType<T> | null => {
      const { variants } = config;
      
      // Direct platform match
      if (variants[platform]) {
        return variants[platform] as ComponentType<T>;
      }
      
      // Smart fallback logic
      if (shouldUseMobileLayout()) {
        return (variants.mobile || variants.tablet || variants.desktop || variants.fallback) as ComponentType<T>;
      }
      
      if (shouldUseDesktopLayout()) {
        return (variants.desktop || variants.wide || variants.tablet || variants.fallback) as ComponentType<T>;
      }
      
      // Final fallback
      return (variants.fallback || variants.desktop || variants.mobile) as ComponentType<T>;
    };

    const Component = getComponentForPlatform();
    
    if (!Component) {
      console.warn(`No component variant found for platform: ${platform}`);
      return <div className="responsive-no-variant">No component available for this platform</div>;
    }

    // Wrap component based on configuration
    let WrappedComponent = <Component {...props} />;

    // Add Suspense for lazy components
    if (enableSuspense && config.strategy !== 'immediate') {
      const LoadingComponent = config.loadingComponent || defaultLoadingComponent;
      WrappedComponent = (
        <Suspense fallback={<LoadingComponent />}>
          {WrappedComponent}
        </Suspense>
      );
    }

    // Add Error Boundary
    if (enableErrorBoundary) {
      const ErrorBoundary = config.errorBoundary || defaultErrorBoundary;
      WrappedComponent = (
        <ErrorBoundary>
          {WrappedComponent}
        </ErrorBoundary>
      );
    }

    return WrappedComponent;
  };

  // Add display name for debugging
  ResponsiveComponent.displayName = 'ResponsiveComponent';

  return ResponsiveComponent;
};

// Helper for creating lazy variants
export const createLazyVariants = <T extends object = {}>(
  imports: {
    mobile?: () => Promise<{ default: ComponentType<T> }>;
    tablet?: () => Promise<{ default: ComponentType<T> }>;
    desktop?: () => Promise<{ default: ComponentType<T> }>;
    wide?: () => Promise<{ default: ComponentType<T> }>;
  }
): ComponentVariants<T> => {
  const variants: ComponentVariants<T> = {};

  Object.entries(imports).forEach(([platform, importFn]) => {
    if (importFn) {
      variants[platform as Platform] = React.lazy(importFn);
    }
  });

  return variants;
};

// HOC for making existing components responsive
export const withResponsive = <T extends object = {}>(
  variants: ComponentVariants<T>,
  options: ResponsiveFactoryOptions = {}
) => {
  return createResponsiveComponent({ variants }, options);
};

// Conditional rendering hook for simple responsive logic
export const useResponsiveRender = () => {
  const responsive = useResponsive();

  const renderForPlatform = (
    components: Partial<Record<Platform, React.ReactNode>>,
    fallback?: React.ReactNode
  ) => {
    return (
      components[responsive.platform] ||
      (responsive.shouldUseMobileLayout() && components.mobile) ||
      (responsive.shouldUseDesktopLayout() && components.desktop) ||
      fallback ||
      null
    );
  };

  const renderConditional = (
    condition: keyof typeof responsive | ((state: typeof responsive) => boolean),
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    const shouldRender = typeof condition === 'function' 
      ? condition(responsive)
      : responsive[condition];

    return shouldRender ? component : (fallback || null);
  };

  return {
    renderForPlatform,
    renderConditional,
    ...responsive,
  };
};

export default createResponsiveComponent;