# Next.js Project Structure Explainer

This document explains every file and folder in your Next.js 16 project (App Router), what they do, and how the structure has evolved from earlier versions.

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Project Overview](#project-overview)
3. [Root Level Files](#root-level-files)
4. [The `app/` Directory (App Router)](#the-app-directory-app-router)
5. [The `public/` Directory](#the-public-directory)
6. [Evolution from Earlier Versions](#evolution-from-earlier-versions)
7. [Quick Reference](#quick-reference)

---

## Installation & Setup

### Creating a New Next.js Project

To create a new Next.js project, run:

```bash
npx create-next-app@latest
```

This will launch an interactive CLI that asks you several questions to customize your project setup.

### Installation Q&A Explained

Here's what each question means and how to answer:

```
✔ What is your project named? … my-app
```
**What it does:** Sets the folder name and `name` field in `package.json`.
**Recommendation:** Use lowercase, hyphen-separated names (e.g., `my-cool-app`, `ecommerce-site`).

---

```
✔ Would you like to use the recommended Next.js defaults? › No, customize settings
```
**What it does:** If you say **Yes**, it skips all other questions and uses Vercel's recommended defaults:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: `@/*`

**Recommendation:** Choose **No** if you're learning, so you understand each option.

---

```
✔ Would you like to use TypeScript? … No / Yes
```
**What it does:** Adds TypeScript support with `.tsx` and `.ts` files instead of `.jsx` and `.js`.
**Recommendation:** **Yes** - TypeScript catches bugs early and provides better IDE support.
**Files affected:** Creates `tsconfig.json`, uses `.tsx` extensions.

---

```
✔ Which linter would you like to use? › ESLint
```
**What it does:** Sets up a code linter to catch errors and enforce best practices.
**Options:**
- **ESLint** - The standard JavaScript/TypeScript linter
- **Biome** - A faster, newer alternative
- **None** - Skip linting (not recommended)

**Recommendation:** **ESLint** - It's the most widely used and has great Next.js integration.
**Files affected:** Creates `eslint.config.mjs`.

---

```
✔ Would you like to use React Compiler? … No / Yes
```
**What it does:** React Compiler (formerly React Forget) automatically optimizes your React components by:
- Auto-memoizing components (like `React.memo`)
- Auto-memoizing callbacks (like `useCallback`)
- Auto-memoizing values (like `useMemo`)

**Recommendation:** **No** for beginners - it's still experimental. **Yes** if you want cutting-edge performance.
**Note:** This is a new feature in React 19+.

---

```
✔ Would you like to use Tailwind CSS? … No / Yes
```
**What it does:** Adds Tailwind CSS, a utility-first CSS framework.
**Recommendation:** **Yes** - Tailwind is extremely popular and makes styling fast.
**Files affected:** Creates `postcss.config.mjs`, modifies `globals.css`.

**With Tailwind:**
```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
```

**Without Tailwind:**
```css
/* styles.css */
.btn {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn:hover {
  background-color: #1d4ed8;
}
```

---

```
✔ Would you like your code inside a `src/` directory? … No / Yes
```
**What it does:** Determines where your `app/` folder lives.

**Without `src/` (default):**
```
my-app/
├── app/
├── public/
├── package.json
└── ...
```

**With `src/`:**
```
my-app/
├── src/
│   └── app/
├── public/
├── package.json
└── ...
```

**Recommendation:** **No** for small projects, **Yes** for larger projects where you want cleaner separation.

---

```
✔ Would you like to use App Router? (recommended) … No / Yes
```
**What it does:** Chooses between the new **App Router** or the legacy **Pages Router**.

| Feature | App Router (Yes) | Pages Router (No) |
|---------|------------------|-------------------|
| Folder | `app/` | `pages/` |
| Default | Server Components | Client Components |
| Layouts | Nested `layout.tsx` | `_app.tsx` |
| Data Fetching | `async` components | `getServerSideProps` |
| Status | Current (recommended) | Legacy (stable) |

**Recommendation:** **Yes** - App Router is the future of Next.js.

---

```
✔ Would you like to customize the import alias (`@/*` by default)? … No / Yes
```
**What it does:** Sets up path aliases for cleaner imports.

**With `@/*` alias:**
```tsx
import Header from '@/components/Header';
import { formatDate } from '@/lib/utils';
```

**Without alias:**
```tsx
import Header from '../../../components/Header';
import { formatDate } from '../../../lib/utils';
```

**Recommendation:** **No** - The default `@/*` works great. Only customize if you have specific needs.
**Files affected:** `tsconfig.json` paths configuration.

---

### After Installation

Once you answer all questions, the CLI will:

1. Create the project folder
2. Initialize `package.json`
3. Install dependencies (`next`, `react`, `react-dom`, etc.)
4. Set up the chosen configuration
5. Initialize Git repository

```
Creating a new Next.js app in /path/to/my-app.

Using npm.

Initializing project with template: app-tw   # app = App Router, tw = Tailwind
```

Then run:

```bash
cd my-app
npm run dev
```

Open http://localhost:3000 to see your app!

---

## Project Overview

```
my-app/
├── app/                    # App Router (routes, layouts, pages)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/                 # Static assets (images, fonts, etc.)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## Root Level Files

### 📄 `package.json`

**What it is:** The heart of any Node.js project - defines dependencies, scripts, and project metadata.

**What's in your file:**

```json
{
  "scripts": {
    "dev": "next dev",      // Start development server (localhost:3000)
    "build": "next build",  // Create production build
    "start": "next start",  // Start production server
    "lint": "eslint"        // Run ESLint to check code quality
  },
  "dependencies": {
    "next": "16.1.3",       // Next.js framework
    "react": "19.2.3",      // React library
    "react-dom": "19.2.3"   // React DOM rendering
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",  // Tailwind CSS v4
    "typescript": "^5",           // TypeScript compiler
    "eslint": "^9",               // Code linter
    // ... type definitions
  }
}
```

**Common commands you'll run:**
- `npm run dev` - Start developing
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Check for code issues

---

### 📄 `next.config.ts`

**What it is:** Next.js configuration file - customize how Next.js behaves.

**What's in your file:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

**What you can configure here:**
- Image optimization settings (allowed domains, formats)
- Environment variables
- Redirects and rewrites
- Custom headers
- Webpack customization
- Internationalization (i18n)
- Output mode (standalone, export)

**Example configurations:**

```typescript
const nextConfig: NextConfig = {
  // Allow images from external domains
  images: {
    domains: ['example.com', 'cdn.mysite.com'],
  },
  
  // Enable strict mode for React
  reactStrictMode: true,
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ]
  },
};
```

**Evolution:** Earlier versions used `next.config.js` (JavaScript). Now TypeScript is supported natively with `next.config.ts`.

---

### 📄 `tsconfig.json`

**What it is:** TypeScript configuration - tells TypeScript how to compile your code.

**Key settings explained:**

```json
{
  "compilerOptions": {
    "target": "ES2017",           // JavaScript version to compile to
    "lib": ["dom", "esnext"],     // APIs available (browser + modern JS)
    "strict": true,               // Enable strict type checking
    "noEmit": true,               // Don't output files (Next.js handles this)
    "jsx": "react-jsx",           // JSX transformation mode
    "moduleResolution": "bundler",// How to resolve imports
    "paths": {
      "@/*": ["./*"]              // Path alias: @/components = ./components
    }
  }
}
```

**Path Aliases:** The `@/*` alias lets you write cleaner imports:

```typescript
// Instead of:
import Header from '../../../components/Header';

// You can write:
import Header from '@/components/Header';
```

---

### 📄 `postcss.config.mjs`

**What it is:** PostCSS configuration - CSS processing pipeline.

**What's in your file:**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // Tailwind CSS v4 plugin
  },
};
export default config;
```

**What it does:** 
- Processes your CSS through Tailwind CSS v4
- Transforms utility classes into actual CSS
- Handles CSS optimization

**Note:** Tailwind v4 uses `@tailwindcss/postcss` instead of the old `tailwindcss` plugin.

---

### 📄 `eslint.config.mjs`

**What it is:** ESLint configuration - code quality and style rules.

**What's in your file:**

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,    // Next.js performance rules
  ...nextTs,        // TypeScript-specific rules
  globalIgnores([   // Files to ignore
    ".next/**",
    "out/**",
    "build/**",
  ]),
]);
```

**What it checks:**
- React best practices
- Next.js specific patterns (Image, Link components)
- Core Web Vitals (performance)
- TypeScript errors

**Note:** This uses ESLint v9's new flat config format. Earlier versions used `.eslintrc.json`.

---

### 📄 `.gitignore`

**What it is:** Tells Git which files/folders to ignore.

**Key entries:**

```gitignore
/node_modules     # Dependencies (reinstallable)
/.next/           # Build cache (regeneratable)
/out/             # Static export output
.env*             # Environment variables (secrets!)
*.tsbuildinfo     # TypeScript cache
next-env.d.ts     # Auto-generated types
```

**Why ignore these?**
- `node_modules/` - Can be recreated with `npm install`
- `.next/` - Build output, recreated on every build
- `.env*` - Contains secrets (API keys, database URLs)

---

## The `app/` Directory (App Router)

This is where the magic happens! The `app/` directory uses **file-system based routing**.

### 📄 `app/layout.tsx` - Root Layout

**What it is:** The root layout that wraps ALL pages in your app.

**What's in your file:**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Font configuration (optimized by Next.js)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Page metadata (SEO)
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

// The actual layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**Key concepts:**

1. **`children` prop:** This is where your page content gets injected
2. **`metadata` export:** Sets `<title>` and `<meta>` tags for SEO
3. **Font optimization:** `next/font/google` auto-optimizes fonts
4. **`globals.css` import:** Global styles applied everywhere

**What you typically add here:**
- Navigation/Header
- Footer
- Providers (Theme, Auth, State management)
- Analytics scripts

---

### Understanding Layouts in Depth

Layouts are one of the most powerful features in Next.js App Router. Let's dive deep!

#### What is a Layout?

A **layout** is a UI component that wraps pages and other layouts. It:
- Persists across page navigations (doesn't re-render)
- Maintains state between routes
- Shares UI elements like headers, sidebars, footers

#### The `children` Prop

Every layout receives a `children` prop - this is where the page content (or nested layout) gets injected:

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>I'm always visible!</header>
      {children}  {/* ← Page content goes here */}
      <footer>Me too!</footer>
    </div>
  );
}
```

#### Layout Hierarchy & Nesting

Layouts automatically nest based on folder structure:

```
app/
├── layout.tsx        ← Root Layout (wraps everything)
├── page.tsx          ← Home page (/)
└── dashboard/
    ├── layout.tsx    ← Dashboard Layout (wraps dashboard pages)
    ├── page.tsx      ← Dashboard home (/dashboard)
    └── settings/
        └── page.tsx  ← Settings (/dashboard/settings)
```

**How they nest:**

```
┌─────────────────────────────────────────┐
│ Root Layout (app/layout.tsx)            │
│ ┌─────────────────────────────────────┐ │
│ │ Dashboard Layout                    │ │
│ │ (app/dashboard/layout.tsx)          │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Page Content                    │ │ │
│ │ │ (app/dashboard/settings/page)   │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

When you visit `/dashboard/settings`:
1. Root Layout renders first (provides `<html>`, `<body>`)
2. Dashboard Layout renders inside (provides sidebar, dashboard nav)
3. Settings Page renders inside (the actual content)

#### Practical Example: Dashboard with Sidebar

```
app/
├── layout.tsx              ← Has <html>, <body>, global nav
├── page.tsx                ← Home page
└── dashboard/
    ├── layout.tsx          ← Has sidebar, only for /dashboard/*
    ├── page.tsx            ← /dashboard
    ├── analytics/
    │   └── page.tsx        ← /dashboard/analytics
    └── settings/
        └── page.tsx        ← /dashboard/settings
```

**Root Layout** (`app/layout.tsx`):
```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav>Global Navigation</nav>
        {children}
      </body>
    </html>
  );
}
```

**Dashboard Layout** (`app/dashboard/layout.tsx`):
```tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64">
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/analytics">Analytics</a>
          <a href="/dashboard/settings">Settings</a>
        </nav>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

**Result:** The sidebar only appears on `/dashboard/*` routes, but NOT on the home page!

#### Layout vs Template

| Feature | Layout | Template |
|---------|--------|----------|
| File | `layout.tsx` | `template.tsx` |
| Re-renders on navigation | No (preserves state) | Yes (fresh instance) |
| Use case | Persistent UI | Animations, fresh state |

**When to use Template:**
```tsx
// app/dashboard/template.tsx
// Re-renders on every navigation - good for:
// - Page transition animations
// - Features that need fresh state each time
// - Analytics tracking on each page view

export default function Template({ children }) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}
```

#### Layout-Specific Metadata

Each layout can export its own metadata:

```tsx
// app/dashboard/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Dashboard",  // %s = page title
    default: "Dashboard",
  },
};

export default function DashboardLayout({ children }) {
  return <div>{children}</div>;
}
```

```tsx
// app/dashboard/settings/page.tsx
export const metadata: Metadata = {
  title: "Settings",  // Results in "Settings | Dashboard"
};
```

#### Common Layout Patterns

**1. Authentication Layout:**
```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  );
}
```

**2. Marketing vs App Layout:**
```
app/
├── (marketing)/           ← Route group (no URL impact)
│   ├── layout.tsx         ← Marketing layout (big header, CTA)
│   ├── page.tsx           ← / (home)
│   ├── pricing/page.tsx   ← /pricing
│   └── about/page.tsx     ← /about
└── (app)/                 ← Route group
    ├── layout.tsx         ← App layout (minimal, functional)
    └── dashboard/
        └── page.tsx       ← /dashboard
```

**3. Conditional Layout Content:**
```tsx
// app/dashboard/layout.tsx
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const session = await auth();
  
  return (
    <div>
      <header>
        <span>Welcome, {session?.user?.name}</span>
      </header>
      {children}
    </div>
  );
}
```

#### Route Groups: `(folderName)`

Folders wrapped in parentheses create **route groups** - they organize files without affecting the URL:

```
app/
├── (marketing)/
│   ├── layout.tsx    ← Only for marketing pages
│   └── about/
│       └── page.tsx  ← URL: /about (not /marketing/about!)
└── (dashboard)/
    ├── layout.tsx    ← Only for dashboard pages  
    └── settings/
        └── page.tsx  ← URL: /settings (not /dashboard/settings!)
```

#### Key Rules for Layouts

1. **Root layout is required** - Must have `app/layout.tsx` with `<html>` and `<body>`
2. **Layouts don't re-render** - They persist across navigations
3. **Layouts can be async** - Fetch data directly (Server Components)
4. **Layouts can't access pathname** - Use `usePathname()` in a Client Component child
5. **Layouts wrap in order** - Parent → Child → Page

---

### 📄 `app/page.tsx` - Home Page

**What it is:** The page component for the `/` route (home page).

**Naming convention:**
- `page.tsx` = The actual page content
- The folder path = The URL route

| File Path | URL Route |
|-----------|-----------|
| `app/page.tsx` | `/` |
| `app/about/page.tsx` | `/about` |
| `app/blog/[slug]/page.tsx` | `/blog/hello-world` |
| `app/dashboard/settings/page.tsx` | `/dashboard/settings` |

**What's in your file:**

```tsx
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <main>
        <Image
          src="/next.svg"    // From public/ folder
          alt="Next.js logo"
          width={100}
          height={20}
          priority           // Preload this image
        />
        {/* ... rest of content */}
      </main>
    </div>
  );
}
```

**Key concepts:**

1. **`next/image`:** Optimized image component (auto-resize, lazy load, WebP)
2. **Default export:** Every page must have a default export function
3. **Server Component:** By default, this runs on the server (not client)

---

### 📄 `app/globals.css` - Global Styles

**What it is:** CSS that applies to your entire application.

**What's in your file:**

```css
@import "tailwindcss";  /* Tailwind v4 syntax */

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

