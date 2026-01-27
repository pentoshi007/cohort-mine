/**
 * ============================================================================
 * 💡 PROVIDERS WRAPPER - Making Auth Available Everywhere
 * ============================================================================
 * 
 * FILE: /app/providers.tsx
 * 
 * This file creates a CLIENT component that wraps your app with SessionProvider.
 * 
 * THE PROBLEM WE'RE SOLVING:
 * --------------------------
 * In Next.js App Router:
 * - layout.tsx is a SERVER Component by default
 * - SessionProvider is a CLIENT component (it uses React Context)
 * - Server Components CANNOT render Client Components that use Context
 * 
 * THE SOLUTION:
 * -------------
 * Create a separate Client Component (this file) that:
 * 1. Has "use client" directive
 * 2. Imports and uses SessionProvider
 * 3. Is imported into layout.tsx
 * 
 * This way, layout.tsx stays a Server Component but can still use
 * SessionProvider through composition.
 * 
 * THINK OF IT LIKE THIS:
 * ----------------------
 * 
 * layout.tsx (Server Component)
 *    └── Providers (Client Component) ← This file!
 *         └── SessionProvider
 *              └── {children} (Your pages)
 * 
 * ============================================================================
 */

"use client";
// ☝️ CRITICAL: This must be here! SessionProvider uses React Context,
// which only works in Client Components.

import { SessionProvider } from "next-auth/react";

/**
 * ============================================================================
 * 💡 WHAT IS SessionProvider?
 * ============================================================================
 * 
 * SessionProvider is a REACT CONTEXT PROVIDER from NextAuth.
 * 
 * WHAT IT DOES:
 * -------------
 * 1. Fetches the session from /api/auth/session on mount
 * 2. Stores the session in React Context
 * 3. Provides session data to all useSession() hooks
 * 4. Automatically keeps the session in sync
 * 5. Handles session refresh before expiry
 * 
 * WITHOUT SessionProvider:
 * - useSession() would not work
 * - Each component would have to fetch session individually
 * - No automatic session sync across components
 * 
 * WITH SessionProvider:
 * - useSession() works everywhere under this provider
 * - Session is fetched once, shared everywhere
 * - Automatic refresh before session expires
 * - All components update when session changes
 * 
 * OPTIONAL PROPS:
 * ---------------
 * <SessionProvider
 *   session={pageProps.session}  // Pre-fetched session (for SSR)
 *   basePath="/api/auth"         // Custom auth API path
 *   refetchInterval={5 * 60}     // Refetch every 5 minutes
 *   refetchOnWindowFocus={true}  // Refetch when tab becomes active
 * >
 * 
 * ============================================================================
 */

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  /**
   * We wrap {children} with SessionProvider so that:
   * - All pages and components under this have access to session
   * - useSession() hook works everywhere
   * - signIn() and signOut() functions work
   * 
   * The {children} prop contains your entire app (all pages).
   */
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

/**
 * ============================================================================
 * 💡 ADDING MORE PROVIDERS
 * ============================================================================
 * 
 * In a real app, you often have multiple providers. Stack them here!
 * 
 * Example with multiple providers:
 * 
 * export function Providers({ children }: ProvidersProps) {
 *   return (
 *     <SessionProvider>
 *       <ThemeProvider>
 *         <QueryClientProvider client={queryClient}>
 *           <ToastProvider>
 *             {children}
 *           </ToastProvider>
 *         </QueryClientProvider>
 *       </ThemeProvider>
 *     </SessionProvider>
 *   );
 * }
 * 
 * Common providers you might add:
 * - ThemeProvider (for dark mode)
 * - QueryClientProvider (React Query)
 * - Provider (Redux)
 * - ToastProvider (notifications)
 * 
 * ============================================================================
 */
