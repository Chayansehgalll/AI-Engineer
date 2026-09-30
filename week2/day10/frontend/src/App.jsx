import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamMessage } from "./api";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);


  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const question = input.trim();


    setInput("");
    setLoading(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: question,
      },
    ]);

    // Create empty assistant message placeholder for streaming
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "",
      },
    ]);

    try {
      await streamMessage(question, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];

          if (lastMessage?.role === "assistant") {
            updated[updated.length - 1] = {
              ...lastMessage,
              text: lastMessage.text + chunk,
            };
          }

          return updated;
        });
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];

        if (lastMessage?.role === "assistant") {
          updated[updated.length - 1] = {
            ...lastMessage,
            text: "Sorry, I could not generate a response right now. Please try again.",
          };
        }

        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSend();
    }
    if (e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <div className="page">
      <div className="chat-container">

        <div className="chat-header">
          <span className="status-dot"></span>
          <h2>Chayan's AI Representative</h2>
        </div>

        <div className="chat-box">
          {messages.length === 0 && (
            <p className="empty-text">
              Ask me about Chayan's experience, skills, projects, or career.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`message-row ${
                m.role === "user" ? "user-row" : "assistant-row"
              }`}
            >
              <div className={`message-bubble ${m.role}`}>
                {m.role === "assistant" ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
                )}
              </div>
            </div>
          ))}

          {loading && messages[messages.length - 1]?.text === "" && (
            <div className="message-row assistant-row">
              <div className="message-bubble assistant typing">
                Thinking...
              </div>
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
            placeholder="Ask about Chayan..."
          />

          <button onClick={handleSend} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>

      </div>
    </div>
  );
}
