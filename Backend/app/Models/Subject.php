<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_type_id',
        'section_id',
        'name',
        'code',
        'slug',
        'icon',
        'color',
        'order_index',
    ];

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(ExamSection::class, 'section_id');
    }

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class)->whereNull('parent_id')->orderBy('order_index');
    }

    public function allTopics(): HasMany
    {
        return $this->hasMany(Topic::class)->orderBy('order_index');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
