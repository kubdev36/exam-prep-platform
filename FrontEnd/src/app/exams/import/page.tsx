import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ExamImportStudio from '@/features/exam/components/ExamImportStudio';

export const metadata = {
  title: 'Upload & Chuyển Đổi Đề Thi Tự Động (Word, PDF) – OmniExam',
  description: 'Tải lên file đề thi Word .docx hoặc PDF để hệ thống tự động bóc tách thành đề thi trực tuyến tương tác với công thức KaTeX.',
};

export default function ExamImportPage() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Trang Chủ
      </Link>

      <ExamImportStudio />
    </div>
  );
}
