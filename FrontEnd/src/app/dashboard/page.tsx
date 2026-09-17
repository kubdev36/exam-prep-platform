'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Target, 
  Flame, 
  Award, 
  Bookmark, 
  TrendingUp, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  GraduationCap,
  BookOpenCheck,
  BrainCircuit
} from 'lucide-react';
import { DashboardSummary } from '@/types';
import { ExamApi, MOCK_DASHBOARD } from '@/lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(MOCK_DASHBOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await ExamApi.getDashboardSummary();
        if (data) setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Student Welcome Header */}
      <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            Hồ Sơ Học Sinh
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            Xin chào, {summary.user.name} 👋
          </h1>
          <p className="text-xs text-slate-400">
            Theo dõi năng lực thực chiến trên cả 3 kỳ thi THPT, HSA và TSA.
          </p>
        </div>

        {/* Gamification Pills */}
        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">7 Ngày Liên Tục</div>
              <div className="text-[11px] text-slate-400">Streak học tập</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">1,450 XP</div>
              <div className="text-[11px] text-slate-400">Điểm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Exam Competency & Score Gap */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">Bảng Năng Lực & Khoảng Cách Mục Tiêu</h2>
            <p className="text-xs text-slate-400">So sánh điểm trung bình hiện tại so với mục tiêu đề ra</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* THPT Card */}
          <div className="glass-card p-6 rounded-3xl border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
                <GraduationCap className="w-4 h-4" />
                <span>THPT Quốc Gia (Toán)</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Mục tiêu: 9.2+</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">8.25</span>
              <span className="text-xs text-rose-400 font-bold">(Còn thiếu 0.95 đ)</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tiến độ mục tiêu</span>
                <span>89.6%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '89.6%' }} />
              </div>
            </div>

            <Link
              href="/exams/thpt"
              className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-xs font-bold text-blue-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              Luyện THPT Ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* HSA Card */}
          <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <BookOpenCheck className="w-4 h-4" />
                <span>ĐGNL HSA ĐHQGHN</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Mục tiêu: 115 đ</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">102.5</span>
              <span className="text-xs text-rose-400 font-bold">(Còn thiếu 12.5 đ)</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tiến độ mục tiêu</span>
                <span>89.1%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '89.1%' }} />
              </div>
            </div>

            <Link
              href="/exams/hsa"
              className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-xs font-bold text-emerald-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              Luyện HSA Ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* TSA Card */}
          <div className="glass-card p-6 rounded-3xl border border-orange-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-orange-400">
                <BrainCircuit className="w-4 h-4" />
                <span>ĐGTD TSA ĐHBKHN</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Mục tiêu: 78 đ</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">71.0</span>
              <span className="text-xs text-rose-400 font-bold">(Còn thiếu 7.0 đ)</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tiến độ mục tiêu</span>
                <span>91.0%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '91%' }} />
              </div>
            </div>

            <Link
              href="/exams/tsa"
              className="w-full py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600 text-xs font-bold text-orange-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              Luyện TSA Ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Weak Topics Recommendation Grid */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Chủ Đề Cần Ưu Tiên Cải Thiện</h3>
              <p className="text-xs text-slate-400">Dựa trên tỷ lệ trả lời sai trong các bài thi thử gần nhất</p>
            </div>
          </div>
          <Link
            href="/wrong-notebook"
            className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
          >
            Mở Sổ Câu Sai ({summary.wrong_count} câu)
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summary.weak_topics.map((item) => (
            <div
              key={item.topic_id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
            >
              <div className="space-y-1 mb-4">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{ backgroundColor: `${item.subject_color}20`, color: item.subject_color }}
                >
                  {item.subject_name}
                </span>
                <h4 className="font-bold text-xs text-white line-clamp-2 mt-2">
                  {item.topic_name}
                </h4>
                <div className="text-[11px] text-rose-400 font-semibold">
                  {item.wrong_count} lần làm sai
                </div>
              </div>

              <Link
                href="/exam-room/1"
                className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 text-center transition-colors"
              >
                Luyện Lại Dạng Này
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Exam Attempts Table */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
        <h3 className="text-lg font-bold text-white mb-6">Lịch Sử Thi Gần Đây</h3>

        <div className="space-y-3">
          {summary.recent_attempts.map((att) => (
            <div
              key={att.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-white">{att.exam?.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold">Đúng {att.correct_count} câu</span>
                  <span>•</span>
                  <span className="text-rose-400 font-semibold">Sai {att.wrong_count} câu</span>
                  <span>•</span>
                  <span>{Math.round(att.duration_seconds / 60)} phút</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xl font-black text-blue-400">{att.score} đ</div>
                  <div className="text-[10px] text-slate-400">/ {att.max_score} đ</div>
                </div>

                <Link
                  href={`/exam-results/${att.id}`}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                >
                  Xem Lại
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
