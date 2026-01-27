# Prisma 7 Todo App - Complete Revision Guide

> A hands-on learning project demonstrating Prisma 7 ORM with PostgreSQL through a complete Todo application with Express.js backend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What We're Building](#2-what-were-building)
3. [Project Structure](#3-project-structure)
4. [Quick Start - Run This Project](#4-quick-start---run-this-project)
5. [What is Prisma?](#5-what-is-prisma)
6. [Prisma 7 vs Prisma 6 - Key Changes](#6-prisma-7-vs-prisma-6---key-changes)
7. [Architecture of This Project](#7-architecture-of-this-project)
8. [Step-by-Step Project Setup](#8-step-by-step-project-setup)
9. [Our Database Schema](#9-our-database-schema)
10. [Prisma Client Setup (src/lib/prisma.ts)](#10-prisma-client-setup-srclibprismats)
11. [All API Endpoints in This Project](#11-all-api-endpoints-in-this-project)
12. [CRUD Operations Deep Dive](#12-crud-operations-deep-dive)
13. [Relations & Nested Operations](#13-relations--nested-operations)
14. [Filtering, Pagination & Sorting](#14-filtering-pagination--sorting)
15. [Aggregations & Statistics](#15-aggregations--statistics)
16. [Transactions](#16-transactions)
17. [Raw SQL Queries](#17-raw-sql-queries)
18. [Essential Prisma Commands](#18-essential-prisma-commands)
19. [Visual Diagrams](#19-visual-diagrams)
20. [Summary & Key Takeaways](#20-summary--key-takeaways)

---

## 1. Project Overview

### What is This Project?

This is a **complete learning project** for mastering **Prisma 7 ORM** with:
- **Express.js** REST API backend
- **PostgreSQL** database (using Neon serverless)
- **TypeScript** with full type safety
- **17 API endpoints** covering ALL Prisma operations

### Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | 7.2.0 | ORM for database operations |
| Express | 5.1.0 | Web framework for REST API |
| PostgreSQL | - | Database (Neon serverless) |
| TypeScript | 5.9.3 | Type-safe JavaScript |
| Node.js | 20.19+ | JavaScript runtime |

### Learning Goals

After studying this project, you'll understand:
- How to set up Prisma 7 with the new adapter pattern
- All CRUD operations (Create, Read, Update, Delete)
- Working with relations (One-to-Many)
- Filtering, pagination, and sorting
- Aggregations and statistics
- Transactions for atomic operations
- Raw SQL queries when needed

---

## 2. What We're Building

### The Todo Application

We're building a **User-Todo management system** where:
- Users can register and manage their profile
- Each user can have multiple todos
- Todos can be created, updated, marked complete, and deleted

```mermaid
erDiagram
    USER ||--o{ TODO : "has many"
    USER {
        int id PK "Auto-increment primary key"
        string username UK "Unique username"
        string email UK "Optional, unique email"
        string password "User password"
        datetime createdAt "Registration timestamp"
    }
    TODO {
        int id PK "Auto-increment primary key"
        string title "Todo title (required)"
        string description "Optional description"
        boolean done "Completion status"
        datetime createdAt "Creation timestamp"
        int userId FK "References User.id"
    }
```

### Features Implemented

| Feature | Prisma Concepts Used |
|---------|---------------------|
| User Registration | `create()`, nested writes |
| Bulk User Import | `createMany()`, `skipDuplicates` |
| Get All Users | `findMany()`, `include`, `orderBy` |
| Get User by ID | `findUnique()` |
| Search Users | `findFirst()`, `contains` |
| Update User | `update()` |
| Upsert User | `upsert()` |
| Delete User | `delete()`, `deleteMany()` |
| Create Todo | `create()` with `connect` |
| Filter Todos | `where`, `OR`, `AND` |
| Toggle Todo | `update()` |
| Pagination | `skip`, `take` |
| Statistics | `count()`, `aggregate()`, `groupBy()` |
| Transfer Todos | `$transaction()` |
| Raw Queries | `$queryRaw`, `$executeRaw` |

---

## 3. Project Structure

```
18.1-prisma/
├── prisma/
│   ├── schema.prisma              # Database models definition
│   └── migrations/
│       ├── 20260118093640_init/   # Initial migration
│       │   └── migration.sql      # Creates users & todos tables
│       └── 20260118095249_optional_add/
│           └── migration.sql      # Makes email optional
│
├── src/
│   ├── generated/
│   │   └── prisma/                # Auto-generated Prisma Client
│   │       ├── client.ts          # Main client file
│   │       └── models/
│   │           ├── User.ts        # User type definitions
│   │           └── Todo.ts        # Todo type definitions
│   │
│   ├── lib/
│   │   └── prisma.ts              # Prisma Client singleton (IMPORTANT!)
│   │
│   └── index.ts                   # Express app with all 17 endpoints
│
├── dist/                          # Compiled JavaScript output
│
├── .env                           # DATABASE_URL (not in git!)
├── prisma.config.ts               # Prisma 7 configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── SETUP.md                       # Detailed setup instructions
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Defines User and Todo models with relations |
| `prisma.config.ts` | NEW in Prisma 7 - database URL configuration |
| `src/lib/prisma.ts` | Singleton Prisma Client with adapter pattern |
| `src/index.ts` | Express server with all 17 API endpoints |
| `.env` | Contains `DATABASE_URL` for PostgreSQL connection |

---

## 4. Quick Start - Run This Project

### Prerequisites

- Node.js v20.19+ installed
- A PostgreSQL database (Neon, Supabase, or local)

### Step 1: Clone and Install

```bash
cd "18.1-prisma"
npm install
```

### Step 2: Set Up Database Connection

Create `.env` file (or update existing):

```env
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

**Options for getting a PostgreSQL database:**
- **Neon** (free): https://neon.tech
- **Supabase** (free): https://supabase.com
- **Local**: Install PostgreSQL locally

### Step 3: Run Migrations

```bash
# Apply database migrations
npm run db:migrate

# Generate Prisma Client
npm run db:generate
```

### Step 4: Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# OR Production mode
npm run build && npm start
```

### Step 5: Test the API

Server runs at `http://localhost:3000`

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "secret123"}'

# Get all users
curl http://localhost:3000/users
```

### Available npm Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"tsc -w\" \"nodemon --delay 1 --watch dist ./dist/index.js\"",
    "build": "tsc -b",
    "start": "node dist/index.js",
    "db:migrate": "npx prisma migrate dev",
    "db:generate": "npx prisma generate",
    "db:studio": "npx prisma studio"
  }
}
```

---

## 5. What is Prisma?

**Prisma** is a next-generation **ORM (Object-Relational Mapping)** for Node.js and TypeScript.

### Why Use Prisma Instead of Raw SQL?

```
┌─────────────────────────────────────────────────────────────┐
│                     WITHOUT PRISMA (Raw SQL)                 │
├─────────────────────────────────────────────────────────────┤
│  const result = await pool.query(                           │
│    'SELECT * FROM users WHERE id = $1', [1]                 │
│  );                                                          │
│  const user = result.rows[0];                               │
│  // user.usernam ← Typo not caught! No auto-completion!     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      WITH PRISMA ORM                         │
├─────────────────────────────────────────────────────────────┤
│  const user = await prisma.user.findUnique({                │
│    where: { id: 1 }                                          │
│  });                                                         │
│  user.username  // ✓ Auto-completion works!                 │
│  user.usernam   // ✗ TypeScript error - caught immediately! │
└─────────────────────────────────────────────────────────────┘
```

### Benefits of Prisma

| Feature | Benefit |
|---------|---------|
| **Type Safety** | TypeScript knows your database schema |
| **Auto-completion** | IDE suggests field names as you type |
| **Migrations** | Version-controlled database changes |
| **Relations** | Easy handling of JOINs and nested data |
| **SQL Injection Protection** | Parameterized queries by default |

---

## 6. Prisma 7 vs Prisma 6 - Key Changes

Prisma 7 has **major architectural changes**. This project uses the new pattern:

```mermaid
flowchart LR
    subgraph P6["Prisma 6 (Old Way)"]
        A1[schema.prisma] --> B1["url = env(DATABASE_URL)"]
        B1 --> C1["import from @prisma/client"]
        C1 --> D1[Database]
    end

    subgraph P7["Prisma 7 (New Way) - This Project"]
        A2[schema.prisma] --> B2[prisma.config.ts]
        B2 --> C2[PrismaPg Adapter]
        C2 --> D2["import from ./generated/prisma"]
        D2 --> E2[Database]
    end

    style P6 fill:#ffcccc,stroke:#333
    style P7 fill:#ccffcc,stroke:#333
```

### What Changed?

| Feature | Prisma 6 | Prisma 7 (This Project) |
|---------|----------|-------------------------|
| **Generator** | `prisma-client-js` | `prisma-client` |
| **Output Path** | `node_modules/.prisma/client` | `./src/generated/prisma` |
| **Database URL** | In `schema.prisma` | In `prisma.config.ts` |
| **Config File** | Not needed | **Required** |
| **Adapter** | Optional | **Required** |
| **Import** | `@prisma/client` | `./generated/prisma/client.js` |

### Why This Change?

> Prisma 7 separates the ORM from the database driver, enabling:
> - Edge runtime support (Cloudflare Workers, Vercel Edge)
> - Easier driver swapping
> - Better connection pooling control

---

## 7. Architecture of This Project

```mermaid
flowchart TB
    subgraph Client["HTTP Clients"]
        CURL[cURL / Postman]
        BROWSER[Browser]
    end

    subgraph Express["Express.js Server (src/index.ts)"]
        ROUTES[17 API Routes]
    end

    subgraph Prisma["Prisma Layer"]
        SINGLETON["Singleton Client<br/>(src/lib/prisma.ts)"]
        ADAPTER["PrismaPg Adapter"]
        GENERATED["Generated Types<br/>(src/generated/prisma)"]
    end

    subgraph Config["Configuration Files"]
        SCHEMA["prisma/schema.prisma<br/>(Models)"]
        PCONFIG["prisma.config.ts<br/>(DB URL)"]
        ENV[".env<br/>(Secrets)"]
    end

    subgraph DB["PostgreSQL (Neon)"]
        USERS[(users table)]
        TODOS[(todos table)]
    end

    CURL --> ROUTES
    BROWSER --> ROUTES
    ROUTES --> SINGLETON
    SINGLETON --> ADAPTER
    ADAPTER --> USERS
    ADAPTER --> TODOS

    SCHEMA -.->|generates| GENERATED
    ENV -.->|DATABASE_URL| PCONFIG
    PCONFIG -.->|configures| ADAPTER
    GENERATED -.->|types| SINGLETON

    style Express fill:#e1f5fe,stroke:#333
    style Prisma fill:#fff3e0,stroke:#333
    style DB fill:#e8f5e9,stroke:#333
    style Config fill:#f3e5f5,stroke:#333
```

### Request Flow Example

When you call `GET /users/1`:

```mermaid
sequenceDiagram
    participant Client
    participant Express as Express Server
    participant Prisma as PrismaClient
    participant Adapter as PrismaPg
    participant DB as PostgreSQL

    Client->>Express: GET /users/1
    Express->>Prisma: prisma.user.findUnique({ where: { id: 1 } })
    Prisma->>Prisma: Generate SQL: SELECT * FROM users WHERE id = 1
    Prisma->>Adapter: Execute query
    Adapter->>DB: SQL Query
    DB-->>Adapter: Row data
    Adapter-->>Prisma: Parse to JS object
    Prisma-->>Express: Typed User object
    Express-->>Client: JSON response
```

---

## 8. Step-by-Step Project Setup

This section shows how this project was set up from scratch.

### Step 1: Initialize Node.js Project

```bash
mkdir 18.1-prisma && cd 18.1-prisma
npm init -y
```

### Step 2: Install Dependencies

```bash
# Runtime dependencies
npm install @prisma/client @prisma/adapter-pg pg dotenv express

# Dev dependencies
npm install -D prisma typescript @types/node @types/pg @types/express nodemon concurrently
```

**Package Breakdown:**

| Package | Purpose |
|---------|---------|
| `prisma` | CLI tool for migrations and generation |
| `@prisma/client` | Runtime ORM library |
| `@prisma/adapter-pg` | PostgreSQL driver adapter (NEW in v7) |
| `pg` | Underlying PostgreSQL driver |
| `dotenv` | Load `.env` variables |
| `express` | Web framework |

### Step 3: Initialize TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "prisma.config.ts"]
}
```

### Step 4: Add ESM Support

In `package.json`:

```json
{
  "type": "module"
}
```

### Step 5: Initialize Prisma

```bash
npx prisma init --output ../src/generated/prisma
```

This creates:
- `prisma/schema.prisma`
- `prisma.config.ts`
- `.env`

### Step 6: Configure prisma.config.ts

**This file is NEW in Prisma 7:**

```typescript
// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),  // NOT process.env!
  },
});
```

**Key Insight**: Use `env("DATABASE_URL")` from `prisma/config`, not `process.env.DATABASE_URL`.

### Step 7: Set DATABASE_URL

In `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

### Step 8: Define Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  // URL is in prisma.config.ts, NOT here in Prisma 7!
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String?  @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  todos     Todo[]

  @@map("users")
}

model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  done        Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  userId      Int      @map("user_id")
  user        User     @relation(fields: [userId], references: [id])

  @@map("todos")
}
```

### Step 9: Run Migration

```bash
npx prisma migrate dev --name init
```

This:
1. Creates `prisma/migrations/xxx_init/migration.sql`
2. Applies the SQL to your database
3. Generates Prisma Client in `src/generated/prisma`

### Step 10: Create Prisma Singleton

Create `src/lib/prisma.ts`:

```typescript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set!");
}

// NEW in Prisma 7: Adapter is REQUIRED
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  // log: ['query'],  // Uncomment to see SQL queries
});

export { prisma };
```

### Step 11: Create Express Server

Create `src/index.ts` with all endpoints (covered in next sections).

---

## 9. Our Database Schema

### The Schema File

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"           // Changed from "prisma-client-js"
  output   = "../src/generated/prisma" // Custom output path
}

datasource db {
  provider = "postgresql"
  // NO url here in Prisma 7!
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String?  @unique              // ? = nullable
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  todos     Todo[]                        // One-to-Many relation

  @@map("users")                          // Table name in DB
}

model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  done        Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  userId      Int      @map("user_id")    // Foreign key
  user        User     @relation(fields: [userId], references: [id])

  @@map("todos")
}
```

### Schema Annotations Explained

```mermaid
flowchart TB
    subgraph FieldLevel["Field-Level (@)"]
        ID["@id → Primary key"]
        DEFAULT["@default(autoincrement()) → Auto-generate"]
        UNIQUE["@unique → No duplicates allowed"]
        MAP["@map('snake_case') → Column rename"]
        RELATION["@relation(...) → Define FK relationship"]
    end

    subgraph ModelLevel["Model-Level (@@)"]
        TMAP["@@map('tablename') → Table rename"]
    end

    subgraph TypeModifiers["Type Modifiers"]
        OPTIONAL["String? → Nullable field"]
        ARRAY["Todo[] → One-to-many relation"]
    end

    style FieldLevel fill:#e3f2fd,stroke:#333
    style ModelLevel fill:#fce4ec,stroke:#333
    style TypeModifiers fill:#e8f5e9,stroke:#333
```

### Annotation Quick Reference

| Annotation | Purpose | Example |
|------------|---------|---------|
| `@id` | Primary key | `id Int @id` |
| `@default()` | Default value | `@default(autoincrement())` |
| `@unique` | Unique constraint | `email String @unique` |
| `@map()` | Rename column | `@map("created_at")` |
| `@@map()` | Rename table | `@@map("users")` |
| `@relation()` | Define relationship | `@relation(fields: [userId], references: [id])` |
| `?` | Nullable | `String?` |
| `[]` | Array (relation) | `Todo[]` |

### Understanding @map vs @@map

```
┌─────────────────────────────────────────────────────────────┐
│  Prisma Code (camelCase)     │  PostgreSQL (snake_case)     │
├─────────────────────────────────────────────────────────────┤
│  createdAt                    →  created_at     (@map)      │
│  userId                       →  user_id        (@map)      │
│  Model: User                  →  Table: users   (@@map)     │
│  Model: Todo                  →  Table: todos   (@@map)     │
└─────────────────────────────────────────────────────────────┘
```

### Generated SQL (First Migration)

```sql
-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todos" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id");
```

---

## 10. Prisma Client Setup (src/lib/prisma.ts)

### The Complete File

```typescript
// src/lib/prisma.ts

/**
 * PRISMA 7 CLIENT SETUP - The Database Connection Layer
 *
 * This file creates and exports a singleton instance of PrismaClient.
 *
 * KEY CHANGES FROM PRISMA 6:
 * 1. Adapters are now REQUIRED - you must use a driver adapter (like PrismaPg)
 * 2. The client is generated to a custom path (defined in schema.prisma)
 * 3. Import path changed from "@prisma/client" to your custom output path
 * 4. Connection URL is passed via adapter, not directly to PrismaClient
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set!");
}

/**
 * Create the PostgreSQL adapter
 *
 * PrismaPg options:
 * - connectionString: The PostgreSQL connection URL
 * - You can also pass pool configuration for production:
 *   new PrismaPg({ connectionString, pool: { max: 20, idleTimeout: 30 } })
 */
const adapter = new PrismaPg({ connectionString });

/**
 * Create the PrismaClient instance with the adapter
 */
const prisma = new PrismaClient({
  adapter,
  // Uncomment to see all queries in console:
  // log: ['query', 'info', 'warn', 'error'],
});

export { prisma };
```

### Why Singleton Pattern?

```mermaid
flowchart TB
    subgraph Bad["Without Singleton - BAD"]
        R1[Route 1] --> C1["new PrismaClient()"]
        R2[Route 2] --> C2["new PrismaClient()"]
        R3[Route 3] --> C3["new PrismaClient()"]
        C1 --> DB1[(Connection 1)]
        C2 --> DB2[(Connection 2)]
        C3 --> DB3[(Connection 3)]
        NOTE1["Too many connections!<br/>Database overload!"]
    end

    subgraph Good["With Singleton - GOOD"]
        R4[Route 1] --> SC[Single PrismaClient]
        R5[Route 2] --> SC
        R6[Route 3] --> SC
        SC --> DB4[(Single Connection Pool)]
        NOTE2["Efficient!<br/>Reuses connections"]
    end

    style Bad fill:#ffcdd2,stroke:#333
    style Good fill:#c8e6c9,stroke:#333
```

### Using the Client

```typescript
// In src/index.ts
import { prisma } from "./lib/prisma.js";

// Now use prisma anywhere!
const users = await prisma.user.findMany();
```

---

## 11. All API Endpoints in This Project

### Complete Endpoint Reference

This project implements **17 endpoints** covering all Prisma operations:

```mermaid
flowchart TB
    subgraph Users["User Endpoints"]
        U1["POST /users<br/>Create user"]
        U2["POST /users/bulk<br/>Bulk create"]
        U3["POST /users/with-todos<br/>Create with todos"]
        U4["GET /users<br/>Get all users"]
        U5["GET /users/minimal<br/>Get selected fields"]
        U6["GET /users/:id<br/>Get by ID"]
        U7["GET /users/username/:u<br/>Find by username"]
        U8["GET /users/page/:page<br/>Paginated"]
        U9["PUT /users/:id<br/>Update user"]
        U10["PUT /users/bulk/update<br/>Bulk update"]
        U11["PUT /users/upsert/:u<br/>Upsert"]
        U12["DELETE /users/:id<br/>Delete user"]
        U13["DELETE /users/bulk/delete<br/>Bulk delete"]
    end

    subgraph Todos["Todo Endpoints"]
        T1["POST /todos<br/>Create todo"]
        T2["GET /todos<br/>Get with filters"]
        T3["PATCH /todos/:id/toggle<br/>Toggle done"]
        T4["DELETE /todos/:id<br/>Delete todo"]
    end

    subgraph Stats["Statistics Endpoints"]
        S1["GET /stats/counts<br/>Various counts"]
        S2["GET /stats/aggregate<br/>Min/Max dates"]
        S3["GET /stats/todos-by-user<br/>GroupBy"]
    end

    subgraph Advanced["Advanced Endpoints"]
        A1["POST /transfer-todos<br/>Transaction"]
        A2["GET /raw/users-with-todo-count<br/>Raw SQL"]
        A3["POST /raw/mark-all-done/:userId<br/>Raw execute"]
        A4["GET /users/filter/relations<br/>Relation filters"]
    end

    style Users fill:#e3f2fd,stroke:#333
    style Todos fill:#e8f5e9,stroke:#333
    style Stats fill:#fff3e0,stroke:#333
    style Advanced fill:#fce4ec,stroke:#333
```

### Endpoint Details Table

| Method | Endpoint | Prisma Operation | Description |
|--------|----------|------------------|-------------|
| POST | `/users` | `create()` | Create single user |
| POST | `/users/bulk` | `createMany()` | Create multiple users |
| POST | `/users/with-todos` | Nested `create` | Create user with todos |
| GET | `/users` | `findMany()` | Get all users with todos |
| GET | `/users/minimal` | `select` | Get only specific fields |
| GET | `/users/:id` | `findUnique()` | Get user by ID |
| GET | `/users/username/:u` | `findFirst()` | Find by username |
| GET | `/users/page/:page` | `skip`, `take` | Paginated users |
| PUT | `/users/:id` | `update()` | Update user |
| PUT | `/users/bulk/update` | `updateMany()` | Bulk update |
| PUT | `/users/upsert/:u` | `upsert()` | Update or create |
| DELETE | `/users/:id` | `delete()` | Delete user |
| DELETE | `/users/bulk/delete` | `deleteMany()` | Bulk delete |
| POST | `/todos` | `create()` | Create todo for user |
| GET | `/todos` | `findMany()` + filters | Get filtered todos |
| PATCH | `/todos/:id/toggle` | `update()` | Toggle completion |
| DELETE | `/todos/:id` | `delete()` | Delete todo |
| GET | `/stats/counts` | `count()` | Get various counts |
| GET | `/stats/aggregate` | `aggregate()` | Get min/max dates |
| GET | `/stats/todos-by-user` | `groupBy()` | Todos grouped by user |
| POST | `/transfer-todos` | `$transaction()` | Transfer todos atomically |
| GET | `/raw/users-with-todo-count` | `$queryRaw` | Raw SQL SELECT |
| POST | `/raw/mark-all-done/:userId` | `$executeRaw` | Raw SQL UPDATE |
| GET | `/users/filter/relations` | `some`, `every`, `none` | Relation filters |

---

## 12. CRUD Operations Deep Dive

### 12.1 CREATE Operations

#### Create Single User - `POST /users`

```typescript
app.post("/users", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
    include: {
      todos: true,  // Include related todos in response
    },
  });

  res.status(201).json(user);
});
```

**Key Insight**:
- `data` contains the values to insert
- `include: { todos: true }` eager-loads the relation (returns empty array for new user)

#### Create Multiple Users - `POST /users/bulk`

```typescript
app.post("/users/bulk", async (req: Request, res: Response) => {
  const users = req.body.users;

  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,  // Don't fail on unique constraint violation
  });

  res.json({ count: result.count });
});
```

**Key Insight**:
- `createMany` returns `{ count: number }`, NOT the created records
- More efficient than multiple `create()` calls (single SQL INSERT)
- `skipDuplicates: true` silently skips duplicates

#### Create with Nested Relation - `POST /users/with-todos`

```typescript
app.post("/users/with-todos", async (req: Request, res: Response) => {
  const { username, email, password, todos } = req.body;

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
      todos: {
        create: todos,  // Array: [{ title: "Task 1" }, { title: "Task 2" }]
      },
    },
    include: { todos: true },
  });

  res.json(user);
});
```

**Key Insight**: Nested writes create related records AND automatically set the foreign key (`userId`).

---

### 12.2 READ Operations

#### Get All Users - `GET /users`

```typescript
app.get("/users", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      todos: true,
    },
    orderBy: {
      createdAt: "desc",  // Newest first
    },
  });

  res.json(users);
});
```

#### Get User by ID - `GET /users/:id`

```typescript
app.get("/users/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      todos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});
```

**Key Insight**:
- `findUnique` requires a unique field (`@id` or `@unique`)
- Returns `null` if not found (doesn't throw)

#### findUnique vs findFirst

| Method | Requirement | Use Case |
|--------|-------------|----------|
| `findUnique` | Must use `@id` or `@unique` field | Get by ID, email, username |
| `findFirst` | Any field | Search, filter, get latest |

```typescript
// findFirst example - search by non-unique field
const user = await prisma.user.findFirst({
  where: {
    username: { contains: "john" },
  },
});
```

#### Select vs Include

```mermaid
flowchart LR
    subgraph Include["include: { todos: true }"]
        I1["All User fields<br/>+ All Todo fields"]
    end

    subgraph Select["select: { id, username }"]
        S1["Only id<br/>Only username"]
    end

    style Include fill:#e8f5e9,stroke:#333
    style Select fill:#fff3e0,stroke:#333
```

```typescript
// SELECT - Pick specific fields (more efficient)
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    // password NOT included - good for security!
    todos: {
      select: { id: true, title: true },
    },
  },
});

// INCLUDE - All fields + relations
const users = await prisma.user.findMany({
  include: { todos: true },
});
```

**Key Insight**: Use `select` when you don't need all fields - reduces data transfer and improves performance.

---

### 12.3 UPDATE Operations

#### Update Single User - `PUT /users/:id`

```typescript
app.put("/users/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { username, email, password } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(username && { username }),
      ...(email && { email }),
      ...(password && { password }),
    },
    include: { todos: true },
  });

  res.json(user);
});
```

**Key Insight**: `update` throws if record not found. Use `upsert` if you want to create when not found.

#### Upsert (Update or Insert) - `PUT /users/upsert/:username`

```typescript
app.put("/users/upsert/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  const { email, password } = req.body;

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      // If found, update these:
      email,
      password,
    },
    create: {
      // If not found, create with these:
      username,
      email,
      password,
    },
  });

  res.json(user);
});
```

**Key Insight**: `upsert` is perfect for "save" operations - it's idempotent (same result if run multiple times).

---

### 12.4 DELETE Operations

#### Delete Single User - `DELETE /users/:id`

```typescript
app.delete("/users/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  // First delete related todos (required due to FK constraint)
  await prisma.todo.deleteMany({
    where: { userId: id },
  });

  // Then delete user
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  res.json({ message: "Deleted", deletedUser });
});
```

**Key Insight**: Must delete related records first (or set up cascade delete in schema).

#### Bulk Delete - `DELETE /users/bulk/delete`

```typescript
app.delete("/users/bulk/delete", async (req: Request, res: Response) => {
  const { where } = req.body;

  if (!where || Object.keys(where).length === 0) {
    return res.status(400).json({ error: "Where clause required!" });
  }

  const result = await prisma.user.deleteMany({ where });
  res.json({ count: result.count });
});
```

**Warning**: `deleteMany({})` with empty `where` deletes ALL records!

---

## 13. Relations & Nested Operations

### The User-Todo Relationship

```mermaid
erDiagram
    USER ||--o{ TODO : "has many"
    USER {
        int id PK
        string username
    }
    TODO {
        int id PK
        int userId FK
        string title
    }
```

In Prisma schema:
```prisma
model User {
  todos Todo[]  // One user has many todos
}

model Todo {
  userId Int      @map("user_id")  // FK column
  user   User     @relation(fields: [userId], references: [id])  // Relation
}
```

### Creating Todo with User Connection - `POST /todos`

```typescript
app.post("/todos", async (req: Request, res: Response) => {
  const { title, description, userId } = req.body;

  const todo = await prisma.todo.create({
    data: {
      title,
      description,
      // Method 1: Direct FK assignment
      userId: userId,

      // Method 2: Using connect (more explicit)
      // user: {
      //   connect: { id: userId }
      //   // OR: connect: { username: "alice" }
      // }
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });

  res.json(todo);
});
```

### Nested Write Operations Reference

| Operation | Description | Example |
|-----------|-------------|---------|
| `create` | Create new related record | `todos: { create: { title: "New" } }` |
| `createMany` | Bulk create related | `todos: { createMany: { data: [...] } }` |
| `connect` | Link to existing by unique | `user: { connect: { id: 1 } }` |
| `connectOrCreate` | Connect or create | `user: { connectOrCreate: {...} }` |
| `disconnect` | Remove relation | `todos: { disconnect: { id: 1 } }` |
| `delete` | Delete related | `todos: { delete: { id: 1 } }` |
| `update` | Update related | `todos: { update: {...} }` |

---

## 14. Filtering, Pagination & Sorting

### Filtering with WHERE Operators

Our `GET /todos` endpoint supports multiple filters:

```typescript
app.get("/todos", async (req: Request, res: Response) => {
  const done = req.query.done;
  const search = req.query.search as string;
  const userId = req.query.userId;

  const todos = await prisma.todo.findMany({
    where: {
      // Filter by completion status
      ...(done !== undefined && { done: done === "true" }),

      // Filter by user
      ...(userId && { userId: parseInt(userId as string) }),

      // Search in title OR description
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(todos);
});
```

**Usage Examples:**
```bash
# Get incomplete todos
GET /todos?done=false

# Search todos
GET /todos?search=urgent

# Get todos for specific user
GET /todos?userId=1

# Combine filters
GET /todos?done=false&userId=1&search=buy
```

### Where Operators Reference

```typescript
where: {
  // String operators
  title: {
    equals: "exact match",
    contains: "substring",       // LIKE '%substring%'
    startsWith: "prefix",        // LIKE 'prefix%'
    endsWith: "suffix",          // LIKE '%suffix'
    mode: "insensitive",         // Case-insensitive
  },

  // Number operators
  id: {
    gt: 5,                       // > 5
    gte: 5,                      // >= 5
    lt: 10,                      // < 10
    lte: 10,                     // <= 10
    not: 3,                      // != 3
    in: [1, 2, 3],               // IN (1, 2, 3)
    notIn: [4, 5],               // NOT IN (4, 5)
  },

  // Logical operators
  AND: [...],                    // All must match
  OR: [...],                     // Any can match
  NOT: {...},                    // Negate
}
```

### Relation Filters - `GET /users/filter/relations`

```typescript
app.get("/users/filter/relations", async (req: Request, res: Response) => {
  // Users with at least one incomplete todo
  const usersWithIncompleteTodos = await prisma.user.findMany({
    where: {
      todos: { some: { done: false } },
    },
  });

  // Users where ALL todos are complete
  const usersAllComplete = await prisma.user.findMany({
    where: {
      todos: { every: { done: true } },
    },
  });

  // Users with no todos
  const usersNoTodos = await prisma.user.findMany({
    where: {
      todos: { none: {} },
    },
  });

  res.json({ usersWithIncompleteTodos, usersAllComplete, usersNoTodos });
});
```

| Operator | Meaning |
|----------|---------|
| `some` | At least one related record matches |
| `every` | All related records match |
| `none` | No related records match |

### Pagination - `GET /users/page/:page`

```typescript
app.get("/users/page/:page", async (req: Request, res: Response) => {
  const page = parseInt(req.params.page) || 1;
  const pageSize = 10;

  // Get total count for pagination info
  const totalCount = await prisma.user.count();

  // Get paginated data
  const users = await prisma.user.findMany({
    skip: (page - 1) * pageSize,  // Skip previous pages
    take: pageSize,                // Limit results
    orderBy: { createdAt: "desc" },
    include: { todos: true },
  });

  res.json({
    data: users,
    pagination: {
      currentPage: page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  });
});
```

**Pagination Formula**: `skip = (page - 1) * pageSize`

---

## 15. Aggregations & Statistics

### Count - `GET /stats/counts`

```typescript
app.get("/stats/counts", async (req: Request, res: Response) => {
  // Simple counts
  const totalUsers = await prisma.user.count();
  const totalTodos = await prisma.todo.count();

  // Conditional counts
  const completedTodos = await prisma.todo.count({
    where: { done: true },
  });

  const usersWithTodos = await prisma.user.count({
    where: {
      todos: { some: {} },  // At least one todo
    },
  });

  res.json({ totalUsers, totalTodos, completedTodos, usersWithTodos });
});
```

### Aggregate Functions - `GET /stats/aggregate`

```typescript
app.get("/stats/aggregate", async (req: Request, res: Response) => {
  const todoStats = await prisma.todo.aggregate({
    _count: { id: true },          // Count
    _min: { createdAt: true },     // Oldest
    _max: { createdAt: true },     // Newest
    // For numeric fields:
    // _sum: { amount: true },
    // _avg: { amount: true },
  });

  res.json({
    totalTodos: todoStats._count.id,
    oldestTodo: todoStats._min.createdAt,
    newestTodo: todoStats._max.createdAt,
  });
});
```

### GroupBy - `GET /stats/todos-by-user`

```typescript
app.get("/stats/todos-by-user", async (req: Request, res: Response) => {
  const todosByUser = await prisma.todo.groupBy({
    by: ["userId"],
    _count: { id: true },
    orderBy: {
      _count: { id: "desc" },  // Most todos first
    },
  });

  // Result: [{ userId: 1, _count: { id: 5 } }, ...]

  // Enrich with usernames
  const enriched = await Promise.all(
    todosByUser.map(async (stat) => {
      const user = await prisma.user.findUnique({
        where: { id: stat.userId },
        select: { username: true },
      });
      return {
        userId: stat.userId,
        username: user?.username,
        todoCount: stat._count.id,
      };
    })
  );

  res.json(enriched);
});
```

---

## 16. Transactions

### Why Use Transactions?

```mermaid
flowchart LR
    subgraph NoTx["Without Transaction"]
        O1["Step 1: Verify users ✓"] --> O2["Step 2: Transfer todos ✗"]
        O2 -->|Fails| PARTIAL["Data inconsistent!"]
    end

    subgraph WithTx["With Transaction"]
        T1["Step 1: Verify"] --> T2["Step 2: Transfer"]
        T2 -->|Fails| ROLLBACK["All rolled back ✓"]
        T2 -->|Success| COMMIT["All committed ✓"]
    end

    style NoTx fill:#ffcdd2,stroke:#333
    style WithTx fill:#c8e6c9,stroke:#333
```

### Interactive Transaction - `POST /transfer-todos`

```typescript
app.post("/transfer-todos", async (req: Request, res: Response) => {
  const { fromUserId, toUserId, todoIds } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    // tx is a transactional Prisma Client

    // Step 1: Verify users exist
    const fromUser = await tx.user.findUnique({ where: { id: fromUserId } });
    const toUser = await tx.user.findUnique({ where: { id: toUserId } });

    if (!fromUser || !toUser) {
      throw new Error("User not found");  // Rolls back EVERYTHING
    }

    // Step 2: Verify todos belong to source user
    const todos = await tx.todo.findMany({
      where: {
        id: { in: todoIds },
        userId: fromUserId,
      },
    });

    if (todos.length !== todoIds.length) {
      throw new Error("Some todos not found");
    }

    // Step 3: Transfer todos
    await tx.todo.updateMany({
      where: { id: { in: todoIds } },
      data: { userId: toUserId },
    });

    return { transferred: todos.length };
  });

  res.json(result);
});
```

**Key Insight**: If ANY operation throws, ALL operations are rolled back. The database never ends up inconsistent.

### Sequential Transaction

```typescript
// Simpler syntax for independent operations
const [user, todos] = await prisma.$transaction([
  prisma.user.create({ data: { username: "alice", password: "secret" } }),
  prisma.todo.findMany({ where: { done: false } }),
]);
```

---

## 17. Raw SQL Queries

### When to Use Raw SQL

- Complex queries Prisma can't express
- Performance-critical queries
- Database-specific features (PostgreSQL JSONB, etc.)

### SELECT with $queryRaw - `GET /raw/users-with-todo-count`

```typescript
app.get("/raw/users-with-todo-count", async (req: Request, res: Response) => {
  const results = await prisma.$queryRaw`
    SELECT
      u.id,
      u.username,
      u.email,
      COUNT(t.id)::int as todo_count
    FROM users u
    LEFT JOIN todos t ON t.user_id = u.id
    GROUP BY u.id, u.username, u.email
    ORDER BY todo_count DESC
  `;

  res.json(results);
});
```

### UPDATE with $executeRaw - `POST /raw/mark-all-done/:userId`

```typescript
app.post("/raw/mark-all-done/:userId", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  // Template literal provides SQL injection protection!
  const affectedRows = await prisma.$executeRaw`
    UPDATE todos
    SET done = true
    WHERE user_id = ${userId}
  `;

  res.json({ message: `Marked ${affectedRows} todos as done` });
});
```

**Security**: Always use template literals (backticks) with `$queryRaw` and `$executeRaw`. Parameters are automatically escaped.

---

## 18. Essential Prisma Commands

### This Project's npm Scripts

```bash
# Start development server (TypeScript watch + nodemon)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run migrations
npm run db:migrate

# Generate Prisma Client
npm run db:generate

# Open Prisma Studio (GUI)
npm run db:studio
```

### Prisma CLI Commands

```bash
# Initialize Prisma
npx prisma init --output ../src/generated/prisma

# Create and apply migration
npx prisma migrate dev --name add_feature

# Apply migrations in production
npx prisma migrate deploy

# Generate client (after schema changes)
npx prisma generate

# Open database GUI
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Push schema without migration (prototyping)
npx prisma db push

# Pull schema from existing database
npx prisma db pull

# Reset database (DELETES ALL DATA!)
npx prisma migrate reset
```

---

## 19. Visual Diagrams

### Complete Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant E as Express Server
    participant P as PrismaClient
    participant A as PrismaPg Adapter
    participant DB as PostgreSQL

    C->>E: POST /users { username, email, password }
    E->>E: Parse request body
    E->>P: prisma.user.create({ data: {...} })
    P->>P: Validate input types
    P->>P: Generate SQL: INSERT INTO users...
    P->>A: Execute query
    A->>DB: SQL INSERT
    DB-->>A: Return inserted row
    A-->>P: Parse to JS object
    P-->>E: Typed User object
    E-->>C: 201 Created { id, username, ... }
```

### CRUD Operations Map

```mermaid
flowchart TB
    subgraph CREATE["CREATE"]
        direction LR
        C1["create()"] --> C1D["Single record"]
        C2["createMany()"] --> C2D["Bulk insert"]
        C3["Nested create"] --> C3D["With relations"]
    end

    subgraph READ["READ"]
        direction LR
        R1["findUnique()"] --> R1D["By unique field"]
        R2["findFirst()"] --> R2D["First match"]
        R3["findMany()"] --> R3D["Multiple"]
        R4["count()"] --> R4D["Count only"]
    end

    subgraph UPDATE["UPDATE"]
        direction LR
        U1["update()"] --> U1D["Single record"]
        U2["updateMany()"] --> U2D["Bulk update"]
        U3["upsert()"] --> U3D["Update or Create"]
    end

    subgraph DELETE["DELETE"]
        direction LR
        D1["delete()"] --> D1D["Single record"]
        D2["deleteMany()"] --> D2D["Bulk delete"]
    end

    style CREATE fill:#c8e6c9,stroke:#333
    style READ fill:#e3f2fd,stroke:#333
    style UPDATE fill:#fff3e0,stroke:#333
    style DELETE fill:#ffcdd2,stroke:#333
```

### This Project's File Flow

```mermaid
flowchart TD
    subgraph Config["Configuration"]
        ENV[".env<br/>DATABASE_URL"]
        PCONFIG["prisma.config.ts<br/>Reads DATABASE_URL"]
        SCHEMA["schema.prisma<br/>User & Todo models"]
    end

    subgraph Generated["Generated Code"]
        CLIENT["src/generated/prisma/<br/>Prisma Client + Types"]
    end

    subgraph App["Application Code"]
        SINGLETON["src/lib/prisma.ts<br/>PrismaClient singleton"]
        INDEX["src/index.ts<br/>Express + 17 endpoints"]
    end

    subgraph Runtime["Runtime"]
        DIST["dist/<br/>Compiled JavaScript"]
        SERVER["Node.js Server<br/>localhost:3000"]
    end

    ENV --> PCONFIG
    PCONFIG --> SCHEMA
    SCHEMA -->|"prisma generate"| CLIENT
    CLIENT --> SINGLETON
    SINGLETON --> INDEX
    INDEX -->|"tsc -b"| DIST
    DIST --> SERVER

    style Config fill:#f3e5f5,stroke:#333
    style Generated fill:#fff3e0,stroke:#333
    style App fill:#e3f2fd,stroke:#333
    style Runtime fill:#e8f5e9,stroke:#333
```

---

## 20. Summary & Key Takeaways

### This Project Covers

| Topic | What You Learned |
|-------|------------------|
| **Setup** | Prisma 7 with adapter pattern, ESM, TypeScript |
| **Schema** | Models, relations, annotations (@id, @unique, @map, etc.) |
| **CRUD** | create, findUnique, findMany, update, delete |
| **Relations** | One-to-Many, nested writes, connect |
| **Filtering** | where, OR, AND, contains, mode |
| **Pagination** | skip, take, count |
| **Aggregations** | count, aggregate, groupBy |
| **Transactions** | $transaction for atomic operations |
| **Raw SQL** | $queryRaw, $executeRaw |

### Prisma 7 Quick Reference

```typescript
// SETUP (Prisma 7 specific)
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// CREATE
prisma.user.create({ data: {...} })
prisma.user.createMany({ data: [...], skipDuplicates: true })

// READ
prisma.user.findUnique({ where: { id: 1 } })
prisma.user.findFirst({ where: {...} })
prisma.user.findMany({ where: {...}, include: {...}, orderBy: {...} })
prisma.user.count({ where: {...} })

// UPDATE
prisma.user.update({ where: { id: 1 }, data: {...} })
prisma.user.updateMany({ where: {...}, data: {...} })
prisma.user.upsert({ where: {...}, create: {...}, update: {...} })

// DELETE
prisma.user.delete({ where: { id: 1 } })
prisma.user.deleteMany({ where: {...} })

// ADVANCED
prisma.$transaction(async (tx) => {...})
prisma.$queryRaw`SELECT ...`
prisma.$executeRaw`UPDATE ...`
```

### Key Differences from Prisma 6

| What | Prisma 6 | Prisma 7 |
|------|----------|----------|
| Generator | `prisma-client-js` | `prisma-client` |
| DB URL | In schema.prisma | In prisma.config.ts |
| Adapter | Optional | **Required** |
| Import | `@prisma/client` | Custom path |

### Files to Remember

```
prisma.config.ts     → DB URL configuration (NEW)
schema.prisma        → Model definitions
src/lib/prisma.ts    → Singleton with adapter
src/index.ts         → Your Express routes
```

### Run This Project

```bash
npm install              # Install dependencies
npm run db:migrate       # Apply migrations
npm run dev              # Start dev server
# Server at http://localhost:3000
```

---

**Project:** Prisma 7 Todo App
**Last Updated:** January 2026
**Prisma Version:** 7.2.0
**Node Version:** 20.19+

*This project demonstrates all major Prisma 7 concepts through a complete, working Express.js application.*
