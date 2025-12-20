# -------- Stage 1: Build React --------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# -------- Stage 2: Serve with nginx --------
FROM nginx:1.25-alpine

# Copy React build output
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the port Cloud Run expects
EXPOSE 8080

# Start nginx with dynamic port from Cloud Run
CMD ["sh", "-c", "sed -i 's/listen 80;/listen ${PORT:-8080};/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
