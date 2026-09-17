'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bookmark, 
  CheckCircle2, 
  RotateCcw, 
  Filter, 
  Sparkles, 
  ArrowLeft,
  GraduationCap,
  BookOpenCheck,
  BrainCircuit,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { ExamApi } from '@/lib/api';
import MathRenderer from '@/components/MathRenderer';

export default function WrongNotebookPage() {
  const [examFilter, setExamFilter] = useState<'ALL' | 'THPT' | 'HSA' | 'TSA'>('ALL');
  const [showSolutions, setShowSolutions] = useState<Record<number, boolean>>({});
  const [masteredMap, setMasteredMap] = useState<Record<number, boolean>>({});
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWrongQuestions = async () => {
    setLoading(true);
    try {
      const res = await ExamApi.getWrongQuestions({
        exam_code: examFilter === 'ALL' ? undefined : examFilter,
      });
      if (res && res.data) {
        setWrongQuestions(res.data);
        const map: Record<number, boolean> = {};
        res.data.forEach((item: any) => {
          map[item.question_id || item.id] = !!item.is_mastered;
        });
        setMasteredMap(map);
      } else {
        setWrongQuestions([]);
      }
    } catch (err) {
      console.error(err);
      setWrongQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWrongQuestions();
  }, [examFilter]);

  const toggleSolution = (id: number) => {
    setShowSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleMastered = async (questionId: number) => {
    try {
      const res = await ExamApi.toggleWrongQuestionMastered(questionId);
      setMasteredMap((prev) => ({ ...prev, [questionId]: res.is_mastered }));
    } catch (err) {
      console.error(err);
      setMasteredMap((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    }
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-rose-400" />
            Sổ Tay Câu Sai Thông Minh
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tự động tổng hợp và lưu trữ các câu hỏi bạn từng làm sai từ các bài thi thử trong hệ thống.
          </p>
        </div>

        <Link
          href="/exams/thpt"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Luyện Thi Ngay</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 w-fit">
        <button
          onClick={() => setExamFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            examFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Tất Cả ({wrongQuestions.length})
        </button>
        <button
          onClick={() => setExamFilter('THPT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            examFilter === 'THPT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          THPT Quốc Gia
        </button>
        <button
          onClick={() => setExamFilter('HSA')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            examFilter === 'HSA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpenCheck className="w-3.5 h-3.5" />
          ĐGNL HSA
        </button>
        <button
          onClick={() => setExamFilter('TSA')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            examFilter === 'TSA' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          ĐGTD TSA
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Đang tải danh sách câu sai...</p>
        </div>
      ) : wrongQuestions.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Sổ câu sai trống!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bạn chưa có câu hỏi nào bị làm sai trong danh mục này hoặc đã thành thạo tất cả các câu. Hãy tiếp tục duy trì phong độ!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20"
          >
            Luyện Đề Thi Mới
          </Link>
        </div>
      ) : (
        /* Wrong Questions List */
        <div className="space-y-6">
          {wrongQuestions.map((item) => {
            const q = item.question || item;
            const qId = item.question_id || item.id;
            const isMastered = !!masteredMap[qId];
            const isExpanded = !!showSolutions[qId];
            const examCode = item.exam_type?.code || item.exam_code || 'THPT';
            const subjectName = q.subject?.name || item.subject_name || 'Môn học';
            const topicName = q.topic?.name || item.topic_name || 'Chủ đề kiến thức';

            return (
              <div
                key={item.id}
                className={`glass-card p-6 sm:p-8 rounded-3xl border transition-all ${
                  isMastered ? 'opacity-60 border-white/5' : 'border-rose-500/20 bg-rose-950/5'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10 mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {examCode}
                    </span>
                    <span className="text-xs font-bold text-white">{subjectName}</span>
                    <span className="text-xs text-slate-400">• {topicName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                    <span>Làm sai {item.wrong_count || 1} lần</span>
                    {item.last_answered_at && (
                      <span className="text-slate-400">({new Date(item.last_answered_at).toLocaleDateString('vi-VN')})</span>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="text-base font-medium text-white mb-6 leading-relaxed">
                  <MathRenderer content={q.content || ''} />
                </div>

                {/* Options */}
                {q.options && q.options.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {q.options.map((opt: any, idx: number) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                            opt.is_correct && isExpanded
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/5 bg-white/[0.02] text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                              {letter}
                            </span>
                            <MathRenderer content={opt.content || ''} />
                          </div>
                          {opt.is_correct && isExpanded && (
                            <span className="text-[11px] font-bold text-emerald-400">Đáp án chính xác</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Solution Expansion */}
                {isExpanded && q.explanation && (
                  <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed mb-6 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Phương Pháp Giải & Khắc Phục Lỗi Sai</span>
                    </div>
                    <MathRenderer content={q.explanation} />
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => toggleSolution(qId)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ẩn Lời Giải</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Lời Giải Chi Tiết</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleMastered(qId)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isMastered
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isMastered ? 'Đã Thành Thạo' : 'Đánh Dấu Đã Nắm Vững'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