**Key concepts:**

1. **`@import "tailwindcss"`:** Tailwind v4 way to include Tailwind
2. **CSS Variables:** Define reusable values (`--background`, `--foreground`)
3. **`@theme inline`:** Tailwind v4 syntax to expose CSS vars as Tailwind utilities
4. **Dark mode:** Auto-detects system preference

**Earlier versions used:**

```css
/* Tailwind v3 syntax */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 📄 `app/favicon.ico` - Browser Tab Icon

**What it is:** The small icon shown in browser tabs.

**Where it lives:** In App Router, `favicon.ico` goes directly in the `app/` folder and Next.js automatically serves it.

---

## The `public/` Directory

**What it is:** Static files served as-is at the root URL.

| File | Accessible at |
|------|---------------|
| `public/next.svg` | `/next.svg` |
| `public/vercel.svg` | `/vercel.svg` |
| `public/images/hero.png` | `/images/hero.png` |

**What to put here:**
- Images (logos, icons)
- Fonts (if not using `next/font`)
- `robots.txt`
- `sitemap.xml`
- Any static file

**Important:** Files in `public/` are NOT processed by Webpack. They're served directly.

---

## Evolution from Earlier Versions

### Pages Router vs App Router

Next.js had a major architectural shift from **Pages Router** to **App Router** in Next.js 13.

#### Old Structure (Pages Router - Next.js 12 and before):

```
my-app/
├── pages/                  # Pages lived here
│   ├── _app.tsx           # Custom App (global layout)
│   ├── _document.tsx      # Custom Document (HTML structure)
│   ├── index.tsx          # Home page (/)
│   ├── about.tsx          # About page (/about)
│   └── api/               # API routes
│       └── hello.ts       # /api/hello
├── public/
├── styles/
│   ├── globals.css
│   └── Home.module.css    # CSS Modules
└── next.config.js         # JavaScript config
```

#### New Structure (App Router - Next.js 13+):

```
my-app/
├── app/                    # App Router
│   ├── layout.tsx         # Root layout (replaces _app + _document)
│   ├── page.tsx           # Home page (/)
│   ├── about/
│   │   └── page.tsx       # About page (/about)
│   ├── globals.css
│   └── api/               # API routes (optional)
│       └── hello/
│           └── route.ts   # /api/hello
├── public/
└── next.config.ts         # TypeScript config
```

### Key Differences

| Feature | Pages Router (Old) | App Router (New) |
|---------|-------------------|------------------|
| Global Layout | `pages/_app.tsx` | `app/layout.tsx` |
| HTML Document | `pages/_document.tsx` | Part of `layout.tsx` |
| Page File | `pages/about.tsx` | `app/about/page.tsx` |
| API Routes | `pages/api/hello.ts` | `app/api/hello/route.ts` |
| Data Fetching | `getServerSideProps`, `getStaticProps` | `async` components, `fetch()` |
| Default | Client Components | Server Components |
| Config File | `next.config.js` | `next.config.ts` |
| ESLint | `.eslintrc.json` | `eslint.config.mjs` |
| Tailwind | v3 with `@tailwind` directives | v4 with `@import "tailwindcss"` |

### Data Fetching Evolution

#### Old Way (Pages Router):

```tsx
// pages/posts.tsx
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  
  return {
    props: { posts },
  };
}

