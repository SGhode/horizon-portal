# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Stage 1: Base Alpine Image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat wget

# ------------------------------------------------------------------------------
# Stage 2: Dependency Installation
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install exact production & dev dependencies needed for build
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 3: Application Build
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_MOCKING=disabled

# Build Next.js application with standalone output
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create secure non-root group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and public directory
COPY --from=builder /app/public ./public

# Set proper permissions for runtime cache directory
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone output from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check probe against Next.js route handler
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Production startup command
CMD ["node", "server.js"]
