# 🚀 Turborepo Monorepo Setup Guide

> **Complete step-by-step guide** for setting up a Turborepo monorepo with Next.js 16, Express 5, WebSocket, and Prisma 7 with PostgreSQL.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Turborepo Project](#step-1-create-turborepo-project)
3. [Step 2: Add Backend Apps](#step-2-add-backend-apps)
4. [Step 3: Setup Prisma Database Package](#step-3-setup-prisma-database-package)
5. [Step 4: Configure TypeScript for ES Modules](#step-4-configure-typescript-for-es-modules)
6. [Step 5: Configure All Apps to Use Database](#step-5-configure-all-apps-to-use-database)
7. [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
8. [Step 7: Run the Project](#step-7-run-the-project)
9. [Configuration Files Explained](#configuration-files-explained)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement         | Version                     | Check Command |
| ------------------- | --------------------------- | ------------- |
| Node.js             | ≥18                         | `node -v`     |
| pnpm                | ≥9.0.0                      | `pnpm -v`     |
| PostgreSQL Database | Any (Neon, Supabase, local) | -             |

```bash
# Install pnpm if not installed
npm install -g pnpm@9
```

---

## Step 1: Create Turborepo Project

### 1.1 Initialize the Monorepo

```bash
# Create a new Turborepo project
npx create-turbo@latest 25.2-dep-certificates-cicd

# Choose:
# - Package manager: pnpm
# - Template: Default (includes web app + packages)
```

### 1.2 Understanding the Generated Structure

```
25.2-dep-certificates-cicd/
├── apps/
│   └── web/               # Next.js app (generated)
├── packages/
│   ├── eslint-config/     # Shared ESLint configs
│   ├── typescript-config/ # Shared TypeScript configs
│   └── ui/                # Shared React components
├── package.json           # Root package.json
├── pnpm-workspace.yaml    # Defines workspace packages
└── turbo.json             # Turborepo configuration
```

### 1.3 Root `package.json` Explained

```json
{
  "name": "25.2-dep-certificates-cicd",
  "private": true, // Not published to npm
  "scripts": {
    "build": "turbo run build", // Builds all packages
    "dev": "turbo run dev", // Runs dev mode for all
    "lint": "turbo run lint", // Lints all packages
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "check-types": "turbo run check-types"
  },
  "devDependencies": {
    "prettier": "^3.7.4",
    "turbo": "^2.8.3", // Turborepo CLI
    "typescript": "5.9.2"
  },
  "packageManager": "pnpm@9.0.0", // Enforces pnpm version
  "engines": {
    "node": ">=18" // Minimum Node.js version
  }
}
```

### 1.4 `pnpm-workspace.yaml` Explained

```yaml
packages:
  - "apps/*" # All folders in apps/ are workspace packages
  - "packages/*" # All folders in packages/ are workspace packages
```

> **What this does:** Tells pnpm which directories contain packages that can reference each other using `workspace:*` syntax.

### 1.5 `turbo.json` Explained

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui", // Use terminal UI
  "tasks": {
    "build": {
      "dependsOn": ["^build"], // Build dependencies first
      "inputs": ["$TURBO_DEFAULT$", ".env*"], // Cache key includes .env files
      "outputs": [".next/**", "!.next/cache/**"] // Cache outputs, not cache dir
    },
    "lint": {
      "dependsOn": ["^lint"] // Lint dependencies first
    },
    "check-types": {
      "dependsOn": ["^check-types"] // Type-check dependencies first
    },
    "dev": {
      "cache": false, // Never cache dev mode
      "persistent": true // Keep running
    }
  }
}
```

> **Key insight:** The `^` prefix means "run this task on dependencies first". So `"dependsOn": ["^build"]` means "build my dependencies before building me".

---

## Step 2: Add Backend Apps

### 2.1 Create HTTP Server App

```bash
# Create directory and initialize
mkdir -p apps/http-server/src
cd apps/http-server
pnpm init
```

### 2.2 HTTP Server `package.json`

Create `apps/http-server/package.json`:

```json
{
  "name": "http-server",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "tsc -b",
    "dev": "npm run build && npm run start",
    "start": "node dist/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "devDependencies": {
    "@repo/db": "workspace:*",
    "@repo/typescript-config": "workspace:*"
  },
  "dependencies": {
    "@types/express": "^5.0.6",
    "express": "^5.2.1"
  }
}
```

#### Key Changes Explained:

| Field                                      | Value               | Why                                                       |
| ------------------------------------------ | ------------------- | --------------------------------------------------------- |
| `"type": "module"`                         | `"module"`          | **CRITICAL:** Enables ES Modules (`import/export` syntax) |
| `"main"`                                   | `"dist/index.js"`   | Points to compiled output                                 |
| `"@repo/db": "workspace:*"`                | Workspace reference | Links to local Prisma package                             |
| `"@repo/typescript-config": "workspace:*"` | Workspace reference | Uses shared TS config                                     |
| `express`                                  | `^5.2.1`            | Latest Express 5 (major changes from v4)                  |

### 2.3 HTTP Server `tsconfig.json`

Create `apps/http-server/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

#### Key Options Explained:

| Option                           | Value                                 | Why                                                                       |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| `"extends"`                      | `"@repo/typescript-config/base.json"` | Inherits shared config                                                    |
| `"esModuleInterop": true`        | `true`                                | **CRITICAL:** Allows `import express from "express"` for CommonJS modules |
| `"allowSyntheticDefaultImports"` | `true`                                | Allows default imports from modules without default export                |
| `"rootDir"`                      | `"./src"`                             | Source code location                                                      |
| `"outDir"`                       | `"./dist"`                            | Compiled output location                                                  |

> ⚠️ **Without `esModuleInterop`**, you'd get: `Module '...' can only be default-imported using the 'esModuleInterop' flag`

### 2.4 Create WebSocket Server App

```bash
mkdir -p apps/ws/src
cd apps/ws
pnpm init
```

### 2.5 WebSocket Server `package.json`

Create `apps/ws/package.json`:

```json
{
  "name": "ws",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "tsc -b",
    "dev": "npm run build && npm run start",
    "start": "node dist/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "devDependencies": {
    "@repo/db": "workspace:*",
    "@repo/typescript-config": "workspace:*"
  },
  "dependencies": {
    "@types/ws": "^8.18.1",
    "ws": "^8.19.0"
  }
}
```

### 2.6 WebSocket Server `tsconfig.json`

Create `apps/ws/tsconfig.json` (same as http-server):

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

---

## Step 3: Setup Prisma Database Package

This is the **most complex part** of the setup. Prisma 7 introduced significant changes.

### 3.1 Create the Database Package

```bash
mkdir -p packages/prisma/src
mkdir -p packages/prisma/prisma
cd packages/prisma
pnpm init
```

### 3.2 Initialize Prisma

```bash
cd packages/prisma
npx prisma init
```

### 3.3 Database Package `package.json`

Create `packages/prisma/package.json`:

```json
{
  "name": "@repo/db",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "exports": {
    "./client": "./src/index.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/pg": "^8.16.0",
    "dotenv": "^17.2.3"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.3.0",
    "@prisma/client": "^7.3.0",
    "@prisma/client-runtime-utils": "7.3.0",
    "pg": "^8.18.0",
    "prisma": "^7.3.0"
  }
}
```

#### Key Changes Explained:

| Field                                         | Value             | Why                                               |
| --------------------------------------------- | ----------------- | ------------------------------------------------- |
| `"name": "@repo/db"`                          | Scoped name       | Used for workspace imports: `@repo/db/client`     |
| `"exports": { "./client": "./src/index.ts" }` | Subpath export    | Allows `import { client } from "@repo/db/client"` |
| `"type": "module"`                            | ES Modules        | Required for Prisma 7                             |
| `@prisma/adapter-pg`                          | Driver adapter    | **Prisma 7 REQUIREMENT** - direct DB drivers      |
| `pg`                                          | PostgreSQL driver | Native Node.js PostgreSQL client                  |
| `dotenv`                                      | Env loader        | Load `.env` in `prisma.config.ts`                 |

> ⚠️ **Prisma 7 Breaking Change:** You MUST use a driver adapter. The old `datasource.url` directly in schema.prisma is deprecated.

### 3.4 Prisma Schema (`prisma/schema.prisma`)

Create `packages/prisma/prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"   // Custom output path
}

datasource db {
  provider = "postgresql"
  // URL is configured in prisma.config.ts via datasource.url
}

model User {
  id       String @id @default(uuid())
  username String @unique
  password String
}
```

#### Key Configuration Explained:

| Setting                          | Value       | Why                                                                |
| -------------------------------- | ----------- | ------------------------------------------------------------------ |
| `output = "../generated/prisma"` | Custom path | Generates client outside `node_modules` for monorepo compatibility |
| No `url` in datasource           | Omitted     | **Prisma 7:** URL is set in `prisma.config.ts`                     |

### 3.5 Prisma Config (`prisma.config.ts`)

Create `packages/prisma/prisma.config.ts`:

```typescript
// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"], // Get URL from env
  },
});
```

> **What this does:** Prisma 7's new config file approach separates schema definition from runtime configuration. This allows different URLs for different environments.

### 3.6 Prisma Client Export (`src/index.ts`)

Create `packages/prisma/src/index.ts`:

```typescript
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prisma 7 requires a driver adapter for database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const client = new PrismaClient({ adapter });
```

#### Key Concepts Explained:

| Concept                     | Why                                                   |
| --------------------------- | ----------------------------------------------------- |
| `Pool` from `pg`            | Native PostgreSQL connection pool                     |
| `PrismaPg` adapter          | Bridges Prisma to native `pg` driver                  |
| `PrismaClient({ adapter })` | **Prisma 7:** Must pass adapter to client             |
| `.js` extension in import   | **ES Modules requirement** - file extensions required |

> ⚠️ **Most Common Error:** Forgetting to pass the adapter: `PrismaClient is not configured with a driver adapter`

### 3.7 Generate Prisma Client

```bash
cd packages/prisma

# Generate the Prisma client in ./generated/prisma/
npx prisma generate

# Run migrations (creates tables in database)
npx prisma migrate dev --name init
```

### 3.8 Add to `.gitignore`

Add to `packages/prisma/.gitignore`:

```gitignore
generated/
node_modules/
.env
```

---

## Step 4: Configure TypeScript for ES Modules

### 4.1 Base TypeScript Config (`packages/typescript-config/base.json`)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "declaration": true, // Generate .d.ts files
    "declarationMap": true, // Source maps for declarations
    "esModuleInterop": true, // CommonJS/ESM interop
    "incremental": false, // Don't use incremental build
    "isolatedModules": true, // Required for some bundlers
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext", // Use Node.js ESM resolution
    "moduleDetection": "force", // Force module detection
    "moduleResolution": "NodeNext", // Modern Node.js resolution
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true, // Skip checking node_modules types
    "strict": true,
    "target": "ES2022"
  }
}
```

#### Critical Settings Explained:

| Setting                          | Value    | Impact                                   |
| -------------------------------- | -------- | ---------------------------------------- |
| `"module": "NodeNext"`           | NodeNext | Enables ES Modules with `.js` extensions |
| `"moduleResolution": "NodeNext"` | NodeNext | Uses Node.js module resolution algorithm |
| `"esModuleInterop": true`        | true     | Fixes CommonJS default imports           |

### 4.2 Next.js TypeScript Config (`packages/typescript-config/nextjs.json`)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }], // Next.js plugin
    "module": "ESNext", // Bundler handles modules
    "moduleResolution": "Bundler", // Use bundler resolution
    "allowJs": true,
    "jsx": "preserve", // Next.js handles JSX
    "noEmit": true // Next.js handles emit
  }
}
```

> **Why different?** Next.js uses its own bundler (Turbopack/Webpack), so it needs `"moduleResolution": "Bundler"` instead of `"NodeNext"`.

---

## Step 5: Configure All Apps to Use Database

### 5.1 Update `apps/web/package.json`

Add the database dependency:

```json
{
  "devDependencies": {
    "@repo/db": "workspace:*"
  }
}
```

### 5.2 Update HTTP Server Source

Create `apps/http-server/src/index.ts`:

```typescript
import express from "express";
import { client } from "@repo/db/client";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const user = await client.user.create({
    data: { username, password },
  });
  res.status(201).json(user);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  res.send("User logged in");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

### 5.3 Update WebSocket Server Source

Create `apps/ws/src/index.ts`:

```typescript
import { WebSocketServer } from "ws";
import { client } from "@repo/db/client";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", async (ws) => {
  console.log("Client connected");
  const username = Math.random().toString(36).substring(2, 15);
  const password = Math.random().toString(36).substring(2, 15);
  const user = await client.user.create({
    data: { username, password },
  });
});

wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});
```

---

## Step 6: Configure Environment Variables

### 6.1 Root `.env` File

Create `.env` in project root:

```env
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

