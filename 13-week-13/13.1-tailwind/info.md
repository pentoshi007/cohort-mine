# Tailwind CSS v4: The New CSS-First Approach

Since Tailwind v4 moved away from the JavaScript config (`tailwind.config.js`), we now use **CSS-native** features like `@layer` and `@theme` directives. Think of these as "buckets" for your CSS that tell Tailwind exactly where and when to inject your styles into the final stylesheet.

The main reason we use these is to control **CSS Specificity** (which style wins when there's a conflict).

---

## Setup Guide: v3 vs v4

### Tailwind v3 Setup (The Old Way)

Setting up Tailwind v3 required multiple steps and config files:

#### Step 1: Create a Vite + React Project

```bash
npm create vite@latest my-app -- --template react
cd my-app
```

#### Step 2: Install Tailwind and its Dependencies

```bash
npm install -D tailwindcss postcss autoprefixer
```

#### Step 3: Initialize Tailwind Config

```bash
npx tailwindcss init -p
```

This creates TWO config files:

- `tailwind.config.js` — Tailwind configuration
- `postcss.config.js` — PostCSS configuration

#### Step 4: Configure Template Paths

Edit `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### Step 5: Add Tailwind Directives to CSS

Edit `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Step 6: Import CSS in Your App

Make sure `src/main.jsx` imports the CSS:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Step 7: Run Dev Server

```bash
npm run dev
```

#### v3 File Structure

```
my-app/
├── postcss.config.js      ← Required for PostCSS
├── tailwind.config.js     ← All customization here (JS)
├── src/
│   ├── index.css          ← @tailwind directives
│   ├── main.jsx
│   └── App.jsx
└── package.json
```

---

### Tailwind v4 Setup (The New Way) ✨

Tailwind v4 is MUCH simpler — no config files needed!

#### Step 1: Create a Vite + React Project

```bash
npm create vite@latest my-app -- --template react
cd my-app
```

#### Step 2: Install Tailwind v4 (Single Package!)

```bash
npm install tailwindcss @tailwindcss/vite
```

That's it! No `postcss`, no `autoprefixer` needed separately.

#### Step 3: Configure Vite Plugin

Edit `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

#### Step 4: Import Tailwind in CSS

Edit `src/index.css`:

```css
@import "tailwindcss";
```

Just ONE line! No more `@tailwind base/components/utilities`.

#### Step 5: Import CSS in Your App

Same as v3, make sure `src/main.jsx` imports the CSS:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Step 6: Run Dev Server

```bash
npm run dev
```

#### v4 File Structure

```
my-app/
├── vite.config.js         ← Just add the plugin here
├── src/
│   ├── index.css          ← @import "tailwindcss" + @theme + @layer
│   ├── main.jsx
│   └── App.jsx
└── package.json
```

**No `tailwind.config.js` needed!** All customization happens in your CSS file.

---

### Setup Comparison Table

| Step                   | Tailwind v3                                             | Tailwind v4                         |
| ---------------------- | ------------------------------------------------------- | ----------------------------------- |
| Install                | `npm i -D tailwindcss postcss autoprefixer`             | `npm i tailwindcss @tailwindcss/vite` |
| Config Files           | `tailwind.config.js` + `postcss.config.js`              | None needed!                        |
| Initialize             | `npx tailwindcss init -p`                               | Not needed                          |
| CSS Import             | `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";`            |
| Vite Plugin            | Uses PostCSS                                            | `@tailwindcss/vite` plugin          |
| Customization Location | `tailwind.config.js` (JavaScript)                       | `index.css` using `@theme`          |

---

## The 3 Big Buckets: Base, Components, and Utilities

In Tailwind 4, the order of the "cascade" is strictly managed:

```
utilities > components > base
```

Styles in the `utilities` layer will **always** override styles in the `components` layer, which in turn override the `base` layer.

---

### 1. `@layer base` — The Foundation

This is for global resets and raw HTML tags. If you want every `<h1>` to be bold by default or set a specific background color on the `<body>`, it goes here.

**Purpose:** Setting "global" defaults.

```css
@layer base {
  h1 {
    @apply text-3xl font-bold;
  }
  body {
    @apply bg-slate-50 text-slate-900;
  }
}
```

---

### 2. `@layer components` — Your Custom Classes

When you have a complex set of utilities that you find yourself repeating everywhere, you bundle them into a component class.

**Purpose:** Creating reusable UI patterns (buttons, cards, inputs).

**Why it's cool:** Because it's in the `components` layer, you can still override it in your HTML using a utility class like:

```html
<img class="image-gallary border-red-500" />
```

The `border-red-500` utility wins because utilities sit **higher** in the cascade than components.

```css
@layer components {
  .image-gallary {
    @apply w-80 rounded border-2 transition-all;
  }

  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

---

### 3. `@layer utilities` — The Quick Fixes

This is for adding your own single-purpose helper classes that don't exist in Tailwind by default.

**Purpose:** Custom one-off helpers (e.g., a specific text-shadow or a unique animation).

```css
@layer utilities {
  .text-neon {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de;
  }

  .clip-diagonal {
    clip-path: polygon(0 0, 100% 0, 100% 90%, 0% 100%);
  }
}
```

---

## What is `@theme`?

You might be wondering: _"If I can do everything in layers, why do I need `@theme`?"_

| Directive | Purpose                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `@theme`  | For **Tokens** (Variables) — Define the _values_ (colors, spacing, fonts) that Tailwind uses to generate its utility classes |
| `@layer`  | For **CSS Rules** — Write actual CSS (or `@apply` logic) using those tokens                                                  |

```css
@theme {
  --color-brand-blue: #007bff;
  --color-brand-green: #28a745;
  --font-display: "Poppins", sans-serif;
}
```

Now Tailwind will auto-generate utilities like `text-brand-blue`, `bg-brand-green`, etc.

---

## Real-World Example: Complete `index.css`

Here's how you'd use all these features together in your project:

```css
@import "tailwindcss";

/* ================================
   1. DEFINE YOUR TOKENS FIRST
   ================================ */
@theme {
  --color-brand-blue: #007bff;
  --color-brand-dark: #1a1a2e;
  --font-body: "Inter", sans-serif;
}

/* ================================
   2. SET GLOBAL DEFAULTS
   ================================ */
@layer base {
  body {
    font-family: var(--font-body);
    @apply bg-slate-50 text-slate-900;
  }

  h1 {
    @apply text-3xl font-bold;
  }

  a {
    @apply text-brand-blue hover:underline;
  }
}

/* ================================
   3. BUILD REUSABLE COMPONENTS
   ================================ */
@layer components {
  .image-gallary {
    @apply w-80 rounded border-2 transition-all;
    border-color: var(--color-brand-blue);
  }

  .card {
    @apply p-6 bg-white rounded-lg shadow-md;
  }

  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply btn bg-brand-blue text-white hover:bg-blue-600;
  }
}

