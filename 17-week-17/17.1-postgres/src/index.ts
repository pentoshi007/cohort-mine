import express from "express";
import type { Request, Response } from "express";
import { Client } from "pg";

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// PostgreSQL client
const pgClient = new Client({
  host: "localhost",
  port: 5432,
  user: "aniketpandey",
  password: "ak802135",
  database: "todo",
});

// =============================================================================
// SQL INJECTION - What it is and How to Prevent it
// =============================================================================
//
// SQL Injection is a code injection technique where an attacker can insert
// malicious SQL code through user input to manipulate or access the database.
//
// Example Attack Scenarios:
// - Input: ' OR '1'='1    → Returns all records (bypasses authentication)
// - Input: '; DROP TABLE users; --  → Deletes entire table!
// - Input: ' UNION SELECT password FROM users --  → Steals data
//
// =============================================================================

// =============================================================================
// ❌ INSECURE WAY - Vulnerable to SQL Injection (NEVER DO THIS!)
// =============================================================================
//
// async function INSECURE_getUserByUsername(username: string) {
//   // BAD: Directly concatenating user input into SQL query
//   const query = `SELECT * FROM users WHERE username = '${username}'`;
//   return await pgClient.query(query);
//
//   // If attacker sends: username = "' OR '1'='1"
//   // Query becomes: SELECT * FROM users WHERE username = '' OR '1'='1'
//   // This returns ALL users! Authentication bypassed!
//
//   // If attacker sends: username = "'; DROP TABLE users; --"
//   // Query becomes: SELECT * FROM users WHERE username = ''; DROP TABLE users; --'
//   // This DELETES the entire users table!
// }
//
// async function INSECURE_login(username: string, password: string) {
//   // BAD: String concatenation with user input
//   const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
//   return await pgClient.query(query);
//
//   // Attacker can login without knowing password!
//   // Input: username = "admin'--", password = "anything"
//   // Query becomes: SELECT * FROM users WHERE username = 'admin'--' AND password = 'anything'
//   // The -- comments out the password check!
// }
//
// =============================================================================

// =============================================================================
// ✅ SECURE WAY - Using Parameterized Queries (Always use this!)
// =============================================================================
//
// Parameterized queries (also called prepared statements) separate SQL code
// from data. The database treats parameters as DATA only, never as SQL code.
//
// How it works:
// 1. $1, $2, $3... are placeholders for values
// 2. Values are passed as a separate array
// 3. Database engine escapes special characters automatically
// 4. Malicious input is treated as a literal string, not SQL code
//
// Example:
// query: "SELECT * FROM users WHERE username = $1"
// values: ["' OR '1'='1"]
// Result: Searches for a user literally named "' OR '1'='1" (finds nothing)
//
// =============================================================================

// =============================================================================
// USER ROUTES (All using SECURE parameterized queries)
// =============================================================================

