<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamSection;
use App\Models\ExamTemplate;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Student User
        $user = User::create([
            'name' => 'Nguyễn Minh An',
            'email' => 'student@luyenthi.vn',
            'password' => Hash::make('password123'),
            'role' => 'STUDENT',
            'current_exam_code' => 'THPT',
            'target_scores' => [
                'THPT' => ['math' => 9.2, 'physics' => 8.8, 'chemistry' => 8.5],
                'HSA' => 115,
                'TSA' => 78,
            ],
        ]);

        // 2. Exam Types
        $thpt = ExamType::create([
            'code' => 'THPT',
            'name' => 'Thi Tốt Nghiệp THPT Quốc Gia',
            'slug' => 'thpt-quoc-gia',
            'badge' => 'Bộ GD&ĐT',
            'description' => 'Luyện thi tốt nghiệp THPT theo môn học và cấu trúc ma trận mới nhất của Bộ GD&ĐT.',
            'icon' => 'GraduationCap',
            'max_score' => 10.0,
            'default_duration_minutes' => 90,
            'order_index' => 1,
        ]);

        $hsa = ExamType::create([
            'code' => 'HSA',
            'name' => 'Đánh Giá Năng Lực HSA',
            'slug' => 'danh-gia-nang-luc-hsa',
            'badge' => 'ĐHQG Hà Nội',
            'description' => 'Kỳ thi ĐGNL học sinh THPT của ĐHQG Hà Nội gồm 3 phần: Định lượng, Định tính, Khoa học.',
            'icon' => 'BookOpenCheck',
            'max_score' => 150.0,
            'default_duration_minutes' => 195,
            'order_index' => 2,
        ]);

        $tsa = ExamType::create([
            'code' => 'TSA',
            'name' => 'Đánh Giá Tư Duy TSA',
            'slug' => 'danh-gia-tu-duy-tsa',
            'badge' => 'ĐH Bách Khoa Hà Nội',
            'description' => 'Kỳ thi ĐGTD của ĐH Bách Khoa Hà Nội gồm Tư duy Toán học, Đọc hiểu và Tư duy Khoa học.',
            'icon' => 'BrainCircuit',
            'max_score' => 100.0,
            'default_duration_minutes' => 150,
            'order_index' => 3,
        ]);

        // 3. Exam Sections
        // HSA Sections
        $hsaSec1 = ExamSection::create([
            'exam_type_id' => $hsa->id,
            'name' => 'Tư duy định lượng (Toán học & Số liệu)',
            'code' => 'HSA_QUANT',
            'description' => '50 câu hỏi kiểm tra khả năng tư duy toán học và xử lý biểu đồ số liệu',
            'max_score' => 50.0,
            'default_question_count' => 50,
            'order_index' => 1,
        ]);

        $hsaSec2 = ExamSection::create([
            'exam_type_id' => $hsa->id,
            'name' => 'Tư duy định tính (Ngôn ngữ - Văn học)',
            'code' => 'HSA_QUAL',
            'description' => '50 câu hỏi kiểm tra năng lực tiếng Việt và đọc hiểu ngữ liệu văn học',
            'max_score' => 50.0,
            'default_question_count' => 50,
            'order_index' => 2,
        ]);

        $hsaSec3 = ExamSection::create([
            'exam_type_id' => $hsa->id,
            'name' => 'Khoa học (Tự nhiên & Xã hội)',
            'code' => 'HSA_SCIENCE',
            'description' => '50 câu hỏi tích hợp Vật lý, Hóa học, Sinh học, Lịch sử, Địa lý',
            'max_score' => 50.0,
            'default_question_count' => 50,
            'order_index' => 3,
        ]);

        // TSA Sections
        $tsaSec1 = ExamSection::create([
            'exam_type_id' => $tsa->id,
            'name' => 'Tư duy Toán học',
            'code' => 'TSA_MATH',
            'description' => '40 câu hỏi trắc nghiệm khách quan, điền khuyết và đúng/sai (60 phút)',
            'max_score' => 40.0,
            'default_question_count' => 40,
            'order_index' => 1,
        ]);

        $tsaSec2 = ExamSection::create([
            'exam_type_id' => $tsa->id,
            'name' => 'Tư duy Đọc hiểu',
            'code' => 'TSA_READING',
            'description' => '20 câu hỏi đọc hiểu văn bản khoa học, công nghệ, kinh tế (30 phút)',
            'max_score' => 20.0,
            'default_question_count' => 20,
            'order_index' => 2,
        ]);

        $tsaSec3 = ExamSection::create([
            'exam_type_id' => $tsa->id,
            'name' => 'Tư duy Khoa học / Giải quyết vấn đề',
            'code' => 'TSA_PROBLEM_SOLVING',
            'description' => '40 câu hỏi phân tích dữ liệu thực nghiệm và giải quyết vấn đề (60 phút)',
            'max_score' => 40.0,
            'default_question_count' => 40,
            'order_index' => 3,
        ]);

        // 4. Subjects & Domains
        // THPT Subjects
        $thptToan = Subject::create([
            'exam_type_id' => $thpt->id,
            'name' => 'Toán học',
            'code' => 'THPT_MATH',
            'slug' => 'toan-hoc',
            'icon' => 'Calculator',
            'color' => '#3b82f6',
            'order_index' => 1,
        ]);

        $thptLy = Subject::create([
            'exam_type_id' => $thpt->id,
            'name' => 'Vật lý',
            'code' => 'THPT_PHYSICS',
            'slug' => 'vat-ly',
            'icon' => 'Atom',
            'color' => '#8b5cf6',
            'order_index' => 2,
        ]);

        $thptHoa = Subject::create([
            'exam_type_id' => $thpt->id,
            'name' => 'Hóa học',
            'code' => 'THPT_CHEMISTRY',
            'slug' => 'hoa-hoc',
            'icon' => 'FlaskConical',
            'color' => '#ec4899',
            'order_index' => 3,
        ]);

        $thptAnh = Subject::create([
            'exam_type_id' => $thpt->id,
            'name' => 'Tiếng Anh',
            'code' => 'THPT_ENGLISH',
            'slug' => 'tieng-anh',
            'icon' => 'Languages',
            'color' => '#10b981',
            'order_index' => 4,
        ]);

        // HSA Domains
        $hsaMathDomain = Subject::create([
            'exam_type_id' => $hsa->id,
            'section_id' => $hsaSec1->id,
            'name' => 'Toán học & Số liệu',
            'code' => 'HSA_MATH',
            'slug' => 'hsa-toan-hoc-so-lieu',
            'icon' => 'TrendingUp',
            'color' => '#2563eb',
            'order_index' => 1,
        ]);

        $hsaLangDomain = Subject::create([
            'exam_type_id' => $hsa->id,
            'section_id' => $hsaSec2->id,
            'name' => 'Ngôn ngữ & Văn học',
            'code' => 'HSA_LANG',
            'slug' => 'hsa-ngon-ngu-van-hoc',
            'icon' => 'FileText',
            'color' => '#059669',
            'order_index' => 2,
        ]);

        $hsaSciDomain = Subject::create([
            'exam_type_id' => $hsa->id,
            'section_id' => $hsaSec3->id,
            'name' => 'Khoa học tự nhiên & xã hội',
            'code' => 'HSA_SCI',
            'slug' => 'hsa-khoa-hoc',
            'icon' => 'Microscope',
            'color' => '#d97706',
            'order_index' => 3,
        ]);

        // TSA Domains
        $tsaMathDomain = Subject::create([
            'exam_type_id' => $tsa->id,
            'section_id' => $tsaSec1->id,
            'name' => 'Tư duy Toán học',
            'code' => 'TSA_MATH_DOM',
            'slug' => 'tsa-tu-duy-toan-hoc',
            'icon' => 'Cpu',
            'color' => '#7c3aed',
            'order_index' => 1,
        ]);

        $tsaReadDomain = Subject::create([
            'exam_type_id' => $tsa->id,
            'section_id' => $tsaSec2->id,
            'name' => 'Tư duy Đọc hiểu',
            'code' => 'TSA_READ_DOM',
            'slug' => 'tsa-tu-duy-doc-hieu',
            'icon' => 'BookOpen',
            'color' => '#0891b2',
            'order_index' => 2,
        ]);

        $tsaProbDomain = Subject::create([
            'exam_type_id' => $tsa->id,
            'section_id' => $tsaSec3->id,
            'name' => 'Tư duy Khoa học',
            'code' => 'TSA_PROB_DOM',
            'slug' => 'tsa-tu-duy-khoa-hoc',
            'icon' => 'Sparkles',
            'color' => '#ea580c',
            'order_index' => 3,
        ]);

        // 5. Topics
        $topicHamSo = Topic::create([
            'subject_id' => $thptToan->id,
            'name' => 'Ứng dụng đạo hàm để khảo sát hàm số',
            'slug' => 'khao-sat-ham-so',
            'description' => 'Cực trị, tính đơn điệu, giá trị lớn nhất nhỏ nhất, tiệm cận đồ thị hàm số.',
            'order_index' => 1,
        ]);

        $topicTichPhan = Topic::create([
            'subject_id' => $thptToan->id,
            'name' => 'Nguyên hàm, Tích phân & Ứng dụng',
            'slug' => 'nguyen-ham-tich-phan',
            'description' => 'Tính tích phân, diện tích hình phẳng, thể tích khối tròn xoay.',
            'order_index' => 2,
        ]);

        $topicXacSuat = Topic::create([
            'subject_id' => $thptToan->id,
            'name' => 'Xác suất & Thống kê nâng cao',
            'slug' => 'xac-suat-thong-ke',
            'description' => 'Quy tắc cộng nhân, biến cố độc lập, sơ đồ cây xác suất.',
            'order_index' => 3,
        ]);

        $topicHsaData = Topic::create([
            'subject_id' => $hsaMathDomain->id,
            'name' => 'Xử lý số liệu & Biểu đồ thống kê',
            'slug' => 'xu-ly-so-lieu-bieu-do',
            'description' => 'Phân tích bảng biểu, biểu đồ cột, biểu đồ tròn và dự báo xu hướng số liệu.',
            'order_index' => 1,
        ]);

        $topicHsaDocHieu = Topic::create([
            'subject_id' => $hsaLangDomain->id,
            'name' => 'Đọc hiểu & Phân tích cấu trúc văn bản',
            'slug' => 'doc-hieu-ngu-lieu-hsa',
            'description' => 'Xác định phương thức biểu đạt, phong cách ngôn ngữ và thông điệp văn bản.',
            'order_index' => 1,
        ]);

        $topicTsaLogic = Topic::create([
            'subject_id' => $tsaMathDomain->id,
            'name' => 'Tư duy Logic & Đại số ứng dụng',
            'slug' => 'logic-dai-so-tsa',
            'description' => 'Mô hình hóa toán học, suy luận logic và bài toán tối ưu hóa.',
            'order_index' => 1,
        ]);

        // 6. Realistic Questions with KaTeX LaTeX & Multiple Question Types
        
        // --- THPT QUESTION 1: Single Choice (Toán - Khảo sát hàm số)
        $q1 = Question::create([
            'exam_type_id' => $thpt->id,
            'subject_id' => $thptToan->id,
            'topic_id' => $topicHamSo->id,
            'question_type' => 'SINGLE_CHOICE',
            'difficulty_level' => 2,
            'content' => 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đạo hàm $f\'(x) = x(x-1)^2(x+2)^3$. Điểm cực tiểu của hàm số đã cho là:',
            'explanation' => 'Ta lập bảng xét dấu đạo hàm $f\'(x)$:\n\n* $x = 0$ là nghiệm đơn (đổi dấu từ $-$ sang $+$ khi qua $x = 0$).\n* $x = 1$ là nghiệm bội chẵn (không đổi dấu).\n* $x = -2$ là nghiệm bội lẻ bậc 3 (đổi dấu từ $+$ sang $-$ khi qua $x = -2$).\n\nDo $f\'(x)$ đổi dấu từ âm sang dương khi qua điểm $x = 0$, nên hàm số đạt cực tiểu tại $x = 0$.',
            'points' => 0.25,
        ]);
        $opt1A = QuestionOption::create(['question_id' => $q1->id, 'content' => '$x = 0$', 'is_correct' => true, 'order_index' => 1]);
        $opt1B = QuestionOption::create(['question_id' => $q1->id, 'content' => '$x = 1$', 'is_correct' => false, 'order_index' => 2]);
        $opt1C = QuestionOption::create(['question_id' => $q1->id, 'content' => '$x = -2$', 'is_correct' => false, 'order_index' => 3]);
        $opt1D = QuestionOption::create(['question_id' => $q1->id, 'content' => '$x = 2$', 'is_correct' => false, 'order_index' => 4]);

        // --- THPT QUESTION 2: TRUE_FALSE (Đúng/Sai 4 ý chuẩn cấu trúc mới 2025/2026)
        $q2 = Question::create([
            'exam_type_id' => $thpt->id,
            'subject_id' => $thptToan->id,
            'topic_id' => $topicHamSo->id,
            'question_type' => 'TRUE_FALSE',
            'difficulty_level' => 3,
            'content' => 'Cho hàm số bậc ba $y = f(x) = ax^3 + bx^2 + cx + d$ ($a \\neq 0$) có đồ thị đi qua điểm $A(0; 2)$ và có hai điểm cực trị là $x_1 = 1, x_2 = 3$. Xét tính đúng/sai của các mệnh đề sau:',
            'explanation' => '**Lời giải chi tiết:**\n\n* Đồ thị đi qua $A(0; 2) \\Rightarrow d = 2$.\n* Đạo hàm $f\'(x) = 3ax^2 + 2bx + c = 3a(x-1)(x-3) = 3a(x^2 - 4x + 3) = 3ax^2 - 12ax + 9a$.\n* Do đó: $2b = -12a \\Rightarrow b = -6a$, và $c = 9a$.\n* Điểm uốn của đồ thị hàm bậc ba là trung điểm 2 điểm cực trị: $x_{u} = \\frac{1 + 3}{2} = 2$.',
            'points' => 1.0,
        ]);
        QuestionOption::create(['question_id' => $q2->id, 'sub_key' => 'a', 'content' => 'Hệ số tự do $d = 2$', 'is_correct' => true, 'order_index' => 1]);
        QuestionOption::create(['question_id' => $q2->id, 'sub_key' => 'b', 'content' => 'Hàm số đồng biến trên khoảng $(1; 3)$ khi $a > 0$', 'is_correct' => false, 'order_index' => 2]);
        QuestionOption::create(['question_id' => $q2->id, 'sub_key' => 'c', 'content' => 'Hoành độ điểm uốn của đồ thị hàm số là $x = 2$', 'is_correct' => true, 'order_index' => 3]);
        QuestionOption::create(['question_id' => $q2->id, 'sub_key' => 'd', 'content' => 'Biểu thức liên hệ $b + 6a = 0$', 'is_correct' => true, 'order_index' => 4]);

        // --- THPT QUESTION 3: SHORT_ANSWER (Trả lời ngắn / Điền số)
        $q3 = Question::create([
            'exam_type_id' => $thpt->id,
            'subject_id' => $thptToan->id,
            'topic_id' => $topicTichPhan->id,
            'question_type' => 'SHORT_ANSWER',
            'difficulty_level' => 3,
            'content' => 'Biết rằng $\\int_{0}^{2} (3x^2 - 2x + 1) dx = K$. Tính giá trị của $K$.',
            'explanation' => '**Lời giải:**\n\n$$\\int_{0}^{2} (3x^2 - 2x + 1) dx = \\left[ x^3 - x^2 + x \\right]_{0}^{2} = (2^3 - 2^2 + 2) - 0 = (8 - 4 + 2) = 6$$\n\nVậy giá trị $K = 6$.',
            'metadata' => ['acceptable_answers' => ['6', '6.0']],
            'points' => 0.5,
        ]);
        QuestionOption::create(['question_id' => $q3->id, 'content' => '6', 'is_correct' => true, 'order_index' => 1]);

        // --- HSA QUESTION 1: Section 1 (Định lượng - Xử lý số liệu)
        $q4 = Question::create([
            'exam_type_id' => $hsa->id,
            'section_id' => $hsaSec1->id,
            'subject_id' => $hsaMathDomain->id,
            'topic_id' => $topicHsaData->id,
            'question_type' => 'SINGLE_CHOICE',
            'difficulty_level' => 2,
            'content' => 'Một lớp học có 40 học sinh, trong đó có 25 em thích môn Toán, 20 em thích môn Văn và 12 em thích cả hai môn Toán và Văn. Chọn ngẫu nhiên một học sinh. Xác suất để chọn được học sinh thích ít nhất một trong hai môn là:',
            'explanation' => '**Phương pháp:** Áp dụng công thức cộng xác suất $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.\n\n* Số học sinh thích ít nhất một môn: $n(A \\cup B) = 25 + 20 - 12 = 33$.\n* Xác suất cần tìm: $P = \\frac{33}{40} = 0,825 = 82,5\\%$.',
            'points' => 1.0,
        ]);
        QuestionOption::create(['question_id' => $q4->id, 'content' => '$\\frac{33}{40}$', 'is_correct' => true, 'order_index' => 1]);
        QuestionOption::create(['question_id' => $q4->id, 'content' => '$\\frac{45}{40}$', 'is_correct' => false, 'order_index' => 2]);
        QuestionOption::create(['question_id' => $q4->id, 'content' => '$\\frac{12}{40}$', 'is_correct' => false, 'order_index' => 3]);
        QuestionOption::create(['question_id' => $q4->id, 'content' => '$\\frac{28}{40}$', 'is_correct' => false, 'order_index' => 4]);

        // --- HSA QUESTION 2: Section 2 (Định tính - Ngôn ngữ)
        $q5 = Question::create([
            'exam_type_id' => $hsa->id,
            'section_id' => $hsaSec2->id,
            'subject_id' => $hsaLangDomain->id,
            'topic_id' => $topicHsaDocHieu->id,
            'question_type' => 'SINGLE_CHOICE',
            'difficulty_level' => 2,
            'passage' => 'Đọc đoạn trích sau:\n"Sông Đuống trôi đi\nMột dòng lấp lánh\nNằm nghiêng nghiêng trong kháng chiến trường kỳ\nXanh xanh bãi mía bờ dâu\nNgô khoai biêng biếc..."\n(Bên kia sông Đuống – Hoàng Cầm)',
            'content' => 'Biện pháp tu từ nổi bật trong câu thơ *"Nằm nghiêng nghiêng trong kháng chiến trường kỳ"* là:',
            'explanation' => 'Hình ảnh dòng sông Đuống được tác giả gán cho hành động, dáng dấp con người ("nằm nghiêng nghiêng"), đây là biện pháp **Nhân hóa**, thể hiện nét duyên dáng, thân thương và biểu tượng kiên cường của quê hương vùng Kinh Bắc.',
            'points' => 1.0,
        ]);
        QuestionOption::create(['question_id' => $q5->id, 'content' => 'Nhân hóa', 'is_correct' => true, 'order_index' => 1]);
        QuestionOption::create(['question_id' => $q5->id, 'content' => 'Hoán dụ', 'is_correct' => false, 'order_index' => 2]);
        QuestionOption::create(['question_id' => $q5->id, 'content' => 'So sánh', 'is_correct' => false, 'order_index' => 3]);
        QuestionOption::create(['question_id' => $q5->id, 'content' => 'Ẩn dụ chuyển đổi cảm giác', 'is_correct' => false, 'order_index' => 4]);

        // --- TSA QUESTION 1: Tư duy Toán học (ĐHBK Hà Nội - Logic & Tối ưu)
        $q6 = Question::create([
            'exam_type_id' => $tsa->id,
            'section_id' => $tsaSec1->id,
            'subject_id' => $tsaMathDomain->id,
            'topic_id' => $topicTsaLogic->id,
            'question_type' => 'SINGLE_CHOICE',
            'difficulty_level' => 3,
            'content' => 'Một bể chứa hình trụ không có nắp được làm từ tấm kim loại mỏng có diện tích bề mặt $S = 27\\pi \\text{ m}^2$. Để thể tích chứa của bể là lớn nhất thì bán kính đáy $R$ bằng bao nhiêu?',
            'explanation' => '**Phân tích mô hình:**\n\n* Diện tích bể trụ không nắp: $S = \\pi R^2 + 2\\pi R h = 27\\pi \\Rightarrow h = \\frac{27 - R^2}{2R}$.\n* Thể tích bể: $V(R) = \\pi R^2 h = \\pi R^2 \\cdot \\frac{27 - R^2}{2R} = \\frac{\\pi}{2}(27R - R^3)$.\n* Lấy đạo hàm: $V\'(R) = \\frac{\\pi}{2}(27 - 3R^2) = 0 \\Rightarrow R = 3\\text{ m}$.\n* Vậy thể tích lớn nhất khi bán kính đáy $R = 3\\text{ m}$.',
            'points' => 1.0,
        ]);
        QuestionOption::create(['question_id' => $q6->id, 'content' => '$R = 3\\text{ m}$', 'is_correct' => true, 'order_index' => 1]);
        QuestionOption::create(['question_id' => $q6->id, 'content' => '$R = 4\\text{ m}$', 'is_correct' => false, 'order_index' => 2]);
        QuestionOption::create(['question_id' => $q6->id, 'content' => '$R = 2\\sqrt{3}\\text{ m}$', 'is_correct' => false, 'order_index' => 3]);
        QuestionOption::create(['question_id' => $q6->id, 'content' => '$R = 9\\text{ m}$', 'is_correct' => false, 'order_index' => 4]);

        // --- TSA QUESTION 2: Tư duy Khoa học / Giải quyết vấn đề (ĐHBK Hà Nội)
        $q7 = Question::create([
            'exam_type_id' => $tsa->id,
            'section_id' => $tsaSec3->id,
            'subject_id' => $tsaProbDomain->id,
            'question_type' => 'TRUE_FALSE',
            'difficulty_level' => 3,
            'content' => 'Trong một thí nghiệm đo gia tốc trọng trường $g$ bằng con lắc đơn, học sinh đo chu kỳ dao động $T$ ứng với chiều dài dây treo $L$ khác nhau và vẽ đồ thị $T^2$ theo $L$. Xét các nhận định sau:',
            'explanation' => 'Ta có công thức chu kỳ con lắc đơn dao động điều hòa: $T = 2\\pi \\sqrt{\\frac{L}{g}} \\Rightarrow T^2 = \\left(\\frac{4\\pi^2}{g}\\right) L$. Đồ thị $T^2$ theo $L$ là một đường thẳng đi qua gốc tọa độ với hệ số góc $k = \\frac{4\\pi^2}{g}$.',
            'points' => 1.0,
        ]);
        QuestionOption::create(['question_id' => $q7->id, 'sub_key' => 'a', 'content' => 'Đồ thị biểu diễn $T^2$ phụ thuộc vào $L$ có dạng là một đường thẳng đi qua gốc tọa độ', 'is_correct' => true, 'order_index' => 1]);
        QuestionOption::create(['question_id' => $q7->id, 'sub_key' => 'b', 'content' => 'Hệ số góc của đường thẳng bằng $\\frac{4\\pi^2}{g}$', 'is_correct' => true, 'order_index' => 2]);
        QuestionOption::create(['question_id' => $q7->id, 'sub_key' => 'c', 'content' => 'Nếu tăng khối lượng vật nặng lên gấp đôi thì chu kỳ dao động $T$ tăng $\\sqrt{2}$ lần', 'is_correct' => false, 'order_index' => 3]);
        QuestionOption::create(['question_id' => $q7->id, 'sub_key' => 'd', 'content' => 'Có thể xác định gia tốc $g$ thông qua độ dốc của đồ thị thực nghiệm', 'is_correct' => true, 'order_index' => 4]);

        // 7. Exam Templates
        $templateThpt = ExamTemplate::create([
            'exam_type_id' => $thpt->id,
            'title' => 'Cấu trúc Chuẩn Đề Thi Tốt Nghiệp THPT Môn Toán 2026',
            'code' => 'THPT_MATH_STANDARD_2026',
            'duration_minutes' => 90,
            'total_questions' => 34,
            'total_score' => 10.0,
            'structure_config' => [
                'part1_single_choice' => ['count' => 12, 'points_each' => 0.25],
                'part2_true_false' => ['count' => 4, 'points_each' => 1.0],
                'part3_short_answer' => ['count' => 6, 'points_each' => 0.5],
            ],
            'description' => 'Cấu trúc đề thi tốt nghiệp THPT theo chương trình GDPT mới gồm 3 phần trắc nghiệm.',
        ]);

        $templateHsa = ExamTemplate::create([
            'exam_type_id' => $hsa->id,
            'title' => 'Cấu trúc Chuẩn Đề Đánh Giá Năng Lực HSA',
            'code' => 'HSA_FULL_TEST_TEMPLATE',
            'duration_minutes' => 195,
            'total_questions' => 150,
            'total_score' => 150.0,
            'structure_config' => [
                'section_1' => ['name' => 'Toán học & Xử lý số liệu', 'count' => 50, 'max_score' => 50],
                'section_2' => ['name' => 'Ngôn ngữ & Văn học', 'count' => 50, 'max_score' => 50],
                'section_3' => ['name' => 'Khoa học', 'count' => 50, 'max_score' => 50],
            ],
        ]);

        $templateTsa = ExamTemplate::create([
            'exam_type_id' => $tsa->id,
            'title' => 'Cấu trúc Chuẩn Đề Đánh Giá Tư Duy TSA',
            'code' => 'TSA_FULL_TEST_TEMPLATE',
            'duration_minutes' => 150,
            'total_questions' => 100,
            'total_score' => 100.0,
            'structure_config' => [
                'section_1' => ['name' => 'Tư duy Toán học', 'count' => 40, 'max_score' => 40],
                'section_2' => ['name' => 'Tư duy Đọc hiểu', 'count' => 20, 'max_score' => 20],
                'section_3' => ['name' => 'Tư duy Khoa học / Giải quyết vấn đề', 'count' => 40, 'max_score' => 40],
            ],
        ]);

        // 8. Ready-to-take Mock Exams
        
        // --- EXAM 1: THPT Môn Toán - Đề Thi Thử Số 01
        $examThpt1 = Exam::create([
            'exam_type_id' => $thpt->id,
            'template_id' => $templateThpt->id,
            'subject_id' => $thptToan->id,
            'title' => 'Đề thi thử THPT Quốc Gia 2026 - Môn Toán (Mã đề 101)',
            'slug' => 'de-thi-thu-thpt-toan-2026-ma-101',
            'type' => 'MOCK_TEST',
            'year' => 2026,
            'duration_minutes' => 90,
            'total_questions' => 3,
            'total_score' => 10.0,
            'description' => 'Đề bám sát cấu trúc đề minh họa mới nhất của Bộ GD&ĐT gồm 3 phần: Trắc nghiệm 4 lựa chọn, Đúng/Sai và Điền khuyết.',
            'attempts_count' => 142,
            'average_score' => 7.6,
            'is_published' => true,
        ]);
        ExamQuestion::create(['exam_id' => $examThpt1->id, 'question_id' => $q1->id, 'order_index' => 1, 'point_value' => 3.0]);
        ExamQuestion::create(['exam_id' => $examThpt1->id, 'question_id' => $q2->id, 'order_index' => 2, 'point_value' => 4.0]);
        ExamQuestion::create(['exam_id' => $examThpt1->id, 'question_id' => $q3->id, 'order_index' => 3, 'point_value' => 3.0]);

        // --- EXAM 2: HSA ĐGNL ĐHQG Hà Nội - Đề Thi Thử Chuẩn
        $examHsa1 = Exam::create([
            'exam_type_id' => $hsa->id,
            'template_id' => $templateHsa->id,
            'title' => 'Đề thi thử Đánh Giá Năng Lực HSA 2026 - ĐHQG Hà Nội',
            'slug' => 'de-thi-thu-dgnl-hsa-2026-dhqg-ha-noi',
            'type' => 'MOCK_TEST',
            'year' => 2026,
            'duration_minutes' => 195,
            'total_questions' => 2,
            'total_score' => 150.0,
            'description' => 'Đề thi thử tổng hợp 3 phần kiến thức định lượng, định tính và khoa học bám sát kỳ thi chính thức ĐHQGHN.',
            'attempts_count' => 218,
            'average_score' => 94.5,
            'is_published' => true,
        ]);
        ExamQuestion::create(['exam_id' => $examHsa1->id, 'question_id' => $q4->id, 'section_id' => $hsaSec1->id, 'order_index' => 1, 'point_value' => 75.0]);
        ExamQuestion::create(['exam_id' => $examHsa1->id, 'question_id' => $q5->id, 'section_id' => $hsaSec2->id, 'order_index' => 2, 'point_value' => 75.0]);

        // --- EXAM 3: TSA ĐGTD ĐHBK Hà Nội - Đề Thi Thử Chuẩn
        $examTsa1 = Exam::create([
            'exam_type_id' => $tsa->id,
            'template_id' => $templateTsa->id,
            'title' => 'Đề thi thử Đánh Giá Tư Duy TSA 2026 - ĐH Bách Khoa Hà Nội',
            'slug' => 'de-thi-thu-dgtd-tsa-2026-dh-bach-khoa-ha-noi',
            'type' => 'MOCK_TEST',
            'year' => 2026,
            'duration_minutes' => 150,
            'total_questions' => 2,
            'total_score' => 100.0,
            'description' => 'Đề luyện thi đánh giá tư duy kỹ thuật và tư duy phân tích khoa học của Đại học Bách Khoa Hà Nội.',
            'attempts_count' => 95,
            'average_score' => 67.2,
            'is_published' => true,
        ]);
        ExamQuestion::create(['exam_id' => $examTsa1->id, 'question_id' => $q6->id, 'section_id' => $tsaSec1->id, 'order_index' => 1, 'point_value' => 50.0]);
        ExamQuestion::create(['exam_id' => $examTsa1->id, 'question_id' => $q7->id, 'section_id' => $tsaSec3->id, 'order_index' => 2, 'point_value' => 50.0]);
    }
}
