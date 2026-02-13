import { Registrar } from '../types';

export const REGISTRARS: Registrar[] = [
  {
    id: 'namecheap',
    name: 'Namecheap',
    searchUrl: (domain: string) =>
      `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
  },
  {
    id: 'porkbun',
    name: 'Porkbun',
    searchUrl: (domain: string) =>
      `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
  },
  {
    id: 'dynadot',
    name: 'Dynadot',
    searchUrl: (domain: string) =>
      `https://www.dynadot.com/domain/search?domain=${encodeURIComponent(domain)}`,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Registrar',
    searchUrl: (_domain: string) =>
      `https://www.cloudflare.com/products/registrar/`,
  },
  {
    id: 'godaddy',
    name: 'GoDaddy',
    searchUrl: (domain: string) =>
      `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
  },
  {
    id: 'google',
    name: 'Google Domains (Squarespace)',
    searchUrl: (domain: string) =>
      `https://domains.squarespace.com/?domain=${encodeURIComponent(domain)}`,
  },
];

export const DEFAULT_REGISTRAR = 'namecheap';
