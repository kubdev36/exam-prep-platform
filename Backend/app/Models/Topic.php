<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'parent_id',
        'name',
        'slug',
        'description',
        'order_index',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Topic::class, 'parent_id')->orderBy('order_index');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
