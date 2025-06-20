import React from 'react';

export interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
  hasSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  className = '',
  hasSidebar = false,
  sidebarContent,
  headerContent,
  footerContent
}) => {
  return (
    <div className={`layout ${className}`}>
      {/* Sidebar */}
      {hasSidebar && sidebarContent && (
        <aside className="sidebar">
          {sidebarContent}
        </aside>
      )}
      
      {/* Main Content */}
      <div className={`main-content ${hasSidebar ? '' : 'sidebar-collapsed'}`}>
        {/* Header */}
        {headerContent && (
          <header className="header">
            {headerContent}
          </header>
        )}
        
        {/* Content */}
        <main className="content">
          {children}
        </main>
        
        {/* Footer */}
        {footerContent && (
          <footer className="footer">
            {footerContent}
          </footer>
        )}
      </div>
    </div>
  );
};

export default BaseLayout; 