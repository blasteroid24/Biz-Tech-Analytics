# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

# Stage 2 Runner
FROM node:22-alpine AS runner

WORKDIR /app
COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Copy source and config for drizzle-kit push
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "run", "start:docker"]
