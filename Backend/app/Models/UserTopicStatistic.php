<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserTopicStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'topic_id',
        'subject_id',
        'exam_type_id',
        'total_questions',
        'correct_questions',
        'accuracy_rate',
        'average_time_seconds',
    ];

    protected $casts = [
        'accuracy_rate' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }
}
