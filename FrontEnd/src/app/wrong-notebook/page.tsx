'use client';

import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

export default function WrongNotebookPage() {
  const [examFilter, setExamFilter] = useState<'ALL' | 'THPT' | 'HSA' | 'TSA'>('ALL');
  const [showSolutions, setShowSolutions] = useState<Record<number, boolean>>({});
  const [masteredMap, setMasteredMap] = useState<Record<number, boolean>>({});

  const sampleWrongQuestions = [
    {
      id: 1,
      exam_code: 'THPT',
      subject_name: 'Toán học',
      topic_name: 'Khảo sát hàm số & Cực trị',
      content: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đạo hàm $f\'(x) = x(x-1)^2(x+2)^3$. Điểm cực tiểu của hàm số đã cho là:',
      wrong_count: 2,
      last_wrong: '2 ngày trước',
      options: [
        { id: 101, content: '$x = 0$', is_correct: true },
        { id: 102, content: '$x = 1$', is_correct: false },
        { id: 103, content: '$x = -2$', is_correct: false },
        { id: 104, content: '$x = 2$', is_correct: false },
      ],
      explanation: 'Ta xét dấu đạo hàm $f\'(x)$:\n\n* $x = 0$ là nghiệm đơn (đổi dấu từ $-$ sang $+$ khi qua 0).\n* $x = 1$ là nghiệm bội chẵn (không đổi dấu).\n* $x = -2$ là nghiệm bội lẻ bậc 3 (đổi dấu từ $+$ sang $-$).\n\nDo đó hàm số đạt cực tiểu tại $x = 0$.',
    },
    {
      id: 2,
      exam_code: 'HSA',
      subject_name: 'Định lượng HSA',
      topic_name: 'Xử lý biểu đồ & Số liệu xác suất',
      content: 'Một lớp học có 40 học sinh, trong đó có 25 em thích môn Toán, 20 em thích môn Văn và 12 em thích cả hai môn Toán và Văn. Chọn ngẫu nhiên một học sinh. Xác suất để chọn được học sinh thích ít nhất một trong hai môn là:',
      wrong_count: 1,
      last_wrong: 'Hôm qua',
      options: [
        { id: 201, content: '$\\frac{33}{40}$', is_correct: true },
        { id: 202, content: '$\\frac{45}{40}$', is_correct: false },
        { id: 203, content: '$\\frac{12}{40}$', is_correct: false },
        { id: 204, content: '$\\frac{28}{40}$', is_correct: false },
      ],
      explanation: 'Số học sinh thích ít nhất một môn: $n(A \\cup B) = 25 + 20 - 12 = 33$. Xác suất cần tìm là $P = 33/40 = 82,5\\%$.',
    },
    {
      id: 3,
      exam_code: 'TSA',
      subject_name: 'Tư duy Toán học TSA',
      topic_name: 'Logic & Tối ưu hóa kỹ thuật',
      content: 'Một bể chứa hình trụ không có nắp được làm từ tấm kim loại mỏng có diện tích bề mặt $S = 27\\pi \\text{ m}^2$. Để thể tích chứa của bể là lớn nhất thì bán kính đáy $R$ bằng bao nhiêu?',
      wrong_count: 3,
      last_wrong: '3 ngày trước',
      options: [
        { id: 301, content: '$R = 3\\text{ m}$', is_correct: true },
        { id: 302, content: '$R = 4\\text{ m}$', is_correct: false },
        { id: 303, content: '$R = 2\\sqrt{3}\\text{ m}$', is_correct: false },
        { id: 304, content: '$R = 9\\text{ m}$', is_correct: false },
      ],
      explanation: 'Diện tích bể trụ không nắp $S = \\pi R^2 + 2\\pi R h = 27\\pi \\Rightarrow h = \\frac{27-R^2}{2R}$. Thể tích $V(R) = \\frac{\\pi}{2}(27R - R^3)$. Đạo hàm $V\'(R) = 0 \\Rightarrow R = 3\\text{ m}$.',
    },
  ];

  const filtered = sampleWrongQuestions.filter((q) => {
    if (examFilter !== 'ALL' && q.exam_code !== examFilter) return false;
    return true;
  });

  const toggleSolution = (id: number) => {
    setShowSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: number) => {
    setMasteredMap((prev) => ({ ...prev, [id]: !prev[id] }));
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
            Tự động tổng hợp và lưu trữ các câu hỏi bạn từng làm sai từ các bài thi thử.
          </p>
        </div>

        <Link
          href="/exam-room/1"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Luyện Lại 10 Câu Sai</span>
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
          Tất Cả ({sampleWrongQuestions.length})
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

      {/* Wrong Questions List */}
      <div className="space-y-6">
        {filtered.map((item) => {
          const isMastered = !!masteredMap[item.id];
          const isExpanded = !!showSolutions[item.id];

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
                    {item.exam_code}
                  </span>
                  <span className="text-xs font-bold text-white">{item.subject_name}</span>
                  <span className="text-xs text-slate-400">• {item.topic_name}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                  <span>Làm sai {item.wrong_count} lần</span>
                  <span>({item.last_wrong})</span>
                </div>
              </div>

              {/* Question Content */}
              <div className="text-base font-medium text-white mb-6 leading-relaxed">
                <MathRenderer content={item.content} />
              </div>

              {/* Options */}
              <div className="space-y-2 mb-6">
                {item.options.map((opt, idx) => {
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
                        <MathRenderer content={opt.content} />
                      </div>
                      {opt.is_correct && isExpanded && (
                        <span className="text-[11px] font-bold text-emerald-400">Đáp án chính xác</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Solution Expansion */}
              {isExpanded && (
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed mb-6 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Phương Pháp Giải & Khắc Phục Lỗi Sai</span>
                  </div>
                  <MathRenderer content={item.explanation} />
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => toggleSolution(item.id)}
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
                  onClick={() => toggleMastered(item.id)}
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
    </div>
  );
}
