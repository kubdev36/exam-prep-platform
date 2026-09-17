<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_type_id',
        'title',
        'code',
        'duration_minutes',
        'total_questions',
        'total_score',
        'structure_config',
        'description',
    ];

    protected $casts = [
        'structure_config' => 'array',
        'total_score' => 'float',
    ];

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class, 'template_id');
    }
}
