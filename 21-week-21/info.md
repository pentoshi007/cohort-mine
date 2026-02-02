## Monorepos and Turborepo

### Core Concepts

*   **Build System**: Tools that transform source code into artifacts (e.g., **Vite**, **Webpack**, **tsc**, **esbuild**). They handle the actual compilation, bundling, and minification of code.
*   **Build System Orchestrator**: Tools that manage *when* and *how* build systems run across multiple projects (e.g., **Turborepo**). They focus on task scheduling, caching, and parallelization rather than the compilation itself.
*   **Monorepo Framework**: An opinionated set of tools and conventions that provide scaffolding, code generation, and project structure in addition to orchestration (e.g., **Nx**).

### Monorepos
A **monorepo** is a single version-controlled repository that houses multiple distinct projects, often with shared dependencies.

*   **Advantages**: Simplified code sharing, atomic commits across projects, unified linting/testing configurations, and easier refactoring.
*   **Challenges**: Scaling build times, large repository sizes, and complex CI/CD pipelines.

### Turborepo
**Turborepo** is a high-performance build system orchestrator for JavaScript and TypeScript monorepos, designed to solve the scaling challenges of large codebases.

*   **Remote Caching**: Shares build artifacts across a team or CI/CD to ensure tasks are never executed twice if inputs haven't changed.
*   **Task Pipelines**: Defines relationships between tasks (e.g., "build after lint") to execute them in the most efficient order.
*   **Parallel Execution**: Utilizes all available CPU cores to run independent tasks concurrently.

### Comparisons

| Feature | Monorepo (with Turborepo) | Polyrepo (Multi-repo) |
| :--- | :--- | :--- |
| **Code Sharing** | Instant (local symlinks/workspaces) | Slow (requires npm publish/install) |
| **Dependency Management** | Single `lock` file; version synchronization | Multiple `lock` files; version drift |
| **CI/CD** | Complex setup, but optimized via caching | Simple setup, but redundant builds |
| **Visibility** | High; cross-team discovery is easy | Low; siloed codebases |

| Build Tool | Turborepo | Nx |
| :--- | :--- | :--- |
| **Type** | Build System Orchestrator | Monorepo Framework |
| **Configuration** | Minimal (`turbo.json`) | Extensive (Plugins/Generators) |
| **Learning Curve** | Low; fits existing workflows | Higher; opinionated structure |
| **Performance** | Go-based engine; extremely fast | Node-based; feature-rich but heavier |

---

## Tailwind CSS v4 Monorepo Setup

### Overview
This project uses **Tailwind CSS v4** with its new CSS-first configuration approach. Tailwind is configured to work across the entire monorepo, including shared components in `packages/ui`.

### Installation Steps

1. **Install Tailwind packages** (in `apps/web`):
   ```bash
   bun add -D tailwindcss @tailwindcss/postcss
   ```

2. **Configure PostCSS** (`apps/web/postcss.config.mjs`):
   ```javascript
   const config = {
     plugins: {
       '@tailwindcss/postcss': {},  // v4 uses @tailwindcss/postcss, not tailwindcss
     },
   };
   export default config;
   ```

3. **Import Tailwind in CSS** (`apps/web/app/globals.css`):
   ```css
   @import "tailwindcss";
   
   /* Scan packages/ui for Tailwind classes */
   @source "../../packages/ui/src";
   ```

4. **Add peer dependency** (`packages/ui/package.json`):
   ```json
   "peerDependencies": {
     "tailwindcss": "^4.0.0"
   }
   ```

### How It Works

#### The `@source` Directive
Tailwind v4 uses the `@source` directive to specify which directories to scan for Tailwind classes:

```css
@source "../../packages/ui/src";
```

This tells Tailwind to:
- Scan all files in `packages/ui/src` (including subdirectories)
- Extract any Tailwind classes used in those files
- Include those classes in the final CSS bundle

