import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./assistant.css";

function AssistantPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState("");

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading, activeSessionId, messages]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setError("");

      const res = await api.get("/assistant/sessions");
      const fetchedSessions = Array.isArray(res.data) ? res.data : [];

      setSessions(fetchedSessions);

      if (fetchedSessions.length > 0) {
        await loadSessionMessages(fetchedSessions[0].id);
      } else {
        await startNewChat();
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Failed to load assistant sessions.");
    } finally {
      setLoadingSessions(false);
      inputRef.current?.focus();
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      setError("");

      const res = await api.get(`/assistant/session/${sessionId}`);
      const session = res.data;

      setActiveSessionId(session.id);
      setMessages(session.messages || []);
    } catch (err) {
      console.error("Failed to load session messages:", err);
      setError("Failed to load chat messages.");
    } finally {
      inputRef.current?.focus();
    }
  };

  const startNewChat = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.post("/assistant/session");
      const newSession = res.data;

      setActiveSessionId(newSession.id);
      setMessages(newSession.messages || []);

      setSessions((prev) => {
        const exists = prev.some((s) => s.id === newSession.id);
        if (exists) return prev;
        return [newSession, ...prev];
      });

      setInput("");
    } catch (err) {
      console.error("Failed to create new session:", err);
      setError("Failed to create a new chat.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading || !activeSessionId) return;

    const tempUserMessage = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/assistant/ask", {
        session_id: activeSessionId,
        message: text,
      });

      const assistantMessage = res?.data?.assistant_message;

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content:
              res?.data?.reply ||
              "Sorry, I could not understand that. Please try again.",
          },
        ]);
      }

      if (res?.data?.session) {
        setSessions((prev) =>
          prev.map((session) =>
            session.id === res.data.session.id
              ? { ...session, title: res.data.session.title }
              : session
          )
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to get assistant response.");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const deleteSession = async (sessionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this chat?");
    if (!confirmDelete) return;

    try {
      setError("");

     await api.post(`/assistant/session/${sessionId}/delete`);

      const updatedSessions = sessions.filter((session) => session.id !== sessionId);
      setSessions(updatedSessions);

      if (activeSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          await loadSessionMessages(updatedSessions[0].id);
        } else {
          await startNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError("Failed to delete chat.");
    }
  };

  const handleSelectSession = async (sessionId) => {
    if (loading) return;
    await loadSessionMessages(sessionId);
  };

  return (
    <div className="assistant-page">
      <div className="assistant-layout">
        <aside className="assistant-sidebar">
          <div className="assistant-sidebar-header">
            <h3>Chats</h3>
            <button type="button" onClick={startNewChat} disabled={loading}>
              New chat
            </button>
          </div>

          <div className="assistant-session-list">
            {loadingSessions ? (
              <p>Loading...</p>
            ) : sessions.length === 0 ? (
              <p>No chats yet.</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`assistant-session-item-wrapper ${
                    activeSessionId === session.id ? "active" : ""
                  }`}
                >
                  <button
                    type="button"
                    className={`assistant-session-item ${
                      activeSessionId === session.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    {session.title || "New conversation"}
                  </button>

                  <button
                    type="button"
                    className="assistant-session-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    title="Delete chat"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="assistant-main">
          <div className="assistant-header">
            <div>
              <h3>AI Event Assistant</h3>
              <p>
                Ask about upcoming events, event details, city, dates, capacity,
                and your registrations.
              </p>
            </div>
          </div>

          {error && <div className="assistant-error">{error}</div>}

          <div className="assistant-messages" ref={messagesContainerRef}>
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
          </div>

          <div className="assistant-composer">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about events..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={!activeSessionId}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim() || !activeSessionId}
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