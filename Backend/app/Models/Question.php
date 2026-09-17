<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_type_id',
        'section_id',
        'subject_id',
        'topic_id',
        'question_type', // SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, MATCHING
        'difficulty_level', // 1, 2, 3, 4
        'content',
        'passage',
        'explanation',
        'media_urls',
        'metadata',
        'points',
        'is_active',
    ];

    protected $casts = [
        'difficulty_level' => 'integer',
        'points' => 'float',
        'is_active' => 'boolean',
        'media_urls' => 'array',
        'metadata' => 'array',
    ];

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(ExamSection::class, 'section_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class)->orderBy('order_index');
    }

    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(QuestionBookmark::class);
    }

    public function wrongRecords(): HasMany
    {
        return $this->hasMany(WrongQuestion::class);
    }
}