#### For Neon Database:

```env
DATABASE_URL="postgresql://neondb_owner:your-password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 6.2 Copy to Required Locations

```bash
# Copy .env to packages that need it
cp .env apps/web/.env
cp .env packages/prisma/.env
```

### 6.3 Update `.gitignore`

Ensure `.env` files are ignored:

```gitignore
# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## Step 7: Run the Project

### 7.1 Install All Dependencies

```bash
# From project root
pnpm install
```

### 7.2 Generate Prisma Client

```bash
cd packages/prisma
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### 7.3 Build Everything

```bash
pnpm build
```

### 7.4 Run Development Mode

```bash
# Run all apps
pnpm dev

# Or run specific app
pnpm dev --filter=web
pnpm dev --filter=http-server
pnpm dev --filter=ws
```

---

## Configuration Files Explained

### Complete File Comparison

| File                               | Base (Turborepo Default)    | Your Changes                                                  | Why Changed                  |
| ---------------------------------- | --------------------------- | ------------------------------------------------------------- | ---------------------------- |
| `apps/http-server/package.json`    | N/A (new file)              | Added `"type": "module"`, Express 5, workspace deps           | Enable ESM, latest deps      |
| `apps/http-server/tsconfig.json`   | N/A (new file)              | `esModuleInterop: true`, `allowSyntheticDefaultImports: true` | Fix CommonJS imports         |
| `apps/ws/package.json`             | N/A (new file)              | Same as http-server with ws deps                              | Same reasons                 |
| `packages/prisma/package.json`     | N/A (new file)              | Driver adapter deps, exports config                           | Prisma 7 requirements        |
| `packages/prisma/schema.prisma`    | Has `url` in datasource     | Removed `url`, added `output` path                            | Prisma 7 new config approach |
| `packages/prisma/prisma.config.ts` | N/A (new file)              | Defines datasource URL                                        | Prisma 7 requirement         |
| `packages/prisma/src/index.ts`     | Simple `new PrismaClient()` | Uses adapter pattern                                          | Prisma 7 driver adapter      |

### Key Difference: Prisma 6 vs Prisma 7

```diff
// ❌ Prisma 6 (OLD)
- import { PrismaClient } from "@prisma/client";
- const prisma = new PrismaClient();

