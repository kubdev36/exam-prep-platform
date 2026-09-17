import { create } from 'zustand';
import { Exam, ExamAttempt, Question, StudentAnswer } from '@/types';
import { ExamApi } from '@/lib/api';

interface ExamState {
  exam: Exam | null;
  attempt: ExamAttempt | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, {
    selected_option_ids?: number[];
    text_answer?: string;
    sub_answers?: Record<string, boolean>;
    is_flagged?: boolean;
    time_spent_seconds?: number;
  }>;
  remainingSeconds: number;
  isSaving: boolean;
  isSubmitting: boolean;

  // Actions
  initSession: (data: { exam: Exam; attempt: ExamAttempt; questions: Question[] }) => void;
  setCurrentIndex: (index: number) => void;
  selectOption: (questionId: number, optionId: number, isMultiple?: boolean) => void;
  setSubAnswer: (questionId: number, subKey: string, value: boolean) => void;
  setTextAnswer: (questionId: number, text: string) => void;
  toggleFlag: (questionId: number) => void;
  decrementTimer: () => void;
  submitCurrentExam: () => Promise<ExamAttempt | null>;
}

export const useExamStore = create<ExamState>((set, get) => ({
  exam: null,
  attempt: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  remainingSeconds: 0,
  isSaving: false,
  isSubmitting: false,

  initSession: ({ exam, attempt, questions }) => {
    const durationMins = exam.duration_minutes || 90;
    set({
      exam,
      attempt,
      questions,
      currentIndex: 0,
      answers: {},
      remainingSeconds: durationMins * 60,
      isSubmitting: false,
    });
  },

  setCurrentIndex: (index) => set({ currentIndex: index }),

  selectOption: (questionId, optionId, isMultiple = false) => {
    const currentAnswers = get().answers;
    const currentQAnswer = currentAnswers[questionId] || {};
    let newSelected: number[] = [];

    if (isMultiple) {
      const existing = currentQAnswer.selected_option_ids || [];
      newSelected = existing.includes(optionId)
        ? existing.filter((id) => id !== optionId)
        : [...existing, optionId];
    } else {
      newSelected = [optionId];
    }

    const updated = {
      ...currentAnswers,
      [questionId]: {
        ...currentQAnswer,
        selected_option_ids: newSelected,
      },
    };

    set({ answers: updated, isSaving: true });

    // Auto-save to backend
    const attemptId = get().attempt?.id;
    if (attemptId) {
      ExamApi.saveAnswer(attemptId, {
        question_id: questionId,
        selected_option_ids: newSelected,
        is_flagged: currentQAnswer.is_flagged || false,
      }).finally(() => set({ isSaving: false }));
    }
  },

  setSubAnswer: (questionId, subKey, value) => {
    const currentAnswers = get().answers;
    const currentQAnswer = currentAnswers[questionId] || {};
    const subAnswers = { ...(currentQAnswer.sub_answers || {}), [subKey]: value };

    const updated = {
      ...currentAnswers,
      [questionId]: {
        ...currentQAnswer,
        sub_answers: subAnswers,
      },
    };

    set({ answers: updated, isSaving: true });

    const attemptId = get().attempt?.id;
    if (attemptId) {
      ExamApi.saveAnswer(attemptId, {
        question_id: questionId,
        sub_answers: subAnswers,
        is_flagged: currentQAnswer.is_flagged || false,
      }).finally(() => set({ isSaving: false }));
    }
  },

  setTextAnswer: (questionId, text) => {
    const currentAnswers = get().answers;
    const currentQAnswer = currentAnswers[questionId] || {};

    const updated = {
      ...currentAnswers,
      [questionId]: {
        ...currentQAnswer,
        text_answer: text,
      },
    };

    set({ answers: updated, isSaving: true });

    const attemptId = get().attempt?.id;
    if (attemptId) {
      ExamApi.saveAnswer(attemptId, {
        question_id: questionId,
        text_answer: text,
        is_flagged: currentQAnswer.is_flagged || false,
      }).finally(() => set({ isSaving: false }));
    }
  },

  toggleFlag: (questionId) => {
    const currentAnswers = get().answers;
    const currentQAnswer = currentAnswers[questionId] || {};
    const newFlag = !currentQAnswer.is_flagged;

    const updated = {
      ...currentAnswers,
      [questionId]: {
        ...currentQAnswer,
        is_flagged: newFlag,
      },
    };

    set({ answers: updated });

    const attemptId = get().attempt?.id;
    if (attemptId) {
      ExamApi.saveAnswer(attemptId, {
        question_id: questionId,
        is_flagged: newFlag,
      });
    }
  },

  decrementTimer: () => {
    set((state) => ({
      remainingSeconds: Math.max(0, state.remainingSeconds - 1),
    }));
  },

  submitCurrentExam: async () => {
    const attempt = get().attempt;
    if (!attempt) return null;

    set({ isSubmitting: true });
    try {
      const res = await ExamApi.submitAttempt(attempt.id);
      return res.attempt;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