/* ================================
   4. ADD CUSTOM UTILITIES
   ================================ */
@layer utilities {
  .text-neon {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de;
  }

  .clip-diagonal {
    clip-path: polygon(0 0, 100% 0, 100% 90%, 0% 100%);
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

---

## Tailwind v3 vs v4: Key Differences

| Feature       | Tailwind v3                           | Tailwind v4                    |
| ------------- | ------------------------------------- | ------------------------------ |
| Configuration | `tailwind.config.js` (JavaScript)     | CSS-native with `@theme`       |
| Custom Colors | `theme.extend.colors` in JS           | `@theme { --color-*: value; }` |
| Custom Fonts  | `theme.extend.fontFamily` in JS       | `@theme { --font-*: value; }`  |
| Import        | `@tailwind base/components/utilities` | `@import "tailwindcss"`        |
| Layers        | Same `@layer` syntax                  | Same `@layer` syntax           |

### v3 Style (Old Way)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#007bff",
        },
      },
    },
  },
};
```

### v4 Style (New Way)

```css
/* index.css */
@theme {
  --color-brand-blue: #007bff;
}
```

---

## Common Customization Tasks: v3 vs v4

This section covers the most common things you'll do when customizing Tailwind — and how to do them in both versions.

---

### 1. Adding Custom Colors with Shades

This is exactly what's happening in the config screenshot — extending the color palette with custom shades.

#### v3 Way (tailwind.config.js)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          200: "#8094ad",
          500: "#19406a",
          700: "#002b5b",
        },
        green: {
          400: "#36c6c0",
        },
      },
    },
  },
  plugins: [],
};
```

