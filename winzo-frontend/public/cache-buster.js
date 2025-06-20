// WINZO Cache Busting Script
// Forces reload of CSS and clears browser cache

(function() {
  'use strict';
  
  // Version for cache busting
  const VERSION = '2.0.0';
  const CACHE_KEY = 'winzo-cache-version';
  
  // Check if we need to clear cache
  const currentVersion = localStorage.getItem(CACHE_KEY);
  if (currentVersion !== VERSION) {
    console.log('WINZO: New version detected, clearing cache...');
    
    // Clear localStorage cache
    localStorage.clear();
    localStorage.setItem(CACHE_KEY, VERSION);
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Force reload CSS
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const newHref = href.includes('?') 
          ? href + '&v=' + VERSION 
          : href + '?v=' + VERSION;
        link.setAttribute('href', newHref);
      }
    });
    
    // Force reload if this is a new version
    if (currentVersion && currentVersion !== VERSION) {
      console.log('WINZO: Reloading page for new version...');
      window.location.reload(true);
    }
  }
  
  // Add cache-busting to all CSS links
  function addCacheBuster() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('v=' + VERSION)) {
        const newHref = href.includes('?') 
          ? href + '&v=' + VERSION 
          : href + '?v=' + VERSION;
        link.setAttribute('href', newHref);
      }
    });
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCacheBuster);
  } else {
    addCacheBuster();
  }
  
  // Also run on window load
  window.addEventListener('load', addCacheBuster);
  
  console.log('WINZO: Cache buster loaded, version', VERSION);
})(); 