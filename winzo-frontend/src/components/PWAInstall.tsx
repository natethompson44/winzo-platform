import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const PWAInstall: React.FC<PWAInstallProps> = ({
  onInstall,
  onDismiss,
  className = ''
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(installEvent);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        onInstall?.();
      } else {
        console.log('User dismissed the install prompt');
        onDismiss?.();
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    onDismiss?.();
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show iOS instructions for Safari
  if (isIOS && isSafari && !showInstallPrompt) {
    return (
      <div className={`pwa-install ios-install ${className}`}>
        <div className="install-content">
          <div className="install-header">
            <div className="install-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="install-text">
              <h3 className="install-title">Install WINZO App</h3>
              <p className="install-description">
                Add WINZO to your home screen for quick access
              </p>
            </div>
            <button 
              className="dismiss-button"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="ios-instructions">
            <div className="instruction-step">
              <span className="step-number">1</span>
              <span className="step-text">Tap the share button</span>
              <svg className="w-5 h-5 step-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </div>
            <div className="instruction-step">
              <span className="step-number">2</span>
              <span className="step-text">Tap "Add to Home Screen"</span>
              <svg className="w-5 h-5 step-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show standard install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className={`pwa-install standard-install ${className}`}>
        <div className="install-content">
          <div className="install-header">
            <div className="install-icon">
              <img src="/icons/icon-192x192.png" alt="WINZO" className="app-icon" />
            </div>
            <div className="install-text">
              <h3 className="install-title">Install WINZO</h3>
              <p className="install-description">
                Install the app for faster access and better experience
              </p>
            </div>
            <button 
              className="dismiss-button"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="install-actions">
            <button 
              className="install-button"
              onClick={handleInstallClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Install
            </button>
            <button 
              className="dismiss-text-button"
              onClick={handleDismiss}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstall; 