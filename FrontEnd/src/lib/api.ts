import axios from 'axios';
import { DashboardSummary, Exam, ExamAttempt, ExamType, Question, Subject, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API Services connected directly to PostgreSQL Backend
export const ExamApi = {
  getExamTypes: async (): Promise<ExamType[]> => {
    const res = await apiClient.get('/exam-types');
    return res.data.data;
  },

  getExamTypeDetail: async (codeOrSlug: string): Promise<ExamType> => {
    const res = await apiClient.get(`/exam-types/${codeOrSlug}`);
    return res.data.data;
  },

  getSubjects: async (examCode: string): Promise<Subject[]> => {
    const res = await apiClient.get(`/exam-types/${examCode}/subjects`);
    return res.data.data;
  },

  getTopicsBySubject: async (subjectId: number) => {
    const res = await apiClient.get(`/subjects/${subjectId}/topics`);
    return res.data.data;
  },

  getExams: async (params?: { exam_type?: string; type?: string; subject_id?: number }) => {
    const res = await apiClient.get('/exams', { params });
    return res.data;
  },

  getExamDetail: async (id: number): Promise<Exam> => {
    const res = await apiClient.get(`/exams/${id}`);
    return res.data.data;
  },

  startAttempt: async (examId: number) => {
    const res = await apiClient.post(`/exams/${examId}/start`);
    return res.data;
  },

  saveAnswer: async (attemptId: number, data: {
    question_id: number;
    selected_option_ids?: number[];
    text_answer?: string;
    sub_answers?: Record<string, boolean>;
    is_flagged?: boolean;
    time_spent_seconds?: number;
  }) => {
    const res = await apiClient.post(`/attempts/${attemptId}/save-answer`, data);
    return res.data;
  },

  submitAttempt: async (attemptId: number) => {
    const res = await apiClient.post(`/attempts/${attemptId}/submit`);
    return res.data;
  },

  reviewAttempt: async (attemptId: number) => {
    const res = await apiClient.get(`/attempts/${attemptId}/review`);
    return res.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get('/dashboard/summary');
    return res.data;
  },

  getWrongQuestions: async (params?: { exam_code?: string; is_mastered?: boolean; page?: number }) => {
    const res = await apiClient.get('/practice/wrong-questions', { params });
    return res.data;
  },

  toggleWrongQuestionMastered: async (questionId: number) => {
    const res = await apiClient.post(`/practice/wrong-questions/${questionId}/toggle-mastered`);
    return res.data;
  },

  toggleBookmark: async (questionId: number, note?: string) => {
    const res = await apiClient.post(`/practice/bookmarks/${questionId}/toggle`, { note });
    return res.data;
  },

  getBookmarks: async (page = 1) => {
    const res = await apiClient.get('/practice/bookmarks', { params: { page } });
    return res.data;
  },

  quickPractice: async (params: { exam_code: string; count?: number; subject_id?: number; topic_id?: number }) => {
    const res = await apiClient.post('/practice/quick', null, { params });
    return res.data;
  },

  parseDocument: async (formData: FormData) => {
    const res = await apiClient.post('/exams/parse-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  saveImportedExam: async (payload: any) => {
    const res = await apiClient.post('/exams/save-imported-exam', payload);
    return res.data;
  },
};
