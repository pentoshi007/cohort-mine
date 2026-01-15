// ==========================================
// WEBSOCKETS vs POLLING - Complete Notes
// ==========================================

// ==========================================
// 1. WHAT IS POLLING?
// ==========================================
// Polling is a technique where the client repeatedly asks the server 
// for new data at regular intervals (e.g., every 1-5 seconds).

// Example of Polling:
/*
setInterval(async () => {
    const response = await fetch('/api/messages');
    const data = await response.json();
    updateUI(data);
}, 3000); // Poll every 3 seconds
*/

// Types of Polling:
// 1. Short Polling: Client sends requests at fixed intervals
// 2. Long Polling: Server holds the request open until new data is available

// ==========================================
// 2. WHAT IS WEBSOCKET?
// ==========================================
// WebSocket is a protocol providing full-duplex (two-way) communication 
// over a single TCP connection. Once established, both client and server 
// can send messages at any time without the overhead of HTTP requests.

// WebSocket Connection Lifecycle:
// 1. Client initiates HTTP handshake with "Upgrade: websocket" header
// 2. Server responds with 101 Switching Protocols
// 3. Connection is now upgraded to WebSocket
// 4. Both parties can send/receive messages freely
// 5. Either party can close the connection

// Example WebSocket (Client-side):
/*
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to server');
    ws.send('Hello Server!');
};

ws.onmessage = (event) => {
    console.log('Received:', event.data);
};

ws.onclose = () => {
    console.log('Disconnected from server');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
*/

// ==========================================
// 3. POLLING vs WEBSOCKET - COMPARISON
// ==========================================

/*
┌─────────────────┬───────────────────────────┬───────────────────────────┐
│ Aspect          │ Polling                   │ WebSocket                 │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Connection      │ New connection per request│ Single persistent conn    │
│ Latency         │ High (interval-based)     │ Low (real-time)           │
│ Server Load     │ High (constant requests)  │ Low (event-based)         │
│ Bandwidth       │ Wasteful (empty responses)│ Efficient (only data)     │
│ Complexity      │ Simple to implement       │ More complex              │
│ Scalability     │ Poor for real-time apps   │ Excellent for real-time   │
│ Direction       │ Client → Server only      │ Bidirectional             │
│ Overhead        │ HTTP headers every request│ Minimal after handshake   │
└─────────────────┴───────────────────────────┴───────────────────────────┘
*/

// ==========================================
// 4. INTERVIEW QUESTION: Why use WebSockets instead of Polling?
// ==========================================

/*
QUESTION: "Why don't you use polling instead of WebSockets?"

ANSWER:

1. **Real-time Requirements**:
   - WebSockets provide true real-time communication with sub-millisecond latency
   - Polling has inherent delay based on polling interval
   - For chat apps, live gaming, stock tickers - milliseconds matter!

2. **Resource Efficiency**:
   - Polling: Each request = new TCP connection + HTTP headers (~800 bytes overhead)
   - WebSocket: Single persistent connection, minimal frame overhead (~2-6 bytes)
   - With 1000 users polling every second = 1000 HTTP requests/sec
   - With WebSockets = 1000 persistent connections, messages only when needed

3. **Server Load**:
   - Polling hammers the server with requests even when there's no new data
   - 90% of polling requests might return "no new data" - wasted resources!
   - WebSockets: Server pushes only when there's actual data

4. **Bandwidth Savings**:
   - Polling: HTTP headers sent with every request/response
   - WebSocket frames are lightweight (2-10 bytes overhead vs 800+ bytes for HTTP)

5. **Bidirectional Communication**:
   - Polling is unidirectional (client asks, server responds)
   - WebSocket allows server to push updates instantly without client asking

6. **Battery & Mobile Considerations**:
   - Constant polling drains mobile battery
   - WebSockets are more battery-friendly (no constant reconnections)

WHEN TO USE POLLING INSTEAD:
- Simple use cases with infrequent updates (e.g., checking email every 5 min)
- When WebSocket support is not available (very old browsers, restrictive firewalls)
- When hosting doesn't support long-lived connections
- Very simple applications where real-time isn't critical

CONCLUSION:
"For applications requiring real-time updates like chat, notifications, live feeds, 
collaborative editing, or gaming - WebSockets are the clear winner due to:
- Lower latency
- Reduced server load  
- Better resource efficiency
- True bidirectional communication"
*/

// ==========================================
// 5. WebSocket Server Example (using 'ws' library)
// ==========================================

/*
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        
        // Broadcast to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
*/

// ==========================================
// 6. Key WebSocket Concepts
// ==========================================

/*
1. Connection States:
   - CONNECTING (0): Connection not yet open
   - OPEN (1): Connection is open and ready
   - CLOSING (2): Connection is closing
   - CLOSED (3): Connection is closed

2. Frame Types:
   - Text frames
   - Binary frames
   - Ping/Pong frames (heartbeat)
   - Close frames

3. Common Use Cases:
   - Chat applications
   - Live notifications
   - Real-time dashboards
   - Multiplayer games
   - Collaborative editing (Google Docs)
   - Live sports scores
   - Stock market tickers

4. Libraries:
   - Server: ws, socket.io, uWebSockets.js
   - Client: Native WebSocket API, socket.io-client
*/

// ==========================================
// 7. Socket.IO vs Native WebSocket
// ==========================================

/*
Socket.IO provides:
- Automatic reconnection
- Room/namespace support  
- Fallback to polling if WebSocket fails
- Built-in acknowledgments
- Broadcast capabilities

Use Native WebSocket when:
- You need lightweight solution
- Full control over protocol
- No need for fallbacks

Use Socket.IO when:
- Building complex real-time apps
- Need rooms/namespaces
- Want automatic reconnection
- Need fallback support
*/
// ==========================================
// 8. SCALING WEBSOCKETS (Horizontal Scaling)
// ==========================================

/*
PROBLEM with multiple servers:
- User A connects to WS Server 1
- User B connects to WS Server 2
- If User A sends a message to User B, Server 1 doesn't know about User B's connection on Server 2.
- Scaling strictly with a Load Balancer doesn't work for direct messaging because connections are stateful and isolated.

SOLUTION: Pub/Sub Architecture (e.g., Redis, Kafka, NATS)
- All WebSocket servers connect to a central Pub/Sub system.
- When Server 1 receives a message for a specific room/topic:
  1. It publishes the message to the Pub/Sub bus.
  2. The Pub/Sub bus broadcasts it to ALL subscribed WebSocket servers.
  3. Server 2 receives the event, checks if it has relevant users, and forwards the message.

DIAGRAM:
      [Client]      [Client]       [Client]
         |              |             |
    +----v----+    +----v----+   +----v----+
    |  WS Svr |    |  WS Svr |   |  WS Svr |
    |    1    |    |    2    |   |    3    |
    +----+----+    +----+----+   +----+----+
         |              |             |
         |         (Publish)          |
         +------------->+<------------+
                        |
                  [ PUB / SUB ]
                  ( e.g Redis )
                        |
         +<-------------+------------->
         |          (Subscribe)       |
    (Broadcasts to all servers to find target user)
*/


// ==========================================
//npm init -y
//tsc -init
//tsc -w
//npm install ws @types/ws


import {WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});
//even handler
wss.on("connection",(socket)=>{
    console.log("New client connected");
    socket.send('hello, You are connected');
    socket.on("message",(e)=>{
        if(e.toString()==="ping"){
            socket.send("pong")
            console.log("pong sent")
        }
    })
})

