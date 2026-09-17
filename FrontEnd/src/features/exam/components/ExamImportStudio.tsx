'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Clock, 
  Award, 
  BookOpen, 
  Layers, 
  AlertCircle,
  ArrowRight,
  Eye,
  FileCode,
  Check,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import MathRenderer from '@/components/MathRenderer';
import { ExamType, ExamTypeCode } from '@/types';

interface ParsedQuestion {
  order_index: number;
  question_type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  difficulty_level: number;
  content: string;
  explanation?: string;
  point_value?: number;
  options: Array<{
    id?: number;
    sub_key?: string;
    content: string;
    is_correct: boolean;
  }>;
}

const SAMPLE_EXAM_TEXT = `ĐỀ THI THỬ THPT QUỐC GIA 2026 - MÔN TOÁN HỌC

Câu 1: Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đạo hàm $f'(x) = x(x-1)^2(x+2)^3$. Điểm cực tiểu của hàm số đã cho là:
*A. $x = 0$
B. $x = 1$
C. $x = -2$
D. $x = 2$
Lời giải: Ta lập bảng xét dấu $f'(x)$, đạo hàm đổi dấu từ âm sang dương khi qua $x = 0$. Do đó điểm cực tiểu là $x = 0$.

Câu 2: Cho hàm số bậc ba $y = f(x) = ax^3 + bx^2 + cx + d$ có đồ thị đi qua điểm $A(0; 2)$ và hai cực trị là $x = 1, x = 3$. Xét tính đúng/sai của các mệnh đề sau:
a) Hệ số tự do $d = 2$ (Đúng)
b) Hàm số đồng biến trên khoảng $(1; 3)$ khi $a > 0$ (Sai)
c) Hoành độ điểm uốn của đồ thị là $x = 2$ (Đúng)
d) Biểu thức liên hệ $b + 6a = 0$ (Đúng)
Hướng dẫn giải: $A(0;2) \\Rightarrow d = 2$. Đạo hàm $f'(x) = 3a(x-1)(x-3) = 3ax^2 - 12ax + 9a \\Rightarrow 2b = -12a \\Leftrightarrow b + 6a = 0$.

Câu 3: Tính giá trị tích phân sau: $K = \\int_{0}^{2} (3x^2 - 2x + 1) dx$.
Đáp số: 6
Lời giải: $\\int_0^2 (3x^2 - 2x + 1) dx = [x^3 - x^2 + x]_0^2 = 8 - 4 + 2 = 6$.

BẢNG ĐÁP ÁN
1.A  2.A  3.B`;

