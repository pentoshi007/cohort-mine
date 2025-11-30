# Frontend Architecture & Concepts - Course Selling App

> A comprehensive guide to the frontend implementation of a full-stack course selling application. This document covers HTML structure, CSS styling patterns, JavaScript concepts, authentication flows, and API integration.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [File Structure & Responsibilities](#2-file-structure--responsibilities)
3. [HTML Fundamentals](#3-html-fundamentals)
4. [CSS Deep Dive](#4-css-deep-dive)
5. [JavaScript Concepts](#5-javascript-concepts)
6. [Authentication System](#6-authentication-system)
7. [State Management with localStorage](#7-state-management-with-localstorage)
8. [API Integration Patterns](#8-api-integration-patterns)
9. [UI/UX Patterns](#9-uiux-patterns)
10. [Best Practices & Takeaways](#10-best-practices--takeaways)

---

## 1. Project Architecture

### Application Flow Overview

```mermaid
flowchart TB
    subgraph Public["Public Pages"]
        INDEX[index.html<br/>Landing Page]
        AUTH[auth.html<br/>Login/Signup]
    end
    
    subgraph Protected["Protected Pages"]
        DASH[dashboard.html<br/>User Dashboard]
        ADMIN[admin.html<br/>Admin Panel]
    end
    
    subgraph Shared["Shared Resources"]
        CSS[styles.css]
        JS[script.js]
    end
    
    INDEX --> |Browse Courses| INDEX
    INDEX --> |Buy Course| AUTH
    AUTH --> |User Login| DASH
    AUTH --> |Admin Login| ADMIN
    DASH --> |Logout| AUTH
    ADMIN --> |Logout| AUTH
    
    CSS --> INDEX
    CSS --> AUTH
    CSS --> DASH
    CSS --> ADMIN
    
    JS --> INDEX
    JS --> AUTH
    JS --> DASH
    JS --> ADMIN
```

### User Journey Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant LS as localStorage
    participant API as Backend API
    
    U->>FE: Visit Landing Page
    FE->>API: GET /course/preview
    API-->>FE: Return courses list
    FE->>U: Display course cards
    
    U->>FE: Click "Buy Now"
    FE->>LS: Check for token
    LS-->>FE: No token found
    FE->>U: Redirect to auth.html
    
    U->>FE: Submit login form
    FE->>API: POST /user/signin
    API-->>FE: Return JWT token
    FE->>LS: Store token + userType
    FE->>U: Redirect to dashboard
```

---

## 2. File Structure & Responsibilities

```
public/
├── index.html      # Landing page - displays all available courses
├── auth.html       # Authentication - handles login/signup for users & admins
├── dashboard.html  # User dashboard - shows purchased courses
├── admin.html      # Admin panel - CRUD operations for courses
├── script.js       # Shared JavaScript - API calls, utilities, navigation
└── styles.css      # Global styles - CSS variables, components, layouts
```

### File Responsibility Matrix

| File | Purpose | Key Features |
|------|---------|--------------|
| `index.html` | Public landing page | Course grid, hero section, dynamic nav |
| `auth.html` | Authentication gateway | Tab switching (user/admin), form toggle (login/signup) |
| `dashboard.html` | User's learning hub | Purchased courses display, protected route |
| `admin.html` | Course management | Create/Edit/Delete courses, modal forms |
| `script.js` | Shared logic layer | API wrapper, auth helpers, toast system |
| `styles.css` | Design system | CSS variables, reusable components |

---

## 3. HTML Fundamentals

### Document Structure Pattern

Every HTML file follows this consistent structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta tags for character encoding and responsive design -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - Course Selling App</title>
    
    <!-- External stylesheets -->
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header><!-- Navigation --></header>
    <main class="container"><!-- Page content --></main>
    <div id="toast" class="toast"></div>
    
    <!-- Scripts at bottom for performance -->
    <script src="script.js"></script>
    <script>/* Page-specific logic */</script>
</body>
</html>
```

### Key HTML Concepts Demonstrated

#### 1. Semantic HTML Structure

```html
<header>      <!-- Site header with navigation -->
<main>        <!-- Primary page content -->
<nav>         <!-- Navigation links -->
<form>        <!-- User input forms -->
```

#### 2. The Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

This is **critical for responsive design**:
- `width=device-width` - Sets viewport width to device width
- `initial-scale=1.0` - Sets initial zoom level to 100%

#### 3. Dynamic Content Injection Points

```html
<nav class="nav-links" id="navLinks">
    <!-- Injected by JS based on auth state -->
</nav>

<div id="courseGrid" class="grid">
    <!-- Courses loaded dynamically from API -->
</div>
```

The pattern: Create empty containers with IDs, then populate them with JavaScript.

#### 4. Form Structure with Validation

```html
<form id="authForm">
    <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" name="email" class="form-input" required>
    </div>
    <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-input" required minlength="6">
    </div>
    <button type="submit" class="btn btn-primary">Sign In</button>
</form>
```

**Built-in HTML5 Validation Attributes:**
- `required` - Field must be filled
- `type="email"` - Must be valid email format
- `minlength="6"` - Minimum character requirement
- `type="number"` - Only numeric input
- `min="0"` - Minimum value constraint

---

## 4. CSS Deep Dive

### CSS Variables (Custom Properties)

CSS variables provide a **single source of truth** for design tokens:

```css
:root {
    /* Color Palette */
    --primary: #6366f1;           /* Indigo - main brand color */
    --primary-hover: #4f46e5;     /* Darker shade for hover states */
    --bg: #f8fafc;                /* Light gray background */
    --surface: #ffffff;           /* Card/container backgrounds */
    --text: #1e293b;              /* Primary text color */
    --text-light: #64748b;        /* Secondary/muted text */
    --border: #e2e8f0;            /* Border color */
    --danger: #ef4444;            /* Error/delete actions */
    --success: #22c55e;           /* Success states */
    
    /* Shadows */
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 
              0 2px 4px -2px rgb(0 0 0 / 0.1);
}
```

**Why Use CSS Variables?**

```mermaid
flowchart LR
    subgraph Without["Without Variables"]
        A1["Button: #6366f1"]
        A2["Link: #6366f1"]
        A3["Header: #6366f1"]
        A4["Change? Edit 50+ places"]
    end
    
    subgraph With["With Variables"]
        B1["--primary: #6366f1"]
        B2["Button: var(--primary)"]
        B3["Link: var(--primary)"]
        B4["Change? Edit 1 place"]
    end
```

**Usage Pattern:**

```css
.btn-primary {
    background: var(--primary);      /* Use the variable */
    color: white;
}

.btn-primary:hover {
    background: var(--primary-hover); /* Hover variant */
}
```

### CSS Reset & Box Model

```css
* {
    box-sizing: border-box;  /* Include padding/border in width calculations */
    margin: 0;               /* Remove default margins */
    padding: 0;              /* Remove default padding */
}
```

#### Understanding `box-sizing: border-box`

```
┌─────────────────────────────────────────────────────────┐
│  content-box (default)          border-box              │
│  ─────────────────────          ──────────              │
│                                                         │
│  width: 200px                   width: 200px            │
│  padding: 20px                  padding: 20px           │
│  border: 5px                    border: 5px             │
│                                                         │
│  Total = 200 + 40 + 10          Total = 200px           │
│        = 250px                  (padding included)      │
└─────────────────────────────────────────────────────────┘
```

### Flexbox Layout System

Flexbox is used extensively for **one-dimensional layouts**:

```css
/* Navigation bar layout */
.nav-wrapper {
    display: flex;
    justify-content: space-between;  /* Logo left, links right */
    align-items: center;             /* Vertically centered */
}

/* Button with centered content */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Card footer with space between price and button */
.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

#### Flexbox Properties Cheat Sheet

```
┌──────────────────────────────────────────────────────────────┐
│  CONTAINER PROPERTIES (display: flex)                        │
├──────────────────────────────────────────────────────────────┤
│  flex-direction:   row | column | row-reverse | column-rev   │
│  justify-content:  flex-start | center | space-between | ... │
│  align-items:      stretch | center | flex-start | flex-end  │
│  gap:              spacing between items (e.g., 1rem)        │
├──────────────────────────────────────────────────────────────┤
│  ITEM PROPERTIES                                             │
├──────────────────────────────────────────────────────────────┤
│  flex: 1           → Item grows to fill available space      │
│  flex-shrink: 0    → Item won't shrink below its size        │
│  align-self:       → Override align-items for single item    │
└──────────────────────────────────────────────────────────────┘
```

### CSS Grid for Two-Dimensional Layouts

The course card grid uses CSS Grid:

```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
}
```

**Breaking Down `grid-template-columns`:**

```
repeat(auto-fill, minmax(300px, 1fr))
│       │         │      │     │
│       │         │      │     └─ Maximum: equal fraction of space
│       │         │      └─────── Minimum: 300px per column
│       │         └────────────── minmax() function
│       └──────────────────────── Fill as many columns as fit
└──────────────────────────────── Repeat the pattern
```

**Visual Example:**

```
Large Screen (1200px):
┌──────────┬──────────┬──────────┐
│  Card 1  │  Card 2  │  Card 3  │
├──────────┼──────────┼──────────┤
│  Card 4  │  Card 5  │  Card 6  │
└──────────┴──────────┴──────────┘

Medium Screen (700px):
┌──────────┬──────────┐
│  Card 1  │  Card 2  │
├──────────┼──────────┤
│  Card 3  │  Card 4  │
└──────────┴──────────┘

Small Screen (400px):
┌──────────┐
│  Card 1  │
├──────────┤
│  Card 2  │
└──────────┘
```

### Component Styling Patterns

#### Card Component

```css
.card {
    background: var(--surface);
    border-radius: 1rem;
    overflow: hidden;           /* Clips child content to rounded corners */
    box-shadow: var(--shadow);
    transition: transform 0.2s; /* Smooth hover animation */
    display: flex;
    flex-direction: column;     /* Stack image and content vertically */
}

.card:hover {
    transform: translateY(-4px); /* Subtle lift effect on hover */
}
```

#### Button Variants

```css
/* Base button styles */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
}

/* Primary - main actions */
.btn-primary {
    background: var(--primary);
    color: white;
}

/* Outline - secondary actions */
.btn-outline {
    border: 1px solid var(--border);
    background: transparent;
}

/* Danger - destructive actions */
.btn-danger {
    background: var(--danger);
    color: white;
}
```

#### Form Input Styling

```css
.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-family: inherit;        /* Use same font as body */
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;               /* Remove default browser outline */
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); /* Focus ring */
}
```

### Sticky Header

```css
header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
}
```

**How `position: sticky` works:**

```
┌─────────────────────────────────┐
│ Header (sticky, top: 0)         │ ← Sticks here when scrolling
├─────────────────────────────────┤
│                                 │
│         Page Content            │
│         (scrollable)            │
│                                 │
└─────────────────────────────────┘
```

---

## 5. JavaScript Concepts

### The Fetch API & Async/Await

The `apiCall` function is the **central API communication layer**:

```javascript
async function apiCall(endpoint, method = 'GET', data = null) {
    // 1. Get token from storage
    const token = localStorage.getItem('token');
    
    // 2. Set up headers
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // 3. Add auth header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 4. Configure request
    const config = {
        method,
        headers,
    };
    
    // 5. Add body for POST/PUT requests
    if (data) {
        config.body = JSON.stringify(data);
    }
    
    // 6. Make the request
    const res = await fetch(`${API_URL}${endpoint}`, config);
    const json = await res.json();
    
    // 7. Handle errors
    if (!res.ok) {
        if (res.status === 401) {
            logout(); // Token expired
        }
        throw new Error(json.message || 'Something went wrong');
    }
    
    return json;
}
```

#### Understanding Async/Await

```mermaid
sequenceDiagram
    participant Code as JavaScript Code
    participant Fetch as fetch()
    participant Server as Backend Server
    
    Code->>Code: async function starts
    Code->>Fetch: await fetch(url)
    Note over Code: Execution pauses here
    Fetch->>Server: HTTP Request
    Server-->>Fetch: HTTP Response
    Fetch-->>Code: Response object
    Note over Code: Execution resumes
    Code->>Code: Process response
```

**Key Points:**
- `async` keyword allows use of `await` inside the function
- `await` pauses execution until the Promise resolves
- Makes asynchronous code look synchronous
- Always wrap in `try/catch` for error handling

### DOM Manipulation

#### Selecting Elements

```javascript
// By ID - returns single element
document.getElementById('courseGrid')

// Query selector - returns first match
document.querySelector('.btn-primary')

// Query selector all - returns NodeList
document.querySelectorAll('.auth-tab')
```

#### Modifying Elements

```javascript
// Change text content
element.textContent = 'New text';

// Change HTML content
element.innerHTML = '<h1>New HTML</h1>';

// Modify styles
element.style.display = 'none';
element.style.display = 'flex';

// Modify classes
element.classList.add('active');
element.classList.remove('active');
element.classList.toggle('hidden');

// Set attributes
element.setAttribute('disabled', true);
```

#### Dynamic Content Generation

```javascript
// Template literals for HTML generation
grid.innerHTML = courses.map(course => `
    <div class="card">
        <img src="${course.imageUrl}" alt="${course.title}" class="card-img">
        <div class="card-body">
            <h3 class="card-title">${course.title}</h3>
            <p class="card-desc">${course.description}</p>
            <div class="card-footer">
                <span class="price">$${course.price}</span>
                <button class="btn btn-primary" onclick="purchaseCourse('${course._id}')">
                    Buy Now
                </button>
            </div>
        </div>
    </div>
`).join('');
```

**The Pattern:**
1. Use `.map()` to transform array of data into array of HTML strings
2. Use template literals (backticks) for multi-line strings with `${}`
3. Use `.join('')` to combine array into single string
4. Assign to `innerHTML` to render

### Event Handling

#### Form Submit Event

```javascript
document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // Stop default form submission (page reload)
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Process...
});
```

**Understanding `e.preventDefault()`:**

```
Without preventDefault():
User clicks submit → Form submits → Page reloads → Data lost

With preventDefault():
User clicks submit → JavaScript handles it → No page reload → SPA behavior
```

#### FormData API

```javascript
// HTML
<form id="myForm">
    <input name="email" value="test@example.com">
    <input name="password" value="secret123">
</form>

// JavaScript
const formData = new FormData(document.getElementById('myForm'));

// Convert to plain object
const data = Object.fromEntries(formData.entries());
// Result: { email: "test@example.com", password: "secret123" }
```

#### Click Event Handlers

Two approaches used in this codebase:

```html
<!-- Inline handler (simple cases) -->
<button onclick="logout()">Logout</button>

<!-- Event listener (complex cases) -->
<script>
document.getElementById('courseModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('courseModal')) {
        closeModal();
    }
});
</script>
```

### DOMContentLoaded Event

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Code here runs after HTML is fully parsed
    updateNav();
    loadCourses();
});
```

