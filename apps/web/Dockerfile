# =========================
# Build stage
# =========================

FROM node:22-alpine AS builder

WORKDIR /app

# Root workspace files
COPY package*.json ./

# Workspace package files
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy only the web application
COPY apps/web ./apps/web

# Build Next.js
RUN npm run build:web


# =========================
# Production stage
# =========================

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Root workspace files
COPY package*.json ./

# Workspace package files
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/

# Install production dependencies
RUN npm ci --omit=dev

# Copy the built Next.js application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=web"]