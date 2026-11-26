import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { brandingService } from '../services/brandingService';
import { useAuth } from '../hooks/useAuth';

export const BRANDING_STORAGE_KEY = 'hb_firm_branding_config';

export const DEFAULT_BRANDING = {
  firmName: 'HEUGLY & BLUDWORTH, LLC',
  tagline: 'ATTORNEYS AT LAW • ESTABLISHED PRACTICE',
  primaryPhone: '(801) 555-0100',
  primaryEmail: 'contact@utahslawyers.com',
  address: '250 State Street, Suite 800, Salt Lake City, UT 84111',
  logoUrl: null,
  primaryColor: '#06244B',
  secondaryColor: '#F5F0E5',
  accentColor: '#A4432B',
  updatedAt: null,
  updatedBy: null,
};

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
      return saved ? { ...DEFAULT_BRANDING, ...JSON.parse(saved) } : DEFAULT_BRANDING;
    } catch {
      return DEFAULT_BRANDING;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshBranding = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await brandingService.getFirmBranding();
      if (data && data.firmName) {
        setBranding((prev) => {
          const merged = { ...prev, ...data };
          try {
            localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to load firm branding from API:', err?.message);
      setError(err?.message || 'Failed to load branding');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshBranding();
    }
  }, [isAuthenticated, refreshBranding]);

  const updateBranding = async (newConfig) => {
    setLoading(true);
    try {
      const updated = await brandingService.updateFirmBranding(newConfig);
      const merged = { ...branding, ...(updated || newConfig) };
      setBranding(merged);
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetBranding = async () => {
    setLoading(true);
    try {
      const reset = await brandingService.resetFirmBranding();
      const merged = { ...DEFAULT_BRANDING, ...(reset || {}) };
      setBranding(merged);
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        error,
        updateBranding,
        resetBranding,
        refreshBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      branding: DEFAULT_BRANDING,
      loading: false,
      error: null,
      updateBranding: async () => {},
      resetBranding: async () => {},
      refreshBranding: async () => {},
    };
  }
  return context;
};