**Why use it?**

```
┌─────────────────────────────────────────────────────────────┐
│  Page Load Timeline                                         │
├─────────────────────────────────────────────────────────────┤
│  1. Browser receives HTML                                   │
│  2. Browser parses HTML top-to-bottom                       │
│  3. Browser encounters <script> at bottom                   │
│  4. Script executes                                         │
│  5. ─── DOMContentLoaded fires ───                          │
│  6. Images, CSS, fonts continue loading                     │
│  7. ─── load event fires ───                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Authentication System

### Authentication Flow

```mermaid
flowchart TD
    subgraph Signup["Signup Flow"]
        S1[User fills form] --> S2[POST /user/signup]
        S2 --> S3{Success?}
        S3 -->|Yes| S4[Show success message]
        S4 --> S5[Switch to login mode]
        S3 -->|No| S6[Show error toast]
    end
    
    subgraph Login["Login Flow"]
        L1[User fills form] --> L2[POST /user/signin]
        L2 --> L3{Success?}
        L3 -->|Yes| L4[Receive JWT token]
        L4 --> L5[Store in localStorage]
        L5 --> L6[Redirect to dashboard]
        L3 -->|No| L7[Show error toast]
    end
```

### JWT Token Storage

```javascript
// On successful login
localStorage.setItem('token', res.token);
localStorage.setItem('userType', userType);  // 'user' or 'admin'

