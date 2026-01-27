# Prisma 7 Setup Guide - Complete Reference

> **Based on the official [Prisma ORM Quickstart with Prisma Postgres](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres)**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Project Setup](#initial-project-setup)
3. [Installing Dependencies](#installing-dependencies)
4. [Configure ESM Support](#configure-esm-support)
5. [Initialize Prisma ORM](#initialize-prisma-orm)
6. [Prisma Configuration Files](#prisma-configuration-files)
7. [Define Your Data Model](#define-your-data-model)
8. [Create and Apply Migrations](#create-and-apply-migrations)
9. [Instantiate Prisma Client](#instantiate-prisma-client)
10. [Write Your First Query](#write-your-first-query)
11. [Explore with Prisma Studio](#explore-with-prisma-studio)
12. [Database Setup Options](#database-setup-options)
13. [Troubleshooting](#troubleshooting)
14. [Quick Reference](#quick-reference)

---

## Prerequisites

### Required Software

- **Node.js** v20.19+, v22.12+, or v24.0+
- Basic knowledge of JavaScript or TypeScript

```bash
# Check versions
node --version    # v20.19+ required
npm --version     # v9+ recommended
```

---

## Initial Project Setup

### Step 1: Create Project Directory

```bash
mkdir hello-prisma
cd hello-prisma
```

### Step 2: Initialize TypeScript Project

```bash
npm init -y
npm install typescript tsx @types/node --save-dev
npx tsc --init
```

---

## Installing Dependencies

### Install Required Packages

```bash
# Install Prisma CLI and types (dev dependencies)
npm install prisma @types/node @types/pg --save-dev 

# Install runtime dependencies
npm install @prisma/client @prisma/adapter-pg pg dotenv
```

### Package Purposes

| Package | Purpose |
|---------|---------|
| `prisma` | CLI for commands like `prisma init`, `prisma migrate`, `prisma generate` |
| `@prisma/client` | Prisma Client library for querying your database |
| `@prisma/adapter-pg` | The `node-postgres` driver adapter that connects Prisma Client to your database |
| `pg` | The node-postgres database driver |
| `@types/pg` | TypeScript type definitions for node-postgres |
| `dotenv` | Loads environment variables from your `.env` file |
| `tsx` | TypeScript execution for running scripts directly |

---

## Configure ESM Support

### Update tsconfig.json

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  }
}
```

### Update package.json

Add `"type": "module"` to enable ESM:

```json
{
  "type": "module"
}
```

---

## Initialize Prisma ORM

### Run Prisma Init

```bash
npx prisma init --db --output ../generated/prisma
```

This command creates:
- `prisma/` directory with `schema.prisma` file
- A new Prisma Postgres database (when using `--db` flag)
- `.env` file in the root directory
- `prisma.config.ts` file for Prisma configuration

> **Note:** If not using Prisma Postgres, omit the `--db` flag and manually configure your database connection.

---

## Prisma Configuration Files

### prisma.config.ts (NEW in Prisma 7)

This file configures the database connection URL and schema location:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

**Key Points:**
- Uses `import "dotenv/config"` to load environment variables
- Uses `env("DATABASE_URL")` from `prisma/config` (not `process.env`)
- This file is NOT compiled by TypeScript (exclude in tsconfig.json)

### prisma/schema.prisma

The schema uses the new ESM-first `prisma-client` generator:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

**Important Changes from Prisma 6:**
- Generator provider changed from `"prisma-client-js"` to `"prisma-client"`
- Custom `output` path is specified (`"../src/generated/prisma"` - inside src for proper TypeScript compilation)
- No `url` in datasource block (moved to `prisma.config.ts`)

---

## Define Your Data Model

Add your models to `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
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

### Schema Annotations Reference

| Annotation | Level | Purpose | Example |
|------------|-------|---------|---------|
| `@id` | Field | Primary key | `id Int @id` |
| `@default()` | Field | Default value | `@default(autoincrement())` |
| `@unique` | Field | Unique constraint | `email String @unique` |
| `@map()` | Field | Rename column in DB | `@map("created_at")` |
| `@@map()` | Model | Rename table in DB | `@@map("users")` |
| `@relation()` | Field | Define relationship | `@relation(fields: [userId], references: [id])` |

---

## Create and Apply Migrations

### Create First Migration

```bash
npx prisma migrate dev --name init
```

This command:
1. Loads `prisma.config.ts` (with `DATABASE_URL`)
2. Generates SQL migration files
3. Applies migration to database
4. Generates Prisma Client

### Generate Prisma Client

```bash
npx prisma generate
```

### Migration Commands Reference

```bash
# Create migration without applying
npx prisma migrate dev --create-only --name add_feature

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (DELETES ALL DATA)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Generate Prisma Client only
npx prisma generate
```

---

## Instantiate Prisma Client

Create a file to instantiate the Prisma Client with the adapter:

### src/lib/prisma.ts

```typescript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

**Key Points:**
- Import `PrismaClient` from the generated output path (`../generated/prisma/client.js` - relative to lib folder)
- Use `PrismaPg` adapter with `connectionString` option directly
- Load env vars with `import "dotenv/config"`

---

## Write Your First Query

### script.ts

```typescript
import { prisma } from "./lib/prisma.js";

async function main() {
  // Create a new user with a todo
  const user = await prisma.user.create({
    data: {
      username: "alice",
      email: "alice@example.com",
      password: "hashed_password_here",
      todos: {
        create: {
          title: "Hello World",
          description: "This is my first todo!",
        },
      },
    },
    include: {
      todos: true,
    },
  });
  console.log("Created user:", user);

  // Fetch all users with their todos
  const allUsers = await prisma.user.findMany({
    include: {
      todos: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### Run the Script

```bash
npx tsx script.ts
```

---

## Explore with Prisma Studio

Launch Prisma Studio to visually explore your data:

```bash
npx prisma studio --config ./prisma.config.ts
```

This opens a web interface at `http://localhost:5555` where you can view and edit your data.

---

## Database Setup Options

### Option 1: Prisma Postgres (Recommended)

Use `npx prisma init --db` to automatically create a Prisma Postgres database.

### Option 2: Neon (Serverless Postgres)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string to `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

### Option 3: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings -> Database:

```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

### Option 4: Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@18
brew services start postgresql@18

# Create database
createdb myapp

# Configure .env
DATABASE_URL="postgresql://username:password@localhost:5432/myapp"
```

---

## Troubleshooting

### Issue 1: "Cannot find module '@prisma/client'"

**Solution:** Generate the client:
```bash
npx prisma generate
```

### Issue 2: "Cannot find module '../generated/prisma/client.js'"

**Solution:** 
1. Ensure `output` is set in generator block
2. Run `npx prisma generate`

### Issue 3: TypeScript Error with prisma.config.ts

**Solution:** Exclude it from compilation:
```json
{
  "exclude": ["node_modules", "dist", "prisma.config.ts"]
}
```

### Issue 4: "Could not find declaration file for module 'pg'"

**Solution:**
```bash
npm install --save-dev @types/pg
```

### Issue 5: Migration fails with "database does not exist"

**Solution:**
```bash
# Create database first
createdb myapp

# Then run migration
npx prisma migrate dev
```

### Issue 6: Connection refused to database

**Check:**
1. PostgreSQL is running: `brew services list | grep postgres`
2. `DATABASE_URL` is correct in `.env`
3. Database exists: `psql -l`

---

## Quick Reference

### Essential Commands

```bash
# Setup
npm install prisma @prisma/client @prisma/adapter-pg pg dotenv
npm install -D @types/pg tsx
npx prisma init --output ../src/generated/prisma

# Development
npx prisma migrate dev --name <name>
npx prisma generate
npx prisma studio

# Production
npx prisma migrate deploy
npx prisma generate

# Utilities
npx prisma format
npx prisma validate
npx prisma db pull
npx prisma db push
```

### File Structure

```
my-prisma-app/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── src/
│   ├── generated/
│   │   └── prisma/       # Generated Prisma Client (ESM-first, inside src for TS)
│   ├── lib/
│   │   └── prisma.ts     # Prisma Client singleton (optional)
│   └── index.ts          # Application code
├── dist/                 # Compiled JavaScript
├── node_modules/
├── .env                  # Environment variables (not in git)
├── .gitignore
├── package.json
├── prisma.config.ts      # Prisma 7 config (not compiled)
└── tsconfig.json
```

### Prisma 6 vs Prisma 7 Comparison

| Feature | Prisma 6 | Prisma 7 |
|---------|----------|----------|
| Generator | `prisma-client-js` | `prisma-client` |
| Client output | `node_modules/.prisma/client` | Custom path (e.g., `../src/generated/prisma`) |
| DB URL in schema | `url = env("DATABASE_URL")` | Removed (use `prisma.config.ts`) |
| Config file | Not required | `prisma.config.ts` required |
| Adapter | Optional | Required for new client |
| Import | `@prisma/client` | Custom path (e.g., `./generated/prisma/client.js`) |

---

## Resources

- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [Prisma Quickstart with Prisma Postgres](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres)
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Adapters](https://www.prisma.io/docs/orm/overview/databases/postgresql)

---

**Last Updated:** January 2026 | Prisma Version: 7.2.0

*This guide follows the official Prisma 7 documentation with the new ESM-first client and adapter pattern.*
