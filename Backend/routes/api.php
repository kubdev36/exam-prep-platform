<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExamCatalogController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\ExamSessionController;
use App\Http\Controllers\Api\PracticeController;
use Illuminate\Support\Facades\Route;

// Public Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Catalog & Public Exam routes
Route::get('/exam-types', [ExamCatalogController::class, 'getExamTypes']);
Route::get('/exam-types/{codeOrSlug}', [ExamCatalogController::class, 'getExamTypeDetail']);
Route::get('/exam-types/{examCode}/subjects', [ExamCatalogController::class, 'getSubjects']);
Route::get('/subjects/{subjectId}/topics', [ExamCatalogController::class, 'getTopicsBySubject']);

Route::get('/exams', [ExamController::class, 'index']);
Route::get('/exams/{id}', [ExamController::class, 'show']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/target', [AuthController::class, 'updateTarget']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Exam Session / Room
    Route::post('/exams/{id}/start', [ExamSessionController::class, 'startAttempt']);
    Route::post('/attempts/{attemptId}/save-answer', [ExamSessionController::class, 'saveAnswer']);
    Route::post('/attempts/{attemptId}/submit', [ExamSessionController::class, 'submitAttempt']);
    Route::get('/attempts/{attemptId}/review', [ExamSessionController::class, 'reviewAttempt']);

    // Practice & Question Notebook
    Route::post('/practice/quick', [PracticeController::class, 'quickPractice']);
    Route::get('/practice/wrong-questions', [PracticeController::class, 'getWrongQuestions']);
    Route::post('/practice/wrong-questions/{questionId}/toggle-mastered', [PracticeController::class, 'toggleMastered']);
    Route::post('/practice/bookmarks/{questionId}/toggle', [PracticeController::class, 'toggleBookmark']);
    Route::get('/practice/bookmarks', [PracticeController::class, 'getBookmarks']);

    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'getSummary']);

    // Media & Cloudinary Upload
    Route::post('/media/upload', [\App\Http\Controllers\Api\MediaController::class, 'upload']);
});