// On logout
localStorage.removeItem('token');
localStorage.removeItem('userType');
```

### Route Protection

```javascript
function checkAuth(requiredType = null) {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    // No token = not logged in
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }
    
    // Wrong user type = unauthorized
    if (requiredType && userType !== requiredType) {
        window.location.href = '/';
        return;
    }
}

// Usage in protected pages
document.addEventListener('DOMContentLoaded', () => {
    checkAuth('admin');  // Only admins can access
    loadAdminCourses();
});
```

### Authorization Header

```javascript
// Bearer token format
headers['Authorization'] = `Bearer ${token}`;

// What gets sent:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**The Bearer Token Pattern:**

```
┌─────────────────────────────────────────────────────────────┐
│  HTTP Request to Protected Endpoint                         │
├─────────────────────────────────────────────────────────────┤
│  GET /user/purchases HTTP/1.1                               │
│  Host: api.example.com                                      │
│  Content-Type: application/json                             │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...              │
│                        └──────────────────┘                 │
│                           JWT Token                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. State Management with localStorage

### What is localStorage?

localStorage is a **browser-based key-value store** that persists data across sessions.

```javascript
// Store data
localStorage.setItem('key', 'value');

// Retrieve data
const value = localStorage.getItem('key');

// Remove data
localStorage.removeItem('key');

