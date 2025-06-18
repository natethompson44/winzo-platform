// Responsive System Exports
export { useResponsive, BREAKPOINTS } from './useResponsive';
export type { 
  Platform, 
  Orientation, 
  DeviceCapabilities, 
  ResponsiveState 
} from './useResponsive';

// Re-export responsive component utilities
export { 
  createResponsiveComponent,
  createLazyVariants,
  withResponsive,
  useResponsiveRender
} from '../../components/responsive/ResponsiveComponentFactory';

export type {
  ComponentVariants,
  ResponsiveComponentConfig,
  ResponsiveFactoryOptions
} from '../../components/responsive/ResponsiveComponentFactory';