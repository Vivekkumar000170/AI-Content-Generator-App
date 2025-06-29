import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string; plan?: string }) =>
    api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getMe: () => api.get('/auth/me'),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  logout: () => api.post('/auth/logout'),
};

// Content API
export const contentAPI = {
  generate: (contentRequest: any) =>
    api.post('/content/generate', contentRequest),
  
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => api.get('/content', { params }),
  
  getById: (id: string) => api.get(`/content/${id}`),
  
  update: (id: string, data: any) => api.put(`/content/${id}`, data),
  
  delete: (id: string) => api.delete(`/content/${id}`),
  
  getStats: () => api.get('/content/stats/overview'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (data: { name?: string; preferences?: any }) =>
    api.put('/user/profile', data),
  
  updatePlan: (plan: string) => api.put('/user/plan', { plan }),
  
  updateOpenAIKey: (apiKey: string) => api.put('/user/api-keys/openai', { apiKey }),
  
  getUsage: () => api.get('/user/usage'),
  
  resetUsage: () => api.post('/user/usage/reset'),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (period?: string) =>
    api.get('/analytics/dashboard', { params: { period } }),
  
  logEvent: (event: string, contentType?: string, metadata?: any) =>
    api.post('/analytics/event', { event, contentType, metadata }),
};

export default api;