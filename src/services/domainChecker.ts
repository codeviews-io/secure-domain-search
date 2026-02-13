import { DomainCheckResult, DomainStatus, LookupProgress } from '../types';
import { checkDNSRecords } from './dns';
import { checkRDAP } from './rdap';

const resultCache = new Map<string, DomainCheckResult>();
const CACHE_TTL = 5 * 60 * 1000;

export async function checkDomain(
  domain: string,
  useCache: boolean = true
): Promise<DomainCheckResult> {
  const normalizedDomain = domain.toLowerCase().trim();

  if (useCache) {
    const cached = resultCache.get(normalizedDomain);
    if (cached && Date.now() - cached.checkedAt < CACHE_TTL) {
      return cached;
    }
  }

  const result: DomainCheckResult = {
    domain: normalizedDomain,
    status: 'checking',
    checkedAt: Date.now(),
  };

  try {
    const dnsResult = await checkDNSRecords(normalizedDomain);

    if (dnsResult.exists) {
      result.status = 'registered';
      result.source = 'dns';
      resultCache.set(normalizedDomain, result);
      return result;
    }

    const rdapResult = await checkRDAP(normalizedDomain);

    if (rdapResult.error) {
      result.status = 'unknown';
      result.error = rdapResult.error;
    } else if (rdapResult.available) {
      result.status = 'available';
      result.source = 'rdap';
    } else {
      result.status = 'registered';
      result.source = 'rdap';
    }

    resultCache.set(normalizedDomain, result);
    return result;
  } catch (error) {
    result.status = 'unknown';
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

export async function checkDomains(
  domains: string[],
  onProgress?: (progress: LookupProgress) => void,
  onResult?: (result: DomainCheckResult) => void,
  concurrency: number = 3
): Promise<DomainCheckResult[]> {
  const results: DomainCheckResult[] = [];
  const uniqueDomains = [...new Set(domains.map((d) => d.toLowerCase().trim()))];

  let completed = 0;
  const total = uniqueDomains.length;

  for (let i = 0; i < uniqueDomains.length; i += concurrency) {
    const batch = uniqueDomains.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (domain) => {
        onProgress?.({
          total,
          completed,
          currentDomain: domain,
        });

        const result = await checkDomain(domain);

        completed++;
        onProgress?.({
          total,
          completed,
          currentDomain: undefined,
        });

        onResult?.(result);
        return result;
      })
    );

    results.push(...batchResults);

    if (i + concurrency < uniqueDomains.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

export function generateDomainCombinations(
  names: string[],
  tlds: string[]
): string[] {
  const domains: string[] = [];

  for (const name of names) {
    const cleanName = name.toLowerCase().trim();
    if (!cleanName) continue;

    const hasTLD = cleanName.includes('.');

    if (hasTLD) {
      domains.push(cleanName);
    } else {
      for (const tld of tlds) {
        domains.push(`${cleanName}.${tld}`);
      }
    }
  }

  return [...new Set(domains)];
}

export function isValidDomainName(name: string): boolean {
  const cleanName = name.toLowerCase().trim();

  if (!cleanName || cleanName.length > 253) {
    return false;
  }

  const labels = cleanName.split('.');

  for (const label of labels) {
    if (label.length === 0 || label.length > 63) {
      return false;
    }

    if (!/^[a-z0-9]/i.test(label) || !/[a-z0-9]$/i.test(label)) {
      return false;
    }

    if (!/^[a-z0-9-]+$/i.test(label)) {
      return false;
    }
  }

  return true;
}

export function sortResultsByStatus(results: DomainCheckResult[]): DomainCheckResult[] {
  const statusOrder: Record<DomainStatus, number> = {
    available: 0,
    registered: 1,
    unknown: 2,
    checking: 3,
  };

  return [...results].sort((a, b) => {
    const orderA = statusOrder[a.status];
    const orderB = statusOrder[b.status];
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.domain.localeCompare(b.domain);
  });
}

export function clearCache(): void {
  resultCache.clear();
}

export function getCachedResult(domain: string): DomainCheckResult | undefined {
  const cached = resultCache.get(domain.toLowerCase().trim());
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL) {
    return cached;
  }
  return undefined;
}
