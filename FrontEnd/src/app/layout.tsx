import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'OmniExam – Nền Tảng Luyện Thi THPT Quốc Gia, ĐGNL HSA, ĐGTD TSA',
  description: 'Hệ thống luyện thi trực tuyến thông minh, hỗ trợ đa kỳ thi THPT Quốc Gia, Đánh Giá Năng Lực ĐHQG Hà Nội (HSA) và Đánh Giá Tư Duy ĐH Bách Khoa Hà Nội (TSA).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#090d16] text-[#f1f5f9] min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
