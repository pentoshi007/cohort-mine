import { WebSocketServer }  from "ws";
import { client } from "@repo/db/client";

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', async (ws) => {
  console.log('Client connected');
  const username = Math.random().toString(36).substring(2, 15);
  const password = Math.random().toString(36).substring(2, 15);
  const user = await client.user.create({
    data: {
      username,
      password,
    },
  });
});

wss.on('error', (error) => {
  console.error('WebSocket error:', error);
});