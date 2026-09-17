<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ExamType;
use App\Models\StudentAnswer;
use App\Models\WrongQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get user dashboard statistics and score gap analysis.
     */
    public function getSummary(Request $request): JsonResponse
    {
        $user = $request->user() ?? \App\Models\User::first();
        if (!$user) {
            return response()->json(['message' => 'No user found'], 404);
        }

        // Total attempts
        $totalAttempts = ExamAttempt::where('user_id', $user->id)->where('status', 'SUBMITTED')->count();

        // Recent attempts
        $recentAttempts = ExamAttempt::with(['exam.examType'])
            ->where('user_id', $user->id)
            ->where('status', 'SUBMITTED')
            ->orderBy('submitted_at', 'desc')
            ->take(5)
            ->get();

        // Average scores per exam type
        $examTypes = ExamType::where('is_active', true)->get();
        $examStats = [];

        foreach ($examTypes as $et) {
            $avgScore = ExamAttempt::where('user_id', $user->id)
                ->where('status', 'SUBMITTED')
                ->whereHas('exam', fn($q) => $q->where('exam_type_id', $et->id))
                ->avg('score');

            $attemptsCount = ExamAttempt::where('user_id', $user->id)
                ->where('status', 'SUBMITTED')
                ->whereHas('exam', fn($q) => $q->where('exam_type_id', $et->id))
                ->count();

            $target = $user->target_scores[$et->code] ?? null;

            $examStats[$et->code] = [
                'code' => $et->code,
                'name' => $et->name,
                'max_score' => $et->max_score,
                'current_score' => $avgScore ? round($avgScore, 1) : null,
                'target_score' => $target,
                'attempts_count' => $attemptsCount,
            ];
        }

        // Wrong questions count
        $wrongCount = WrongQuestion::where('user_id', $user->id)->where('is_mastered', false)->count();

        // Weak topics recommendation
        $weakTopics = DB::table('wrong_questions')
            ->join('questions', 'wrong_questions.question_id', '=', 'questions.id')
            ->join('topics', 'questions.topic_id', '=', 'topics.id')
            ->join('subjects', 'questions.subject_id', '=', 'subjects.id')
            ->where('wrong_questions.user_id', $user->id)
            ->where('wrong_questions.is_mastered', false)
            ->select([
                'topics.id as topic_id',
                'topics.name as topic_name',
                'subjects.name as subject_name',
                'subjects.color as subject_color',
                DB::raw('COUNT(wrong_questions.id) as wrong_count')
            ])
            ->groupBy('topics.id', 'topics.name', 'subjects.name', 'subjects.color')
            ->orderByDesc('wrong_count')
            ->take(4)
            ->get();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'current_exam_code' => $user->current_exam_code,
                'target_scores' => $user->target_scores,
            ],
            'total_attempts' => $totalAttempts,
            'wrong_count' => $wrongCount,
            'exam_stats' => $examStats,
            'recent_attempts' => $recentAttempts,
            'weak_topics' => $weakTopics,
        ]);
    }
}
