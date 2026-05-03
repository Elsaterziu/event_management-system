<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AssistantController extends Controller
{
    public function sessions()
    {
        return ChatSession::where('user_id', Auth::id())
            ->latest()
            ->get();
    }

    public function createSession()
    {
        $session = ChatSession::create([
            'user_id' => Auth::id(),
            'title' => 'New conversation'
        ]);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'assistant',
            'content' => 'Hello. What can I help you today?'
        ]);

        return response()->json([
            'id' => $session->id,
            'title' => $session->title,
            'messages' => $session->messages
        ]);
    }

    public function showSession($id)
    {
        return ChatSession::with('messages')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();
    }

    public function destroy($id)
{
    $session = ChatSession::where('id', $id)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    $session->delete();

    return response()->json(['message' => 'Deleted']);
}
    public function chat(Request $request)
    {
        $request->validate([
            'session_id' => 'required',
            'message' => 'required|string'
        ]);

        $session = ChatSession::where('id', $request->session_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'user',
            'content' => $request->message
        ]);if ($session->title === 'New conversation') {
    $session->update([
        'title' => strlen($request->message) > 30
            ? substr($request->message, 0, 30) . '...'
            : $request->message
    ]);
}

        $reply = $this->generateReply($request->message);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'assistant',
            'content' => $reply
        ]);

        return response()->json([
            'reply' => $reply
        ]);
    }

    private function generateReply($message)
{
    $msg = strtolower(trim($message));

    // ------------------------
    // KEYWORDS
    // ------------------------
    $greetings = ['hi', 'hello', 'hey', 'pershendetje'];
    $myEventsKeywords = ['my events', 'my registrations', 'events i joined'];
    $upcomingKeywords = ['upcoming', 'future events', 'next events'];

    $cities = ['prishtina', 'ferizaj', 'gjilan', 'peja'];

    // ------------------------
    // GREETING
    // ------------------------
    foreach ($greetings as $greet) {
        if (preg_match('/\b' . $greet . '\b/', $msg)) {
            return "Hello. What can I help you today?";
        }
    }

    // ------------------------
    // MY EVENTS
    // ------------------------
    foreach ($myEventsKeywords as $key) {
        if (str_contains($msg, $key)) {
            $events = Auth::user()->registeredEvents()->get();

            if ($events->isEmpty()) {
                return "You are not registered for any events.";
            }

            return "Your events:\n" .
                $events->map(fn($e) =>
                    "- {$e->title} (" .
                    Carbon::parse($e->event_date)->format('Y-m-d H:i') . ")"
                )->implode("\n");
        }
    }

    // ------------------------
    // TIME FILTERS
    // ------------------------
    $start = null;
    $end = null;

    if (str_contains($msg, 'today')) {
        $start = Carbon::today();
        $end = Carbon::today()->endOfDay();
    }

    if (str_contains($msg, 'tomorrow')) {
        $start = Carbon::tomorrow();
        $end = Carbon::tomorrow()->endOfDay();
    }

    if (str_contains($msg, 'this week')) {
        $start = Carbon::now()->startOfWeek();
        $end = Carbon::now()->endOfWeek();
    }

    // ------------------------
    // CITY DETECTION
    // ------------------------
    $foundCity = null;

    foreach ($cities as $city) {
        if (str_contains($msg, $city)) {
            $foundCity = $city;
            break;
        }
    }

    // ------------------------
    // EVENTS FILTER (SMART)
    // ------------------------
    if (str_contains($msg, 'event')) {

        $query = Event::query();

        if ($foundCity) {
            $query->where('location', 'LIKE', "%$foundCity%");
        }

        if ($start && $end) {
            $query->whereBetween('event_date', [$start, $end]);
        }

        if (str_contains($msg, 'upcoming')) {
            $query->where('event_date', '>=', now());
        }

        $events = $query->orderBy('event_date')->get();

        if ($events->isEmpty()) {

            if ($foundCity && $start) {
                return "There are no events in {$foundCity} for that period.";
            }

            if ($foundCity) {
                return "There are no events in {$foundCity}.";
            }

            if ($start) {
                return "There are no events for that period.";
            }

            return "No events found.";
        }

        return $events->map(fn($e) =>
            "- {$e->title} (" .
            Carbon::parse($e->event_date)->format('Y-m-d H:i') .
            ", {$e->location})"
        )->implode("\n");
    }

    // ------------------------
    // UPCOMING (fallback)
    // ------------------------
    foreach ($upcomingKeywords as $key) {
        if (str_contains($msg, $key)) {
            $events = Event::where('event_date', '>=', now())
                ->orderBy('event_date')
                ->limit(5)
                ->get();

            if ($events->isEmpty()) {
                return "There are no upcoming events.";
            }

            return $events->map(fn($e) =>
                "- {$e->title} (" .
                Carbon::parse($e->event_date)->format('Y-m-d H:i') . ")"
            )->implode("\n");
        }
    }

    // ------------------------
    // EVENT DETAILS
    // ------------------------
    $event = Event::all()->first(function ($e) use ($msg) {
        return str_contains($msg, strtolower($e->title));
    });

    if ($event) {

        $taken = $event->registrations()->count();
        $free = max(0, $event->capacity - $taken);

        return "{$event->title} takes place on " .
            Carbon::parse($event->event_date)->format('Y-m-d') .
            " at " .
            Carbon::parse($event->event_date)->format('H:i') .
            ", in {$event->location}. " .
            "Available seats: {$free}.";
    }

    // ------------------------
    // FALLBACK
    // ------------------------
    return "I did not understand your request. Try asking about events, locations, or your registrations.";
}
}