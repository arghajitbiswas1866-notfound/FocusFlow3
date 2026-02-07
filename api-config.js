/**
 * API Configuration
 * Handles both local development and Netlify production deployments
 */

// Detect environment and set API base URL
const API_BASE = (() => {
  // Local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Production (get from environment variable set in Netlify)
  if (window.NETLIFY_API_URL) {
    return window.NETLIFY_API_URL;
  }
  
  // Fallback for relative paths (if backend is on same domain)
  return '';
})();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE };
}
