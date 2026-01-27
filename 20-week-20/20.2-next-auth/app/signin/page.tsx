/**
 * ============================================================================
 * 💡 CUSTOM SIGN-IN PAGE
 * ============================================================================
 * 
 * FILE: /app/signin/page.tsx
 * 
 * This is a CUSTOM sign-in page that replaces NextAuth's default sign-in page.
 * 
 * WHY CREATE A CUSTOM SIGN-IN PAGE?
 * ---------------------------------
 * NextAuth provides a default sign-in page at /api/auth/signin.
 * It works, but:
 * - It's unstyled and generic
 * - It doesn't match your app's design
 * - You have limited control over UX
 * 
 * With a custom page:
 * ✅ Full control over design
 * ✅ Add custom branding
 * ✅ Custom error handling
 * ✅ Add additional features (forgot password, social proofs, etc.)
 * 
 * HOW NEXTAUTH KNOWS TO USE THIS PAGE:
 * ------------------------------------
 * In /app/lib/auth.ts, we set:
 *   pages: {
 *     signIn: "/signin"
 *   }
 * 
 * This tells NextAuth: "When someone needs to sign in, send them to /signin"
 * 
 * ============================================================================
 */

"use client";
// ☝️ "use client" because we use:
// - onClick handlers
// - Form onSubmit handlers
// - signIn() function from next-auth/react

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  /**
   * ==========================================================================
   * 💡 HANDLING ERRORS FROM NEXTAUTH
   * ==========================================================================
   * 
   * When authentication fails, NextAuth redirects back to the sign-in page
   * with an "error" query parameter.
   * 
   * Common error codes:
   * - OAuthAccountNotLinked: User tried to sign in with different provider
   * - CredentialsSignin: Invalid email/password
   * - Default: Generic error
   * 
   * We can read this with useSearchParams() and show appropriate messages.
   */
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  /**
   * ==========================================================================
   * 💡 FORM STATE MANAGEMENT
   * ==========================================================================
   * 
   * For the credentials form, we track:
   * - isLoading: Show spinner while submitting
   * - errorMessage: Display any errors
   */
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * ==========================================================================
   * 💡 GOOGLE OAUTH SIGN-IN
   * ==========================================================================
   * 
   * This is the simplest way to authenticate users!
   * 
   * How it works:
   * 1. User clicks button
   * 2. signIn('google') redirects to Google
   * 3. User logs in on Google's page
   * 4. Google redirects back to /api/auth/callback/google
   * 5. NextAuth creates a session
   * 6. User is redirected to callbackUrl
   * 
   * The callbackUrl param tells Google where to send the user after success.
   */
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  /**
   * ==========================================================================
   * 💡 CREDENTIALS (EMAIL/PASSWORD) SIGN-IN
   * ==========================================================================
   * 
   * This is more complex because we handle the form ourselves.
   * 
   * How it works:
   * 1. User fills in email and password
   * 2. Form submits, we call signIn('credentials', {...})
   * 3. NextAuth calls the authorize() function in our config
   * 4. If valid, session is created and user is redirected
   * 5. If invalid, error is returned
   * 
   * IMPORTANT: We use redirect: false to handle errors ourselves!
   * Without it, NextAuth would redirect even on error.
   */
  const handleCredentialsSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Get form data using FormData API
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      /**
       * signIn() with redirect: false returns a result object instead of
       * redirecting. This lets us handle errors gracefully.
       * 
       * Result object:
       * {
       *   error: string | null,  // Error message if login failed
       *   ok: boolean,           // True if login succeeded
       *   status: number,        // HTTP status code
       *   url: string | null     // Redirect URL if successful
       * }
       */
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't auto-redirect, let us handle it
      });

      if (result?.error) {
        // Login failed - show error to user
        setErrorMessage("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        // Login successful - redirect manually
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {/* ================================================================
            HEADER
            ================================================================ */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Welcome Back
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* ================================================================
            ERROR DISPLAY
            Shown when NextAuth redirects back with an error
            ================================================================ */}
        {(error || errorMessage) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-800 dark:text-red-200">
              {errorMessage || "Sign in failed. Please try again."}
            </p>
          </div>
        )}

        {/* ================================================================
            GOOGLE SIGN IN BUTTON
            OAuth is the easiest for users - no password to remember!
            ================================================================ */}
        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
        >
          {/* Google Icon */}
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* ================================================================
            DIVIDER
            ================================================================ */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* ================================================================
            CREDENTIALS FORM
            Email/password login for users who prefer it
            ================================================================ */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          {/* Email Input */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"  // ← Required for FormData to work!
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>

          {/* Password Input */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"  // ← Required for FormData to work!
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in with Email"
            )}
          </button>
        </form>

        {/* ================================================================
            INFO BOX
            Demo credentials notice
            ================================================================ */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <h3 className="font-medium text-blue-900 dark:text-blue-100">
            💡 Demo Mode
          </h3>
          <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
            This is a learning demo. You can sign in with any email and password.
            In production, you would validate against a real database.
          </p>
        </div>

        {/* ================================================================
            BACK LINK
            ================================================================ */}
        <div className="text-center">
          <a 
            href="/" 
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
