<?php

namespace App\Modules\Attempt\Actions;

use App\Models\AttemptQuestion;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StartAttemptAction
{
    /**
     * Start a new exam attempt and generate immutable question snapshots.
     */
    public function execute(User $user, int $examId): array
    {
        $exam = Exam::with(['examType'])->findOrFail($examId);

        $durationMinutes = $exam->duration_minutes > 0 ? $exam->duration_minutes : 90;
        $startedAt = Carbon::now();
        $expiresAt = (clone $startedAt)->addMinutes($durationMinutes)->addSeconds(60); // 60s network grace period

        return DB::transaction(function () use ($user, $exam, $startedAt, $expiresAt) {
            // 1. Create Attempt
            $attempt = ExamAttempt::create([
                'user_id' => $user->id,
                'exam_id' => $exam->id,
                'started_at' => $startedAt,
                'expires_at' => $expiresAt,
                'duration_seconds' => 0,
                'score' => 0,
                'max_score' => $exam->total_score,
                'status' => 'IN_PROGRESS',
            ]);

            // 2. Fetch original exam questions
            $examQuestions = DB::table('exam_questions')
                ->join('questions', 'exam_questions.question_id', '=', 'questions.id')
                ->leftJoin('exam_sections', 'exam_questions.section_id', '=', 'exam_sections.id')
                ->where('exam_questions.exam_id', $exam->id)
                ->orderBy('exam_questions.order_index')
                ->select([
                    'questions.*',
                    'exam_questions.order_index as exam_order_index',
                    'exam_questions.point_value as exam_point_value',
                    'exam_sections.name as section_name',
                ])
                ->get();

            $questionIds = $examQuestions->pluck('id')->all();

            // Load options
            $allOptions = DB::table('question_options')
                ->whereIn('question_id', $questionIds)
                ->orderBy('order_index')
                ->get()
                ->groupBy('question_id');

            $publicQuestions = [];

            // 3. Create Snapshots for each question
            foreach ($examQuestions as $q) {
                $optionsForQ = $allOptions->get($q->id, collect());

                // Public options (NO is_correct)
                $publicOptions = $optionsForQ->map(function ($opt) {
                    return [
                        'id' => $opt->id,
                        'content' => $opt->content,
                        'sub_key' => $opt->sub_key,
                        'order_index' => $opt->order_index,
                    ];
                })->values()->all();

                // Private correct answer snapshot
                $correctSnapshot = [];
                if ($q->question_type === 'SINGLE_CHOICE' || $q->question_type === 'MULTIPLE_CHOICE') {
                    $correctSnapshot['correct_option_ids'] = $optionsForQ->where('is_correct', true)->pluck('id')->all();
                } elseif ($q->question_type === 'TRUE_FALSE') {
                    $subAnswers = [];
                    foreach ($optionsForQ as $opt) {
                        $key = $opt->sub_key ?: (string)$opt->id;
                        $subAnswers[$key] = (bool)$opt->is_correct;
                    }
                    $correctSnapshot['sub_answers'] = $subAnswers;
                } elseif ($q->question_type === 'SHORT_ANSWER') {
                    $acceptable = $optionsForQ->pluck('content')->all();
                    $metadata = json_decode($q->metadata ?? '[]', true);
                    if (isset($metadata['acceptable_answers'])) {
                        $acceptable = array_merge($acceptable, $metadata['acceptable_answers']);
                    }
                    $correctSnapshot['acceptable_answers'] = $acceptable;
                }

                // Insert snapshot
                AttemptQuestion::create([
                    'attempt_id' => $attempt->id,
                    'question_id' => $q->id,
                    'section_id' => $q->section_id,
                    'subject_id' => $q->subject_id,
                    'topic_id' => $q->topic_id,
                    'order_index' => $q->exam_order_index,
                    'point_value' => (float)$q->exam_point_value,
                    'question_type_snapshot' => $q->question_type,
                    'difficulty_level_snapshot' => (int)$q->difficulty_level,
                    'content_snapshot' => $q->content,
                    'passage_snapshot' => $q->passage,
                    'options_snapshot' => $publicOptions,
                    'correct_answer_snapshot' => $correctSnapshot,
                    'explanation_snapshot' => $q->explanation,
                    'score_awarded' => 0,
                ]);

                $publicQuestions[] = [
                    'id' => $q->id,
                    'section_id' => $q->section_id,
                    'subject_id' => $q->subject_id,
                    'topic_id' => $q->topic_id,
                    'question_type' => $q->question_type,
                    'difficulty_level' => (int)$q->difficulty_level,
                    'content' => $q->content,
                    'passage' => $q->passage,
                    'order_index' => $q->exam_order_index,
                    'point_value' => (float)$q->exam_point_value,
                    'section_name' => $q->section_name,
                    'options' => $publicOptions,
                ];
            }

            return [
                'attempt' => $attempt,
                'exam' => $exam,
                'questions' => $publicQuestions,
            ];
        });
    }
}
