<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'exam_id',
        'started_at',
        'expires_at',
        'submitted_at',
        'duration_seconds',
        'score',
        'max_score',
        'correct_count',
        'wrong_count',
        'skipped_count',
        'status', // IN_PROGRESS, SUBMITTED, EXPIRED, GRADED
        'section_scores',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'submitted_at' => 'datetime',
        'score' => 'float',
        'max_score' => 'float',
        'section_scores' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function attemptQuestions(): HasMany
    {
        return $this->hasMany(AttemptQuestion::class, 'attempt_id')->orderBy('order_index');
    }

    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class, 'attempt_id');
    }
}
