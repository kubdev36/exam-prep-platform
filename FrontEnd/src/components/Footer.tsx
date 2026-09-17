import React from 'react';
import Link from 'next/link';
import { Sparkles, GraduationCap, BookOpenCheck, BrainCircuit, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#070a11] text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">OmniExam</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng luyện thi trực tuyến thế hệ mới, hỗ trợ toàn diện các kỳ thi THPT Quốc Gia, ĐGNL HSA (ĐHQGHN) và ĐGTD TSA (ĐHBKHN).
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Các Kỳ Thi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/exams/thpt" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  THPT Quốc Gia 2026
                </Link>
              </li>
              <li>
                <Link href="/exams/hsa" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <BookOpenCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Đánh Giá Năng Lực HSA
                </Link>
              </li>
              <li>
                <Link href="/exams/tsa" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-orange-400" />
                  Đánh Giá Tư Duy TSA
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Tính Năng Lõi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Luyện đề thi thử chuẩn ma trận</Link>
              </li>
              <li>
                <Link href="/wrong-notebook" className="hover:text-white transition-colors">Sổ câu sai thông minh</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Phân tích khoảng cách mục tiêu (Score Gap)</Link>
              </li>
              <li>
                <span className="text-slate-500">AI Trợ giảng giải thích chi tiết (V2)</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Công Nghệ & Chuẩn</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Next.js + Laravel + PostgreSQL</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ chuẩn KaTeX công thức Toán học, Vật lý, Hóa học và cấu trúc trắc nghiệm Đúng/Sai 4 ý thế hệ mới.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© 2026 OmniExam Platform. Bản quyền thuộc về hệ sinh thái Luyện thi thông minh.</div>
          <div className="flex items-center gap-1 text-slate-400">
            Xây dựng với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" /> cho sĩ tử Việt Nam
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
