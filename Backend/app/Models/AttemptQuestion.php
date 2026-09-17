<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttemptQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'section_id',
        'subject_id',
        'topic_id',
        'order_index',
        'point_value',
        'question_type_snapshot',
        'difficulty_level_snapshot',
        'content_snapshot',
        'passage_snapshot',
        'options_snapshot',
        'correct_answer_snapshot',
        'explanation_snapshot',
        'score_awarded',
    ];

    protected $casts = [
        'point_value' => 'float',
        'score_awarded' => 'float',
        'options_snapshot' => 'array',
        'correct_answer_snapshot' => 'array',
        'difficulty_level_snapshot' => 'integer',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
