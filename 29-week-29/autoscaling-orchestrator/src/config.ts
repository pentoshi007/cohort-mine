// ─────────────────────────────────────────────────────────
// src/config.ts — Centralised configuration from .env
// ─────────────────────────────────────────────────────────
// WHY THIS FILE?
// Instead of reading process.env everywhere (error-prone),
// we read ALL env vars ONCE, validate them, and export a
// typed config object. The rest of the app imports `config`.
// ─────────────────────────────────────────────────────────

import dotenv from "dotenv";

// Load .env file into process.env
dotenv.config();

// ── Helper: read a required env var or crash ────────────
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
        `   → Copy .env.example to .env and fill in your values.\n` +
        `   → Run: cp .env.example .env`,
    );
  }
  return value;
}

// ── Exported config object (used by the rest of the app) ─
export const config = {
  // Server
  port: parseInt(process.env.PORT || "3000", 10),

  // AWS credentials & region
  aws: {
    accessKeyId: requiredEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY"),
    region: process.env.AWS_REGION || "us-east-1",
  },

  // EC2 instance defaults
  ec2: {
    amiId: requiredEnv("AWS_AMI_ID"),
    instanceType: process.env.AWS_INSTANCE_TYPE || "t2.micro",
    keyPairName: requiredEnv("AWS_KEY_PAIR_NAME"),
    securityGroupId: requiredEnv("AWS_SECURITY_GROUP_ID"),
  },

  // Coder / VS Code password
  coderPassword: process.env.CODER_PASSWORD || "changeme",
};
