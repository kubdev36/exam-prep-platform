<?php

namespace App\Providers;

use App\Modules\Analytics\Listeners\UpdateTopicStatisticsListener;
use App\Modules\Analytics\Listeners\UpdateWrongQuestionsListener;
use App\Modules\Attempt\Events\ExamSubmitted;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            ExamSubmitted::class,
            UpdateTopicStatisticsListener::class,
        );

        Event::listen(
            ExamSubmitted::class,
            UpdateWrongQuestionsListener::class,
        );
    }
}