// ✅ Prisma 7 (NEW)
+ import { PrismaClient } from "../generated/prisma/client.js";
+ import { PrismaPg } from "@prisma/adapter-pg";
+ import { Pool } from "pg";
+
+ const pool = new Pool({ connectionString: process.env.DATABASE_URL });
+ const adapter = new PrismaPg(pool);
+ export const client = new PrismaClient({ adapter });
```

---

## Troubleshooting

### ❌ Error: `Module can only be default-imported using esModuleInterop`

**Solution:** Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### ❌ Error: `PrismaClient is not configured with a driver adapter`

**Solution:** You're using Prisma 7 without an adapter. Update your client initialization:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const client = new PrismaClient({ adapter });
```

### ❌ Error: `Cannot find module '@repo/db/client'`

**Solution:**

1. Check `packages/prisma/package.json` has correct exports:
   ```json
   "exports": { "./client": "./src/index.ts" }
   ```
2. Run `pnpm install` from root
3. Ensure importing app has `"@repo/db": "workspace:*"` in dependencies

### ❌ Error: `Cannot find module '../generated/prisma/client.js'`

**Solution:** Run Prisma generate:

```bash
cd packages/prisma
npx prisma generate
```

### ❌ Error: `ECONNREFUSED` or Database Connection Failed

