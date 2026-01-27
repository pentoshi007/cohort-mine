/**
 * ============================================================================
 * 💡 ROOT LAYOUT - The Foundation of Your App
 * ============================================================================
 * 
 * FILE: /app/layout.tsx
 * 
 * This is the ROOT LAYOUT - it wraps EVERY page in your application.
 * 
 * WHAT IS A LAYOUT?
 * -----------------
 * A layout is a component that:
 * 1. Wraps multiple pages
 * 2. Persists across navigation (doesn't re-render)
 * 3. Can contain shared UI (navbar, sidebar, footer)
 * 
 * The ROOT layout (this file) is special:
 * - It's REQUIRED in Next.js App Router
 * - It MUST include <html> and <body> tags
 * - It wraps your ENTIRE application
 * - It's where you put global styles, fonts, providers
 * 
 * LAYOUT HIERARCHY:
 * -----------------
 * /app/layout.tsx              ← Root layout (this file, wraps everything)
 *   └── /app/dashboard/layout.tsx  ← Nested layout (wraps /dashboard/*)
 *         └── /app/dashboard/page.tsx
 * 
 * WHY IS THIS A SERVER COMPONENT?
 * --------------------------------
 * - layout.tsx is a Server Component by default
 * - This is GOOD - it means the layout is rendered on the server
 * - Better for SEO, faster initial load
 * - But we need auth context... that's where Providers comes in!
 * 
 * ============================================================================
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * We import our Providers wrapper (which is a Client Component).
 * This lets the Server Component layout use SessionProvider indirectly.
 */
import { Providers } from "./providers";

/**
 * ============================================================================
 * 💡 CUSTOM FONTS WITH next/font
 * ============================================================================
 * 
 * Next.js has built-in font optimization with the next/font module.
 * 
 * BENEFITS:
 * - Fonts are downloaded at build time (not from Google's servers at runtime)
 * - No layout shift when fonts load
 * - Privacy improvement (no calls to Google's servers from user's browser)
 * 
 * HOW IT WORKS:
 * 1. Import the font function
 * 2. Call it with configuration
 * 3. Use the .variable property as a CSS class
 * 4. Reference via CSS custom property (--font-geist-sans)
 */
const geistSans = Geist({
  variable: "--font-geist-sans",  // CSS custom property name
  subsets: ["latin"],              // Only load Latin characters
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * ============================================================================
 * 💡 METADATA - SEO and Browser Configuration
 * ============================================================================
 * 
 * The metadata export configures SEO and browser behavior.
 * 
 * This gets converted to HTML <head> elements like:
 * <title>NextAuth Learning Demo</title>
 * <meta name="description" content="..." />
 * 
 * You can add much more:
 * - Open Graph tags for social sharing
 * - Twitter card configuration
 * - Favicons
 * - Theme color
 * - etc.
 * 
 * Each page can also export its own metadata to override these.
 */
export const metadata: Metadata = {
  title: "NextAuth Learning Demo",
  description: "Learn client-side and server-side authentication with NextAuth.js and Next.js App Router",
};

/**
 * ============================================================================
 * 💡 THE LAYOUT COMPONENT
 * ============================================================================
 * 
 * This component receives {children} which is the current page content.
 * 
 * When you navigate between pages:
 * - This layout STAYS (doesn't re-render)
 * - Only {children} changes
 * 
 * This is perfect for:
 * - Navigation bars that persist
 * - Sidebars
 * - Context providers (like SessionProvider!)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/**
       * BODY ELEMENT
       * 
       * We add font CSS variables as classes here.
       * Tailwind's 'antialiased' class improves font rendering.
       */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/**
         * =================================================================
         * 💡 WRAPPING WITH PROVIDERS
         * =================================================================
         * 
         * We wrap {children} with our Providers component.
         * 
         * This makes SessionProvider available to ALL pages.
         * Now useSession() will work anywhere in the app!
         * 
         * WHY NOT PUT SessionProvider DIRECTLY HERE?
         * ------------------------------------------
         * Because this layout is a Server Component, and SessionProvider
         * is a Client Component. We can't import Client Components that
         * use Context directly into Server Components.
         * 
         * By creating the Providers wrapper (which has "use client"),
         * we solve this composition problem.
         * 
         * THE FLOW:
         * RootLayout (Server)
         *   → Providers (Client, has SessionProvider)
         *     → {children} (Your pages, can use useSession!)
         */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
