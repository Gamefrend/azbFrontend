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

# Cloud Run expects the server to listen on $PORT
# Nginx listens on 80 by default, so we map env var PORT to 80
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
