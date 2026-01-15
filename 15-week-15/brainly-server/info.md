# ESM Syntax Error Fix

## Problem

```
ESM syntax is not allowed in a CommonJS module when 'verbatimModuleSyntax' is enabled.
```

This error occurred because:

1. `tsconfig.json` had `"verbatimModuleSyntax": true` — this tells TypeScript to **preserve import/export syntax exactly** as written (no transformation)
2. `package.json` had `"type": "commonjs"` — this tells Node.js to treat `.js` files as CommonJS modules
3. Code used ESM `import` syntax: `import express from "express"`

**Conflict:** ESM `import` syntax is invalid in CommonJS modules. With `verbatimModuleSyntax` enabled, TypeScript won't convert your imports to `require()`, so the mismatch causes an error.

## Solution

Changed `package.json`:

```diff
- "type": "commonjs",
+ "type": "module",
```

This tells Node.js to treat files as ES modules, making ESM `import` syntax valid.

## Key Takeaway

When using `verbatimModuleSyntax: true`, your `package.json` `type` field must match your import style:
- ESM imports (`import x from 'y'`) → `"type": "module"`
- CommonJS (`require()`) → `"type": "commonjs"` or omit the field

---

# ts-node ESM Module Resolution Error

## Problem

```
Error: Cannot find module '/path/to/src/db.js' imported from /path/to/src/index.ts
code: 'ERR_MODULE_NOT_FOUND'
```

This happens when using `nodemon` with `ts-node` and ESM modules. The issue:

1. `tsconfig.json` has `"module": "nodenext"` which requires `.js` extensions in imports
2. We write `import { connectDB } from "./db.js"` (correct for ESM)
3. But `ts-node` tries to find the actual `.js` file which doesn't exist (we have `.ts` files)
4. `ts-node` doesn't handle ESM module resolution well out of the box

## Solution

Use `tsx` instead of `ts-node` — it's a modern TypeScript runner that handles ESM properly:

```bash
npm install -D tsx
```

Update `package.json`:

```diff
- "start": "nodemon src/index.ts"
+ "start": "nodemon --exec tsx src/index.ts"
```

## Why tsx?

- `tsx` automatically resolves `.js` imports to `.ts` files
- No extra configuration needed for ESM
- Faster than `ts-node`
- Works seamlessly with `"type": "module"` and `verbatimModuleSyntax`

---

# Alternative: Build-First Approach (Production Style)

## The Setup

Instead of running TypeScript directly, compile to JavaScript first, then run the compiled output:

```json
"scripts": {
  "build": "tsc -b",
  "start": "nodemon ./dist/index.js",
  "dev": "npm run build && npm run start"
}
```

**Workflow:**
1. `npm run build` — compiles `.ts` files from `src/` to `.js` files in `dist/`
2. `npm run start` — runs the compiled JavaScript with nodemon
3. `npm run dev` — does both in sequence

## Which Approach is Better?

| Approach | Dev Experience | Production | Used By |
|----------|---------------|------------|---------|
| `tsx` / `ts-node` | ✅ Fast iteration, no build step | ❌ Not for production | Small projects, prototyping |
| Build-first (`tsc` → run `.js`) | ⚠️ Slower (need to rebuild) | ✅ Production-ready | Most companies, large projects |

### Industry Standard: Build-First

**Most companies use the build-first approach because:**

1. **Production deploys compiled JS** — You never run `ts-node`/`tsx` in production (slow startup, memory overhead)
2. **Catches errors early** — `tsc` type-checks everything before running
3. **Predictable output** — What you test locally is exactly what runs in production
4. **CI/CD friendly** — Build once, deploy the artifact

### Recommended Setup for Real Projects

```json
"scripts": {
  "build": "tsc -b",
  "start": "node ./dist/index.js",
  "dev": "tsx watch src/index.ts"
}
```

- `dev` — Use `tsx watch` for fast development (auto-restarts on changes)
- `build` — Compile for production
- `start` — Run compiled JS in production (no tsx/ts-node)

**Best of both worlds:** Fast dev experience + production-ready builds.
