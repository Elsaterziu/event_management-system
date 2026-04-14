<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
{
    $events = Event::with('creator')
        ->withCount('users')
        ->orderBy('event_date', 'asc')
        ->get();

    return response()->json($events);
}

    public function show($id)
    {
        $event = Event::with(['creator', 'users'])->find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        return response()->json($event);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'event_date' => 'required|date',
        'location' => 'required|string|max:255',
        'max_participants' => 'required|integer|min:1',
        'image' => 'nullable|url',
    ]);

    $validated['created_by'] = auth()->id();

    $event = Event::create($validated);

    return response()->json([
        'message' => 'Event created successfully',
        'event' => $event
    ], 201);
}

    public function update(Request $request, $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'event_date' => 'sometimes|required|date',
            'location' => 'sometimes|required|string|max:255',
            'max_participants' => 'sometimes|required|integer|min:1',
            'image' => 'nullable|url',
        ]);

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event
        ]);
    }

    public function destroy($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ]);
    }

    public function participants($id)
    {
        $event = Event::with('users')->find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        return response()->json([
            'event' => $event->title,
            'participants' => $event->users
        ]);
    }

            public function removeUserFromEvent($eventId, $userId)
            {
                $event = Event::find($eventId);
            
                if (!$event) {
                    return response()->json([
                        'message' => 'Event not found'
                    ], 404);
                }
            
                $isRegistered = $event->users()->where('users.id', $userId)->exists();
            
                if (!$isRegistered) {
                    return response()->json([
                        'message' => 'User is not registered for this event'
                    ], 404);
                }
            
                $event->users()->detach($userId);
            
                return response()->json([
                    'message' => 'Participant removed successfully'
                ], 200);
            }

    public function addUserToEvent(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $event = Event::with('users')->find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        if ($event->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is already registered for this event'
            ], 400);
        }

        if ($event->users()->count() >= $event->max_participants) {
            return response()->json([
                'message' => 'This event is full'
            ], 400);
        }

        $event->users()->attach($user->id);

        return response()->json([
            'message' => 'User added to event successfully'
        ]);
    }
}