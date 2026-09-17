import { apiClient } from '@/lib/api';

export const practiceApi = {
  quickPractice: async (params?: { exam_code?: string; count?: number; subject_id?: number }) => {
    const res = await apiClient.post('/practice/quick', null, { params });
    return res.data;
  },

  getWrongQuestions: async (params?: { exam_code?: string; is_mastered?: boolean }) => {
    const res = await apiClient.get('/practice/wrong-questions', { params });
    return res.data;
  },

  toggleMastered: async (questionId: number) => {
    const res = await apiClient.post(`/practice/wrong-questions/${questionId}/toggle-mastered`);
    return res.data;
  },

  toggleBookmark: async (questionId: number, note?: string) => {
    const res = await apiClient.post(`/practice/bookmarks/${questionId}/toggle`, { note });
    return res.data;
  },

  getBookmarks: async () => {
    const res = await apiClient.get('/practice/bookmarks');
    return res.data;
  },
};
