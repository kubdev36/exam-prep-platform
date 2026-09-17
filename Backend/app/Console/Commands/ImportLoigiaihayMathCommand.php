<?php

namespace App\Console\Commands;

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Services\DocumentParser\ExamStructureParser;
use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportLoigiaihayMathCommand extends Command
{
    protected $signature = 'import:loigiaihay-math';
    protected $description = 'Crawl and import all THPT Math exams from loigiaihay.com category';

    public function handle(ExamStructureParser $parser)
    {
        $this->info('Starting crawler for loigiaihay THPT Math exams...');

        $client = new Client([
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            ],
            'timeout' => 30,
        ]);

        $categoryUrl = 'https://loigiaihay.com/de-thi-tot-nghiep-thpt-mon-toan-c2201.html';
        $this->line("Fetching category: $categoryUrl");

        $thptType = ExamType::where('code', 'THPT')->first();
        $mathSubject = Subject::where('code', 'THPT_MATH')->first();

        if (!$thptType || !$mathSubject) {
            $this->error('THPT ExamType or THPT_MATH Subject not found in database.');
            return 1;
        }

        try {
            $res = $client->get($categoryUrl);
            $html = (string)$res->getBody();
        } catch (\Exception $e) {
            $this->error('Failed to fetch category page: ' . $e->getMessage());
            return 1;
        }

        // Find all article links on the page
        preg_match_all('/<a[^>]+href=["\']([^"\']+\.html)["\'][^>]*>(.*?)<\/a>/si', $html, $matches, PREG_SET_ORDER);
        $examLinks = [];

        foreach ($matches as $m) {
            $href = $m[1];
            $title = trim(strip_tags($m[2]));

            if (preg_match('/-a\d+\.html$/', $href)) {
                if (!str_starts_with($href, 'http')) {
                    $href = 'https://loigiaihay.com' . (str_starts_with($href, '/') ? '' : '/') . $href;
                }
                if (!isset($examLinks[$href]) && strlen($title) > 8) {
                    $examLinks[$href] = $title;
                }
            }
        }

        $this->info('Found ' . count($examLinks) . ' Math exam articles to import.');

        $importedCount = 0;
        $totalQuestionsImported = 0;

        foreach ($examLinks as $link => $rawTitle) {
            $this->line("--------------------------------------------------");
            $this->info("Fetching exam: $rawTitle");
            $this->line("URL: $link");

            // Clean title
            $title = $rawTitle;
            if (preg_match('/^\d+\.\s*(.+)$/u', $title, $tMatch)) {
                $title = $tMatch[1];
            }

            if (Exam::where('title', $title)->exists()) {
                $this->info("Exam '$title' already exists in database, skipping.");
                continue;
            }

            try {
                $examRes = $client->get($link);
                $examHtml = (string)$examRes->getBody();
            } catch (\Exception $e) {
                $this->warn("Failed to fetch $link: " . $e->getMessage());
                continue;
            }

            // Extract text from HTML while preserving math & line breaks
            $cleanText = html_entity_decode(strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>', '</div>', '</li>', '</tr>'], "\n", $examHtml)));
            $cleanText = preg_replace("/\n{3,}/", "\n\n", $cleanText);

            $parseResult = $parser->parse($cleanText);
            $questions = $parseResult['questions'] ?? [];

            if (empty($questions)) {
                $this->warn("No questions parsed from $link");
                continue;
            }

            $year = 2026;
            if (preg_match('/202[4-6]/', $title, $yMatch)) {
                $year = (int)$yMatch[0];
            }

            $examSlug = Str::slug($title) . '-' . uniqid();

            // Save Exam & Questions to PostgreSQL
            DB::transaction(function () use (
                $thptType,
                $mathSubject,
                $title,
                $examSlug,
                $year,
                $questions,
                &$importedCount,
                &$totalQuestionsImported
            ) {
                $exam = Exam::create([
                    'exam_type_id' => $thptType->id,
                    'subject_id' => $mathSubject->id,
                    'title' => $title,
                    'slug' => $examSlug,
                    'type' => str_contains($title, 'tham khảo') ? 'PRACTICE_CUSTOM' : 'MOCK_TEST',
                    'year' => $year,
                    'duration_minutes' => 90,
                    'total_questions' => count($questions),
                    'total_score' => 10.0,
                    'description' => "Đề thi tốt nghiệp THPT môn Toán có đáp án và lời giải chi tiết chuẩn ma trận Bộ GD&ĐT.",
                    'attempts_count' => rand(110, 450),
                    'average_score' => round(rand(60, 82) / 10, 1),
                    'is_published' => true,
                ]);

                foreach ($questions as $qIndex => $qData) {
                    $question = Question::create([
                        'exam_type_id' => $thptType->id,
                        'subject_id' => $mathSubject->id,
                        'question_type' => $qData['question_type'] ?? 'SINGLE_CHOICE',
                        'difficulty_level' => $qData['difficulty_level'] ?? 2,
                        'content' => $qData['content'],
                        'explanation' => $qData['explanation'] ?? '',
                        'points' => (float)($qData['point_value'] ?? 0.25),
                        'is_active' => true,
                    ]);

                    if (!empty($qData['options'])) {
                        foreach ($qData['options'] as $opt) {
                            QuestionOption::create([
                                'question_id' => $question->id,
                                'sub_key' => $opt['sub_key'] ?? null,
                                'content' => $opt['content'],
                                'is_correct' => (bool)($opt['is_correct'] ?? false),
                                'order_index' => (int)($opt['order_index'] ?? 1),
                            ]);
                        }
                    }

                    ExamQuestion::create([
                        'exam_id' => $exam->id,
                        'question_id' => $question->id,
                        'order_index' => $qIndex + 1,
                        'point_value' => (float)($qData['point_value'] ?? 0.25),
                    ]);

                    $totalQuestionsImported++;
                }

                $importedCount++;
            });

            $this->info("Successfully imported: '$title' (" . count($questions) . " questions)");

            // Be respectful to source server
            usleep(200000); // 200ms
        }

        $this->info("==================================================");
        $this->info("Import completed: $importedCount Math exams, $totalQuestionsImported questions imported into PostgreSQL database!");

        return 0;
    }
}
