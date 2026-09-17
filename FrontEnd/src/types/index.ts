export type ExamTypeCode = 'THPT' | 'HSA' | 'TSA';

export interface ExamType {
  id: number;
  code: ExamTypeCode;
  name: string;
  slug: string;
  description?: string;
  badge?: string;
  icon?: string;
  max_score: number;
  default_duration_minutes: number;
  exams_count?: number;
  questions_count?: number;
  sections?: ExamSection[];
  subjects?: Subject[];
}

export interface ExamSection {
  id: number;
  exam_type_id: number;
  name: string;
  code: string;
  description?: string;
  max_score: number;
  default_question_count: number;
  order_index: number;
  subjects?: Subject[];
}

export interface Subject {
  id: number;
  exam_type_id: number;
  section_id?: number | null;
  name: string;
  code: string;
  slug: string;
  icon?: string;
  color?: string;
  questions_count?: number;
  topics?: Topic[];
}

export interface Topic {
  id: number;
  subject_id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string;
  questions_count?: number;
  children?: Topic[];
}

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MATCHING';

export interface QuestionOption {
  id: number;
  question_id: number;
  content: string;
  is_correct?: boolean;
  sub_key?: string | null;
  order_index: number;
  fraction_score?: number;
}

export interface Question {
  id: number;
  exam_type_id: number;
  section_id?: number | null;
  subject_id?: number | null;
  topic_id?: number | null;
  question_type: QuestionType;
  difficulty_level: 1 | 2 | 3 | 4;
  content: string;
  passage?: string | null;
  explanation?: string | null;
  media_urls?: string[] | null;
  metadata?: Record<string, any> | null;
  points?: number;
  point_value?: number;
  order_index?: number;
  section_name?: string;
  section_code?: string;
  options: QuestionOption[];
  subject?: Subject;
  section?: ExamSection;
  topic?: Topic;
  student_answer?: StudentAnswer;
}

export interface Exam {
  id: number;
  exam_type_id: number;
  template_id?: number | null;
  subject_id?: number | null;
  title: string;
  slug: string;
  type: 'OFFICIAL_YEAR' | 'MOCK_TEST' | 'PRACTICE_CUSTOM';
  year?: number | null;
  duration_minutes: number;
  total_questions: number;
  total_score: number;
  description?: string;
  attempts_count: number;
  average_score: number;
  exam_type?: ExamType;
  subject?: Subject;
  questions?: Question[];
}

export interface ExamAttempt {
  id: number;
  user_id: number;
  exam_id: number;
  started_at: string;
  submitted_at?: string | null;
  duration_seconds: number;
  score: number;
  max_score: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';
  section_scores?: Record<string, {
    name: string;
    earned_score: number;
    max_score: number;
    correct: number;
    total: number;
  }> | null;
  exam?: Exam;
}

export interface StudentAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  selected_option_ids?: number[] | null;
  text_answer?: string | null;
  sub_answers?: Record<string, boolean> | null;
  is_correct?: boolean;
  is_flagged?: boolean;
  score_awarded?: number;
  time_spent_seconds?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar_url?: string | null;
  current_exam_code: ExamTypeCode;
  target_scores?: Record<string, any>;
}

export interface DashboardSummary {
  user: User;
  total_attempts: number;
  wrong_count: number;
  exam_stats: Record<string, {
    code: ExamTypeCode;
    name: string;
    max_score: number;
    current_score: number | null;
    target_score: any;
    attempts_count: number;
  }>;
  recent_attempts: ExamAttempt[];
  weak_topics: Array<{
    topic_id: number;
    topic_name: string;
    subject_name: string;
    subject_color: string;
    wrong_count: number;
  }>;
}
