# ─────────────────────────────────────────────────────────
# Dockerfile — Multi-stage build for the Autoscaling Orchestrator
# ─────────────────────────────────────────────────────────
# Multi-stage builds produce SMALL, SECURE production images
# by separating the "build" step from the "run" step.
# ─────────────────────────────────────────────────────────

# ═══════════════════════════════════════════════════════
# STAGE 1: Builder — compile TypeScript → JavaScript
# ═══════════════════════════════════════════════════════
FROM node:22-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy ONLY package files first for better Docker layer caching.
# If package.json hasn't changed, Docker skips `npm ci` on rebuild
# (saves minutes on rebuilds!).
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies like TypeScript)
RUN npm ci

# Now copy the rest of the source code
COPY . .

# Compile TypeScript → JavaScript into the /app/dist folder
RUN npm run build


# ═══════════════════════════════════════════════════════
# STAGE 2: Production — lean, secure, minimal image
# ═══════════════════════════════════════════════════════
FROM node:22-alpine AS production

WORKDIR /app

# Copy only package.json (needed by Node.js for module resolution)
COPY package.json package-lock.json* ./

# Install ONLY production dependencies (no TypeScript, no tsx, etc.)
RUN npm ci --omit=dev

# Copy the compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose the port the app listens on
EXPOSE 3000

# Health check — Docker/ECS/ALB uses this to verify the container is alive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
