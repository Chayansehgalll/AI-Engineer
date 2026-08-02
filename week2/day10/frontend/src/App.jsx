import { useState, useEffect, useRef } from "react";
import { sendMessage } from "./api";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const answer = await sendMessage(question);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong." },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <div className="page">
      <div className="chat-container">
        <div className="chat-header">
          <span className="status-dot"></span>
          <h2>Chayan's AI Representative</h2>
        </div>

        <div className="chat-box">
          {messages.length === 0 && !loading && (
            <p className="empty-text">Ask me anything about Chayan.</p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`message-row ${m.role === "user" ? "user-row" : "assistant-row"}`}
            >
              <div className={`message-bubble ${m.role}`}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant-row">
              <div className="message-bubble assistant">Typing...</div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />
          <button onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}