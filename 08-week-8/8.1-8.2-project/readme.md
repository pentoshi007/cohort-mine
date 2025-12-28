# Week 8: Course Selling App - Complete Backend Guide

A comprehensive backend application for a course marketplace where **Admins** create courses and **Users** purchase them. This project demonstrates real-world patterns in authentication, database design, and API architecture.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [System Architecture](#system-architecture)
4. [Database Design](#database-design)
5. [Authentication System](#authentication-system)
6. [Middleware Deep Dive](#middleware-deep-dive)
7. [Express Router Pattern](#express-router-pattern)
8. [Input Validation with Zod](#input-validation-with-zod)
9. [MongoDB Operations](#mongodb-operations)
10. [Coding Patterns & Practices](#coding-patterns--practices)
11. [API Endpoints Reference](#api-endpoints-reference)
12. [Key Takeaways](#key-takeaways)

---

## Tech Stack

| Technology     | Purpose                                      |
| -------------- | -------------------------------------------- |
| **Express.js** | Web framework for handling HTTP requests     |
| **MongoDB**    | NoSQL database for storing data              |
| **Mongoose**   | ODM (Object Document Mapper) for MongoDB     |
| **JWT**        | JSON Web Tokens for stateless authentication |
| **bcrypt**     | Password hashing library                     |
| **Zod**        | Schema validation for request data           |
| **dotenv**     | Environment variable management              |

---

## Project Structure

```
8.1-8.2-project/
├── index.js              # Entry point - server setup & route mounting
├── db.js                 # Database connection logic
├── package.json          # Dependencies & scripts
├── .env                  # Environment variables (not committed)
│
├── models/               # Mongoose schemas (Data layer)
│   ├── User.js           # User schema
│   ├── Admin.js          # Admin schema
│   ├── Course.js         # Course schema
│   └── Purchase.js       # Purchase schema (junction table)
│
├── middleware/           # Request interceptors
│   ├── userAuth.js       # JWT verification for users
│   └── adminAuth.js      # JWT verification for admins
│
└── routes/               # API endpoints (Controller layer)
    ├── user.js           # User signup, signin, purchases
    ├── admin.js          # Admin signup, signin, course CRUD
    └── course.js         # Course preview, purchase, overview
```

---

## System Architecture

### Request Flow Diagram

```mermaid
flowchart LR
    Client([Client]) --> Express[Express Server]
    Express --> JSON[JSON Parser Middleware]
    JSON --> Router{Route Matcher}

    Router -->|/admin/*| AdminRoutes[Admin Routes]
    Router -->|/user/*| UserRoutes[User Routes]
    Router -->|/course/*| CourseRoutes[Course Routes]

    AdminRoutes --> AdminAuth{Admin Auth?}
    UserRoutes --> UserAuth{User Auth?}
    CourseRoutes --> MixedAuth{Auth Required?}

    AdminAuth -->|Protected| AdminMiddleware[adminAuth.js]
    UserAuth -->|Protected| UserMiddleware[userAuth.js]
    MixedAuth -->|/preview| NoAuth[No Auth Needed]
    MixedAuth -->|/purchase, /overview| UserMiddleware

    AdminMiddleware --> Handler[Route Handler]
    UserMiddleware --> Handler
    NoAuth --> Handler

    Handler --> Mongoose[(Mongoose)]
    Mongoose --> MongoDB[(MongoDB)]

    MongoDB --> Response([JSON Response])
```

### How It Works

1. **Client** sends HTTP request to Express server
2. **JSON Parser** (`express.json()`) parses request body
3. **Router** matches URL path to appropriate route file
4. **Auth Middleware** (if required) verifies JWT token
5. **Route Handler** processes business logic
6. **Mongoose** interacts with MongoDB
7. **Response** sent back to client

---

## Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String email UK
        String password
        String firstName
        String lastName
        Date createdAt
        Date updatedAt
    }

    ADMIN {
        ObjectId _id PK
        String email UK
        String password
        String firstName
        String lastName
        Date createdAt
        Date updatedAt
    }

    COURSE {
        ObjectId _id PK
        String title
        String description
        Number price
        String imageUrl
        ObjectId creatorId FK
        Date createdAt
        Date updatedAt
    }

    PURCHASE {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId courseId FK
        Date createdAt
        Date updatedAt
    }

    ADMIN ||--o{ COURSE : creates
    USER ||--o{ PURCHASE : makes
    COURSE ||--o{ PURCHASE : "is purchased in"
```

### Schema Breakdown

#### User Schema

```javascript
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Creates unique index - no duplicate emails
      trim: true, // Removes whitespace from both ends
      lowercase: true, // Converts to lowercase before saving
    },
    password: {
      type: String,
      required: true, // Stored as bcrypt hash, NOT plain text!
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
  },
  {
    timestamps: true, // Auto-adds createdAt & updatedAt
  }
);
```

#### Course Schema with Foreign Key Reference

```javascript
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // References Admin collection - enables .populate()
      required: true,
    },
  },
  { timestamps: true }
);
```

**Key Concept - `ref: 'Admin'`:**

- This creates a relationship between Course and Admin
- The `ref` tells Mongoose which model to use when calling `.populate()`
- It's like a foreign key in SQL databases

---

### Purchase Schema - Junction/Join Table

The Purchase collection acts as a **many-to-many relationship** between Users and Courses. In relational database terms, this is called a **junction table** or **join table**.

```javascript
/**
 * Purchase Schema
 * Represents the relationship between users and courses they've purchased
 * This is a join/junction table between User and Course
 */
const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference to Course model
      required: true,
    },
  },
  { timestamps: true }
);
```

### Compound Unique Index - Preventing Duplicate Purchases

This is one of the most important concepts in this project:

```javascript
/**
 * COMPOUND UNIQUE INDEX
 * ---------------------
 * This creates a database index on the combination of userId + courseId
 *
 * What does { userId: 1, courseId: 1 } mean?
 * - Creates an index on BOTH fields together
 * - The "1" means ascending order (doesn't matter much here)
 *
 * What does { unique: true } do?
 * - Ensures the COMBINATION of userId + courseId is unique in the database
 * - Prevents a user from purchasing the same course multiple times
 */
purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });
```

### Visual Explanation of Compound Index

```mermaid
flowchart TD
    subgraph "How Compound Unique Index Works"
        subgraph "Allowed Operations ✅"
            A["User A + Course 1<br/>(First purchase)"] --> DB1[(Database)]
            B["User A + Course 2<br/>(Different course)"] --> DB1
            C["User B + Course 1<br/>(Different user)"] --> DB1
        end

        subgraph "Blocked Operation ❌"
            D["User A + Course 1<br/>(Duplicate!)"] -->|Error 11000| X[Rejected]
        end
    end
```

**Real-world scenario:**

```
Purchase Table:
┌──────────┬───────────┐
│ userId   │ courseId  │
├──────────┼───────────┤
│ UserA    │ Course1   │  ← First purchase (OK)
│ UserA    │ Course2   │  ← Different course (OK)
│ UserB    │ Course1   │  ← Different user (OK)
│ UserA    │ Course1   │  ← DUPLICATE! MongoDB throws Error 11000
└──────────┴───────────┘
```

**Why is this important?**
Without this index, a user could accidentally purchase the same course multiple times, leading to:

- Duplicate charges
- Corrupted data
- Business logic errors

---

## Authentication System

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as MongoDB

    Note over C,DB: SIGNUP FLOW
    C->>S: POST /user/signup {email, password, ...}
    S->>S: Validate with Zod
    S->>S: Hash password with bcrypt
    S->>DB: Save new user
    DB-->>S: User created
    S-->>C: 201 Created

    Note over C,DB: SIGNIN FLOW
    C->>S: POST /user/signin {email, password}
    S->>DB: Find user by email
    DB-->>S: User document
    S->>S: bcrypt.compare(password, hash)
    S->>S: jwt.sign({id: user._id}, SECRET)
    S-->>C: 200 OK {token: "eyJhbG..."}

    Note over C,DB: PROTECTED ROUTE ACCESS
    C->>S: GET /user/purchases<br/>Header: Authorization: Bearer eyJhbG...
    S->>S: Extract token from header
    S->>S: jwt.verify(token, SECRET)
    S->>DB: Query with decoded user ID
    DB-->>S: User's purchases
    S-->>C: 200 OK {courses: [...]}
```

### Password Hashing with bcrypt

**Never store plain text passwords!** bcrypt handles this securely:

```javascript
// SIGNUP: Hash before storing
const hashedPassword = await bcrypt.hash(password, 10);
//                                              ↑
//                                    Salt rounds (higher = slower but more secure)
//                                    10 is a good balance of security/performance

await User.create({ email, password: hashedPassword, ... });

// SIGNIN: Compare password with stored hash
const isPasswordValid = await bcrypt.compare(password, user.password);
//                              ↑ plain text    ↑ hashed from DB
if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid password" });
}
```

**How bcrypt works:**

```
Plain Password: "mypassword123"
                    ↓ bcrypt.hash()
Stored Hash: "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
                │  │  └── The actual hash (60 chars total)
                │  └── Salt rounds (10)
                └── Algorithm version (2b)
```

### JWT Token Creation and ObjectId Conversion

```javascript
// Sign JWT with admin's id (MongoDB _id is auto-converted to string in JWT)
// Payload: { id: "string representation of ObjectId" }
const token = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET);
```

**Important Concept:** MongoDB's `_id` is an `ObjectId` type, but when you put it in a JWT payload, it gets automatically converted to a string. This is handled seamlessly by JavaScript.

**JWT Token Expiration (Optional):**

```javascript
// You can add expiration to tokens (commented out in code)
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: "1h",
});
//                                                                ↑ Token expires in 1 hour
```

### Why Separate JWT Secrets for Users and Admins?

```javascript
// For Users
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

// For Admins
const token = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET);
```

**Security Benefit Explained:**

```mermaid
flowchart TD
    subgraph "With Separate Secrets"
        UT[User Token] -->|Signed with JWT_SECRET| UV{Verify with JWT_SECRET}
        AT[Admin Token] -->|Signed with JWT_ADMIN_SECRET| AV{Verify with JWT_ADMIN_SECRET}

        UV -->|Valid| UserRoutes[User Routes ✅]
        AV -->|Valid| AdminRoutes[Admin Routes ✅]

        UT -->|Try Admin Routes| AV2{Verify with JWT_ADMIN_SECRET}
        AV2 -->|INVALID| Rejected[❌ Rejected]
    end
```

**Why this matters:**

- If a user's token is compromised, attackers **cannot** access admin routes
- The signature won't match because `JWT_ADMIN_SECRET` is different
- Even if the payload looks correct, verification will fail
- This is called **security isolation** or **principle of least privilege**

---

## Middleware Deep Dive

### Middleware Pipeline Visualization

```mermaid
flowchart TD
    Request([Incoming Request]) --> A[express.json]
    A --> B{Route Match}
    B -->|Protected Route| C[Auth Middleware]
    B -->|Public Route| D[Route Handler]

    C --> E{Token Present?}
    E -->|No| F[401 Unauthorized]
    E -->|Yes| G{Token Valid?}
    G -->|No| H[401 Invalid Token]
    G -->|Yes| I[Attach user/admin to req]
    I --> D

    D --> J[Business Logic]
    J --> K[Database Operations]
    K --> L([Response])
```

### Auth Middleware Code Explained Line by Line

```javascript
const userAuth = (req, res, next) => {
  // STEP 1: Check if Authorization header exists
  // Without this header, we have no token to verify
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: "Unauthorized - No token provided",
    });
  }

  // STEP 2: Extract token from "Bearer <token>" format
  // Authorization header format: "Bearer eyJhbGciOiJIUzI1..."
  let token;
  try {
    token = req.headers.authorization.split(" ")[1];
    //      "Bearer eyJhbGciOi..."
    //              ↑ split(' ') gives ["Bearer", "eyJhbGciOi..."]
    //                           [1] gets the token part (index 1)

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token format",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized - Error parsing token",
    });
  }

  // STEP 3: Verify token signature and check if expired
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token is invalid or expired
      return res.status(401).json({
        message: "Unauthorized - Invalid or expired token",
      });
    }

    // STEP 4: Attach decoded payload to request object
    // This makes user info available in route handlers
    req.user = decoded; // { id: "user_mongodb_id" }

    // STEP 5: Pass control to next middleware/handler
    next();
  });
};
```

### The `next()` Function - Critical Concept

```mermaid
flowchart LR
    M1[Middleware 1] -->|"next()"| M2[Middleware 2] -->|"next()"| Handler[Route Handler]

    M1 -.->|"no next() called"| Response([Early Response])
```

**Rules:**

- Calling `next()` passes control to the next function in the chain
- NOT calling `next()` ends the request-response cycle immediately
- Always use `return` before sending a response to prevent "headers already sent" errors

```javascript
// ❌ Wrong - will cause "Cannot set headers after they are sent"
if (error) {
  res.status(401).json({ error: "Unauthorized" });
  // Code continues executing!
  next(); // This will try to send another response
}

// ✅ Correct - return stops execution
if (error) {
  return res.status(401).json({ error: "Unauthorized" });
}
// Code never reaches here if error
next();
```

---

## Express Router Pattern

### Route Mounting - How Prefixes Work

```javascript
// index.js
app.use("/admin", adminRoutes); // All routes in adminRoutes get /admin prefix
app.use("/user", userRoutes); // All routes in userRoutes get /user prefix
app.use("/course", courseRoutes);
```

### Path Prefix Behavior - Common Gotcha!

This is a critical concept that trips up many beginners:

```javascript
// routes/user.js

// When using app.use('/user', router), these routes automatically get /user prefix
// So '/signup' here becomes '/user/signup' in the final app
// DON'T write '/user/signup' here or it will become '/user/user/signup' ❌

userRouter.post('/signup', ...);   // ✅ Becomes: POST /user/signup
userRouter.post('/signin', ...);   // ✅ Becomes: POST /user/signin
userRouter.get('/purchases', ...); // ✅ Becomes: GET /user/purchases

// ❌ WRONG: Don't do this!
userRouter.post('/user/signup', ...);  // ❌ Would become: POST /user/user/signup
```

### Visual Route Mapping

```mermaid
flowchart TD
    subgraph "index.js: app.use('/admin', adminRoutes)"
        A1["adminRouter.post('/signup')"] --> A1R["POST /admin/signup"]
        A2["adminRouter.post('/signin')"] --> A2R["POST /admin/signin"]
        A3["adminRouter.post('/course')"] --> A3R["POST /admin/course"]
        A4["adminRouter.put('/course/:id')"] --> A4R["PUT /admin/course/:id"]
        A5["adminRouter.delete('/course/:id')"] --> A5R["DELETE /admin/course/:id"]
        A6["adminRouter.get('/course/bulk')"] --> A6R["GET /admin/course/bulk"]
    end

    subgraph "index.js: app.use('/user', userRoutes)"
        U1["userRouter.post('/signup')"] --> U1R["POST /user/signup"]
        U2["userRouter.post('/signin')"] --> U2R["POST /user/signin"]
        U3["userRouter.get('/purchases')"] --> U3R["GET /user/purchases"]
    end

    subgraph "index.js: app.use('/course', courseRoutes)"
        C1["courseRouter.get('/preview')"] --> C1R["GET /course/preview"]
        C2["courseRouter.post('/purchase')"] --> C2R["POST /course/purchase"]
        C3["courseRouter.get('/overview')"] --> C3R["GET /course/overview"]
    end
```

### Route Parameters with `:id`

```javascript
adminRouter.put("/course/:id", adminAuth, async (req, res) => {
  // Access the ID from URL: /admin/course/abc123
  const courseId = req.params.id; // "abc123"

  // Use it to find the course
  const course = await Course.findOne({ _id: req.params.id });
});
```

---

## Input Validation with Zod

### Why Validate Input?

```mermaid
flowchart LR
    Input([User Input]) --> Zod{Zod Validation}
    Zod -->|Valid| Handler[Process Request]
    Zod -->|Invalid| Error[400 Bad Request]
```

**Without validation:** Malformed data could crash your app or corrupt your database.

### Schema Definition Patterns

```javascript
const { z } = require("zod");

// User signup schema
const UserSchema = z.object({
  email: z.email(), // Must be valid email format
  password: z.string().min(6), // At least 6 characters
  firstName: z.string().min(2), // At least 2 characters
  lastName: z.string().min(2),
});

// SignIn schema (subset of fields)
const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

// Course schema with type coercion
const courseSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number().min(0), // Converts string "99" to number 99
  imageUrl: z.string().min(2),
});

// Purchase schema with custom error message
const purchaseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  //                        ↑ Custom error message
});
```

### Using `safeParse()` for Error Handling

```javascript
userRouter.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // safeParse returns {success: boolean, data?: T, error?: ZodError}
  // It NEVER throws an exception - safe to use without try-catch
  const parsedData = UserSchema.safeParse({
    email,
    password,
    firstName,
    lastName,
  });

  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid data",
      error: parsedData.error, // Contains detailed validation errors
    });
  }

  // Data is valid, proceed with signup...
  // parsedData.data contains the validated data
});
```

### `parse()` vs `safeParse()`

| Method        | On Invalid Data                   | Use Case                                            |
| ------------- | --------------------------------- | --------------------------------------------------- |
| `parse()`     | Throws exception                  | When you want to catch errors elsewhere             |
| `safeParse()` | Returns `{success: false, error}` | When you want to handle errors inline (recommended) |

### Type Coercion with `z.coerce` - Solving Form Data Issues

```javascript
// Problem: Form data and JSON often sends numbers as strings
req.body.price = "99"; // String from form/JSON

// Without coercion:
z.number().min(0); // ❌ Fails! "99" is a string, not a number

// With coercion:
z.coerce.number().min(0); // ✅ Converts "99" → 99, then validates

// How it works:
// Step 1: z.coerce.number() converts "99" to 99
// Step 2: .min(0) validates that 99 >= 0
// Result: Valid!
```

---

## MongoDB Operations

### Database Connection Pattern

```javascript
// db.js
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // Exit with failure code - don't start server without DB
  }
}

// Connection event handlers for monitoring
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});
```

### Async Server Startup Pattern

```javascript
// index.js
async function startServer() {
  try {
    // Connect to MongoDB FIRST
    await connectDB();

    // THEN start the server (only if DB connection succeeds)
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server error:", error.message);
    process.exit(1);
  }
}

startServer();
```

### Common Mongoose Operations

```javascript
// CREATE - Two equivalent methods
// Method 1: new + save
const user = new User({ email, password, firstName, lastName });
await user.save();

// Method 2: create (shorthand)
const user = await User.create({ email, password, firstName, lastName });

// READ - Finding documents
const user = await User.findOne({ email }); // First match by criteria
const user = await User.findById(id); // By _id specifically
const courses = await Course.find({ creatorId }); // All matches
const courses = await Course.find({}); // All documents in collection

// UPDATE - Two approaches
// Approach 1: Find, modify, save
const course = await Course.findOne({ _id: id });
course.title = newTitle;
course.description = newDescription;
await course.save();

// Approach 2: updateOne (one-liner, commented in code)
// const course = await Course.updateOne(
//     { _id: req.params.id, creatorId: req.admin.id },  // Filter
//     { title, description, price, imageUrl }           // Updates
// );

// DELETE
await Course.findOneAndDelete({ _id: id, creatorId: adminId });
```

### String to ObjectId Auto-Conversion

```javascript
// req.admin.id comes from JWT payload (adminAuth middleware decodes the token)
// It's a string, but Mongoose automatically converts it to ObjectId when saving
const newCourse = new Course({
  title,
  description,
  price,
  imageUrl,
  creatorId: req.admin.id, // String from JWT, auto-converted to ObjectId by Mongoose
});
```

**This is Mongoose magic:**

- JWT stores the ID as a string: `"507f1f77bcf86cd799439011"`
- The Course schema expects `ObjectId` for `creatorId`
- Mongoose automatically converts the string to ObjectId
- No manual conversion needed!

---

### The Magic of `.populate()` - Eliminating Extra Queries

One of Mongoose's most powerful features - automatically replaces ObjectId references with actual documents.

```javascript
userRouter.get("/purchases", userAuth, async (req, res) => {
  const userId = req.user.id;

  // 1. Find all purchases for this user
  // 2. .populate('courseId') is the magic:
  //    - It looks at the 'courseId' field in the Purchase document
  //    - It sees it references the 'Course' model (defined in Purchase schema with ref: 'Course')
  //    - It automatically fetches the full Course document and replaces the ID with the actual object
  const purchases = await Purchase.find({ userId }).populate("courseId");

  // Now 'purchases' is an array where purchase.courseId is the FULL course object, not just an ID string
  // So we can just map over it to get the list of courses
  const courses = purchases.map((purchase) => purchase.courseId);

  // No need for a second Course.find() query! We already have the data.
  // ❌ Without populate, you'd need:
  // const courseIds = purchases.map(p => p.courseId);
  // const courses = await Course.find({ _id: { $in: courseIds } });

  res.json({ message: "User Purchases route", courses });
});
```

**Visual Comparison:**

```mermaid
flowchart TD
    subgraph "Without .populate() - 2 Queries"
        Q1["Query 1: Purchase.find({userId})"] --> R1["[{courseId: '507f...'}]"]
        R1 --> Q2["Query 2: Course.find({_id: {$in: [...]})"]
        Q2 --> R2["[{title: 'JS Course', ...}]"]
    end

    subgraph "With .populate('courseId') - 1 Query*"
        P1["Purchase.find({userId}).populate('courseId')"] --> PR1["[{courseId: {title: 'JS Course', price: 999, ...}}]"]
    end
```

\*Technically Mongoose makes 2 queries behind the scenes, but you only write one line of code and get the joined data directly.

---

## Coding Patterns & Practices

### 1. Ownership Verification Pattern

Always verify the user owns a resource before updating/deleting:

```javascript
adminRouter.put("/course/:id", adminAuth, async (req, res) => {
  // Find course AND verify this admin created it in ONE query
  const course = await Course.findOne({
    _id: req.params.id, // Match the course ID from URL
    creatorId: req.admin.id, // AND verify ownership
  });

  if (!course) {
    return res.status(404).json({
      message: "Course not found or you don't have permission to update it",
    });
  }

  // Safe to update now - we know this admin owns the course
  course.title = title;
  await course.save();
});

// Alternative one-liner approach (commented in code):
// const course = await Course.updateOne(
//     { _id: req.params.id, creatorId: req.admin.id },
//     { title, description, price, imageUrl }
// );
```

**Why combine conditions?**

- Single query = better performance
- Prevents unauthorized updates even if course exists
- Clear error message for both "not found" and "not authorized"

### 2. Duplicate Prevention with Error Code 11000

```javascript
courseRouter.post("/purchase", userAuth, async (req, res) => {
  try {
    // Create purchase (DB will prevent duplicates via unique index)
    const purchase = new Purchase({ courseId, userId });
    await purchase.save();

    res.json({ message: "Course purchased successfully", purchase });
  } catch (error) {
    // Handle duplicate purchase error (E11000 is MongoDB duplicate key error)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already purchased this course",
      });
    }
    // Handle other errors
    return res.status(500).json({
      message: "Error purchasing course",
      error: error.message,
    });
  }
});
```

**Key Insight:** We let the database enforce uniqueness via the compound index, then handle the specific error code. This is more reliable than checking first, then inserting (race conditions can occur).

### 3. Check Before Insert Pattern (for Signup)

```javascript
// Check if user already exists BEFORE creating
const user = await User.findOne({ email });
if (user) {
  return res.status(400).json({
    message: "User already exists",
  });
}

// Only create if not exists
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({
  email,
  password: hashedPassword,
  firstName,
  lastName,
});
await newUser.save();
```

### 4. Public vs Protected Routes

```javascript
// GET /course/preview - Get all available courses (for browsing/shopping)
courseRouter.get("/preview", async (req, res) => {
  // No auth required - anyone can browse courses
  const courses = await Course.find({});
  res.json({ message: "All available courses", courses });
});

// GET /course/purchase - Purchase requires authentication
courseRouter.post("/purchase", userAuth, async (req, res) => {
  //                         ↑ Auth middleware protects this route
  const userId = req.user.id; // Available because userAuth ran first
  // ...
});
```

### 5. Extracting User Info from Middleware

```javascript
// After auth middleware runs, user info is attached to req
userRouter.get("/purchases", userAuth, async (req, res) => {
  const userId = req.user.id; // Comes from decoded JWT payload
  //             ↑ Set by userAuth middleware: req.user = decoded;

  const purchases = await Purchase.find({ userId });
  // ...
});
```

---

## API Endpoints Reference

### Admin Routes (`/admin`)

| Method | Endpoint             | Auth     | Description                      |
| ------ | -------------------- | -------- | -------------------------------- |
| POST   | `/admin/signup`      | ❌       | Create new admin account         |
| POST   | `/admin/signin`      | ❌       | Login and get JWT token          |
| POST   | `/admin/course`      | ✅ Admin | Create a new course              |
| PUT    | `/admin/course/:id`  | ✅ Admin | Update own course                |
| DELETE | `/admin/course/:id`  | ✅ Admin | Delete own course                |
| GET    | `/admin/course/bulk` | ✅ Admin | Get all courses created by admin |

### User Routes (`/user`)

| Method | Endpoint          | Auth    | Description             |
| ------ | ----------------- | ------- | ----------------------- |
| POST   | `/user/signup`    | ❌      | Create new user account |
| POST   | `/user/signin`    | ❌      | Login and get JWT token |
| GET    | `/user/purchases` | ✅ User | Get purchased courses   |

### Course Routes (`/course`)

| Method | Endpoint           | Auth    | Description                  |
| ------ | ------------------ | ------- | ---------------------------- |
| GET    | `/course/preview`  | ❌      | Browse all available courses |
| POST   | `/course/purchase` | ✅ User | Purchase a course            |
| GET    | `/course/overview` | ✅ User | View purchased courses       |

### Request/Response Examples

**Signup Request:**

```http
POST /user/signup
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Doe"
}
```

**Signin Response:**

```json
{
  "message": "User Signed in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Protected Request:**

```http
GET /user/purchases
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Key Takeaways

### Security Best Practices Used

| Practice                  | Implementation                      | Why It Matters                                   |
| ------------------------- | ----------------------------------- | ------------------------------------------------ |
| **Password Hashing**      | bcrypt with 10 salt rounds          | Passwords can't be reversed if DB is compromised |
| **JWT Separation**        | Different secrets for user/admin    | Compromised user token can't access admin routes |
| **Input Validation**      | Zod schemas on all inputs           | Prevents injection attacks and bad data          |
| **Ownership Checks**      | Verify creator before update/delete | Users can't modify others' resources             |
| **Environment Variables** | Secrets in `.env`, not code         | Secrets never committed to git                   |
| **Compound Index**        | Unique userId+courseId              | Prevents duplicate purchases at DB level         |

### Code Organization Summary

```
Separation of Concerns:
├── Models (Data)      → Define data structure and relationships
├── Middleware (Auth)  → Handle cross-cutting concerns (authentication)
├── Routes (Logic)     → Handle business logic and validation
└── index.js (Setup)   → Wire everything together
```

### Complete List of Concepts Covered

1. **Express.js**

   - Route mounting with `app.use()`
   - Route parameters (`:id`)
   - Middleware chains
   - JSON body parsing

2. **MongoDB/Mongoose**

   - Schema definitions with validation
   - ObjectId references (`ref`)
   - Compound unique indexes
   - `.populate()` for joins
   - Auto string-to-ObjectId conversion
   - CRUD operations

3. **Authentication**

   - JWT creation and verification
   - bcrypt password hashing
   - Bearer token format
   - Separate secrets for roles

4. **Validation**

   - Zod schemas
   - `safeParse()` vs `parse()`
   - Type coercion
   - Custom error messages

5. **Error Handling**
   - MongoDB error code 11000
   - Async/await with try-catch
   - Proper HTTP status codes

---

## Running the Project

```bash
# Install dependencies
npm install

# Create .env file with required variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_user_jwt_secret
JWT_ADMIN_SECRET=your_admin_jwt_secret
PORT=3000

# Start the server (uses nodemon for auto-restart)
npm start
```

---

_This README serves as a complete revision guide for the Week 8 course-selling app project. Every concept from the code comments, coding patterns, and architectural decisions are documented here for quick reference._