**Usage in JSX:**

```jsx
<div className="bg-blue-500 text-green-400">Hello</div>
```

#### v4 Way (index.css)

```css
@import "tailwindcss";

@theme {
  --color-blue-200: #8094ad;
  --color-blue-500: #19406a;
  --color-blue-700: #002b5b;
  --color-green-400: #36c6c0;
}
```

**Usage in JSX (same as v3!):**

```jsx
<div className="bg-blue-500 text-green-400">Hello</div>
```

---

### 2. Creating a Brand Color Palette

When you want completely new color names (not overriding existing ones).

#### v3 Way

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#67e8f9",
          DEFAULT: "#06b6d4",
          dark: "#0891b2",
        },
        secondary: {
          light: "#fda4af",
          DEFAULT: "#f43f5e",
          dark: "#be123c",
        },
      },
    },
  },
};
```

**Usage:**

```jsx
<button className="bg-primary hover:bg-primary-dark">Click me</button>
```

#### v4 Way

```css
@import "tailwindcss";

@theme {
  --color-primary-light: #67e8f9;
  --color-primary: #06b6d4;
  --color-primary-dark: #0891b2;

  --color-secondary-light: #fda4af;
  --color-secondary: #f43f5e;
  --color-secondary-dark: #be123c;
}
```

**Usage (same!):**

```jsx
<button className="bg-primary hover:bg-primary-dark">Click me</button>
```

---

### 3. Custom Fonts

#### v3 Way

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Georgia", "serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
};
```

**Usage:**

```jsx
<h1 className="font-display">Welcome</h1>
<p className="font-sans">Body text</p>
<code className="font-mono">const x = 1;</code>
```

#### v4 Way

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Poppins", Georgia, serif;
  --font-mono: "Fira Code", monospace;
}
```

**Usage (same!):**

```jsx
<h1 className="font-display">Welcome</h1>
<p className="font-sans">Body text</p>
<code className="font-mono">const x = 1;</code>
```

---

### 4. Custom Spacing Values

#### v3 Way

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      spacing: {
        18: "4.5rem", // 72px
        88: "22rem", // 352px
        128: "32rem", // 512px
      },
    },
  },
};
```

**Usage:**

```jsx
<div className="p-18 w-88 h-128">Large box</div>
```

#### v4 Way

```css
@import "tailwindcss";

@theme {
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  --spacing-128: 32rem;
}
```

**Usage (same!):**

```jsx
<div className="p-18 w-88 h-128">Large box</div>
```

---

### 5. Custom Border Radius

#### v3 Way

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
};
```

#### v4 Way

```css
@theme {
  --radius-4xl: 2rem;
  --radius-5xl: 2.5rem;
}
```

**Usage:**

```jsx
<div className="rounded-4xl">Super rounded!</div>
```

---

### 6. Custom Box Shadows

#### v3 Way

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 20px rgba(0, 255, 255, 0.5)",
        "inner-lg": "inset 0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
};
```

#### v4 Way

```css
@theme {
  --shadow-glow: 0 0 20px rgba(0, 255, 255, 0.5);
  --shadow-inner-lg: inset 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**Usage:**

```jsx
<div className="shadow-glow hover:shadow-inner-lg">Glowing box</div>
```

---

### 7. Custom Animations & Keyframes

#### v3 Way

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
};
```

#### v4 Way

```css
@import "tailwindcss";

@theme {
  --animate-spin-slow: spin 3s linear infinite;
  --animate-wiggle: wiggle 1s ease-in-out infinite;
  --animate-fade-in: fadeIn 0.5s ease-out;
}

/* Keyframes are still defined as regular CSS */
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
```

**Usage:**

