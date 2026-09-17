<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'content',
        'is_correct',
        'sub_key',
        'order_index',
        'fraction_score',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'fraction_score' => 'float',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
