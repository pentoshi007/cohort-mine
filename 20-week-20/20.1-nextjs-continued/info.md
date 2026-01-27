## Route Groups in Next.js

Route groups allow you to organize routes without affecting the URL structure. They are created using parentheses in folder names.

### Why Use Route Groups?

1. **Logical Organization**: Group related routes together without adding segments to the URL path
2. **Shared Layouts**: Apply specific layouts to a subset of routes without affecting others
3. **Code Organization**: Keep authentication, user, admin, or other feature-specific pages organized

### Authentication Route Group: (auth)

The `(auth)` folder groups authentication-related pages together. The parentheses mean this folder name won't appear in the URL.

- `(auth)/signin/page.tsx` → accessible at `/signin` (not `/auth/signin`)
- `(auth)/signup/page.tsx` → accessible at `/signup` (not `/auth/signup`)
- `(auth)/layout.tsx` → provides a shared layout (header, footer, styling) for all auth pages

**Benefits**: All auth pages share the same layout with consistent styling and structure, while keeping the URLs clean.

### User Route Group: (user)

The `(user)` folder groups user-related pages together.

- `(user)/page.tsx` → accessible at `/user` (not shown in URL structure)

**Benefits**: Separates user-specific pages from other routes, making it easier to apply different layouts or middleware in the future.

## Dynamic Routes and Slugs

### What is a Slug?

A **slug** is a dynamic route parameter used to identify a specific resource in your application. It's a URL-friendly identifier that typically represents a unique piece of content like a blog post, product, or user profile.

### Dynamic Route Syntax

Dynamic routes in Next.js are created using square brackets `[]` in the file or folder name:

- `[slug]/page.tsx` → matches any single segment (e.g., `/about`, `/contact`, `/product-123`)
- `[id]/page.tsx` → matches routes like `/1`, `/42`, `/user-abc`
- `blog/[slug]/page.tsx` → matches `/blog/my-first-post`, `/blog/nextjs-tutorial`

### Catch-All Slugs

Catch-all routes allow you to match multiple path segments at once. They are created using the spread operator `...` inside square brackets:

- `[...slug]/page.tsx` → matches any number of segments (e.g., `/a`, `/a/b`, `/a/b/c`)
- `docs/[...slug]/page.tsx` → matches `/docs/intro`, `/docs/api/auth`, `/docs/guides/getting-started`

### Optional Catch-All Slugs

Optional catch-all routes match zero or more path segments. They are created using double square brackets `[[...slug]]`:

- `[[...slug]]/page.tsx` → matches `/` (root), `/a`, `/a/b`, `/a/b/c`
- `docs/[[...slug]]/page.tsx` → matches `/docs`, `/docs/intro`, `/docs/api/auth`, `/docs/guides/getting-started`

**Difference from Catch-All**: While `[...slug]` requires at least one segment, `[[...slug]]` is optional and will also match the parent route with no segments.

things to talk about:
server side rendering, client side rendering, static generation, incremental static regeneration, etc.
also:
server side components,client side components, hydration,middlewares in nextjs etc.
