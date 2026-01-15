import { useEffect, useRef, useState } from "react";
import "./App.css";

interface Message {
  type: "sent" | "received" | "history";
  content: string;
}

interface StoredMessage {
  content: string;
  timestamp: number;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect to WebSocket server
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to server");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "info") {
          console.log("Info:", data.message);
        } else if (data.type === "history") {
          // Received message history when joining a room
          const historyMessages: Message[] = data.messages.map(
            (msg: StoredMessage) => ({
              type: "history" as const,
              content: msg.content,
            })
          );
          setMessages(historyMessages);
        } else if (data.type === "chat") {
          // Received message from server
          setMessages((prev) => [
            ...prev,
            { type: "received", content: data.content },
          ]);
        } else if (data.type === "error") {
          console.error("Error:", data.message);
        }
      } catch {
        console.error("Failed to parse message:", event.data);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
      setConnected(false);
      setJoined(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({ type: "join", roomId: roomId.trim() }));
    setJoined(true);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current || !joined) return;

    const message = inputMessage.trim();
    wsRef.current.send(JSON.stringify({ type: "chat", content: message }));

    // Add to local messages as "sent"
    setMessages((prev) => [...prev, { type: "sent", content: message }]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!joined) {
        joinRoom();
      } else {
        sendMessage();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Chat App</h1>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-slate-400">
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          {joined && (
            <p className="text-sm text-slate-400 mt-1">Room: {roomId}</p>
          )}
        </div>

        {/* Join Room Section */}
        {!joined ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-white mb-2">
                Join a Room
              </h2>
              <p className="text-slate-400 text-sm">
                Enter a room ID to start chatting
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter room ID..."
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={!connected}
              />
              <button
                onClick={joinRoom}
                disabled={!connected || !roomId.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.type === "sent" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                        msg.type === "sent"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : msg.type === "history"
                          ? "bg-slate-600/50 text-slate-300 rounded-bl-md border border-slate-500/30"
                          : "bg-slate-700 text-slate-100 rounded-bl-md"
                      }`}
                    >
                      {msg.type === "history" && (
                        <span className="text-xs text-slate-400 block mb-1">
                          Previous message
                        </span>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
