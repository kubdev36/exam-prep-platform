<?php

namespace App\Modules\Attempt\Actions;

use App\Models\AttemptQuestion;
use App\Models\ExamAttempt;
use App\Models\StudentAnswer;
use App\Models\User;
use App\Modules\Attempt\Events\ExamSubmitted;
use App\Services\GradingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SubmitAttemptAction
{
    protected GradingService $gradingService;

    public function __construct(GradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    /**
     * Submit attempt, calculate score from snapshot data, and dispatch ExamSubmitted event.
     */
    public function execute(User $user, int $attemptId): array
    {
        $attempt = ExamAttempt::with(['exam.examType'])
            ->where('id', $attemptId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($attempt->status === 'SUBMITTED' || $attempt->status === 'GRADED') {
            return [
                'message' => 'Bài thi đã được nộp trước đó.',
                'attempt' => $attempt,
            ];
        }

        return DB::transaction(function () use ($user, $attempt) {
            $snapshots = AttemptQuestion::where('attempt_id', $attempt->id)->get();
            $answers = StudentAnswer::where('attempt_id', $attempt->id)->get()->keyBy('question_id');

            $totalScore = 0.0;
            $correctCount = 0;
            $wrongCount = 0;
            $skippedCount = 0;
            $sectionScores = [];

            foreach ($snapshots as $snap) {
                $pointValue = (float)$snap->point_value;
                $studentAnswer = $answers->get($snap->question_id);

                $sectionKey = 'Phần ' . ($snap->section_id ?: 'Chung');
                if (!isset($sectionScores[$sectionKey])) {
                    $sectionScores[$sectionKey] = [
                        'name' => $sectionKey,
                        'earned_score' => 0.0,
                        'max_score' => 0.0,
                        'correct' => 0,
                        'total' => 0,
                    ];
                }
                $sectionScores[$sectionKey]['max_score'] += $pointValue;
                $sectionScores[$sectionKey]['total'] += 1;

                if (!$studentAnswer) {
                    $skippedCount++;
                    continue;
                }

                // Grade using snapshot
                $gradeResult = $this->gradeFromSnapshot($snap, $studentAnswer, $pointValue);

                $studentAnswer->is_correct = $gradeResult['is_correct'];
                $studentAnswer->score_awarded = $gradeResult['score'];
                $studentAnswer->save();

                $snap->score_awarded = $gradeResult['score'];
                $snap->save();

                $totalScore += $gradeResult['score'];
                $sectionScores[$sectionKey]['earned_score'] += $gradeResult['score'];

                if ($gradeResult['is_correct']) {
                    $correctCount++;
                    $sectionScores[$sectionKey]['correct'] += 1;
                } else {
                    $wrongCount++;
                }
            }

            $durationSeconds = $attempt->started_at ? Carbon::now()->diffInSeconds($attempt->started_at) : 0;

            $attempt->update([
                'submitted_at' => Carbon::now(),
                'duration_seconds' => $durationSeconds,
                'score' => round($totalScore, 2),
                'correct_count' => $correctCount,
                'wrong_count' => $wrongCount,
                'skipped_count' => $skippedCount,
                'status' => 'GRADED',
                'section_scores' => $sectionScores,
            ]);

            // Update exam statistics
            $exam = $attempt->exam;
            $exam->increment('attempts_count');
            $avgScore = ExamAttempt::where('exam_id', $exam->id)->whereIn('status', ['SUBMITTED', 'GRADED'])->avg('score');
            $exam->update(['average_score' => round($avgScore, 2)]);

            // Dispatch Event
            event(new ExamSubmitted($attempt, $user));

            return [
                'message' => 'Nộp bài và chấm điểm thành công',
                'attempt' => $attempt,
            ];
        });
    }

    protected function gradeFromSnapshot(AttemptQuestion $snap, StudentAnswer $studentAnswer, float $point): array
    {
        $type = $snap->question_type_snapshot;
        $correctSnapshot = $snap->correct_answer_snapshot;

        if ($type === 'SINGLE_CHOICE') {
            $selectedId = $studentAnswer->selected_option_ids[0] ?? null;
            $correctIds = $correctSnapshot['correct_option_ids'] ?? [];
            $isCorrect = $selectedId && in_array($selectedId, $correctIds);
            return ['is_correct' => $isCorrect, 'score' => $isCorrect ? $point : 0.0];
        }

        if ($type === 'MULTIPLE_CHOICE') {
            $selected = array_map('intval', $studentAnswer->selected_option_ids ?? []);
            $correct = array_map('intval', $correctSnapshot['correct_option_ids'] ?? []);
            sort($selected);
            sort($correct);
            $isCorrect = ($selected === $correct);
            return ['is_correct' => $isCorrect, 'score' => $isCorrect ? $point : 0.0];
        }

        if ($type === 'TRUE_FALSE') {
            $studentSub = $studentAnswer->sub_answers ?? [];
            $correctSub = $correctSnapshot['sub_answers'] ?? [];
            $matchedCount = 0;
            $totalSub = count($correctSub);

            foreach ($correctSub as $k => $cVal) {
                if (isset($studentSub[$k]) && (bool)$studentSub[$k] === (bool)$cVal) {
                    $matchedCount++;
                }
            }

            $multiplier = match ($matchedCount) {
                4 => 1.0,
                3 => 0.5,
                2 => 0.25,
                1 => 0.1,
                default => 0.0,
            };

            if ($totalSub < 4 && $totalSub > 0) {
                $multiplier = $matchedCount / $totalSub;
            }

            return [
                'is_correct' => ($matchedCount === $totalSub && $totalSub > 0),
                'score' => round($point * $multiplier, 2),
            ];
        }

        if ($type === 'SHORT_ANSWER') {
            $userAns = strtolower(trim(str_replace(',', '.', $studentAnswer->text_answer ?? '')));
            $acceptable = array_map(fn($v) => strtolower(trim(str_replace(',', '.', (string)$v))), $correctSnapshot['acceptable_answers'] ?? []);
            $isCorrect = in_array($userAns, $acceptable, true);

            if (!$isCorrect && is_numeric($userAns)) {
                $userFloat = (float)$userAns;
                foreach ($acceptable as $acc) {
                    if (is_numeric($acc) && abs($userFloat - (float)$acc) < 0.0001) {
                        $isCorrect = true;
                        break;
                    }
                }
            }

            return ['is_correct' => $isCorrect, 'score' => $isCorrect ? $point : 0.0];
        }

        return ['is_correct' => false, 'score' => 0.0];
    }
}
