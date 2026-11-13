/**
 * Central API Client for HEUGLY & BLUDWORTH Legal Management SaaS
 * Standard fetch-based HTTP client with interceptors, JWT authorization, and error handling.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const TOKEN_STORAGE_KEY = 'hb_access_token';
export const USER_STORAGE_KEY = 'hb_user_profile';

export const tokenStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist auth token:', e);
    }
  },
  remove: () => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear auth token:', e);
    }
  },
};

/**
 * Custom operational API Error class
 */
export class ApiError extends Error {
  constructor(message, status, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Builds a query string from an object, omitting null/undefined/empty string values.
 */
export function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  const str = query.toString();
  return str ? `?${str}` : '';
}

/**
 * Core Request Dispatcher
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  const headers = new Headers(options.headers || {});

  // Automatic JWT Bearer Injection
  const token = tokenStorage.get();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Automatic JSON Content-Type if body is an object and not FormData
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const config = {
    ...options,
    headers,
    body,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    throw new ApiError(
      `Network connection failure: Cannot reach backend server at ${BASE_URL}.`,
      0,
      'NETWORK_FAILURE',
      netErr
    );
  }

  // Parse response payload
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  // Handle successful HTTP response (200 - 299)
  if (response.ok) {
    return data;
  }

  // Handle HTTP errors
  const status = response.status;
  const errorObj = data?.error || {};
  const errorMessage =
    errorObj.message ||
    data?.message ||
    `API request failed with status ${status}: ${response.statusText}`;
  const errorCode = errorObj.code || data?.code || `HTTP_${status}`;

  // Handle Token Expiration or Authentication Required
  if (status === 401) {
    tokenStorage.remove();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hb:auth:unauthorized', { detail: { status, message: errorMessage } }));
    }
  }

  throw new ApiError(errorMessage, status, errorCode, errorObj.details || data);
}

export const apiClient = {
  get: (endpoint, params = {}, options = {}) => {
    const qs = buildQueryString(params);
    return request(`${endpoint}${qs}`, { method: 'GET', ...options });
  },

  post: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'POST', body, ...options });
  },

  put: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'PUT', body, ...options });
  },

  patch: (endpoint, body, options = {}) => {
    return request(endpoint, { method: 'PATCH', body, ...options });
  },

  delete: (endpoint, options = {}) => {
    return request(endpoint, { method: 'DELETE', ...options });
  },

  getBaseUrl: () => BASE_URL,
};

