// src/api/apiClient.ts
import { useAuth } from '../context/AuthContext';

// Define base types for API responses
interface ApiResponse<T> {
  data: T;
  code: number;
  desc: string;
}

// API client class
class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string, token: string | null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.desc || 'Something went wrong');
    }

    return data;
  }

  // Customer API endpoints
  async getCustomers(params?: any): Promise<ApiResponse<any>> {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request<ApiResponse<any>>(`/customers${queryParams}`);
  }

  async getCustomer(handle: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/customers/${handle}`);
  }

  async createCustomer(customerData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/customers', 'POST', customerData);
  }

  async updateCustomer(handle: string, customerData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/customers/${handle}`, 'PUT', customerData);
  }

  async deleteCustomer(handle: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/customers/${handle}`, 'DELETE');
  }

  // Domain API endpoints
  async checkDomainAvailability(domains: any[], withPrice: boolean = false): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/domains/check', 'POST', { domains, with_price: withPrice });
  }

  async getDomains(params?: any): Promise<ApiResponse<any>> {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request<ApiResponse<any>>(`/domains${queryParams}`);
  }

  async getDomain(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/domains/${id}`);
  }

  async registerDomain(domainData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/domains', 'POST', domainData);
  }

  async transferDomain(transferData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/domains/transfer', 'POST', transferData);
  }

  async updateDomain(id: string, domainData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/domains/${id}`, 'PUT', domainData);
  }

  async getDomainAuthCode(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/domains/${id}/authcode`);
  }

  async resetDomainAuthCode(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/domains/${id}/authcode/reset`, 'POST');
  }

  async renewDomain(id: string, period: number = 1): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/domains/${id}/renew`, 'POST', { period });
  }

  // DNS API endpoints
  async getDnsZones(params?: any): Promise<ApiResponse<any>> {
    const queryParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request<ApiResponse<any>>(`/dns/zones${queryParams}`);
  }

  async getDnsZone(name: string, withRecords: boolean = true): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dns/zones/${name}?with_records=${withRecords ? 1 : 0}`);
  }

  async createDnsZone(zoneData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/dns/zones', 'POST', zoneData);
  }

  async updateDnsZone(name: string, zoneData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dns/zones/${name}`, 'PUT', zoneData);
  }

  async deleteDnsZone(name: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/dns/zones/${name}`, 'DELETE');
  }
}

// Custom hook to use the API client
export const useApi = () => {
  const { token } = useAuth();
  return new ApiClient('/api', token);
};

export default ApiClient;
