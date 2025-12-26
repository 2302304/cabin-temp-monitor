FROM node:20-alpine AS builder

WORKDIR /app

# Asenna OpenSSL Prismaa varten
RUN apk add --no-cache openssl

# Kopioi package files
COPY package*.json ./
COPY prisma ./prisma/

# Asenna riippuvuudet
RUN npm ci

# Generoi Prisma Client
RUN npx prisma generate

# Kopioi lähdekoodi
COPY . .

# Buildaa TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Asenna OpenSSL Prismaa varten
RUN apk add --no-cache openssl

# Kopioi package files
COPY package*.json ./
COPY prisma ./prisma/

# Asenna vain production riippuvuudet
RUN npm ci --only=production

# Kopioi builded files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
