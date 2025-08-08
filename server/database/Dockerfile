FROM node:18.12.1-bullseye-slim

# Optional: Upgrade npm (if required by project)
RUN npm install -g npm@9.1.3

# Set working directory
WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE 3030

# Start the app
CMD ["node", "app.js"]
