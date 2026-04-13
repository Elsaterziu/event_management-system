import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./assistant.css";

const STORAGE_KEY = "assistant_messages";

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I can help you with upcoming events, events by city, dates, capacity, and your registrations.",
  },
];

function AssistantPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);

        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        } else {
          setMessages(INITIAL_MESSAGES);
        }
      } else {
        setMessages(INITIAL_MESSAGES);
      }
    } catch (err) {
      console.error("Failed to read assistant messages from localStorage:", err);
      setMessages(INITIAL_MESSAGES);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.error("Failed to save assistant messages to localStorage:", err);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/assistant/chat", {
         session_id: 1,
        message: text,
      });

      const reply =
        res?.data?.reply ||
        "Sorry, I could not understand that. Please try again.";

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to get assistant response.");

      const errorMessage = {
        id: Date.now() + 2,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    const freshMessages = [
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Hello! I can help you with upcoming events, events by city, dates, capacity, and your registrations.",
      },
    ];

    setMessages(freshMessages);
    setInput("");
    setError("");

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshMessages));
    } catch (err) {
      console.error("Failed to reset assistant messages:", err);
    }
  };

  return (
    <div className="assistant-page">
      <div className="assistant-layout single-chat">
        <main className="assistant-main full-width">
          <div className="assistant-header">
            <div>
              <h3>AI Event Assistant</h3>
              <p>
                Ask about upcoming events, city, dates, capacity, and your
                registrations.
              </p>
            </div>

            <button type="button" onClick={startNewChat}>
              New chat
            </button>
          </div>

          {error && <div className="assistant-error">{error}</div>}

          <div className="assistant-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.role}`}>
                <div className={`message-bubble ${msg.role}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant">
                <div className="message-bubble assistant">Typing...</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="assistant-composer">
            <input
              type="text"
              placeholder="Ask about events..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  sendMessage();
                }
              }}
              disabled={loading}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssistantPage;