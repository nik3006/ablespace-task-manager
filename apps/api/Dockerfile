# =========================
# Build stage
# =========================
FROM node:22-alpine AS builder
WORKDIR /app
# Root workspace files
COPY package*.json ./
# API package
COPY apps/api/package*.json ./apps/api/
# Install dependencies
RUN npm ci
# Copy API source
COPY apps/api ./apps/api
# Generate Prisma client (run from apps/api so prisma.config.ts is found)
RUN cd apps/api && npx prisma generate
# Build NestJS API
RUN npm run build:api
# =========================
# Production stage
# =========================
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Root workspace files
COPY package*.json ./
# API package
COPY apps/api/package*.json ./apps/api/
# Install production dependencies
RUN npm ci --omit=dev
# Copy compiled API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
# Copy generated Prisma client
COPY --from=builder /app/apps/api/generated ./apps/api/generated
# Copy Prisma schema, migrations, and config
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
EXPOSE 4000
CMD ["node", "apps/api/dist/src/main.js"]