'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Bookmark, 
  Sparkles,
  ChevronDown,
  Layers,
  BarChart3
} from 'lucide-react';
import { ExamAttempt, Question } from '@/types';
import { ExamApi } from '@/lib/api';
import MathRenderer from '@/components/MathRenderer';

export default function ExamResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const resolvedParams = use(params);
  const attemptId = parseInt(resolvedParams.attemptId, 10);

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'WRONG' | 'CORRECT'>('ALL');

  useEffect(() => {
    async function loadReview() {
      try {
        const data = await ExamApi.reviewAttempt(attemptId || 1);
        if (data) {
          setAttempt(data.attempt);
          setQuestions(data.questions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReview();
  }, [attemptId]);

  if (loading || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const durationMins = Math.round((attempt.duration_seconds || 0) / 60);
  const filteredQuestions = questions.filter((q) => {
    if (filterMode === 'WRONG') return !q.student_answer?.is_correct;
    if (filterMode === 'CORRECT') return q.student_answer?.is_correct;
    return true;
  });

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Score Header Card */}
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden bg-gradient-to-b from-indigo-950/40 via-[#0f172a] to-[#0b0f19]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-[#0b0f19] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
          <Trophy className="w-9 h-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Kết Quả Bài Thi Hoàn Thành!
        </h1>
        <p className="text-xs text-slate-400 mb-6">{attempt.exam?.title || 'Đề Thi Thử'}</p>

        {/* Score Display */}
        <div className="inline-flex items-baseline gap-2 px-8 py-4 rounded-3xl bg-white/[0.04] border border-white/10 shadow-inner mb-8">
          <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            {attempt.score}
          </span>
          <span className="text-lg font-bold text-slate-400">/ {attempt.max_score} điểm</span>
        </div>

        {/* Stats 3 pills */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-emerald-400 font-extrabold text-lg">{attempt.correct_count}</div>
            <div className="text-[11px] text-emerald-300/80">Số câu đúng</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
            <div className="text-rose-400 font-extrabold text-lg">{attempt.wrong_count}</div>
            <div className="text-[11px] text-rose-300/80">Số câu sai</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-center">
            <div className="text-slate-200 font-extrabold text-lg">{durationMins}p</div>
            <div className="text-[11px] text-slate-400">Thời gian làm</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Xem Báo Cáo Năng Lực</span>
          </Link>
          <Link
            href="/wrong-notebook"
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 flex items-center gap-2 transition-all"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Mở Sổ Câu Sai ({attempt.wrong_count} câu)</span>
          </Link>
        </div>
      </div>

      {/* Breakdown by Sections */}
      {attempt.section_scores && Object.keys(attempt.section_scores).length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-extrabold text-white mb-4">Kết Quả Theo Từng Phần Thi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.values(attempt.section_scores).map((sec, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-bold text-slate-200">{sec.name}</div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-extrabold text-blue-400">{sec.earned_score} đ</span>
                  <span className="text-[11px] text-slate-400">Đúng {sec.correct}/{sec.total} câu</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Details Review Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">Lời Giải Chi Tiết Từng Câu</h2>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({questions.length})
            </button>
            <button
              onClick={() => setFilterMode('WRONG')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'WRONG' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Câu sai ({questions.filter((q) => !q.student_answer?.is_correct).length})
            </button>
            <button
              onClick={() => setFilterMode('CORRECT')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterMode === 'CORRECT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Câu đúng ({questions.filter((q) => q.student_answer?.is_correct).length})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const isCorrect = !!q.student_answer?.is_correct;

            return (
              <div
                key={q.id}
                className={`glass-card p-6 sm:p-8 rounded-3xl border transition-all ${
                  isCorrect ? 'border-emerald-500/20' : 'border-rose-500/30 bg-rose-950/5'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-white">Câu {q.order_index || idx + 1}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đúng (+{q.student_answer?.score_awarded ?? q.point_value} đ)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Sai (+{q.student_answer?.score_awarded ?? 0} đ)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="text-base font-medium text-white mb-6 leading-relaxed">
                  <MathRenderer content={q.content} />
                </div>

                {/* Options Review */}
                {q.question_type === 'SINGLE_CHOICE' && (
                  <div className="space-y-2 mb-6">
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isUserSelected = (q.student_answer?.selected_option_ids || []).includes(opt.id);
                      const isOptionCorrect = !!opt.is_correct;

                      let optBorder = 'border-white/10 bg-white/[0.02] text-slate-300';
                      if (isOptionCorrect) {
                        optBorder = 'border-emerald-500 bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500';
                      } else if (isUserSelected && !isOptionCorrect) {
                        optBorder = 'border-rose-500 bg-rose-500/10 text-rose-200 ring-1 ring-rose-500';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${optBorder}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                              {letter}
                            </span>
                            <MathRenderer content={opt.content} />
                          </div>
                          <div>
                            {isOptionCorrect && (
                              <span className="text-[11px] font-bold text-emerald-400">Đáp án đúng</span>
                            )}
                            {isUserSelected && !isOptionCorrect && (
                              <span className="text-[11px] font-bold text-rose-400">Bạn đã chọn</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TRUE_FALSE Review */}
                {q.question_type === 'TRUE_FALSE' && (
                  <div className="space-y-2 mb-6">
                    {q.options.map((opt) => {
                      const subKey = opt.sub_key || 'a';
                      const userChoice = q.student_answer?.sub_answers?.[subKey];
                      const correctChoice = !!opt.is_correct;
                      const isSubMatched = userChoice === correctChoice;

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                            isSubMatched ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                          }`}
                        >
                          <div className="flex items-start gap-2 max-w-xl">
                            <span className="font-bold uppercase text-blue-400">{subKey})</span>
                            <MathRenderer content={opt.content} />
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-[11px]">
                            <span className="text-slate-400">
                              Đáp án: <strong className="text-emerald-400">{correctChoice ? 'ĐÚNG' : 'SAI'}</strong>
                            </span>
                            <span className={isSubMatched ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              (Bạn chọn: {userChoice !== undefined ? (userChoice ? 'Đúng' : 'Sai') : 'Bỏ qua'})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hướng Dẫn Giải Chi Tiết</span>
                    </div>
                    <MathRenderer content={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
