# Production Dockerfile for Node.js + React Fullstack App
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend bundle
RUN npm run build

# Expose port
EXPOSE 10000

# Set production environment
ENV NODE_ENV=production
ENV PORT=10000
ENV DATA_DIR=/var/data

# Start Express server
CMD ["node", "server/index.js"]
