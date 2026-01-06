# Brainly Backend - Complete Revision Guide

A comprehensive learning resource for the Node.js/Express backend of the Second Brain application.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Application Architecture](#application-architecture)
3. [Express Server Setup](#express-server-setup)
4. [MongoDB with Mongoose](#mongodb-with-mongoose)
5. [Mongoose Schema Patterns](#mongoose-schema-patterns)
6. [Authentication Flow](#authentication-flow)
7. [JWT Middleware Pattern](#jwt-middleware-pattern)
8. [Route Handlers & CRUD](#route-handlers--crud)
9. [Advanced MongoDB Queries](#advanced-mongodb-queries)
10. [Error Handling Patterns](#error-handling-patterns)
11. [Environment Variables](#environment-variables)
12. [Summary & Key Takeaways](#summary--key-takeaways)

---

## Tech Stack Overview

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | JavaScript runtime |
| Express | 5.x | Web framework |
| TypeScript | 5.9.x | Type safety |
| Mongoose | 9.x | MongoDB ODM |
| bcrypt | 6.x | Password hashing |
| jsonwebtoken | 9.x | JWT tokens |
| dotenv | 17.x | Environment variables |
| cors | 2.x | Cross-Origin requests |

```mermaid
graph TB
    subgraph "Client"
        FE[React Frontend]
    end
    
    subgraph "API Layer"
        EXP[Express Server]
        MW[Middleware]
    end
    
    subgraph "Data Layer"
        MG[Mongoose ODM]
        DB[(MongoDB)]
    end
    
    FE -->|HTTP/REST| EXP
    EXP --> MW
    MW --> MG
    MG --> DB
    
    style EXP fill:#68a063,color:#fff
    style DB fill:#4db33d,color:#fff
    style MW fill:#f59e0b,color:#000
```

---

## Application Architecture

```
src/
├── index.ts          # Entry point, Express setup
├── db.ts             # MongoDB connection
├── middleware/
│   └── userAuth.ts   # JWT verification middleware
├── routes/
│   ├── auth.ts       # Signup/Signin
│   ├── content.ts    # Content CRUD
│   ├── tag.ts        # Tag CRUD
│   └── link.ts       # Share link management
├── schema/
│   ├── User.ts       # User model
│   ├── Content.ts    # Content model
│   ├── Tag.ts        # Tag model
│   └── Link.ts       # Share link model
└── utils/
    └── random.ts     # Utility functions
```

### Key Insight
- **Separation of Concerns**: Routes handle HTTP, schemas define data structure, middleware handles cross-cutting concerns
- **ES Modules**: Uses `"type": "module"` in package.json for native ES imports

---

## Express Server Setup

### Entry Point Pattern

```typescript
// index.ts
import dotenv from "dotenv";  // Load first!
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";

dotenv.config();  // Parse .env file

const app = express();

// Middleware
app.use(cors());           // Enable CORS for all origins
app.use(express.json());   // Parse JSON request bodies

// Route registration
app.use("/api/v1", authRouter);         // /api/v1/signup, /api/v1/signin
app.use("/api/v1/content", contentRouter);  // /api/v1/content/*
app.use("/api/v1/tags", tagRouter);     // /api/v1/tags/*
app.use(linkRouter);  // Has full paths defined inside

async function main() {
  await connectDB();  // Wait for DB before starting server
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
}

main();
```

### Key Insight
- **dotenv first**: Must be imported and configured before accessing `process.env`
- **Async startup**: Wait for database connection before accepting requests
- **Route prefixing**: `app.use("/api/v1", router)` prefixes all routes in that router

---

## MongoDB with Mongoose

### Connection Pattern

```typescript
// db.ts
import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);  // Exit with failure code
  }
}
```

### Key Insight
- **Fail fast**: If DB connection fails, exit immediately rather than running without a database
- **Environment check**: Validate required env vars before using them

---

## Mongoose Schema Patterns

### Basic Schema with TypeScript

```typescript
// schema/User.ts
import { Model, Schema, model } from "mongoose";

// 1. Define TypeScript interface for the document
export interface IUser {
  email: string;
  password: string;
}

// 2. Create schema with generic type
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// 3. Export typed model
export const UserModel: Model<IUser> = model<IUser>("User", userSchema);
//                      ^^^^^^^^^^^^^ TYPE annotation
//                                     ^^^^^^ FUNCTION call with generic
```

### Key Insight
- `Model<IUser>` is a **TYPE** (capital M) from Mongoose
- `model<IUser>()` is a **FUNCTION** (lowercase m) that creates the model
- The generic appears twice for complete type safety

---

### Schema with References

```typescript
// schema/Content.ts
import mongoose, { Model } from "mongoose";

export type ContentType = "note" | "video" | "tweet" | "link";

interface IContent {
  title: string;
  type: ContentType;
  link?: string;
  content?: string;
  tags: mongoose.Types.ObjectId[];     // Array of references
  userId: mongoose.Types.ObjectId;     // Single reference
}

const contentSchema = new mongoose.Schema<IContent>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["note", "video", "tweet", "link"],  // Restrict values
      default: "link",
    },
    link: { type: String },
    content: { type: String },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,  // Auto-add createdAt, updatedAt
  }
);
```

### Key Insight
- **ref**: Links to another collection for `.populate()`
- **enum**: Restricts field to specific values
- **timestamps: true**: Mongoose adds `createdAt` and `updatedAt` automatically

---

### Compound Indexes

```typescript
// schema/Tag.ts
const tagSchema = new mongoose.Schema<ITag>(
  {
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Ensure each user can only have one tag with a given title
tagSchema.index({ title: 1, userId: 1 }, { unique: true });
```

### Key Insight
- **Compound index**: Combines multiple fields for uniqueness
- User A can have "react" tag, User B can also have "react" tag
- But User A cannot have two "react" tags

```mermaid
erDiagram
    User ||--o{ Content : "has many"
    User ||--o{ Tag : "has many"
    User ||--o| Link : "has one"
    Content }o--o{ Tag : "many to many"
    
    User {
        ObjectId _id
        string email
        string password
    }
    
    Content {
        ObjectId _id
        string title
        string type
        string link
        string content
        ObjectId userId
        ObjectId[] tags
    }
    
    Tag {
        ObjectId _id
        string title
        ObjectId userId
    }
    
    Link {
        ObjectId _id
        string hash
        ObjectId userId
    }
```

---

## Authentication Flow

### Password Hashing with bcrypt

```typescript
// routes/auth.ts
import bcrypt from "bcrypt";

// Signup - Hash password before storing
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Check if user exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res.status(409).json({ message: "User already exists" });
    return;
  }
  
  // Hash password with salt rounds = 10
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await UserModel.create({
    email,
    password: hashedPassword,  // Store hashed, never plain text
  });
  
  res.status(201).json({ message: "User created successfully" });
});
```

### Key Insight
- **Salt rounds (10)**: Number of hashing iterations, higher = more secure but slower
- **Never store plain text passwords**
- **bcrypt.compare()** handles salt extraction internally

---

### JWT Token Generation

```typescript
import jwt from "jsonwebtoken";

// Signin - Verify password and issue token
router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;  // Generic message - don't reveal if email exists
  }
  
  // Compare provided password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  
  // Create JWT with user ID payload
  const token = jwt.sign(
    { userId: user._id },       // Payload
    process.env.JWT_SECRET!,    // Secret key
    { expiresIn: "7d" }         // Options
  );
  
  res.json({ token });
});
```

### Key Insight
- **Same error message** for wrong email and wrong password (security)
- **Payload should be minimal** - just user ID, not sensitive data
- **expiresIn**: Token auto-expires, user must re-login

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as MongoDB

    Note over C,DB: Signup Flow
    C->>S: POST /signup {email, password}
    S->>S: bcrypt.hash(password, 10)
    S->>DB: UserModel.create({email, hashedPassword})
    DB-->>S: User created
    S-->>C: 201 {message: "User created"}

    Note over C,DB: Signin Flow
    C->>S: POST /signin {email, password}
    S->>DB: UserModel.findOne({email})
    DB-->>S: User document
    S->>S: bcrypt.compare(password, hash)
    S->>S: jwt.sign({userId}, secret)
    S-->>C: 200 {token: "eyJ..."}
```

---

## JWT Middleware Pattern

### Extended Request Type

```typescript
// middleware/userAuth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Extend Express Request to include userId
export interface AuthRequest extends Request {
  userId?: mongoose.Types.ObjectId;
}

export function userAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  // Extract token from "Bearer <token>" format
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: mongoose.Types.ObjectId;
    };
    
    // Attach userId to request for route handlers
    req.userId = decoded.userId;
    next();  // Continue to route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
}
```

### Key Insight
- **Interface extension**: TypeScript way to add properties to Express Request
- **Optional chaining**: `authorization?.split()` handles missing header
- **Type assertion**: `as { userId: ... }` tells TS what the decoded payload contains

### Usage in Routes

```typescript
// Protected route
router.get("/", userAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;  // Available because middleware attached it
  // ... rest of handler
});
```

---

## Route Handlers & CRUD

### Create with Tag Resolution

```typescript
// routes/content.ts
router.post("/", userAuth, async (req: AuthRequest, res: Response) => {
  const { title, type = "link", link, content, tags } = req.body;
  const userId = req.userId;

  // Handle tags - find existing or create new
  let tagIds: mongoose.Types.ObjectId[] = [];
  if (tags && Array.isArray(tags) && tags.length > 0) {
    for (const tagTitle of tags) {
      // Find or create pattern
      let tag = await TagModel.findOne({ 
        title: tagTitle.toLowerCase(), 
        userId 
      });
      if (!tag) {
        tag = await TagModel.create({ 
          title: tagTitle.toLowerCase(), 
          userId 
        });
      }
      tagIds.push(tag._id as mongoose.Types.ObjectId);
    }
  }

  const newContent = await ContentModel.create({
    title,
    type,
    link: type !== "note" ? link : undefined,
    content: type === "note" ? content : undefined,
    tags: tagIds,
    userId,
  });

  // Populate references before returning
  const populatedContent = await ContentModel.findById(newContent._id)
    .populate("userId", "email")  // Only include email field
    .populate("tags");

  res.status(201).json({ message: "Content created", content: populatedContent });
});
```

### Key Insight
- **Find or Create**: Check if exists, create if not
- **Lowercase normalization**: `tagTitle.toLowerCase()` ensures case-insensitive matching
- **Populate after create**: Mongoose `create()` doesn't auto-populate, so fetch again with populate

---

### Delete with Ownership Check

```typescript
router.delete("/:id", userAuth, async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const userId = req.userId;

  // findOneAndDelete with both _id and userId ensures:
  // 1. Document exists
  // 2. User owns the document
  const content = await ContentModel.findOneAndDelete({
    _id: id,
    userId: userId as any,
  });

  if (!content) {
    res.status(404).json({ message: "Content not found" });
    return;
  }

  res.json({ message: "Content deleted" });
});
```

### Key Insight
- **Combined query**: `{ _id, userId }` is more secure than deleting by ID then checking ownership
- **Atomic operation**: No race conditions between check and delete

---

## Advanced MongoDB Queries

### $or Query for Legacy Content

When filtering by type, we need to handle old content that doesn't have a `type` field:

```typescript
router.get("/", userAuth, async (req: AuthRequest, res: Response) => {
  const typeParam = req.query.type as string | undefined;
  let filter: Record<string, any> = { userId };
  
  if (typeParam === "video") {
    filter = {
      userId,
      $or: [
        // New content with explicit type
        { type: "video" },
        // Legacy content - infer from URL
        { type: { $exists: false }, link: { $regex: /youtube\.com|youtu\.be/i } },
        { type: null, link: { $regex: /youtube\.com|youtu\.be/i } },
      ],
    };
  } else if (typeParam === "tweet") {
    filter = {
      userId,
      $or: [
        { type: "tweet" },
        { type: { $exists: false }, link: { $regex: /twitter\.com|x\.com/i } },
        { type: null, link: { $regex: /twitter\.com|x\.com/i } },
      ],
    };
  } else if (typeParam === "link") {
    // Links are everything that's NOT video or tweet
    filter = {
      userId,
      $or: [
        { type: "link" },
        {
          type: { $exists: false },
          link: { $not: { $regex: /youtube\.com|youtu\.be|twitter\.com|x\.com/i } },
        },
      ],
    };
  }

  const content = await ContentModel.find(filter)
    .populate("userId", "email")
    .populate("tags")
    .sort({ createdAt: -1 });
});
```

### Key Insight
- **$or**: Matches documents that satisfy at least one condition
- **$exists: false**: Field doesn't exist in document
- **$regex**: Pattern matching, `/i` = case insensitive
- **$not**: Negates the condition

---

### Populate for Relationships

```typescript
// Populate specific fields only
await ContentModel.find({ userId })
  .populate("userId", "email")     // Only get email from User
  .populate("tags")                // Get all fields from Tag
  .sort({ createdAt: -1 });        // Newest first
```

**Before populate:**
```json
{
  "_id": "...",
  "title": "My note",
  "userId": "507f1f77bcf86cd799439011",
  "tags": ["507f1f77bcf86cd799439012"]
}
```

**After populate:**
```json
{
  "_id": "...",
  "title": "My note",
  "userId": { "_id": "...", "email": "user@example.com" },
  "tags": [{ "_id": "...", "title": "react", "userId": "..." }]
}
```

---

## Error Handling Patterns

### Consistent Error Responses

```typescript
try {
  // ... operation
} catch (error) {
  console.error("Operation name error:", error);  // Log for debugging
  res.status(500).json({ message: "Internal server error" });  // Generic message
}
```

### Key Insight
- **Don't expose internal errors** to client (security)
- **Log full error** server-side for debugging
- **Use specific status codes**:
  - `400` - Bad Request (validation failed)
  - `401` - Unauthorized (not logged in)
  - `404` - Not Found
  - `409` - Conflict (duplicate)
  - `500` - Internal Server Error

---

### Early Return Pattern

```typescript
router.post("/", userAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  // Guard clauses at the top
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;  // Early return
  }

  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;  // Early return
  }

  // Happy path - main logic
  const content = await ContentModel.create({ ... });
  res.status(201).json({ content });
});
```

### Key Insight
- Guard clauses reduce nesting
- Main logic stays at the first indentation level
- Each validation has a clear exit point

---

## Environment Variables

### Required Variables

```bash
# .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-change-in-production
PORT=3000
```

### Pattern for Validation

```typescript
// Validate at startup
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

// Validate at runtime (middleware)
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set");
  res.status(500).json({ message: "Server configuration error" });
  return;
}
```

---

## Summary & Key Takeaways

### Architecture Principles
1. **Layered Architecture**: Routes → Middleware → Models → Database
2. **Fail Fast**: Validate inputs early, return errors immediately
3. **Separation of Concerns**: Each file has one responsibility

### Express Patterns
- ✅ **Route prefixing** with `app.use("/prefix", router)`
- ✅ **Middleware chain** for auth and validation
- ✅ **Extended Request type** for TypeScript

### Mongoose Patterns
- ✅ **Typed schemas** with `Schema<IDocument>`
- ✅ **References** with `ObjectId` and `ref`
- ✅ **Compound indexes** for multi-field uniqueness
- ✅ **Populate** for joining collections

### Security Patterns
- ✅ **bcrypt** for password hashing (salt rounds = 10)
- ✅ **JWT** for stateless authentication
- ✅ **Ownership checks** in queries, not just ID
- ✅ **Generic error messages** for auth failures

### MongoDB Query Patterns
- ✅ **$or** for multiple conditions
- ✅ **$regex** for pattern matching
- ✅ **$exists** for checking field presence
- ✅ **findOneAndDelete** for atomic operations

### Quick Command Reference

```bash
# Build TypeScript
npm run build     # tsc -b

# Start with nodemon
npm run start     # nodemon ./dist/index.js

# Development (build + start)
npm run dev       # npm run build && npm run start
```

---

> **Remember**: Security is not optional. Always hash passwords, validate tokens, check ownership, and never expose internal errors.
