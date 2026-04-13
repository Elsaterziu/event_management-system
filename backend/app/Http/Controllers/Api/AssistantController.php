<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AssistantController extends Controller
{
    public function sessions()
    {
        return response()->json([
            [
                'id' => 1,
                'title' => 'New conversation',
            ]
        ]);
    }

    public function createSession()
    {
        return response()->json([
            'id' => rand(1000, 9999),
            'title' => 'New conversation',
            'messages' => []
        ]);
    }

    public function showSession($id)
    {
        return response()->json([
            'id' => $id,
            'title' => 'Conversation',
            'messages' => []
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'session_id' => 'required',
            'message' => 'required|string'
        ]);

        $reply = $this->generateReply($request->message);

        return response()->json([
            'reply' => $reply
        ]);
    }

    private function generateReply($rawMessage)
    {
        $message = $this->normalizeText($rawMessage);

        if ($this->isGreeting($message)) {
            return 'Hello! I can help you with upcoming events, events by city, dates, capacity, and your registrations.';
        }

        if ($this->isMyEventsIntent($message)) {
            if (!Auth::check()) {
                return 'Please log in first to see your registrations.';
            }

            $user = Auth::user();

            if (!method_exists($user, 'registeredEvents')) {
                return 'Registered events relation is missing in the User model.';
            }

            $events = $user->registeredEvents()
                ->orderBy('event_date', 'asc')
                ->get()
                ->unique('id')
                ->values();

            if ($events->isEmpty()) {
                return 'You do not have any registrations yet.';
            }

            return 'Your recent registrations are: ' . $events->pluck('title')->implode(', ') . '.';
        }

        if ($this->isUpcomingIntent($message)) {
            $events = Event::where('event_date', '>=', now())
                ->orderBy('event_date', 'asc')
                ->get()
                ->unique('id')
                ->values();

            if ($events->isEmpty()) {
                return 'There are no upcoming events at the moment.';
            }

            return $this->formatEventList('Here are the upcoming events', $events);
        }

        $city = $this->extractCity($message);

        if ($city) {
            $normalizedCity = $this->normalizeCity($city);

            $events = Event::orderBy('event_date', 'asc')
                ->get()
                ->filter(function ($event) use ($normalizedCity) {
                    $location = $this->normalizeCity($event->location);
                    return str_contains($location, $normalizedCity);
                })
                ->unique('id')
                ->values();

            if ($events->isEmpty()) {
                return 'I could not find events in ' . ucfirst($city) . '.';
            }

            return $this->formatEventList('Here are the matching events', $events);
        }

        if ($this->isCapacityIntent($message)) {
            $events = Event::withCount('users')
                ->orderBy('event_date', 'asc')
                ->get()
                ->unique('id')
                ->values();

            if ($events->isEmpty()) {
                return 'No events were found.';
            }

            return $events->map(function ($event) {
                return $event->title . ': ' . $event->users_count . '/' . $event->max_participants . ' registered';
            })->implode('; ');
        }

        return 'Sorry, I did not understand that. You can ask about upcoming events, events in a city, capacity, or your registrations.';
    }

    private function isGreeting($message)
    {
        $greetings = [
            'hello', 'hi', 'hey', 'pershendetje', 'tung', 'tungjatjeta', 'cka ka', 'cka po bon'
        ];

        return in_array($message, $greetings);
    }

    private function isMyEventsIntent($message)
    {
        return str_contains($message, 'my events') ||
               str_contains($message, 'my registrations') ||
               str_contains($message, 'my registered events') ||
               $message === 'registrations';
    }

    private function isUpcomingIntent($message)
    {
        return str_contains($message, 'upcoming events') ||
               str_contains($message, 'tell me the upcoming events') ||
               str_contains($message, 'future events') ||
               str_contains($message, 'next events');
    }

    private function isCapacityIntent($message)
    {
        return str_contains($message, 'capacity') ||
               str_contains($message, 'available spots') ||
               str_contains($message, 'how many registered') ||
               str_contains($message, 'participants');
    }

    private function extractCity($message)
    {
        $patterns = [
            '/events in (.+)/i',
            '/show events in (.+)/i',
            '/find events in (.+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $message, $matches)) {
                return trim($matches[1]);
            }
        }

        return null;
    }

    private function normalizeText($text)
    {
        $text = strtolower(trim($text));

        $replace = [
            'ë' => 'e',
            'ç' => 'c',
        ];

        return str_replace(array_keys($replace), array_values($replace), $text);
    }

    private function normalizeCity($city)
    {
        $city = $this->normalizeText($city);

        $map = [
            'prishtina' => 'prishtine',
            'prishtine' => 'prishtine',
            'prizreni' => 'prizren',
            'prizren' => 'prizren',
            'peja' => 'peje',
            'peje' => 'peje',
            'ferizaji' => 'ferizaj',
            'ferizaj' => 'ferizaj',
            'gjilani' => 'gjilan',
            'gjilan' => 'gjilan',
            'gjakova' => 'gjakove',
            'gjakove' => 'gjakove',
        ];

        return $map[$city] ?? $city;
    }

    private function formatEventList($intro, $events)
    {
        $list = $events->map(function ($event) {
            $date = Carbon::parse($event->event_date)->format('Y-m-d H:i');
            return "{$event->title} on {$date} in {$event->location}";
        })->implode('; ');

        return $intro . ': ' . $list . '.';
    }
}