import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TopNavigation from '../Navigation/TopNavigation';
import EventSearch from '../Search/EventSearch';
import ErrorBoundary from '../ErrorBoundary';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: 'sports' | 'live-sports' | 'account' | 'history';
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage }) => {
  const { user, logout } = useAuth();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          updateViaCache: 'none' // Always check for updates
        })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates on page load
          registration.update();
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is ready, prompt user to reload
                  if (window.confirm('A new version is available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <div className="main-layout">
      {/* Header with Navigation, Search, and Account Info */}
      <header className="main-layout__header">
        <TopNavigation 
          currentPage={currentPage}
          user={user ? {
            username: user.username,
            balance: user.wallet_balance || 0
          } : undefined}
          onLogout={logout}
        />
        
        {/* Search Bar - visible on sports pages */}
        {(currentPage === 'sports' || currentPage === 'live-sports') && (
          <div className="main-layout__search">
            <EventSearch />
          </div>
        )}
      </header>

      {/* Main Content Area with Sidebar Layout */}
      <main className="main-layout__main">
        <div className="main-layout__content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
        
        {/* Bet Slip Sidebar - persistent across pages */}
        <aside className="main-layout__bet-slip">
          {/* Bet slip will be rendered here by the parent App component */}
        </aside>
      </main>
    </div>
  );
};

export default MainLayout;