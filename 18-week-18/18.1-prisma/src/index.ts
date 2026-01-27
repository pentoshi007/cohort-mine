/**
 * =============================================================================
 * PRISMA 7 COMPLETE BACKEND APPLICATION
 * =============================================================================
 * 
 * This is a full CRUD backend demonstrating all major Prisma 7 operations:
 * 
 * PRISMA OPERATIONS COVERED:
 * 1. CREATE - create(), createMany()
 * 2. READ   - findUnique(), findFirst(), findMany()
 * 3. UPDATE - update(), updateMany(), upsert()
 * 4. DELETE - delete(), deleteMany()
 * 5. RELATIONS - include, select, nested writes
 * 6. FILTERING - where clauses, operators
 * 7. SORTING & PAGINATION - orderBy, skip, take
 * 8. AGGREGATIONS - count(), aggregate(), groupBy()
 * 9. TRANSACTIONS - $transaction()
 * 10. RAW QUERIES - $queryRaw(), $executeRaw()
 */

import express, { type Request, type Response } from "express";
import { prisma } from "./lib/prisma.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 3000;

// Helper to safely parse string from query/params
const parseString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
};

const parseIntSafe = (value: unknown, defaultVal: number = 0): number => {
  const str = parseString(value);
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultVal : num;
};

// =============================================================================
// SECTION 1: CREATE OPERATIONS
// =============================================================================

/**
 * CREATE A SINGLE USER
 * 
 * prisma.user.create() - Creates one record in the database
 * 
 * ANATOMY OF create():
 * - data: REQUIRED - The fields to insert
 * - include: OPTIONAL - Eager load relations in the response
 * - select: OPTIONAL - Pick specific fields to return
 * 
 * NOTE: You can use EITHER include OR select, not both!
 */
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Basic create - just the data
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
      },
      // include: Load related data in the response
      // Even though the user has no todos yet, this shows the pattern
      include: {
        todos: true, // Returns todos: [] for new user
      },
    });

    res.status(201).json(user);
  } catch (error) {
    // Prisma throws specific error codes for constraint violations
    // P2002 = Unique constraint violation
    res.status(400).json({ error: "User creation failed", details: error });
  }
});

/**
 * CREATE MULTIPLE USERS AT ONCE
 * 
 * prisma.user.createMany() - Bulk insert operation
 * 
 * IMPORTANT DIFFERENCES FROM create():
 * - More efficient for bulk inserts (single SQL statement)
 * - Does NOT return the created records (just a count)
 * - Cannot use include/select (no data returned)
 * - skipDuplicates: true - Silently skip records that violate unique constraints
 */
app.post("/users/bulk", async (req: Request, res: Response) => {
  try {
    const users = req.body.users; // Array of user objects

    const result = await prisma.user.createMany({
      data: users,
      skipDuplicates: true, // Don't fail if username/email already exists
    });

    // Returns: { count: number } - how many were actually inserted
    res.status(201).json({
      message: `Created ${result.count} users`,
      count: result.count,
    });
  } catch (error) {
    res.status(400).json({ error: "Bulk creation failed", details: error });
  }
});

/**
 * CREATE USER WITH NESTED TODO (Nested Write)
 * 
 * Prisma allows creating related records in a single operation!
 * This is called a "nested write" or "nested create"
 * 
 * NESTED WRITE OPERATIONS:
 * - create: Create a single related record
 * - createMany: Create multiple related records
 * - connect: Link to an existing record by ID
 * - connectOrCreate: Connect if exists, create if not
 */
app.post("/users/with-todos", async (req: Request, res: Response) => {
  try {
    const { username, email, password, todos } = req.body;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        // Nested create - creates todos AND links them to this user
        todos: {
          create: todos, // todos is an array like: [{ title: "Buy milk" }, { title: "Call mom" }]
          // OR use createMany for bulk:
          // createMany: { data: todos }
        },
      },
      // Include the created todos in the response
      include: {
        todos: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Creation failed", details: error });
  }
});

// =============================================================================
// SECTION 2: READ OPERATIONS
// =============================================================================