// Clear all data
localStorage.clear();
```

### State Used in This Application

| Key | Purpose | Example Value |
|-----|---------|---------------|
| `token` | JWT authentication token | `eyJhbGciOiJIUzI1...` |
| `userType` | User role identifier | `"user"` or `"admin"` |

### Dynamic Navigation Based on State

```javascript
function updateNav() {
    const nav = document.getElementById('navLinks');
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token) {
        if (userType === 'admin') {
            nav.innerHTML = `
                <a href="/admin.html" class="btn btn-outline">Dashboard</a>
                <button onclick="logout()" class="btn btn-outline">Logout</button>
            `;
        } else {
            nav.innerHTML = `
                <a href="/dashboard.html" class="btn btn-outline">My Learning</a>
                <button onclick="logout()" class="btn btn-outline">Logout</button>
            `;
        }
    } else {
        nav.innerHTML = `
            <a href="/auth.html" class="btn btn-primary">Login</a>
        `;
    }
}
```

```mermaid
flowchart TD
    A[updateNav called] --> B{Token exists?}
    B -->|No| C[Show Login button]
    B -->|Yes| D{userType?}
    D -->|admin| E[Show Admin Dashboard + Logout]
    D -->|user| F[Show My Learning + Logout]
```

---

## 8. API Integration Patterns

### RESTful API Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/course/preview` | GET | List all courses | No |
| `/user/signup` | POST | Create user account | No |
| `/user/signin` | POST | User login | No |
| `/admin/signup` | POST | Create admin account | No |
| `/admin/signin` | POST | Admin login | No |
| `/user/purchases` | GET | Get purchased courses | Yes (User) |
| `/course/purchase` | POST | Buy a course | Yes (User) |
| `/admin/course/bulk` | GET | Get admin's courses | Yes (Admin) |
| `/admin/course` | POST | Create course | Yes (Admin) |
| `/admin/course/:id` | PUT | Update course | Yes (Admin) |
| `/admin/course/:id` | DELETE | Delete course | Yes (Admin) |

