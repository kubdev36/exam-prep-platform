<?php

namespace App\Modules\Analytics\Listeners;

use App\Models\AttemptQuestion;
use App\Models\StudentAnswer;
use App\Models\UserTopicStatistic;
use App\Modules\Attempt\Events\ExamSubmitted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;

class UpdateTopicStatisticsListener
{
    /**
     * Handle the event.
     */
    public function handle(ExamSubmitted $event): void
    {
        $attempt = $event->attempt;
        $user = $event->user;

        $snapshots = AttemptQuestion::where('attempt_id', $attempt->id)->get();
        $answers = StudentAnswer::where('attempt_id', $attempt->id)->get()->keyBy('question_id');

        // Group by topic
        $byTopic = $snapshots->whereNotNull('topic_id')->groupBy('topic_id');

        foreach ($byTopic as $topicId => $topicQuestions) {
            $totalInAttempt = $topicQuestions->count();
            $correctInAttempt = 0;
            $sample = $topicQuestions->first();

            foreach ($topicQuestions as $qSnap) {
                $ans = $answers->get($qSnap->question_id);
                if ($ans && $ans->is_correct) {
                    $correctInAttempt++;
                }
            }

            $stat = UserTopicStatistic::firstOrNew([
                'user_id' => $user->id,
                'topic_id' => $topicId,
            ]);

            $stat->subject_id = $sample->subject_id;
            $stat->exam_type_id = $attempt->exam->exam_type_id;
            $stat->total_questions += $totalInAttempt;
            $stat->correct_questions += $correctInAttempt;
            $stat->accuracy_rate = $stat->total_questions > 0
                ? round(($stat->correct_questions / $stat->total_questions) * 100, 2)
                : 0.0;
            $stat->save();
        }
    }
}
