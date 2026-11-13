/**
 * mockStorage manages frontend demonstration data persistence in localStorage.
 * If no stored data exists, it seeds the initial mock dataset.
 */
const memoryStore = new Map();

export const mockStorage = {
  get: (key, defaultValue) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(`hb_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      }
      return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
    } catch (e) {
      console.warn(`Failed to read ${key} from storage:`, e);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`hb_${key}`, JSON.stringify(value));
      } else {
        memoryStore.set(key, value);
      }
    } catch (e) {
      console.warn(`Failed to save ${key} to storage:`, e);
    }
  },

  remove: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(`hb_${key}`);
      } else {
        memoryStore.delete(key);
      }
    } catch (e) {
      console.warn(`Failed to remove ${key} from storage:`, e);
    }
  },

  clearAll: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(window.localStorage).forEach((key) => {
          if (key.startsWith('hb_')) {
            window.localStorage.removeItem(key);
          }
        });
      } else {
        memoryStore.clear();
      }
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  }
};