```jsx
<div className="animate-wiggle">I'm wiggling!</div>
<div className="animate-fade-in">I fade in!</div>
```

---

### 8. Custom Breakpoints

#### v3 Way

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      screens: {
        xs: "475px",
        "3xl": "1920px",
      },
    },
  },
};
```

#### v4 Way

```css
@theme {
  --breakpoint-xs: 475px;
  --breakpoint-3xl: 1920px;
}
```

**Usage:**

```jsx
<div className="hidden xs:block 3xl:text-4xl">Responsive content</div>
```

---

### 9. Complete Design System Example

Here's how a full design system looks in v4:

```css
@import "tailwindcss";

/* ========================================
   DESIGN TOKENS
   ======================================== */
@theme {
  /* Colors */
  --color-blue-200: #8094ad;
  --color-blue-500: #19406a;
  --color-blue-700: #002b5b;
  --color-green-400: #36c6c0;

  --color-primary: #19406a;
  --color-primary-light: #8094ad;
  --color-primary-dark: #002b5b;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Poppins", sans-serif;

  /* Spacing */
  --spacing-18: 4.5rem;
  --spacing-128: 32rem;

  /* Border Radius */
  --radius-4xl: 2rem;

  /* Shadows */
  --shadow-glow: 0 0 20px rgba(54, 198, 192, 0.5);

  /* Animations */
  --animate-fade-in: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   BASE STYLES
   ======================================== */
@layer base {
  body {
    @apply font-sans bg-slate-50 text-slate-900;
  }

  h1,
  h2,
  h3 {
    @apply font-display;
  }
}

/* ========================================
   COMPONENT CLASSES
   ======================================== */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all;
  }

  .btn-primary {
    @apply btn bg-primary text-white hover:bg-primary-dark shadow-glow;
  }

  .card {
    @apply p-6 bg-white rounded-4xl shadow-lg animate-fade-in;
  }
}
```

**Now you can use it all:**

```jsx
function App() {
  return (
    <div className="bg-blue-500 p-18">
      <div className="card">
        <h1 className="text-primary-dark">Welcome!</h1>
        <p className="text-green-400">Looking good.</p>
        <button className="btn-primary">Get Started</button>
      </div>
    </div>
  );
}
```

---

### Quick Reference: Token Naming Convention

| What You Want        | v3 Config Key          | v4 CSS Variable         |
| -------------------- | ---------------------- | ----------------------- |
| Colors               | `colors.blue.500`      | `--color-blue-500`      |
| Fonts                | `fontFamily.sans`      | `--font-sans`           |
| Spacing              | `spacing.18`           | `--spacing-18`          |
| Border Radius        | `borderRadius.4xl`     | `--radius-4xl`          |
| Box Shadow           | `boxShadow.glow`       | `--shadow-glow`         |
| Animation            | `animation.wiggle`     | `--animate-wiggle`      |
| Breakpoints          | `screens.xs`           | `--breakpoint-xs`       |

The pattern is: `--{category}-{name}: {value};`

---

## Pro Tips

1. **Use `@layer` for clean code:** Even if you could write standard CSS at the bottom of the file, using `@layer` ensures Tailwind treats your custom code with the same respect as its built-in classes—meaning things like `hover:` and `md:` variants will work perfectly with your custom classes.

2. **Variants work automatically:** Once you define a class in `@layer components` or `@layer utilities`, you can use Tailwind variants:

   ```html
   <div class="hover:image-gallary md:image-gallary"></div>
   ```

3. **Use CSS variables from `@theme`:** You can reference your theme tokens anywhere using `var(--color-brand-blue)`.

4. **Specificity order to remember:**
   - `base` = lowest (gets overridden easily)
   - `components` = middle (can be overridden by utilities)
   - `utilities` = highest (wins in conflicts)

---

## Quick Reference

```css
@import "tailwindcss";

@theme {
  /* Design tokens go here */
}

@layer base {
  /* Global HTML element styles */
}

@layer components {
  /* Reusable component classes */
}

@layer utilities {
  /* Custom utility classes */
}
```

---

_Happy styling with Tailwind v4!_ 🎨
