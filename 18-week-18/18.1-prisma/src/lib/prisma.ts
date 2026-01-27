/**
 * =============================================================================
 * PRISMA 7 CLIENT SETUP - The Database Connection Layer
 * =============================================================================
 * 
 * This file creates and exports a singleton instance of PrismaClient.
 * In Prisma 7, the client setup has changed significantly:
 * 
 * KEY CHANGES FROM PRISMA 6:
 * 1. Adapters are now REQUIRED - you must use a driver adapter (like PrismaPg)
 * 2. The client is generated to a custom path (defined in schema.prisma)
 * 3. Import path changed from "@prisma/client" to your custom output path
 * 4. Connection URL is passed via adapter, not directly to PrismaClient
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * =============================================================================
 * PRISMA 7 ADAPTER PATTERN
 * =============================================================================
 * 
 * Prisma 7 introduces a new "driver adapter" architecture:
 * 
 * OLD WAY (Prisma 6):
 *   const prisma = new PrismaClient()
 *   // URL was read from schema.prisma: url = env("DATABASE_URL")
 * 
 * NEW WAY (Prisma 7):
 *   const adapter = new PrismaPg({ connectionString })
 *   const prisma = new PrismaClient({ adapter })
 * 
 * WHY THE CHANGE?
 * - Better control over connection pooling
 * - Support for edge runtimes (Cloudflare Workers, Vercel Edge)
 * - Cleaner separation between ORM logic and database driver
 * - Easier to swap database drivers without changing ORM code
 */

// Get the connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set!");
}

/**
 * Create the PostgreSQL adapter
 * 
 * PrismaPg options:
 * - connectionString: The PostgreSQL connection URL
 * - You can also pass pool configuration for production:
 *   new PrismaPg({ connectionString, pool: { max: 20, idleTimeout: 30 } })
 */
const adapter = new PrismaPg({ connectionString });

/**
 * Create the PrismaClient instance with the adapter
 * 
 * PrismaClient options (commonly used):
 * - adapter: REQUIRED in Prisma 7 - the database driver adapter
 * - log: Array of log levels to enable ['query', 'info', 'warn', 'error']
 * - errorFormat: 'pretty' | 'colorless' | 'minimal'
 */
const prisma = new PrismaClient({
  adapter,
  // Uncomment to see all queries in console (great for learning!):
  // log: ['query', 'info', 'warn', 'error'],
});

/**
 * =============================================================================
 * EXPORTING THE CLIENT
 * =============================================================================
 * 
 * We export a single instance to be used throughout the application.
 * This is the "singleton pattern" - ensures we don't create multiple
 * database connections which would waste resources.
 * 
 * In your route handlers, you'll import this:
 *   import { prisma } from "./lib/prisma.js";
 *   const users = await prisma.user.findMany();
 */
export { prisma };
