# -------- Stage 1: Build React --------
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------- Stage 2: Serve statically with nginx --------
FROM nginx:1.25

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy React build output
COPY --from=builder /app/build /usr/share/nginx/html

# Create entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/conf.d/default.conf' >> /entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Cloud Run expects the server to listen on $PORT
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
