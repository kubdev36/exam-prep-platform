<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSection;
use App\Models\ExamType;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamCatalogController extends Controller
{
    /**
     * Get all active exam types with basic info.
     */
    public function getExamTypes(): JsonResponse
    {
        $examTypes = ExamType::where('is_active', true)
            ->withCount(['exams', 'questions'])
            ->orderBy('order_index')
            ->get();

        return response()->json([
            'data' => $examTypes,
        ]);
    }

    /**
     * Get detail of a specific exam type (including its sections, subjects, topic tree).
     */
    public function getExamTypeDetail(string $codeOrSlug): JsonResponse
    {
        $examType = ExamType::where('code', strtoupper($codeOrSlug))
            ->orWhere('slug', $codeOrSlug)
            ->with([
                'sections' => function ($q) {
                    $q->with(['subjects.topics.children']);
                },
                'subjects' => function ($q) {
                    $q->with(['topics.children']);
                },
                'templates',
            ])
            ->firstOrFail();

        return response()->json([
            'data' => $examType,
        ]);
    }

    /**
     * Get subjects of an exam type.
     */
    public function getSubjects(Request $request, string $examCode): JsonResponse
    {
        $examType = ExamType::where('code', strtoupper($examCode))->firstOrFail();
        
        $subjects = Subject::where('exam_type_id', $examType->id)
            ->with(['topics.children'])
            ->withCount('questions')
            ->orderBy('order_index')
            ->get();

        return response()->json([
            'data' => $subjects,
        ]);
    }

    /**
     * Get topic hierarchy with question counts.
     */
    public function getTopicsBySubject(int $subjectId): JsonResponse
    {
        $subject = Subject::with(['topics' => function ($q) {
            $q->with(['children' => function ($c) {
                $c->withCount('questions');
            }])->withCount('questions');
        }])->findOrFail($subjectId);

        return response()->json([
            'data' => $subject,
        ]);
    }
}
