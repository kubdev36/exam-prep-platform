<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WrongQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'question_id',
        'exam_type_id',
        'attempt_id',
        'wrong_count',
        'last_answered_at',
        'is_mastered',
    ];

    protected $casts = [
        'last_answered_at' => 'datetime',
        'is_mastered' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'attempt_id');
    }
}
