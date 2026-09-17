<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Services\DocumentParser\DocxExtractor;
use App\Services\DocumentParser\ExamStructureParser;
use App\Services\DocumentParser\PdfExtractor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ExamImportController extends Controller
{
    protected DocxExtractor $docxExtractor;
    protected PdfExtractor $pdfExtractor;
    protected ExamStructureParser $structureParser;

    public function __construct(
        DocxExtractor $docxExtractor,
        PdfExtractor $pdfExtractor,
        ExamStructureParser $structureParser
    ) {
        $this->docxExtractor = $docxExtractor;
        $this->pdfExtractor = $pdfExtractor;
        $this->structureParser = $structureParser;
    }

    /**
     * Parse document (PDF / Word / TXT / Raw Text) into structured exam questions preview.
     */
    public function parseDocument(Request $request): JsonResponse
    {
        $rawText = '';

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());

            if ($extension === 'docx') {
                $rawText = $this->docxExtractor->extractText($file->getRealPath());
            } elseif ($extension === 'pdf') {
                $rawText = $this->pdfExtractor->extractText($file->getRealPath());
            } elseif ($extension === 'txt') {
                $rawText = file_get_contents($file->getRealPath());
            } else {
                return response()->json(['message' => 'Định dạng file không được hỗ trợ. Vui lòng tải file .docx, .pdf hoặc .txt.'], 422);
            }
        } elseif ($request->filled('raw_text')) {
            $rawText = $request->input('raw_text');
        } else {
            return response()->json(['message' => 'Vui lòng cung cấp file đề thi hoặc dán nội dung văn bản.'], 422);
        }

        if (empty(trim($rawText))) {
            return response()->json(['message' => 'Không thể đọc nội dung văn bản từ file. Vui lòng kiểm tra lại file của bạn.'], 422);
        }

        $parseResult = $this->structureParser->parse($rawText);

        return response()->json([
            'status' => 'success',
            'raw_text_length' => strlen($rawText),
            'title' => $parseResult['title'],
            'questions' => $parseResult['questions'],
            'total_questions' => count($parseResult['questions']),
        ]);
    }

    /**
     * Persist confirmed imported exam & questions into PostgreSQL database.
     */
    public function saveImportedExam(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'exam_type_id' => 'required|exists:exam_types,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:5|max:300',
            'total_score' => 'required|numeric|min:1',
            'questions' => 'required|array|min:1',
            'questions.*.content' => 'required|string',
            'questions.*.question_type' => 'required|string|in:SINGLE_CHOICE,MULTIPLE_CHOICE,TRUE_FALSE,SHORT_ANSWER',
            'questions.*.difficulty_level' => 'nullable|integer|between:1,4',
            'questions.*.point_value' => 'nullable|numeric',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.options' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated) {
            $examType = ExamType::findOrFail($validated['exam_type_id']);
            $questionsData = $validated['questions'];
            $totalQuestionsCount = count($questionsData);

            // 1. Create Exam
            $exam = Exam::create([
                'exam_type_id' => $examType->id,
                'subject_id' => $validated['subject_id'] ?? null,
                'title' => $validated['title'],
                'slug' => Str::slug($validated['title']) . '-' . uniqid(),
                'type' => 'MOCK_TEST',
                'year' => date('Y'),
                'duration_minutes' => $validated['duration_minutes'],
                'total_questions' => $totalQuestionsCount,
                'total_score' => $validated['total_score'],
                'description' => 'Đề thi tải lên tự động qua hệ thống trích xuất thông minh OmniExam.',
                'is_published' => true,
            ]);

            // 2. Create Questions & Options & Pivot
            $defaultPoint = $totalQuestionsCount > 0 ? ($validated['total_score'] / $totalQuestionsCount) : 1.0;

            foreach ($questionsData as $idx => $qData) {
                $pointValue = isset($qData['point_value']) && $qData['point_value'] > 0
                    ? (float)$qData['point_value']
                    : (float)$defaultPoint;

                $question = Question::create([
                    'exam_type_id' => $examType->id,
                    'subject_id' => $validated['subject_id'] ?? null,
                    'question_type' => $qData['question_type'],
                    'difficulty_level' => $qData['difficulty_level'] ?? 2,
                    'content' => $qData['content'],
                    'explanation' => $qData['explanation'] ?? null,
                    'points' => $pointValue,
                    'is_active' => true,
                ]);

                // Create options
                if (!empty($qData['options']) && is_array($qData['options'])) {
                    foreach ($qData['options'] as $oIdx => $opt) {
                        QuestionOption::create([
                            'question_id' => $question->id,
                            'sub_key' => $opt['sub_key'] ?? null,
                            'content' => $opt['content'] ?? '',
                            'is_correct' => filter_var($opt['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN),
                            'order_index' => $oIdx + 1,
                        ]);
                    }
                }

                // Link to Exam
                ExamQuestion::create([
                    'exam_id' => $exam->id,
                    'question_id' => $question->id,
                    'order_index' => $idx + 1,
                    'point_value' => $pointValue,
                ]);
            }

            return response()->json([
                'message' => 'Đã chuyển đổi và tạo đề thi trực tuyến thành công!',
                'exam_id' => $exam->id,
                'exam' => $exam,
            ], 201);
        });
    }
}