/**
 * GET ALL USERS
 * 
 * prisma.user.findMany() - Retrieve multiple records
 * 
 * COMMON OPTIONS:
 * - where: Filter conditions
 * - include: Eager load relations
 * - select: Pick specific fields
 * - orderBy: Sort results
 * - skip: Offset for pagination
 * - take: Limit number of results
 * - distinct: Return unique values for specified fields
 */
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      // Include related todos for each user
      include: {
        todos: true,
        // You can also configure what to include from todos:
        // todos: {
        //   where: { done: false },      // Only incomplete todos
        //   orderBy: { createdAt: 'desc' }, // Newest first
        //   take: 5,                      // Only first 5
        // }
      },
      // Order users by creation date, newest first
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error });
  }
});

/**
 * GET USERS WITH SELECT (Pick specific fields)
 * 
 * select vs include:
 * - include: Returns ALL fields + specified relations
 * - select: Returns ONLY the fields you specify (more efficient)
 * 
 * Use select when you don't need all columns - reduces data transfer!
 */
app.get("/users/minimal", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        // Exclude password, email, createdAt
        // For relations with select, you nest another select:
        todos: {
          select: {
            id: true,
            title: true,
            done: true,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error });
  }
});

/**
 * GET A SINGLE USER BY ID
 * 
 * prisma.user.findUnique() - Find exactly ONE record by unique field
 * 
 * REQUIRES: A unique field in the where clause (@id or @unique in schema)
 * RETURNS: The record OR null if not found
 * 
 * vs findFirst():
 * - findUnique: MUST use a unique field, more optimized
 * - findFirst: Can use any field, returns first match
 */
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntSafe(req.params.id);

    const user = await prisma.user.findUnique({
      where: {
        id: id, // where clause for unique field
      },
      include: {
        todos: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user", details: error });
  }
});

/**
 * FIND USER BY USERNAME (using findFirst)
 * 
 * prisma.user.findFirst() - Find the first record matching conditions
 * 
 * Use findFirst when:
 * - Searching by non-unique fields
 * - You want the first match from multiple possible results
 * - Combined with orderBy to get "latest" or "oldest" record
 */
app.get("/users/username/:username", async (req: Request, res: Response) => {
  try {
    const username = parseString(req.params.username);

    const user = await prisma.user.findFirst({
      where: {
        username: username,
        // You can also use operators here:
        // username: { contains: "john" }      // SQL LIKE '%john%'
        // username: { startsWith: "john" }    // SQL LIKE 'john%'
        // username: { endsWith: "doe" }       // SQL LIKE '%doe'
        // username: { equals: "john", mode: 'insensitive' } // Case insensitive
      },
      include: {
        todos: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user", details: error });
  }
});

/**
 * PAGINATION EXAMPLE
 * 
 * Prisma pagination uses skip and take:
 * - skip: Number of records to skip (offset)
 * - take: Number of records to return (limit)
 * 
 * Formula: skip = (page - 1) * pageSize
 */
app.get("/users/page/:page", async (req: Request, res: Response) => {
  try {
    const page = parseIntSafe(req.params.page, 1);
    const pageSize = 10;

    // Get total count for pagination info
    const totalCount = await prisma.user.count();

    const users = await prisma.user.findMany({
      skip: (page - 1) * pageSize, // Skip previous pages
      take: pageSize, // Take only pageSize records
      orderBy: { createdAt: "desc" },
      include: { todos: true },
    });

    res.json({
      data: users,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error });
  }
});

// =============================================================================
// SECTION 3: UPDATE OPERATIONS
// =============================================================================

/**
 * UPDATE A SINGLE USER
 * 
 * prisma.user.update() - Update exactly ONE record
 * 
 * REQUIRES: A unique field in where clause
 * THROWS: Error if record not found (use upsert to avoid this)
 * 
 * DATA OPTIONS:
 * - Set new values directly: { username: "new_name" }
 * - Increment numbers: { age: { increment: 1 } }
 * - Multiply numbers: { price: { multiply: 1.1 } }
 * - For strings: No special operators, just set the value
 */
app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntSafe(req.params.id);
    const { username, email, password } = req.body;

    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        // Only update fields that were provided
        ...(username && { username }),
        ...(email && { email }),
        ...(password && { password }),
      },
      include: {
        todos: true,
      },
    });

    res.json(user);
  } catch (error) {
    // P2025 = Record not found
    res.status(404).json({ error: "User not found or update failed", details: error });
  }
});