### Request Patterns

#### GET Request (Fetch Data)

```javascript
// Simple GET
const res = await apiCall('/course/preview');

// With authentication
const res = await apiCall('/user/purchases');
```

#### POST Request (Create Data)

```javascript
// Login
const res = await apiCall('/user/signin', 'POST', {
    email: 'user@example.com',
    password: 'password123'
});

// Purchase course
await apiCall('/course/purchase', 'POST', { courseId: '123abc' });
```

#### PUT Request (Update Data)

```javascript
await apiCall(`/admin/course/${id}`, 'PUT', {
    title: 'Updated Title',
    description: 'Updated description',
    price: 99.99,
    imageUrl: 'https://example.com/image.jpg'
});
```

#### DELETE Request

```javascript
await apiCall(`/admin/course/${id}`, 'DELETE');
```

### Error Handling Pattern

```javascript
try {
    const res = await apiCall('/some/endpoint', 'POST', data);
    showToast('Success!', 'success');
    // Handle success...
} catch (err) {
    showToast(err.message, 'error');
    // Handle error...
}
```

---

## 9. UI/UX Patterns

### Toast Notification System

```javascript
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;  // Add show + type class
    
    setTimeout(() => {
        toast.className = 'toast';  // Remove classes after 3s
    }, 3000);
}
```

