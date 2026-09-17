<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Exam Types (THPT, HSA, TSA, SAT, etc.)
        Schema::create('exam_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // 'THPT', 'HSA', 'TSA'
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('badge')->nullable(); // 'Bộ GD&ĐT', 'ĐHQG Hà Nội', 'ĐH Bách Khoa'
            $table->string('icon')->nullable();
            $table->decimal('max_score', 6, 2)->default(10.0);
            $table->integer('default_duration_minutes')->default(90);
            $table->boolean('is_active')->default(true);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 2. Exam Sections (For HSA: Định lượng, Định tính, Khoa học; For TSA: Toán, Đọc hiểu, Khoa học; For THPT: Phần I, II, III)
        Schema::create('exam_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->string('name');
            $table->string('code');
            $table->text('description')->nullable();
            $table->decimal('max_score', 6, 2)->default(50.0);
            $table->integer('default_question_count')->default(50);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 3. Subjects / Domains (Toán, Vật lý, Hóa học, Sinh học, Ngữ văn, Lịch sử...)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('exam_sections')->nullOnDelete();
            $table->string('name');
            $table->string('code');
            $table->string('slug');
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 4. Topics (Chương / Chủ đề: Hàm số, Tích phân, Dao động cơ, Đọc hiểu khoa học...)
        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 5. Questions (Linh hoạt cho mọi loại kỳ thi)
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('exam_sections')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            
            // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, MATCHING
            $table->string('question_type')->default('SINGLE_CHOICE');
            $table->tinyInteger('difficulty_level')->default(1);
            
            $table->longText('content'); // Supports Markdown + KaTeX LaTeX $formula$ / $$formula$$
            $table->longText('passage')->nullable(); // Context / reading passage
            $table->longText('explanation')->nullable(); // Step-by-step solution
            
            $table->json('media_urls')->nullable();
            $table->json('metadata')->nullable(); // tags, acceptable_answers, source_year
            $table->decimal('points', 5, 2)->default(1.0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. Question Options
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->longText('content');
            $table->boolean('is_correct')->default(false);
            $table->string('sub_key')->nullable(); // 'a', 'b', 'c', 'd'
            $table->integer('order_index')->default(0);
            $table->decimal('fraction_score', 4, 2)->default(0);
            $table->timestamps();
        });

        // 7. Exam Templates
        Schema::create('exam_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->string('title');
            $table->string('code')->unique();
            $table->integer('duration_minutes');
            $table->integer('total_questions');
            $table->decimal('total_score', 6, 2);
            $table->json('structure_config');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 8. Exams
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('exam_templates')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->string('type')->default('MOCK_TEST'); // 'OFFICIAL_YEAR', 'MOCK_TEST', 'PRACTICE_CUSTOM'
            $table->integer('year')->nullable();
            $table->integer('duration_minutes')->default(90);
            $table->integer('total_questions')->default(50);
            $table->decimal('total_score', 6, 2)->default(100.0);
            $table->text('description')->nullable();
            $table->integer('attempts_count')->default(0);
            $table->decimal('average_score', 5, 2)->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // 9. Exam Questions (Mối quan hệ Đề thi - Ngân hàng câu hỏi)
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('exam_sections')->nullOnDelete();
            $table->integer('order_index')->default(0);
            $table->decimal('point_value', 5, 2)->default(1.0);
            $table->timestamps();
        });

        // 10. Exam Attempts (Aggregate Root cho quá trình thi)
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('expires_at'); // Backend Source of Truth Timer
            $table->timestamp('submitted_at')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->decimal('score', 6, 2)->default(0);
            $table->decimal('max_score', 6, 2)->default(100.0);
            $table->integer('correct_count')->default(0);
            $table->integer('wrong_count')->default(0);
            $table->integer('skipped_count')->default(0);
            $table->string('status')->default('IN_PROGRESS'); // 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED', 'GRADED'
            $table->json('section_scores')->nullable();
            $table->timestamps();
        });

        // 11. Attempt Questions Snapshot (Cơ chế Snapshot câu hỏi chống sai lệch lịch sử)
        Schema::create('attempt_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->nullable()->constrained('questions')->nullOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('exam_sections')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->integer('order_index')->default(0);
            $table->decimal('point_value', 5, 2)->default(1.0);
            $table->string('question_type_snapshot');
            $table->tinyInteger('difficulty_level_snapshot')->default(1);
            $table->longText('content_snapshot');
            $table->longText('passage_snapshot')->nullable();
            $table->json('options_snapshot'); // Array of {id, content, sub_key, order_index}
            $table->json('correct_answer_snapshot'); // Private grading data snapshot
            $table->longText('explanation_snapshot')->nullable();
            $table->decimal('score_awarded', 5, 2)->default(0);
            $table->timestamps();
        });

        // 12. Student Answers (Bài làm chi tiết)
        Schema::create('student_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->json('selected_option_ids')->nullable();
            $table->text('text_answer')->nullable();
            $table->json('sub_answers')->nullable(); // For TRUE_FALSE
            $table->boolean('is_correct')->default(false);
            $table->boolean('is_flagged')->default(false);
            $table->decimal('score_awarded', 5, 2)->default(0);
            $table->integer('time_spent_seconds')->default(0);
            $table->timestamps();
        });

        // 13. User Topic Statistics (Bảng thống kê năng lực chuyên sâu theo chủ đề)
        Schema::create('user_topic_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->integer('total_questions')->default(0);
            $table->integer('correct_questions')->default(0);
            $table->decimal('accuracy_rate', 5, 2)->default(0);
            $table->integer('average_time_seconds')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'topic_id']);
        });

        // 14. Wrong Questions Notebook
        Schema::create('wrong_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignId('exam_type_id')->constrained('exam_types')->cascadeOnDelete();
            $table->foreignId('attempt_id')->nullable()->constrained('exam_attempts')->nullOnDelete();
            $table->integer('wrong_count')->default(1);
            $table->timestamp('last_answered_at');
            $table->boolean('is_mastered')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'question_id']);
        });

        // 15. Question Bookmarks
        Schema::create('question_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_bookmarks');
        Schema::dropIfExists('wrong_questions');
        Schema::dropIfExists('user_topic_statistics');
        Schema::dropIfExists('student_answers');
        Schema::dropIfExists('attempt_questions');
        Schema::dropIfExists('exam_attempts');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('exam_templates');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('exam_sections');
        Schema::dropIfExists('exam_types');
    }
};