export default function Posts({ posts }) {
  return <div>{/* render posts */}</div>;
}
```

#### New Way (App Router):

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function Posts() {
  const posts = await getPosts();  // Direct async/await!
  
  return <div>{/* render posts */}</div>;
}
```

### Server Components vs Client Components

**New in App Router:** Components are **Server Components** by default.

```tsx
// Server Component (default) - runs on server
export default function ServerComponent() {
  // Can't use useState, useEffect, onClick, etc.
  // CAN directly access database, file system, etc.
  return <div>I render on the server!</div>;
}
```

```tsx
// Client Component - add "use client" directive
"use client";

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

---

## Quick Reference

### Creating New Pages

```
app/
├── page.tsx              → /
├── about/page.tsx        → /about
├── blog/page.tsx         → /blog
├── blog/[slug]/page.tsx  → /blog/any-slug (dynamic)
└── (marketing)/          → Route group (no URL impact)
    ├── pricing/page.tsx  → /pricing
    └── features/page.tsx → /features
```

### Special Files in `app/`

| File | Purpose |
|------|---------|
| `page.tsx` | Page content (required for route) |
| `layout.tsx` | Shared layout (wraps children) |
| `loading.tsx` | Loading UI (Suspense fallback) |
| `error.tsx` | Error UI (Error boundary) |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint |
| `template.tsx` | Re-renders on navigation |

### Common Commands

```bash
npm run dev      # Start development (http://localhost:3000)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Check code quality
```

### Useful Imports

```tsx
// Next.js components
import Image from 'next/image';       // Optimized images
import Link from 'next/link';         // Client-side navigation
import { redirect } from 'next/navigation';  // Redirect
import { notFound } from 'next/navigation';  // 404

