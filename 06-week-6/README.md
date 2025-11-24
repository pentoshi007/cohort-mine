# Week 6: Authentication Deep Dive & HTTP Security

> **A comprehensive guide to JWT-based authentication, token management, and secure frontend-backend communication**

## 📚 Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
  - [What are JWTs?](#what-are-jwts)
  - [Authentication vs Authorization](#authentication-vs-authorization)
- [Authentication Methods](#authentication-methods)
  - [Cookie-Based Authentication](#1-cookie-based-authentication)
  - [Bearer Token (Authorization Header)](#2-bearer-token-authorization-header)
  - [Custom Headers](#3-custom-headers)
  - [Query Parameters](#4-query-parameters-not-recommended)
- [Implementation Guide](#implementation-guide)
  - [Backend Setup](#backend-setup)
  - [Frontend Integration](#frontend-integration)
- [Security Best Practices](#security-best-practices)
- [Complete Code Examples](#complete-code-examples)
- [Comparison & Decision Guide](#comparison--decision-guide)
- [Common Pitfalls](#common-pitfalls)

---

## Overview

This week covers **authentication and authorization** in modern web applications, focusing on JWT (JSON Web Tokens) and different methods of transmitting authentication credentials between frontend and backend.

### What You'll Learn

- ✅ How JWTs work and why they're used
- ✅ Multiple authentication methods (Cookies, Headers, Tokens)
- ✅ Implementing secure authentication flows
- ✅ Frontend-backend integration with CORS
- ✅ Security considerations (XSS, CSRF, httpOnly cookies)
- ✅ When to use which authentication method

### Key Technologies

```json
{
  "express": "^5.1.0",      // Backend framework
  "jsonwebtoken": "^9.0.2", // JWT creation and verification
  "cors": "^2.8.5",         // Cross-Origin Resource Sharing
  "cookie-parser": "^1.4.6" // Parse cookies from requests
}
```

---

## Core Concepts

### What are JWTs?

**JWT (JSON Web Token)** is a compact, URL-safe means of representing claims between two parties. Think of it like a **checkbook** - it contains signed information that can be verified.

```mermaid
graph LR
    A[User Credentials] -->|Sign In| B[Server]
    B -->|Generates| C[JWT Token]
    C -->|Contains| D[Header + Payload + Signature]
    D -->|Sent to| E[Client]
    E -->|Stores| F[localStorage/Cookie]
    F -->|Sent with| G[Future Requests]
    G -->|Verified by| B
```

#### JWT Structure

A JWT consists of three parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     [HEADER]                            [PAYLOAD]                                [SIGNATURE]
```

| Part | Description | Example |
|------|-------------|---------|
| **Header** | Algorithm and token type | `{"alg": "HS256", "typ": "JWT"}` |
| **Payload** | Claims (user data) | `{"username": "testuser", "exp": 1735689600}` |
| **Signature** | Verification signature | `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)` |

#### Key Characteristics

- **Stateless**: Server doesn't store session data
- **Self-contained**: All info is in the token itself
- **Cryptographically signed**: Can't be tampered with
- **Expirable**: Tokens have expiration times

```javascript
// Creating a JWT
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { username: 'testuser' },      // Payload
  'your-secret-key',             // Secret
  { expiresIn: '1h' }            // Options
);

// Verifying a JWT (throws error if invalid)
try {
  const decoded = jwt.verify(token, 'your-secret-key');
  console.log(decoded); // { username: 'testuser', iat: 1616239022, exp: 1616242622 }
} catch (error) {
  console.error('Invalid token:', error.message);
}
```

### Authentication vs Authorization

```mermaid
graph TD
    A[User Request] --> B{Authenticated?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Authorized?}
    D -->|No| E[403 Forbidden]
    D -->|Yes| F[200 Access Granted]
```

- **Authentication**: Who are you? (Identity verification)
- **Authorization**: What can you do? (Permission verification)

---

## Authentication Methods

Modern web applications support multiple methods for transmitting authentication tokens. Each has its use cases, benefits, and security implications.

### Overview Diagram

```mermaid
graph TB
    Client[Client Application]
    Server[Express Server]

    Client -->|Method 1: Cookie| Server
    Client -->|Method 2: Authorization Header| Server
    Client -->|Method 3: Custom Header| Server
    Client -->|Method 4: Query Param| Server

    Server -->|Validates Token| JWT[JWT Verification]
    JWT -->|Success| Protected[Protected Resource]
    JWT -->|Failure| Error[401 Unauthorized]
```

---

### 1. Cookie-Based Authentication

**Most secure method for browser-based applications**

#### How It Works

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: POST /signin (username, password)
    Server->>Server: Validate credentials
    Server->>Server: Generate JWT
    Server->>Client: Set-Cookie: token=JWT (httpOnly, secure)
    Client->>Server: GET /dashboard (Cookie automatically sent)
    Server->>Server: Extract token from cookie
    Server->>Server: Verify JWT
    Server->>Client: Return protected data
```

#### Backend Implementation

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

app.use(cookieParser());

// Sign in - Set cookie
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  const user = validateUser(username, password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  // Set cookie with security flags
  res.cookie('token', token, {
    httpOnly: true,      // ✅ Prevents JavaScript access (XSS protection)
    secure: true,        // ✅ HTTPS only in production
    sameSite: 'strict',  // ✅ CSRF protection
    maxAge: 3600000      // 1 hour in milliseconds
  });

  res.json({ message: 'Signed in successfully' });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token;  // Extract from cookie

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Protected route
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome', username: req.user.username });
});
```

#### Frontend Implementation

```javascript
// Sign in
async function signIn(username, password) {
  const response = await fetch('http://localhost:3000/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'  // ⚠️ CRITICAL: Tells browser to save/send cookies
  });

  return response.json();
}

// Access protected route
async function getDashboard() {
  const response = await fetch('http://localhost:3000/dashboard', {
    credentials: 'include'  // ⚠️ CRITICAL: Sends cookie automatically
  });

  return response.json();
}

// Logout
async function logout() {
  await fetch('http://localhost:3000/logout', {
    method: 'POST',
    credentials: 'include'
  });
}
```

#### React Example

```javascript
import { useState, useEffect } from 'react';

function Dashboard() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      // ✅ No manual token management needed!
      const response = await fetch('http://localhost:3000/dashboard', {
        credentials: 'include'  // Browser handles cookie automatically
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    };

    fetchDashboard();
  }, []);

  return <div>{userData?.message}</div>;
}
```

#### Pros & Cons

**Advantages:**
- ✅ **Automatic**: Browser sends cookie with every request
- ✅ **XSS Protection**: `httpOnly` prevents JavaScript access
- ✅ **CSRF Protection**: `sameSite` flag prevents cross-site requests
- ✅ **Simple Frontend**: No manual token management

**Disadvantages:**
- ❌ **CSRF Risk**: Requires `sameSite` configuration
- ❌ **Cross-domain**: More complex for different domains
- ❌ **Mobile Apps**: Not ideal for native mobile apps

---

### 2. Bearer Token (Authorization Header)

**Standard for APIs, SPAs, and mobile applications**

#### How It Works

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: POST /signin (username, password)
    Server->>Server: Validate credentials
    Server->>Server: Generate JWT
    Server->>Client: Response: { token: "JWT" }
    Client->>Client: Store token (localStorage/memory)
    Client->>Server: GET /dashboard<br/>Header: Authorization: Bearer JWT
    Server->>Server: Extract token from header
    Server->>Server: Verify JWT
    Server->>Client: Return protected data
```

#### Backend Implementation

```javascript
// Sign in - Return token
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  const user = validateUser(username, password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

  // Return token in response body
  res.json({
    token,
    message: 'Signed in successfully'
  });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];  // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Protected route
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome', username: req.user.username });
});
```

#### Frontend Implementation

```javascript
// Sign in and store token
async function signIn(username, password) {
  const response = await fetch('http://localhost:3000/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  // ⚠️ Store token manually
  localStorage.setItem('token', data.token);

  return data;
}

// Access protected route
async function getDashboard() {
  const token = localStorage.getItem('token');

  // ⚠️ Must add Authorization header manually
  const response = await fetch('http://localhost:3000/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`  // REQUIRED for every request
    }
  });

  return response.json();
}

// Logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

#### React Example with Axios Interceptor

```javascript
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Usage
function Dashboard() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      }
    };

    fetchDashboard();
  }, []);

  return <div>{userData?.message}</div>;
}
```

#### Pros & Cons

**Advantages:**
- ✅ **Standard**: Industry-standard approach (OAuth 2.0)
- ✅ **Cross-domain**: Easy to use across different domains
- ✅ **Mobile-friendly**: Perfect for native mobile apps
- ✅ **No CSRF**: Not vulnerable to CSRF attacks
- ✅ **Flexible Storage**: Can use memory, localStorage, or sessionStorage

**Disadvantages:**
- ❌ **XSS Vulnerable**: JavaScript can access tokens in localStorage
- ❌ **Manual Management**: Must add header to every request
- ❌ **More Code**: Requires interceptors or manual header management

---

### 3. Custom Headers

**Alternative approach for internal APIs**

#### Backend Implementation

```javascript
function authenticateToken(req, res, next) {
  const token = req.headers['x-auth-token'];  // Custom header

  if (!token) {
    return res.status(401).json({ message: 'Auth token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

#### Frontend Implementation

```javascript
async function getDashboard() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/dashboard', {
    headers: {
      'x-auth-token': token  // Custom header
    }
  });

  return response.json();
}
```

---

### 4. Query Parameters (Not Recommended)

**Only for specific use cases (e.g., temporary links)**

#### Backend Implementation

```javascript
function authenticateToken(req, res, next) {
  const token = req.query.token;  // From ?token=xyz

  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

#### Frontend Implementation

```javascript
// ⚠️ NOT RECOMMENDED for sensitive operations
async function getDashboard(token) {
  const response = await fetch(`http://localhost:3000/dashboard?token=${token}`);
  return response.json();
}
```

**Why Not Recommended:**
- ❌ Tokens appear in URLs (browser history, server logs)
- ❌ Can be leaked via Referer headers
- ❌ Not secure for production authentication

---

## Implementation Guide

### Backend Setup

#### Universal Authentication Middleware

This middleware supports **all authentication methods** with priority order:

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const users = [];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',  // Your frontend URL
  credentials: true                 // Allow cookies
}));

/**
 * Universal authentication middleware
 * Priority: Cookie > Authorization Header > Custom Header > Query Parameter
 */
function authenticateToken(req, res, next) {
  let token = null;

  // Priority 1: Cookie (most secure)
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  // Priority 2: Authorization Bearer header (standard)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Priority 3: Custom header
  else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }
  // Priority 4: Query parameter (least secure)
  else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required',
      hint: 'Send token via Cookie, Authorization header, x-auth-token, or query param'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.username === decoded.username);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.tokenData = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Routes
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  res.status(201).json({ message: 'User created successfully' });
});

app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  // Set cookie (for cookie-based auth)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000
  });

  // Also return token (for header-based auth)
  res.json({
    message: 'Signed in successfully',
    token,
    note: 'Token also set in httpOnly cookie'
  });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Protected routes
app.get('/me', authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    tokenExpiry: new Date(req.tokenData.exp * 1000).toISOString()
  });
});

app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to your dashboard',
    username: req.user.username
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

### Frontend Integration

#### Using Fetch API

**Cookie-Based:**

```javascript
// Sign in
const response = await fetch('http://localhost:3000/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
  credentials: 'include'  // ⚠️ REQUIRED for cookies
});

