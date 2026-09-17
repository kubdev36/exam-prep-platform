<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_type_id',
        'name',
        'code',
        'description',
        'max_score',
        'default_question_count',
        'order_index',
    ];

    protected $casts = [
        'max_score' => 'float',
    ];

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'section_id')->orderBy('order_index');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'section_id');
    }
}
