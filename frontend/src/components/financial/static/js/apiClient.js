/**
 * API Client for handling authenticated requests
 * Automatically includes JWT token from localStorage in requests
 */

class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Get the JWT token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set default headers
  setHeader(key, value) {
    this.defaultHeaders[key] = value;
  }

  // Make an authenticated request
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();
    
    // Set up headers
    const headers = {
      ...this.defaultHeaders,
      ...(options.headers || {})
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare fetch options
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include' // Include cookies for session management
    };

    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle unauthorized responses (token expired or invalid)
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/index.html';
        return null;
      }

      // Parse JSON response
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP methods
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient(process.env.API_BASE_URL || '');

// For backward compatibility
window.apiClient = apiClient;