// Access protected route
const dashboardResponse = await fetch('http://localhost:3000/dashboard', {
  credentials: 'include'  // ⚠️ REQUIRED for cookies
});
```

**Bearer Token:**

```javascript
// Sign in
const response = await fetch('http://localhost:3000/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);

// Access protected route
const dashboardResponse = await fetch('http://localhost:3000/dashboard', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`  // ⚠️ REQUIRED
  }
});
```

#### Using Axios

**Cookie-Based:**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true  // ⚠️ REQUIRED for cookies
});

// Sign in
await api.post('/signin', { username, password });

// Access protected route (cookie sent automatically)
const { data } = await api.get('/dashboard');
```

**Bearer Token:**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000'
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sign in
const { data } = await api.post('/signin', { username, password });
localStorage.setItem('token', data.token);

// Access protected route
const dashboard = await api.get('/dashboard');
```

#### Complete HTML Frontend Example

A complete, working frontend application demonstrating Bearer Token authentication with localStorage.

**File: `public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Authentication</title>
  </head>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script>
    async function signup(event) {
      event.preventDefault(); // Prevent form submission
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      try {
        const response = await axios.post("http://localhost:3000/signup", {
          username,
          password,
        });
        alert(response.data.message);
      } catch (error) {
        alert(error.response?.data?.message || error.message);
      }
    }

    async function signin(event) {
      event.preventDefault(); // Prevent form submission
      const username = document.getElementById("signin-username").value;
      const password = document.getElementById("signin-password").value;
      try {
        const response = await axios.post("http://localhost:3000/signin", {
          username,
          password,
        });
        alert(response.data.message);
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        // Fetch user info immediately after login
        getUserInfo();
      } catch (error) {
        alert(error.response?.data?.message || error.message);
      }
    }

    async function getUserInfo(event) {
      if (event) event.preventDefault();
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          document.getElementById("user-info").innerHTML = "No token found";
          return;
        }
        // Send token in Authorization header
        const response = await axios.get("http://localhost:3000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        document.getElementById("user-info").innerHTML = response.data.username;
      } catch (error) {
        document.getElementById("user-info").innerHTML =
          error.response?.data?.message || error.message;
      }
    }

    async function logout(event) {
      try {
        localStorage.removeItem("token");
        document.getElementById("user-info").innerHTML = "Logged out";
        alert("Logged out successfully");
      } catch (error) {
        alert(error.message);
      }
    }
  </script>

  <body>
    <h1>Authentication</h1>

    <!-- Sign Up Form -->
    <form id="signup-form">
      <input type="text" id="username" placeholder="Username" />
      <input type="password" id="password" placeholder="Password" />
      <button onclick="signup(event)">Sign Up</button>
    </form>

    <!-- Sign In Form -->
    <form id="signin-form">
      <input type="text" id="signin-username" placeholder="Username" />
      <input type="password" id="signin-password" placeholder="Password" />
      <button onclick="signin(event)">Sign In</button>
    </form>

    <!-- User Info Display -->
    <div>User info: <span id="user-info"></span></div>

    <!-- Logout Button -->
    <div>
      <button onclick="logout(event)">Logout</button>
    </div>

    <script>
      // Automatically fetch user info on page load if token exists
      window.addEventListener("DOMContentLoaded", () => {
        if (localStorage.getItem("token")) {
          getUserInfo();
        }
      });
    </script>
  </body>
</html>
```

