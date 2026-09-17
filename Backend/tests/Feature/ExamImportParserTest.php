<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\ExamType;
use App\Models\Question;
use App\Services\DocumentParser\ExamStructureParser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamImportParserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_structure_parser_recognizes_questions_options_and_answer_key(): void
    {
        $sampleText = <<<EOT
ĐỀ THI THỬ THPT QUỐC GIA 2026

Câu 1: Cho hàm số \$y = f(x)\$ có đạo hàm \$f'(x) = x(x-1)\$. Điểm cực tiểu của hàm số là:
A. \$x = 0\$
*B. \$x = 1\$
C. \$x = -1\$
D. \$x = 2\$
Lời giải: Ta lập bảng xét dấu, đạo hàm đổi dấu từ âm sang dương tại x = 1.

Câu 2: Xét tính đúng sai của các mệnh đề sau:
a) Hàm số đồng biến trên khoảng (1; 3) (Đúng)
b) Đồ thị có tiệm cận đứng tại x = 0 (Sai)
c) Giá trị lớn nhất bằng 5 (Đúng)
d) Hàm số có 2 điểm cực trị (Đúng)

Câu 3: Tính giá trị tích phân \$\int_0^1 (2x + 1) dx\$.
Đáp số: 2

BẢNG ĐÁP ÁN
1.B  2.A  3.C
EOT;

        $parser = new ExamStructureParser();
        $result = $parser->parse($sampleText);

        $this->assertCount(3, $result['questions']);

        // Check Q1 (Single choice with correct answer B)
        $q1 = $result['questions'][0];
        $this->assertEquals('SINGLE_CHOICE', $q1['question_type']);
        $this->assertCount(4, $q1['options']);
        $this->assertTrue($q1['options'][1]['is_correct']); // B is correct
        $this->assertNotEmpty($q1['explanation']);

        // Check Q2 (True / False 4 sub-items)
        $q2 = $result['questions'][1];
        $this->assertEquals('TRUE_FALSE', $q2['question_type']);
        $this->assertCount(4, $q2['options']);
        $this->assertTrue($q2['options'][0]['is_correct']); // a is True
        $this->assertFalse($q2['options'][1]['is_correct']); // b is False

        // Check Q3 (Short Answer)
        $q3 = $result['questions'][2];
        $this->assertEquals('SHORT_ANSWER', $q3['question_type']);
    }

    public function test_save_imported_exam_endpoint_creates_exam_in_database(): void
    {
        $examType = ExamType::first();

        $payload = [
            'exam_type_id' => $examType->id,
            'title' => 'Đề Thi Import Tự Động Test',
            'duration_minutes' => 60,
            'total_score' => 10.0,
            'questions' => [
                [
                    'content' => 'Câu hỏi trắc nghiệm 1: Tính \$2 + 2\$?',
                    'question_type' => 'SINGLE_CHOICE',
                    'difficulty_level' => 1,
                    'point_value' => 5.0,
                    'options' => [
                        ['content' => '3', 'is_correct' => false],
                        ['content' => '4', 'is_correct' => true],
                        ['content' => '5', 'is_correct' => false],
                        ['content' => '6', 'is_correct' => false],
                    ],
                ],
                [
                    'content' => 'Câu hỏi điền số: Phương trình \$x^2 = 9\$ có nghiệm dương là bao nhiêu?',
                    'question_type' => 'SHORT_ANSWER',
                    'difficulty_level' => 2,
                    'point_value' => 5.0,
                    'options' => [
                        ['content' => '3', 'is_correct' => true],
                    ],
                ],
            ],
        ];

        $response = $this->postJson('/api/exams/save-imported-exam', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('exams', [
            'title' => 'Đề Thi Import Tự Động Test',
            'total_questions' => 2,
        ]);
    }
}
