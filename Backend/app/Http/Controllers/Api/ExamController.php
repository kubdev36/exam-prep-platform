<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * List exams filtered by exam_type, type (MOCK_TEST / OFFICIAL_YEAR / PRACTICE), subject.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Exam::with(['examType', 'subject', 'template'])
            ->where('is_published', true);

        if ($request->filled('exam_type')) {
            $examTypeCode = strtoupper($request->query('exam_type'));
            $query->whereHas('examType', function ($q) use ($examTypeCode) {
                $q->where('code', $examTypeCode)->orWhere('slug', strtolower($examTypeCode));
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->query('subject_id'));
        }

        if ($request->filled('year')) {
            $query->where('year', $request->query('year'));
        }

        $exams = $query->orderBy('created_at', 'desc')->paginate($request->query('per_page', 12));

        return response()->json($exams);
    }

    /**
     * Get single exam summary & metadata (without revealing correct answers before attempt).
     */
    public function show(int $id): JsonResponse
    {
        $exam = Exam::with(['examType', 'subject', 'template'])
            ->withCount('questions')
            ->findOrFail($id);

        return response()->json([
            'data' => $exam,
        ]);
    }
}
