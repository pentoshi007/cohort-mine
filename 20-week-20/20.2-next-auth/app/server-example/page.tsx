/**
 * ============================================================================
 * 💡 SERVER-SIDE SESSION EXAMPLE WITH getServerSession()
 * ============================================================================
 * 
 * This is a SERVER COMPONENT demonstrating SERVER-SIDE session handling.
 * 
 * NOTICE: No "use client" directive here! This component runs on the SERVER.
 * 
 * WHAT IS A SERVER COMPONENT?
 * ---------------------------
 * In Next.js App Router, components are SERVER components BY DEFAULT.
 * 
 * Server Components:
 * ✅ Run on the server, not in the browser
 * ✅ Can directly access databases, file system, environment secrets
 * ✅ Can use async/await at the component level
 * ✅ Don't add to client JavaScript bundle (smaller bundle!)
 * ❌ CANNOT use React hooks (useState, useEffect, useSession)
 * ❌ CANNOT use browser APIs (window, document, localStorage)
 * ❌ CANNOT have onClick or other event handlers
 * 
 * WHEN TO USE SERVER COMPONENTS FOR AUTH:
 * ---------------------------------------
 * 1. PROTECTING PAGES - Redirect before page even renders
 * 2. FETCHING USER DATA - Get data from DB using the session
 * 3. SEO - Session data is available at render time
 * 4. PERFORMANCE - No client-side loading state needed
 * 
 * KEY DIFFERENCE FROM CLIENT COMPONENTS:
 * --------------------------------------
 * - Client: Uses useSession() hook, shows loading state
 * - Server: Uses getServerSession(), no loading state, instant check
 * 
 * ============================================================================
 */

// No "use client" - this is a SERVER component!

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

/**
 * ============================================================================
 * 💡 ASYNC FUNCTION COMPONENT
 * ============================================================================
 * 
 * Notice this is an ASYNC function! You can only do this in Server Components.
 * Client Components cannot be async.
 * 
 * This lets us use await inside the component body.
 */
