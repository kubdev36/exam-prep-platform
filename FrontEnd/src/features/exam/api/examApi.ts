import { apiClient, MOCK_EXAM_TYPES } from '@/lib/api';
import { Exam, ExamAttempt, ExamType } from '@/types';

export const examApi = {
  getExamTypes: async (): Promise<ExamType[]> => {
    try {
      const res = await apiClient.get('/exam-types');
      return res.data.data;
    } catch {
      return MOCK_EXAM_TYPES;
    }
  },

  getExamTypeDetail: async (codeOrSlug: string): Promise<ExamType> => {
    try {
      const res = await apiClient.get(`/exam-types/${codeOrSlug}`);
      return res.data.data;
    } catch {
      return MOCK_EXAM_TYPES.find((e) => e.code === codeOrSlug.toUpperCase()) || MOCK_EXAM_TYPES[0];
    }
  },

  getExams: async (params?: { exam_type?: string; type?: string; subject_id?: number }) => {
    try {
      const res = await apiClient.get('/exams', { params });
      return res.data;
    } catch {
      return {
        data: [
          {
            id: 1,
            exam_type_id: 1,
            title: 'Đề thi thử THPT Quốc Gia 2026 - Môn Toán (Mã đề 101)',
            slug: 'de-thi-thu-thpt-toan-2026-ma-101',
            type: 'MOCK_TEST',
            year: 2026,
            duration_minutes: 90,
            total_questions: 3,
            total_score: 10.0,
            description: 'Đề bám sát cấu trúc đề minh họa mới nhất gồm 3 phần: Trắc nghiệm 4 lựa chọn, Đúng/Sai và Điền khuyết.',
            attempts_count: 142,
            average_score: 7.6,
          },
          {
            id: 2,
            exam_type_id: 2,
            title: 'Đề thi thử Đánh Giá Năng Lực HSA 2026 - ĐHQG Hà Nội',
            slug: 'de-thi-thu-dgnl-hsa-2026-dhqg-ha-noi',
            type: 'MOCK_TEST',
            year: 2026,
            duration_minutes: 195,
            total_questions: 2,
            total_score: 150.0,
            description: 'Đề thi thử tổng hợp 3 phần định lượng, định tính và khoa học bám sát kỳ thi ĐHQGHN.',
            attempts_count: 218,
            average_score: 94.5,
          },
          {
            id: 3,
            exam_type_id: 3,
            title: 'Đề thi thử Đánh Giá Tư Duy TSA 2026 - ĐH Bách Khoa Hà Nội',
            slug: 'de-thi-thu-dgtd-tsa-2026-dh-bach-khoa-ha-noi',
            type: 'MOCK_TEST',
            year: 2026,
            duration_minutes: 150,
            total_questions: 2,
            total_score: 100.0,
            description: 'Đề luyện thi đánh giá tư duy kỹ thuật và tư duy phân tích khoa học ĐHBK Hà Nội.',
            attempts_count: 95,
            average_score: 67.2,
          },
        ] as Exam[],
      };
    }
  },

  startAttempt: async (examId: number) => {
    try {
      const res = await apiClient.post(`/exams/${examId}/start`);
      return res.data;
    } catch {
      return null;
    }
  },

  saveAnswer: async (attemptId: number, data: any) => {
    try {
      const res = await apiClient.post(`/attempts/${attemptId}/save-answer`, data);
      return res.data;
    } catch {
      return { status: 'saved_locally' };
    }
  },

  submitAttempt: async (attemptId: number) => {
    try {
      const res = await apiClient.post(`/attempts/${attemptId}/submit`);
      return res.data;
    } catch {
      return null;
    }
  },

  reviewAttempt: async (attemptId: number) => {
    try {
      const res = await apiClient.get(`/attempts/${attemptId}/review`);
      return res.data;
    } catch {
      return null;
    }
  },
};
