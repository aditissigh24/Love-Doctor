# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ================================
# Stage 2: Builder
# ================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy DATABASE_URL for prisma generate (doesn't connect, just generates client)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Accept NEXT_PUBLIC_* build args and set as ENV for Next.js build
ARG NEXT_PUBLIC_OTPLESS_APP_ID
ARG NEXT_PUBLIC_COMETCHAT_APP_ID
ARG NEXT_PUBLIC_COMETCHAT_REGION
ARG NEXT_PUBLIC_COMETCHAT_AUTH_KEY
ENV NEXT_PUBLIC_OTPLESS_APP_ID=$NEXT_PUBLIC_OTPLESS_APP_ID
ENV NEXT_PUBLIC_COMETCHAT_APP_ID=$NEXT_PUBLIC_COMETCHAT_APP_ID
ENV NEXT_PUBLIC_COMETCHAT_REGION=$NEXT_PUBLIC_COMETCHAT_REGION
ENV NEXT_PUBLIC_COMETCHAT_AUTH_KEY=$NEXT_PUBLIC_COMETCHAT_AUTH_KEY

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ================================
# Stage 3: Runner
# ================================
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output exactly as Next.js created it
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma schema and generated client (for runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# package.json (needed by Next server)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
