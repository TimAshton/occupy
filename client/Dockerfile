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

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY client/nginx.conf /etc/nginx/conf.d/occupy.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
