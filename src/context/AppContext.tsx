import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistDomain, UserSettings, DomainCheckResult } from '../types';
import {
  getWishlist,
  addToWishlist as addToWishlistStorage,
  removeFromWishlist as removeFromWishlistStorage,
  getSettings,
  updateSettings as updateSettingsStorage,
  getSelectedTLDs,
  saveSelectedTLDs as saveSelectedTLDsStorage,
} from '../store';
import { DEFAULT_SELECTED_TLDS, DEFAULT_REGISTRAR } from '../constants';

interface AppContextType {
  wishlist: WishlistDomain[];
  addToWishlist: (domain: string) => Promise<void>;
  removeFromWishlist: (domains: string[]) => Promise<void>;
  isInWishlist: (domain: string) => boolean;
  refreshWishlist: () => Promise<void>;
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  selectedTLDs: string[];
  setSelectedTLDs: (tlds: string[]) => Promise<void>;
  searchResults: DomainCheckResult[];
  setSearchResults: React.Dispatch<React.SetStateAction<DomainCheckResult[]>>;
  isLoading: boolean;
}

const defaultContext: AppContextType = {
  wishlist: [],
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
  refreshWishlist: async () => {},
  settings: {
    preferredRegistrar: DEFAULT_REGISTRAR,
    hasChosenRegistrar: false,
    allowRegistrarFallback: false,
    dohProvider: 'cloudflare',
  },
  updateSettings: async () => {},
  selectedTLDs: DEFAULT_SELECTED_TLDS,
  setSelectedTLDs: async () => {},
  searchResults: [],
  setSearchResults: () => {},
  isLoading: true,
};

const AppContext = createContext<AppContextType>(defaultContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistDomain[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultContext.settings);
  const [selectedTLDs, setSelectedTLDsState] = useState<string[]>(DEFAULT_SELECTED_TLDS);
  const [searchResults, setSearchResults] = useState<DomainCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedWishlist, loadedSettings, loadedTLDs] = await Promise.all([
          getWishlist(),
          getSettings(),
          getSelectedTLDs(),
        ]);

        setWishlist(loadedWishlist);
        setSettings(loadedSettings);
        setSelectedTLDsState(loadedTLDs);
      } catch (error) {
        console.error('Error loading app data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const addToWishlist = useCallback(async (domain: string) => {
    await addToWishlistStorage(domain);
    const updated = await getWishlist();
    setWishlist(updated);
  }, []);

  const removeFromWishlist = useCallback(async (domains: string[]) => {
    await removeFromWishlistStorage(domains);
    const updated = await getWishlist();
    setWishlist(updated);
  }, []);

  const isInWishlist = useCallback(
    (domain: string) => {
      const normalizedDomain = domain.toLowerCase().trim();
      return wishlist.some((w) => w.domain === normalizedDomain);
    },
    [wishlist]
  );

  const refreshWishlist = useCallback(async () => {
    const updated = await getWishlist();
    setWishlist(updated);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    await updateSettingsStorage(updates);
    const updated = await getSettings();
    setSettings(updated);
  }, []);

  const setSelectedTLDs = useCallback(async (tlds: string[]) => {
    await saveSelectedTLDsStorage(tlds);
    setSelectedTLDsState(tlds);
  }, []);

  const value: AppContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist,
    settings,
    updateSettings,
    selectedTLDs,
    setSelectedTLDs,
    searchResults,
    setSearchResults,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
