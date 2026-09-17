<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'slug',
        'description',
        'badge',
        'icon',
        'max_score',
        'default_duration_minutes',
        'is_active',
        'order_index',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'max_score' => 'float',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(ExamSection::class)->orderBy('order_index');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class)->orderBy('order_index');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function templates(): HasMany
    {
        return $this->hasMany(ExamTemplate::class);
    }
}