/**
 * UPDATE MULTIPLE USERS
 * 
 * prisma.user.updateMany() - Bulk update operation
 * 
 * DIFFERENCES FROM update():
 * - Can update multiple records at once
 * - Returns { count: number } not the updated records
 * - Does NOT throw if no records match (just returns count: 0)
 */
app.put("/users/bulk/update", async (req: Request, res: Response) => {
  try {
    const { where, data } = req.body;
    // Example: Update all users with null email
    // where: { email: null }
    // data: { email: "default@example.com" }

    const result = await prisma.user.updateMany({
      where: where,
      data: data,
    });

    res.json({
      message: `Updated ${result.count} users`,
      count: result.count,
    });
  } catch (error) {
    res.status(400).json({ error: "Bulk update failed", details: error });
  }
});

/**
 * UPSERT - Update OR Insert
 * 
 * prisma.user.upsert() - Update if exists, create if not
 * 
 * PERFECT FOR:
 * - "Save" operations where you don't know if record exists
 * - Avoiding "record not found" errors
 * - Idempotent operations (same result if run multiple times)
 * 
 * REQUIRES: where, create, AND update blocks
 */
app.put("/users/upsert/:username", async (req: Request, res: Response) => {
  try {
    const username = parseString(req.params.username);
    const { email, password } = req.body as { email?: string; password: string };

    const user = await prisma.user.upsert({
      where: {
        username: username, // Look for this user
      },
      update: {
        // If found, update these fields
        email: email ?? null,
        password: password,
      },
      create: {
        // If not found, create with these fields
        username: username,
        email: email ?? null,
        password: password,
      },
      include: {
        todos: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Upsert failed", details: error });
  }
});

// =============================================================================
// SECTION 4: DELETE OPERATIONS
// =============================================================================

/**
 * DELETE A SINGLE USER
 * 
 * prisma.user.delete() - Delete exactly ONE record
 * 
 * REQUIRES: Unique field in where clause
 * RETURNS: The deleted record (useful for confirmation)
 * THROWS: Error if record not found
 * 
 * CASCADING: If you have ON DELETE CASCADE in your schema,
 * related records (todos) will also be deleted automatically
 */
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntSafe(req.params.id);

    // First, delete related todos (if no cascade is set up)
    await prisma.todo.deleteMany({
      where: { userId: id },
    });

    // Then delete the user
    const deletedUser = await prisma.user.delete({
      where: {
        id: id,
      },
    });

    res.json({
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    res.status(404).json({ error: "User not found or delete failed", details: error });
  }
});

/**
 * DELETE MULTIPLE USERS
 * 
 * prisma.user.deleteMany() - Bulk delete operation
 * 
 * WARNING: This can delete A LOT of data! Be careful with where clause.
 * If where is empty {}, it deletes ALL records!
 * 
 * RETURNS: { count: number } - how many were deleted
 */
app.delete("/users/bulk/delete", async (req: Request, res: Response) => {
  try {
    const { where } = req.body;
    // Example: Delete all users with null email
    // where: { email: null }

    if (!where || Object.keys(where).length === 0) {
      res.status(400).json({ error: "Where clause required for bulk delete" });
      return;
    }

    const result = await prisma.user.deleteMany({
      where: where,
    });

    res.json({
      message: `Deleted ${result.count} users`,
      count: result.count,
    });
  } catch (error) {
    res.status(400).json({ error: "Bulk delete failed", details: error });
  }
});

// =============================================================================
// SECTION 5: TODO CRUD (Demonstrating Relations)
// =============================================================================

/**
 * CREATE A TODO FOR A USER
 * 
 * Two ways to set the foreign key:
 * 1. Direct assignment: userId: 1
 * 2. Connect to existing: user: { connect: { id: 1 } }
 * 
 * "connect" is useful when you want to link to an existing record
 * by any unique field (id, username, email, etc.)
 */
app.post("/todos", async (req: Request, res: Response) => {
  try {
    const { title, description, userId } = req.body;

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        // Method 1: Direct foreign key assignment
        userId: userId,
        // Method 2: Using connect (more explicit, works with any unique field)
        // user: {
        //   connect: { id: userId }
        //   // OR: connect: { username: "aniket" }
        // }
      },
      // Include the user info in response
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: "Todo creation failed", details: error });
  }
});

