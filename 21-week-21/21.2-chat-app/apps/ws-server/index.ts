import { WebSocketServer, WebSocket } from "ws";
import { URL } from "url";

type ClientMeta = {
  ws: WebSocket;
  userId: string;
  name?: string;
  roomId: string;
};

// roomId -> Set of clients
const rooms = new Map<string, Set<ClientMeta>>();

const wss = new WebSocketServer({ port: 3002 });

function addClientToRoom(client: ClientMeta) {
  const existing = rooms.get(client.roomId) ?? new Set<ClientMeta>();
  existing.add(client);
  rooms.set(client.roomId, existing);
}

function removeClientFromRoom(client: ClientMeta) {
  const existing = rooms.get(client.roomId);
  if (!existing) return;
  existing.delete(client);
  if (existing.size === 0) {
    rooms.delete(client.roomId);
  }
}

function broadcastToRoom(roomId: string, payload: unknown) {
  const clients = rooms.get(roomId);
  if (!clients) return;

  const data = JSON.stringify(payload);
  // Use forEach to avoid relying on iterable spread semantics
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

wss.on("connection", (ws, req) => {
  if (!req.url) {
    ws.close(1008, "Missing URL");
    return;
  }

  const url = new URL(req.url, "ws://localhost:3002");
  const roomId = url.searchParams.get("roomId") ?? "";
  const userId = url.searchParams.get("userId") ?? "";
  const name = url.searchParams.get("name") ?? undefined;

  if (!roomId || !userId) {
    ws.close(1008, "Missing roomId or userId");
    return;
  }

  const client: ClientMeta = { ws, userId, name, roomId };
  addClientToRoom(client);

  console.log(`Client ${userId} joined room ${roomId}`);

  // Notify others (and self) that someone joined
  broadcastToRoom(roomId, {
    type: "system",
    event: "user-joined",
    roomId,
    userId,
    name,
    timestamp: new Date().toISOString(),
  });

  ws.on("message", (raw) => {
    let text = raw.toString();

    // Allow both plain text and simple JSON { message }
    let message = text;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.message === "string") {
        message = parsed.message;
      }
    } catch {
      // ignore JSON parse error, treat as plain text
    }

    const payload = {
      type: "chat-message" as const,
      roomId: client.roomId,
      userId: client.userId,
      name: client.name,
      message,
      timestamp: new Date().toISOString(),
    };

    broadcastToRoom(client.roomId, payload);
  });

  ws.on("close", () => {
    console.log(`Client ${userId} left room ${roomId}`);
    removeClientFromRoom(client);
    broadcastToRoom(roomId, {
      type: "system",
      event: "user-left",
      roomId,
      userId,
      name,
      timestamp: new Date().toISOString(),
    });
  });
});

console.log("WebSocket server listening on ws://localhost:3002");