# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port your app uses (adjust if needed)
EXPOSE 3000

# Start the Express server
CMD ["node", "app.js"]
