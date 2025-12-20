# -------- Stage 1: Build React --------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# -------- Stage 2: Serve with nginx --------
FROM nginx:1.25-alpine

# Copy React build
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx template
COPY default.conf.template /etc/nginx/conf.d/default.conf.template

# Expose port Cloud Run expects
EXPOSE 8080

# Start nginx with dynamic port
CMD ["sh", "-c", "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
