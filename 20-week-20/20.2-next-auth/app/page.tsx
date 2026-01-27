/**
 * ============================================================================
 * 💡 CLIENT-SIDE SESSION EXAMPLE WITH useSession()
 * ============================================================================
 * 
 * This is the HOME PAGE demonstrating CLIENT-SIDE session handling.
 * 
 * WHAT IS A CLIENT COMPONENT?
 * ---------------------------
 * In Next.js App Router, there are two types of components:
 * 
 * 1. SERVER COMPONENTS (default)
 *    - Run on the server
 *    - Cannot use React hooks (useState, useEffect, useSession)
 *    - Cannot have onClick handlers or other browser events
 *    - Great for: fetching data, accessing databases, SEO
 * 
 * 2. CLIENT COMPONENTS (marked with "use client")
 *    - Run in the browser
 *    - CAN use React hooks
 *    - CAN handle user interactions
 *    - Great for: interactive UIs, real-time updates, forms
 * 
 * THIS PAGE IS A CLIENT COMPONENT BECAUSE:
 * - We use the useSession() hook
 * - We use onClick handlers for sign-in/sign-out buttons
 * - We need real-time session state updates
 * 
 * ============================================================================
 */

"use client";
// ☝️ This directive MUST be at the top of the file (except comments)
// It tells Next.js to render this component on the CLIENT (in the browser)

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  /**
   * ==========================================================================
   * 💡 THE useSession() HOOK - Your Window into Auth State
   * ==========================================================================
   * 
   * This hook is your PRIMARY way to access authentication in CLIENT components.
   * 
   * WHAT IT RETURNS:
   * ----------------
   * const { data: session, status, update } = useSession();
   * 
   * - data (aliased as 'session'):
   *   The session object containing user info, or undefined if not logged in.
   *   Example: { user: { name: "John", email: "john@example.com", image: "..." } }
   * 
   * - status:
   *   A string indicating the current auth state:
   *   • "loading"         → Still checking if user is logged in
   *   • "authenticated"   → User is logged in, session has data
   *   • "unauthenticated" → User is not logged in
   * 
   * - update:
   *   A function to refresh the session (useful after profile updates)
   * 
   * HOW IT WORKS UNDER THE HOOD:
   * ----------------------------
   * 1. When your component mounts, useSession() makes a request to /api/auth/session
   * 2. The server decrypts the JWT cookie and returns the session data
   * 3. The hook caches this and re-checks periodically
   * 4. When session changes (login/logout), all useSession() hooks update
   * 
   * REAL-WORLD USE CASES:
   * ---------------------
   * • Navigation bar showing user avatar or "Sign In" button
   * • Protecting client-side routes
   * • Personalizing UI based on logged-in user
   * • Showing/hiding features based on auth state
   * 
   * ⚠️ FOR SERVER COMPONENTS, USE getServerSession() INSTEAD!
   *    See /server-example for that approach.
   */
  const { data: session, status } = useSession();

  /**
   * You can also destructure more specifically:
   * 
   * const { data: session, status, update } = useSession({
   *   required: true,  // Redirects to sign-in if not authenticated
   *   onUnauthenticated() {
   *     // Custom handling when user is not authenticated
   *     router.push('/signin');
   *   }
   * });
   */

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="flex w-full max-w-3xl flex-col items-center gap-12 py-16 px-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-none border border-zinc-200 dark:border-zinc-800 transition-all">
        <Image
          className="dark:invert mb-4"
          src="/next.svg"
          alt="Next.js logo"
          width={140}
          height={28}
          priority
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            NextAuth Learning Demo
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-lg">
            This page demonstrates <strong>client-side</strong> session handling with{" "}
            <code className="rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800">useSession()</code>
          </p>

          {/* =================================================================
              STATUS BOX - Shows current authentication state
              ================================================================= */}
          <div className="mt-4 p-6 w-full max-w-md rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Connection Status
            </h2>

            {/**
             * ================================================================
             * 💡 CONDITIONAL RENDERING BASED ON AUTH STATE
             * ================================================================
             * 
             * This pattern is SUPER common in real apps:
             * 
             * if (status === "loading") → Show a spinner
             * if (session exists)       → Show logged-in state
             * else                      → Show logged-out state
             * 
             * Always handle the loading state! Otherwise users see a flash
             * of unauthenticated content before the session loads.
             */}
            {status === "loading" ? (
              // ──────────────────────────────────────────────────────────────
              // LOADING STATE
              // The session is still being fetched from the server.
              // Always show this to avoid UI flashing!
              // ──────────────────────────────────────────────────────────────
              <div className="flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"></div>
                <span>Checking session...</span>
              </div>
            ) : session ? (
              // ──────────────────────────────────────────────────────────────
              // AUTHENTICATED STATE
              // session.user contains: { name, email, image, id (if added) }
              // ──────────────────────────────────────────────────────────────
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {/* session.user?.name - The ?. is "optional chaining" for safety */}
                    Connected as {session.user?.name}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            ) : (
              // ──────────────────────────────────────────────────────────────
              // UNAUTHENTICATED STATE
              // No session exists - user needs to log in
              // ──────────────────────────────────────────────────────────────
              <div className="flex flex-col items-center gap-4 text-zinc-600 dark:text-zinc-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p>No active session found</p>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            SIGN IN / SIGN OUT BUTTONS
            =================================================================== */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {!session ? (
            /**
             * ================================================================
             * 💡 THE signIn() FUNCTION
             * ================================================================
             * 
             * This function triggers the authentication flow.
             * 
             * CALLING PATTERNS:
             * -----------------
             * signIn()                    → Show all providers (default)
             * signIn('google')            → Go directly to Google login
             * signIn('github')            → Go directly to GitHub login
             * signIn('credentials', {...}) → Submit email/password
             * 
             * OPTIONS:
             * --------
             * signIn('google', {
             *   callbackUrl: '/dashboard', // Where to go after login
             *   redirect: true,            // Whether to redirect (default: true)
             * });
             * 
             * FOR CREDENTIALS WITH CUSTOM HANDLING:
             * -------------------------------------
             * const result = await signIn('credentials', {
             *   email: 'user@example.com',
             *   password: 'password123',
             *   redirect: false,  // Don't redirect - handle result manually
             * });
             * 
             * if (result?.error) {
             *   // Show error message
             * } else {
             *   // Success! Redirect manually
             *   router.push('/dashboard');
             * }
             */
            <button
              onClick={() => signIn()}
              className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-900 px-6 font-medium text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign In to Verify
            </button>
          ) : (
            /**
             * ================================================================
             * 💡 THE signOut() FUNCTION
             * ================================================================
             * 
             * This function logs the user out.
             * 
             * WHAT IT DOES:
             * -------------
             * 1. Clears the session cookie
             * 2. Removes session from NextAuth's internal state
             * 3. Redirects to home (or callbackUrl if specified)
             * 
             * OPTIONS:
             * --------
             * signOut({ 
             *   callbackUrl: '/goodbye',  // Where to redirect after logout
             *   redirect: true            // Whether to redirect (default: true)
             * });
             * 
             * TO HANDLE LOGOUT WITHOUT REDIRECT:
             * ----------------------------------
             * const result = await signOut({ redirect: false });
             * // result contains the URL that would have been used
             * // Now you can show a "Goodbye" message, etc.
             */
            <button
              onClick={() => signOut()}
              className="flex h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 font-medium text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* ===================================================================
            NAVIGATION TO SERVER EXAMPLE
            =================================================================== */}
        <div className="w-full max-w-md space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 text-center">
            Compare Both Approaches
          </h3>
          
          <div className="grid gap-3">
            <Link
              href="/server-example"
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">Server Component Example</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">See getServerSession() in action</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ===================================================================
            FOOTER WITH HELPFUL LINKS
            =================================================================== */}
        <footer className="mt-4 text-xs text-zinc-400 dark:text-zinc-600 flex gap-4">
          <a href="https://next-auth.js.org/getting-started/client#usesession" className="hover:underline">
            useSession Docs
          </a>
          <span>&middot;</span>
          <a href="/api/auth/session" className="hover:underline">
            Raw Session API
          </a>
          <span>&middot;</span>
          <a href="/api/auth/providers" className="hover:underline">
            Providers API
          </a>
        </footer>
      </main>
    </div>
  );
}