// Metadata
import type { Metadata } from 'next';

// Fonts
import { Inter } from 'next/font/google';
```

---

## Todo App - Learning Example

We've included a simple Todo app to demonstrate Next.js concepts in practice. Run `npm run dev` and visit http://localhost:3000/todos to see it in action!

### File Structure

```
app/todos/
├── page.tsx        # Server Component - the main page
├── actions.ts      # Server Actions - backend logic
├── TodoForm.tsx    # Client Component - input form
└── TodoItem.tsx    # Client Component - individual todo
```

### Understanding the Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   page.tsx (HTML)                        │   │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐ │   │
│  │  │   TodoForm.tsx  │    │      TodoItem.tsx (×n)      │ │   │
│  │  │   (JavaScript)  │    │      (JavaScript)           │ │   │
│  │  │   - useState    │    │      - useTransition        │ │   │
│  │  │   - useTransition│   │      - onClick handlers     │ │   │
│  │  └────────┬────────┘    └──────────────┬──────────────┘ │   │
│  └───────────┼────────────────────────────┼────────────────┘   │
└──────────────┼────────────────────────────┼────────────────────┘
               │ Server Action Call          │ Server Action Call
               ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    actions.ts                            │   │
│  │  - addTodo(formData)                                     │   │
│  │  - toggleTodo(id)                                        │   │
│  │  - deleteTodo(id)                                        │   │
│  │  - getTodos()                                            │   │
│  │                                                          │   │
│  │  let todos = [...] ← In-memory "database"               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Server Component: `page.tsx`

```tsx
// This is a SERVER COMPONENT (the default)
// Notice: async function, no "use client"

