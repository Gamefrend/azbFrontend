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

# Cloud Run sets PORT environment variable dynamically
ENV PORT=8080
EXPOSE 8080

# Update Nginx config to listen on $PORT
RUN sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
