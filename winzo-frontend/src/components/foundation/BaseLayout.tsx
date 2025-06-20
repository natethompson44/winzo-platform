import React from 'react';
import './BaseLayout.css';

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
    <div className={`winzo-base-layout ${className}`}>
      {/* Header */}
      {headerContent && (
        <header className="winzo-header">
          {headerContent}
        </header>
      )}

      <div className="winzo-content-wrapper">
        {/* Sidebar */}
        {hasSidebar && sidebarContent && (
          <aside className="winzo-sidebar">
            <div className="winzo-sidebar-content">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`winzo-main-content ${hasSidebar ? 'with-sidebar' : 'full-width'}`}>
          <div className="winzo-content-container">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footerContent && (
        <footer className="winzo-footer">
          {footerContent}
        </footer>
      )}
    </div>
  );
};

export default BaseLayout; 