export default async function TodosPage() {
  // Direct data fetching - no useEffect needed!
  const todos = await getTodos();

  return (
    <div>
      {/* Client Components can be used inside Server Components */}
      <TodoForm />
      
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
```

**Key Points:**
- Runs ONLY on the server
- Can be an `async` function
- Can directly fetch data, access databases
- Cannot use hooks (useState, useEffect)
- Cannot have event handlers (onClick, onChange)
- Output: Pure HTML sent to browser

### 2. Server Actions: `actions.ts`

```tsx
"use server";  // This file contains server-only code

import { revalidatePath } from "next/cache";

// In-memory database (resets on server restart)
let todos: Todo[] = [...];

// Server Action - can be called from client!
export async function addTodo(formData: FormData) {
  const text = formData.get("text") as string;
  
  todos.push({
    id: Date.now().toString(),
    text,
    completed: false,
  });

  // Tell Next.js to re-fetch and re-render the page
  revalidatePath("/todos");
}

export async function toggleTodo(id: string) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  revalidatePath("/todos");
}

export async function deleteTodo(id: string) {
  todos = todos.filter((t) => t.id !== id);
  revalidatePath("/todos");
}
```

**Key Points:**
- `"use server"` marks this as server-only code
- These functions run on the server but can be called from the browser
- Like API endpoints, but with type safety and simpler syntax
- `revalidatePath()` refreshes the UI after data changes
- The in-memory array is our "database" (real apps use Prisma, etc.)

### 3. Client Component: `TodoForm.tsx`

```tsx
"use client";  // This component runs in the browser

import { useRef, useTransition } from "react";
import { addTodo } from "./actions";

export function TodoForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await addTodo(formData);  // Calls the Server Action!
      formRef.current?.reset();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit}>
      <input name="text" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
