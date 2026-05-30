import { useState, useEffect, useRef } from "react";
import { socket } from "../pages/socket";

export default function ChatPanel({ roomId, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("chat-message");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = {
      id: Date.now(),
      text: input.trim(),
      sender: user?.name || "You",
      senderId: user?._id || user?.id,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    socket.emit("chat-message", { roomId, ...msg });
    setMessages((prev) => [...prev, { ...msg, isOwn: true }]);
    setInput("");
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">In-call messages</span>
        <button className="chat-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="36" height="36">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No messages yet.<br/>Say hello!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.isOwn ? "own" : ""}`}>
            {!msg.isOwn && <span className="msg-sender">{msg.sender}</span>}
            <div className="msg-bubble">{msg.text}</div>
            <span className="msg-time">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <input
          className="chat-input"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
        />
        <button type="submit" className="chat-send" disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
