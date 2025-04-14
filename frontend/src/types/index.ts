// src/types/index.ts

// Customer Types
export interface CustomerName {
  initials: string;
  first_name: string;
  prefix?: string;
  last_name: string;
  full_name?: string;
}

export interface CustomerAddress {
  street: string;
  number: string;
  suffix?: string;
  zipcode: string;
  city: string;
  state?: string;
  country: string;
}

export interface CustomerPhone {
  country_code: string;
  area_code: string;
  subscriber_number: string;
}

export interface CustomerTag {
  key: string;
  value: string;
}

export interface CustomerAdditionalData {
  birth_address?: string;
  birth_city?: string;
  birth_country?: string;
  birth_date?: string;
  birth_state?: string;
  birth_zipcode?: string;
  company_registration_city?: string;
  company_registration_number?: string;
  company_registration_subscription_date?: string;
  headquarters_address?: string;
  headquarters_city?: string;
  headquarters_country?: string;
  headquarters_state?: string;
  headquarters_zipcode?: string;
  passport_number?: string;
  social_security_number?: string;
  [key: string]: string | undefined; // For additional fields
}

export interface CustomerExtensionAdditionalData {
  name: string;
  data: {
    [key: string]: string;
  };
}

export interface Customer {
  id?: number;
  handle?: string;
  company_name?: string;
  name: CustomerName;
  address: CustomerAddress;
  phone: CustomerPhone;
  fax?: CustomerPhone;
  email: string;
  locale?: string;
  vat?: string;
  additional_data?: CustomerAdditionalData;
  extension_additional_data?: CustomerExtensionAdditionalData[];
  tags?: CustomerTag[];
  reseller_id?: number;
  deleted_at?: string;
  is_deleted?: boolean;
}

// Domain Types
export interface DomainInfo {
  name: string;
  extension: string;
}

export interface NameServer {
  name: string;
  ip?: string;
  ip6?: string;
  seq_nr?: number;
}

export interface DomainPrice {
  product: {
    currency: string;
    price: number;
  };
  reseller: {
    currency: string;
    price: number;
  };
}

export interface DomainCheckResult {
  domain: string;
  status: 'free' | 'reserved' | 'in use';
  price?: DomainPrice;
  is_premium?: boolean;
  premium?: {
    price: {
      create: number;
    };
  };
}

export interface DomainRegistration {
  domain: DomainInfo;
  period: number;
  owner_handle: string;
  admin_handle: string;
  tech_handle: string;
  billing_handle?: string;
  reseller_handle?: string;
  name_servers: NameServer[];
  autorenew?: 'on' | 'off' | 'default';
  additional_data?: {
    [key: string]: string;
  };
}

export interface Domain {
  id: number;
  domain: DomainInfo;
  status: 'ACT' | 'REQ' | 'DEL' | 'FAI';
  auth_code?: string;
  internal_auth_code?: string;
  owner_handle: string;
  admin_handle: string;
  tech_handle: string;
  billing_handle?: string;
  reseller_handle?: string;
  name_servers: NameServer[];
  nsgroup_id?: number;
  ns_group?: string;
  ns_template_id?: number;
  ns_template_name?: string;
  dnssec?: string | any[];
  autorenew: 'on' | 'off' | 'default';
  expiration_date: string;
  renewal_date: string;
  registry_expiration_date?: string;
  creation_date?: string;
  active_date?: string;
  order_date?: string;
  last_changed?: string;
  deleted_at?: string;
  is_deleted: boolean;
  is_locked: boolean;
  is_lockable: boolean;
  is_premium: boolean;
  is_private_whois_enabled: boolean;
  is_private_whois_allowed: boolean;
  is_dnssec_enabled: boolean;
  is_hosted_whois: boolean;
  is_abusive: boolean;
  can_renew: boolean;
  has_history: boolean;
  modify_owner_allowed: boolean;
  trade_allowed: boolean;
  trade_auth_code_required: string;
  transfer_auth_code_required: string;
  transfer_cancel_supported: boolean;
  type: 'NEW' | 'TRADE' | 'TRANSFER';
  unit: 'y' | 'm' | 'q';
  comments?: string;
  comments_last_changed_at?: string;
  renew?: number;
  owner?: {
    company_name?: string;
    full_name: string;
  };
  owner_company_name?: string;
  use_domicile: boolean;
}

// DNS Types
export interface DnsRecord {
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'NS' | 'CAA' | 'TLSA' | 'SSHFP';
  value: string;
  ttl: number | string;
  prio?: number;
}

export interface DnsRecordUpdate {
  original_record: DnsRecord;
  record: DnsRecord;
}

export interface DnsZone {
  id?: number;
  name: string;
  type: 'master' | 'slave';
  master_ip?: string;
  active?: number;
  is_deleted?: boolean;
  is_shadow?: boolean;
  is_spamexperts_enabled?: boolean;
  creation_date?: string;
  modification_date?: string;
  dnskey?: string;
  secured?: boolean;
  provider?: string;
  records?: DnsRecord[];
  reseller_id?: number;
}

export interface DnsZoneUpdate {
  id?: number;
  name: string;
  records?: {
    add?: DnsRecord[];
    remove?: DnsRecord[];
    replace?: DnsRecord[];
    update?: DnsRecordUpdate[];
  };
  is_spamexperts_enabled?: boolean;
  master_ip?: string;
}

// API Response Types
export interface ApiResponse<T> {
  code: number;
  data: T;
  desc: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
}
