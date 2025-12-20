# Stage 1: Build React
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY default.conf.template /etc/nginx/conf.d/default.conf.template

# Verwende envsubst um $PORT in nginx config zu ersetzen
RUN apk add --no-cache bash gettext

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
