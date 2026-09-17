# ==============================================================================
# JobBoard Backend - Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build & Compile TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for build
COPY package*.json ./
RUN npm ci --no-audit

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# Remove development dependencies to keep final layer lean
RUN npm prune --production

# ==============================================================================
# Stage 2: Minimal Production Runtime
# ==============================================================================
FROM node:22-alpine AS runner

# Install dumb-init for proper PID 1 signal forwarding (SIGTERM / SIGINT)
RUN apk add --no-cache dumb-init curl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

# Create unprivileged non-root user and group
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Copy runtime artifacts from builder stage with ownership
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

# Run container as unprivileged non-root user
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/live || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]