**How This Example Works:**

1. **Sign Up Flow:**
   ```mermaid
   sequenceDiagram
       User->>Browser: Enter username & password
       Browser->>Server: POST /signup
       Server->>Server: Create user
       Server->>Browser: Success message
       Browser->>User: Show alert
   ```

2. **Sign In Flow:**
   ```mermaid
   sequenceDiagram
       User->>Browser: Enter credentials
       Browser->>Server: POST /signin
       Server->>Server: Validate & generate JWT
       Server->>Browser: Return { token, message }
       Browser->>localStorage: Store token
       Browser->>Server: GET /me (with Bearer token)
       Server->>Browser: Return user data
       Browser->>User: Display username
   ```

3. **Auto-Login on Page Load:**
   - When page loads, checks if token exists in localStorage
   - If found, automatically calls `/me` endpoint
   - Displays username without requiring login

4. **Logout:**
   - Removes token from localStorage
   - Clears user info display
   - User must sign in again to access protected routes

**Key Features:**
- ✅ **Bearer Token Authentication**: Uses `Authorization: Bearer <token>` header
- ✅ **localStorage**: Persists token across page reloads
- ✅ **Auto-login**: Checks for existing token on page load
- ✅ **Error Handling**: Displays errors via alerts
- ✅ **Axios**: Uses Axios library for cleaner HTTP requests
- ✅ **Event Prevention**: `event.preventDefault()` prevents form submission

