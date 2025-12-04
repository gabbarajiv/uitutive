# Multi-stage build for Uitutive - Angular Frontend + Node.js Backend

# Stage 1: Build both Frontend and Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all root files
COPY package.json package-lock.json ./
COPY angular.json tsconfig.json tsconfig.app.json tsconfig.spec.json ./

# Copy frontend source
COPY src ./src
COPY public ./public

# Copy backend source
COPY backend ./backend

# Install dependencies for both frontend and backend using install:all
RUN npm run install:all

# Build both frontend and backend using build:all
RUN npm run build:all

# Stage 2: Production Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy built backend from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/package-lock.json ./package-lock.json

# Copy built frontend (served by backend)
COPY --from=builder /app/dist/uitutive/browser ./public

# Install production dependencies only
RUN npm install --omit=dev

# Expose ports
# 3000 for backend API
# 4200 for frontend (if needed for dev/debugging)
EXPOSE 3000 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start backend server
CMD ["npm", "start"]
