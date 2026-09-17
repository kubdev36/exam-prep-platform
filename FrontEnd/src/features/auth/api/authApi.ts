import { apiClient } from '@/lib/api';
import { User } from '@/types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', res.data.token);
    }
    return res.data;
  },

  register: async (data: { name: string; email: string; password: string; current_exam_code?: string }) => {
    const res = await apiClient.post('/auth/register', data);
    if (res.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', res.data.token);
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data.user as User;
  },

  updateTarget: async (data: { current_exam_code?: string; target_scores?: Record<string, any> }) => {
    const res = await apiClient.put('/auth/target', data);
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  },
};
