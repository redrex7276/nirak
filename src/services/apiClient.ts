import { Job, User, JobApplication, SMSMessage, WorkHistoryItem } from '../types';

const TOKEN_KEY = 'shramik_auth_token_v2';

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.error?.message) errMsg = parsed.error.message;
      } catch {
        // use default status message
      }
      throw new Error(errMsg);
    }

    if (!contentType.includes('application/json') || text.trim().startsWith('<')) {
      throw new Error('Backend API endpoint not available (HTML SPA fallback received)');
    }

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error('Invalid JSON response from server');
    }

    return data as T;
  }

  // --- Auth Endpoints ---
  async login(identifier: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    this.setToken(res.token);
    return res;
  }

  async registerCustomer(data: any): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: any; token: string }>('/api/auth/register/customer', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async registerFreelancer(data: any): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: any; token: string }>('/api/auth/register/freelancer', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await this.request<{ user: User }>('/api/auth/me');
      return res.user;
    } catch {
      this.setToken(null);
      return null;
    }
  }

  async getUsers(): Promise<User[]> {
    const res = await this.request<{ users: User[] }>('/api/auth/users');
    return res.users;
  }

  logout() {
    this.setToken(null);
  }

  // --- Jobs Endpoints ---
  async getJobs(filters: { search?: string; category?: string; location?: string; status?: string; customerId?: string; sort?: string; page?: number; limit?: number } = {}): Promise<{ jobs: Job[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ jobs: Job[]; total: number }>(`/api/jobs${qs}`);
  }

  async getJobById(id: string): Promise<{ job: Job; applications: JobApplication[] }> {
    return this.request<{ job: Job; applications: JobApplication[] }>(`/api/jobs/${id}`);
  }

  async createJob(jobData: any): Promise<Job> {
    const res = await this.request<{ job: Job }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
    return res.job;
  }

  async updateJob(id: string, updates: any): Promise<Job> {
    const res = await this.request<{ job: Job }>(`/api/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.job;
  }

  async cancelJob(id: string): Promise<Job> {
    const res = await this.request<{ job: Job }>(`/api/jobs/${id}/cancel`, {
      method: 'POST'
    });
    return res.job;
  }

  async assignWorker(jobId: string, workerId: string): Promise<Job> {
    const res = await this.request<{ job: Job }>(`/api/jobs/${jobId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ workerId })
    });
    return res.job;
  }

  async completeJob(jobId: string): Promise<Job> {
    const res = await this.request<{ job: Job }>(`/api/jobs/${jobId}/complete`, {
      method: 'POST'
    });
    return res.job;
  }

  // --- Freelancers Endpoints ---
  async getFreelancers(filters: { search?: string; skill?: string; category?: string; location?: string; availability?: string; page?: number; limit?: number } = {}): Promise<{ freelancers: any[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.availability) params.append('availability', filters.availability);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ freelancers: any[]; total: number }>(`/api/freelancers${qs}`);
  }

  async getFreelancerById(id: string): Promise<any> {
    const res = await this.request<{ freelancer: any }>(`/api/freelancers/${id}`);
    return res.freelancer;
  }

  async updateFreelancerProfile(id: string, updates: any): Promise<any> {
    const res = await this.request<{ freelancer: any }>(`/api/freelancers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return res.freelancer;
  }

  async updateAvailability(id: string, availability: string): Promise<any> {
    const res = await this.request<{ freelancer: any }>(`/api/freelancers/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ availability })
    });
    return res.freelancer;
  }

  async getFreelancerHistory(id: string): Promise<WorkHistoryItem[]> {
    const res = await this.request<{ history: WorkHistoryItem[] }>(`/api/freelancers/${id}/history`);
    return res.history;
  }

  // --- SMS Endpoints ---
  async dispatchOpportunities(jobId: string, workerIds: string[]): Promise<any> {
    return this.request('/api/sms/dispatch', {
      method: 'POST',
      body: JSON.stringify({ jobId, workerIds })
    });
  }

  async simulateWorkerReply(jobId: string, workerId: string, reply: string): Promise<any> {
    return this.request('/api/sms/simulate', {
      method: 'POST',
      body: JSON.stringify({ jobId, workerId, reply })
    });
  }

  async getSMSLogs(jobId?: string): Promise<SMSMessage[]> {
    const qs = jobId ? `?jobId=${jobId}` : '';
    const res = await this.request<{ logs: SMSMessage[] }>(`/api/sms/logs${qs}`);
    return res.logs;
  }

  async getApplications(jobId?: string, workerId?: string): Promise<JobApplication[]> {
    const params = new URLSearchParams();
    if (jobId) params.append('jobId', jobId);
    if (workerId) params.append('workerId', workerId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{ applications: JobApplication[] }>(`/api/sms/applications${qs}`);
    return res.applications;
  }

  // --- Dashboard Endpoints ---
  async getCustomerStats(): Promise<any> {
    const res = await this.request<{ stats: any }>('/api/dashboard/customer');
    return res.stats;
  }

  async getFreelancerStats(): Promise<any> {
    const res = await this.request<{ stats: any }>('/api/dashboard/freelancer');
    return res.stats;
  }
}

export const apiClient = new ApiClient();
