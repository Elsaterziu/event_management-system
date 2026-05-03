import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./assistant.css";

function AssistantPage() {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
  }, [messages]);

  const loadSessions = async () => {
    const res = await api.get("/assistant/sessions");
    setSessions(res.data);

    if (res.data.length) loadMessages(res.data[0].id);
    else newChat();
  };

  const deleteSession = async (id) => {
  try {
    console.log("Deleting:", id);

    await api.delete(`/assistant/sessions/${id}`);

    setSessions((prev) =>
  prev.map((s) =>
    s.id === sessionId ? { ...s, title: newTitle } : s
  )
);

    if (active === id) {
      setActive(null);
    }
  } catch (error) {
    console.error("DELETE ERROR:", error.response || error);
  }
};
  const loadMessages = async (id) => {
    const res = await api.get(`/assistant/session/${id}`);
    setActive(id);
    setMessages(res.data.messages);
  };

  const newChat = async () => {
    const res = await api.post("/assistant/session");
    setActive(res.data.id);
    setMessages(res.data.messages);
    setSessions((prev) => [res.data, ...prev]);
  };

  const send = async () => {
    if (!input.trim()) return;

    const text = input;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");

    const typingId = Date.now();

    setMessages((m) => [
      ...m,
      { id: typingId, role: "assistant", content: "Typing..." },
    ]);

    try {
      const res = await api.post("/assistant/ask", {
        session_id: active,
        message: text,
      });

      const reply = res.data.reply;

      let i = 0;
      let current = "";

      const interval = setInterval(() => {
        current += reply[i];
        i++;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === typingId ? { ...msg, content: current } : msg
          )
        );

        if (i >= reply.length) clearInterval(interval);
      }, 15);

    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? { ...msg, content: "Something went wrong." }
            : msg
        )
      );
    }
  };

  return (
    <div className="assistant-layout">
      <aside className="assistant-sidebar">
  
  <div className="assistant-sidebar-header">
    <h3>Chats</h3>
    <button onClick={newChat}>New</button>
  </div>

  <div className="assistant-session-list">
  {sessions.map((s) => (
    <div key={s.id} className="assistant-session-item-wrapper">

      <button
        className={`assistant-session-item ${
          active === s.id ? "active" : ""
        }`}
        onClick={() => loadMessages(s.id)}
      >
        {s.title}
      </button>

      <button
        className="assistant-session-delete"
        onClick={(e) => {
          e.stopPropagation();
          deleteSession(s.id);
        }}
      >
        ×
      </button>

    </div>
  ))}
</div>

</aside>

      <main className="assistant-main">
        <div className="assistant-messages" ref={messagesRef}>
          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              <div className={`message-bubble ${m.role}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="assistant-composer">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send}>Send</button>
        </div>
      </main>
    </div>
  );
}

export default AssistantPage;