<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttemptQuestion;
use App\Models\ExamAttempt;
use App\Models\StudentAnswer;
use App\Modules\Attempt\Actions\AutosaveAnswerAction;
use App\Modules\Attempt\Actions\StartAttemptAction;
use App\Modules\Attempt\Actions\SubmitAttemptAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamSessionController extends Controller
{
    /**
     * Start a new exam attempt and generate question snapshot.
     */
    public function startAttempt(
        Request $request,
        int $examId,
        StartAttemptAction $startAction
    ): JsonResponse {
        $result = $startAction->execute($request->user(), $examId);
        return response()->json($result);
    }

    /**
     * Auto-save answer with Backend-enforced timer check.
     */
    public function saveAnswer(
        Request $request,
        int $attemptId,
        AutosaveAnswerAction $autosaveAction
    ): JsonResponse {
        $validated = $request->validate([
            'question_id' => 'required|integer',
            'selected_option_ids' => 'nullable|array',
            'text_answer' => 'nullable|string',
            'sub_answers' => 'nullable|array',
            'is_flagged' => 'nullable|boolean',
            'time_spent_seconds' => 'nullable|integer',
        ]);

        $result = $autosaveAction->execute($request->user(), $attemptId, $validated);
        return response()->json($result);
    }

    /**
     * Submit attempt and grade using snapshot data.
     */
    public function submitAttempt(
        Request $request,
        int $attemptId,
        SubmitAttemptAction $submitAction
    ): JsonResponse {
        $result = $submitAction->execute($request->user(), $attemptId);
        return response()->json($result);
    }

    /**
     * Review attempt with step-by-step snapshot solutions.
     */
    public function reviewAttempt(Request $request, int $attemptId): JsonResponse
    {
        $user = $request->user();
        $attempt = ExamAttempt::with(['exam.examType'])
            ->where('id', $attemptId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $snapshots = AttemptQuestion::where('attempt_id', $attempt->id)
            ->orderBy('order_index')
            ->get();

        $answers = StudentAnswer::where('attempt_id', $attempt->id)->get()->keyBy('question_id');

        $detailedQuestions = $snapshots->map(function ($snap) use ($answers) {
            $studentAns = $answers->get($snap->question_id);
            return [
                'id' => $snap->question_id,
                'order_index' => $snap->order_index,
                'point_value' => (float)$snap->point_value,
                'question_type' => $snap->question_type_snapshot,
                'difficulty_level' => $snap->difficulty_level_snapshot,
                'content' => $snap->content_snapshot,
                'passage' => $snap->passage_snapshot,
                'options' => $snap->options_snapshot,
                'explanation' => $snap->explanation_snapshot,
                'student_answer' => $studentAns ? [
                    'selected_option_ids' => $studentAns->selected_option_ids,
                    'text_answer' => $studentAns->text_answer,
                    'sub_answers' => $studentAns->sub_answers,
                    'is_correct' => (bool)$studentAns->is_correct,
                    'score_awarded' => (float)$studentAns->score_awarded,
                ] : null,
            ];
        });

        return response()->json([
            'attempt' => $attempt,
            'questions' => $detailedQuestions,
        ]);
    }
}
