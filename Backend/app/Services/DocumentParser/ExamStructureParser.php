<?php

namespace App\Services\DocumentParser;

class ExamStructureParser
{
    /**
     * Parse raw document text into structured exam questions and metadata.
     *
     * @param string $rawText
     * @return array ['title' => string, 'questions' => array, 'detected_total' => int]
     */
    public function parse(string $rawText): array
    {
        // 1. Normalize line endings and whitespace
        $text = str_replace(["\r\n", "\r"], "\n", $rawText);
        $lines = explode("\n", $text);

        // 2. Extract answer key table if present at the end of document
        $answerKeyMap = $this->extractAnswerKeyTable($text);

        // 3. Extract title if present at the top
        $title = $this->extractExamTitle($lines);

        // 4. Split document into question blocks
        $questionBlocks = $this->splitIntoQuestionBlocks($text);

        $parsedQuestions = [];
        $index = 1;

        foreach ($questionBlocks as $block) {
            $parsed = $this->parseSingleQuestionBlock($block, $index, $answerKeyMap);
            if ($parsed && !empty(trim($parsed['content']))) {
                $parsedQuestions[] = $parsed;
                $index++;
            }
        }

        return [
            'title' => $title ?: 'Đề thi tự động tải lên ' . date('d/m/Y'),
            'questions' => $parsedQuestions,
            'detected_total' => count($parsedQuestions),
        ];
    }

    protected function extractExamTitle(array $lines): string
    {
        for ($i = 0; $i < min(5, count($lines)); $i++) {
            $line = trim($lines[$i]);
            if (empty($line)) continue;
            if (preg_match('/(ĐỀ\s+THI|ĐỀ\s+KIỂM\s+TRA|KỲ\s+THI|TRƯỜNG|BỘ\s+GIÁO\s+DỤC|HSA|TSA|THPT)/ui', $line)) {
                return $line;
            }
        }
        return '';
    }

    protected function extractAnswerKeyTable(string $text): array
    {
        $map = [];

        // Match patterns like "1.A 2.B 3.C" or "1A 2B 3C" or "1 - A, 2 - B" or "1. A, 2. B"
        if (preg_match('/(BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+CHI\s+TIẾT|ĐÁP\s+ÁN)([\s\S]+)$/ui', $text, $matches)) {
            $keySection = $matches[2];
            preg_match_all('/(\d+)[\s.:-]+([A-D])/ui', $keySection, $pairs, PREG_SET_ORDER);
            foreach ($pairs as $p) {
                $qNum = (int)$p[1];
                $choice = strtoupper(trim($p[2]));
                $map[$qNum] = $choice;
            }
        }

        return $map;
    }

    protected function splitIntoQuestionBlocks(string $text): array
    {
        // Split on pattern: newline followed by "Câu 1:", "Question 1:", "Bài 1:", or "1. ", "2. "
        $pattern = '/(?=\n\s*(?:(?:Câu|Bài|Question)\s+\d+|\d{1,3}[\.\:\)])[\s.:-]+)/ui';
        $blocks = preg_split($pattern, "\n" . $text);

        return array_filter(array_map('trim', $blocks), function ($b) {
            return preg_match('/^(?:(?:Câu|Bài|Question)\s+\d+|\d{1,3}[\.\:\)])/ui', $b);
        });
    }