/**
 * GET ALL TODOS WITH FILTERING
 * 
 * Demonstrating Prisma's WHERE operators:
 * 
 * COMPARISON:
 * - equals: Exact match (default if you just pass a value)
 * - not: Not equal
 * - gt, gte: Greater than, greater than or equal
 * - lt, lte: Less than, less than or equal
 * 
 * STRING:
 * - contains: LIKE '%value%'
 * - startsWith: LIKE 'value%'
 * - endsWith: LIKE '%value'
 * - mode: 'insensitive' for case-insensitive search
 * 
 * LOGICAL:
 * - AND: All conditions must match (default behavior)
 * - OR: Any condition can match
 * - NOT: Negate conditions
 */
app.get("/todos", async (req: Request, res: Response) => {
  try {
    const done = req.query.done;
    const search = parseString(req.query.search);
    const userIdParam = req.query.userId;

    const todos = await prisma.todo.findMany({
      where: {
        // Filter by completion status if provided
        ...(done !== undefined && { done: done === "true" }),

        // Filter by user if provided
        ...(userIdParam && { userId: parseIntSafe(userIdParam) }),

        // Search in title or description
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos", details: error });
  }
});

/**
 * TOGGLE TODO COMPLETION
 * 
 * Demonstrates reading current value and updating based on it.
 * In a real app, you might want to use a transaction for this.
 */
app.patch("/todos/:id/toggle", async (req: Request, res: Response) => {
  try {
    const id = parseIntSafe(req.params.id);

    // First, get current state
    const currentTodo = await prisma.todo.findUnique({
      where: { id: id },
    });

    if (!currentTodo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    // Then toggle it
    const todo = await prisma.todo.update({
      where: { id: id },
      data: {
        done: !currentTodo.done, // Toggle the boolean
      },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: "Toggle failed", details: error });
  }
});

/**
 * DELETE A TODO
 */
app.delete("/todos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseIntSafe(req.params.id);

    const deletedTodo = await prisma.todo.delete({
      where: { id: id },
    });

    res.json({ message: "Todo deleted", deletedTodo });
  } catch (error) {
    res.status(404).json({ error: "Todo not found", details: error });
  }
});

// =============================================================================
// SECTION 6: AGGREGATIONS & GROUPING
// =============================================================================

/**
 * COUNT RECORDS
 * 
 * prisma.user.count() - Count records matching conditions
 * 
 * More efficient than findMany().length because:
 * - Only returns a number, not all the data
 * - Database does the counting (SQL COUNT)
 */
app.get("/stats/counts", async (req: Request, res: Response) => {
  try {
    // Count all users
    const totalUsers = await prisma.user.count();

    // Count users with todos
    const usersWithTodos = await prisma.user.count({
      where: {
        todos: {
          some: {}, // "some" = at least one todo exists
        },
      },
    });

    // Count all todos
    const totalTodos = await prisma.todo.count();

    // Count completed todos
    const completedTodos = await prisma.todo.count({
      where: { done: true },
    });

    // Count pending todos
    const pendingTodos = await prisma.todo.count({
      where: { done: false },
    });

    res.json({
      totalUsers,
      usersWithTodos,
      totalTodos,
      completedTodos,
      pendingTodos,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get counts", details: error });
  }
});

/**
 * AGGREGATE FUNCTIONS
 * 
 * prisma.model.aggregate() - Run aggregate functions
 * 
 * AVAILABLE FUNCTIONS:
 * - _count: Count of records
 * - _sum: Sum of numeric fields
 * - _avg: Average of numeric fields
 * - _min: Minimum value
 * - _max: Maximum value
 */
app.get("/stats/aggregate", async (req: Request, res: Response) => {
  try {
    // Example: Get aggregate stats on todos per user
    // Since we don't have numeric fields, let's count by user
    const todoStats = await prisma.todo.aggregate({
      _count: {
        id: true, // Count of todos
      },
      _min: {
        createdAt: true, // Oldest todo date
      },
      _max: {
        createdAt: true, // Newest todo date
      },
    });

    res.json({
      totalTodos: todoStats._count.id,
      oldestTodo: todoStats._min.createdAt,
      newestTodo: todoStats._max.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Aggregation failed", details: error });
  }
});

/**
 * GROUP BY
 * 
 * prisma.model.groupBy() - Group records and aggregate
 * 
 * Like SQL GROUP BY - groups records by field values
 * and lets you run aggregate functions on each group.
 */
app.get("/stats/todos-by-user", async (req: Request, res: Response) => {
  try {
    const todosByUser = await prisma.todo.groupBy({
      by: ["userId"], // Group by user ID
      _count: {
        id: true, // Count todos in each group
      },
      _sum: {
        // If we had numeric fields, we could sum them
      },
      orderBy: {
        _count: {
          id: "desc", // Users with most todos first
        },
      },
    });

    // Enrich with user details
    const enrichedStats = await Promise.all(
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

    res.json(enrichedStats);
  } catch (error) {
    res.status(500).json({ error: "GroupBy failed", details: error });
  }
});

// =============================================================================
// SECTION 7: TRANSACTIONS
// =============================================================================

/**
 * INTERACTIVE TRANSACTION
 * 
 * prisma.$transaction() - Run multiple operations atomically
 * 
 * Two types:
 * 1. Sequential: Pass an array of operations
 * 2. Interactive: Pass a callback function (more flexible)
 * 
 * WHY TRANSACTIONS?
 * - All operations succeed together, or all fail together
 * - Prevents partial updates that leave data in bad state
 * - Essential for operations that depend on each other
 */
app.post("/transfer-todos", async (req: Request, res: Response) => {
  try {
    const { fromUserId, toUserId, todoIds } = req.body;

    // Interactive transaction - more control
    const result = await prisma.$transaction(async (tx) => {
      // tx is a "transactional Prisma Client" - use it instead of prisma

      // Step 1: Verify both users exist
      const fromUser = await tx.user.findUnique({ where: { id: fromUserId } });
      const toUser = await tx.user.findUnique({ where: { id: toUserId } });

      if (!fromUser || !toUser) {
        throw new Error("One or both users not found");
      }

      // Step 2: Verify todos belong to fromUser
      const todos = await tx.todo.findMany({
        where: {
          id: { in: todoIds },
          userId: fromUserId,
        },
      });

      if (todos.length !== todoIds.length) {
        throw new Error("Some todos not found or don't belong to source user");
      }

      // Step 3: Transfer todos to new user
      const updated = await tx.todo.updateMany({
        where: {
          id: { in: todoIds },
        },
        data: {
          userId: toUserId,
        },
      });

      return {
        transferred: updated.count,
        fromUser: fromUser.username,
        toUser: toUser.username,
      };
    });

    res.json({
      message: "Todos transferred successfully",
      ...result,
    });
  } catch (error) {
    // If ANY operation in the transaction fails, ALL are rolled back
    res.status(400).json({ error: "Transfer failed", details: String(error) });
  }
});

/**
 * SEQUENTIAL TRANSACTION
 * 
 * Simpler syntax - just pass an array of Prisma operations
 * Good for independent operations that should be atomic
 * 
 * NOTE: Sequential transactions return results in order, but you can't
 * reference results of previous operations. For that, use interactive transactions.
 * 
 * For creating user with todos, nested writes are better (see /users/with-todos)
 */
app.post("/create-user-with-todos-tx", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as { username: string; email?: string; password: string };

    // This demonstrates sequential transaction syntax
    // For user+todos, use interactive transaction or nested writes instead
    const [user] = await prisma.$transaction([
      // Operation 1: Create user
      prisma.user.create({
        data: { username, email: email ?? null, password },
        include: { todos: true },
      }),
    ]);

    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: "Transaction failed", details: error });
  }
});

// =============================================================================
// SECTION 8: RAW SQL QUERIES
// =============================================================================

/**
 * RAW QUERY - SELECT
 * 
 * prisma.$queryRaw - Execute raw SQL and return results
 * 
 * WHEN TO USE:
 * - Complex queries Prisma can't express
 * - Performance-critical queries needing optimization
 * - Database-specific features (PostgreSQL JSONB, etc.)
 * 
 * SAFETY: Use Prisma.sql template tag to prevent SQL injection!
 */
app.get("/raw/users-with-todo-count", async (req: Request, res: Response) => {
  try {
    // Using Prisma.sql for safe parameterized queries
    const { Prisma } = await import("./generated/prisma/client.js");

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
  } catch (error) {
    res.status(500).json({ error: "Raw query failed", details: error });
  }
});

/**
 * RAW QUERY - INSERT/UPDATE/DELETE
 * 
 * prisma.$executeRaw - Execute raw SQL, returns affected row count
 * 
 * Use this for INSERT, UPDATE, DELETE when you need raw SQL
 */
app.post("/raw/mark-all-done/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseIntSafe(req.params.userId);

    // Safe parameterized query
    const affectedRows = await prisma.$executeRaw`
      UPDATE todos 
      SET done = true 
      WHERE user_id = ${userId}
    `;

    res.json({
      message: `Marked ${affectedRows} todos as done`,
      affectedRows,
    });
  } catch (error) {
    res.status(500).json({ error: "Raw execute failed", details: error });
  }
});

// =============================================================================
// SECTION 9: ADVANCED FILTERING
// =============================================================================

/**
 * RELATION FILTERS
 * 
 * Filter parent records based on their related records:
 * - some: At least one related record matches
 * - every: All related records match
 * - none: No related records match
 * - is: The related record matches (for one-to-one)
 * - isNot: The related record doesn't match
 */
app.get("/users/filter/relations", async (req: Request, res: Response) => {
  try {
    // Users who have at least one incomplete todo
    const usersWithIncompleteTodos = await prisma.user.findMany({
      where: {
        todos: {
          some: { done: false }, // At least one todo is not done
        },
      },
      include: {
        todos: { where: { done: false } }, // Only include incomplete todos
      },
    });

    // Users where ALL todos are complete
    const usersAllComplete = await prisma.user.findMany({
      where: {
        todos: {
          every: { done: true }, // All todos must be done
        },
      },
    });

    // Users with no todos at all
    const usersNoTodos = await prisma.user.findMany({
      where: {
        todos: {
          none: {}, // No related todos exist
        },
      },
    });

    res.json({
      usersWithIncompleteTodos,
      usersAllComplete,
      usersNoTodos,
    });
  } catch (error) {
    res.status(500).json({ error: "Filtering failed", details: error });
  }
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Graceful shutdown - Important for production!
 * 
 * prisma.$disconnect() - Close database connection
 * 
 * Should be called when:
 * - Server is shutting down
 * - After one-off scripts complete
 * - To release database connections back to pool
 */
app.listen(PORT, () => {
  console.log(`
  ====================================
  🚀 Prisma 7 Learning Server Started
  ====================================
  
  Server running at: http://localhost:${PORT}
  
  ENDPOINTS:
  
  Users:
    POST   /users              - Create user
    POST   /users/bulk         - Create multiple users
    POST   /users/with-todos   - Create user with todos
    GET    /users              - Get all users
    GET    /users/minimal      - Get users (selected fields)
    GET    /users/:id          - Get user by ID
    GET    /users/username/:u  - Get user by username
    GET    /users/page/:page   - Paginated users
    PUT    /users/:id          - Update user
    PUT    /users/upsert/:u    - Upsert user by username
    DELETE /users/:id          - Delete user
  
  Todos:
    POST   /todos              - Create todo
    GET    /todos              - Get all todos (with filters)
    PATCH  /todos/:id/toggle   - Toggle todo completion
    DELETE /todos/:id          - Delete todo
  
  Stats:
    GET    /stats/counts       - Get various counts
    GET    /stats/aggregate    - Aggregate stats
    GET    /stats/todos-by-user - Todos grouped by user
  
  Advanced:
    POST   /transfer-todos     - Transaction example
    GET    /raw/users-with-todo-count - Raw SQL query
    POST   /raw/mark-all-done/:userId - Raw SQL execute
    GET    /users/filter/relations - Relation filters demo
  `);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
