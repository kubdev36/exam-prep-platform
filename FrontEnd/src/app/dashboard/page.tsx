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
import { ExamApi } from '@/lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
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

  if (loading || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Đang tải dữ liệu hồ sơ học sinh...</p>
        </div>
      </div>
    );
  }

  const thptStat = summary.exam_stats?.THPT;
  const hsaStat = summary.exam_stats?.HSA;
  const tsaStat = summary.exam_stats?.TSA;

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
            Xin chào, {summary.user?.name || 'Học Sinh'} 👋
          </h1>
          <p className="text-xs text-slate-400">
            Theo dõi năng lực thực chiến trên cả 3 kỳ thi THPT, HSA và TSA trực tiếp từ hệ thống.
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
            <p className="text-xs text-slate-400">So sánh điểm trung bình thực tế từ bài thi so với mục tiêu đề ra</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* THPT Card */}
          <div className="glass-card p-6 rounded-3xl border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
                <GraduationCap className="w-4 h-4" />
                <span>THPT Quốc Gia</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Mục tiêu: {typeof thptStat?.target_score === 'object' ? (thptStat.target_score as any)?.math || 9.0 : thptStat?.target_score || 9.0} đ
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">
                {thptStat?.current_score !== null && thptStat?.current_score !== undefined ? thptStat.current_score : '--'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 10.0 đ</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Số lượt thi đã hoàn thành</span>
                <span className="text-white font-bold">{thptStat?.attempts_count || 0} bài</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, ((thptStat?.current_score || 0) / 10) * 100)}%` }} 
                />
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
              <span className="text-xs text-slate-400 font-semibold">
                Mục tiêu: {typeof hsaStat?.target_score === 'number' ? hsaStat.target_score : 115} đ
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">
                {hsaStat?.current_score !== null && hsaStat?.current_score !== undefined ? hsaStat.current_score : '--'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 150.0 đ</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Số lượt thi đã hoàn thành</span>
                <span className="text-white font-bold">{hsaStat?.attempts_count || 0} bài</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, ((hsaStat?.current_score || 0) / 150) * 100)}%` }} 
                />
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
              <span className="text-xs text-slate-400 font-semibold">
                Mục tiêu: {typeof tsaStat?.target_score === 'number' ? tsaStat.target_score : 78} đ
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">
                {tsaStat?.current_score !== null && tsaStat?.current_score !== undefined ? tsaStat.current_score : '--'}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100.0 đ</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Số lượt thi đã hoàn thành</span>
                <span className="text-white font-bold">{tsaStat?.attempts_count || 0} bài</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, ((tsaStat?.current_score || 0) / 100) * 100)}%` }} 
                />
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
              <p className="text-xs text-slate-400">Dựa trên tỷ lệ trả lời sai trong các bài thi thử thực tế</p>
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

        {summary.weak_topics && summary.weak_topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summary.weak_topics.map((item) => (
              <div
                key={item.topic_id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
              >
                <div className="space-y-1 mb-4">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ backgroundColor: `${item.subject_color || '#3b82f6'}20`, color: item.subject_color || '#3b82f6' }}
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
                  href="/exams/thpt"
                  className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 text-center transition-colors"
                >
                  Luyện Lại Dạng Này
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Tuyệt vời! Hiện chưa ghi nhận chủ đề yếu nào.</p>
            <p className="text-[11px] text-slate-500 mt-1">Hãy tham gia làm đề thi thử để hệ thống tự động nhận diện lỗ hổng kiến thức.</p>
          </div>
        )}
      </div>

      {/* Recent Exam Attempts Table */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
        <h3 className="text-lg font-bold text-white mb-6">Lịch Sử Thi Gần Đây</h3>

        {summary.recent_attempts && summary.recent_attempts.length > 0 ? (
          <div className="space-y-3">
            {summary.recent_attempts.map((att) => (
              <div
                key={att.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-white">{att.exam?.title || `Bài thi #${att.exam_id}`}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold">Đúng {att.correct_count} câu</span>
                    <span>•</span>
                    <span className="text-rose-400 font-semibold">Sai {att.wrong_count} câu</span>
                    <span>•</span>
                    <span>{Math.round((att.duration_seconds || 0) / 60)} phút</span>
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
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Chưa có lịch sử làm bài thi nào.</p>
            <Link
              href="/"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/20"
            >
              Chọn đề thi và bắt đầu ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
