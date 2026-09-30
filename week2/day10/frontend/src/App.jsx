import { useState, useEffect, useRef } from "react";
import { streamMessage } from "./api";
import "./App.css";

// Built-in lightweight Markdown & Paragraph parser (No extra npm packages needed!)
function FormattedText({ text }) {
  if (!text) return null;

  // Split text by lines
  const lines = text.split("\n");

  return (
    <div className="formatted-text">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Handle empty line spacing
        if (!trimmed) {
          return <div key={lineIdx} style={{ height: "8px" }} />;
        }

        // Check if line is a bullet point (- or *)
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const contentText = isBullet ? trimmed.substring(2) : line;

        // Parse **bold** tags inside the string
        const parts = contentText.split(/(\*\*.*?\*\*)/g);

        const parsedContent = parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (isBullet) {
          return (
            <div
              key={lineIdx}
              style={{
                display: "flex",
                gap: "8px",
                marginLeft: "6px",
                marginBottom: "4px",
              }}
            >
              <span>•</span>
              <div>{parsedContent}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} style={{ margin: "0 0 6px 0", lineHeight: "1.5" }}>
            {parsedContent}
          </p>
        );
      })}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const question = input.trim();

    setInput("");
    setLoading(true);

    // Add user message & initialize empty assistant message
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "assistant", text: "" },
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

          {messages.map((m, i) => {
            // Hide empty assistant placeholder while loading/thinking
            if (m.role === "assistant" && !m.text) return null;

            return (
              <div
                key={i}
                className={`message-row ${
                  m.role === "user" ? "user-row" : "assistant-row"
                }`}
              >
                <div className={`message-bubble ${m.role}`}>
                  {m.role === "assistant" ? (
                    <FormattedText text={m.text} />
                  ) : (
                    <span>{m.text}</span>
                  )}
                </div>
              </div>
            );
          })}

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