import { lookup, type BootstrapData } from 'rdapper';

const RDAP_TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 5000;
const MAX_RETRY_DELAY_MS = 120000;
const LONG_RETRY_THRESHOLD_MS = 60000;
const INTRA_GROUP_DELAY_MS = 500;

export const REGISTRY_GROUPS: Record<string, string[]> = {
  verisign: ['com', 'net'],
  pir: ['org'],
  identity_digital: ['info', 'live', 'digital', 'email', 'cloud', 'club'],
  google: ['app', 'dev'],
  centralnic: ['xyz', 'online', 'tech', 'site', 'store', 'shop'],
  godaddy: ['biz', 'link', 'vip'],
};

const TLD_TO_GROUP: Map<string, string> = new Map();
for (const [group, tlds] of Object.entries(REGISTRY_GROUPS)) {
  for (const tld of tlds) {
    TLD_TO_GROUP.set(tld, group);
  }
}

function getRegistryGroup(tld: string): string {
  return TLD_TO_GROUP.get(tld.toLowerCase()) || `unknown_${tld}`;
}

const lastRequestTimeByGroup = new Map<string, number>();
const temporarilyUnavailableGroups = new Map<string, number>();

let bootstrapCache: {
  data: BootstrapData;
  fetchedAt: number;
} | null = null;
const BOOTSTRAP_CACHE_TTL = 24 * 60 * 60 * 1000;
const IANA_BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';

export async function initializeBootstrapCache(): Promise<void> {
  const now = Date.now();

  if (bootstrapCache && now - bootstrapCache.fetchedAt < BOOTSTRAP_CACHE_TTL) {
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);

    const response = await fetch(IANA_BOOTSTRAP_URL, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: BootstrapData = await response.json();
    bootstrapCache = { data, fetchedAt: now };
  } catch (error) {
    if (!bootstrapCache) {
      bootstrapCache = {
        data: {
          version: '1.0',
          publication: new Date().toISOString(),
          services: [],
        },
        fetchedAt: 0,
      };
    }
  }
}

function getBootstrapData(): BootstrapData | undefined {
  if (bootstrapCache && bootstrapCache.data && bootstrapCache.data.services) {
    return bootstrapCache.data;
  }
  return undefined;
}

function extractTLD(domain: string): string {
  const parts = domain.toLowerCase().split('.');
  return parts[parts.length - 1];
}

function getHeaderCaseInsensitive(headers: Headers, name: string): string | null {
  const value = headers.get(name);
  if (value) return value;
  const lowerName = name.toLowerCase();
  for (const [key, val] of headers.entries()) {
    if (key.toLowerCase() === lowerName) {
      return val;
    }
  }
  return null;
}

function parseRetryAfter(retryAfterValue: string | null): number | null {
  if (!retryAfterValue) return null;
  const seconds = parseInt(retryAfterValue, 10);
  if (!isNaN(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  const date = Date.parse(retryAfterValue);
  if (!isNaN(date)) {
    const delayMs = date - Date.now();
    return delayMs > 0 ? delayMs : 0;
  }
  return null;
}

function calculateRetryDelay(attempt: number, retryAfterMs: number | null): number {
  if (retryAfterMs !== null) {
    return Math.min(retryAfterMs, MAX_RETRY_DELAY_MS);
  }
  const exponentialDelay = DEFAULT_RETRY_DELAY_MS * Math.pow(2, attempt);
  return Math.min(exponentialDelay, MAX_RETRY_DELAY_MS);
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const networkErrors = [
    'Network request failed',
    'Failed to fetch',
    'network error',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'AbortError',
  ];
  return networkErrors.some((e) =>
    error.message.toLowerCase().includes(e.toLowerCase()) ||
    error.name.toLowerCase().includes(e.toLowerCase())
  );
}

function markGroupTemporarilyUnavailable(group: string, retryAfterMs: number): void {
  const availableAfter = Date.now() + retryAfterMs;
  temporarilyUnavailableGroups.set(group, availableAfter);
}

function isGroupTemporarilyUnavailable(group: string): boolean {
  const availableAfter = temporarilyUnavailableGroups.get(group);
  if (!availableAfter) return false;
  if (Date.now() >= availableAfter) {
    temporarilyUnavailableGroups.delete(group);
    return false;
  }
  return true;
}

function createCustomFetch(tld: string): typeof fetch {
  const group = getRegistryGroup(tld);

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    let lastError: Error | null = null;
    let lastResponse: Response | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);

      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        });

        if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
          const retryAfterValue = getHeaderCaseInsensitive(response.headers, 'retry-after');
          const retryAfterMs = parseRetryAfter(retryAfterValue);

          if (retryAfterMs !== null && retryAfterMs > LONG_RETRY_THRESHOLD_MS) {
            markGroupTemporarilyUnavailable(group, retryAfterMs);
            return response;
          }

          const delay = calculateRetryDelay(attempt, retryAfterMs);
          lastResponse = response;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (isNetworkError(error) && attempt < MAX_RETRIES) {
          const delay = calculateRetryDelay(attempt, null);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw lastError;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (lastResponse) return lastResponse;
    throw lastError || new Error('All retries exhausted');
  };
}

