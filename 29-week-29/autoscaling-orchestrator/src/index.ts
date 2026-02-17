// ─────────────────────────────────────────────────────────
// src/index.ts — Application entry point
// ─────────────────────────────────────────────────────────
// This is the FIRST file that runs when you start the app.
// It:
//   1. Loads environment variables from .env
//   2. Creates an Express server
//   3. Registers middleware (JSON parsing)
//   4. Mounts the routes
//   5. Starts listening on the configured port
// ─────────────────────────────────────────────────────────

import express from "express";
import { config } from "./config";
import machineRoutes from "./routes/machines";

// ── 1. Create the Express application ───────────────────
const app = express();

// ── 2. Middleware ────────────────────────────────────────
// express.json() parses incoming JSON request bodies
// so we can read req.body as a JavaScript object
app.use(express.json());

// ── 3. Health check endpoint ────────────────────────────
// Used by load balancers and Docker to check if the app is alive.
// Returns 200 OK with uptime info.
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── 4. Root endpoint — welcome message ──────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "Autoscaling Orchestrator API",
    version: "1.0.0",
    endpoints: {
      health: "GET  /health",
      listMachines: "GET  /machines",
      createMachine: "POST /machines  { projectName: string }",
      getMachine: "GET  /machines/:id",
      deleteMachine: "DELETE /machines/:id",
    },
  });
});

// ── 5. Mount machine routes at /machines ────────────────
// All routes defined in machines.ts will be prefixed
// with /machines. For example:
//   router.post("/") becomes POST /machines
//   router.get("/:id") becomes GET /machines/:id
app.use("/machines", machineRoutes);

// ── 6. Start the server ─────────────────────────────────
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   🚀 Autoscaling Orchestrator is running!       ║
  ║   📡 http://localhost:${config.port}                   ║
  ║   🏥 http://localhost:${config.port}/health             ║
  ║   🖥️  http://localhost:${config.port}/machines           ║
  ╚══════════════════════════════════════════════════╝
  `);
});

export default app;
