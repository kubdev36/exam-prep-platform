<?php

namespace App\Modules\Attempt\Actions;

use App\Models\ExamAttempt;
use App\Models\StudentAnswer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AutosaveAnswerAction
{
    /**
     * Auto-save a student answer with Backend Timer enforcement.
     */
    public function execute(User $user, int $attemptId, array $data): array
    {
        $attempt = ExamAttempt::where('id', $attemptId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Check if attempt is already finalized
        if ($attempt->status === 'SUBMITTED' || $attempt->status === 'GRADED') {
            return [
                'status' => 'already_submitted',
                'message' => 'Bài thi đã nộp, không thể lưu thêm đáp án.',
            ];
        }

        // Backend-enforced Timer Validation
        if ($attempt->expires_at && Carbon::now()->greaterThan($attempt->expires_at)) {
            $attempt->update(['status' => 'EXPIRED']);
            return [
                'status' => 'expired',
                'message' => 'Hết thời gian làm bài.',
            ];
        }

        $answer = StudentAnswer::updateOrCreate(
            [
                'attempt_id' => $attempt->id,
                'question_id' => $data['question_id'],
            ],
            [
                'selected_option_ids' => $data['selected_option_ids'] ?? null,
                'text_answer' => $data['text_answer'] ?? null,
                'sub_answers' => $data['sub_answers'] ?? null,
                'is_flagged' => $data['is_flagged'] ?? false,
                'time_spent_seconds' => $data['time_spent_seconds'] ?? 0,
            ]
        );

        return [
            'status' => 'saved',
            'answer_id' => $answer->id,
            'remaining_seconds' => max(0, $attempt->expires_at ? Carbon::now()->diffInSeconds($attempt->expires_at, false) : 0),
        ];
    }
}
