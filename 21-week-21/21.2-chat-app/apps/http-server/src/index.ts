import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(express.json());

// Simple health-check so the frontend can verify connectivity
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Join a room and get a userId + WebSocket details (no DB, all in-memory)
app.post("/rooms/:roomId/join", (req, res) => {
  const { roomId } = req.params;
  const { name } = req.body || {};

  const userId = randomUUID();

  res.json({
    roomId,
    userId,
    name: typeof name === "string" && name.trim().length > 0 ? name.trim() : undefined,
    wsUrl: "ws://localhost:3002",
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`HTTP server started on port ${PORT}`);
});