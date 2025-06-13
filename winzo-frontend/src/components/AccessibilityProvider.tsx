import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import './AccessibilityProvider.css';

interface AccessibilityContextType {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode: boolean;
  screenReaderMode: boolean;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleColorBlindMode: () => void;
  toggleScreenReaderMode: () => void;
  announceMessage: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('winzo-accessibility');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setHighContrast(settings.highContrast || false);
        setReducedMotion(settings.reducedMotion || false);
        setFontSizeState(settings.fontSize || 'medium');
        setColorBlindMode(settings.colorBlindMode || false);
        setScreenReaderMode(settings.screenReaderMode || false);
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      highContrast,
      reducedMotion,
      fontSize,
      colorBlindMode,
      screenReaderMode
    };
    localStorage.setItem('winzo-accessibility', JSON.stringify(settings));
  }, [highContrast, reducedMotion, fontSize, colorBlindMode, screenReaderMode]);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }

    // Font size
    root.classList.remove('accessibility-font-small', 'accessibility-font-medium', 'accessibility-font-large');
    root.classList.add(`accessibility-font-${fontSize}`);

    // Color blind mode
    if (colorBlindMode) {
      root.classList.add('accessibility-colorblind');
    } else {
      root.classList.remove('accessibility-colorblind');
    }

    // Screen reader mode
    if (screenReaderMode) {
      root.classList.add('accessibility-screen-reader');
    } else {
      root.classList.remove('accessibility-screen-reader');
    }
  }, [highContrast, reducedMotion, fontSize, colorBlindMode, screenReaderMode]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleReducedMotion = () => setReducedMotion(prev => !prev);
  const setFontSize = (size: 'small' | 'medium' | 'large') => setFontSizeState(size);
  const toggleColorBlindMode = () => setColorBlindMode(prev => !prev);
  const toggleScreenReaderMode = () => setScreenReaderMode(prev => !prev);

  const announceMessage = (message: string) => {
    // Create a live region for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const value: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    fontSize,
    colorBlindMode,
    screenReaderMode,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    toggleColorBlindMode,
    toggleScreenReaderMode,
    announceMessage
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Controls Component
export const AccessibilityControls: React.FC = () => {
  const {
    highContrast,
    reducedMotion,
    fontSize,
    colorBlindMode,
    screenReaderMode,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    toggleColorBlindMode,
    toggleScreenReaderMode
  } = useAccessibility();

  return (
    <div className="accessibility-controls" role="region" aria-label="Accessibility Controls">
      <h3>Accessibility Settings</h3>
      
      <div className="accessibility-option">
        <label>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={toggleHighContrast}
            aria-describedby="high-contrast-desc"
          />
          High Contrast Mode
        </label>
        <span id="high-contrast-desc" className="accessibility-description">
          Increases contrast for better visibility
        </span>
      </div>

      <div className="accessibility-option">
        <label>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={toggleReducedMotion}
            aria-describedby="reduced-motion-desc"
          />
          Reduced Motion
        </label>
        <span id="reduced-motion-desc" className="accessibility-description">
          Reduces animations and transitions
        </span>
      </div>

      <div className="accessibility-option">
        <label htmlFor="font-size">Font Size:</label>
        <select
          id="font-size"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="accessibility-option">
        <label>
          <input
            type="checkbox"
            checked={colorBlindMode}
            onChange={toggleColorBlindMode}
            aria-describedby="colorblind-desc"
          />
          Color Blind Friendly Mode
        </label>
        <span id="colorblind-desc" className="accessibility-description">
          Adjusts colors for color vision deficiencies
        </span>
      </div>

      <div className="accessibility-option">
        <label>
          <input
            type="checkbox"
            checked={screenReaderMode}
            onChange={toggleScreenReaderMode}
            aria-describedby="screen-reader-desc"
          />
          Screen Reader Optimized
        </label>
        <span id="screen-reader-desc" className="accessibility-description">
          Enhances screen reader compatibility
        </span>
      </div>
    </div>
  );
};

export default AccessibilityProvider; 