# Why Tokens from Local Storage Cannot Be Sent to Next.js Server on First Request

## The Problem

In a traditional React SPA (Single Page Application), authentication tokens stored in `localStorage` can be attached to API requests because:

1. The browser first loads the HTML/JS bundle
2. JavaScript executes and reads the token from `localStorage`
3. Subsequent API requests include the token in headers

However, in **Next.js with Server-Side Rendering (SSR)**, this approach doesn't work for the **initial request**.

## Why It Doesn't Work

### The SSR Request Flow

1. User navigates to a page (e.g., `/dashboard`)
2. Browser sends an HTTP request to the Next.js server
3. **At this point, JavaScript hasn't executed yet** - the browser is just making a standard HTTP request
4. The server renders the page and sends HTML back
5. Only **after** the HTML loads does JavaScript execute (hydration)
6. Only **then** can `localStorage` be accessed

### The Core Issue

- `localStorage` is a **browser-only API** - it doesn't exist on the server
- The first request to the server happens **before** any client-side JavaScript runs
- Therefore, there's no way to read `localStorage` and attach a token to that initial request

## The Solution: Cookies

Cookies solve this problem because:

- Cookies are **automatically sent** with every HTTP request to the same domain
- They're included in the **first request** before any JavaScript executes
- The server can read cookies directly from the request headers

This is why authentication libraries like **NextAuth.js** use cookies (specifically HTTP-only cookies) for session management instead of `localStorage`.

## Comparison

| Feature                          | localStorage | Cookies |
| -------------------------------- | ------------ | ------- |
| Available on first SSR request   | ❌ No        | ✅ Yes  |
| Accessible from server           | ❌ No        | ✅ Yes  |
| Automatically sent with requests | ❌ No        | ✅ Yes  |
| Can be HTTP-only (more secure)   | ❌ No        | ✅ Yes  |
