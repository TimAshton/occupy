# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# better-sqlite3 needs a native build toolchain
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Copy compiled native modules + prod deps from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source (server + shared)
COPY src ./src
COPY package.json ./
COPY ../shared ./shared

# SQLite data lives on a mounted volume at /data
ENV DB_PATH=/data/occupy.db
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "src/index.js"]
