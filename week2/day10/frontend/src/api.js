import axios from "axios";

export async function sendMessage(message) {
  const response = await axios.post("http://localhost:8000/chat", {
    message,
  });

  return response.data.answer;
}