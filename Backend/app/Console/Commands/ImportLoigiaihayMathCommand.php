<?php

namespace App\Console\Commands;

use App\Models\AttemptQuestion;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\StudentAnswer;
use App\Models\Subject;
use App\Services\CloudinaryService;
use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportLoigiaihayMathCommand extends Command
{
    protected $signature = 'import:loigiaihay-math {--fresh : Delete existing Math exams before importing} {--limit= : Limit number of exams to import}';
    protected $description = 'Crawl and import high-precision THPT Math exams with Cloudinary illustration diagrams and True/False/Short Answer structure from loigiaihay.com';

    public function handle()
    {
        $this->info('Starting high-precision crawler for THPT Math exams with Cloudinary diagrams & LaTeX formulas...');

        $client = new Client([
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            ],
            'timeout' => 30,
            'verify' => false,
        ]);

        $cloudinary = new CloudinaryService();

        $thptType = ExamType::where('code', 'THPT')->first();
        $mathSubject = Subject::where('code', 'THPT_MATH')->first();

        if (!$thptType || !$mathSubject) {
            $this->error('THPT ExamType or THPT_MATH Subject not found in database.');
            return 1;
        }

        if ($this->option('fresh')) {
            $this->warn('Fresh option enabled: Purging existing Math exams and questions...');
            $existingMathExams = Exam::where('subject_id', $mathSubject->id)->get();
            foreach ($existingMathExams as $oldExam) {
                $attempts = ExamAttempt::where('exam_id', $oldExam->id)->get();
                foreach ($attempts as $att) {
                    AttemptQuestion::where('attempt_id', $att->id)->delete();
                    StudentAnswer::where('attempt_id', $att->id)->delete();
                    $att->delete();
                }
                $qIds = ExamQuestion::where('exam_id', $oldExam->id)->pluck('question_id')->all();
                ExamQuestion::where('exam_id', $oldExam->id)->delete();
                QuestionOption::whereIn('question_id', $qIds)->delete();
                Question::whereIn('id', $qIds)->delete();
                $oldExam->delete();
            }
            $this->info('Purged old Math exams successfully.');
        }

        // Collect all exam links from catalog
        $catalogUrls = [
            'https://loigiaihay.com/de-thi-tot-nghiep-thpt-mon-toan-c2201.html',
        ];

        $examLinks = [];
        foreach ($catalogUrls as $cUrl) {
            try {
                $res = $client->get($cUrl);
                $html = (string)$res->getBody();
                preg_match_all('/<a[^>]+href=["\']([^"\']+\.html)["\'][^>]*>(.*?)<\/a>/si', $html, $matches, PREG_SET_ORDER);
                foreach ($matches as $m) {
                    $href = $m[1];
                    $title = trim(strip_tags($m[2]));
                    if (preg_match('/-a\d+\.html$/', $href)) {
                        if (!str_starts_with($href, 'http')) {
                            $href = 'https://loigiaihay.com' . (str_starts_with($href, '/') ? '' : '/') . $href;
                        }
                        if (!isset($examLinks[$href]) && strlen($title) > 8 && !str_contains($title, 'Quảng cáo') && !str_contains($title, 'Tải về')) {
                            $examLinks[$href] = $title;
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->warn("Failed to scan $cUrl: " . $e->getMessage());
            }
        }

        $limit = $this->option('limit') ? (int)$this->option('limit') : count($examLinks);
        $this->info('Found total ' . count($examLinks) . " Math exam articles to import (Limit: $limit).");

        $importedCount = 0;
        $totalQuestionsImported = 0;

        foreach (array_slice($examLinks, 0, $limit, true) as $link => $rawTitle) {
            $this->line('--------------------------------------------------');
            
            // Clean title
            $title = $rawTitle;
            if (preg_match('/^\d+\.\s*(.+)$/u', $title, $tMatch)) {
                $title = $tMatch[1];
            }
            $title = html_entity_decode($title, ENT_QUOTES | ENT_HTML5, 'UTF-8');

            $this->info("Processing exam: $title ($link)");

            if (!$this->option('fresh') && Exam::where('title', $title)->exists()) {
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

            // Extract all sub-question links
            preg_match_all('/<a[^>]+href=["\'](\/bai-tap-\d+\.html)["\'][^>]*>(.*?)<\/a>/si', $examHtml, $btMatches, PREG_SET_ORDER);
            $uniqueBtLinks = [];
            foreach ($btMatches as $bm) {
                $uLink = 'https://loigiaihay.com' . $bm[1];
                if (!isset($uniqueBtLinks[$uLink])) {
                    $uniqueBtLinks[$uLink] = trim(strip_tags($bm[2]));
                }
            }

            $questions = [];

            if (!empty($uniqueBtLinks)) {
                $this->info("Fetching " . count($uniqueBtLinks) . " sub-questions with Cloudinary diagrams & LaTeX...");
                foreach ($uniqueBtLinks as $btUrl => $btLabel) {
                    try {
                        $btHtml = (string)$client->get($btUrl)->getBody();
                        $qData = $this->parseSubQuestion($btHtml, $btLabel, $cloudinary);
                        if ($qData && !empty($qData['content'])) {
                            $questions[] = $qData;
                        }
                    } catch (\Exception $e) {
                        // ignore sub question failure
                    }
                }
            }

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
                    'description' => "Đề thi tốt nghiệp THPT môn Toán có hình vẽ minh họa, công thức LaTeX chuẩn, câu hỏi Đúng/Sai và Trả lời ngắn theo ma trận mới Bộ GD&ĐT.",
                    'attempts_count' => rand(150, 680),
                    'average_score' => round(rand(60, 85) / 10, 1),
                    'is_published' => true,
                ]);

                $pointPerQ = count($questions) > 0 ? round(10.0 / count($questions), 2) : 0.25;

                foreach ($questions as $qIndex => $qData) {
                    $question = Question::create([
                        'exam_type_id' => $thptType->id,
                        'subject_id' => $mathSubject->id,
                        'question_type' => $qData['question_type'] ?? 'SINGLE_CHOICE',
                        'difficulty_level' => $qData['difficulty_level'] ?? 2,
                        'content' => $qData['content'],
                        'explanation' => $qData['explanation'] ?? '',
                        'points' => $pointPerQ,
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
                        'point_value' => $pointPerQ,
                    ]);

                    $totalQuestionsImported++;
                }

                $importedCount++;
            });

            $this->info("Imported: '$title' (" . count($questions) . " questions)");
            usleep(50000); // 50ms
        }

        $this->info("==================================================");
        $this->info("Import completed: $importedCount Math exams, $totalQuestionsImported questions imported with full LaTeX, Cloudinary diagrams and True/False support!");

        return 0;
    }

    protected function parseSubQuestion(string $btHtml, string $btLabel, CloudinaryService $cloudinary): ?array
    {
        // 1. Solution
        $rawSol = '';
        if (preg_match('/<div[^>]*class=["\'][^"\']*loigiai[^"\']*["\'][^>]*>(.*?)<div[^>]*class=["\'][^"\']*question-report/si', $btHtml, $solM)) {
            $rawSol = $solM[1];
        }
        $cleanSol = $this->cleanMathHtml($rawSol, $cloudinary);

        // 2. Type 1: Single Choice (4 options A, B, C, D)
        if (preg_match('/<ul[^>]*class=["\'][^"\']*dapan[^"\']*["\'][^>]*>(.*?)<\/ul>/si', $btHtml, $optBlock)) {
            preg_match_all('/<li[^>]*class=["\']([^"\']*)["\'][^>]*>.*?<span[^>]*class=["\']span-answer["\']>([A-D])\.?<\/span>(.*?)<\/li>/si', $optBlock[1], $lis, PREG_SET_ORDER);
            if (count($lis) >= 2) {
                $rawQ = '';
                if (preg_match('/<div[^>]*class=["\'][^"\']*question-content[^"\']*["\'][^>]*>(.*?)<\/div>\s*<ul/si', $btHtml, $qM)) {
                    $rawQ = $qM[1];
                } else if (preg_match('/<div[^>]*class=["\'][^"\']*question-content[^"\']*["\'][^>]*>(.*?)<\/div>/si', $btHtml, $qM2)) {
                    $rawQ = $qM2[1];
                }

                $options = [];
                foreach ($lis as $li) {
                    $isTrue = str_contains($li[1], 'answer-true') || str_contains($li[0], 'acceptedAnswer');
                    $optText = $this->cleanMathHtml($li[3], $cloudinary);
                    $options[] = [
                        'sub_key' => $li[2],
                        'content' => $optText,
                        'is_correct' => $isTrue,
                        'order_index' => ord($li[2]) - ord('A') + 1,
                    ];
                }

                // Fallback answer detection
                $hasCorrect = false;
                foreach ($options as $o) {
                    if ($o['is_correct']) $hasCorrect = true;
                }
                if (!$hasCorrect && preg_match('/(?:Đáp án|chọn)\s*:?\s*([A-D])/ui', $cleanSol, $ansM)) {
                    $ansKey = strtoupper($ansM[1]);
                    foreach ($options as &$opt) {
                        if ($opt['sub_key'] === $ansKey) {
                            $opt['is_correct'] = true;
                        }
                    }
                }

                return [
                    'question_type' => 'SINGLE_CHOICE',
                    'difficulty_level' => 2,
                    'content' => $this->cleanMathHtml($rawQ, $cloudinary),
                    'explanation' => $cleanSol,
                    'point_value' => 0.25,
                    'options' => $options,
                ];
            }
        }

        // 3. Extract question-content block
        $rawQBlock = '';
        if (preg_match('/<div[^>]*class=["\'][^"\']*question-content[^"\']*["\'][^>]*>(.*?)<\/div>\s*(?:<ul|<div[^>]*class=["\'][^"\']*loigiai)/si', $btHtml, $qBox)) {
            $rawQBlock = $qBox[1];
        } else if (preg_match('/<div[^>]*class=["\'][^"\']*question-content[^"\']*["\'][^>]*>(.*?)<\/div>/si', $btHtml, $qBox2)) {
            $rawQBlock = $qBox2[1];
        }

        // Check if Type 2: True/False (4 sub-items a, b, c, d)
        if (str_contains($rawQBlock, 'container-3-5-checkbox') || preg_match('/<div[^>]+style="display:\s*flex[^"]*">/i', $rawQBlock)) {
            $stemHtml = '';
            if (preg_match('/^(.*?)<div[^>]+style="display:\s*flex/si', $rawQBlock, $stemM)) {
                $stemHtml = $stemM[1];
            } else if (preg_match('/<h1[^>]*class=["\'][^"\']*title-question[^"\']*["\'][^>]*>(.*?)<\/h1>/si', $rawQBlock, $h1M)) {
                $stemHtml = $h1M[1];
            }
            $cleanStem = $this->cleanMathHtml($stemHtml, $cloudinary);
            if (empty(trim($cleanStem))) {
                $cleanStem = "Xét tính đúng hoặc sai của các mệnh đề sau:";
            }

            $options = [];
            preg_match_all('/<div[^>]+style="display:\s*flex[^"]*">(.*?)<\/div>\s*(?=<div[^>]+style="display:\s*flex|<\/div>|$)/si', $rawQBlock, $flexRows, PREG_SET_ORDER);
            
            $subKeys = ['a', 'b', 'c', 'd'];
            foreach ($flexRows as $rIdx => $row) {
                $rowHtml = $row[1];
                if (!preg_match('/<div[^>]+style="width:\s*60%[^"]*"[^>]*>(.*?)<\/div>/si', $rowHtml, $stmtM)) {
                    continue;
                }
                $stmtRaw = $stmtM[1];
                
                $subKey = $subKeys[$rIdx] ?? 'a';
                if (preg_match('/^([a-d])\)\s*/i', trim(strip_tags($stmtRaw)), $skM)) {
                    $subKey = strtolower($skM[1]);
                    $stmtRaw = preg_replace('/^[a-d]\)\s*/i', '', trim($stmtRaw));
                }

                $stmtClean = $this->cleanMathHtml($stmtRaw, $cloudinary);

                $isCorrect = false;
                if (preg_match('/' . preg_quote($subKey, '/') . '\)\s*(?:<strong>\s*)?(Đúng|Sai)/ui', $rawSol, $solTf)) {
                    $isCorrect = (mb_strtolower($solTf[1]) === 'đúng');
                } else if (preg_match('/' . preg_quote($subKey, '/') . '\)\s*.*?fa-square-check.*?Đúng/si', $rawSol)) {
                    $isCorrect = true;
                }

                $options[] = [
                    'sub_key' => $subKey,
                    'content' => $stmtClean,
                    'is_correct' => $isCorrect,
                    'order_index' => ord($subKey) - ord('a') + 1,
                ];
            }

            if (count($options) >= 2) {
                return [
                    'question_type' => 'TRUE_FALSE',
                    'difficulty_level' => 3,
                    'content' => $cleanStem,
                    'explanation' => $cleanSol,
                    'point_value' => 1.0,
                    'options' => $options,
                ];
            }
        }

        // Type 3: Short Answer
        return [
            'question_type' => 'SHORT_ANSWER',
            'difficulty_level' => 3,
            'content' => $this->cleanMathHtml($rawQBlock, $cloudinary),
            'explanation' => $cleanSol,
            'point_value' => 0.5,
            'options' => [],
        ];
    }

    protected function cleanMathHtml(string $html, CloudinaryService $cloudinary): string
    {
        // 1. Upload images to Cloudinary
        $html = preg_replace_callback('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', function ($m) use ($cloudinary) {
            $src = $m[1];
            if (
                str_contains($src, 'themes') ||
                str_contains($src, 'icon') ||
                str_contains($src, 'speaker') ||
                str_contains($src, 'facebook') ||
                str_contains($src, 'youtube') ||
                str_contains($src, 'banner') ||
                str_contains($src, 'giai-boi') ||
                str_contains($src, 'loi-giai-hay-0.png')
            ) {
                return '';
            }
            $fullSrc = str_starts_with($src, 'http') ? $src : 'https://loigiaihay.com' . (str_starts_with($src, '/') ? '' : '/') . $src;
            try {
                $upload = $cloudinary->upload($fullSrc, 'luyenthi/math_questions');
                if ($upload && !empty($upload['url'])) {
                    return "\n\n![Hình vẽ minh họa](" . $upload['url'] . ")\n\n";
                }
            } catch (\Exception $e) {
            }
            return "\n\n![Hình vẽ minh họa](" . $fullSrc . ")\n\n";
        }, $html);

        // 2. Remove scripts and styles
        $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);
        $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $html);

        // 3. Preserve breaks
        $html = str_replace(['<br>', '<br/>', '<br />', '</p>', '</div>', '</li>', '</h1>', '</h2>', '</h3>'], "\n", $html);
        $html = strip_tags($html);
        $html = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // 4. Normalize newlines
        $lines = array_map('trim', explode("\n", $html));
        $lines = array_filter($lines, fn($l) => $l !== '');
        return implode("\n\n", $lines);
    }
}
