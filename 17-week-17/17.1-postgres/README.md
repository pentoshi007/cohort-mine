# 📚 PostgreSQL & Node.js - Complete Revision Guide

> **Week 17.1** - Mastering PostgreSQL with Express.js and TypeScript

A comprehensive guide covering PostgreSQL fundamentals, Node.js integration, SQL injection prevention, and building a production-ready REST API.

---

## 📑 Table of Contents

1. [Introduction to PostgreSQL](#1-introduction-to-postgresql)
2. [Database Types Comparison](#2-database-types-comparison)
3. [PostgreSQL Setup & Installation](#3-postgresql-setup--installation)
4. [Connecting Node.js to PostgreSQL](#4-connecting-nodejs-to-postgresql)
5. [SQL Fundamentals](#5-sql-fundamentals)
6. [SQL Injection - The Security Nightmare](#6-sql-injection---the-security-nightmare)
7. [Building a REST API with Express + PostgreSQL](#7-building-a-rest-api-with-express--postgresql)
8. [Project Structure & Configuration](#8-project-structure--configuration)
9. [Visual Architecture Diagrams](#9-visual-architecture-diagrams)
10. [Summary & Key Takeaways](#10-summary--key-takeaways)

---

## 1. Introduction to PostgreSQL

### What is PostgreSQL?

PostgreSQL (often called "Postgres") is a powerful, open-source **relational database management system (RDBMS)**. Unlike MongoDB which is schema-less, PostgreSQL requires a **predefined schema** - you must define your table structure, column names, and data types before inserting data.

### Key Characteristics

| Feature | PostgreSQL | MongoDB |
|---------|------------|---------|
| **Schema** | Schema-full (rigid structure) | Schema-less (flexible) |
| **Data Model** | Tables with rows & columns | Documents (JSON-like) |
| **Relationships** | Foreign keys, JOINs | Embedded documents, references |
| **ACID Compliance** | Full ACID support | Configurable |
| **Query Language** | SQL | MongoDB Query Language |
| **Best For** | Complex queries, data integrity | Rapid development, flexible data |

### Why Choose PostgreSQL?

- ✅ **Strong data integrity** - ACID compliant transactions
- ✅ **Complex queries** - Powerful SQL with JOINs, subqueries, CTEs
- ✅ **Relational integrity** - Foreign keys prevent orphaned data
- ✅ **Mature ecosystem** - Decades of production use
- ✅ **Extensions** - PostGIS (geospatial), full-text search, JSON support

---

## 2. Database Types Comparison

Understanding when to use which database is crucial for system design:

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'tertiaryBkg': '#3d3d3d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
graph TB
    subgraph "Relational Databases"
        SQL["🐘 PostgreSQL / MySQL"]
        SQL_USE["Use Cases:<br/>• Banking systems<br/>• E-commerce<br/>• User authentication<br/>• Inventory management"]
    end
    
    subgraph "Document Databases"
        NOSQL["🍃 MongoDB"]
        NOSQL_USE["Use Cases:<br/>• Content management<br/>• Real-time analytics<br/>• Mobile apps<br/>• Rapid prototyping"]
    end
    
    subgraph "Graph Databases"
        GRAPH["🕸️ Neo4j / Neptune"]
        GRAPH_USE["Use Cases:<br/>• Social networks<br/>• Recommendation engines<br/>• Fraud detection<br/>• Knowledge graphs"]
    end
    
    subgraph "Vector Databases"
        VECTOR["🎯 Pinecone / Weaviate"]
        VECTOR_USE["Use Cases:<br/>• Semantic search<br/>• AI/ML embeddings<br/>• Image similarity<br/>• RAG systems"]
    end
    
    SQL --> SQL_USE
    NOSQL --> NOSQL_USE
    GRAPH --> GRAPH_USE
    VECTOR --> VECTOR_USE
    
    style SQL fill:#336791,stroke:#ffffff,color:#ffffff
    style NOSQL fill:#4db33d,stroke:#ffffff,color:#ffffff
    style GRAPH fill:#018bff,stroke:#ffffff,color:#ffffff
    style VECTOR fill:#ff6b6b,stroke:#ffffff,color:#ffffff
```

### Detailed Breakdown

#### 1. **PostgreSQL (Relational/SQL)**
```
Structure: Tables → Rows → Columns
Schema: REQUIRED before inserting data
Strength: Complex queries, data integrity, ACID transactions
```

#### 2. **MongoDB (Document/NoSQL)**
```
Structure: Collections → Documents (JSON-like)
Schema: Optional (enforced via Mongoose at app level)
Strength: Flexibility, horizontal scaling, nested data
```

#### 3. **Graph Databases (Neo4j, Neptune)**
```
Structure: Nodes (entities) + Edges (relationships)
Strength: Traversing relationships is lightning fast
Example: "Find friends of friends who like X"
```

#### 4. **Vector Databases (Pinecone, Weaviate)**
```
Structure: High-dimensional vectors (embeddings)
Strength: Similarity search using ML models
Example: "Find documents semantically similar to this query"
```

---

## 3. PostgreSQL Setup & Installation

### Installation on macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@18

# Start as a background service
brew services start postgresql@18

# Verify installation
psql --version
```

### Service Management Commands

```bash
# Start PostgreSQL
brew services start postgresql@18

# Stop PostgreSQL
brew services stop postgresql@18

# Restart PostgreSQL
brew services restart postgresql@18

# Check status
brew services list | grep postgres
```

### Connection Methods

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
flowchart LR
    A["🖥️ Your App"] --> B{"Connection Type"}
    B --> C["Direct CLI<br/>psql command"]
    B --> D["Connection String<br/>postgresql://user:pass@host:port/db"]
    B --> E["Programmatic<br/>pg library in Node.js"]
    
    C --> F["🐘 PostgreSQL"]
    D --> F
    E --> F
    
    style A fill:#bb86fc,stroke:#ffffff,color:#000000
    style F fill:#336791,stroke:#ffffff,color:#ffffff
```

#### Method 1: Direct Connection (Local Development)
```bash
# Simple connection (uses current OS user)
psql

# Connect to specific database
psql -d postgres

# Connect with username
psql -U aniketpandey -d postgres
```

#### Method 2: Connection String (Production/Remote)
```bash
psql "postgresql://username:password@localhost:5432/database_name"
```

#### Method 3: Environment Variable (For Scripts)
```bash
PGPASSWORD=mypassword psql -U username -d database
```

### Essential psql Commands

| Command | Description |
|---------|-------------|
| `\l` | List all databases |
| `\c dbname` | Connect to a database |
| `\dt` | List all tables |
| `\d tablename` | Describe table structure |
| `\du` | List all users/roles |
| `\conninfo` | Show connection info |
| `\i file.sql` | Execute SQL from file |
| `\q` | Quit psql |

---

## 4. Connecting Node.js to PostgreSQL

### Required Dependencies

```bash
npm install pg express
npm install -D typescript @types/node @types/express @types/pg
```

### The `pg` Library - Client vs Pool

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
graph TB
    subgraph "Client (Single Connection)"
        C1["const client = new Client()"]
        C2["await client.connect()"]
        C3["await client.query()"]
        C4["await client.end()"]
        C1 --> C2 --> C3 --> C4
    end
    
    subgraph "Pool (Connection Pool)"
        P1["const pool = new Pool()"]
        P2["pool.query() ← auto manages connections"]
        P3["Reuses connections efficiently"]
        P1 --> P2 --> P3
    end
    
    CLIENT_USE["Use Client for:<br/>• Simple scripts<br/>• Single operations"]
    POOL_USE["Use Pool for:<br/>• Web servers<br/>• High concurrency<br/>• Production apps"]
    
    C4 --> CLIENT_USE
    P3 --> POOL_USE
    
    style C1 fill:#ff6b6b,stroke:#ffffff,color:#ffffff
    style P1 fill:#4ecdc4,stroke:#ffffff,color:#000000
```

### Connection Code Pattern

```typescript
import { Client } from "pg";

// Configuration object (Method 1)
const pgClient = new Client({
  host: "localhost",
  port: 5432,
  user: "aniketpandey",
  password: "mypassword",
  database: "myapp",
});

// Connection string (Method 2)
const pgClient = new Client({
  connectionString: "postgresql://user:pass@localhost:5432/myapp",
});

// Connect to database
await pgClient.connect();
console.log("✅ Connected to PostgreSQL");

// Run queries
const result = await pgClient.query("SELECT NOW()");
console.log(result.rows);

// Close connection when done
await pgClient.end();
```

**🔑 Key Insight:** Always call `connect()` before queries and `end()` when finished. For web servers, connect once at startup and keep the connection alive.

---

## 5. SQL Fundamentals

### Creating Tables

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,           -- Auto-incrementing ID
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),  -- Foreign key!
    title VARCHAR(200) NOT NULL,
    description TEXT,
    done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**🔑 Key Insight:** The `REFERENCES` keyword creates a **foreign key constraint** - PostgreSQL will reject any `user_id` that doesn't exist in the `users` table. This prevents orphaned data!

### CRUD Operations

#### **C**reate (INSERT)
```sql
INSERT INTO users (username, email, password)
VALUES ('john_doe', 'john@example.com', 'hashed_pw')
RETURNING id, username, email, created_at;
```

**💡 Trick:** `RETURNING *` gives you the inserted row back - no need for a separate SELECT!

#### **R**ead (SELECT)
```sql
-- Get all users
SELECT id, username, email FROM users ORDER BY id;

-- Get with condition
SELECT * FROM users WHERE id = 1;

-- JOIN tables (most powerful SQL feature!)
SELECT 
    todos.title,
    todos.done,
    users.username
FROM todos
INNER JOIN users ON todos.user_id = users.id;
```

#### **U**pdate
```sql
UPDATE todos 
SET title = 'New Title', description = 'Updated desc'
WHERE id = 5
RETURNING *;
```

#### **D**elete
```sql
DELETE FROM todos WHERE id = 5 RETURNING *;
```

### Understanding JOINs

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
graph LR
    subgraph "users table"
        U1["id: 1, name: Alice"]
        U2["id: 2, name: Bob"]
    end
    
    subgraph "todos table"
        T1["user_id: 1, title: Buy milk"]
        T2["user_id: 1, title: Read book"]
        T3["user_id: 2, title: Exercise"]
    end
    
    U1 --> T1
    U1 --> T2
    U2 --> T3
    
    style U1 fill:#bb86fc,stroke:#ffffff,color:#000000
    style U2 fill:#bb86fc,stroke:#ffffff,color:#000000
    style T1 fill:#03dac6,stroke:#ffffff,color:#000000
    style T2 fill:#03dac6,stroke:#ffffff,color:#000000
    style T3 fill:#03dac6,stroke:#ffffff,color:#000000
```

```sql
-- INNER JOIN: Only matching records from both tables
SELECT todos.title, users.username
FROM todos
INNER JOIN users ON todos.user_id = users.id;
-- Result: All todos WITH their owner's username

-- LEFT JOIN: All from left table + matching from right
SELECT users.username, todos.title
FROM users
LEFT JOIN todos ON users.id = todos.user_id;
-- Result: All users, even those with NO todos
```

---

## 6. SQL Injection - The Security Nightmare

### What is SQL Injection?

SQL Injection is a **code injection attack** where malicious SQL code is inserted through user input to manipulate your database.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
sequenceDiagram
    participant Attacker
    participant Server
    participant Database
    
    Note over Attacker,Database: ❌ VULNERABLE CODE PATH
    Attacker->>Server: username: ' OR '1'='1
    Server->>Database: SELECT * FROM users WHERE username = '' OR '1'='1'
    Database->>Server: Returns ALL users!
    Server->>Attacker: 🔓 Authentication bypassed!
    
    Note over Attacker,Database: ✅ SECURE CODE PATH
    Attacker->>Server: username: ' OR '1'='1
    Server->>Database: SELECT * FROM users WHERE username = $1<br/>values: ["' OR '1'='1"]
    Database->>Server: No user found
    Server->>Attacker: ❌ Login failed
```

### Attack Examples

#### Attack 1: Authentication Bypass
```javascript
// ❌ VULNERABLE CODE
const query = `SELECT * FROM users WHERE username = '${username}'`;

// Attacker input: ' OR '1'='1
// Resulting query:
SELECT * FROM users WHERE username = '' OR '1'='1'
// ↑ This returns ALL users because '1'='1' is always true!
```

#### Attack 2: Data Destruction
```javascript
// ❌ VULNERABLE CODE
const query = `SELECT * FROM users WHERE id = ${id}`;

// Attacker input: 1; DROP TABLE users; --
// Resulting query:
SELECT * FROM users WHERE id = 1; DROP TABLE users; --
// ↑ This DELETES your entire users table!
```

#### Attack 3: Data Theft
```javascript
// ❌ VULNERABLE CODE
const query = `SELECT * FROM products WHERE name = '${search}'`;

// Attacker input: ' UNION SELECT password FROM users --
// Resulting query:
SELECT * FROM products WHERE name = '' UNION SELECT password FROM users --
// ↑ This returns all user passwords!
```

### The Solution: Parameterized Queries

**The Golden Rule:** NEVER concatenate user input into SQL strings. ALWAYS use parameterized queries.

```typescript
// ❌ WRONG - Direct string concatenation (NEVER DO THIS!)
const query = `SELECT * FROM users WHERE id = ${id}`;
const query = `SELECT * FROM users WHERE username = '${username}'`;
const query = "SELECT * FROM users WHERE id = " + id;

// ✅ CORRECT - Parameterized query (ALWAYS DO THIS!)
const query = "SELECT * FROM users WHERE id = $1";
await pgClient.query(query, [id]);

const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
await pgClient.query(query, [username, password]);
```

### How Parameterized Queries Work

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
flowchart TB
    subgraph "Parameterized Query Process"
        A["Query Template<br/>SELECT * FROM users WHERE id = $1"]
        B["Values Array<br/>[userInput]"]
        C["PostgreSQL Engine"]
        D["1. Parse query template<br/>2. Compile execution plan<br/>3. Escape values automatically<br/>4. Execute safely"]
        E["Result: Safe query execution"]
    end
    
    A --> C
    B --> C
    C --> D --> E
    
    style A fill:#4ecdc4,stroke:#ffffff,color:#000000
    style B fill:#f7dc6f,stroke:#ffffff,color:#000000
    style C fill:#336791,stroke:#ffffff,color:#ffffff
    style D fill:#bb86fc,stroke:#ffffff,color:#000000
```

**🔑 Key Insight:** With parameterized queries:
1. `$1, $2, $3...` are placeholders
2. Values are passed as a separate array
3. The database **treats values as DATA only**, never as SQL code
4. Special characters are automatically escaped
5. `' OR '1'='1` becomes a literal string search, not SQL logic

---

## 7. Building a REST API with Express + PostgreSQL

### Complete API Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
graph TB
    CLIENT["🌐 HTTP Client<br/>(Browser/Postman)"]
    
    subgraph "Express Server"
        MW["Middleware<br/>express.json()"]
        
        subgraph "User Routes"
            POST_USER["POST /users"]
            GET_USERS["GET /users"]
            GET_USER["GET /users/:id"]
        end
        
        subgraph "Todo Routes"
            POST_TODO["POST /users/:userId/todos"]
            GET_USER_TODOS["GET /users/:userId/todos"]
            GET_TODOS["GET /todos"]
            PUT_TODO["PUT /todos/:id"]
            PATCH_TODO["PATCH /todos/:id/done"]
            DELETE_TODO["DELETE /todos/:id"]
        end
    end
    
    DB[("🐘 PostgreSQL<br/>Database")]
    
    CLIENT --> MW
    MW --> POST_USER & GET_USERS & GET_USER
    MW --> POST_TODO & GET_USER_TODOS & GET_TODOS & PUT_TODO & PATCH_TODO & DELETE_TODO
    POST_USER & GET_USERS & GET_USER --> DB
    POST_TODO & GET_USER_TODOS & GET_TODOS & PUT_TODO & PATCH_TODO & DELETE_TODO --> DB
    
    style CLIENT fill:#f7dc6f,stroke:#ffffff,color:#000000
    style DB fill:#336791,stroke:#ffffff,color:#ffffff
```

### API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users` | Create a new user |
| `GET` | `/users` | Get all users |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users/:userId/todos` | Create a todo for user |
| `GET` | `/users/:userId/todos` | Get all todos for user |
| `GET` | `/todos` | Get all todos with user info |
| `PUT` | `/todos/:id` | Update a todo |
| `PATCH` | `/todos/:id/done` | Toggle todo completion |
| `DELETE` | `/todos/:id` | Delete a todo |

### Code Patterns

#### Pattern 1: Creating Resources (POST)

```typescript
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate input
    if (!username || !email || !password) {
      res.status(400).json({ error: "All fields required" });
      return;
    }

    // 2. Parameterized INSERT with RETURNING
    const query = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, email, created_at
    `;
    const result = await pgClient.query(query, [username, email, password]);
    
    // 3. Return created resource
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    // 4. Handle unique constraint violations
    if (error.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
```

**🔑 Key Insights:**
- `RETURNING` clause eliminates need for separate SELECT
- Error code `23505` = unique constraint violation in PostgreSQL
- Always return the created resource with `201 Created`

#### Pattern 2: Reading Resources with JOINs (GET)

```typescript
app.get("/todos", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        todos.id,
        todos.title,
        todos.description,
        todos.done,
        todos.created_at,
        todos.user_id,
        users.username,
        users.email
      FROM todos
      INNER JOIN users ON todos.user_id = users.id
      ORDER BY todos.created_at DESC
    `;
    const result = await pgClient.query(query);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

**🔑 Key Insight:** Use `INNER JOIN` to combine related data from multiple tables in a single query - much more efficient than multiple queries!

#### Pattern 3: Updating Resources (PUT/PATCH)

```typescript
app.put("/todos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const query = `
      UPDATE todos 
      SET title = $1, description = $2 
      WHERE id = $3 
      RETURNING *
    `;
    const result = await pgClient.query(query, [title, description || null, id]);

    // Check if resource existed
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

**🔑 Key Insight:** 
- `PUT` = full replacement of resource
- `PATCH` = partial update (only specified fields)
- Check `result.rows.length` to detect "not found" cases

#### Pattern 4: Checking Related Resources Exist

```typescript
app.post("/users/:userId/todos", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, description } = req.body;

    // First, verify the user exists!
    const userCheck = await pgClient.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );
    if (userCheck.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Now safe to create the todo
    const query = `
      INSERT INTO todos (user_id, title, description) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await pgClient.query(query, [userId, title, description || null]);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

**🔑 Key Insight:** Always verify parent resources exist before creating child resources. This provides better error messages than letting the foreign key constraint fail.

#### Pattern 5: Server Startup with Database Connection

```typescript
async function startServer() {
  try {
    // 1. Connect to database FIRST
    await pgClient.connect();
    console.log("✅ Connected to PostgreSQL");

    // 2. THEN start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);  // Exit with error code
  }
}

startServer();
```

**🔑 Key Insight:** Always establish database connection before accepting HTTP requests. If DB connection fails, the server should not start.

---

## 8. Project Structure & Configuration

### Project Files

```
17.1-postgres/
├── src/
│   └── index.ts      # Main application code
├── dist/             # Compiled JavaScript
│   └── index.js
├── node_modules/
├── package.json      # Dependencies & scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file!
```

### package.json - Dependencies Explained

```json
{
  "type": "module",           // Use ES modules (import/export)
  "scripts": {
    "dev": "concurrently \"tsc -w\" \"nodemon --delay 1 --watch dist ./dist/index.js\""
  },
  "dependencies": {
    "express": "^5.2.1",      // Web framework
    "pg": "^8.17.1"           // PostgreSQL client
  },
  "devDependencies": {
    "@types/express": "^5.0.6",   // TypeScript types
    "@types/node": "^25.0.9",
    "@types/pg": "^8.16.0",
    "concurrently": "^9.2.1",     // Run multiple commands
    "nodemon": "^3.1.9",          // Auto-restart on changes
    "typescript": "^5.9.3"
  }
}
```

**🔑 Dev Script Explained:**
1. `tsc -w` - TypeScript compiler in watch mode (recompiles on file changes)
2. `nodemon` - Watches `dist/` folder and restarts server when JS files change
3. `concurrently` - Runs both processes simultaneously

### tsconfig.json - Key Settings

```json
{
  "compilerOptions": {
    "rootDir": "./src",           // Source files location
    "outDir": "./dist",           // Compiled output location
    "module": "nodenext",         // Use Node.js ES modules
    "target": "esnext",           // Latest JavaScript features
    "strict": true,               // Enable all strict checks
    "noUncheckedIndexedAccess": true,  // Array access can be undefined
    "exactOptionalPropertyTypes": true  // Strict optional properties
  }
}
```

---

## 9. Visual Architecture Diagrams

### Request-Response Flow

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
sequenceDiagram
    participant Client
    participant Express
    participant PostgreSQL
    
    Client->>Express: POST /users<br/>{"username": "alice", ...}
    Express->>Express: Validate input
    Express->>PostgreSQL: INSERT INTO users... VALUES ($1, $2, $3)<br/>params: ["alice", ...]
    PostgreSQL->>PostgreSQL: Execute query safely
    PostgreSQL->>Express: Result: {id: 1, username: "alice", ...}
    Express->>Client: 201 Created<br/>{id: 1, username: "alice", ...}
```

### Database Schema Relationships

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
erDiagram
    USERS {
        int id PK "SERIAL PRIMARY KEY"
        varchar username "UNIQUE NOT NULL"
        varchar email "UNIQUE NOT NULL"
        varchar password "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }
    
    TODOS {
        int id PK "SERIAL PRIMARY KEY"
        int user_id FK "REFERENCES users(id)"
        varchar title "NOT NULL"
        text description
        boolean done "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
    }
    
    USERS ||--o{ TODOS : "has many"
```

### Error Handling Flow

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#bb86fc', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#bb86fc', 'lineColor': '#03dac6', 'secondaryColor': '#1f1f1f', 'tertiaryColor': '#2d2d2d', 'background': '#121212', 'mainBkg': '#1f1f1f', 'secondBkg': '#2d2d2d', 'nodeBorder': '#bb86fc', 'clusterBkg': '#2d2d2d', 'clusterBorder': '#bb86fc', 'titleColor': '#ffffff', 'edgeLabelBackground': '#1f1f1f', 'nodeTextColor': '#ffffff'}}}%%
flowchart TD
    A["Incoming Request"] --> B{"Input Valid?"}
    B -->|No| C["400 Bad Request"]
    B -->|Yes| D["Execute Query"]
    D --> E{"Query Success?"}
    E -->|No| F{"Error Type?"}
    F -->|Duplicate| G["409 Conflict"]
    F -->|Other| H["500 Server Error"]
    E -->|Yes| I{"Result Found?"}
    I -->|No| J["404 Not Found"]
    I -->|Yes| K["200 OK / 201 Created"]
    
    style C fill:#ff6b6b,stroke:#ffffff,color:#ffffff
    style G fill:#f39c12,stroke:#ffffff,color:#ffffff
    style H fill:#ff6b6b,stroke:#ffffff,color:#ffffff
    style J fill:#f39c12,stroke:#ffffff,color:#ffffff
    style K fill:#4ecdc4,stroke:#ffffff,color:#000000
```

---

## 10. Summary & Key Takeaways

### 🎯 Quick Reference Card

| Concept | Remember This |
|---------|---------------|
| **PostgreSQL** | Schema-full, ACID compliant, use for data integrity |
| **pg Client** | `new Client({...})` → `connect()` → `query()` → `end()` |
| **SQL Injection** | NEVER concatenate user input into SQL strings |
| **Parameterized Query** | `query("...WHERE id = $1", [value])` |
| **RETURNING** | Get inserted/updated row without extra SELECT |
| **Error 23505** | Unique constraint violation (duplicate entry) |
| **INNER JOIN** | Combine related tables, only matching rows |
| **Foreign Key** | `REFERENCES table(column)` - enforces relationships |

### 🔐 Security Checklist

- [ ] **ALL** SQL queries use parameterized statements (`$1, $2, $3...`)
- [ ] Database credentials stored in `.env` file
- [ ] `.env` added to `.gitignore`
- [ ] Input validation before database operations
- [ ] Proper error handling (don't expose internal errors to clients)

### ⚡ Performance Tips

1. **Use Connection Pools** for production (not single Client)
2. **Add indexes** on frequently queried columns
3. **Use JOINs** instead of multiple queries
4. **Select only needed columns**, avoid `SELECT *` in production

### 📝 SQL Injection Prevention - One Rule to Rule Them All

```typescript
// ❌ NEVER DO THIS
`SELECT * FROM users WHERE id = ${userId}`

// ✅ ALWAYS DO THIS
pgClient.query("SELECT * FROM users WHERE id = $1", [userId])
```

### 🚀 Next Steps

1. Learn **Connection Pooling** with `pg.Pool`
2. Explore **ORMs** like Prisma or Drizzle for type-safe queries
3. Understand **Transactions** for atomic operations
4. Study **Indexes** for query optimization
5. Practice **Migrations** for schema versioning

---

## 📚 Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Drizzle ORM](https://orm.drizzle.team/)

---

*Last Updated: January 2026 | Week 17 - PostgreSQL Fundamentals*