```

**Key Points:**
- `"use client"` makes this run in the browser
- Can use React hooks (useState, useRef, useTransition)
- Can have event handlers
- `useTransition` provides loading state while server action runs
- `action={handleSubmit}` - new way to handle forms in Next.js

### 4. Client Component: `TodoItem.tsx`

```tsx
"use client";

import { useTransition } from "react";
import { toggleTodo, deleteTodo } from "./actions";

export function TodoItem({ todo }: { todo: Todo }) {
  const [isToggling, startToggle] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  return (
    <div>
      <button
        onClick={() => startToggle(() => toggleTodo(todo.id))}
        disabled={isToggling}
      >
        {todo.completed ? "✓" : "○"}
      </button>
      
      <span>{todo.text}</span>
      
      <button
        onClick={() => startDelete(() => deleteTodo(todo.id))}
        disabled={isDeleting}
      >
        Delete
      </button>
    </div>
  );
}
```

**Key Points:**
- Receives `todo` as prop from Server Component
- Multiple `useTransition` hooks for independent loading states
- Server Actions called directly from onClick handlers

### The Data Flow

```
1. User visits /todos
   ↓
2. Server renders page.tsx
   - Calls getTodos()
   - Returns HTML with todo list
   ↓
3. Browser displays HTML
   - Hydrates Client Components (TodoForm, TodoItem)
   - Now interactive!
   ↓
