<?php

namespace App\Modules\Attempt\Events;

use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExamSubmitted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ExamAttempt $attempt;
    public User $user;

    /**
     * Create a new event instance.
     */
    public function __construct(ExamAttempt $attempt, User $user)
    {
        $this->attempt = $attempt;
        $this->user = $user;
    }
}
