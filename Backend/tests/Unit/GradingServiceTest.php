<?php

namespace Tests\Unit;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Services\GradingService;
use Tests\TestCase;

class GradingServiceTest extends TestCase
{
    protected GradingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GradingService();
    }

    public function test_single_choice_grading_correct_and_wrong(): void
    {
        $question = new Question(['question_type' => 'SINGLE_CHOICE']);
        $opt1 = (new QuestionOption(['is_correct' => false]))->forceFill(['id' => 10]);
        $opt2 = (new QuestionOption(['is_correct' => true]))->forceFill(['id' => 20]);
        $question->setRelation('options', collect([$opt1, $opt2]));

        $resCorrect = $this->service->gradeQuestion($question, [20], 1.0);
        $this->assertTrue($resCorrect['is_correct']);
        $this->assertEquals(1.0, $resCorrect['score']);

        $resWrong = $this->service->gradeQuestion($question, [10], 1.0);
        $this->assertFalse($resWrong['is_correct']);
        $this->assertEquals(0.0, $resWrong['score']);
    }

    public function test_true_false_grading_sub_items(): void
    {
        $question = new Question(['question_type' => 'TRUE_FALSE']);
        $optA = new QuestionOption(['id' => 1, 'sub_key' => 'a', 'is_correct' => true]);
        $optB = new QuestionOption(['id' => 2, 'sub_key' => 'b', 'is_correct' => false]);
        $optC = new QuestionOption(['id' => 3, 'sub_key' => 'c', 'is_correct' => true]);
        $optD = new QuestionOption(['id' => 4, 'sub_key' => 'd', 'is_correct' => true]);
        $question->setRelation('options', collect([$optA, $optB, $optC, $optD]));

        // 4/4 correct -> 100% points
        $allCorrect = $this->service->gradeQuestion($question, ['a' => true, 'b' => false, 'c' => true, 'd' => true], 1.0);
        $this->assertTrue($allCorrect['is_correct']);
        $this->assertEquals(1.0, $allCorrect['score']);

        // 2/4 correct -> 25% points
        $partial2 = $this->service->gradeQuestion($question, ['a' => true, 'b' => true, 'c' => false, 'd' => true], 1.0);
        $this->assertFalse($partial2['is_correct']);
        $this->assertEquals(0.25, $partial2['score']);
    }

    public function test_short_answer_grading_tolerances(): void
    {
        $question = new Question(['question_type' => 'SHORT_ANSWER', 'metadata' => ['acceptable_answers' => ['6', '6.0']]]);
        $opt = new QuestionOption(['id' => 1, 'content' => '6', 'is_correct' => true]);
        $question->setRelation('options', collect([$opt]));

        $res1 = $this->service->gradeQuestion($question, '6', 0.5);
        $this->assertTrue($res1['is_correct']);
        $this->assertEquals(0.5, $res1['score']);

        $res2 = $this->service->gradeQuestion($question, '  6,0  ', 0.5);
        $this->assertTrue($res2['is_correct']);
        $this->assertEquals(0.5, $res2['score']);

        $res3 = $this->service->gradeQuestion($question, '7', 0.5);
        $this->assertFalse($res3['is_correct']);
        $this->assertEquals(0.0, $res3['score']);
    }
}
