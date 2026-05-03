<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\GuestRegistration;


class RegistrationController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'event_id' => 'required|exists:events,id',
        ]);

        $event = Event::with('users')->find($validated['event_id']);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        if ($event->users()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json([
                'message' => 'User is already registered for this event'
            ], 409);
        }

        if ($event->users()->count() >= $event->max_participants) {
            return response()->json([
                'message' => 'Event is full'
            ], 400);
        }

        $registration = Registration::create($validated);

        return response()->json([
            'message' => 'Registration completed successfully',
            'registration' => $registration
        ], 201);
    }

        public function index()
    {   
        $registrations = Registration::with(['user', 'event'])
        ->latest()
        ->get();

        return response()->json($registrations);
    }
    public function userEvents($userId)
    {
        $registrations = Registration::with('event')
            ->where('user_id', $userId)
            ->get();

        return response()->json($registrations);
    }

    public function guestRegister(Request $request)
{
    $request->validate([
        'name' => 'required',
        'email' => 'required|email',
        'event_id' => 'required|exists:events,id',
    ]);

    $exists = GuestRegistration::where('email', $request->email)
        ->where('event_id', $request->event_id)
        ->exists();

    if ($exists) {
        return response()->json([
            'message' => 'You are already registered for this event'
        ], 400);
    }

    GuestRegistration::create([
        'name' => $request->name,
        'email' => $request->email,
        'event_id' => $request->event_id,
    ]);

    return response()->json([
        'message' => 'You are registered successfully'
    ]);
}

    public function cancel($id)
    {
        $registration = Registration::find($id);

        if (!$registration) {
            return response()->json([
                'message' => 'Registration not found'
            ], 404);
        }

        $registration->delete();

        return response()->json([
            'message' => 'Registration cancelled successfully'
        ]);
    }
}