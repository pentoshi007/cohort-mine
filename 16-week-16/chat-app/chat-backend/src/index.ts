// import { WebSocketServer, WebSocket } from "ws";

// const wss = new WebSocketServer({ port: 8080 });

// // Store rooms and their members
// // Map of room names to the set of WebSocket connections in that room.
// // This allows us to track which clients are in which rooms and
// // broadcast messages only to clients in the same room.
// const rooms: Map<string, Set<WebSocket>> = new Map();

// wss.on("connection", (socket) => {
//   console.log("New client connected");
//   socket.send(
//     JSON.stringify({
//       type: "info",
//       message:
//         'Welcome to the chat. Send {"type": "join", "roomName": "yourRoom"} to join a room.',
//     })
//   );

//   let currentRoom: string | null = null;

//   socket.on("message", (data) => {
//     try {
//       const parsed = JSON.parse(data.toString());

//       if (parsed.type === "join") {
//         const roomName = parsed.roomName || parsed.room;

//         // Leave current room if already in one
//         if (currentRoom && rooms.has(currentRoom)) {
//           rooms.get(currentRoom)!.delete(socket);
//           if (rooms.get(currentRoom)!.size === 0) {
//             rooms.delete(currentRoom);
//           }
//         }

//         // Join the new room (create it if it doesn't exist)
//         if (!rooms.has(roomName)) {
//           rooms.set(roomName, new Set());
//           console.log(`Room created: ${roomName}`);
//         }
//         rooms.get(roomName)!.add(socket);
//         currentRoom = roomName;

//         console.log(`Client joined room: ${roomName}`);
//         socket.send(
//           JSON.stringify({ type: "info", message: `Joined room: ${roomName}` })
//         );
//       } else if (parsed.type === "create") {
//         const roomName = parsed.roomName || parsed.room;

//         // Create a new room if it doesn't exist
//         if (rooms.has(roomName)) {
//           socket.send(
//             JSON.stringify({
//               type: "error",
//               message: `Room '${roomName}' already exists`,
//             })
//           );
//           return;
//         }

//         rooms.set(roomName, new Set());
//         console.log(`Room created: ${roomName}`);
//         socket.send(
//           JSON.stringify({ type: "info", message: `Room created: ${roomName}` })
//         );
//       } else if (parsed.type === "message") {
//         if (!currentRoom) {
//           socket.send(
//             JSON.stringify({
//               type: "error",
//               message: "You must join a room first",
//             })
//           );
//           return;
//         }

//         const messageContent = parsed.content;
//         console.log(`Message in room ${currentRoom}: ${messageContent}`);

//         // Broadcast message to all members in the room
//         const roomMembers = rooms.get(currentRoom);
//         if (roomMembers) {
//           roomMembers.forEach((member) => {
//             member.send(
//               JSON.stringify({
//                 type: "message",
//                 room: currentRoom,
//                 content: messageContent,
//               })
//             );
//           });
//         }
//       }
//     } catch (error) {
//       console.log("Invalid message format:", data.toString());
//       socket.send(
//         JSON.stringify({
//           type: "error",
//           message: "Invalid message format. Use JSON.",
//         })
//       );
//     }
//   });

//   socket.on("close", () => {
//     // Remove socket from current room when disconnected
//     if (currentRoom && rooms.has(currentRoom)) {
//       rooms.get(currentRoom)!.delete(socket);
//       if (rooms.get(currentRoom)!.size === 0) {
//         rooms.delete(currentRoom);
//       }
//     }
//     console.log("Client disconnected");
//   });
// });
//=========================================
import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8080 });

// Store room members
const rooms: Map<string, Set<WebSocket>> = new Map();

// Store message history per room
interface StoredMessage {
  content: string;
  timestamp: number;
}
const roomMessages: Map<string, StoredMessage[]> = new Map();

interface JoinMessage {
  type: "join";
  roomId: string;
}

interface ChatMessageContent {
  type: "chat";
  content: string;
}

type ChatMessage = JoinMessage | ChatMessageContent;

wss.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("message", (message: Buffer) => {
    try {
      const parsedMessage: ChatMessage = JSON.parse(message.toString());

      if (parsedMessage.type === "join") {
        const roomId = parsedMessage.roomId;

        // Create room if it doesn't exist
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
          roomMessages.set(roomId, []);
        }

        rooms.get(roomId)!.add(socket);
        console.log(
          `Client joined room: ${roomId}, total members: ${
            rooms.get(roomId)!.size
          }`
        );

        // Send message history to the new member
        const history = roomMessages.get(roomId) || [];
        if (history.length > 0) {
          socket.send(
            JSON.stringify({
              type: "history",
              messages: history,
            })
          );
        }

        socket.send(
          JSON.stringify({ type: "info", message: `Joined room: ${roomId}` })
        );
      } else if (parsedMessage.type === "chat") {
        const content = parsedMessage.content;
        const roomEntry = Array.from(rooms.entries()).find(([_, members]) =>
          members.has(socket)
        );

        if (roomEntry) {
          const [roomId, members] = roomEntry;

          // Store message in history
          const storedMessage: StoredMessage = {
            content,
            timestamp: Date.now(),
          };
          roomMessages.get(roomId)!.push(storedMessage);

          // Broadcast to all members except sender
          members.forEach((member: WebSocket) => {
            if (member === socket) return;

            if (member.readyState === WebSocket.OPEN) {
              member.send(JSON.stringify({ type: "chat", content }));
            }
          });
        } else {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "You must join a room first",
            })
          );
        }
      }
    } catch (error) {
      console.error("Invalid message format:", message.toString());
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format. Use JSON.",
        })
      );
    }
  });

  socket.on("close", () => {
    // Remove socket from all rooms on disconnect
    rooms.forEach((members, roomId) => {
      if (members.has(socket)) {
        members.delete(socket);
        console.log(
          `Client left room: ${roomId}, remaining members: ${members.size}`
        );
        // Optionally clean up empty rooms (but keep messages)
        if (members.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
    console.log("Client disconnected");
  });
});
