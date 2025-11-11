// Helper function to get API base URL
// Works in both development and production
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // Development - use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }

  // Production - check for env var first, then fallback to Railway URL
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl;
  }

  // Fallback: use Railway backend URL
  // This should match your actual Railway URL - update if different
  return 'https://winzo-platform-production-d306.up.railway.app';
}


