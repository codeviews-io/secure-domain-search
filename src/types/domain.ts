export type DomainStatus = 'available' | 'registered' | 'unknown' | 'checking';

export interface DomainCheckResult {
  domain: string;
  status: DomainStatus;
  checkedAt: number;
  source?: 'dns' | 'rdap';
  error?: string;
}

export interface WishlistDomain {
  domain: string;
  addedAt: number;
}

export interface TLD {
  tld: string;
  label: string;
  rdapServer?: string;
}

export type DNSRecordType = 'A' | 'AAAA' | 'NS' | 'SOA';

export interface DoHResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{
    name: string;
    type: number;
  }>;
  Answer?: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
  Authority?: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
}

export interface Registrar {
  id: string;
  name: string;
  searchUrl: (domain: string) => string;
}

export interface UserSettings {
  preferredRegistrar: string;
  hasChosenRegistrar: boolean;
  allowRegistrarFallback: boolean;
  dohProvider: 'cloudflare' | 'google';
}

export interface LookupProgress {
  total: number;
  completed: number;
  currentDomain?: string;
}
