# Production Dockerfile for Node.js + React Fullstack App
FROM node:20-alpine

# Install build tools required for native C++ modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for vite build
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