// Create a new user
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res
        .status(400)
        .json({ error: "username, email, and password are required" });
      return;
    }

    // ❌ INSECURE - SQL Injection vulnerable:
    // const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
    // Attacker could send: username = "hacker', 'hack@evil.com', 'pass'); DROP TABLE users; --"

    // ✅ SECURE - Parameterized query (values are escaped automatically):
    const query = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, email, created_at
    `;
    const result = await pgClient.query(query, [username, email, password]);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const query =
      "SELECT id, username, email, created_at FROM users ORDER BY id";
    const result = await pgClient.query(query);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ❌ INSECURE - SQL Injection vulnerable:
    // const query = `SELECT * FROM users WHERE id = ${id}`;
    // Attacker could send: id = "1 OR 1=1" → Returns all users!
    // Or worse: id = "1; DROP TABLE users; --" → Deletes table!

    // ✅ SECURE - Parameterized query:
    const query =
      "SELECT id, username, email, created_at FROM users WHERE id = $1";
    const result = await pgClient.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// TODO ROUTES
// =============================================================================

// Create a todo for a user
app.post("/users/:userId/todos", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    // Check if user exists
    const userCheck = await pgClient.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );
    if (userCheck.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const query = `
      INSERT INTO todos (user_id, title, description) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await pgClient.query(query, [
      userId,
      title,
      description || null,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all todos for a user
app.get("/users/:userId/todos", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userCheck = await pgClient.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );
    if (userCheck.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const query =
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await pgClient.query(query, [userId]);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all todos with user info
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

// Update a todo (title and description)
app.put("/todos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    // ❌ INSECURE - SQL Injection vulnerable:
    // const query = `UPDATE todos SET title = '${title}', description = '${description}' WHERE id = ${id}`;
    // Attacker could send: title = "hacked', done = true WHERE '1'='1' --"
    // This would mark ALL todos as done!

    // ✅ SECURE - Parameterized query:
    const query = `
      UPDATE todos 
      SET title = $1, description = $2 
      WHERE id = $3 
      RETURNING *
    `;
    const result = await pgClient.query(query, [
      title,
      description || null,
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark todo as done/undone
app.patch("/todos/:id/done", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    if (typeof done !== "boolean") {
      res.status(400).json({ error: "done must be a boolean" });
      return;
    }

    const query = "UPDATE todos SET done = $1 WHERE id = $2 RETURNING *";
    const result = await pgClient.query(query, [done, id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a todo
app.delete("/todos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ❌ INSECURE - SQL Injection vulnerable:
    // const query = `DELETE FROM todos WHERE id = ${id}`;
    // Attacker could send: id = "1 OR 1=1" → Deletes ALL todos!

    // ✅ SECURE - Parameterized query:
    const query = "DELETE FROM todos WHERE id = $1 RETURNING *";
    const result = await pgClient.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json({ message: "Todo deleted", todo: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// START SERVER
// =============================================================================

async function startServer() {
  try {
    await pgClient.connect();
    console.log("✅ Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log("\n📋 Available endpoints:");
      console.log("   POST   /users              - Create a user");
      console.log("   GET    /users              - Get all users");
      console.log("   GET    /users/:id          - Get user by ID");
      console.log("   POST   /users/:userId/todos - Create a todo");
      console.log("   GET    /users/:userId/todos - Get user's todos");
      console.log("   GET    /todos              - Get all todos");
      console.log("   PUT    /todos/:id          - Update a todo");
      console.log("   PATCH  /todos/:id/done     - Mark done/undone");
      console.log("   DELETE /todos/:id          - Delete a todo");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// =============================================================================
// SQL INJECTION PREVENTION - QUICK REFERENCE
// =============================================================================
//
// Rule: NEVER concatenate user input directly into SQL queries!
//
// ❌ WRONG (Vulnerable):
//    `SELECT * FROM users WHERE id = ${userId}`
//    `SELECT * FROM users WHERE username = '${username}'`
//    "SELECT * FROM users WHERE id = " + id
//
// ✅ CORRECT (Safe):
//    pgClient.query("SELECT * FROM users WHERE id = $1", [userId])
//    pgClient.query("SELECT * FROM users WHERE username = $1", [username])
//
// The $1, $2, $3... placeholders + values array = Parameterized Query
// Database treats values as DATA only, never as executable SQL code.
//
// =============================================================================

// Database Types and Characteristics:

// 1. MongoDB (NoSQL - Document Database)
//    - Schema-less: No predefined structure required, flexible document structure
//    - Documents can have different fields and structures within the same collection
//    - Mongoose: ODM (Object Data Modeling) library that helps enforce schema at the Node.js application level
//    - Use cases: Rapid development, flexible data models, hierarchical data storage

// 2. PostgreSQL (SQL - Relational Database)
//    - Schema-full: Requires predefined table structure with strict data types
//    - ACID compliant: Ensures data integrity through transactions
//    - Strong consistency and relational integrity with foreign keys
//    - Use cases: Complex queries, data integrity requirements, structured data

// 3. Graph Database (e.g., Neo4j, Amazon Neptune)
//    - Designed to store and query graph data structures
//    - Nodes represent entities, edges represent relationships between entities
//    - Optimized for traversing relationships and finding patterns in connected data
//    - Use cases: Social networks, recommendation engines, fraud detection, knowledge graphs

// 4. Vector Database (e.g., Pinecone, Weaviate, Milvus)
//    - Designed to store and query high-dimensional vector embeddings
//    - Enables similarity search and semantic search using vector representations
//    - Commonly used with machine learning models and AI applications
//    - Use cases: Semantic search, recommendation systems, image/audio similarity, RAG (Retrieval-Augmented Generation)

// =============================================================================
// Todo REST API with Express + PostgreSQL
// =============================================================================
// API Endpoints:
//   Users:
//     POST   /users          - Create a user
//     GET    /users          - Get all users
//     GET    /users/:id      - Get user by ID
//
//   Todos:
//     POST   /users/:userId/todos     - Create a todo for a user
//     GET    /users/:userId/todos     - Get all todos for a user
//     GET    /todos                   - Get all todos (with user info)
//     PUT    /todos/:id               - Update a todo
//     PATCH  /todos/:id/done          - Mark todo as done/undone
//     DELETE /todos/:id               - Delete a todo
// =============================================================================
