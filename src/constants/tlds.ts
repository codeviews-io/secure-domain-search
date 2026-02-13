import { TLD } from '../types';

export const SUPPORTED_TLDS: TLD[] = [
  { tld: 'com', label: '.com', rdapServer: 'https://rdap.verisign.com/com/v1/' },
  { tld: 'net', label: '.net', rdapServer: 'https://rdap.verisign.com/net/v1/' },
  { tld: 'org', label: '.org', rdapServer: 'https://rdap.publicinterestregistry.org/rdap/' },
  { tld: 'xyz', label: '.xyz', rdapServer: 'https://rdap.centralnic.com/xyz/' },
  { tld: 'shop', label: '.shop', rdapServer: 'https://rdap.centralnic.com/shop/' },
  { tld: 'online', label: '.online', rdapServer: 'https://rdap.centralnic.com/online/' },
  { tld: 'tech', label: '.tech', rdapServer: 'https://rdap.centralnic.com/tech/' },
  { tld: 'site', label: '.site', rdapServer: 'https://rdap.centralnic.com/site/' },
  { tld: 'store', label: '.store', rdapServer: 'https://rdap.centralnic.com/store/' },
  { tld: 'link', label: '.link', rdapServer: 'https://rdap.centralnic.com/link/' },
  { tld: 'live', label: '.live', rdapServer: 'https://rdap.centralnic.com/live/' },
  { tld: 'vip', label: '.vip', rdapServer: 'https://rdap.centralnic.com/vip/' },
  { tld: 'digital', label: '.digital', rdapServer: 'https://rdap.centralnic.com/digital/' },
  { tld: 'email', label: '.email', rdapServer: 'https://rdap.centralnic.com/email/' },
  { tld: 'info', label: '.info', rdapServer: 'https://rdap.afilias.info/rdap/info/' },
  { tld: 'biz', label: '.biz', rdapServer: 'https://rdap.nic.biz/' },
  { tld: 'app', label: '.app', rdapServer: 'https://rdap.nic.google/' },
  { tld: 'dev', label: '.dev', rdapServer: 'https://rdap.nic.google/' },
  { tld: 'cloud', label: '.cloud', rdapServer: 'https://rdap.nic.cloud/' },
  { tld: 'club', label: '.club', rdapServer: 'https://rdap.nic.club/' },
];

export const DEFAULT_SELECTED_TLDS = ['com', 'net', 'org', 'xyz'];