export const ExamImportStudio: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<'FILE' | 'TEXT'>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Exam Meta Form
  const [examTypeId, setExamTypeId] = useState<number>(1);
  const [examTitle, setExamTitle] = useState('Đề Thi Tự Động Tải Lên 2026');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [totalScore, setTotalScore] = useState(10.0);

  // Parsed Questions
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleParse = async () => {
    setIsParsing(true);
    setErrorMsg('');

    try {
      let res;
      if (inputMode === 'FILE' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        res = await apiClient.post('/exams/parse-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (rawText.trim()) {
        res = await apiClient.post('/exams/parse-document', { raw_text: rawText });
      } else {
        setErrorMsg('Vui lòng chọn file hoặc dán nội dung đề thi.');
        setIsParsing(false);
        return;
      }

      if (res.data?.questions) {
        setQuestions(res.data.questions);
        if (res.data.title) setExamTitle(res.data.title);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi bóc tách file. Vui lòng kiểm tra định dạng.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSample = () => {
    setInputMode('TEXT');
    setRawText(SAMPLE_EXAM_TEXT);
    setExamTitle('Đề Thi Thử THPT Quốc Gia 2026 - Môn Toán (Mẫu Bóc Tách)');
  };

  const toggleOptionCorrect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    const q = updated[qIndex];
    if (q.question_type === 'SINGLE_CHOICE') {
      q.options.forEach((o, i) => {
        o.is_correct = i === optIndex;
      });
    } else {
      q.options[optIndex].is_correct = !q.options[optIndex].is_correct;
    }
    setQuestions(updated);
  };

  const toggleTrueFalseSubOption = (qIndex: number, optIndex: number, val: boolean) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].is_correct = val;
    setQuestions(updated);
  };

  const handleSaveExam = async () => {
    if (questions.length === 0) {
      setErrorMsg('Chưa có câu hỏi nào được bóc tách.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        exam_type_id: examTypeId,
        title: examTitle,
        duration_minutes: durationMinutes,
        total_score: totalScore,
        questions: questions,
      };

      const res = await apiClient.post('/exams/save-imported-exam', payload);
      if (res.data?.exam_id) {
        router.push(`/exam-room/${res.data.exam_id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Lỗi khi lưu đề thi vào cơ sở dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Upload Zone & Config Header */}
      <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Trích Xuất Thông Minh
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Upload & Chuyển Đổi Đề Thi Tự Động
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hỗ trợ file <strong>Word (.docx)</strong>, <strong>PDF</strong> hoặc văn bản thô. 
            Hệ thống tự động nhận diện công thức KaTeX, phân loại câu hỏi (Trắc nghiệm, Đúng/Sai, Điền số), 
            và gắn bảng đáp án.
          </p>
        </div>

        {/* Mode Selector & Sample button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/10">
            <button
              onClick={() => setInputMode('FILE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'FILE' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải File (.docx, .pdf, .txt)</span>
            </button>
            <button
              onClick={() => setInputMode('TEXT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'TEXT' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Dán Văn Bản Trực Tiếp</span>
            </button>
          </div>

          <button
            onClick={handleLoadSample}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Thử Với Đề Thi Mẫu 2026 (1-Click)</span>
          </button>
        </div>

        {/* Upload Dropzone */}
        {inputMode === 'FILE' ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-blue-500/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04] mb-8"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-sm text-white mb-1">
              {selectedFile ? selectedFile.name : 'Kéo thả file đề thi vào đây hoặc bấm để chọn'}
            </h3>
            <p className="text-xs text-slate-400">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Hỗ trợ định dạng Microsoft Word (.docx), PDF (.pdf) hoặc Plain Text (.txt)'}
            </p>
          </div>
        ) : (
          <div className="mb-8 space-y-2">
            <textarea
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Dán nội dung đề thi vào đây... (Ví dụ: Câu 1: Cho hàm số... A. ... B. ... C. ... D. ... Lời giải: ... BẢNG ĐÁP ÁN: 1.A 2.B)"
              className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>
        )}

        {/* Metadata Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 pt-6 border-t border-white/10">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Kỳ thi mục tiêu</label>
            <select
              value={examTypeId}
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                setExamTypeId(id);
                setTotalScore(id === 1 ? 10.0 : id === 2 ? 150.0 : 100.0);
                setDurationMinutes(id === 1 ? 90 : id === 2 ? 195 : 150);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
            >
              <option value={1} className="bg-[#111827]">THPT Quốc Gia (Thang 10)</option>
              <option value={2} className="bg-[#111827]">ĐGNL HSA ĐHQGHN (Thang 150)</option>
              <option value={3} className="bg-[#111827]">ĐGTD TSA ĐHBKHN (Thang 100)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Tên đề thi</label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Thời gian thi (phút)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 90)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Tổng thang điểm</label>
            <input
              type="number"
              step="0.5"
              value={totalScore}
              onChange={(e) => setTotalScore(parseFloat(e.target.value) || 10.0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button: Parse Document */}
        <button
          onClick={handleParse}
          disabled={isParsing || (inputMode === 'FILE' && !selectedFile && !rawText)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
        >
          {isParsing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang trích xuất cấu trúc đề thi & công thức KaTeX...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Bóc Tách & Xem Trước Đề Thi</span>
            </>
          )}
        </button>
      </div>

      {/* Live Preview & Question Matrix */}
      {questions.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Xem Trước Cấu Trúc ({questions.length} câu)</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Bóc tách thành công
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bạn có thể click chọn lại đáp án đúng, kiểm tra công thức KaTeX hoặc chỉnh sửa trực tiếp.
              </p>
            </div>

            <button
              onClick={handleSaveExam}
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all shrink-0"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu đề thi...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xuất Bản & Tạo Đề Thi Ngay</span>
                </>
              )}
            </button>
          </div>

          {/* Questions Editor Matrix */}
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-white">Câu {qIdx + 1}</span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {q.question_type === 'SINGLE_CHOICE' && 'Trắc nghiệm 4 lựa chọn'}
                      {q.question_type === 'TRUE_FALSE' && 'Trắc nghiệm Đúng / Sai'}
                      {q.question_type === 'SHORT_ANSWER' && 'Trả lời ngắn'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const updated = questions.filter((_, i) => i !== qIdx);
                      setQuestions(updated);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content with KaTeX */}
                <div className="text-base text-white font-medium leading-relaxed">
                  <MathRenderer content={q.content} />
                </div>

                {/* Options list */}
                {q.question_type === 'SINGLE_CHOICE' && (
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-400">Click chọn đáp án đúng:</div>
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      return (
                        <div
                          key={oIdx}
                          onClick={() => toggleOptionCorrect(qIdx, oIdx)}
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            opt.is_correct
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500'
                              : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center ${
                                opt.is_correct ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-400'
                              }`}
                            >
                              {letter}
                            </span>
                            <MathRenderer content={opt.content} />
                          </div>
                          {opt.is_correct && (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TRUE_FALSE list */}
                {q.question_type === 'TRUE_FALSE' && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-bold uppercase text-blue-400">{opt.sub_key || 'a'})</span>
                          <MathRenderer content={opt.content} />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleTrueFalseSubOption(qIdx, oIdx, true)}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              opt.is_correct ? 'bg-emerald-600 text-white shadow-md' : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            Đúng
                          </button>
                          <button
                            onClick={() => toggleTrueFalseSubOption(qIdx, oIdx, false)}
                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                              !opt.is_correct ? 'bg-rose-600 text-white shadow-md' : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            Sai
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed space-y-1.5">
                    <div className="font-bold text-indigo-400 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hướng dẫn giải chi tiết</span>
                    </div>
                    <MathRenderer content={q.explanation} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Submit Action */}
          <div className="pt-4 text-center">
            <button
              onClick={handleSaveExam}
              disabled={isSaving}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 inline-flex items-center gap-2 transition-all"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tạo đề thi...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xuất Bản & Tạo Đề Thi Ngay ({questions.length} câu)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamImportStudio;
