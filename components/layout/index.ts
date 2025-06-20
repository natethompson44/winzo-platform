export { default as BaseLayout } from './BaseLayout';

// Re-export the frontend layout components
export { 
  AppLayout, 
  Sidebar, 
  Header, 
  MobileBottomNav 
} from '../../winzo-frontend/src/components/layout';

export type { BaseLayoutProps } from './BaseLayout';
export type { 
  AppLayoutProps, 
  SidebarProps, 
  HeaderProps, 
  MobileBottomNavProps 
} from '../../winzo-frontend/src/components/layout'; 