    protected function parseSingleQuestionBlock(string $block, int $orderIndex, array $answerKeyMap): ?array
    {
        // 1. Separate explanation if present
        $explanation = '';
        if (preg_match('/(?:\n\s*(?:Lời\s+giải|Hướng\s+dẫn\s+giải|Giải\s+thích|Giải)\s*[:.-])([\s\S]+)$/ui', $block, $expMatch)) {
            $explanation = trim($expMatch[1]);
            $block = substr($block, 0, -strlen($expMatch[0]));
        }

        // 2. Remove question header (e.g. "Câu 1: ", "Question 1.", "1. ")
        $cleanedBlock = preg_replace('/^(?:(?:Câu|Bài|Question)\s+\d+|\d{1,3})[-.:)\s]+\s*/ui', '', $block);

        // Check if question has Multiple Choice options A., B., C., D.
        // Match options even if on the same line: "A. xxx   B. yyy   C. zzz   D. ttt"
        $optionPattern = '/(?:\n|\s|^)(\*?)([A-D])[\.:\)\-]\s+([^\n\r]+?)(?=(\s{2,}\*?[A-D][\.:\)\-]|\n\s*\*?[A-D][\.:\)\-]|$))/u';
        preg_match_all($optionPattern, $cleanedBlock, $optMatches, PREG_SET_ORDER);

        if (count($optMatches) >= 2) {
            // It's a Single / Multi Choice question
            // The content is everything before the first option
            $firstOptionPos = strpos($cleanedBlock, $optMatches[0][0]);
            $questionContent = $firstOptionPos !== false ? trim(substr($cleanedBlock, 0, $firstOptionPos)) : $cleanedBlock;

            $options = [];
            $tableCorrect = $answerKeyMap[$orderIndex] ?? null;

            foreach ($optMatches as $idx => $m) {
                $hasStar = !empty($m[1]) || str_contains($m[0], '*');
                $letter = strtoupper(trim($m[2]));
                $optContent = trim($m[3]);
                $optContent = rtrim($optContent, " \t\n\r.");

                $isCorrect = $hasStar || ($tableCorrect && $tableCorrect === $letter);

                $options[] = [
                    'id' => $idx + 1,
                    'sub_key' => strtolower($letter),
                    'content' => $optContent,
                    'is_correct' => (bool)$isCorrect,
                    'order_index' => $idx + 1,
                ];
            }

            // Default first option if none is marked correct
            if (!array_filter($options, fn($o) => $o['is_correct']) && count($options) > 0) {
                $options[0]['is_correct'] = true;
            }

            return [
                'order_index' => $orderIndex,
                'question_type' => 'SINGLE_CHOICE',
                'difficulty_level' => 2,
                'content' => $questionContent ?: "Câu hỏi số $orderIndex",
                'options' => $options,
                'explanation' => $explanation,
                'point_value' => 0.25,
            ];
        }

        // Check if question has True/False 4 sub-items (a), b), c), d) or a. b. c. d.) - Case-sensitive lowercase
        if (preg_match_all('/(?:\n|\s|^)([a-d])[\)\.][\s\t]+([^\n\r]+)/u', $cleanedBlock, $tfMatches, PREG_SET_ORDER) && count($tfMatches) >= 3) {
            return $this->parseTrueFalseQuestion($cleanedBlock, $tfMatches, $orderIndex, $explanation);
        }

        // Otherwise: SHORT_ANSWER or open-ended question
        // Extract acceptable answers from "Đáp số: xxx" or "Kết quả: xxx"
        $shortAnswer = '';
        if (preg_match('/(?:Đáp\s+số|Kết\s+quả|Đáp\s+án)\s*[\:\.\-–]\s*([^\n\r]+)/ui', $cleanedBlock, $ansMatch)) {
            $shortAnswer = trim($ansMatch[1]);
        }

        return [
            'order_index' => $orderIndex,
            'question_type' => 'SHORT_ANSWER',
            'difficulty_level' => 3,
            'content' => trim($cleanedBlock),
            'options' => $shortAnswer ? [['id' => 1, 'content' => $shortAnswer, 'is_correct' => true, 'order_index' => 1]] : [],
            'explanation' => $explanation,
            'point_value' => 1.0,
        ];
    }

    protected function parseTrueFalseQuestion(string $text, array $tfMatches, int $orderIndex, string $explanation): array
    {
        $firstPos = strpos($text, $tfMatches[0][0]);
        $questionContent = $firstPos !== false ? trim(substr($text, 0, $firstPos)) : $text;

        $options = [];
        foreach ($tfMatches as $idx => $m) {
            $subKey = strtolower(trim($m[1]));
            $content = trim($m[2]);

            // Check if (Đúng) or (Sai) or * is in the content
            $isCorrect = true;
            if (preg_match('/\((?:Sai|S)\)/ui', $content)) {
                $isCorrect = false;
                $content = preg_replace('/\((?:Sai|S)\)/ui', '', $content);
            } elseif (preg_match('/\((?:Đúng|Đ)\)/ui', $content)) {
                $isCorrect = true;
                $content = preg_replace('/\((?:Đúng|Đ)\)/ui', '', $content);
            }

            $options[] = [
                'id' => $idx + 1,
                'sub_key' => $subKey,
                'content' => trim($content),
                'is_correct' => $isCorrect,
                'order_index' => $idx + 1,
            ];
        }

        return [
            'order_index' => $orderIndex,
            'question_type' => 'TRUE_FALSE',
            'difficulty_level' => 3,
            'content' => $questionContent ?: 'Câu hỏi Đúng / Sai số ' . $orderIndex,
            'options' => $options,
            'explanation' => $explanation,
            'point_value' => 1.0,
        ];
    }
}