**Solution:**

1. Check `.env` has correct `DATABASE_URL`
2. Ensure `.env` is copied to `packages/prisma/.env`
3. For Neon, add `?sslmode=require` to URL

### ❌ Error: `workspace:* not found`

**Solution:** Run from project root:

```bash
pnpm install
```

---

## 📝 Quick Reference Commands

```bash
# From project root
pnpm install              # Install all dependencies
pnpm build                # Build all packages
pnpm dev                  # Dev mode for all
pnpm dev --filter=web     # Dev only web app

# Prisma commands (from packages/prisma/)
npx prisma generate       # Generate client
npx prisma migrate dev    # Run migrations
npx prisma studio         # Open Prisma Studio GUI
npx prisma db push        # Push schema (no migration)

# Turbo commands
pnpm turbo run build      # Same as pnpm build
pnpm turbo run build --filter=http-server  # Build specific
```

---

## 🎯 Summary

This project uses:

- **Turborepo 2.8+** for monorepo management
- **pnpm 9.0+** as package manager with workspaces
- **TypeScript 5.9+** with ES Modules (`NodeNext`)
- **Next.js 16+** for the web frontend
- **Express 5+** for HTTP server
- **ws 8+** for WebSocket server
- **Prisma 7+** with driver adapters (PostgreSQL)
- **Neon** (or any PostgreSQL) as database

The trickiest parts are:

1. Setting up ES Modules correctly (`"type": "module"` + proper tsconfig)
2. Prisma 7's new driver adapter pattern
3. Workspace dependencies (`workspace:*` syntax)
4. Correct exports configuration for shared packages
