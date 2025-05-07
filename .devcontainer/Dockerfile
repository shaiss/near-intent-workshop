FROM node:20-slim

# Install git and other dependencies
RUN apt-get update && apt-get -y install git procps

# Create app directory and set permissions
RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

# Switch to non-root user for security
USER node

# Copy package.json and package-lock.json
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY --chown=node:node . .

# Expose port for the app
EXPOSE 5173

# Default shell when container starts
CMD ["bash"] 