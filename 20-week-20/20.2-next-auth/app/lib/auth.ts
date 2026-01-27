/**
 * ============================================================================
 * 💡 NEXTAUTH CONFIGURATION FILE
 * ============================================================================
 * 
 * This is the CENTRAL configuration for all authentication in your app.
 * Think of it as the "brain" of your auth system.
 * 
 * WHY A SEPARATE FILE?
 * --------------------
 * We keep this config in a separate file (not directly in route.ts) because:
 * 1. We need to REUSE it in multiple places:
 *    - In the API route (/api/auth/[...nextauth]/route.ts)
 *    - In Server Components (using getServerSession)
 * 2. It keeps our code DRY (Don't Repeat Yourself)
 * 3. Makes configuration changes easier - one place to update
 * 
 * WHAT THIS FILE EXPORTS:
 * -----------------------
 * - authOptions: The complete NextAuth configuration object
 * 
 * ============================================================================
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

/**
 * ============================================================================
 * THE MAIN CONFIG OBJECT
 * ============================================================================
 * 
 * This object tells NextAuth:
 * - HOW users can log in (providers)
 * - WHERE to redirect them (pages)
 * - WHAT data to store in the session (callbacks)
 * - HOW to manage sessions (session strategy)
 */
export const authOptions: NextAuthOptions = {
  /**
   * --------------------------------------------------------------------------
   * PROVIDERS ARRAY
   * --------------------------------------------------------------------------
   * 
   * Providers are different METHODS users can use to authenticate.
   * 
   * Common types:
   * 1. OAuth Providers (Google, GitHub, Facebook, etc.)
   *    - User clicks "Sign in with Google"
   *    - Gets redirected to Google
   *    - Google confirms identity and sends user back
   *    - No password management needed on your side!
   * 
   * 2. Credentials Provider (Email/Password)
   *    - Custom username/password login
   *    - YOU manage the user database
   *    - YOU validate passwords (use bcrypt!)
   * 
   * 3. Email Provider (Magic Links)
   *    - User enters email
   *    - Gets a login link in their inbox
   *    - Clicking the link logs them in
   */
  providers: [
    /**
     * ------------------------------------------------------------------------
     * GOOGLE OAUTH PROVIDER
     * ------------------------------------------------------------------------
     * 
     * This lets users sign in with their Google account.
     * 
     * HOW IT WORKS:
     * 1. User clicks "Sign in with Google"
     * 2. They're redirected to Google's login page
     * 3. They enter their Google credentials (on Google's site, not yours!)
     * 4. Google authenticates them and sends them back to your app
     * 5. Your app receives their profile info (name, email, photo)
     * 
     * SETUP STEPS:
     * 1. Go to Google Cloud Console (console.cloud.google.com)
     * 2. Create a new project (or use existing)
     * 3. Go to "APIs & Services" > "Credentials"
     * 4. Create "OAuth 2.0 Client ID"
     * 5. Set Authorized redirect URI to:
     *    http://localhost:3000/api/auth/callback/google
     *    (In production, use your real domain)
     * 6. Copy Client ID and Secret to your .env file
     * 
     * WHY USE OAUTH?
     * - Users don't need to create another password
     * - You don't need to store/hash passwords
     * - More secure (Google handles password security)
     * - Users trust familiar login buttons
     */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    /**
     * ------------------------------------------------------------------------
     * CREDENTIALS PROVIDER (Email/Password)
     * ------------------------------------------------------------------------
     * 
     * This lets you create a traditional email/password login.
     * 
     * ⚠️ IMPORTANT: Unlike OAuth, YOU are responsible for:
     * - Storing user accounts in YOUR database
     * - Hashing passwords (NEVER store plain text!)
     * - Validating credentials
     * - Handling password resets
     * 
     * WHEN TO USE THIS:
     * - You need custom login logic
     * - You're migrating from an existing auth system
     * - You want full control over the user database
     * 
     * HOW IT WORKS:
     * 1. User enters email and password on YOUR form
     * 2. Form submits to NextAuth
     * 3. NextAuth calls YOUR authorize() function
     * 4. You check the credentials against your database
     * 5. Return user object if valid, null if invalid
     */
    CredentialsProvider({
      /**
       * The 'name' appears on the default NextAuth sign-in page.
       * If you have a custom sign-in page, this is less important.
       */
      name: "Email",

      /**
       * 'credentials' defines the form fields.
       * These are used by the default NextAuth sign-in page.
       * If you use a custom sign-in page, you build your own form.
       */
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },

      /**
       * -----------------------------------------------------------------------
       * THE AUTHORIZE FUNCTION - This is where the magic happens!
       * -----------------------------------------------------------------------
       * 
       * This function runs when someone submits the login form.
       * 
       * @param credentials - What the user typed (email, password)
       * @returns User object if login succeeds, null if it fails
       * 
       * WHAT YOU SHOULD DO IN A REAL APP:
       * 
       * 1. Look up the user in your database by email:
       *    const user = await db.user.findByEmail(credentials.email)
       * 
       * 2. Check if user exists:
       *    if (!user) return null;
       * 
       * 3. Verify the password using bcrypt:
       *    const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)
       * 
       * 4. Return the user if valid, null if not:
       *    return isValid ? { id: user.id, email: user.email, name: user.name } : null;
       */
      async authorize(credentials) {
        // First, check if credentials were even provided
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ No credentials provided");
          return null;
        }

        /**
         * ⚠️ DEMO MODE - Replace this in production!
         * 
         * This is a MOCK login that accepts any email/password.
         * In a real app, you would:
         * 
         * ```typescript
         * import bcrypt from 'bcrypt';
         * import { db } from '@/lib/db';
         * 
         * // 1. Find user in database
         * const user = await db.user.findUnique({
         *   where: { email: credentials.email }
         * });
         * 
         * // 2. User not found?
         * if (!user || !user.hashedPassword) {
         *   return null;
         * }
         * 
         * // 3. Verify password
         * const passwordMatch = await bcrypt.compare(
         *   credentials.password,
         *   user.hashedPassword
         * );
         * 
         * // 4. Wrong password?
         * if (!passwordMatch) {
         *   return null;
         * }
         * 
         * // 5. Success! Return user object
         * return {
         *   id: user.id,
         *   email: user.email,
         *   name: user.name,
         * };
         * ```
         */
        console.log("✅ Demo login for:", credentials.email);
        
        return {
          id: "demo-user-1",
          email: credentials.email,
          name: "Demo User",
        };
      },
    }),
  ],

  /**
   * --------------------------------------------------------------------------
   * CUSTOM PAGES
   * --------------------------------------------------------------------------
   * 
   * By default, NextAuth provides its own sign-in, sign-out, error pages.
   * They work, but they're pretty basic and unstyled.
   * 
   * To use YOUR OWN custom pages, specify the routes here.
   * Make sure the pages actually exist in your /app directory!
   */
  pages: {
    signIn: "/signin",       // Custom sign-in page (we created this!)
    // signOut: "/signout",  // Custom sign-out confirmation page
    // error: "/auth/error", // Custom error page
    // newUser: "/welcome",  // Redirect new users here after first sign-up
  },

  /**
   * --------------------------------------------------------------------------
   * SESSION STRATEGY
   * --------------------------------------------------------------------------
   * 
   * HOW should NextAuth track who's logged in?
   * 
   * Option 1: "jwt" (JSON Web Token) - The DEFAULT
   * - Session data is encrypted and stored in a cookie
   * - No database needed for sessions
   * - Stateless - great for serverless
   * - Can't force log out remotely (token is valid until it expires)
   * 
   * Option 2: "database"
   * - Session data is stored in your database
   * - Requires a database adapter (Prisma, MongoDB, etc.)
   * - Can invalidate sessions immediately
   * - More control, but more setup
   * 
   * For most apps, "jwt" is fine and simpler!
   */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  /**
   * --------------------------------------------------------------------------
   * SECRET KEY
   * --------------------------------------------------------------------------
   * 
   * This secret is used to:
   * - Encrypt/decrypt the JWT
   * - Sign cookies
   * 
   * NEVER commit this to git! Always use environment variables.
   * Generate with: openssl rand -base64 32
   */
  secret: process.env.NEXTAUTH_SECRET,

  /**
   * --------------------------------------------------------------------------
   * CALLBACKS - Customize the Auth Flow
   * --------------------------------------------------------------------------
   * 
   * Callbacks are functions that run at specific points in auth flow.
   * Use them to add custom data, perform checks, or modify behavior.
   * 
   * Common callbacks:
   * - jwt: Runs when JWT is created/updated (add custom data to token)
   * - session: Runs when session is accessed (add custom data to session)
   * - signIn: Runs on sign in attempt (can block certain users)
   * - redirect: Runs on redirects (can customize redirect URLs)
   */
  callbacks: {
    /**
     * JWT CALLBACK
     * 
     * This runs whenever a JWT is created or updated.
     * The 'user' object is only available on initial sign-in.
     * 
     * Use this to ADD data to the token that you want available later.
     * 
     * @param token - The current JWT (empty on first sign-in)
     * @param user - The user object (only on initial sign-in)
     * @returns The modified token
     */
    async jwt({ token, user }) {
      // On first sign-in, add the user ID to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // You could also add: token.role = user.role
      }
      return token;
    },

    /**
     * SESSION CALLBACK
     * 
     * This runs whenever the session is accessed.
     * Use this to add data FROM the token TO the session.
     * 
     * The session is what you access in your components with:
     * - useSession() (client-side)
     * - getServerSession() (server-side)
     * 
     * @param session - The session object
     * @param token - The JWT token (contains data you added above)
     * @returns The modified session
     */
    async session({ session, token }) {
      // Add the user ID from token to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};