```css
.toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    transform: translateY(200%);  /* Hidden below viewport */
    opacity: 0;
    transition: all 0.3s;
}

.toast.show {
    transform: translateY(0);     /* Slide up into view */
    opacity: 1;
}

.toast.error { background: var(--danger); }
.toast.success { background: var(--success); }
```

**Animation Timeline:**

```
0s      → showToast() called
0-0.3s  → Toast slides up (CSS transition)
0.3-3s  → Toast visible
3s      → setTimeout fires, classes removed
3-3.3s  → Toast slides down (CSS transition)
```

### Modal Pattern

```html
<!-- Modal backdrop + content -->
<div id="courseModal" style="display: none; position: fixed; ...">
    <div style="background: white; padding: 2rem; ...">
        <!-- Modal content -->
    </div>
</div>
```

```javascript
function openModal(course = null) {
    const modal = document.getElementById('courseModal');
    modal.style.display = 'flex';  // Show modal
    
    if (course) {
        // Edit mode - populate form
        form.title.value = course.title;
        // ...
    } else {
        // Create mode - reset form
        form.reset();
    }
}

function closeModal() {
    document.getElementById('courseModal').style.display = 'none';
}

// Close on backdrop click
document.getElementById('courseModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('courseModal')) {
        closeModal();
    }
});
```

### Loading States

```html
<div id="courseGrid" class="grid">
    <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
        Loading courses...
    </div>
</div>
```

The pattern:
1. Show loading message initially
2. Fetch data from API
3. Replace loading message with actual content

### Empty States

```javascript
if (res.courses.length === 0) {
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
            <h3 style="margin-bottom: 1rem;">No courses yet</h3>
            <p style="color: var(--text-light); margin-bottom: 2rem;">
                Start your learning journey today!
            </p>
            <a href="/" class="btn btn-primary">Browse Courses</a>
        </div>
    `;
    return;
}
```

### Image Error Fallback

```html
<img src="${course.imageUrl}" 
     alt="${course.title}" 
     class="card-img" 
     onerror="this.src='https://placehold.co/600x400?text=Course'">
```

If the image fails to load, the `onerror` handler replaces it with a placeholder.

### Tab Switching UI

```javascript
let userType = 'user';

function switchTab(type) {
    userType = type;
    
    // Update visual state
    document.querySelectorAll('.auth-tab').forEach(t => 
        t.classList.remove('active')
    );
    event.target.classList.add('active');
    
    // Update form
    updateUI();
}
```

```css
.auth-tab {
    flex: 1;
    padding: 1rem;
    text-align: center;
    cursor: pointer;
    color: var(--text-light);
    border-bottom: 2px solid transparent;
}

