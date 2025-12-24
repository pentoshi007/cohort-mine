# Week 7: MongoDB, Mongoose & Backend Security

> A complete guide to building secure backend applications with MongoDB, Mongoose ODM, JWT Authentication, Password Hashing, and Input Validation.

---

## 📚 Table of Contents

- [Introduction to NoSQL Databases](#introduction-to-nosql-databases)
- [MongoDB Fundamentals](#mongodb-fundamentals)
- [Mongoose ODM](#mongoose-odm)
- [Schema Design](#schema-design)
- [CRUD Operations](#crud-operations)
- [Authentication Flow](#authentication-flow)
- [Password Security with Bcrypt](#password-security-with-bcrypt)
- [Input Validation with Zod](#input-validation-with-zod)
- [Error Handling](#error-handling)
- [Complete API Reference](#complete-api-reference)

---

## Introduction to NoSQL Databases

### SQL vs NoSQL: When to Use What?

```mermaid
graph TB
    subgraph SQL["SQL Databases"]
        S1["Structured Data"]
        S2["Fixed Schema"]
        S3["ACID Transactions"]
        S4["Vertical Scaling"]
        S5["Complex Joins"]
    end

    subgraph NoSQL["NoSQL Databases"]
        N1["Flexible Schema"]
        N2["Document-Based"]
        N3["Horizontal Scaling"]
        N4["High Performance"]
        N5["Embedded Documents"]
    end

    SQL --> |"Banking, ERP"| UseCase1["Strict Consistency"]
    NoSQL --> |"Social Media, Real-time Apps"| UseCase2["High Scalability"]
```

### Key Differences

| Feature           | SQL (PostgreSQL, MySQL)          | NoSQL (MongoDB)                 |
| ----------------- | -------------------------------- | ------------------------------- |
| **Schema**        | Rigid, predefined                | Flexible, dynamic               |
| **Scaling**       | Vertical (bigger server)         | Horizontal (more servers)       |
| **Data Model**    | Tables with rows                 | Collections with documents      |
| **Relationships** | JOINs                            | Embedded documents / References |
| **Best For**      | Complex queries, ACID compliance | Rapid development, scalability  |

> **Key Insight**: NoSQL databases like MongoDB are easy to scale horizontally. SQL databases require complex sharding and clustering to achieve similar scalability.

---

## MongoDB Fundamentals

### Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   COLLECTION                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │   │
│  │  │   DOCUMENT   │ │   DOCUMENT   │ │   DOCUMENT   │ │   │
│  │  │ {            │ │ {            │ │ {            │ │   │
│  │  │   _id: ...,  │ │   _id: ...,  │ │   _id: ...,  │ │   │
│  │  │   name: ..., │ │   name: ..., │ │   name: ..., │ │   │
│  │  │   email: ... │ │   email: ... │ │   email: ... │ │   │
│  │  │ }            │ │ }            │ │ }            │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

  SQL Equivalent:  Database → Table → Row
  MongoDB:         Database → Collection → Document
```

### MongoDB Document Structure

```javascript
// A MongoDB document is essentially a JSON object
{
    _id: ObjectId("507f1f77bcf86cd799439011"),  // Auto-generated unique ID
    name: "John Doe",
    email: "john@example.com",
    password: "$2a$10$hashedpassword...",
    createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

## Mongoose ODM

### What is Mongoose?

**Mongoose** is an Object Document Mapper (ODM) for MongoDB and Node.js. It provides:

- Schema definitions
- Data validation
- Query building
- Middleware hooks
- Type casting

### Setup & Connection

```javascript
// Install required packages
// npm install express mongoose jsonwebtoken

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB", err));
```

> **Pro Tip**: Always store sensitive data like `MONGODB_URI` in environment variables, never hardcode them.

---

## Schema Design

### The Schema → Model Pattern

```mermaid
flowchart LR
    A[Define Schema] --> B[Create Model]
    B --> C[Export Model]
    C --> D[Use in Routes]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#e8f5e9
    style D fill:#fce4ec
```

### Basic Schema Definition

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId; // For referencing other documents

// User Schema - Basic Version
const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
});

// Todo Schema - Basic Version
const todoSchema = new Schema({
  title: String,
  done: Boolean,
  userId: ObjectId, // Reference to User document
});

// Create Models
const UserModel = mongoose.model("User", userSchema);
const TodoModel = mongoose.model("Todo", todoSchema);

module.exports = { UserModel, TodoModel };
```

### Enhanced Schema with Constraints & Timestamps

```javascript
const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true, // Ensures no duplicate emails
  },
  password: String,
});

const todoSchema = new Schema(
  {
    title: String,
    done: Boolean,
    userId: ObjectId,
    dueBy: Date, // When the todo should be completed
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);
```

### Understanding Schema Options

| Option       | Description              | Example                               |
| ------------ | ------------------------ | ------------------------------------- |
| `type`       | Data type                | `{ type: String }`                    |
| `unique`     | Unique constraint        | `{ unique: true }`                    |
| `required`   | Must be provided         | `{ required: true }`                  |
| `default`    | Default value            | `{ default: false }`                  |
| `timestamps` | Auto createdAt/updatedAt | Schema option: `{ timestamps: true }` |

### Model Creation Pattern

```javascript
// Syntax: mongoose.model('CollectionName', schema)
const UserModel = mongoose.model("User", userSchema);
//                               ↑
//                               This becomes 'users' collection in MongoDB
//                               (lowercase + pluralized)
```

---

## CRUD Operations

### Create Operations

```javascript
// Method 1: Using create() - Recommended
await UserModel.create({
  name,
  email,
  password: hashedPassword,
});

// Method 2: Using new + save()
const user = new UserModel({ name, email, password });
await user.save();
```

### Read Operations

```javascript
// Find one document
const user = await UserModel.findOne({ email });

// Find one by ID
const user = await UserModel.findById(id);

// Find multiple documents
const todos = await TodoModel.find({ userId: req.userId });
// Returns: [{ _id, title, done, userId }, ...]

// Find with conditions
const completedTodos = await TodoModel.find({
  userId: req.userId,
  done: true,
});
```

### Update Operations

```javascript
// Method 1: findOneAndUpdate (Atomic operation)
const todo = await TodoModel.findOneAndUpdate(
  { _id: id, userId: req.userId }, // Filter
  { done: true }, // Update
  { new: true } // Options: return updated doc
);

// Method 2: Find, modify, save (Two operations)
const todo = await TodoModel.findOne({ _id: id, userId: req.userId });
if (todo) {
  todo.done = true;
  await todo.save();
}
```

> **Best Practice**: Use `findOneAndUpdate` for atomic operations. The `{ new: true }` option returns the updated document instead of the original.

### Delete Operations

```javascript
// Delete one document
const todo = await TodoModel.findOneAndDelete({
  _id: id,
  userId: req.userId,
});

// Delete many documents
await TodoModel.deleteMany({ userId: req.userId, done: true });
```

### CRUD Summary

```
┌───────────────────────────────────────────────────────────────┐
│                     MONGOOSE CRUD METHODS                      │
├───────────────────────────────────────────────────────────────┤
│  CREATE    │  Model.create()      │  new Model() + save()     │
├───────────────────────────────────────────────────────────────┤
│  READ      │  findOne()           │  find()      │  findById()│
├───────────────────────────────────────────────────────────────┤
│  UPDATE    │  findOneAndUpdate()  │  findByIdAndUpdate()      │
├───────────────────────────────────────────────────────────────┤
│  DELETE    │  findOneAndDelete()  │  deleteMany()             │
└───────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### JWT-Based Authentication Architecture

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant MongoDB
    participant JWT

    Note over Client,JWT: SIGNUP FLOW
    Client->>Server: POST /signup {name, email, password}
    Server->>Server: Hash password with bcrypt
    Server->>MongoDB: Store user document
    MongoDB-->>Server: Success
    Server-->>Client: 201 User created

    Note over Client,JWT: LOGIN FLOW
    Client->>Server: POST /login {email, password}
    Server->>MongoDB: Find user by email
    MongoDB-->>Server: User document
    Server->>Server: Compare passwords with bcrypt
    Server->>JWT: Generate token with userId
    JWT-->>Server: Signed token
    Server-->>Client: 200 {token}

    Note over Client,JWT: AUTHENTICATED REQUEST
    Client->>Server: GET /todos (Authorization: Bearer <token>)
    Server->>JWT: Verify token
    JWT-->>Server: Decoded {userId}
    Server->>MongoDB: Find todos by userId
    MongoDB-->>Server: Todo documents
    Server-->>Client: 200 {todos}
```

### Auth Middleware Implementation

```javascript
function auth(req, res, next) {
  // Extract token from "Bearer <token>" format
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId to request
    next(); // Proceed to route handler
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
```

### Token Generation

```javascript
// During login, after verifying credentials
const token = jwt.sign(
  { userId: user._id.toString() }, // Payload
  process.env.JWT_SECRET // Secret key
);
```

> **Security Note**: The `_id` is an ObjectId, we convert it to string for JWT payload.

---

## Password Security with Bcrypt

### Why Hash Passwords?

```
❌ NEVER store passwords as plaintext!

   If database is compromised:
   Plaintext: password123  →  Attacker sees: password123
   Hashed:    $2a$10$...   →  Attacker sees: $2a$10$X9K...
```

### How Bcrypt Works

```mermaid
flowchart TB
    subgraph Hashing["Password Hashing (Signup)"]
        P1["password123"] --> |"+ Salt + Rounds"| H1["$2a$10$K9X2..."]
    end

    subgraph Verifying["Password Verification (Login)"]
        P2["password123"] --> Compare
        H2["$2a$10$K9X2..."] --> Compare
        Compare --> |"bcrypt.compare()"| Result["true/false"]
    end
```

### Implementation

```javascript
const bcrypt = require("bcryptjs");

// SIGNUP: Hash the password before storing
const hashedPassword = await bcrypt.hash(password, 10);
//                                              ↑
//                                              Salt rounds (higher = slower but more secure)

await UserModel.create({
  name,
  email,
  password: hashedPassword, // Store hashed version
});

// LOGIN: Compare provided password with stored hash
const user = await UserModel.findOne({ email });
const isPasswordValid = await bcrypt.compare(password, user.password);
//                                           ↑            ↑
//                                     Plain text    Stored hash

if (!isPasswordValid) {
  return res.status(401).json({ message: "Invalid email or password" });
}
```

### Salt Rounds Explained

| Rounds | Time (approx) | Use Case                                |
| ------ | ------------- | --------------------------------------- |
| 10     | ~100ms        | Standard applications                   |
| 12     | ~300ms        | High-security applications              |
| 14+    | ~1s+          | Maximum security (may slow down server) |

> **Pro Tip**: Use 10-12 rounds for a balance between security and performance.

---

## Input Validation with Zod

### Why Validate Input?

```
User Input → Validation → Database
    ↓           ↓           ↓
  "abc"    ❌ Invalid    (rejected)
  "a@b.c"  ✅ Valid      (saved)
```

### Zod Schema Definition

```javascript
const { z } = require("zod");

// Define validation schema
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().min(3).max(100),
  password: z.string().min(6).max(100),
});
```

### Safe Parsing vs Parsing

```javascript
// safeParse - Does NOT throw, returns result object
const result = userSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({ message: result.error.message });
}

// parse - THROWS an error if invalid
try {
  const data = userSchema.parse(req.body);
} catch (error) {
  // Handle error
}
```

> **Best Practice**: Use `safeParse` for API validation to have controlled error handling without try-catch blocks.

### Common Zod Validators

```javascript
// String validations
z.string();
z.string().min(3); // Minimum 3 characters
z.string().max(100); // Maximum 100 characters
z.string().email(); // Must be valid email format
z.string().url(); // Must be valid URL

// Number validations
z.number();
z.number().min(0); // Must be >= 0
z.number().max(100); // Must be <= 100
z.number().int(); // Must be integer

// Boolean
z.boolean();

// Optional fields
z.string().optional();

// Arrays
z.array(z.string()); // Array of strings
```

---

## Error Handling

### MongoDB Duplicate Key Error

When `unique: true` is set on a field, MongoDB throws error code `11000` for duplicates:

```javascript
try {
  await UserModel.create({ name, email, password: hashedPassword });
  res.status(201).json({ message: "User created successfully" });
} catch (err) {
  if (err.code === 11000) {
    // Duplicate key error
    return res.status(409).json({ message: "Email already exists" });
  }
  return res.status(500).json({ message: "Error creating user" });
}
```

### HTTP Status Codes Reference

```
┌──────────────────────────────────────────────────────────────┐
│                    HTTP STATUS CODES                          │
├──────────────────────────────────────────────────────────────┤
│  2xx SUCCESS                                                  │
│    200 OK            - Request succeeded                      │
│    201 Created       - Resource created successfully          │
├──────────────────────────────────────────────────────────────┤
│  4xx CLIENT ERRORS                                            │
│    400 Bad Request   - Invalid input/validation failed        │
│    401 Unauthorized  - Authentication required/failed         │
│    404 Not Found     - Resource doesn't exist                 │
│    409 Conflict      - Duplicate resource (e.g., email)       │
├──────────────────────────────────────────────────────────────┤
│  5xx SERVER ERRORS                                            │
│    500 Internal Error - Unexpected server error               │
└──────────────────────────────────────────────────────────────┘
```

---

## Complete API Reference

### Endpoints Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  METHOD  │  ENDPOINT      │  AUTH  │  DESCRIPTION                  │
├─────────────────────────────────────────────────────────────────────┤
│  POST    │  /signup       │  ❌    │  Create new user account      │
│  POST    │  /login        │  ❌    │  Authenticate & get token     │
│  GET     │  /todos        │  ✅    │  Get all todos for user       │
│  POST    │  /todos        │  ✅    │  Create new todo              │
│  PATCH   │  /todos/:id    │  ✅    │  Mark todo as done            │
│  DELETE  │  /todos/:id    │  ✅    │  Delete a todo                │
└─────────────────────────────────────────────────────────────────────┘
```

### Signup Endpoint

```javascript
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate input with Zod
  const userSchema = z.object({
    name: z.string().min(3),
    email: z.string().email().min(3).max(100),
    password: z.string().min(6).max(100),
  });

  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }

  try {
    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save to database
    await UserModel.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    // 4. Handle duplicate email
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Error creating user" });
  }
});
```

### Login Endpoint

```javascript
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email only (not password!)
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // 2. Verify password with bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // 3. Generate JWT token
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET
  );

  res.status(200).json({ message: "Login successful", token });
});
```

### Todo Endpoints

```javascript
// GET all todos for authenticated user
app.get("/todos", auth, async (req, res) => {
  const todos = await TodoModel.find({ userId: req.userId });
  res.status(200).json({ todos });
});

// CREATE new todo
app.post("/todos", auth, async (req, res) => {
  const { title, dueBy } = req.body;
  const todo = await TodoModel.create({
    title,
    userId: req.userId,
    done: false,
    dueBy,
  });
  res.status(201).json({ message: "Todo created successfully", todo });
});

// MARK todo as done
app.patch("/todos/:id", auth, async (req, res) => {
  const { id } = req.params;

  const todo = await TodoModel.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { done: true },
    { new: true }
  );

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }
  res.status(200).json({ message: "Todo marked as done", todo });
});

// DELETE todo
app.delete("/todos/:id", auth, async (req, res) => {
  const { id } = req.params;
  const todo = await TodoModel.findOneAndDelete({
    _id: id,
    userId: req.userId,
  });

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }
  res.status(200).json({ message: "Todo deleted successfully" });
});
```

---

## Data Relationships in MongoDB

### Referencing (Used in this project)

```javascript
// User Document
{
    _id: ObjectId("user123"),
    name: "John",
    email: "john@example.com"
}

// Todo Document (references User)
{
    _id: ObjectId("todo456"),
    title: "Learn MongoDB",
    done: false,
    userId: ObjectId("user123")  // ← Reference to User
}
```

### Why Reference Instead of Embed?

```
REFERENCING (Normalization)          EMBEDDING (Denormalization)
─────────────────────────────────    ─────────────────────────────────
User: { _id, name, email }           User: {
Todo: { _id, title, userId }           _id, name, email,
                                       todos: [
✅ Less data duplication                  { title, done },
✅ Easy to update user info               { title, done }
✅ Each collection scales independently   ]
❌ Requires multiple queries           }

                                     ✅ Single query gets all data
                                     ❌ Document size limit (16MB)
                                     ❌ Duplicated data
```

---

## Project Setup

### Dependencies

```bash
npm init -y
npm install express mongoose jsonwebtoken bcryptjs zod
```

### Environment Variables

```bash
# .env file
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-here
```

### File Structure

```
07-week-7/
├── 7.1-db.js           # Basic schema definitions
├── 7.1-mongodb.js      # Basic Express + MongoDB server
├── 7.2-db.js           # Enhanced schemas (unique, timestamps)
├── 7.2-password-zod.js # Production-ready server with security
└── README.md           # This documentation
```

---

## Key Takeaways

1. **Always hash passwords** - Never store plaintext passwords
2. **Validate all input** - Use Zod for clean, type-safe validation
3. **Use `safeParse`** - For controlled error handling
4. **Handle duplicates** - MongoDB error code `11000` for unique violations
5. **JWT for stateless auth** - Token contains user identity
6. **Protect routes** - Use auth middleware for authenticated endpoints
7. **Atomic updates** - Prefer `findOneAndUpdate` over find-modify-save
8. **Environment variables** - Never hardcode secrets

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                     MONGOOSE CHEATSHEET                         │
├─────────────────────────────────────────────────────────────────┤
│  SCHEMA TYPES                                                   │
│    String, Number, Boolean, Date, ObjectId, Array               │
├─────────────────────────────────────────────────────────────────┤
│  MODEL METHODS                                                  │
│    create()  findOne()  find()  findById()                      │
│    findOneAndUpdate()  findOneAndDelete()  deleteMany()         │
├─────────────────────────────────────────────────────────────────┤
│  BCRYPT                                                         │
│    bcrypt.hash(password, saltRounds)  // Hash                   │
│    bcrypt.compare(plain, hash)        // Verify                 │
├─────────────────────────────────────────────────────────────────┤
│  ZOD                                                            │
│    z.string()  z.number()  z.boolean()  z.object()              │
│    .min()  .max()  .email()  .optional()  .safeParse()          │
├─────────────────────────────────────────────────────────────────┤
│  JWT                                                            │
│    jwt.sign(payload, secret)     // Create token                │
│    jwt.verify(token, secret)     // Verify & decode             │
└─────────────────────────────────────────────────────────────────┘
```

---

<div align="center">

**Week 7 Complete** ✅

_Building secure, scalable backends with MongoDB & Express_

</div>