**Why this matters**: Without `@source`, Tailwind would only scan files in `apps/web`, missing any classes used in shared `packages/ui` components.

#### Content Scanning Process
1. Tailwind scans `apps/web/app/**/*` (default Next.js app directory)
2. Tailwind scans `packages/ui/src/**/*` (via `@source` directive)
3. Extracts all Tailwind classes from both locations
4. Generates CSS containing only the classes actually used
5. Injects the CSS into your application

### Key Differences from Tailwind v3

| Aspect | Tailwind v3 | Tailwind v4 |
|--------|-------------|-------------|
| **Config File** | `tailwind.config.js` (required) | No config file needed |
| **PostCSS Plugin** | `tailwindcss` | `@tailwindcss/postcss` |
| **CSS Directives** | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| **Content Paths** | Defined in `tailwind.config.js` | Use `@source` in CSS |
| **Autoprefixer** | Separate plugin required | Built-in |

### Troubleshooting

#### CSS Lint Warning: "Unknown at rule @source"
**Expected behavior** - CSS linters don't recognize Tailwind v4's `@source` directive yet. The warning is harmless and can be ignored. The directive works correctly at runtime.

#### Styles Not Applying in `packages/ui` Components
1. Verify `@source "../../packages/ui/src"` is in `globals.css`
2. Check that the path is correct relative to `apps/web/app/globals.css`
3. Restart the dev server: `bun run dev`
4. Clear browser cache and hard reload

#### Build Error: "tailwindcss directly as a PostCSS plugin"
You're using the old v3 plugin. Update `postcss.config.mjs`:
```javascript
// ❌ Wrong (v3)
plugins: { tailwindcss: {} }

// ✅ Correct (v4)
plugins: { '@tailwindcss/postcss': {} }
```

### Best Practices

1. **Keep Tailwind in the app layer**: Only install Tailwind packages in consuming apps (`apps/web`), not in `packages/ui`
2. **Use peer dependencies**: Mark `tailwindcss` as a peer dependency in `packages/ui` to indicate it's expected
3. **Avoid inline styles**: Use Tailwind classes consistently across both app and shared components
4. **Component composition**: Accept `className` prop in shared components for Tailwind customization:
   ```tsx
   export const Button = ({ className, children }: ButtonProps) => (
     <button className={className}>{children}</button>
   );
   ```
5. **Test shared components**: Always test `packages/ui` components in the actual app to verify Tailwind classes work

### File Structure
```
21.2-chat-app/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── globals.css          # @import "tailwindcss" + @source
│       │   └── layout.tsx           # Imports globals.css
│       ├── postcss.config.mjs       # @tailwindcss/postcss plugin
│       └── package.json             # Tailwind dependencies
└── packages/
    └── ui/
        ├── src/
        │   ├── button.tsx           # Can use Tailwind classes
        │   ├── card.tsx             # Can use Tailwind classes
        │   └── code.tsx             # Can use Tailwind classes
        └── package.json             # Tailwind peer dependency
```

---

## TypeScript Configuration & ESM/CommonJS Interop

### Common Error: "Module can only be default-imported using the 'esModuleInterop' flag"

#### The Problem
When using modern TypeScript with strict ESM syntax (`"module": "nodenext"` + `"verbatimModuleSyntax": true`), you may encounter this error when importing CommonJS packages like Express:

```
Module '.../@types/express/index' can only be default-imported using the 'esModuleInterop' flag
```

**Root Cause**: 
- Your TypeScript config enforces strict ESM (ECMAScript Modules) syntax
- Many npm packages (like `@types/express`) use CommonJS module format
- Without `esModuleInterop`, TypeScript can't bridge the gap between these two module systems

#### The Solution

**1. Add ESM/CommonJS Interop Flags**

In your shared TypeScript config (`packages/typescript-config/backends.json`), add:

