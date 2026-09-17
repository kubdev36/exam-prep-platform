<?php

namespace App\Services;

use App\Models\Question;
use App\Models\StudentAnswer;

class GradingService
{
    /**
     * Grade a student answer for a specific question.
     *
     * @param Question $question
     * @param array|string|null $studentResponse
     * @param float $questionPoint
     * @return array ['is_correct' => bool, 'score' => float, 'details' => array]
     */
    public function gradeQuestion(Question $question, mixed $studentResponse, float $questionPoint = 1.0): array
    {
        $question->loadMissing('options');
        $type = $question->question_type;

        return match ($type) {
            'SINGLE_CHOICE' => $this->gradeSingleChoice($question, $studentResponse, $questionPoint),
            'MULTIPLE_CHOICE' => $this->gradeMultipleChoice($question, $studentResponse, $questionPoint),
            'TRUE_FALSE' => $this->gradeTrueFalse($question, $studentResponse, $questionPoint),
            'SHORT_ANSWER' => $this->gradeShortAnswer($question, $studentResponse, $questionPoint),
            default => $this->gradeSingleChoice($question, $studentResponse, $questionPoint),
        };
    }

    protected function gradeSingleChoice(Question $question, mixed $response, float $point): array
    {
        $selectedId = is_array($response) ? ($response[0] ?? null) : $response;
        if (!$selectedId) {
            return ['is_correct' => false, 'score' => 0, 'details' => ['reason' => 'No answer provided']];
        }

        $correctOption = $question->options->firstWhere('is_correct', true);
        $isCorrect = $correctOption && ((int)$correctOption->id === (int)$selectedId);

        return [
            'is_correct' => $isCorrect,
            'score' => $isCorrect ? $point : 0.0,
            'details' => [
                'selected_id' => $selectedId,
                'correct_id' => $correctOption?->id,
            ],
        ];
    }

    protected function gradeMultipleChoice(Question $question, mixed $response, float $point): array
    {
        $selectedIds = is_array($response) ? array_map('intval', $response) : [];
        sort($selectedIds);

        $correctIds = $question->options->where('is_correct', true)->pluck('id')->map(fn($id) => (int)$id)->all();
        sort($correctIds);

        $isCorrect = ($selectedIds === $correctIds);

        return [
            'is_correct' => $isCorrect,
            'score' => $isCorrect ? $point : 0.0,
            'details' => [
                'selected_ids' => $selectedIds,
                'correct_ids' => $correctIds,
            ],
        ];
    }

    /**
     * Formats 4-sub-item True/False (THPT & TSA new standard format):
     * 1 correct statement: 10% points (0.1)
     * 2 correct statements: 25% points (0.25)
     * 3 correct statements: 50% points (0.50)
     * 4 correct statements: 100% points (1.00)
     */
    protected function gradeTrueFalse(Question $question, mixed $response, float $point): array
    {
        // Response format expected: ['a' => true/false, 'b' => true/false, ...] or sub_answers
        $studentSubAnswers = is_array($response) ? $response : [];
        if (empty($studentSubAnswers)) {
            return ['is_correct' => false, 'score' => 0.0, 'details' => ['correct_count' => 0]];
        }

        $correctCount = 0;
        $totalSubItems = $question->options->count();
        $subDetails = [];

        foreach ($question->options as $opt) {
            $key = $opt->sub_key ?: (string)$opt->id;
            $userVal = isset($studentSubAnswers[$key]) ? filter_var($studentSubAnswers[$key], FILTER_VALIDATE_BOOLEAN) : null;
            $correctVal = (bool)$opt->is_correct;

            $matched = ($userVal !== null && $userVal === $correctVal);
            if ($matched) {
                $correctCount++;
            }

            $subDetails[$key] = [
                'user_val' => $userVal,
                'correct_val' => $correctVal,
                'matched' => $matched,
            ];
        }

        // Apply scale
        $multiplier = match ($correctCount) {
            4 => 1.0,
            3 => 0.5,
            2 => 0.25,
            1 => 0.1,
            default => 0.0,
        };

        if ($totalSubItems < 4 && $totalSubItems > 0) {
            $multiplier = $correctCount / $totalSubItems;
        }

        $score = round($point * $multiplier, 2);
        $isAllCorrect = ($correctCount === $totalSubItems && $totalSubItems > 0);

        return [
            'is_correct' => $isAllCorrect,
            'score' => $score,
            'details' => [
                'correct_sub_count' => $correctCount,
                'total_sub_items' => $totalSubItems,
                'sub_details' => $subDetails,
            ],
        ];
    }

    protected function gradeShortAnswer(Question $question, mixed $response, float $point): array
    {
        $rawAnswer = is_string($response) ? trim($response) : (is_array($response) ? ($response['text'] ?? '') : '');
        if ($rawAnswer === '') {
            return ['is_correct' => false, 'score' => 0.0, 'details' => ['reason' => 'Empty short answer']];
        }

        // Clean user input: replace comma with dot for decimals, lowercase
        $normalizedUser = strtolower(str_replace(',', '.', trim($rawAnswer)));

        // Check options or metadata acceptable answers
        $acceptableAnswers = [];
        foreach ($question->options as $opt) {
            $acceptableAnswers[] = strtolower(str_replace(',', '.', trim($opt->content)));
        }

        if (isset($question->metadata['acceptable_answers']) && is_array($question->metadata['acceptable_answers'])) {
            foreach ($question->metadata['acceptable_answers'] as $acc) {
                $acceptableAnswers[] = strtolower(str_replace(',', '.', trim((string)$acc)));
            }
        }

        $isCorrect = in_array($normalizedUser, $acceptableAnswers, true);

        // Also check numerical approximate match if both are numbers
        if (!$isCorrect && is_numeric($normalizedUser)) {
            $userFloat = (float)$normalizedUser;
            foreach ($acceptableAnswers as $acc) {
                if (is_numeric($acc) && abs($userFloat - (float)$acc) < 0.0001) {
                    $isCorrect = true;
                    break;
                }
            }
        }

        return [
            'is_correct' => $isCorrect,
            'score' => $isCorrect ? $point : 0.0,
            'details' => [
                'user_answer' => $rawAnswer,
                'acceptable' => $acceptableAnswers,
            ],
        ];
    }
}
