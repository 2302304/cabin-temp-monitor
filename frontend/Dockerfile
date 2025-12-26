FROM node:20-alpine AS builder

WORKDIR /app

# Kopioi package files
COPY package*.json ./

# Asenna riippuvuudet
RUN npm ci

# Kopioi lähdekoodi
COPY . .

# Buildaa production versio
RUN npm run build

# Production image - käytetään nginx
FROM nginx:alpine

# Kopioi builded files
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx konfiguraatio SPA:lle
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
