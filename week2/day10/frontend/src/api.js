const API_URL = "https://ai-engineer-f0ri.onrender.com";

export async function sendMessage(message) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  const data = await res.json();

  return data.response;
}


export async function streamMessage(message, onChunk) {
  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Failed to stream response");
  }

  if (!res.body) {
    throw new Error("Streaming is not supported by this browser");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, {
      stream: true,
    });

    if (chunk) {
      onChunk(chunk);
    }
  }
}
