// ─────────────────────────────────────────────────────────
// src/routes/machines.ts — REST API routes for managing EC2 instances
// ─────────────────────────────────────────────────────────
// These routes are the HTTP interface to the AWS service.
// The frontend (or Postman / curl) calls these endpoints,
// and they call the AWS service functions internally.
//
// Route Summary:
//   POST   /machines      → Create a new machine
//   GET    /machines      → List all machines
//   GET    /machines/:id  → Get details of one machine
//   DELETE /machines/:id  → Terminate a machine
// ─────────────────────────────────────────────────────────

import { Router, Request, Response } from "express";
import {
  createMachine,
  deleteMachine,
  listMachines,
  getMachineById,
} from "../services/aws";

// Create an Express Router (a mini-app that handles a group of routes)
const router = Router();

// ─────────────────────────────────────────────────────────
// POST /machines — Create a new EC2 instance
// ─────────────────────────────────────────────────────────
// Request body: { "projectName": "my-cool-project" }
// Response:     { "instanceId": "i-xxx", "state": "pending", ... }
router.post("/", async (req: Request, res: Response) => {
  try {
    // 1. Read projectName from the request body
    const { projectName } = req.body;

    // 2. Validate — we MUST have a project name
    if (!projectName || typeof projectName !== "string") {
      res.status(400).json({
        error: "Missing or invalid 'projectName' in request body",
        example: { projectName: "my-cool-project" },
      });
      return;
    }

    // 3. Call the AWS service to launch the instance
    console.log(`🚀 Creating machine for project: ${projectName}`);
    const result = await createMachine(projectName);

    // 4. Return success
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error creating machine:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────
// GET /machines — List all instances managed by us
// ─────────────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const machines = await listMachines();
    res.json({
      success: true,
      count: machines.length,
      data: machines,
    });
  } catch (error: any) {
    console.error("❌ Error listing machines:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────
// GET /machines/:id — Get details of one instance
// ─────────────────────────────────────────────────────────
// URL param :id = the EC2 instance ID (e.g. i-0abc123def456)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const machine = await getMachineById(id);

    if (!machine) {
      res.status(404).json({
        success: false,
        error: `Machine ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: machine,
    });
  } catch (error: any) {
    console.error("❌ Error getting machine:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /machines/:id — Terminate an instance
// ─────────────────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    console.log(`🗑️  Terminating machine: ${id}`);
    const result = await deleteMachine(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error deleting machine:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
