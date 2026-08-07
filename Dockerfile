# Production Dockerfile for Node.js + React Fullstack App
FROM node:22-slim

# Install sqlite3 runtime library
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend bundle
RUN npm run build

# Expose port
EXPOSE 10000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=10000
ENV DATA_DIR=/var/data

# Start Express server
CMD ["node", "server/index.js"]
