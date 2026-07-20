# Use Node 20 base image
FROM node:20-alpine

# Set working dir
WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install packages
RUN npm ci --only=production

# Copy source code and build configuration
COPY tsconfig.json ./
COPY src/ ./src/

# Install dev dependencies temporarily to compile TypeScript
RUN npm install --save-dev typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/multer
RUN npm run build

# Remove TypeScript compiler to optimize size
RUN npm prune --production

# Expose server port
EXPOSE 5000

# Start production server
CMD ["node", "dist/index.js"]
