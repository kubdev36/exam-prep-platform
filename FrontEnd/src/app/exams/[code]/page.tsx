'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpenCheck, 
  BrainCircuit, 
  ArrowLeft, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Play, 
  Clock, 
  BarChart, 
  Bookmark, 
  Sparkles,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Exam, ExamType, Subject } from '@/types';
import { ExamApi } from '@/lib/api';

export default function ExamPortalPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const examCode = resolvedParams.code.toUpperCase();
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'MOCKS' | 'TOPICS'>('SECTIONS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortal() {
      try {
        const [typeDetail, examsRes] = await Promise.all([
          ExamApi.getExamTypeDetail(examCode),
          ExamApi.getExams({ exam_type: examCode }),
        ]);
        if (typeDetail) setExamType(typeDetail);
        if (examsRes && examsRes.data) setExams(examsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPortal();
  }, [examCode]);

  // Specific taxonomy layouts per exam type
  const isTHPT = examCode === 'THPT';
  const isHSA = examCode === 'HSA';
  const isTSA = examCode === 'TSA';

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Trang Chủ
      </Link>

      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden mb-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4">
            {isTHPT && <GraduationCap className="w-3.5 h-3.5" />}
            {isHSA && <BookOpenCheck className="w-3.5 h-3.5" />}
            {isTSA && <BrainCircuit className="w-3.5 h-3.5" />}
            <span>{examType?.badge || (isTHPT ? 'Bộ GD&ĐT' : isHSA ? 'ĐHQG Hà Nội' : 'ĐH Bách Khoa')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {examType?.name || `Kỳ Thi ${examCode}`}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {examType?.description || `Không gian luyện thi và bộ đề thi thử bám sát cấu trúc ${examCode}.`}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Thời gian chuẩn: {examType?.default_duration_minutes || (isTHPT ? 90 : isHSA ? 195 : 150)} phút</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-emerald-400" />
              <span>Thang điểm: {examType?.max_score || (isTHPT ? 10 : isHSA ? 150 : 100)} điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SECTIONS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isTHPT ? 'Luyện Theo Môn Học' : 'Luyện Theo Phần Thi'}
        </button>
        <button
          onClick={() => setActiveTab('MOCKS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MOCKS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Đề Thi Thử Chuẩn Ma Trận
        </button>
        <button
          onClick={() => setActiveTab('TOPICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TOPICS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Cây Chủ Đề & Dạng Câu
        </button>
      </div>

      {/* TAB 1: SECTIONS / SUBJECTS */}
      {activeTab === 'SECTIONS' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {isTHPT && (
              <>
                {/* Môn Toán (46 Đề thi từ Loigiaihay) */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-white">Toán Học</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400">
                      46 Đề Thi Mới
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Bao gồm các đề thi thử các sở, trường chuyên và bộ đề chuẩn ma trận tốt nghiệp THPT 2026/2025.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Đại số, Hình học & Thống kê</span>
                      <span className="text-blue-400 font-bold">46 đề chuẩn hóa</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('MOCKS')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Xem 46 Đề Môn Toán
                  </button>
                </div>

                {/* Môn Vật lý */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-white">Vật Lý</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">
                      GDPT Mới
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Dao động cơ, sóng cơ, dòng điện xoay chiều và vật lý hạt nhân ứng dụng.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Vật lý nhiệt & Khí lý tưởng</span>
                      <span className="text-purple-400 font-bold">60% nắm vững</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/1"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Đề Môn Lý
                  </Link>
                </div>

                {/* Môn Hóa học */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-pink-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-white">Hóa Học</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-400">
                      GDPT Mới
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Hóa học hữu cơ, este-lipit, điện phân và hợp chất polime nhiệt rắn.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Pin điện & Điện phân</span>
                      <span className="text-pink-400 font-bold">75% nắm vững</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/1"
                    className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Đề Môn Hóa
                  </Link>
                </div>

                {/* Môn Tiếng Anh (Mới bổ sung 16 Đề thi từ Loigiaihay) */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-white">Tiếng Anh</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                      16 Đề Thi Mới
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Đề thi tốt nghiệp THPT 2026, 2025 & Đề tham khảo chuẩn Bộ GD&ĐT có đáp án và giải chi tiết.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Đọc hiểu, sắp xếp câu & ngữ pháp</span>
                      <span className="text-emerald-400 font-bold">16 đề chuẩn hóa</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('MOCKS')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Xem 16 Đề Tiếng Anh
                  </button>
                </div>
              </>
            )}

            {isHSA && (
              <>
                {/* Phần 1 HSA: Định lượng */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">Phần 1: Tư Duy Định Lượng</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400">
                      50 Câu / 50đ
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Toán học, thống kê, phân tích biểu đồ tài chính và giải bài toán thực tế.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Xử lý biểu đồ số liệu</span>
                      <span className="text-blue-400 font-bold">82%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/2"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Phần Định Lượng
                  </Link>
                </div>

                {/* Phần 2 HSA: Định tính */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">Phần 2: Tư Duy Định Tính</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                      50 Câu / 50đ
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Ngôn ngữ, đọc hiểu văn bản văn học, tư duy ngữ nghĩa và lập luận logic.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Đọc hiểu ngữ liệu văn bản</span>
                      <span className="text-emerald-400 font-bold">71%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '71%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/2"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Phần Định Tính
                  </Link>
                </div>

                {/* Phần 3 HSA: Khoa học */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-amber-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">Phần 3: Khoa Học Tổng Hợp</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">
                      50 Câu / 50đ
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Khoa học tự nhiên (Lý, Hóa, Sinh) và Khoa học xã hội (Sử, Địa).
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Khoa học tự nhiên</span>
                      <span className="text-amber-400 font-bold">65%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/2"
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Phần Khoa Học
                  </Link>
                </div>
              </>
            )}

            {isTSA && (
              <>
                {/* Phần 1 TSA: Tư duy Toán học */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">Tư Duy Toán Học</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">
                      40 Điểm / 60p
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Đại số, hình học, xác suất thống kê, logic mô hình hóa và tối ưu kỹ thuật.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Mô hình hóa & Tối ưu</span>
                      <span className="text-purple-400 font-bold">78%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/3"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Tư Duy Toán
                  </Link>
                </div>

                {/* Phần 2 TSA: Tư duy Đọc hiểu */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">Tư Duy Đọc Hiểu</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400">
                      20 Điểm / 30p
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Đọc hiểu văn bản khoa học kỹ thuật, y tế sinh học, kinh tế và môi trường.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Phân tích văn bản kỹ thuật</span>
                      <span className="text-cyan-400 font-bold">69%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: '69%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/3"
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Tư Duy Đọc Hiểu
                  </Link>
                </div>

                {/* Phần 3 TSA: Tư duy Khoa học */}
                <div className="glass-card glass-card-hover p-6 rounded-2xl border border-orange-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">Tư Duy Khoa Học / GQVD</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400">
                      40 Điểm / 60p
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Phân tích dữ liệu thực nghiệm, thiết kế thí nghiệm và suy luận khoa học.
                  </p>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Dữ liệu thực nghiệm & Thí nghiệm</span>
                      <span className="text-orange-400 font-bold">64%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full" style={{ width: '64%' }} />
                    </div>
                  </div>
                  <Link
                    href="/exam-room/3"
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Luyện Tư Duy Khoa Học
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MOCKS */}
      {activeTab === 'MOCKS' && (
        <div className="space-y-4 mb-12">
          {exams.map((item) => (
            <div
              key={item.id}
              className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400">Thời gian: {item.duration_minutes} phút</span>
                  <span className="text-xs text-slate-400">• {item.total_questions} câu</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>

              <Link
                href={`/exam-room/${item.id}`}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 shrink-0"
              >
                <span>Bắt Đầu Làm Bài</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: TOPICS */}
      {activeTab === 'TOPICS' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Cây Chủ Đề Kiến Thức</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white">1. Khảo sát hàm số và ứng dụng đạo hàm</div>
                <div className="text-xs text-slate-400">Cực trị, đơn điệu, GTLN/GTNN, tiệm cận đồ thị</div>
              </div>
              <Link
                href="/exam-room/1"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
              >
                Luyện 25 câu
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white">2. Nguyên hàm, Tích phân và Ứng dụng</div>
                <div className="text-xs text-slate-400">Tích phân từng phần, diện tích hình phẳng, thể tích tròn xoay</div>
              </div>
              <Link
                href="/exam-room/1"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
              >
                Luyện 20 câu
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white">3. Xác suất & Thống kê số liệu</div>
                <div className="text-xs text-slate-400">Biến cố độc lập, xác suất có điều kiện, bảng số liệu</div>
              </div>
              <Link
                href="/exam-room/1"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
              >
                Luyện 15 câu
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
