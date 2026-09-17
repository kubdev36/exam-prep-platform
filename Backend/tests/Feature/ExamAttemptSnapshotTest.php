<?php

namespace Tests\Feature;

use App\Models\AttemptQuestion;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\User;
use App\Models\UserTopicStatistic;
use App\Models\WrongQuestion;
use App\Modules\Attempt\Actions\AutosaveAnswerAction;
use App\Modules\Attempt\Actions\StartAttemptAction;
use App\Modules\Attempt\Actions\SubmitAttemptAction;
use App\Services\GradingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamAttemptSnapshotTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_start_attempt_generates_immutable_question_snapshots(): void
    {
        $user = User::first();
        $exam = Exam::first();

        $startAction = new StartAttemptAction();
        $res = $startAction->execute($user, $exam->id);

        $attempt = $res['attempt'];
        $this->assertNotNull($attempt->id);
        $this->assertNotNull($attempt->expires_at);
        $this->assertEquals('IN_PROGRESS', $attempt->status);

        // Verify attempt_questions snapshot exists
        $snapshots = AttemptQuestion::where('attempt_id', $attempt->id)->get();
        $this->assertGreaterThan(0, $snapshots->count());

        $firstSnap = $snapshots->first();
        $this->assertNotEmpty($firstSnap->content_snapshot);
        $this->assertIsArray($firstSnap->options_snapshot);
        $this->assertIsArray($firstSnap->correct_answer_snapshot);
    }

    public function test_submit_attempt_calculates_score_and_updates_topic_analytics(): void
    {
        $user = User::first();
        $exam = Exam::first();

        $startAction = new StartAttemptAction();
        $startRes = $startAction->execute($user, $exam->id);
        $attempt = $startRes['attempt'];
        $questions = $startRes['questions'];

        $firstQ = $questions[0];

        // Save answer for first question
        $autosaveAction = new AutosaveAnswerAction();
        // Look up correct option from snapshot
        $snap = AttemptQuestion::where('attempt_id', $attempt->id)->where('question_id', $firstQ['id'])->first();
        $correctIds = $snap->correct_answer_snapshot['correct_option_ids'] ?? [];

        $autosaveAction->execute($user, $attempt->id, [
            'question_id' => $firstQ['id'],
            'selected_option_ids' => $correctIds,
        ]);

        // Submit attempt
        $submitAction = new SubmitAttemptAction(new GradingService());
        $submitRes = $submitAction->execute($user, $attempt->id);

        $this->assertEquals('GRADED', $submitRes['attempt']->status);
        $this->assertGreaterThan(0, $submitRes['attempt']->score);

        // Verify Event Listener updated topic statistics
        $topicStats = UserTopicStatistic::where('user_id', $user->id)->get();
        $this->assertGreaterThan(0, $topicStats->count());

        // Verify wrong questions recorded for skipped/unanswered questions
        $wrong = WrongQuestion::where('user_id', $user->id)->get();
        $this->assertGreaterThan(0, $wrong->count());
    }
}
