<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AssistantController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-event-guest', [RegistrationController::class, 'guestRegister']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::get('/events/{id}/participants', [EventController::class, 'participants']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/register-event', [RegistrationController::class, 'register']);
    Route::get('/users/{userId}/registrations', [RegistrationController::class, 'userEvents']);
    Route::delete('/registrations/{id}', [RegistrationController::class, 'cancel']);
    

        Route::get('/assistant/sessions', [AssistantController::class, 'sessions']);
    Route::post('/assistant/session', [AssistantController::class, 'createSession']);
    Route::get('/assistant/session/{id}', [AssistantController::class, 'showSession']);
    Route::post('/assistant/ask', [AssistantController::class, 'chat']);
    Route::delete('/assistant/sessions/{id}', [AssistantController::class, 'destroy']);

Route::middleware('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);

    Route::get('/registrations', [RegistrationController::class, 'index']);
    
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    
    Route::post('/events/{id}/add-user', [EventController::class, 'addUserToEvent']);
    Route::delete('/events/{eventId}/remove-user/{userId}', [EventController::class, 'removeUserFromEvent']);
    });
});