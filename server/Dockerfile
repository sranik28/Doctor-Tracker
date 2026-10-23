# syntax=docker/dockerfile:1

# ---- Stage 1: all dependencies + compile TypeScript ----------------------------------------
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# ---- Stage 2: production dependencies only --------------------------------------------------
FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# bcrypt ships prebuilt binaries for glibc (this image), so no compiler is needed.
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 3: small runtime image -----------------------------------------------------------
FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    PORT=5000
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# The base image's unprivileged user; never run the API as root.
USER node
EXPOSE 5000

# Liveness for the platform (Render/Railway/Coolify/Compose). Needs no database.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# `node` directly (not `npm start`) so SIGTERM reaches the process and graceful shutdown runs.
CMD ["node", "dist/server.js"]
