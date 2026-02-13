import { WishlistDomain, UserSettings } from '../types';
import { DEFAULT_REGISTRAR, DEFAULT_SELECTED_TLDS, SUPPORTED_TLDS } from '../constants';

const VALID_TLDS = new Set(SUPPORTED_TLDS.map((t) => t.tld));

const STORAGE_KEYS = {
  WISHLIST: 'open_domain_wishlist',
  SETTINGS: 'open_domain_settings',
  SELECTED_TLDS: 'open_domain_selected_tlds',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  preferredRegistrar: DEFAULT_REGISTRAR,
  hasChosenRegistrar: false,
  allowRegistrarFallback: false,
  dohProvider: 'cloudflare',
};

type ExtensionStorageArea = {
  get: (key: string, callback?: (data: Record<string, unknown>) => void) => Promise<Record<string, unknown>> | void;
  set: (items: Record<string, string>, callback?: () => void) => Promise<void> | void;
  remove: (key: string, callback?: () => void) => Promise<void> | void;
};

function getExtensionStorageArea(): ExtensionStorageArea | null {
  const maybeGlobal = globalThis as typeof globalThis & {
    browser?: { storage?: { local?: ExtensionStorageArea } };
    chrome?: { storage?: { local?: ExtensionStorageArea } };
  };

  if (maybeGlobal.browser?.storage?.local) {
    return maybeGlobal.browser.storage.local;
  }

  if (maybeGlobal.chrome?.storage?.local) {
    return maybeGlobal.chrome.storage.local;
  }

  return null;
}

// Use chrome.storage.local if available, otherwise fall back to localStorage
function getStorage(): {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
} {
  const extensionStorage = getExtensionStorageArea();

  if (extensionStorage) {
    return {
      get: (key: string) =>
        new Promise((resolve, reject) => {
          try {
            const result = extensionStorage.get(key, (data) => {
              resolve((data[key] as string | undefined) ?? null);
            });

            if (result && typeof (result as Promise<Record<string, unknown>>).then === 'function') {
              (result as Promise<Record<string, unknown>>)
                .then((data) => resolve((data[key] as string | undefined) ?? null))
                .catch(reject);
            }
          } catch (error) {
            reject(error);
          }
        }),
      set: (key: string, value: string) =>
        new Promise((resolve, reject) => {
          try {
            const result = extensionStorage.set({ [key]: value }, () => resolve());
            if (result && typeof (result as Promise<void>).then === 'function') {
              (result as Promise<void>).then(resolve).catch(reject);
            }
          } catch (error) {
            reject(error);
          }
        }),
      remove: (key: string) =>
        new Promise((resolve, reject) => {
          try {
            const result = extensionStorage.remove(key, () => resolve());
            if (result && typeof (result as Promise<void>).then === 'function') {
              (result as Promise<void>).then(resolve).catch(reject);
            }
          } catch (error) {
            reject(error);
          }
        }),
    };
  }

  // Fallback to localStorage for development
  return {
    get: async (key: string) => localStorage.getItem(key),
    set: async (key: string, value: string) => localStorage.setItem(key, value),
    remove: async (key: string) => localStorage.removeItem(key),
  };
}

const storage = getStorage();

// Wishlist
export async function getWishlist(): Promise<WishlistDomain[]> {
  try {
    const data = await storage.get(STORAGE_KEYS.WISHLIST);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addToWishlist(domain: string): Promise<void> {
  const wishlist = await getWishlist();
  const normalizedDomain = domain.toLowerCase().trim();
  if (wishlist.some((w) => w.domain === normalizedDomain)) return;

  const newItem: WishlistDomain = {
    domain: normalizedDomain,
    addedAt: Date.now(),
  };

  wishlist.push(newItem);
  await storage.set(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
}

export async function removeFromWishlist(domains: string[]): Promise<void> {
  const wishlist = await getWishlist();
  const normalizedDomains = new Set(domains.map((d) => d.toLowerCase().trim()));
  const updatedWishlist = wishlist.filter((w) => !normalizedDomains.has(w.domain));
  await storage.set(STORAGE_KEYS.WISHLIST, JSON.stringify(updatedWishlist));
}

export async function isInWishlist(domain: string): Promise<boolean> {
  const wishlist = await getWishlist();
  const normalizedDomain = domain.toLowerCase().trim();
  return wishlist.some((w) => w.domain === normalizedDomain);
}

export async function clearWishlist(): Promise<void> {
  await storage.remove(STORAGE_KEYS.WISHLIST);
}

// Settings
export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await storage.get(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(data);
    const merged = { ...DEFAULT_SETTINGS, ...parsed };
    if (typeof parsed.hasChosenRegistrar === 'undefined' && parsed.preferredRegistrar) {
      return { ...merged, hasChosenRegistrar: true };
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(updates: Partial<UserSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...updates };
  await storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
}

// TLD Selection
export async function getSelectedTLDs(): Promise<string[]> {
  try {
    const data = await storage.get(STORAGE_KEYS.SELECTED_TLDS);
    if (!data) return DEFAULT_SELECTED_TLDS;

    const savedTLDs: string[] = JSON.parse(data);
    const validTLDs = savedTLDs.filter((tld) => VALID_TLDS.has(tld));

    if (validTLDs.length === 0) {
      await storage.set(STORAGE_KEYS.SELECTED_TLDS, JSON.stringify(DEFAULT_SELECTED_TLDS));
      return DEFAULT_SELECTED_TLDS;
    }

    if (validTLDs.length !== savedTLDs.length) {
      await storage.set(STORAGE_KEYS.SELECTED_TLDS, JSON.stringify(validTLDs));
    }

    return validTLDs;
  } catch {
    return DEFAULT_SELECTED_TLDS;
  }
}

export async function saveSelectedTLDs(tlds: string[]): Promise<void> {
  await storage.set(STORAGE_KEYS.SELECTED_TLDS, JSON.stringify(tlds));
}
