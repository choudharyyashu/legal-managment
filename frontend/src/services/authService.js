import { apiClient, tokenStorage, USER_STORAGE_KEY } from './apiClient';

export const authService = {
  /**
   * Authenticate against backend JWT login API
   */
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res?.data?.accessToken) {
      tokenStorage.set(res.data.accessToken);
      if (res.data.user) {
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
        } catch {}
      }
    }
    return res?.data;
  },

  /**
   * Fetch current authenticated user session
   */
  async getMe() {
    const res = await apiClient.get('/auth/me');
    if (res?.data?.user) {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
      } catch {}
    }
    return res?.data?.user;
  },

  /**
   * Terminate active session
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.remove();
    }
  },

  /**
   * Retrieve cached session user from storage (for immediate render before API response)
   */
  getCachedUser() {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  hasToken() {
    return Boolean(tokenStorage.get());
  },
};

