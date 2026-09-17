'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpenCheck, 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Target, 
  CheckCircle2, 
  Clock, 
  Users, 
  Trophy, 
  Flame,
  ChevronRight,
  Calculator,
  Compass,
  FileCheck,
  Bookmark,
  FileUp,
  Wand2
} from 'lucide-react';
import { Exam, ExamType } from '@/types';
import { ExamApi, MOCK_EXAM_TYPES } from '@/lib/api';

export default function HomePage() {
  const [examTypes, setExamTypes] = useState<ExamType[]>(MOCK_EXAM_TYPES);
  const [featuredExams, setFeaturedExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [types, examsRes] = await Promise.all([
          ExamApi.getExamTypes(),
          ExamApi.getExams(),
        ]);
        if (types && types.length > 0) setExamTypes(types);
        if (examsRes && examsRes.data) setFeaturedExams(examsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const examMetaConfig = {
    THPT: {
      gradient: 'from-blue-600/20 via-indigo-600/20 to-purple-600/20',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      button: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',
      icon: GraduationCap,
      accent: 'text-blue-400',
      tag: 'Thi Tốt Nghiệp',
      features: ['Toán, Lý, Hóa, Sinh, Sử, Địa, Anh', 'Luyện theo chương & dạng câu', 'Đề thi chính thức qua các năm'],
    },
    HSA: {
      gradient: 'from-emerald-600/20 via-teal-600/20 to-cyan-600/20',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25',
      icon: BookOpenCheck,
      accent: 'text-emerald-400',
      tag: 'ĐGNL ĐHQG Hà Nội',
      features: ['Định lượng (Toán học & Số liệu)', 'Định tính (Ngôn ngữ - Văn học)', 'Khoa học (Tự nhiên & Xã hội)'],
    },
    TSA: {
      gradient: 'from-amber-600/20 via-orange-600/20 to-rose-600/20',
      border: 'border-orange-500/30 hover:border-orange-500/60',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      button: 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/25',
      icon: BrainCircuit,
      accent: 'text-orange-400',
      tag: 'ĐGTD ĐH Bách Khoa',
      features: ['Tư duy Toán học', 'Tư duy Đọc hiểu', 'Tư duy Khoa học / Giải quyết vấn đề'],
    },
  };

  return (
    <div className="relative min-h-screen">
      {/* Background glow accents */}
      <div className="bg-glow-thpt top-10 left-1/4 -translate-x-1/2" />
      <div className="bg-glow-hsa top-40 right-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glowing Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-slate-300 mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Hệ Thống Luyện Thi Đa Kỳ Thi Thế Hệ Mới</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Chinh phục kỳ thi <br className="hidden sm:inline" />
          <span className="gradient-text">THPT Quốc Gia • HSA • TSA</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
          Nền tảng luyện thi chuẩn hóa toàn diện. Không chỉ thi theo môn truyền thống, 
          hệ thống hỗ trợ cấu trúc đánh giá năng lực & tư duy chuyên sâu với chấm điểm động, 
          KaTeX công thức toán và phân tích độ lệch mục tiêu.
        </p>

        {/* Quick Launch Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-16">
          <Link
            href="/exam-room/1"
            className="glass-card glass-card-hover p-4 rounded-2xl flex items-center gap-3 border border-blue-500/20 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">10 Câu Toán THPT</div>
              <div className="text-[11px] text-slate-400">Luyện nhanh 15p</div>
            </div>
          </Link>

          <Link
            href="/exam-room/2"
            className="glass-card glass-card-hover p-4 rounded-2xl flex items-center gap-3 border border-emerald-500/20 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">10 Câu HSA Số Liệu</div>
              <div className="text-[11px] text-slate-400">Tư duy định lượng</div>
            </div>
          </Link>

          <Link
            href="/exam-room/3"
            className="glass-card glass-card-hover p-4 rounded-2xl flex items-center gap-3 border border-orange-500/20 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">10 Câu TSA Logic</div>
              <div className="text-[11px] text-slate-400">Tối ưu & Suy luận</div>
            </div>
          </Link>

          <Link
            href="/wrong-notebook"
            className="glass-card glass-card-hover p-4 rounded-2xl flex items-center gap-3 border border-rose-500/20 text-left group"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Sổ Câu Sai</div>
              <div className="text-[11px] text-slate-400">12 câu cần ôn</div>
            </div>
          </Link>
        </div>

        {/* Feature Banner: Smart Exam Importer */}
        <div className="max-w-4xl mx-auto mb-16">
          <Link
            href="/exams/import"
            className="glass-card p-6 sm:p-7 rounded-3xl border border-indigo-500/30 hover:border-indigo-500/70 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-xl hover:shadow-indigo-500/10 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 group-hover:bg-indigo-500/30 transition-all shrink-0">
                <FileUp className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" /> TÍNH NĂNG MỚI
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">Hỗ trợ Word (.docx) & PDF</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                  Tự động chuyển file Word/PDF thành Đề thi trực tuyến
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Tải file đề thi hoặc dán nội dung văn bản. Hệ thống tự nhận diện câu hỏi trắc nghiệm, đúng/sai, điền khuyết, công thức KaTeX và bảng đáp án chỉ trong vài giây!
                </p>
              </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <span className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
                <span>Trải Nghiệm Upload Ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3 Pillar Exams Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Chọn Kỳ Thi Mục Tiêu</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Bạn muốn luyện thi kỳ thi nào?
            </h2>
          </div>
          <div className="text-xs text-slate-400">
            Mỗi kỳ thi được thiết kế với giao diện, cấu trúc và ma trận phân tích riêng biệt.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {examTypes.map((exam) => {
            const config = examMetaConfig[exam.code as keyof typeof examMetaConfig] || examMetaConfig.THPT;
            const Icon = config.icon;

            return (
              <div
                key={exam.id}
                className={`glass-card p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${config.border} hover:shadow-2xl relative overflow-hidden group`}
              >
                {/* Background soft tint */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-40 pointer-events-none`} />

                <div className="relative z-10">
                  {/* Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${config.badge}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.badge}`}>
                      {exam.badge || config.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-slate-100">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {exam.description}
                  </p>

                  {/* Features list */}
                  <div className="space-y-2.5 mb-8">
                    {config.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 ${config.accent} shrink-0`} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & CTA */}
                <div className="relative z-10 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2 mb-5 text-center">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] text-slate-400">Thời gian chuẩn</div>
                      <div className="text-sm font-bold text-white">{exam.default_duration_minutes} phút</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] text-slate-400">Thang điểm tối đa</div>
                      <div className="text-sm font-bold text-white">{exam.max_score} điểm</div>
                    </div>
                  </div>

                  <Link
                    href={`/exams/${exam.code.toLowerCase()}`}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-all ${config.button}`}
                  >
                    <span>Vào Không Gian Luyện {exam.code}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target & Score Gap Tracker Preview */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0f172a]/60 to-purple-950/40">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mb-2 border border-indigo-500/20">
                <Target className="w-3.5 h-3.5" />
                Mục Tiêu Học Tập Của Bạn
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Tiến độ & Khoảng cách điểm số (Score Gap)
              </h3>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition-colors flex items-center gap-1.5"
            >
              Xem Chi Tiết Thống Kê
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* THPT Score */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">THPT Quốc Gia (Toán)</span>
                <span className="text-xs text-slate-400">Mục tiêu: 9.2+</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">8.25</span>
                <span className="text-xs text-rose-400 font-semibold">(Còn thiếu 0.95 đ)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '89%' }} />
              </div>
              <div className="text-[11px] text-slate-400">Cần cải thiện: <i>Cực trị chứa giá trị tuyệt đối</i></div>
            </div>

            {/* HSA Score */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">ĐGNL HSA ĐHQGHN</span>
                <span className="text-xs text-slate-400">Mục tiêu: 115 đ</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">102.5</span>
                <span className="text-xs text-rose-400 font-semibold">(Còn thiếu 12.5 đ)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '89%' }} />
              </div>
              <div className="text-[11px] text-slate-400">Cần cải thiện: <i>Đọc hiểu khoa học & Biểu đồ</i></div>
            </div>

            {/* TSA Score */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400">ĐGTD TSA ĐHBKHN</span>
                <span className="text-xs text-slate-400">Mục tiêu: 78 đ</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">71.0</span>
                <span className="text-xs text-rose-400 font-semibold">(Còn thiếu 7.0 đ)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '91%' }} />
              </div>
              <div className="text-[11px] text-slate-400">Cần cải thiện: <i>Logic tư duy toán học tối ưu</i></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mock Exams List */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Đề Thi Chuẩn Ma Trận</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Đề thi thử mới nhất 2026
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredExams.map((exam) => (
            <div
              key={exam.id}
              className="glass-card p-6 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {exam.type === 'MOCK_TEST' ? 'Thi Thử Chuẩn' : 'Đề Chính Thức'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{exam.attempts_count} lượt thi</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white mb-2 line-clamp-2">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-6">
                  {exam.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.duration_minutes}p</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.total_questions} câu</span>
                  </div>
                </div>

                <Link
                  href={`/exam-room/${exam.id}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  Vào Thi
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