**Running the Example:**

```bash
# 1. Start the backend server
node 6.2-auth-FEtoBEconnection.js

# 2. Open http://localhost:3000 in your browser

# 3. Try the flow:
#    - Sign up with a username and password
#    - Sign in with the same credentials
#    - See your username appear automatically
#    - Refresh the page - you're still logged in!
#    - Click logout - username disappears
```

---

## Security Best Practices

### 1. Use Environment Variables

```javascript
// ❌ BAD
const JWT_SECRET = 'hardcoded-secret';

// ✅ GOOD
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}
```

### 2. Hash Passwords

```javascript
const bcrypt = require('bcrypt');

// Sign up
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User created' });
});

// Sign in
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate token...
});
```

### 3. Set Proper Cookie Flags

```javascript
res.cookie('token', token, {
  httpOnly: true,      // Prevents XSS attacks
  secure: true,        // HTTPS only
  sameSite: 'strict',  // Prevents CSRF attacks
  maxAge: 3600000      // Expiration time
});
```

### 4. Handle Token Expiration

```javascript
// Backend
const token = jwt.sign(
  { username },
  JWT_SECRET,
  { expiresIn: '1h' }  // Token expires in 1 hour
);

// Frontend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 5. CORS Configuration

```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Specific origin, not '*'
  credentials: true,                // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 6. Input Validation