export default async function ServerSessionExample() {
  /**
   * ==========================================================================
   * 💡 getServerSession() - The Server-Side Way to Get Auth
   * ==========================================================================
   * 
   * This function gets the session on the SERVER, before any HTML is sent.
   * 
   * HOW IT WORKS:
   * -------------
   * 1. It reads the cookies from the incoming request
   * 2. Decrypts the JWT using your NEXTAUTH_SECRET
   * 3. Returns the session object (or null if not logged in)
   * 
   * WHY PASS authOptions?
   * ---------------------
   * getServerSession needs the same config used by NextAuth to:
   * - Know how to decode the JWT
   * - Apply the same callbacks (to add custom data to session)
   * 
   * COMPARISON WITH useSession():
   * -----------------------------
   * | Feature              | useSession()        | getServerSession()    |
   * |----------------------|---------------------|-----------------------|
   * | Where it runs        | Browser (client)    | Server                |
   * | Returns loading?     | Yes (status)        | No (already resolved) |
   * | Can use in hooks?    | Yes                 | No                    |
   * | Async?               | No                  | Yes (await it)        |
   * | Database access?     | Need API route      | Direct                |
   * | Bundle impact?       | Adds to bundle      | None                  |
   * | Caching?             | Automatic           | Per-request           |
   * 
   * REAL-WORLD USE CASES:
   * ---------------------
   * 1. Protected API routes - Block unauthorized access
   * 2. Dashboard pages - Get user before rendering
   * 3. Profile pages - Fetch user's data from database
   * 4. Admin pages - Check user role before showing content
   */
  const session = await getServerSession(authOptions);

  /**
   * ==========================================================================
   * 💡 SERVER-SIDE PROTECTION / REDIRECT
   * ==========================================================================
   * 
   * If there's no session, redirect to sign-in BEFORE any HTML is sent.
   * 
   * This is BETTER than client-side protection because:
   * 1. User never sees any protected content flash
   * 2. No JavaScript needed for the redirect
   * 3. Works even if JavaScript is disabled
   * 4. SEO: Search engines don't index protected content
   * 
   * The redirect() function from Next.js:
   * - Throws a special error that Next.js catches
   * - Sends a 307 Temporary Redirect response
   * - User's browser navigates to the new URL
   * 
   * ALTERNATIVE: Middleware
   * -----------------------
   * For protecting MULTIPLE routes, consider using Next.js middleware:
   * Create a middleware.ts file that checks auth for /dashboard/*, /admin/*, etc.
   */
  if (!session) {
    // 🚫 Not logged in → Redirect to sign-in page
    redirect("/signin");
  }

  /**
   * ==========================================================================
   * 💡 ACCESSING SESSION DATA ON THE SERVER
   * ==========================================================================
   * 
   * At this point, we KNOW the user is logged in (we would have redirected).
   * We can safely access session.user
   * 
   * The session object looks like:
   * {
   *   user: {
   *     id: "123",
   *     name: "John Doe",
   *     email: "john@example.com",
   *     image: "https://..."  // If from OAuth
   *   },
   *   expires: "2024-02-27T..."  // When the session expires
   * }
   * 
   * You could now:
   * - Query the database for this user's data
   * - Check their role/permissions
   * - Fetch their orders, posts, preferences, etc.
   * 
   * Example:
   * const userPosts = await db.post.findMany({
   *   where: { authorId: session.user.id }
   * });
   */

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {/* ================================================================
            HEADER
            ================================================================ */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            🖥️ Server Component Example
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            This page uses{" "}
            <code className="rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800">
              getServerSession()
            </code>{" "}
            to access the session on the server.
          </p>
        </div>

        {/* ================================================================
            SESSION DATA DISPLAY
            ================================================================ */}
        <div className="space-y-4 rounded-lg bg-zinc-50 p-6 dark:bg-zinc-800/50">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Session Data (Retrieved Server-Side)
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[80px]">
                User ID:
              </span>
              <code className="rounded bg-zinc-200 px-2 py-1 text-sm dark:bg-zinc-700">
                {session.user?.id ?? "Not set (add to callbacks)"}
              </code>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[80px]">
                Email:
              </span>
              <code className="rounded bg-zinc-200 px-2 py-1 text-sm dark:bg-zinc-700">
                {session.user?.email}
              </code>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[80px]">
                Name:
              </span>
              <code className="rounded bg-zinc-200 px-2 py-1 text-sm dark:bg-zinc-700">
                {session.user?.name}
              </code>
            </div>
          </div>
        </div>

        {/* ================================================================
            EDUCATIONAL INFO BOX
            ================================================================ */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
            💡 Why Use Server Components for Auth?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span><strong>No Loading State</strong> - Session is already available when page renders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span><strong>Secure Redirect</strong> - Unauthorized users are redirected before seeing any content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span><strong>Direct DB Access</strong> - Can query database using session.user.id right here</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span><strong>Smaller Bundle</strong> - This code doesn't add to client JavaScript</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">✓</span>
              <span><strong>SEO Friendly</strong> - Content is rendered server-side</span>
            </li>
          </ul>
        </div>

        {/* ================================================================
            COMPARISON BOX
            ================================================================ */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <h3 className="mb-3 font-semibold text-amber-900 dark:text-amber-100">
            ⚖️ When to Use Which?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-amber-800 dark:text-amber-200">Use useSession() when:</p>
              <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Need real-time session updates</li>
                <li>• Building interactive UI components</li>
                <li>• Need loading states</li>
                <li>• Using onClick handlers</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-amber-800 dark:text-amber-200">Use getServerSession() when:</p>
              <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Protecting pages/routes</li>
                <li>• Fetching user data from DB</li>
                <li>• Need instant auth check</li>
                <li>• SEO is important</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================================================================
            NAVIGATION BACK
            ================================================================ */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            ← Back to Client Example
          </Link>
          
          <a
            href="https://next-auth.js.org/configuration/nextjs#getserversession"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/50"
          >
            📚 Official Docs
          </a>
        </div>
      </div>
    </div>
  );
}
