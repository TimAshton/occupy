# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ .
COPY shared/ ./shared/

ARG VITE_SERVER_URL=""
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN npm run build

# ── Stage 2: serve with Caddy ─────────────────────────────────────────────────
FROM caddy:2-alpine AS runtime

COPY --from=builder /app/dist /usr/share/caddy
COPY client/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
EXPOSE 443