```javascript
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  if (username.length < 3 || password.length < 8) {
    return res.status(400).json({
      message: 'Username min 3 chars, password min 8 chars'
    });
  }

  // Continue...
});
```

---

## Complete Code Examples

### Backend: Express Server with All Methods

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const users = [];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Helper function
function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
}

// Universal auth middleware
function authenticateToken(req, res, next) {
  let token = null;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.username === decoded.username);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    req.tokenData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    });
  }
}

// Public routes
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'User created successfully' });
});

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(username);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000
  });

  res.json({
    message: 'Signed in successfully',
    token,
    user: { username }
  });
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Protected routes
app.get('/me', authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    tokenExpiry: new Date(req.tokenData.exp * 1000).toISOString()
  });
});

app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to dashboard',
    username: req.user.username
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

## Comparison & Decision Guide

### Cookie vs Bearer Token: Complete Comparison

```mermaid
graph TD
    A[Choose Auth Method] --> B{What's your use case?}
    B -->|Browser-only app| C[Cookie-Based]
    B -->|Mobile app or API| D[Bearer Token]
    B -->|Cross-domain| D
    B -->|Same domain| C

    C --> E[Benefits:<br/>✅ Automatic<br/>✅ XSS Protected<br/>✅ Simple frontend]
    D --> F[Benefits:<br/>✅ Standard<br/>✅ Cross-domain<br/>✅ Mobile friendly]
```

### Detailed Comparison Table

| Aspect | Cookie | Bearer Token | Winner |
|--------|--------|--------------|--------|
| **Setup Complexity** | Medium | Easy | Token |
| **Frontend Code** | Minimal | More boilerplate | Cookie |
| **Automatic Sending** | ✅ Yes | ❌ No | Cookie |
| **XSS Protection** | ✅ Yes (httpOnly) | ❌ Vulnerable | Cookie |
| **CSRF Protection** | Requires SameSite | ✅ Immune | Token |
| **Mobile Apps** | ❌ Complex | ✅ Easy | Token |
| **SPAs** | ✅ Good | ✅ Good | Tie |
| **Cross-domain** | ❌ Complex | ✅ Easy | Token |
| **Server Logs** | Cleaner | Token in logs | Cookie |
| **Browser DevTools** | Hidden | ❌ Visible | Cookie |
| **Token Storage** | Browser | Manual | Cookie |
| **Standard Compliance** | Custom | ✅ OAuth 2.0 | Token |

### When to Use What

#### Use Cookies When:
- ✅ Building a traditional web app (server-rendered or SPA)
- ✅ Frontend and backend on same domain
- ✅ Security is top priority (XSS protection critical)
- ✅ You want simpler frontend code

