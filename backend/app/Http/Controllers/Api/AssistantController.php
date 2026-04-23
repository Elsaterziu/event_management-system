<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AssistantController extends Controller
{
    public function sessions()
    {
        $user = Auth::user();

        $sessions = ChatSession::where('user_id', $user->id)
            ->latest()
            ->get(['id', 'title', 'created_at', 'updated_at']);

        return response()->json($sessions);
    }

    public function createSession()
    {
        $user = Auth::user();

        $session = ChatSession::create([
            'user_id' => $user->id,
            'title' => 'New conversation',
        ]);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'assistant',
            'content' => 'Hello! I can help you with upcoming events, specific event details, events by city, dates, capacity, and your registrations.',
        ]);

        return response()->json([
            'id' => $session->id,
            'title' => $session->title,
            'messages' => $session->messages()->get(['id', 'role', 'content', 'created_at']),
        ]);
    }

    public function showSession($id)
    {
        $user = Auth::user();

        $session = ChatSession::with('messages:id,chat_session_id,role,content,created_at')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Session not found.'
            ], 404);
        }

        return response()->json([
            'id' => $session->id,
            'title' => $session->title,
            'messages' => $session->messages,
        ]);
    }

    public function destroySession($id)
    {
        $user = Auth::user();

        $session = ChatSession::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Session not found.'
            ], 404);
        }

        $session->delete();

        return response()->json([
            'message' => 'Chat deleted successfully.'
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'session_id' => 'required|integer|exists:chat_sessions,id',
            'message' => 'required|string'
        ]);

        $user = Auth::user();

        $session = ChatSession::where('id', $request->session_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'This session does not belong to the current user.'
            ], 403);
        }

        $userMessage = trim($request->message);

        $savedUserMessage = ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'user',
            'content' => $userMessage,
        ]);

        $reply = $this->generateReply($userMessage);

        $savedAssistantMessage = ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'assistant',
            'content' => $reply,
        ]);

        if ($session->title === 'New conversation') {
            $session->update([
                'title' => $this->generateSessionTitle($userMessage),
            ]);
        }

        return response()->json([
            'reply' => $reply,
            'user_message' => $savedUserMessage,
            'assistant_message' => $savedAssistantMessage,
            'session' => [
                'id' => $session->id,
                'title' => $session->fresh()->title,
            ]
        ]);
    }

    private function generateReply($rawMessage)
    {
        $message = $this->normalizeText($rawMessage);

        if ($this->isGreeting($message)) {
            return 'Hello! I can help you with upcoming events, specific event details, events by city, dates, capacity, and your registrations.';
        }

        if ($this->isMyEventsIntent($message)) {
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

            return 'Your registered events are: ' . $events->pluck('title')->implode(', ') . '.';
        }

        $specificEvent = $this->findSpecificEvent($message);
        if ($specificEvent) {
            return $this->formatSingleEventDetails($specificEvent, $message);
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

        return 'Sorry, I did not understand that. You can ask about upcoming events, a specific event, events in a city, capacity, or your registrations.';
    }

    private function generateSessionTitle($message)
    {
        $title = trim($message);
        $title = preg_replace('/\s+/', ' ', $title);

        return mb_strimwidth($title, 0, 40, '...');
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
               str_contains($message, 'participants') ||
               str_contains($message, 'spots left');
    }

    private function extractCity($message)
    {
        $patterns = [
            '/events in (.+)/i',
            '/show events in (.+)/i',
            '/find events in (.+)/i',
            '/what events are in (.+)/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $message, $matches)) {
                return trim($matches[1]);
            }
        }

        return null;
    }

    private function findSpecificEvent($message)
    {
        $cleanMessage = $this->stripEventQuestionWords($message);

        $events = Event::withCount('users')->get();

        foreach ($events as $event) {
            $title = $this->normalizeText($event->title);

            if (
                str_contains($message, $title) ||
                str_contains($cleanMessage, $title) ||
                str_contains($title, $cleanMessage) ||
                similar_text($cleanMessage, $title, $percent) && $percent >= 75
            ) {
                return $event;
            }
        }

        return null;
    }

    private function stripEventQuestionWords($message)
    {
        $phrases = [
            'tell me about ',
            'details about ',
            'details for ',
            'info about ',
            'information about ',
            'when is ',
            'where is ',
            'what time is ',
            'what time does ',
            'show me ',
            'tell me ',
        ];

        $cleaned = $message;

        foreach ($phrases as $phrase) {
            if (str_starts_with($cleaned, $phrase)) {
                $cleaned = trim(substr($cleaned, strlen($phrase)));
            }
        }

        $cleaned = preg_replace('/^the\s+/i', '', $cleaned);

        return trim($cleaned);
    }

    private function formatSingleEventDetails($event, $message)
    {
        $eventDate = Carbon::parse($event->event_date);
        $registered = $event->users_count ?? 0;
        $maxParticipants = (int) ($event->max_participants ?? 0);
        $remaining = max($maxParticipants - $registered, 0);

        if (str_contains($message, 'when')) {
            return "{$event->title} is on " . $eventDate->format('Y-m-d') . " at " . $eventDate->format('H:i') . ".";
        }

        if (str_contains($message, 'where')) {
            return "{$event->title} will take place in {$event->location}.";
        }

        if (str_contains($message, 'spots left') || str_contains($message, 'available spots')) {
            return "{$event->title} has {$remaining} spots left.";
        }

        return "Event details for {$event->title}: Date: " .
            $eventDate->format('Y-m-d') .
            ", Time: " . $eventDate->format('H:i') .
            ", Location: {$event->location}" .
            ", Max participants: {$maxParticipants}" .
            ", Registered: {$registered}" .
            ", Remaining spots: {$remaining}.";
    }

    private function normalizeText($text)
    {
        $text = strtolower(trim($text));

        $replace = [
            'ë' => 'e',
            'ç' => 'c',
            '?' => '',
            '.' => '',
            ',' => '',
            '!' => '',
            ':' => '',
            ';' => '',
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