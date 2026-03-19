FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/utils/package*.json ./packages/utils/
RUN npm ci --workspace=apps/backend
COPY packages/shared-types ./packages/shared-types
COPY packages/utils ./packages/utils
COPY apps/backend ./apps/backend
RUN cd apps/backend && npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
