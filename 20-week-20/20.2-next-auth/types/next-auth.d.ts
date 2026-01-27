/**
 * ============================================================================
 * 💡 TYPESCRIPT TYPE DEFINITIONS FOR NEXTAUTH
 * ============================================================================
 * 
 * FILE: /types/next-auth.d.ts
 * 
 * WHAT IS THIS FILE?
 * ------------------
 * This is a TypeScript "declaration file" (.d.ts) that EXTENDS the types
 * provided by NextAuth.
 * 
 * WHY DO WE NEED THIS?
 * --------------------
 * By default, NextAuth's Session type only includes:
 * - user.name
 * - user.email
 * - user.image
 * 
 * But often we need MORE data, like:
 * - user.id (very common!)
 * - user.role ("admin", "user")
 * - user.subscription ("free", "pro")
 * 
 * If we try to access session.user.id without this file, TypeScript says:
 * "Property 'id' does not exist on type..."
 * 
 * This file tells TypeScript: "Hey, session.user ALSO has an id property!"
 * 
 * WHAT IS MODULE AUGMENTATION?
 * ----------------------------
 * TypeScript allows you to ADD properties to existing type definitions.
 * 
 * When you write:
 *   declare module "next-auth" { ... }
 * 
 * You're saying: "Add these types to the 'next-auth' module"
 * 
 * This is different from REPLACING types - we're EXTENDING them.
 * The original types still exist, we're just adding more.
 * 
 * ============================================================================
 */

import { DefaultSession } from "next-auth";

/**
 * ============================================================================
 * 💡 EXTENDING THE SESSION TYPE
 * ============================================================================
 * 
 * We're telling TypeScript that the Session type has an extended user object.
 */
declare module "next-auth" {
  /**
   * The Session interface is what gets returned by:
   * - useSession() in client components
   * - getServerSession() in server components
   * 
   * We're extending session.user to include our custom 'id' property.
   * 
   * The syntax:
   *   { id: string } & DefaultSession["user"]
   * 
   * Means: "Take all properties from DefaultSession.user AND add 'id'"
   * 
   * DefaultSession["user"] gives us:
   * - name?: string | null
   * - email?: string | null
   * - image?: string | null
   * 
   * We're adding:
   * - id: string
   */
  interface Session {
    user: {
      id: string;
      // Add more custom properties here!
      // role?: string;
      // subscription?: string;
    } & DefaultSession["user"];
  }

  /**
   * The User interface represents the user object returned from providers.
   * 
   * When someone logs in, the provider returns a User object.
   * We need to tell TypeScript that our User has an 'id'.
   * 
   * This is used in:
   * - The authorize() callback in CredentialsProvider
   * - The jwt() callback when accessing the 'user' parameter
   */
  interface User {
    id: string;
    // Add more properties that come from your database
    // role?: string;
  }
}

/**
 * ============================================================================
 * 💡 EXTENDING THE JWT TYPE
 * ============================================================================
 * 
 * The JWT (JSON Web Token) is what gets stored in the cookie.
 * 
 * In the jwt() callback, we add properties to the token:
 *   token.id = user.id
 * 
 * TypeScript needs to know that 'token' can have an 'id' property.
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // Add more properties you store in the token
    // role?: string;
  }
}

/**
 * ============================================================================
 * 💡 COMMON PATTERNS FOR EXTENDED TYPES
 * ============================================================================
 * 
 * Here are some examples of what you might add:
 * 
 * USER ROLES:
 * -----------
 * declare module "next-auth" {
 *   interface Session {
 *     user: {
 *       id: string;
 *       role: "user" | "admin" | "superadmin";
 *     } & DefaultSession["user"];
 *   }
 * }
 * 
 * SUBSCRIPTION TIERS:
 * -------------------
 * declare module "next-auth" {
 *   interface Session {
 *     user: {
 *       id: string;
 *       subscription: "free" | "pro" | "enterprise";
 *       subscriptionEndsAt: string;
 *     } & DefaultSession["user"];
 *   }
 * }
 * 
 * ORGANIZATION / TEAM:
 * --------------------
 * declare module "next-auth" {
 *   interface Session {
 *     user: {
 *       id: string;
 *       organizationId: string;
 *       teamIds: string[];
 *     } & DefaultSession["user"];
 *   }
 * }
 * 
 * ============================================================================
 */
