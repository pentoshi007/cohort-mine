/**
 * ============================================================================
 * 💡 NEXTAUTH API ROUTE HANDLER
 * ============================================================================
 * 
 * FILE LOCATION: /app/api/auth/[...nextauth]/route.ts
 * 
 * This file creates the BACKEND for NextAuth. It handles all the HTTP
 * requests related to authentication.
 * 
 * UNDERSTANDING THE FOLDER NAME: [...nextauth]
 * --------------------------------------------
 * The [...nextauth] is called a "catch-all" route segment in Next.js.
 * 
 * - The [...] means "catch everything after this point"
 * - So this ONE file handles ALL these URLs:
 *   • /api/auth/signin      → Shows sign-in options
 *   • /api/auth/signout     → Handles sign-out
 *   • /api/auth/session     → Returns current session
 *   • /api/auth/csrf        → Gets CSRF token for forms
 *   • /api/auth/providers   → Lists available providers
 *   • /api/auth/callback/google  → Handles Google OAuth callback
 *   • /api/auth/callback/github  → Handles GitHub OAuth callback
 *   • ...and more!
 * 
 * WHY DO WE EXPORT GET AND POST?
 * ------------------------------
 * NextAuth needs to handle both HTTP methods:
 * 
 * GET requests are used for:
 * - Fetching the current session (/api/auth/session)
 * - Getting CSRF token (/api/auth/csrf)
 * - Getting list of providers (/api/auth/providers)
 * - Displaying default sign-in page (/api/auth/signin)
 * 
 * POST requests are used for:
 * - Submitting sign-in forms
 * - Sign-out requests
 * - OAuth callback handling
 * 
 * ============================================================================
 */

import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

/**
 * Create the NextAuth handler using our centralized config.
 * 
 * We import authOptions from a separate file so we can reuse
 * the same config in Server Components with getServerSession().
 */
const handler = NextAuth(authOptions);

/**
 * Export the same handler for both GET and POST.
 * 
 * In Next.js App Router, you export named functions matching HTTP methods.
 * This tells Next.js to route GET requests to handler, POST requests to handler.
 */
export { handler as GET, handler as POST };