export async function checkRDAP(
  domain: string
): Promise<{ available: boolean; status?: string; error?: string }> {
  await initializeBootstrapCache();

  const normalizedDomain = domain.toLowerCase().trim();
  const tld = extractTLD(normalizedDomain);
  const group = getRegistryGroup(tld);

  if (isGroupTemporarilyUnavailable(group)) {
    return { available: false, error: 'Registry temporarily unavailable (rate limited)' };
  }

  try {
    const lastRequestTime = lastRequestTimeByGroup.get(group);
    if (lastRequestTime) {
      const timeSinceLastRequest = Date.now() - lastRequestTime;
      if (timeSinceLastRequest < INTRA_GROUP_DELAY_MS) {
        const waitTime = INTRA_GROUP_DELAY_MS - timeSinceLastRequest;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    lastRequestTimeByGroup.set(group, Date.now());

    const customFetch = createCustomFetch(tld);

    const result = await lookup(normalizedDomain, {
      rdapOnly: true,
      customFetch,
      customBootstrapData: getBootstrapData(),
    });

    if (!result.ok) {
      const errorLower = result.error?.toLowerCase() || '';
      if (
        errorLower.includes('not found') ||
        errorLower.includes('404') ||
        errorLower.includes('no registration') ||
        errorLower.includes('no match')
      ) {
        return { available: true };
      }
      return { available: false, error: result.error };
    }

    const record = result.record;
    if (record && record.isRegistered === false) {
      return { available: true };
    }

    let status = 'registered';
    if (record?.statuses && record.statuses.length > 0) {
      const meaningfulStatuses = ['active', 'inactive', 'pending', 'locked'];
      const foundStatus = record.statuses.find((s) =>
        meaningfulStatuses.includes(s.status.toLowerCase())
      );
      if (foundStatus) {
        status = foundStatus.status.toLowerCase();
      }
    }

    return { available: false, status };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const messageLower = message.toLowerCase();
    if (
      messageLower.includes('not found') ||
      messageLower.includes('404') ||
      messageLower.includes('no registration') ||
      messageLower.includes('no match')
    ) {
      return { available: true };
    }
    return { available: false, error: message };
  }
}

export interface RDAPBatchResult {
  available: boolean;
  status?: string;
  error?: string;
}

export async function batchCheckRDAP(
  domains: string[],
  onResult?: (domain: string, result: RDAPBatchResult) => void
): Promise<Map<string, RDAPBatchResult>> {
  await initializeBootstrapCache();

  const results = new Map<string, RDAPBatchResult>();
  const uniqueDomains = [...new Set(domains.map((d) => d.toLowerCase().trim()))];

  const domainsByGroup = new Map<string, string[]>();
  for (const domain of uniqueDomains) {
    const tld = extractTLD(domain);
    const group = getRegistryGroup(tld);
    if (!domainsByGroup.has(group)) {
      domainsByGroup.set(group, []);
    }
    domainsByGroup.get(group)!.push(domain);
  }

  const groupQueues = new Map<string, string[]>();
  for (const [group, groupDomains] of domainsByGroup) {
    groupQueues.set(group, [...groupDomains]);
  }

  const processGroup = async (group: string): Promise<void> => {
    const queue = groupQueues.get(group)!;

    while (queue.length > 0) {
      const domain = queue.shift()!;

      if (isGroupTemporarilyUnavailable(group)) {
        const result: RDAPBatchResult = {
          available: false,
          error: 'Registry temporarily unavailable (rate limited)',
        };
        results.set(domain, result);
        onResult?.(domain, result);
        continue;
      }

      const result = await checkRDAP(domain);
      results.set(domain, result);
      onResult?.(domain, result);

      if (queue.length > 0 && !isGroupTemporarilyUnavailable(group)) {
        await new Promise((resolve) => setTimeout(resolve, INTRA_GROUP_DELAY_MS));
      }
    }
  };

  const groupPromises = Array.from(groupQueues.keys()).map((group) => processGroup(group));
  await Promise.all(groupPromises);

  return results;
}

export function clearRateLimitState(): void {
  temporarilyUnavailableGroups.clear();
  lastRequestTimeByGroup.clear();
}
