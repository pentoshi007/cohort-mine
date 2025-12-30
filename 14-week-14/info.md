# TypeScript Configuration Guide (`tsconfig.json`)

This document explains each option in the `tsconfig.json` file, their possible values, when to use them, and how to troubleshoot common issues.

---

## Table of Contents

1. [File Layout Options](#file-layout-options)
2. [Environment Settings](#environment-settings)
3. [Output Options](#output-options)
4. [Stricter Typechecking Options](#stricter-typechecking-options)
5. [Style Options](#style-options)
6. [Recommended Options](#recommended-options)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## File Layout Options

### `rootDir`

**Purpose:** Specifies the root folder of your source files.

| Value     | When to Use                                          |
| --------- | ---------------------------------------------------- |
| `"./src"` | When all your TypeScript files are in a `src` folder |
| `"."`     | When TypeScript files are in the project root        |

**Common Issue:** Output folder structure doesn't match source structure.
**Solution:** Set `rootDir` to the common parent directory of all source files.

---

### `outDir`

**Purpose:** Specifies where compiled JavaScript files will be placed.

| Value       | When to Use                                       |
| ----------- | ------------------------------------------------- |
| `"./dist"`  | Standard convention for distribution/build output |
| `"./build"` | Alternative common convention                     |
| `"./out"`   | Another alternative                               |

**Common Issue:** Compiled files are mixed with source files.
**Solution:** Set `outDir` to a separate directory like `"./dist"`.

---

## Environment Settings

### `module`

**Purpose:** Specifies the module system for the output JavaScript.

| Value                   | When to Use                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `"nodenext"`            | **Modern Node.js projects (v16+)** - Supports both ESM and CommonJS |
| `"esnext"`              | Latest ES modules (for bundlers like Webpack, Vite)                 |
| `"commonjs"`            | Older Node.js projects or legacy compatibility                      |
| `"es2020"` / `"es2022"` | Specific ES module version targeting                                |
| `"amd"`                 | RequireJS or browser AMD loaders (legacy)                           |
| `"umd"`                 | Universal Module Definition (works everywhere)                      |

**Common Issue:** `Cannot use import statement outside a module`
**Solution:**

- For Node.js: Use `"nodenext"` and add `"type": "module"` in `package.json`
- Or use `"commonjs"` if you want `require()` syntax

**Common Issue:** `ERR_REQUIRE_ESM` error
**Solution:** Switch to `"nodenext"` or `"esnext"` module system

---

### `target`

**Purpose:** Specifies the ECMAScript version for the output JavaScript.

| Value                | When to Use                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `"esnext"`           | **Latest features** - When using modern bundlers or latest Node.js |
| `"es2022"`           | Node.js 18+ or modern browsers                                     |
| `"es2021"`           | Node.js 16+                                                        |
| `"es2020"`           | Node.js 14+                                                        |
| `"es2019"`           | Node.js 12+                                                        |
| `"es2017"`           | Node.js 8+ (async/await support)                                   |
| `"es2015"` / `"es6"` | Older browsers with basic ES6 support                              |
| `"es5"`              | **Maximum compatibility** - IE11 and very old browsers             |

**Tip:** Match your target to your minimum supported runtime environment.

**Common Issue:** Features like optional chaining (`?.`) not working
**Solution:** Upgrade `target` to at least `"es2020"`

---

### `types`

**Purpose:** Specifies which type declaration packages to include.

| Value              | When to Use                                              |
| ------------------ | -------------------------------------------------------- |
| `[]` (empty array) | **Exclude all automatic type inclusions** - Full control |
| `["node"]`         | Node.js projects - includes `@types/node`                |
| `["jest"]`         | Include Jest testing types                               |
| `["node", "jest"]` | Node.js project with Jest tests                          |
| Not specified      | Auto-include all `@types/*` packages in node_modules     |

**Common Issue:** `Cannot find name 'process'` or `'require'`
**Solution:** Add `"node"` to types array and install `@types/node`:

```bash
npm install -D @types/node
```

---

### `lib`

**Purpose:** Specifies which built-in API declarations to include.

| Value                               | When to Use                          |
| ----------------------------------- | ------------------------------------ |
| `["esnext"]`                        | Latest JavaScript features (Node.js) |
| `["esnext", "dom"]`                 | Browser projects with latest JS      |
| `["es2020"]`                        | Specific ES version APIs             |
| `["es2020", "dom", "dom.iterable"]` | Browser with specific ES version     |

**Common Issue:** `Cannot find name 'fetch'` in Node.js
**Solution:** For Node.js 18+, the fetch API is built-in but you may need to update your lib or use a polyfill for older versions.

---

## Output Options

### `sourceMap`

**Purpose:** Generates `.map` files for debugging.

| Value   | When to Use                                                            |
| ------- | ---------------------------------------------------------------------- |
| `true`  | **Development** - Enables debugging original TypeScript in browser/IDE |
| `false` | **Production** - Smaller bundle, no source exposure                    |

---

### `declaration`

**Purpose:** Generates `.d.ts` type declaration files.

| Value   | When to Use                                                          |
| ------- | -------------------------------------------------------------------- |
| `true`  | **Publishing a library** - Allows consumers to have type information |
| `false` | **Application code** - Not needed for end applications               |

---

### `declarationMap`

**Purpose:** Generates source maps for `.d.ts` files.

| Value   | When to Use                                                                  |
| ------- | ---------------------------------------------------------------------------- |
| `true`  | Library development - Allows "Go to Definition" to show original `.ts` files |
| `false` | Not publishing a library or don't need this feature                          |

---

## Stricter Typechecking Options

### `noUncheckedIndexedAccess`

**Purpose:** Adds `undefined` to index signature results.

```typescript
// With noUncheckedIndexedAccess: true
const arr = [1, 2, 3];
const item = arr[0]; // Type: number | undefined ✅ Safer!

// With noUncheckedIndexedAccess: false
const item = arr[0]; // Type: number (could be undefined at runtime!)
```

| Value   | When to Use                                               |
| ------- | --------------------------------------------------------- |
| `true`  | **Recommended** - Catches potential undefined access bugs |
| `false` | Legacy projects where fixing all cases is impractical     |

---

### `exactOptionalPropertyTypes`

**Purpose:** Differentiates between `undefined` and missing properties.

```typescript
interface User {
  name: string;
  age?: number; // Optional
}

// With exactOptionalPropertyTypes: true
const user1: User = { name: "John" }; // ✅ OK
const user2: User = { name: "John", age: 25 }; // ✅ OK
const user3: User = { name: "John", age: undefined }; // ❌ Error!

// With exactOptionalPropertyTypes: false
const user3: User = { name: "John", age: undefined }; // ✅ Allowed (but semantically different)
```

| Value   | When to Use                                               |
| ------- | --------------------------------------------------------- |
| `true`  | **Recommended** - More precise optional property handling |
| `false` | When you need flexibility with undefined assignments      |

---

## Style Options

### `noImplicitReturns`

**Purpose:** Ensures all code paths in a function return a value.

```typescript
// With noImplicitReturns: true
function getValue(condition: boolean): string {
  if (condition) {
    return "yes";
  }
  // ❌ Error: Not all code paths return a value
}
```

| Value   | When to Use                        |
| ------- | ---------------------------------- |
| `true`  | Catch missing return statements    |
| `false` | Allow implicit `undefined` returns |

---

### `noImplicitOverride`

**Purpose:** Requires `override` keyword when overriding base class methods.

```typescript
class Animal {
  move() {}
}

// With noImplicitOverride: true
class Dog extends Animal {
  override move() {} // ✅ Must use 'override' keyword
}
```

---

### `noUnusedLocals` / `noUnusedParameters`

**Purpose:** Reports errors on unused variables/parameters.

| Value   | When to Use                                                  |
| ------- | ------------------------------------------------------------ |
| `true`  | Clean code enforcement                                       |
| `false` | During development or when intentionally keeping unused code |

**Tip:** Use `_` prefix for intentionally unused parameters: `function fn(_unused: string) {}`

---

### `noFallthroughCasesInSwitch`

**Purpose:** Reports errors for fallthrough cases in switch statements.

```typescript
// With noFallthroughCasesInSwitch: true
switch (value) {
  case 1:
    doSomething();
  // ❌ Error: Fallthrough case in switch
  case 2:
    doSomethingElse();
    break;
}
```

---

### `noPropertyAccessFromIndexSignature`

**Purpose:** Requires bracket notation for index signature properties.

```typescript
interface Data {
  [key: string]: string;
}

const data: Data = { foo: "bar" };

// With noPropertyAccessFromIndexSignature: true
data.foo; // ❌ Error
data["foo"]; // ✅ OK
```

---

## Recommended Options

### `strict`

**Purpose:** Enables all strict type-checking options at once.

| Value   | When to Use                                                |
| ------- | ---------------------------------------------------------- |
| `true`  | **Always recommended** - Catches more bugs at compile time |
| `false` | Only for gradual migration of legacy JavaScript projects   |

**Includes:** `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `alwaysStrict`

---

### `jsx`

**Purpose:** Controls how JSX is transformed.

| Value            | When to Use                                                |
| ---------------- | ---------------------------------------------------------- |
| `"react-jsx"`    | **React 17+** - New JSX transform (no React import needed) |
| `"react-jsxdev"` | React 17+ development mode with extra debugging            |
| `"react"`        | React 16 and earlier (requires `import React`)             |
| `"preserve"`     | Keep JSX as-is (for other tools like Babel to transform)   |
| `"react-native"` | React Native projects                                      |

**Common Issue:** `'React' refers to a UMD global, but the current file is a module`
**Solution:** Use `"react-jsx"` instead of `"react"` for React 17+

---

### `verbatimModuleSyntax`

**Purpose:** Enforces consistent import/export syntax.

| Value   | When to Use                                        |
| ------- | -------------------------------------------------- |
| `true`  | **Recommended** - Explicit about type-only imports |
| `false` | Legacy projects                                    |

```typescript
// With verbatimModuleSyntax: true
import type { User } from "./types"; // ✅ Type-only import
import { User } from "./types"; // Only if User is used as a value
```

---

### `isolatedModules`

**Purpose:** Ensures each file can be transpiled independently.

| Value   | When to Use                                                                |
| ------- | -------------------------------------------------------------------------- |
| `true`  | **Required for:** Babel, esbuild, swc, Vite, or any single-file transpiler |
| `false` | Only using `tsc` for compilation                                           |

**Common Issue:** `Cannot re-export a type when using isolatedModules`
**Solution:** Use `export type { MyType }` instead of `export { MyType }`

---

### `noUncheckedSideEffectImports`

**Purpose:** Checks that side-effect imports actually exist.

```typescript
import "./styles.css"; // Will error if file doesn't exist (when true)
```

---

### `moduleDetection`

**Purpose:** Controls how TypeScript detects if a file is a module.

| Value      | When to Use                                  |
| ---------- | -------------------------------------------- |
| `"force"`  | **Recommended** - Treat all files as modules |
| `"auto"`   | Detect based on import/export statements     |
| `"legacy"` | Old behavior                                 |

---

### `skipLibCheck`

**Purpose:** Skips type checking of declaration files (`.d.ts`).

| Value   | When to Use                                                                        |
| ------- | ---------------------------------------------------------------------------------- |
| `true`  | **Recommended** - Faster compilation, avoids issues with conflicting library types |
| `false` | When you need to verify all library types (slower)                                 |

---

## Common Issues & Solutions

### Issue: "Cannot find module" errors

**Solutions:**

1. Check `moduleResolution` is set correctly (use `"nodenext"` or `"bundler"`)
2. Ensure the module is installed: `npm install <module-name>`
3. For type definitions: `npm install -D @types/<module-name>`

---

### Issue: Project compiles but runtime errors occur

**Solutions:**

1. Enable `strict: true`
2. Enable `noUncheckedIndexedAccess: true`
3. Check your `target` matches your runtime environment

---

### Issue: Slow compilation

**Solutions:**

1. Enable `skipLibCheck: true`
2. Use `incremental: true` for subsequent builds
3. Exclude unnecessary files in `exclude` array

---

### Issue: Types from node_modules causing errors

**Solutions:**

1. Enable `skipLibCheck: true`
2. Check for conflicting type versions
3. Use `types: []` and explicitly include only needed types

---

### Issue: ESM/CommonJS interop problems

**Solutions:**

1. Use `"module": "nodenext"` with `"moduleResolution": "nodenext"`
2. Add `"type": "module"` to `package.json` for ESM
3. Use `"esModuleInterop": true` for better CommonJS imports

---

## Quick Reference: Recommended Configs

### For a Modern Node.js Project

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "lib": ["es2022"],
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "skipLibCheck": true
  }
}
```

### For a React (Vite) Project

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "lib": ["es2020", "dom", "dom.iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

### For a Library (npm package)

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

## Your Current Config Explained

```json
{
  "compilerOptions": {
    "module": "nodenext", // Modern Node.js module system
    "target": "esnext", // Latest JavaScript features
    "types": [], // No auto-included types (explicit control)
    "sourceMap": false, // No source maps (production-like)
    "declaration": false, // Not generating .d.ts files
    "declarationMap": false, // Not generating declaration maps
    "noUncheckedIndexedAccess": true, // Safer array/object access
    "exactOptionalPropertyTypes": true, // Stricter optional properties
    "strict": true, // All strict checks enabled
    "jsx": "react-jsx", // React 17+ JSX transform
    "verbatimModuleSyntax": true, // Explicit type imports
    "isolatedModules": true, // Compatible with modern bundlers
    "noUncheckedSideEffectImports": true, // Verify side-effect imports
    "moduleDetection": "force", // All files are modules
    "skipLibCheck": true // Skip checking .d.ts files
  }
}
```

**This config is ideal for:** A modern TypeScript project with React, using strict type checking and modern tooling (Vite, esbuild, etc.).