4. User adds a todo
   - TodoForm calls addTodo() Server Action
   - Server updates in-memory array
   - revalidatePath("/todos") triggers re-render
   ↓
5. Server re-renders page.tsx
   - Fresh data from getTodos()
   - Sends updated HTML
   ↓
6. Browser shows new todo!
```

### Why This Pattern?

| Pattern | Benefit |
|---------|---------|
| Server Components | Fast initial load, SEO, smaller JS bundle |
| Client Components | Interactivity, real-time updates |
| Server Actions | Type-safe mutations, no API boilerplate |
| `useTransition` | Smooth loading states, non-blocking UI |
| `revalidatePath` | Automatic UI refresh after mutations |

### Comparison: Old vs New

**Old Way (Pages Router + API Routes):**

```tsx
// pages/api/todos.ts - API endpoint
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Add todo
    res.json({ success: true });
  }
}

// pages/todos.tsx - Page with useEffect
export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        setTodos(data);
        setLoading(false);
      });
  }, []);

  const addTodo = async (text) => {
    setLoading(true);
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    // Refetch...
  };
}
```

**New Way (App Router + Server Actions):**

```tsx
// app/todos/actions.ts
"use server";
export async function addTodo(formData: FormData) {
  // Direct database access
  revalidatePath("/todos");
}

// app/todos/page.tsx
export default async function Todos() {
  const todos = await getTodos();  // So clean!
  return <TodoList todos={todos} />;
}
```

### Try It Yourself!

1. Run `npm run dev`
2. Visit http://localhost:3000/todos
3. Add, complete, and delete todos
4. Open DevTools Network tab - watch the server actions
5. Try modifying the code:
   - Add a "Clear completed" button
   - Add todo editing
   - Add due dates

---

## Next Steps

Now that you understand the structure, try:

1. **Explore the Todo App:** Run it and read the code comments
2. **Add a feature:** Add a "Clear completed" button using `clearCompleted` action
3. **Create a new page:** Add `app/about/page.tsx`
4. **Connect a real database:** Replace the in-memory array with Prisma
5. **Add authentication:** Use NextAuth.js

Happy coding!
