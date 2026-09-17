<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\QuestionBookmark;
use App\Models\WrongQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PracticeController extends Controller
{
    /**
     * Generate a quick practice set of 10-20 questions.
     */
    public function quickPractice(Request $request): JsonResponse
    {
        $user = $request->user() ?? \App\Models\User::first();
        if (!$user) {
            return response()->json(['message' => 'No user found'], 404);
        }
        $examCode = strtoupper($request->query('exam_code', 'THPT'));
        $count = (int)$request->query('count', 10);
        $subjectId = $request->query('subject_id');
        $topicId = $request->query('topic_id');

        $examType = ExamType::where('code', $examCode)->firstOrFail();

        $query = Question::where('exam_type_id', $examType->id)
            ->where('is_active', true);

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }
        if ($topicId) {
            $query->where('topic_id', $topicId);
        }

        $questions = $query->inRandomOrder()->take($count)->get();

        if ($questions->isEmpty()) {
            return response()->json(['message' => 'Chưa có đủ câu hỏi trong hệ thống'], 404);
        }

        // Create a custom practice Exam record
        $exam = Exam::create([
            'exam_type_id' => $examType->id,
            'title' => 'Luyện tập nhanh ' . $examType->code . ' (' . $questions->count() . ' câu)',
            'slug' => 'quick-practice-' . uniqid(),
            'type' => 'PRACTICE_CUSTOM',
            'duration_minutes' => max(10, (int)($questions->count() * 1.8)),
            'total_questions' => $questions->count(),
            'total_score' => $questions->count() * 1.0,
            'is_published' => false,
        ]);

        foreach ($questions as $index => $q) {
            DB::table('exam_questions')->insert([
                'exam_id' => $exam->id,
                'question_id' => $q->id,
                'section_id' => $q->section_id,
                'order_index' => $index + 1,
                'point_value' => 1.0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create attempt immediately
        $attempt = ExamAttempt::create([
            'user_id' => $user->id,
            'exam_id' => $exam->id,
            'started_at' => now(),
            'duration_seconds' => 0,
            'score' => 0,
            'max_score' => $exam->total_score,
            'status' => 'IN_PROGRESS',
        ]);

        return response()->json([
            'exam_id' => $exam->id,
            'attempt_id' => $attempt->id,
        ]);
    }

    /**
     * Get list of wrong questions for the user.
     */
    public function getWrongQuestions(Request $request): JsonResponse
    {
        $user = $request->user() ?? \App\Models\User::first();
        if (!$user) {
            return response()->json(['data' => []]);
        }
        $examCode = $request->query('exam_code');

        $query = WrongQuestion::with(['question.options', 'question.subject', 'question.topic', 'examType'])
            ->where('user_id', $user->id);

        if ($examCode && strtoupper($examCode) !== 'ALL') {
            $query->whereHas('examType', fn($q) => $q->where('code', strtoupper($examCode)));
        }

        if ($request->filled('is_mastered')) {
            $query->where('is_mastered', filter_var($request->query('is_mastered'), FILTER_VALIDATE_BOOLEAN));
        }

        $wrongList = $query->orderBy('last_answered_at', 'desc')->paginate(15);

        return response()->json($wrongList);
    }

    /**
     * Mark a wrong question as mastered.
     */
    public function toggleMastered(Request $request, int $questionId): JsonResponse
    {
        $user = $request->user() ?? \App\Models\User::first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $record = WrongQuestion::where('user_id', $user->id)
            ->where('question_id', $questionId)
            ->first();

        if (!$record) {
            // If doesn't exist, create it as mastered
            $question = Question::find($questionId);
            $record = WrongQuestion::create([
                'user_id' => $user->id,
                'question_id' => $questionId,
                'exam_type_id' => $question?->exam_type_id ?? 1,
                'is_mastered' => true,
                'wrong_count' => 1,
                'last_answered_at' => now(),
            ]);
            return response()->json([
                'message' => 'Đã chuyển vào mục đã thành thạo',
                'is_mastered' => true,
            ]);
        }

        $record->is_mastered = !$record->is_mastered;
        $record->save();

        return response()->json([
            'message' => $record->is_mastered ? 'Đã chuyển vào mục đã thành thạo' : 'Đã đưa lại vào sổ câu sai',
            'is_mastered' => $record->is_mastered,
        ]);
    }

    /**
     * Toggle bookmark for a question.
     */
    public function toggleBookmark(Request $request, int $questionId): JsonResponse
    {
        $user = $request->user() ?? \App\Models\User::first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $bookmark = QuestionBookmark::where('user_id', $user->id)
            ->where('question_id', $questionId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            return response()->json(['bookmarked' => false, 'message' => 'Đã bỏ lưu câu hỏi']);
        }

        QuestionBookmark::create([
            'user_id' => $user->id,
            'question_id' => $questionId,
            'note' => $request->input('note'),
        ]);

        return response()->json(['bookmarked' => true, 'message' => 'Đã lưu vào danh sách yêu thích']);
    }

    /**
     * Get bookmarked questions.
     */
    public function getBookmarks(Request $request): JsonResponse
    {
        $user = $request->user() ?? \App\Models\User::first();
        if (!$user) {
            return response()->json(['data' => []]);
        }
        $bookmarks = QuestionBookmark::with(['question.options', 'question.subject', 'question.topic', 'question.examType'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($bookmarks);
    }
}
