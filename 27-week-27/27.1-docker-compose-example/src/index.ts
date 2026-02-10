import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (_error) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

app.post("/users", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    const user = await prisma.user.create({
      data: { username },
    });
    return res.status(201).json(user);
  } catch (_error) {
    return res.status(409).json({ error: "username already exists" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "user deleted" });
  } catch (_error) {
    return res.status(404).json({ error: "user not found" });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
