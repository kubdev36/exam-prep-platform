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

// Fallback Mock Data for demo & instant testing
export const MOCK_EXAM_TYPES: ExamType[] = [
  {
    id: 1,
    code: 'THPT',
    name: 'Thi Tốt Nghiệp THPT Quốc Gia',
    slug: 'thpt-quoc-gia',
    badge: 'Bộ GD&ĐT',
    description: 'Luyện theo môn Toán, Lý, Hóa, Sinh, Anh, Văn... bám sát cấu trúc ma trận mới nhất.',
    icon: 'GraduationCap',
    max_score: 10.0,
    default_duration_minutes: 90,
    exams_count: 24,
    questions_count: 3500,
  },
  {
    id: 2,
    code: 'HSA',
    name: 'Đánh Giá Năng Lực HSA',
    slug: 'danh-gia-nang-luc-hsa',
    badge: 'ĐHQG Hà Nội',
    description: '3 phần độc lập: Toán học & Xử lý số liệu, Ngôn ngữ - Văn học, Khoa học Tự nhiên & Xã hội.',
    icon: 'BookOpenCheck',
    max_score: 150.0,
    default_duration_minutes: 195,
    exams_count: 12,
    questions_count: 2400,
  },
  {
    id: 3,
    code: 'TSA',
    name: 'Đánh Giá Tư Duy TSA',
    slug: 'danh-gia-tu-duy-tsa',
    badge: 'ĐH Bách Khoa Hà Nội',
    description: 'Tư duy Toán học, Tư duy Đọc hiểu, Tư duy Khoa học / Giải quyết vấn đề kỹ thuật.',
    icon: 'BrainCircuit',
    max_score: 100.0,
    default_duration_minutes: 150,
    exams_count: 8,
    questions_count: 1800,
  },
];

export const MOCK_USER: User = {
  id: 1,
  name: 'Nguyễn Minh An',
  email: 'student@luyenthi.vn',
  role: 'STUDENT',
  current_exam_code: 'THPT',
  target_scores: {
    THPT: { math: 9.2, physics: 8.8, chemistry: 8.5 },
    HSA: 115,
    TSA: 78,
  },
};

export const MOCK_DASHBOARD: DashboardSummary = {
  user: MOCK_USER,
  total_attempts: 18,
  wrong_count: 12,
  exam_stats: {
    THPT: {
      code: 'THPT',
      name: 'THPT Quốc Gia',
      max_score: 10.0,
      current_score: 8.2,
      target_score: { math: 9.2 },
      attempts_count: 10,
    },
    HSA: {
      code: 'HSA',
      name: 'ĐGNL HSA ĐHQGHN',
      max_score: 150.0,
      current_score: 102.5,
      target_score: 115,
      attempts_count: 5,
    },
    TSA: {
      code: 'TSA',
      name: 'ĐGTD TSA ĐHBKHN',
      max_score: 100.0,
      current_score: 71.0,
      target_score: 78,
      attempts_count: 3,
    },
  },
  recent_attempts: [
    {
      id: 101,
      user_id: 1,
      exam_id: 1,
      started_at: '2026-09-15T14:30:00Z',
      submitted_at: '2026-09-15T15:55:00Z',
      duration_seconds: 5100,
      score: 8.25,
      max_score: 10.0,
      correct_count: 28,
      wrong_count: 6,
      skipped_count: 0,
      status: 'SUBMITTED',
      exam: {
        id: 1,
        exam_type_id: 1,
        title: 'Đề thi thử THPT Quốc Gia 2026 - Môn Toán (Mã đề 101)',
        slug: 'de-thi-thu-thpt-toan-2026-ma-101',
        type: 'MOCK_TEST',
        duration_minutes: 90,
        total_questions: 34,
        total_score: 10.0,
        attempts_count: 142,
        average_score: 7.6,
      },
    },
  ],
  weak_topics: [
    {
      topic_id: 1,
      topic_name: 'Cực trị hàm số chứa dấu giá trị tuyệt đối',
      subject_name: 'Toán học',
      subject_color: '#3b82f6',
      wrong_count: 5,
    },
    {
      topic_id: 2,
      topic_name: 'Xử lý biểu đồ đa trục & Tăng trưởng',
      subject_name: 'Định lượng HSA',
      subject_color: '#2563eb',
      wrong_count: 4,
    },
    {
      topic_id: 3,
      topic_name: 'Logic suy luận bài toán tối ưu TSA',
      subject_name: 'Tư duy Toán học TSA',
      subject_color: '#7c3aed',
      wrong_count: 3,
    },
  ],
};