.auth-tab.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}
```

---

## 10. Best Practices & Takeaways

### Code Organization

```
✅ DO: Separate concerns
   - HTML for structure
   - CSS for presentation
   - JavaScript for behavior

✅ DO: Use shared script file for common functionality
   - API calls in one place
   - Utility functions reusable across pages

✅ DO: Use CSS variables for theming
   - Easy to maintain
   - Consistent design
   - Simple to change colors/spacing
```

### Security Considerations

```
✅ DO: Store tokens in localStorage (for SPAs)
✅ DO: Include Authorization header in API calls
✅ DO: Check auth status on protected pages
✅ DO: Handle 401 responses by logging out

⚠️ REMEMBER: localStorage is accessible via JavaScript
   - Don't store sensitive data beyond tokens
   - Tokens should have expiration times
```

### Performance Tips

```
✅ DO: Place scripts at bottom of body
   - Allows HTML to render first
   - Better perceived performance

✅ DO: Use CSS transitions instead of JavaScript animations
   - GPU accelerated
   - Smoother performance

✅ DO: Use event delegation for dynamic content
   - onclick in template vs addEventListener on parent
```

### UX Best Practices Demonstrated

| Practice | Implementation |
|----------|----------------|
| Loading states | "Loading courses..." placeholder |
| Empty states | Helpful message + action button |
| Error feedback | Toast notifications |
| Success feedback | Toast + redirect |
| Form validation | HTML5 attributes + custom messages |
| Responsive design | CSS Grid auto-fill |
| Visual feedback | Hover effects on cards/buttons |

### Key JavaScript Patterns Summary

```javascript
// 1. Async/Await for API calls
async function fetchData() {
    try {
        const res = await apiCall('/endpoint');
        // Handle success
    } catch (err) {
        // Handle error
    }
}

// 2. Template literals for dynamic HTML
element.innerHTML = items.map(item => `
    <div>${item.name}</div>
`).join('');

// 3. FormData for form handling
const data = Object.fromEntries(new FormData(form).entries());

// 4. Event prevention for SPA behavior
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle submit without page reload
});

// 5. Conditional rendering
element.innerHTML = condition 
    ? '<div>Show this</div>' 
    : '<div>Show that</div>';
```

---

## Quick Reference Card

### CSS Selectors Used

```css
:root { }          /* Document root (for CSS variables) */
* { }              /* Universal selector */
.class { }         /* Class selector */
#id { }            /* ID selector */
element { }        /* Type selector */
.parent .child { } /* Descendant selector */
.class:hover { }   /* Pseudo-class */
.class:focus { }   /* Pseudo-class */
```

### JavaScript Methods Quick Reference

```javascript
// DOM Selection
document.getElementById('id')
document.querySelector('.class')
document.querySelectorAll('.class')

// DOM Manipulation
element.innerHTML = ''
element.textContent = ''
element.style.property = ''
element.classList.add/remove/toggle()

// Events
element.addEventListener('event', handler)
event.preventDefault()
event.target

// Storage
localStorage.setItem('key', 'value')
localStorage.getItem('key')
localStorage.removeItem('key')

// Fetch
fetch(url, { method, headers, body })
response.json()

// Arrays
array.map(item => transform)
array.join('')

// Objects
Object.fromEntries(entries)
JSON.stringify(obj)
JSON.parse(string)
```

---

## Conclusion

This frontend demonstrates a **complete Single Page Application (SPA) pattern** using vanilla HTML, CSS, and JavaScript. Key concepts covered:

1. **Semantic HTML** with proper document structure
2. **CSS Variables** for maintainable styling
3. **Flexbox & Grid** for responsive layouts
4. **Async/Await** for clean asynchronous code
5. **JWT Authentication** with localStorage
6. **RESTful API** integration patterns
7. **User-friendly UI** with toasts, modals, and loading states

This architecture serves as a foundation for understanding how modern frontend frameworks (React, Vue, Angular) work under the hood—they automate many of these patterns but follow the same core principles.

---

*Last updated: Week 8 - Course Selling App Project*