```json
{
  "compilerOptions": {
    // ... other options
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

**What these flags do**:
- `esModuleInterop`: Creates synthetic default imports for CommonJS modules, allowing `import express from "express"` syntax
- `allowSyntheticDefaultImports`: Improves IDE support and type checking for synthetic imports

### Monorepo-Specific Issues

#### Issue: "File '@repo/typescript-config/backends' not found"

**Problem**: Tools like `ts-node` can't resolve workspace aliases (e.g., `@repo/typescript-config/backends`)

**Solution**: Use relative paths in `tsconfig.json`:

```json
{
  // ❌ Wrong - workspace alias doesn't work with ts-node
  "extends": "@repo/typescript-config/backends"
  
  // ✅ Correct - relative path works everywhere
  "extends": "../../packages/typescript-config/backends.json"
}
```

#### Issue: "File is not under 'rootDir'"

**Problem**: The base config's `rootDir` is relative to the base config location, not your project

**Solution**: Override `rootDir` and `outDir` in your project's `tsconfig.json`:

```json
{
  "extends": "../../packages/typescript-config/backends.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

#### Issue: "Cannot find type definition file for 'node'"

**Problem**: Missing `@types/node` package

**Solution**: Install it as a dev dependency:

```bash
bun add -d @types/node
```

### Development Server Setup

#### Using Bun Instead of ts-node

For Bun monorepos, use Bun's native TypeScript support instead of `ts-node`:

**package.json** (`apps/http-server/package.json`):
```json
{
  "scripts": {
    "dev": "bun --watch src/index.ts",    // ✅ Use Bun
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.1.0",
    "typescript": "^5.7.3"
  }
}
```

**Why Bun over ts-node?**
- ✅ Native TypeScript support (no transpiler needed)
- ✅ Understands monorepo workspace structure
- ✅ Faster startup and hot reload
- ✅ No configuration needed

### Port Conflicts in Monorepos

#### Issue: "EADDRINUSE: address already in use"

**Problem**: Multiple apps trying to use the same port (e.g., both `http-server` and `web` using port 3000)

**Solution**: Assign different ports to each app:

```typescript
// apps/http-server/src/index.ts
app.listen(3001, () => {
  console.log("Server started on port 3001");
});

// apps/web runs on port 3000 (default Next.js)
```

### Turbo Cache Issues

#### Issue: Changes not reflected after updating package.json

**Problem**: Turborepo caches task outputs, including old script commands

**Solution**: Clear the Turbo cache:

```bash
rm -rf .turbo && bun run dev
```

Or use the built-in cache clearing:
```bash
turbo run dev --force
```

### Complete Troubleshooting Checklist

When setting up a new backend app in the monorepo:

- [ ] Install required dependencies:
  ```bash
  bun add express
  bun add -d @types/express @types/node typescript
  ```

- [ ] Create `tsconfig.json` with relative path:
  ```json
  {
    "extends": "../../packages/typescript-config/backends.json",
    "compilerOptions": {
      "rootDir": "./src",
      "outDir": "./dist"
    }
  }
  ```

- [ ] Ensure base config has ESM interop flags:
  ```json
  {
    "compilerOptions": {
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true
    }
  }
  ```

- [ ] Use Bun for dev script:
  ```json
  {
    "scripts": {
      "dev": "bun --watch src/index.ts"
    }
  }
  ```

- [ ] Assign unique port to avoid conflicts
- [ ] Clear Turbo cache if changes don't reflect: `rm -rf .turbo`

### File Structure for Backend Apps

```
apps/http-server/
├── src/
│   └── index.ts              # Entry point
├── dist/                     # Compiled output (gitignored)
├── package.json              # Dependencies + scripts
└── tsconfig.json             # Extends base config + overrides
```

**Minimal `tsconfig.json`**:
```json
{
  "extends": "../../packages/typescript-config/backends.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

**Minimal `package.json`**:
```json
{
  "name": "http-server",
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.1.0",
    "typescript": "^5.7.3"
  }
}
```
