import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  courtDeadlineEmail: true,
  courtDeadlineSms: true,
  courtDeadlineLeadTime: '48',
  timeApprovalAlerts: true,
  conflictCheckNotices: true,
  dailyDigestEmail: false,
  clientMessageNotification: true,
};

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();
  const userId = currentUser?.id || 'guest';
  const storageKey = `hb_notification_preferences_${userId}`;

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_NOTIFICATION_PREFERENCES;
    } catch {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  });

  const [gatewayStatus, setGatewayStatus] = useState({
    emailConfigured: false,
    smsConfigured: false,
    emailProvider: 'Unconfigured (In-App Only)',
    smsProvider: 'Unconfigured (In-App Only)',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize preferences whenever authenticated user changes (user-level isolation)
  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated || !currentUser?.id) {
      setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getPreferences();
      if (res?.preferences) {
        setPreferences(res.preferences);
        if (res.gatewayStatus) setGatewayStatus(res.gatewayStatus);
        try {
          localStorage.setItem(`hb_notification_preferences_${currentUser.id}`, JSON.stringify(res.preferences));
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to load user notification preferences from API:', err?.message);
      setError(err?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser?.id]);

  useEffect(() => {
    refreshPreferences();
  }, [refreshPreferences]);

  const updatePreferences = async (newPrefs) => {
    setLoading(true);
    try {
      const res = await notificationService.updatePreferences(newPrefs);
      const updated = res?.preferences || newPrefs;
      setPreferences(updated);
      if (res?.gatewayStatus) setGatewayStatus(res.gatewayStatus);
      if (currentUser?.id) {
        try {
          localStorage.setItem(`hb_notification_preferences_${currentUser.id}`, JSON.stringify(updated));
        } catch {}
      }
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPreferences = async () => {
    setLoading(true);
    try {
      const res = await notificationService.resetPreferences();
      const reset = res?.preferences || DEFAULT_NOTIFICATION_PREFERENCES;
      setPreferences(reset);
      if (res?.gatewayStatus) setGatewayStatus(res.gatewayStatus);
      if (currentUser?.id) {
        try {
          localStorage.setItem(`hb_notification_preferences_${currentUser.id}`, JSON.stringify(reset));
        } catch {}
      }
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        preferences,
        gatewayStatus,
        loading,
        error,
        updatePreferences,
        resetPreferences,
        refreshPreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationPreferences = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      preferences: DEFAULT_NOTIFICATION_PREFERENCES,
      gatewayStatus: {
        emailConfigured: false,
        smsConfigured: false,
        emailProvider: 'Unconfigured (In-App Only)',
        smsProvider: 'Unconfigured (In-App Only)',
      },
      loading: false,
      error: null,
      updatePreferences: async () => {},
      resetPreferences: async () => {},
      refreshPreferences: async () => {},
    };
  }
  return context;
};
