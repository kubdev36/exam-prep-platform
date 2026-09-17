'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  BookOpenCheck, 
  BrainCircuit, 
  Flame, 
  Sparkles, 
  Target, 
  Bookmark, 
  BarChart3, 
  ChevronDown,
  Layers,
  Award
} from 'lucide-react';
import { ExamTypeCode } from '@/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [activeExam, setActiveExam] = useState<ExamTypeCode>('THPT');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const examOptions: Array<{ code: ExamTypeCode; name: string; icon: any; color: string; desc: string }> = [
    {
      code: 'THPT',
      name: 'THPT Quốc Gia',
      icon: GraduationCap,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      desc: 'Bộ GD&ĐT (Toán, Lý, Hóa, Sinh, Anh...)',
    },
    {
      code: 'HSA',
      name: 'Đánh Giá Năng Lực HSA',
      icon: BookOpenCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      desc: 'ĐHQG Hà Nội (Định lượng, Định tính, Khoa học)',
    },
    {
      code: 'TSA',
      name: 'Đánh Giá Tư Duy TSA',
      icon: BrainCircuit,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      desc: 'ĐH Bách Khoa HN (Toán, Đọc hiểu, Khoa học)',
    },
  ];

  const currentOption = examOptions.find((e) => e.code === activeExam) || examOptions[0];
  const IconComp = currentOption.icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo & Multi-Exam Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                OmniExam
              </div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-blue-400">
                Luyện Thi Đa Kỳ Thi
              </div>
            </div>
          </Link>

          {/* Exam Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${currentOption.color} hover:brightness-125`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{currentOption.name}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 p-1.5 rounded-xl bg-[#111827] border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-2xl z-50">
                <div className="text-[11px] font-medium text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Chọn Kỳ Thi Mục Tiêu
                </div>
                {examOptions.map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = item.code === activeExam;
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        setActiveExam(item.code);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                        isSelected ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${item.color} mt-0.5`}>
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          {item.name}
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              pathname === '/' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Trang Chủ
          </Link>
          <Link
            href={`/exams/${activeExam.toLowerCase()}`}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith('/exams') ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Luyện {activeExam}
          </Link>
          <Link
            href="/wrong-notebook"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              pathname === '/wrong-notebook' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            Sổ Câu Sai
          </Link>
          <Link
            href="/dashboard"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            Thống Kê
          </Link>
        </nav>

        {/* Right: Gamification & Profile */}
        <div className="flex items-center gap-3">
          {/* Streak pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>7 ngày</span>
          </div>

          {/* XP pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>1,450 XP</span>
          </div>

          {/* User profile avatar */}
          <Link href="/dashboard" className="flex items-center gap-2 pl-2 border-l border-white/10 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] shadow-md shadow-blue-500/20">
              <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-xs font-bold text-blue-300">
                AN
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