#### Use Bearer Tokens When:
- ✅ Building a REST API consumed by multiple clients
- ✅ Supporting mobile apps
- ✅ Cross-domain authentication required
- ✅ Following OAuth 2.0 standards
- ✅ CSRF protection is handled elsewhere

#### Use Both When:
- ✅ Supporting multiple client types (web + mobile)
- ✅ Maximum flexibility needed
- ✅ Gradual migration between methods

---

## Common Pitfalls

### 1. Forgetting `credentials: 'include'`

```javascript
// ❌ WRONG: Cookie won't be sent
fetch('http://localhost:3000/dashboard');

// ✅ CORRECT
fetch('http://localhost:3000/dashboard', {
  credentials: 'include'
});
```

### 2. Not Handling Token Expiration

```javascript
// ❌ WRONG: No expiration handling
const token = jwt.sign({ username }, JWT_SECRET);

// ✅ CORRECT
const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

// Frontend handling
try {
  const decoded = jwt.verify(token, JWT_SECRET);
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    // Redirect to login
  }
}
```

### 3. Storing Sensitive Data in JWT

```javascript
// ❌ WRONG: Password in token
const token = jwt.sign({ username, password }, JWT_SECRET);

// ✅ CORRECT: Only non-sensitive data
const token = jwt.sign({ username, userId }, JWT_SECRET);
```

### 4. Not Validating Input

```javascript
// ❌ WRONG: No validation
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
});

// ✅ CORRECT
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password too short' });
  }

  users.push({ username, password });
});
```

### 5. Using `localStorage` for Sensitive Data

```javascript
// ⚠️ RISKY: Vulnerable to XSS
localStorage.setItem('token', token);

// ✅ BETTER: Use httpOnly cookies
res.cookie('token', token, { httpOnly: true });

// ✅ ALTERNATIVE: Use sessionStorage (cleared on tab close)
sessionStorage.setItem('token', token);
```

### 6. Not Setting CORS Properly

```javascript
// ❌ WRONG: Allows all origins with credentials (security risk)
app.use(cors({
  origin: '*',
  credentials: true
}));

// ✅ CORRECT: Specific origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 7. Exposing JWT Secret

```javascript
// ❌ WRONG: Hardcoded secret
const JWT_SECRET = 'my-secret-123';

// ✅ CORRECT: Environment variable
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}
```

---

## Key Takeaways

### JWTs
- **Stateless authentication** mechanism
- **Self-contained** with all info in the token
- **Must be verified** on every request (throws error if invalid)
- Like a **signed checkbook** - can't be forged

### Cookie-Based Auth
- **Most secure** for browser apps
- **Automatic** - browser handles everything
- **httpOnly** prevents XSS attacks
- **Requires** `credentials: 'include'` on frontend

### Bearer Token Auth
- **Industry standard** (OAuth 2.0)
- **Manual token management** required
- **Cross-domain friendly**
- **Perfect for** APIs and mobile apps

### Security
- **Always hash passwords** (use bcrypt)
- **Set token expiration** times
- **Use environment variables** for secrets
- **Validate all input** from clients
- **Configure CORS** properly

### Frontend-Backend Connection
- **CORS** is required for cross-origin requests
- **credentials: 'include'** sends cookies automatically
- **Authorization header** must be added manually for Bearer tokens
- **Interceptors** simplify token management

---

## Quick Reference Commands

```bash
# Install dependencies
npm install express jsonwebtoken cookie-parser cors bcrypt

# Set environment variable
export JWT_SECRET="your-very-secure-secret-key"

# Run server
node 6.1-http-deepdive.js

# Test with curl (Cookie-based)
curl -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass"}' \
  -c cookies.txt

curl http://localhost:3000/dashboard -b cookies.txt

# Test with curl (Bearer token)
TOKEN=$(curl -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass"}' \
  | jq -r .token)

curl http://localhost:3000/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## Additional Resources

- [JWT.io](https://jwt.io/) - Debug and decode JWTs
- [MDN Web Docs - Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OAuth 2.0 RFC](https://oauth.net/2/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Week 6 Complete** ✅
_Master authentication to build secure, scalable applications_
