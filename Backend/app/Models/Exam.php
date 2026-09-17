<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_type_id',
        'template_id',
        'subject_id',
        'title',
        'slug',
        'type', // OFFICIAL_YEAR, MOCK_TEST, PRACTICE_CUSTOM
        'year',
        'duration_minutes',
        'total_questions',
        'total_score',
        'description',
        'attempts_count',
        'average_score',
        'is_published',
    ];

    protected $casts = [
        'total_score' => 'float',
        'average_score' => 'float',
        'is_published' => 'boolean',
    ];

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ExamTemplate::class, 'template_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function examQuestions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class)->orderBy('order_index');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'exam_questions')
            ->withPivot('order_index', 'point_value', 'section_id')
            ->orderByPivot('order_index');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }
}
