"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "@repo/ui/TextInput";
import { ChatBubble } from "@repo/ui/chat-bubble";

type RouteParams = {
  params: Promise<{ roomId: string }>;
};

type ChatMessage = {
  id: string;
  type: "chat-message" | "system";
  roomId: string;
  userId?: string;
  name?: string;
  message?: string;
  event?: "user-joined" | "user-left";
  timestamp: string;
};

export default function ChatRoom({ params }: RouteParams) {
  const { roomId } = use(params);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting",
  );
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fallbackName = useMemo(
    () => `Guest-${Math.floor(Math.random() * 10_000)}`,
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setStatus("connecting");
        setError(null);

        const displayName = name.trim() || fallbackName;

        const res = await fetch(`http://localhost:3001/rooms/${roomId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: displayName }),
        });

        if (!res.ok) {
          throw new Error(`Failed to join room: ${res.statusText}`);
        }

        const data = await res.json();
        if (cancelled) return;

        const joinedUserId = data.userId as string;
        const wsUrl = (data.wsUrl as string) ?? "ws://localhost:3002";

        setUserId(joinedUserId);
        setName(displayName);

        const url = new URL(wsUrl);
        url.searchParams.set("roomId", roomId);
        url.searchParams.set("userId", joinedUserId);
        url.searchParams.set("name", displayName);

        const ws = new WebSocket(url.toString());
        wsRef.current = ws;

        ws.onopen = () => {
          if (cancelled) return;
          setStatus("connected");
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data as string);
            const base: ChatMessage = {
              id: `${Date.now()}-${Math.random()}`,
              roomId,
              timestamp: parsed.timestamp ?? new Date().toISOString(),
              type: parsed.type ?? "system",
              userId: parsed.userId,
              name: parsed.name,
              message: parsed.message,
              event: parsed.event,
            };

            setMessages((prev) => [...prev, base]);
          } catch {
          }
        };

        ws.onclose = () => {
          if (cancelled) return;
          setStatus("disconnected");
        };

        ws.onerror = () => {
          if (cancelled) return;
          setError("WebSocket error");
        };
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Failed to connect");
        setStatus("disconnected");
      }
    }

    init();

    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomId, fallbackName, name]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({
        message: message.trim(),
      }),
    );

    setMessage("");
  };

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-2 py-2 border-b bg-white -mx-4 -mt-4 shadow-sm">
        Room: {roomId}
      </h1>

      <div className="text-center text-sm text-gray-500 mb-2">
        Status:{" "}
        <span
          className={
            status === "connected"
              ? "text-green-600"
              : status === "connecting"
              ? "text-yellow-600"
              : "text-red-600"
          }
        >
          {status}
        </span>
      </div>

      {error && (
        <div className="mb-2 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto py-4 px-2 space-y-2">
        {messages.length === 0 && (
          <ChatBubble
            message="Welcome! Start the conversation by sending a message."
            isMe={false}
            sender="System"
            timestamp={new Date().toLocaleTimeString()}
          />
        )}

        {messages.map((msg) => {
          if (msg.type === "system") {
            const text =
              msg.event === "user-joined"
                ? `${msg.name ?? "Someone"} joined the room`
                : msg.event === "user-left"
                ? `${msg.name ?? "Someone"} left the room`
                : msg.message ?? "";

            return (
              <div
                key={msg.id}
                className="text-center text-xs text-gray-400 italic"
              >
                {text} • {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            );
          }

          const isMe = msg.userId && userId && msg.userId === userId;

          return (
            <ChatBubble
              key={msg.id}
              message={msg.message ?? ""}
              isMe={!!isMe}
              sender={isMe ? "You" : msg.name ?? "Guest"}
              timestamp={new Date(msg.timestamp).toLocaleTimeString()}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-3xl mx-auto gap-2">
        <TextInput
          className="flex-1"
          placeholder="Type a message..."
          value={message}
          onChange={(val: string) => setMessage(val)}
          // @ts-expect-error TextInput doesn't expose keyboard typings
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={status !== "connected"}
          className="bg-blue-500 disabled:bg-gray-400 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
