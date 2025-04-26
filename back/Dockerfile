FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Bundle app
COPY . .

# Expose port
EXPOSE 3000

# Data volume for SQLite
VOLUME ["/data"]

# Run your server
CMD [ "node", "index.js" ]
