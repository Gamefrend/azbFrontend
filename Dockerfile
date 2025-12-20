# ----------------------------
# 1. Build Stage
# ----------------------------
FROM node:20-alpine AS build

# Arbeitsverzeichnis setzen
WORKDIR /app

# Nur die package.json und package-lock.json kopieren (für Caching)
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install --legacy-peer-deps

# Quellcode kopieren
COPY . .

# React-App bauen (produziert den build-Ordner)
RUN npm run build

# ----------------------------
# 2. Production Stage
# ----------------------------
FROM nginx:alpine

# Nginx-Konfiguration anpassen, optional
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build-Dateien von Stage 1 kopieren
COPY --from=build /app/build /usr/share/nginx/html

# Port, auf dem Cloud Run zuhört
EXPOSE 8080

# Nginx im Vordergrund starten
CMD ["nginx", "-g", "daemon off;"]