// API Services
export const ExamApi = {
  getExamTypes: async () => {
    try {
      const res = await apiClient.get('/exam-types');
      return res.data.data as ExamType[];
    } catch {
      return MOCK_EXAM_TYPES;
    }
  },

  getExamTypeDetail: async (codeOrSlug: string) => {
    try {
      const res = await apiClient.get(`/exam-types/${codeOrSlug}`);
      return res.data.data as ExamType;
    } catch {
      return MOCK_EXAM_TYPES.find((e) => e.code === codeOrSlug.toUpperCase()) || MOCK_EXAM_TYPES[0];
    }
  },

  getExams: async (params?: { exam_type?: string; type?: string }) => {
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
      // Mock start response
      return {
        attempt: {
          id: 999,
          user_id: 1,
          exam_id: examId,
          started_at: new Date().toISOString(),
          duration_seconds: 0,
          score: 0,
          max_score: examId === 1 ? 10 : examId === 2 ? 150 : 100,
          status: 'IN_PROGRESS',
        },
        exam: {
          id: examId,
          title: examId === 1 ? 'Đề thi thử THPT Quốc Gia 2026 - Môn Toán' : examId === 2 ? 'Đề thi thử HSA 2026' : 'Đề thi thử TSA 2026',
          duration_minutes: examId === 1 ? 90 : examId === 2 ? 195 : 150,
          total_questions: 3,
          total_score: examId === 1 ? 10 : examId === 2 ? 150 : 100,
        },
        questions: [
          {
            id: 1,
            question_type: 'SINGLE_CHOICE',
            difficulty_level: 2,
            content: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đạo hàm $f\'(x) = x(x-1)^2(x+2)^3$. Điểm cực tiểu của hàm số đã cho là:',
            point_value: examId === 1 ? 3.0 : 50.0,
            order_index: 1,
            options: [
              { id: 101, question_id: 1, content: '$x = 0$', order_index: 1 },
              { id: 102, question_id: 1, content: '$x = 1$', order_index: 2 },
              { id: 103, question_id: 1, content: '$x = -2$', order_index: 3 },
              { id: 104, question_id: 1, content: '$x = 2$', order_index: 4 },
            ],
          },
          {
            id: 2,
            question_type: 'TRUE_FALSE',
            difficulty_level: 3,
            content: 'Cho hàm số bậc ba $y = f(x) = ax^3 + bx^2 + cx + d$ ($a \\neq 0$) có đồ thị đi qua điểm $A(0; 2)$ và có hai điểm cực trị là $x_1 = 1, x_2 = 3$. Xét tính đúng/sai của các mệnh đề sau:',
            point_value: examId === 1 ? 4.0 : 50.0,
            order_index: 2,
            options: [
              { id: 201, question_id: 2, sub_key: 'a', content: 'Hệ số tự do $d = 2$', order_index: 1 },
              { id: 202, question_id: 2, sub_key: 'b', content: 'Hàm số đồng biến trên khoảng $(1; 3)$ khi $a > 0$', order_index: 2 },
              { id: 203, question_id: 2, sub_key: 'c', content: 'Hoành độ điểm uốn của đồ thị hàm số là $x = 2$', order_index: 3 },
              { id: 204, question_id: 2, sub_key: 'd', content: 'Biểu thức liên hệ $b + 6a = 0$', order_index: 4 },
            ],
          },
          {
            id: 3,
            question_type: 'SHORT_ANSWER',
            difficulty_level: 3,
            content: 'Biết rằng $\\int_{0}^{2} (3x^2 - 2x + 1) dx = K$. Tính giá trị của $K$.',
            point_value: examId === 1 ? 3.0 : 50.0,
            order_index: 3,
            options: [],
          },
        ],
      };
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
      return {
        message: 'Nộp bài thành công',
        attempt: {
          id: attemptId,
          score: 8.5,
          max_score: 10.0,
          correct_count: 2,
          wrong_count: 1,
          skipped_count: 0,
          status: 'SUBMITTED',
          duration_seconds: 2450,
          section_scores: {
            'Toán học': { name: 'Toán học', earned_score: 8.5, max_score: 10.0, correct: 2, total: 3 },
          },
        },
      };
    }
  },

  reviewAttempt: async (attemptId: number) => {
    try {
      const res = await apiClient.get(`/attempts/${attemptId}/review`);
      return res.data;
    } catch {
      return {
        attempt: {
          id: attemptId,
          score: 8.5,
          max_score: 10.0,
          correct_count: 2,
          wrong_count: 1,
          duration_seconds: 2450,
          status: 'SUBMITTED',
          section_scores: {
            'Toán học': { name: 'Toán học', earned_score: 8.5, max_score: 10.0, correct: 2, total: 3 },
          },
          exam: {
            id: 1,
            title: 'Đề thi thử THPT Quốc Gia 2026 - Môn Toán (Mã đề 101)',
          },
        },
        questions: [
          {
            id: 1,
            question_type: 'SINGLE_CHOICE',
            difficulty_level: 2,
            content: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đạo hàm $f\'(x) = x(x-1)^2(x+2)^3$. Điểm cực tiểu của hàm số đã cho là:',
            explanation: 'Ta xét dấu đạo hàm: $x=0$ là nghiệm đơn đổi dấu từ $-$ sang $+$. Do đó hàm số đạt cực tiểu tại $x=0$.',
            point_value: 3.0,
            options: [
              { id: 101, content: '$x = 0$', is_correct: true, order_index: 1 },
              { id: 102, content: '$x = 1$', is_correct: false, order_index: 2 },
              { id: 103, content: '$x = -2$', is_correct: false, order_index: 3 },
              { id: 104, content: '$x = 2$', is_correct: false, order_index: 4 },
            ],
            student_answer: {
              attempt_id: attemptId,
              question_id: 1,
              selected_option_ids: [101],
              is_correct: true,
              score_awarded: 3.0,
            },
          },
          {
            id: 2,
            question_type: 'TRUE_FALSE',
            difficulty_level: 3,
            content: 'Cho hàm số bậc ba $y = f(x) = ax^3 + bx^2 + cx + d$ ($a \\neq 0$) có đồ thị đi qua điểm $A(0; 2)$ và có hai điểm cực trị là $x_1 = 1, x_2 = 3$. Xét tính đúng/sai của các mệnh đề sau:',
            explanation: 'Đồ thị qua $A(0; 2) \\Rightarrow d = 2$. Đạo hàm $f\'(x) = 3a(x-1)(x-3) = 3ax^2 - 12ax + 9a \\Rightarrow 2b = -12a \\Rightarrow b = -6a \\Leftrightarrow b + 6a = 0$. Hoành độ điểm uốn $x_u = (1+3)/2 = 2$.',
            point_value: 4.0,
            options: [
              { id: 201, sub_key: 'a', content: 'Hệ số tự do $d = 2$', is_correct: true, order_index: 1 },
              { id: 202, sub_key: 'b', content: 'Hàm số đồng biến trên khoảng $(1; 3)$ khi $a > 0$', is_correct: false, order_index: 2 },
              { id: 203, sub_key: 'c', content: 'Hoành độ điểm uốn của đồ thị hàm số là $x = 2$', is_correct: true, order_index: 3 },
              { id: 204, sub_key: 'd', content: 'Biểu thức liên hệ $b + 6a = 0$', is_correct: true, order_index: 4 },
            ],
            student_answer: {
              attempt_id: attemptId,
              question_id: 2,
              sub_answers: { a: true, b: false, c: true, d: true },
              is_correct: true,
              score_awarded: 4.0,
            },
          },
          {
            id: 3,
            question_type: 'SHORT_ANSWER',
            difficulty_level: 3,
            content: 'Biết rằng $\\int_{0}^{2} (3x^2 - 2x + 1) dx = K$. Tính giá trị của $K$.',
            explanation: 'Ta có $\\int_0^2 (3x^2 - 2x + 1)dx = [x^3 - x^2 + x]_0^2 = 8 - 4 + 2 = 6$.',
            point_value: 3.0,
            options: [{ id: 301, content: '6', is_correct: true, order_index: 1 }],
            student_answer: {
              attempt_id: attemptId,
              question_id: 3,
              text_answer: '5.5',
              is_correct: false,
              score_awarded: 1.5,
            },
          },
        ],
      };
    }
  },

  getDashboardSummary: async () => {
    try {
      const res = await apiClient.get('/dashboard/summary');
      return res.data as DashboardSummary;
    } catch {
      return MOCK_DASHBOARD;
    }
  },
};
