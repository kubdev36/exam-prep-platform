<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'selected_option_ids',
        'text_answer',
        'sub_answers',
        'is_correct',
        'is_flagged',
        'score_awarded',
        'time_spent_seconds',
    ];

    protected $casts = [
        'selected_option_ids' => 'array',
        'sub_answers' => 'array',
        'is_correct' => 'boolean',
        'is_flagged' => 'boolean',
        'score_awarded' => 'float',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
