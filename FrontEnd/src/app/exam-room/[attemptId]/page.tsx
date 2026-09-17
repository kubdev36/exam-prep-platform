'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Flag, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertCircle, 
  CloudCheck, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useExamStore } from '@/stores/useExamStore';
import { ExamApi } from '@/lib/api';
import MathRenderer from '@/components/MathRenderer';

export default function ExamRoomPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const resolvedParams = use(params);
  const attemptId = parseInt(resolvedParams.attemptId, 10);
  const router = useRouter();

  const {
    exam,
    attempt,
    questions,
    currentIndex,
    answers,
    remainingSeconds,
    isSaving,
    isSubmitting,
    initSession,
    setCurrentIndex,
    selectOption,
    setSubAnswer,
    setTextAnswer,
    toggleFlag,
    decrementTimer,
    submitCurrentExam,
  } = useExamStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Initialize session
  useEffect(() => {
    async function fetchExamSession() {
      try {
        setError(null);
        const sessionData = await ExamApi.startAttempt(attemptId || 1);
        if (sessionData && sessionData.questions && sessionData.questions.length > 0) {
          initSession({
            exam: sessionData.exam,
            attempt: sessionData.attempt,
            questions: sessionData.questions,
          });
        } else {
          setError('Không tìm thấy dữ liệu đề thi này.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Đề thi này đã được cập nhật phiên bản mới hoặc không tồn tại. Vui lòng quay lại danh sách để chọn đề.');
      } finally {
        setLoading(false);
      }
    }
    fetchExamSession();
  }, [attemptId, initSession]);

  // Timer countdown
  useEffect(() => {
    if (loading || !attempt) return;
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, attempt, decrementTimer]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Đang chuẩn bị phòng thi...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Thông Báo Đề Thi</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'Đề thi chưa có câu hỏi hoặc đang được làm mới.'}
            </p>
          </div>
          <Link
            href="/exams/THPT_MATH"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
          >
            <span>Quay Lại Kho Đề Thi Toán</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const currentAnswer = answers[currentQ.id] || {};
  const isFlagged = !!currentAnswer.is_flagged;

  // Format timer
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const isTimeLow = remainingSeconds < 300;

  // Progress summary
  const answeredCount = Object.keys(answers).filter((qId) => {
    const ans = answers[parseInt(qId, 10)];
    return (
      (ans.selected_option_ids && ans.selected_option_ids.length > 0) ||
      (ans.sub_answers && Object.keys(ans.sub_answers).length > 0) ||
      (ans.text_answer && ans.text_answer.trim() !== '')
    );
  }).length;

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    const submittedAttempt = await submitCurrentExam();
    if (submittedAttempt) {
      router.push(`/exam-results/${submittedAttempt.id}`);
    } else {
      router.push(`/exam-results/${attempt?.id || 1}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e1422]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs">
            {exam?.title || 'Phòng Thi Trực Tuyến'}
          </div>
          {isSaving && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Đang lưu...</span>
            </div>
          )}
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-4">
          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-bold shadow-md transition-colors ${
              isTimeLow
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span>
              {hours > 0 ? `${hours}:` : ''}
              {minutes < 10 ? `0${minutes}` : minutes}:
              {seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Bài</span>
          </button>
        </div>
      </header>

      {/* Main Examination Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Question Arena */}
        <div className="lg:col-span-3 flex flex-col justify-between glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <div>
            {/* Question Header & Flag button */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-base font-extrabold text-white">
                  Câu {currentIndex + 1} / {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                  {currentQ.question_type === 'SINGLE_CHOICE' && 'Trắc nghiệm 4 lựa chọn'}
                  {currentQ.question_type === 'TRUE_FALSE' && 'Trắc nghiệm Đúng / Sai'}
                  {currentQ.question_type === 'SHORT_ANSWER' && 'Trả lời ngắn (Điền số)'}
                </span>
                <span className="text-xs text-blue-400 font-semibold">
                  ({currentQ.point_value || 1.0} điểm)
                </span>
              </div>

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isFlagged
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
                <span>{isFlagged ? 'Đã đặt cờ' : 'Đặt cờ'}</span>
              </button>
            </div>

            {/* Reading Passage (if any) */}
            {currentQ.passage && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 text-sm text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ngữ Liệu Đọc Hiểu</span>
                </div>
                <MathRenderer content={currentQ.passage} />
              </div>
            )}

            {/* Question Content */}
            <div className="text-base sm:text-lg font-medium text-white mb-8 leading-relaxed">
              <MathRenderer content={currentQ.content} />
            </div>

            {/* Options by Question Type */}
            {/* 1. SINGLE_CHOICE */}
            {currentQ.question_type === 'SINGLE_CHOICE' && (
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = (currentAnswer.selected_option_ids || []).includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(currentQ.id, opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                          : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {letter}
                      </div>
                      <div className="text-sm font-normal flex-1">
                        <MathRenderer content={opt.content} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. TRUE_FALSE 4 Sub-Items (Format Mới 2025/2026) */}
            {currentQ.question_type === 'TRUE_FALSE' && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  Hãy chọn <span className="text-emerald-400 font-bold">Đúng</span> hoặc{' '}
                  <span className="text-rose-400 font-bold">Sai</span> cho từng mệnh đề sau:
                </div>

                {currentQ.options.map((opt) => {
                  const subKey = opt.sub_key || 'a';
                  const userVal = currentAnswer.sub_answers?.[subKey];

                  return (
                    <div
                      key={opt.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="font-bold text-blue-400 uppercase text-sm mt-0.5">
                          {subKey})
                        </span>
                        <div className="text-sm text-slate-200">
                          <MathRenderer content={opt.content} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setSubAnswer(currentQ.id, subKey, true)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            userVal === true
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Đúng
                        </button>
                        <button
                          onClick={() => setSubAnswer(currentQ.id, subKey, false)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            userVal === false
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Sai
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. SHORT_ANSWER */}
            {currentQ.question_type === 'SHORT_ANSWER' && (
              <div className="space-y-4 max-w-md">
                <label className="text-xs font-semibold text-slate-400 block">
                  Nhập đáp số (Ví dụ: 6 hoặc 3.5 hoặc -12):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentAnswer.text_answer || ''}
                    onChange={(e) => setTextAnswer(currentQ.id, e.target.value)}
                    placeholder="Điền kết quả..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls Bottom */}
          <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-white flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu Trước</span>
            </button>

            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <span>Câu Tiếp Theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Question Navigator & Summary */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 h-fit space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-white mb-1">Bảng Điều Hướng Câu Hỏi</h3>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Đã hoàn thành:</span>
              <span className="text-blue-400 font-bold">{answeredCount} / {questions.length} câu</span>
            </div>
          </div>

          {/* Color Legend */}
          <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-400 pb-4 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Đã làm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Đặt cờ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Chưa làm</span>
            </div>
          </div>

          {/* Question Grid Bubbles */}
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isAnswered =
                ans &&
                ((ans.selected_option_ids && ans.selected_option_ids.length > 0) ||
                  (ans.sub_answers && Object.keys(ans.sub_answers).length > 0) ||
                  (ans.text_answer && ans.text_answer.trim() !== ''));
              const isFlag = ans?.is_flagged;
              const isCurrent = idx === currentIndex;

              let btnBg = 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30';
              if (isAnswered) btnBg = 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20';
              if (isFlag) btnBg = 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20';
              if (isCurrent) btnBg += ' ring-2 ring-white ring-offset-2 ring-offset-[#0b0f19]';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center relative ${btnBg}`}
                >
                  {idx + 1}
                  {isFlag && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/15 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white mb-2">Bạn có chắc chắn muốn nộp bài?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bạn đã trả lời <strong className="text-blue-400">{answeredCount}</strong> / {questions.length} câu hỏi.
                {questions.length - answeredCount > 0 && (
                  <span className="block text-rose-400 mt-1">
                    Còn {questions.length - answeredCount} câu chưa hoàn thành!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors"
              >
                Tiếp Tục Làm Bài
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all"
              >
                {isSubmitting ? 'Đang chấm điểm...' : 'Xác Nhận Nộp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
