<?php

namespace App\Modules\Analytics\Listeners;

use App\Models\AttemptQuestion;
use App\Models\StudentAnswer;
use App\Models\WrongQuestion;
use App\Modules\Attempt\Events\ExamSubmitted;
use Carbon\Carbon;

class UpdateWrongQuestionsListener
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

        foreach ($snapshots as $snap) {
            if (!$snap->question_id) continue;

            $ans = $answers->get($snap->question_id);
            $isCorrect = $ans && $ans->is_correct;

            if (!$isCorrect) {
                $record = WrongQuestion::where('user_id', $user->id)
                    ->where('question_id', $snap->question_id)
                    ->first();

                if ($record) {
                    $record->update([
                        'attempt_id' => $attempt->id,
                        'last_answered_at' => Carbon::now(),
                        'is_mastered' => false,
                        'wrong_count' => $record->wrong_count + 1,
                    ]);
                } else {
                    WrongQuestion::create([
                        'user_id' => $user->id,
                        'question_id' => $snap->question_id,
                        'exam_type_id' => $attempt->exam->exam_type_id,
                        'attempt_id' => $attempt->id,
                        'last_answered_at' => Carbon::now(),
                        'is_mastered' => false,
                        'wrong_count' => 1,
                    ]);
                }
            }
        }
    }
}
