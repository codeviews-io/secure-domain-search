import { DoHResponse, DNSRecordType } from '../types';

const DOH_PROVIDERS = {
  cloudflare: 'https://cloudflare-dns.com/dns-query',
  google: 'https://dns.google/resolve',
} as const;

const DNS_TYPE_CODES: Record<DNSRecordType, number> = {
  A: 1,
  AAAA: 28,
  NS: 2,
  SOA: 6,
};

const DNS_RCODE = {
  NOERROR: 0,
  NXDOMAIN: 3,
} as const;

const DNS_TIMEOUT_MS = 5000;

export async function checkDNSRecords(
  domain: string,
  provider: keyof typeof DOH_PROVIDERS = 'cloudflare',
  recordTypes: DNSRecordType[] = ['NS', 'A', 'AAAA', 'SOA']
): Promise<{ exists: boolean; records: string[] }> {
  const baseUrl = DOH_PROVIDERS[provider];
  const records: string[] = [];

  const checks = recordTypes.map(async (type) => {
    try {
      const result = await queryDoH(baseUrl, domain, type);
      if (result.records.length > 0) {
        records.push(...result.records.map((r) => `${type}: ${r}`));
      }
      return result.exists;
    } catch {
      return false;
    }
  });

  const results = await Promise.all(checks);
  const exists = results.some((r) => r);

  return { exists, records };
}

async function queryDoH(
  baseUrl: string,
  domain: string,
  type: DNSRecordType
): Promise<{ exists: boolean; records: string[] }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DNS_TIMEOUT_MS);

  try {
    const url = `${baseUrl}?name=${encodeURIComponent(domain)}&type=${DNS_TYPE_CODES[type]}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/dns-json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`DNS query failed: ${response.status}`);
    }

    const data: DoHResponse = await response.json();

    if (data.Status === DNS_RCODE.NXDOMAIN) {
      return { exists: false, records: [] };
    }

    if (data.Answer && data.Answer.length > 0) {
      const records = data.Answer.map((a) => a.data);
      return { exists: true, records };
    }

    if (data.Authority && data.Authority.length > 0 && data.Status === DNS_RCODE.NOERROR) {
      return { exists: false, records: [] };
    }

    return { exists: false, records: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function quickNSCheck(
  domain: string,
  provider: keyof typeof DOH_PROVIDERS = 'cloudflare'
): Promise<boolean> {
  try {
    const result = await checkDNSRecords(domain, provider, ['NS']);
    return result.exists;
  } catch {
    return false;
  }
}
